import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ProblemPanel } from './components/ProblemPanel';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import { JudgePanel } from './components/JudgePanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import { OcrModal } from './components/OcrModal';
import { TestcaseGeneratorModal } from './components/TestcaseGeneratorModal';
import { DiffModal } from './components/DiffModal';
import { HelpModal } from './components/HelpModal';
import { AiCodeFixModal } from './components/AiCodeFixModal';

import type { LanguageConfig, Testcase, TestcaseResult, JudgeSummaryStats, Verdict, JudgeEngineConfig } from './types/judge';
import type { ProblemStatement } from './types/problem';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './constants/languages';
import { DEFAULT_PROBLEM } from './constants/defaultProblem';
import { executeCode } from './services/executorService';
import {
  generateTestcasesWithGemini,
  generateReferenceSolution,
  diagnoseAndFixCode,
  type CodeDiagnosticError,
  type CodeFixResult,
} from './services/geminiService';
import { exportTestcasesToZip } from './utils/exportZip';
import { TRANSLATIONS, type LanguageCode } from './constants/translations';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  getStoredCode,
  setStoredCode,
  getStoredProblem,
  setStoredProblem,
  getStoredSelectedLang,
  setStoredSelectedLang,
  getStoredJudgeConfig,
  setStoredJudgeConfig,
  getStoredTheme,
  setStoredTheme,
  getStoredLanguage,
  setStoredLanguage,
  getStoredIncludeComments,
  setStoredIncludeComments,
} from './utils/storage';

export const App: React.FC = () => {
  // State: API Key & Model
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());
  const [model, setModel] = useState<string>(() => getStoredModel());
  const [judgeConfig, setJudgeConfig] = useState<JudgeEngineConfig>(() => getStoredJudgeConfig());
  const [includeComments, setIncludeComments] = useState<boolean>(() => getStoredIncludeComments());

  // State: App Theme (Dark/Light) & Language (EN/VI)
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>(() => getStoredTheme());
  const [languageCode, setLanguageCode] = useState<LanguageCode>(() => getStoredLanguage());
  const t = TRANSLATIONS[languageCode];

  // Apply dark mode class to html document
  useEffect(() => {
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setStoredTheme(appTheme);
  }, [appTheme]);

  const handleToggleTheme = () => {
    setAppTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleLanguage = () => {
    const nextLang: LanguageCode = languageCode === 'en' ? 'vi' : 'en';
    setLanguageCode(nextLang);
    setStoredLanguage(nextLang);
  };

  // State: Problem Statement
  const [problem, setProblem] = useState<ProblemStatement>(() => {
    const stored = getStoredProblem();
    return stored || DEFAULT_PROBLEM;
  });

  // State: Language & Code
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageConfig>(() => {
    const storedId = getStoredSelectedLang();
    const found = SUPPORTED_LANGUAGES.find((l) => l.id === storedId);
    return found || DEFAULT_LANGUAGE;
  });

  const [code, setCode] = useState<string>(() => {
    const stored = getStoredCode(selectedLanguage.id);
    return stored || selectedLanguage.boilerplate;
  });

  // State: Testcases & Judge
  const [testcases, setTestcases] = useState<Testcase[]>(() => problem.sampleCases || []);
  const [results, setResults] = useState<Record<string, TestcaseResult>>({});
  const [summary, setSummary] = useState<JudgeSummaryStats | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number>(0);
  const stopJudgeRef = useRef<boolean>(false);

  // State: Live Background AI Testcase Generation
  const [isAiGeneratingTests, setIsAiGeneratingTests] = useState<boolean>(false);
  const [aiGenStatus, setAiGenStatus] = useState<string>('');
  const [aiGenPercent, setAiGenPercent] = useState<number>(0);
  const [aiGenTotalCount, setAiGenTotalCount] = useState<number>(10);
  const aiGenAbortControllerRef = useRef<AbortController | null>(null);

  // State: AI Reference Solution Generator
  const [isGeneratingAiSolution, setIsGeneratingAiSolution] = useState<boolean>(false);
  const aiSolutionAbortControllerRef = useRef<AbortController | null>(null);

  // State: AI Code Fix & Debug Agent
  const [isAiFixModalOpen, setIsAiFixModalOpen] = useState(false);
  const [isAiFixLoading, setIsAiFixLoading] = useState(false);
  const [aiFixResult, setAiFixResult] = useState<CodeFixResult | null>(null);
  const [diagnosticErrors, setDiagnosticErrors] = useState<CodeDiagnosticError[]>([]);

  // State: Active Tab on Mobile
  const [activeTab, setActiveTab] = useState<'problem' | 'code' | 'judge'>('code');

  // State: Modals
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedResultForDiff, setSelectedResultForDiff] = useState<TestcaseResult | null>(null);

  // Save Code to LocalStorage on change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setStoredCode(selectedLanguage.id, newCode);
  };

  // Change Language
  const handleLanguageChange = (newLang: LanguageConfig) => {
    setSelectedLanguage(newLang);
    setStoredSelectedLang(newLang.id);
    const existing = getStoredCode(newLang.id);
    setCode(existing || newLang.boilerplate);
    setDiagnosticErrors([]);
  };

  // Save Problem
  const handleSaveProblem = (newProblem: ProblemStatement) => {
    setProblem(newProblem);
    setStoredProblem(newProblem);
  };

  // When OCR extracts a problem
  const handleProblemExtracted = (extracted: ProblemStatement) => {
    setProblem(extracted);
    setStoredProblem(extracted);
    if (extracted.sampleCases && extracted.sampleCases.length > 0) {
      setTestcases(extracted.sampleCases);
    }
    setResults({});
    setSummary(null);
  };

  // Start AI Testcase Generation (Direct fast generation in background)
  const handleStartGenerateTests = async (
    count: number,
    mode: 'replace' | 'append',
    customInstructions?: string
  ) => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if (aiGenAbortControllerRef.current) {
      aiGenAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    aiGenAbortControllerRef.current = abortController;

    setIsAiGeneratingTests(true);
    setAiGenTotalCount(count);
    setAiGenPercent(5);
    setAiGenStatus(languageCode === 'vi' ? 'Đang phân tích bài toán...' : 'Analyzing problem statement...');
    setIsAiGeneratorOpen(false);

    try {
      const generated = await generateTestcasesWithGemini(
        apiKey,
        problem,
        count,
        customInstructions,
        model,
        (status: string, percent: number) => {
          setAiGenStatus(status);
          setAiGenPercent(percent);
        },
        abortController.signal
      );

      if (mode === 'replace') {
        setTestcases(generated);
      } else {
        setTestcases((prev) => [...prev, ...generated]);
      }
      setResults({});
      setSummary(null);
    } catch (err: any) {
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      alert(`Lỗi tạo test case AI: ${err.message}`);
    } finally {
      setIsAiGeneratingTests(false);
      setAiGenPercent(0);
      setAiGenStatus('');
      aiGenAbortControllerRef.current = null;
    }
  };

  // Cancel AI Test Generation
  const handleCancelAiGen = () => {
    if (aiGenAbortControllerRef.current) {
      aiGenAbortControllerRef.current.abort();
      aiGenAbortControllerRef.current = null;
    }
    setIsAiGeneratingTests(false);
    setAiGenPercent(0);
    setAiGenStatus('');
  };

  // AI Reference Solution Generator
  const handleGenerateAiSolution = async () => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if (aiSolutionAbortControllerRef.current) {
      aiSolutionAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    aiSolutionAbortControllerRef.current = abortController;

    setIsGeneratingAiSolution(true);

    try {
      const solutionCode = await generateReferenceSolution(
        apiKey,
        problem,
        selectedLanguage.name,
        model,
        includeComments,
        undefined,
        abortController.signal
      );

      setCode(solutionCode);
      setStoredCode(selectedLanguage.id, solutionCode);
      setDiagnosticErrors([]);
      setActiveTab('code');
    } catch (err: any) {
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      alert(`Error generating reference solution: ${err.message}`);
    } finally {
      setIsGeneratingAiSolution(false);
    }
  };

  // Cancel AI Solution Generation
  const handleCancelAiSolution = () => {
    if (aiSolutionAbortControllerRef.current) {
      aiSolutionAbortControllerRef.current.abort();
      aiSolutionAbortControllerRef.current = null;
    }
    setIsGeneratingAiSolution(false);
  };

  // AI Code Fix & Debug Agent Trigger
  const handleTriggerAiFix = async () => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsAiFixModalOpen(true);
    setIsAiFixLoading(true);
    setAiFixResult(null);

    try {
      // Find compiler error or failing testcase
      let compilerError = '';
      let failedTestInfo: { input: string; expectedOutput: string; actualOutput: string } | undefined;

      for (const tc of testcases) {
        const res = results[tc.id];
        if (res && res.verdict === 'CE') {
          compilerError = res.compileError || res.errorMessage || '';
          break;
        } else if (res && (res.verdict === 'WA' || res.verdict === 'RTE')) {
          failedTestInfo = {
            input: res.input,
            expectedOutput: res.expectedOutput,
            actualOutput: res.actualOutput || res.errorMessage || '',
          };
          break;
        }
      }

      const fixRes = await diagnoseAndFixCode(
        apiKey,
        code,
        selectedLanguage.name,
        problem,
        compilerError || undefined,
        failedTestInfo,
        model,
        includeComments,
        languageCode
      );

      setAiFixResult(fixRes);
      if (fixRes.errors.length > 0) {
        setDiagnosticErrors(fixRes.errors);
      }
    } catch (err: any) {
      alert(`Lỗi AI phân tích & sửa code: ${err.message}`);
    } finally {
      setIsAiFixLoading(false);
    }
  };

  // Apply AI Fixed Code directly into editor
  const handleApplyFixedCode = (fixedCode: string) => {
    setCode(fixedCode);
    setStoredCode(selectedLanguage.id, fixedCode);
    setDiagnosticErrors([]);
  };

  // Add a single custom testcase
  const handleAddTestcase = (tc: Testcase) => {
    setTestcases((prev) => [...prev, tc]);
  };

  // Remove a testcase
  const handleRemoveTestcase = (id: string) => {
    setTestcases((prev) => prev.filter((t) => t.id !== id));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Stop running tests
  const handleStop = () => {
    stopJudgeRef.current = true;
    setIsRunning(false);
  };

  // Run all testcases sequentially
  const handleRunAll = async () => {
    if (testcases.length === 0) return;

    setIsRunning(true);
    stopJudgeRef.current = false;
    const newResults: Record<string, TestcaseResult> = {};
    setResults({});
    setSummary(null);

    let maxTime = 0;
    let peakMem = 0;
    let passedCount = 0;
    let finalVerdict: Verdict = 'AC';

    for (let i = 0; i < testcases.length; i++) {
      if (stopJudgeRef.current) break;

      setCurrentRunningIndex(i);
      const tc = testcases[i];

      // Mark current test as RUNNING
      setResults((prev) => ({
        ...prev,
        [tc.id]: {
          testcaseId: tc.id,
          testcaseName: tc.name,
          verdict: 'RUNNING',
          timeMs: 0,
          memoryKb: 0,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
        },
      }));

      try {
        const rawRes = await executeCode(
          code,
          selectedLanguage,
          tc.input,
          tc.expectedOutput,
          problem.timeLimit,
          problem.memoryLimit,
          judgeConfig,
          problem.inputFile,
          problem.outputFile
        );

        const res: TestcaseResult = {
          testcaseId: tc.id,
          testcaseName: tc.name,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: rawRes.stdout,
          verdict: rawRes.verdict,
          timeMs: rawRes.timeMs,
          memoryKb: rawRes.memoryKb,
          compileError: rawRes.compileOutput,
          errorMessage: rawRes.stderr,
          diffSummary: rawRes.diffSummary,
          exitCode: rawRes.exitCode,
        };

        newResults[tc.id] = res;

        maxTime = Math.max(maxTime, res.timeMs);
        peakMem = Math.max(peakMem, res.memoryKb);

        if (res.verdict === 'AC') {
          passedCount++;
        } else if (finalVerdict === 'AC') {
          finalVerdict = res.verdict;
        }

        setResults({ ...newResults });

        // If compilation error, extract line numbers and stop remaining tests
        if (res.verdict === 'CE') {
          finalVerdict = 'CE';
          if (rawRes.stderr) {
            const ceErrors: CodeDiagnosticError[] = [];
            const errLines = rawRes.stderr.split('\n');
            for (const el of errLines) {
              const m = el.match(/(?:solution\.[a-z0-9]+|main\.[a-z0-9]+|<source>|File "[^"]+", line (\d+)):(\d+):(?:\d+:)?\s*(error|warning)?:\s*(.*)/i);
              if (m) {
                const lineNum = parseInt(m[1] || m[2], 10);
                const msg = m[4] || m[0];
                if (!isNaN(lineNum)) {
                  ceErrors.push({
                    line: lineNum,
                    message: msg.trim(),
                    severity: m[3]?.toLowerCase() === 'warning' ? 'warning' : 'error',
                  });
                }
              }
            }
            if (ceErrors.length > 0) {
              setDiagnosticErrors(ceErrors);
            }
          }
          break;
        }
      } catch (err: any) {
        newResults[tc.id] = {
          testcaseId: tc.id,
          testcaseName: tc.name,
          verdict: 'RTE',
          timeMs: 0,
          memoryKb: 0,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          errorMessage: err.message,
        };
        setResults({ ...newResults });
        if (finalVerdict === 'AC') finalVerdict = 'RTE';
      }
    }

    const score = Math.round((passedCount / testcases.length) * 100);
    setSummary({
      total: testcases.length,
      passed: passedCount,
      score,
      verdict: finalVerdict,
      maxTimeMs: maxTime,
      peakMemoryKb: peakMem,
    });

    setIsRunning(false);
  };

  // Export Testcases as ZIP
  const handleExportZip = (format: 'standard' | 'themis') => {
    exportTestcasesToZip(testcases, problem.title, format);
  };

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden transition-colors ${appTheme === 'dark' ? 'bg-[#181818] text-gray-200' : 'bg-[#e4e7eb] text-gray-900'
      }`}>
      {/* Top Header */}
      <Header
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        judgeConfig={judgeConfig}
        onOpenJudgeConfigModal={() => setIsApiKeyModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        appTheme={appTheme}
        onToggleTheme={handleToggleTheme}
        languageCode={languageCode}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Mobile Tab Navigation */}
      <div className={`flex lg:hidden p-1 border-b text-xs font-semibold gap-1 shrink-0 ${appTheme === 'dark' ? 'bg-[#252526] border-[#333]' : 'bg-[#d0d0d0] border-[#bbb]'
        }`}>
        <button
          onClick={() => setActiveTab('problem')}
          className={`flex-1 py-1.5 rounded text-center ${activeTab === 'problem'
              ? 'bg-[#337ab7] text-white'
              : appTheme === 'dark' ? 'bg-[#333] text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
        >
          {t.tabProblem}
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-1.5 rounded text-center ${activeTab === 'code'
              ? 'bg-[#337ab7] text-white'
              : appTheme === 'dark' ? 'bg-[#333] text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
        >
          {t.tabCode}
        </button>
        <button
          onClick={() => setActiveTab('judge')}
          className={`flex-1 py-1.5 rounded text-center ${activeTab === 'judge'
              ? 'bg-[#337ab7] text-white'
              : appTheme === 'dark' ? 'bg-[#333] text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
        >
          {t.tabJudge} ({testcases.length})
        </button>
      </div>

      {/* Main 3-Column Layout */}
      <main className="flex-1 min-h-0 p-2 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left Column: Problem Panel (4 cols) */}
        <div
          className={`h-full min-h-0 lg:col-span-4 ${activeTab === 'problem' ? 'block' : 'hidden lg:block'
            }`}
        >
          <ProblemPanel
            problem={problem}
            onChangeProblem={handleSaveProblem}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onGenerateAiSolution={handleGenerateAiSolution}
            onCancelAiSolution={handleCancelAiSolution}
            isAiGeneratingSolution={isGeneratingAiSolution}
            appTheme={appTheme}
            languageCode={languageCode}
          />
        </div>

        {/* Middle Column: Code Editor Panel (4 cols) */}
        <div
          className={`h-full min-h-0 lg:col-span-4 ${activeTab === 'code' ? 'block' : 'hidden lg:block'
            }`}
        >
          <CodeEditorPanel
            code={code}
            onChangeCode={handleCodeChange}
            selectedLanguage={selectedLanguage}
            onChangeLanguage={handleLanguageChange}
            diagnosticErrors={diagnosticErrors}
            onTriggerAiFix={handleTriggerAiFix}
            isAiFixing={isAiFixLoading}
            problemInputFile={problem.inputFile}
            problemOutputFile={problem.outputFile}
            appTheme={appTheme}
            languageCode={languageCode}
          />
        </div>

        {/* Right Column: Judge & Testcase Panel (4 cols) */}
        <div
          className={`h-full min-h-0 lg:col-span-4 ${activeTab === 'judge' ? 'block' : 'hidden lg:block'
            }`}
        >
          <JudgePanel
            testcases={testcases}
            results={results}
            summary={summary}
            isRunning={isRunning}
            currentRunningIndex={currentRunningIndex}
            onRunAll={handleRunAll}
            onStop={handleStop}
            onOpenAiGeneratorModal={() => setIsAiGeneratorOpen(true)}
            onAddTestcase={handleAddTestcase}
            onRemoveTestcase={handleRemoveTestcase}
            onClearResults={() => {
              setResults({});
              setSummary(null);
            }}
            onExportZip={handleExportZip}
            onSelectResultForDiff={(res) => setSelectedResultForDiff(res)}
            isAiGeneratingTests={isAiGeneratingTests}
            aiGenStatus={aiGenStatus}
            aiGenPercent={aiGenPercent}
            aiGenTotalCount={aiGenTotalCount}
            onCancelAiGen={handleCancelAiGen}
            appTheme={appTheme}
            languageCode={languageCode}
          />
        </div>
      </main>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={(key) => {
          setApiKey(key);
          setStoredApiKey(key);
        }}
        model={model}
        onSaveModel={(m) => {
          setModel(m);
          setStoredModel(m);
        }}
        judgeConfig={judgeConfig}
        onSaveJudgeConfig={(cfg) => {
          setJudgeConfig(cfg);
          setStoredJudgeConfig(cfg);
        }}
        includeComments={includeComments}
        onSaveIncludeComments={(inc) => {
          setIncludeComments(inc);
          setStoredIncludeComments(inc);
        }}
        languageCode={languageCode}
        appTheme={appTheme}
      />

      <OcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        apiKey={apiKey}
        onProblemExtracted={handleProblemExtracted}
        onOpenApiKeyModal={() => {
          setIsOcrModalOpen(false);
          setIsApiKeyModalOpen(true);
        }}
        model={model}
        languageCode={languageCode}
        appTheme={appTheme}
      />

      <TestcaseGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        apiKey={apiKey}
        problem={problem}
        onStartGenerate={handleStartGenerateTests}
        onOpenApiKeyModal={() => {
          setIsAiGeneratorOpen(false);
          setIsApiKeyModalOpen(true);
        }}
        model={model}
        languageCode={languageCode}
        appTheme={appTheme}
      />

      <DiffModal
        isOpen={Boolean(selectedResultForDiff)}
        onClose={() => setSelectedResultForDiff(null)}
        result={selectedResultForDiff}
        languageCode={languageCode}
        appTheme={appTheme}
      />

      <AiCodeFixModal
        isOpen={isAiFixModalOpen}
        onClose={() => setIsAiFixModalOpen(false)}
        isLoading={isAiFixLoading}
        originalCode={code}
        fixResult={aiFixResult}
        selectedLanguage={selectedLanguage}
        onApplyFixedCode={handleApplyFixedCode}
        onReDiagnose={handleTriggerAiFix}
        languageCode={languageCode}
        appTheme={appTheme}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        languageCode={languageCode}
        appTheme={appTheme}
      />
    </div>
  );
};

export default App;
