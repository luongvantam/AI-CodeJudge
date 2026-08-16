import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Sparkles,
  Plus,
  Download,
  Clock,
  HardDrive,
  Trash2,
  Eye,
  RefreshCw,
  FolderArchive,
  Layers,
  X,
} from 'lucide-react';
import type { JudgeSummaryStats, Testcase, TestcaseResult, Verdict } from '../types/judge';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface JudgePanelProps {
  testcases: Testcase[];
  results: Record<string, TestcaseResult>;
  summary: JudgeSummaryStats | null;
  isRunning: boolean;
  currentRunningIndex: number;
  onRunAll: () => void;
  onStop: () => void;
  onOpenAiGeneratorModal: () => void;
  onAddTestcase: (tc: Testcase) => void;
  onRemoveTestcase: (id: string) => void;
  onClearResults: () => void;
  onExportZip: (format: 'standard' | 'themis') => void;
  onSelectResultForDiff: (res: TestcaseResult) => void;
  // Live AI Testcase Generation Progress in Sidebar
  isAiGeneratingTests?: boolean;
  aiGenStatus?: string;
  aiGenPercent?: number;
  aiGenTotalCount?: number;
  onCancelAiGen?: () => void;
  appTheme?: 'light' | 'dark';
  languageCode?: LanguageCode;
}

export const JudgePanel: React.FC<JudgePanelProps> = ({
  testcases,
  results,
  summary,
  isRunning,
  currentRunningIndex,
  onRunAll,
  onStop,
  onOpenAiGeneratorModal,
  onAddTestcase,
  onRemoveTestcase,
  onClearResults,
  onExportZip,
  onSelectResultForDiff,
  isAiGeneratingTests = false,
  aiGenStatus = '',
  aiGenPercent = 0,
  aiGenTotalCount = 10,
  onCancelAiGen,
  appTheme = 'light',
  languageCode = 'en',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestInput, setNewTestInput] = useState('');
  const [newTestExpected, setNewTestExpected] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[languageCode];

  // Close Export Zip dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    if (exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuOpen]);

  const handleCreateCustomTest = () => {
    if (!newTestInput.trim() && !newTestExpected.trim()) return;

    const newTc: Testcase = {
      id: `custom-${Date.now()}`,
      name: newTestName.trim() || `Test ${testcases.length + 1}`,
      input: newTestInput.trim(),
      expectedOutput: newTestExpected.trim(),
      type: 'custom',
      isSample: false,
    };
    onAddTestcase(newTc);
    setNewTestName('');
    setNewTestInput('');
    setNewTestExpected('');
    setShowAddForm(false);
  };

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case 'AC':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#27ae60] text-white shadow-xs">AC</span>;
      case 'WA':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e74c3c] text-white shadow-xs">WA</span>;
      case 'TLE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e67e22] text-white shadow-xs">TLE</span>;
      case 'MLE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#8e44ad] text-white shadow-xs">MLE</span>;
      case 'RTE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#c0392b] text-white shadow-xs">RTE</span>;
      case 'CE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#7f8c8d] text-white shadow-xs">CE</span>;
      case 'RUNNING':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#2980b9] text-white shadow-xs flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" /> RUN
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-200 text-gray-700 dark:bg-[#3a3a3a] dark:text-gray-300">
            PENDING
          </span>
        );
    }
  };

  const getTypeTag = (type?: string) => {
    switch (type) {
      case 'sample':
        return <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 px-1.5 py-0.5 rounded font-semibold">Sample</span>;
      case 'edge':
        return <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 px-1.5 py-0.5 rounded font-semibold">Edge</span>;
      case 'stress':
        return <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 px-1.5 py-0.5 rounded font-semibold">Stress</span>;
      case 'tricky':
        return <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 px-1.5 py-0.5 rounded font-semibold">Tricky</span>;
      default:
        return <span className="text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-semibold">Test</span>;
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 rounded shadow-xs overflow-hidden border ${
      appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-[#d5d5d5]'
    }`}>
      {/* Panel Header & Primary Action Toolbar */}
      <div className={`p-2 flex flex-wrap items-center justify-between gap-2 shrink-0 border-b ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#333]' : 'bg-[#f5f5f5] border-[#ddd]'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Main Judge Button */}
          {isRunning ? (
            <button
              onClick={onStop}
              className="btn-classic btn-danger text-xs font-bold px-3 py-1.5 shadow-xs"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{t.stopJudging}</span>
            </button>
          ) : (
            <button
              onClick={onRunAll}
              disabled={testcases.length === 0 || isAiGeneratingTests}
              className="btn-classic btn-success text-xs font-bold px-3 py-1.5 shadow-xs disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t.runAllTests} ({testcases.length})</span>
            </button>
          )}

          {/* AI Generator Button */}
          <button
            onClick={onOpenAiGeneratorModal}
            disabled={isAiGeneratingTests}
            className="btn-classic btn-primary text-xs py-1.5 px-2 disabled:opacity-50"
            title={t.aiGenerateTests}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f1c40f]" />
            <span className="hidden sm:inline">{t.aiGenerateTests}</span>
          </button>

          {/* Add Custom Test */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-classic btn-default text-xs py-1.5 px-2 text-gray-700 dark:text-gray-200"
            title={t.addCustomTest}
          >
            <Plus className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">{t.addCustomTest}</span>
          </button>
        </div>

        {/* Right Action: Export Zip */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            disabled={testcases.length === 0}
            className="btn-classic btn-default text-xs py-1.5 px-2.5 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            title={t.exportZip}
          >
            <FolderArchive className="w-3.5 h-3.5 text-[#337ab7]" />
            <span>{t.exportZip}</span>
          </button>

          {exportMenuOpen && (
            <div className={`absolute left-0 top-full mt-1 w-56 border rounded shadow-2xl py-1 z-30 text-xs ${
              appTheme === 'dark' ? 'bg-[#252526] border-[#444] text-gray-200' : 'bg-white border-gray-300 text-gray-800'
            }`}>
              <button
                onClick={() => {
                  onExportZip('standard');
                  setExportMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                  appTheme === 'dark' ? 'hover:bg-[#333]' : 'hover:bg-gray-100'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>{t.zipStandard}</span>
              </button>
              <button
                onClick={() => {
                  onExportZip('themis');
                  setExportMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 border-t ${
                  appTheme === 'dark' ? 'hover:bg-[#333] border-[#333]' : 'hover:bg-gray-100 border-gray-100'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5 text-green-600" />
                <span>{t.zipThemis}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Generating Test Cases Live Progress Banner (in Sidebar) */}
      {isAiGeneratingTests && (
        <div className={`p-3 space-y-2 shrink-0 border-b ${
          appTheme === 'dark' ? 'bg-[#152738] border-[#204d74] text-blue-200' : 'bg-[#e8f4fc] border-[#b8daf3] text-[#1b4f72]'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#f39c12] animate-bounce" />
              <span>{t.aiGeneratingTestsTitle} {aiGenTotalCount} {t.aiTestsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#3498db]">{aiGenPercent}%</span>
              {onCancelAiGen && (
                <button
                  onClick={onCancelAiGen}
                  className="text-gray-400 hover:text-red-500 p-0.5"
                  title={t.cancel}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#d0e5f5] dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#2980b9] h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${aiGenPercent}%` }}
            />
          </div>

          {/* Live Substatus Text */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <RefreshCw className="w-3 h-3 animate-spin text-[#2980b9]" />
            <span className="truncate">{aiGenStatus || 'Processing...'}</span>
          </div>
        </div>
      )}

      {/* Judging Live Progress Bar */}
      {isRunning && (
        <div className="bg-[#3498db] text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between shrink-0 shadow-inner">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Grading Test #{currentRunningIndex + 1} / {testcases.length}...</span>
          </div>
          <span className="font-mono">
            {Math.round(((currentRunningIndex + 1) / testcases.length) * 100)}%
          </span>
        </div>
      )}

      {/* Summary Score Card */}
      {summary && (
        <div
          className={`border-b px-4 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-xs ${
            summary.verdict === 'AC'
              ? 'bg-[#27ae60] text-white border-[#219150]'
              : summary.verdict === 'CE' || summary.verdict === 'WA' || summary.verdict === 'RTE'
              ? 'bg-[#c0392b] text-white border-[#a93226]'
              : 'bg-[#d35400] text-white border-[#ba4a00]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="text-base sm:text-lg font-black font-mono tracking-wide text-white">
              {summary.verdict === 'AC' && 'ACCEPTED (AC)'}
              {summary.verdict === 'WA' && 'WRONG ANSWER (WA)'}
              {summary.verdict === 'TLE' && 'TIME LIMIT EXCEEDED (TLE)'}
              {summary.verdict === 'MLE' && 'MEMORY LIMIT EXCEEDED (MLE)'}
              {summary.verdict === 'RTE' && 'RUNTIME ERROR (RTE)'}
              {summary.verdict === 'CE' && 'COMPILATION ERROR (CE)'}
            </div>
            <div className="bg-black/20 border border-white/40 px-2 py-0.5 rounded text-xs font-bold font-mono text-white">
              {t.score}: {summary.score}/100 ({summary.passed}/{summary.total} {t.passed})
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-white/90">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {t.maxTime}: <strong>{summary.maxTimeMs} ms</strong>
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" /> {t.peakRam}: <strong>{summary.peakMemoryKb} KB</strong>
            </span>
          </div>
        </div>
      )}

      {/* Custom Testcase Add Drawer */}
      {showAddForm && (
        <div className={`p-3 shrink-0 space-y-2 text-xs border-b ${
          appTheme === 'dark' ? 'bg-[#252526] border-[#444] text-gray-200' : 'bg-[#f0f4f8] border-gray-300 text-gray-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold">{t.addTestTitle}</span>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              {t.cancel}
            </button>
          </div>
          <input
            type="text"
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
            placeholder={t.testNamePlaceholder}
            className={`w-full border rounded px-2 py-1 text-xs ${
              appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300'
            }`}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-gray-500 block mb-0.5">Input:</span>
              <textarea
                rows={2}
                value={newTestInput}
                onChange={(e) => setNewTestInput(e.target.value)}
                placeholder={t.inputPlaceholder}
                className={`w-full border rounded p-1 font-mono text-[11px] ${
                  appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <span className="text-[11px] text-gray-500 block mb-0.5">Expected Output:</span>
              <textarea
                rows={2}
                value={newTestExpected}
                onChange={(e) => setNewTestExpected(e.target.value)}
                placeholder={t.expectedOutputPlaceholder}
                className={`w-full border rounded p-1 font-mono text-[11px] ${
                  appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateCustomTest}
              className="btn-classic btn-primary text-xs py-1 px-3"
            >
              {t.saveTestCase}
            </button>
          </div>
        </div>
      )}

      {/* Testcases Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {testcases.length === 0 && !isAiGeneratingTests ? (
          <div className="p-8 text-center text-gray-500 space-y-3">
            <Layers className="w-10 h-10 mx-auto text-gray-400" />
            <p className="text-sm font-medium">{t.noTestcases}</p>
            <p className="text-xs text-gray-400">
              {t.noTestcasesDesc}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className={`border-b sticky top-0 font-semibold select-none z-10 ${
              appTheme === 'dark' ? 'bg-[#252526] border-[#333] text-gray-300' : 'bg-[#eef2f5] border-gray-300 text-gray-700'
            }`}>
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">{t.testNameCol}</th>
                <th className="py-2.5 px-3 w-28 text-center">{t.verdictCol}</th>
                <th className="py-2.5 px-3 w-24 text-right">{t.timeCol}</th>
                <th className="py-2.5 px-3 w-28 text-center">{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono text-xs ${
              appTheme === 'dark' ? 'divide-[#2f2f2f]' : 'divide-gray-200'
            }`}>
              {testcases.map((tc, index) => {
                const res = results[tc.id];
                const isCurRunning = isRunning && currentRunningIndex === index;
                const verdict: Verdict = isCurRunning
                  ? 'RUNNING'
                  : res
                  ? res.verdict
                  : 'PENDING';

                // Crisp and clean row styling with high contrast
                const rowBg = isCurRunning
                  ? appTheme === 'dark'
                    ? 'bg-[#152e47] border-l-4 border-l-[#3498db]'
                    : 'bg-[#e8f4fc] border-l-4 border-l-[#3498db]'
                  : res
                  ? res.verdict === 'AC'
                    ? appTheme === 'dark'
                      ? 'bg-[#172b1c] border-l-4 border-l-[#2ecc71]'
                      : 'bg-[#f0faf2] border-l-4 border-l-[#27ae60]'
                    : appTheme === 'dark'
                    ? 'bg-[#331c1c] border-l-4 border-l-[#e74c3c]'
                    : 'bg-[#fdf2f2] border-l-4 border-l-[#e74c3c]'
                  : appTheme === 'dark'
                  ? index % 2 === 1 ? 'bg-[#222222] border-l-4 border-l-transparent' : 'bg-[#1e1e1e] border-l-4 border-l-transparent'
                  : index % 2 === 1 ? 'bg-[#fbfbfb] border-l-4 border-l-transparent' : 'bg-white border-l-4 border-l-transparent';

                return (
                  <tr
                    key={tc.id}
                    className={`transition-colors hover:opacity-95 ${rowBg}`}
                  >
                    <td className="py-2.5 px-3 text-center text-gray-400 font-bold font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        {getTypeTag(tc.type)}
                        <span className={`font-bold truncate max-w-xs ${
                          appTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {tc.name}
                        </span>
                      </div>
                      {tc.description && (
                        <div className={`text-[11px] truncate max-w-sm font-sans mt-0.5 italic ${
                          appTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {tc.description}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {getVerdictBadge(verdict)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      appTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {res ? `${res.timeMs} ms` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {res && (
                          <button
                            onClick={() => onSelectResultForDiff(res)}
                            className={`btn-classic text-[11px] py-1 px-2 font-semibold border flex items-center gap-1 ${
                              appTheme === 'dark'
                                ? 'bg-[#2d2d30] border-[#555] text-blue-400 hover:bg-[#383838]'
                                : 'bg-white border-gray-300 text-[#337ab7] hover:bg-gray-100'
                            }`}
                            title="Diff & Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t.diffBtn}</span>
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveTestcase(tc.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
                          title={t.removeBtn}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className={`px-3 py-1.5 text-[11px] flex items-center justify-between shrink-0 border-t ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#333] text-gray-400' : 'bg-[#f9f9f9] border-gray-200 text-gray-500'
      }`}>
        <span>{t.totalTests} <strong>{testcases.length}</strong></span>
        {Object.keys(results).length > 0 && (
          <button
            onClick={onClearResults}
            className="text-gray-500 hover:text-red-500 text-[11px] underline"
          >
            {t.clearResults}
          </button>
        )}
      </div>
    </div>
  );
};
