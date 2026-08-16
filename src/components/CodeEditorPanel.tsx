import React, { useState, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
  Copy,
  Check,
  Code,
  Sun,
  Moon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { LanguageConfig } from '../types/judge';
import type { CodeDiagnosticError } from '../services/geminiService';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface CodeEditorPanelProps {
  code: string;
  onChangeCode: (code: string) => void;
  selectedLanguage: LanguageConfig;
  onChangeLanguage: (lang: LanguageConfig) => void;
  diagnosticErrors?: CodeDiagnosticError[];
  onTriggerAiFix?: () => void;
  isAiFixing?: boolean;
  problemInputFile?: string;
  problemOutputFile?: string;
  appTheme?: 'light' | 'dark';
  languageCode?: LanguageCode;
}

/**
 * Fast local static syntax check to provide instant red squiggles for common mistakes
 */
function getLocalSyntaxDiagnostics(code: string, languageId: string): CodeDiagnosticError[] {
  const errors: CodeDiagnosticError[] = [];
  const lines = code.split('\n');

  // 1. Bracket Matching Check
  const stack: Array<{ char: string; line: number; col: number }> = [];
  const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip single-line comments
    const codePart = line.split('//')[0].split('#')[0];

    for (let j = 0; j < codePart.length; j++) {
      const char = codePart[j];
      if (char === '(' || char === '{' || char === '[') {
        stack.push({ char, line: i + 1, col: j + 1 });
      } else if (char === ')' || char === '}' || char === ']') {
        const expected = pairs[char];
        if (stack.length === 0) {
          errors.push({
            line: i + 1,
            column: j + 1,
            message: `Unmatched closing '${char}'`,
            severity: 'error',
          });
        } else {
          const top = stack.pop()!;
          if (top.char !== expected) {
            errors.push({
              line: i + 1,
              column: j + 1,
              message: `Mismatched bracket: expected closing for '${top.char}' (line ${top.line}), but found '${char}'`,
              severity: 'error',
            });
          }
        }
      }
    }

    // 2. Simple semicolon check for C/C++ (lines ending without semicolon or brace)
    if (languageId.includes('cpp') || languageId.includes('c') || languageId.includes('java')) {
      const trimmed = codePart.trim();
      if (
        trimmed &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('//') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(':') &&
        !trimmed.endsWith(',') &&
        !trimmed.startsWith('if') &&
        !trimmed.startsWith('for') &&
        !trimmed.startsWith('while') &&
        !trimmed.startsWith('else') &&
        !trimmed.startsWith('case') &&
        !trimmed.startsWith('default') &&
        !trimmed.startsWith('template') &&
        !trimmed.startsWith('namespace') &&
        !trimmed.startsWith('class') &&
        !trimmed.startsWith('struct') &&
        (trimmed.includes('=') || trimmed.includes('cout') || trimmed.includes('cin') || trimmed.includes('return') || trimmed.includes('int ') || trimmed.includes('long '))
      ) {
        errors.push({
          line: i + 1,
          column: line.length,
          message: "Possible missing semicolon ';' at the end of statement",
          severity: 'warning',
        });
      }
    }
  }

  // Report any unclosed brackets
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push({
      line: unclosed.line,
      column: unclosed.col,
      message: `Unclosed bracket '${unclosed.char}'`,
      severity: 'error',
    });
  }

  return errors;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  code,
  onChangeCode,
  selectedLanguage,
  onChangeLanguage,
  diagnosticErrors = [],
  onTriggerAiFix,
  isAiFixing = false,
  problemInputFile,
  problemOutputFile,
  appTheme = 'light',
  languageCode = 'en',
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>(
    appTheme === 'dark' ? 'vs-dark' : 'vs-dark'
  );
  const [activeErrorsCount, setActiveErrorsCount] = useState(0);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const t = TRANSLATIONS[languageCode];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langId = e.target.value;
    const found = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
    if (found) {
      onChangeLanguage(found);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    applyMarkers();
  };

  // Apply red squiggles and diagnostic markers to Monaco Editor
  const applyMarkers = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Combine local static checks with AI/Compiler diagnostics
    const localIssues = getLocalSyntaxDiagnostics(code, selectedLanguage.id);
    const combined = [...diagnosticErrors, ...localIssues];

    // Deduplicate by line
    const uniqueMap = new Map<number, CodeDiagnosticError>();
    for (const item of combined) {
      if (!uniqueMap.has(item.line) || item.severity === 'error') {
        uniqueMap.set(item.line, item);
      }
    }
    const allErrors = Array.from(uniqueMap.values());
    setActiveErrorsCount(allErrors.length);

    const markers = allErrors.map((err) => {
      const lineNum = Math.min(Math.max(1, err.line), model.getLineCount());
      const maxCol = model.getLineMaxColumn(lineNum) || 100;
      return {
        startLineNumber: lineNum,
        startColumn: err.column ? Math.min(err.column, maxCol) : 1,
        endLineNumber: lineNum,
        endColumn: maxCol,
        message: err.message,
        severity:
          err.severity === 'warning'
            ? monacoRef.current.MarkerSeverity.Warning
            : monacoRef.current.MarkerSeverity.Error,
      };
    });

    monacoRef.current.editor.setModelMarkers(model, 'ai-codejudge', markers);
  };

  // Re-apply markers whenever code or external diagnostics change
  useEffect(() => {
    applyMarkers();
  }, [code, diagnosticErrors, selectedLanguage]);

  return (
    <div className={`flex flex-col h-full min-h-0 rounded shadow-xs overflow-hidden border ${
      appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-[#d5d5d5]'
    }`}>
      {/* Single-Line Compact Toolbar */}
      <div className={`px-2.5 py-1.5 flex items-center justify-between gap-2 shrink-0 border-b overflow-x-auto ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#333] text-gray-200' : 'bg-[#f5f5f5] border-[#ddd] text-gray-800'
      }`}>
        {/* Left: Language Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Code className="w-3.5 h-3.5 text-[#337ab7]" />
          <label className="text-xs font-bold whitespace-nowrap">{t.language}:</label>
          <select
            value={selectedLanguage.id}
            onChange={handleLanguageChange}
            className={`border rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-[#337ab7] ${
              appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            <optgroup label="C / C++ (Competitive Programming)">
              {SUPPORTED_LANGUAGES.filter((l) => l.category === 'C/C++').map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Python & PyPy">
              {SUPPORTED_LANGUAGES.filter((l) => l.category === 'Python').map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Pascal (Free Pascal)">
              {SUPPORTED_LANGUAGES.filter((l) => l.category === 'Pascal').map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Other (Java, Rust, Go)">
              {SUPPORTED_LANGUAGES.filter((l) => l.category === 'Other').map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Right: AI Fix Code, Errors Badge, Theme, Font, Copy */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Active Error Badge */}
          {activeErrorsCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span>{activeErrorsCount}</span>
            </span>
          )}

          {/* AI Code Fix Agent Button */}
          {onTriggerAiFix && (
            <button
              onClick={onTriggerAiFix}
              disabled={isAiFixing}
              className="btn-classic btn-primary text-xs py-0.5 px-2.5 flex items-center gap-1 font-bold shadow-xs disabled:opacity-50"
              title={t.aiFixCode}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f1c40f] animate-pulse" />
              <span>{t.aiFixCode}</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="btn-classic btn-default text-xs py-0.5 px-1.5"
            title={t.theme}
          >
            {editorTheme === 'vs-dark' ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-gray-600" />}
          </button>

          {/* Font size */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className={`border rounded px-1.5 py-0.5 text-xs ${
              appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300 text-gray-700'
            }`}
            title={t.fontSize}
          >
            <option value={12}>12px</option>
            <option value={13}>13px</option>
            <option value={14}>14px</option>
            <option value={15}>15px</option>
            <option value={16}>16px</option>
          </select>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="btn-classic btn-default text-xs py-0.5 px-2 text-gray-700 dark:text-gray-200 flex items-center gap-1"
            title="Copy Code"
          >
            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container with red squiggly underlines */}
      <div className="flex-1 min-h-0 w-full relative overflow-hidden">
        <Editor
          height="100%"
          language={selectedLanguage.monacoLang}
          value={code}
          theme={editorTheme}
          onMount={handleEditorDidMount}
          onChange={(val) => onChangeCode(val || '')}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace",
            fontWeight: '600',
            fontLigatures: true,
            letterSpacing: 0.5,
            lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: false,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-[#2c3e50] text-gray-300 px-3 py-1 text-[11px] font-mono flex items-center justify-between border-t border-[#1a252f] shrink-0">
        <div className="flex items-center gap-3">
          <span>File: <strong className="text-white">solution.{selectedLanguage.extension}</strong></span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-gray-400 hidden sm:inline">{selectedLanguage.name}</span>
          {problemInputFile && (
            <span className="text-blue-300 hidden md:inline font-mono">
              [I/O: {problemInputFile} &rarr; {problemOutputFile || 'stdout'}]
            </span>
          )}
        </div>
        <div>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
