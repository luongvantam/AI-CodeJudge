import React from 'react';
import { X, CheckCircle, XCircle, Terminal } from 'lucide-react';
import type { TestcaseResult } from '../types/judge';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestcaseResult | null;
  languageCode?: LanguageCode;
  appTheme?: 'light' | 'dark';
}

export const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  result,
  languageCode = 'en',
  appTheme = 'light',
}) => {
  if (!isOpen || !result) return null;
  const t = TRANSLATIONS[languageCode];

  const getVerdictBadge = () => {
    switch (result.verdict) {
      case 'AC':
        return <span className="px-2 py-0.5 rounded text-xs font-bold badge-ac">ACCEPTED (AC)</span>;
      case 'WA':
        return <span className="px-2 py-0.5 rounded text-xs font-bold badge-wa">WRONG ANSWER (WA)</span>;
      case 'TLE':
        return <span className="px-2 py-0.5 rounded text-xs font-bold badge-tle">TIME LIMIT EXCEEDED (TLE)</span>;
      case 'MLE':
        return <span className="px-2 py-0.5 rounded text-xs font-bold badge-mle">MEMORY LIMIT EXCEEDED (MLE)</span>;
      case 'RTE':
        return <span className="px-2 py-0.5 rounded text-xs font-bold badge-rte">RUNTIME ERROR (RTE)</span>;
      case 'CE':
        return <span className="px-2 py-0.5 rounded text-xs font-bold badge-ce">COMPILATION ERROR (CE)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold badge-pending">{result.verdict}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className={`border rounded shadow-xl w-full max-w-4xl overflow-hidden text-sm flex flex-col max-h-[90vh] ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#444] text-gray-200' : 'bg-white border-[#999] text-gray-800'
      }`}>
        {/* Header */}
        <div className="bg-[#2c3e50] text-white px-4 py-2.5 flex items-center justify-between font-bold shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-base">{result.testcaseName}</span>
            {getVerdictBadge()}
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info stats */}
        <div className={`px-4 py-2 border-b flex items-center gap-6 text-xs font-medium shrink-0 ${
          appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333] text-gray-300' : 'bg-[#ecf0f1] border-[#bdc3c7] text-gray-700'
        }`}>
          <div>
            Time: <strong className="font-mono">{result.timeMs} ms</strong>
          </div>
          <div>
            Memory: <strong className="font-mono">{result.memoryKb} KB</strong>
          </div>
          {result.exitCode !== undefined && (
            <div>
              Exit Code: <strong className="font-mono">{result.exitCode}</strong>
            </div>
          )}
          {result.diffSummary && (
            <div className="text-red-500 font-semibold truncate max-w-md">
              {result.diffSummary}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {/* Compilation / Error Message if any */}
          {(result.compileError || (result.errorMessage && result.verdict !== 'AC' && result.verdict !== 'WA')) && (
            <div className="bg-[#2d2d2d] text-[#ff6b6b] p-3 rounded border border-red-900 overflow-x-auto space-y-1">
              <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-red-400">
                <Terminal className="w-4 h-4" />
                <span>Compiler / Runtime Log:</span>
              </div>
              <pre className="text-[11px] whitespace-pre-wrap">
                {result.compileError || result.errorMessage}
              </pre>
            </div>
          )}

          {/* Standard Input */}
          <div>
            <div className="font-sans font-semibold text-xs mb-1">
              {t.inputTab}:
            </div>
            <div className={`border p-2.5 rounded max-h-40 overflow-y-auto ${
              appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#444] text-gray-200' : 'bg-[#f8f9fa] border-gray-300 text-gray-800'
            }`}>
              <pre className="text-[12px] whitespace-pre-wrap">{result.input || '(Empty)'}</pre>
            </div>
          </div>

          {/* 2-Column Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expected Output */}
            <div>
              <div className="font-sans font-semibold text-green-600 text-xs mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {t.expectedOutputTab}:
              </div>
              <div className={`border p-2.5 rounded max-h-60 overflow-y-auto ${
                appTheme === 'dark' ? 'bg-[#1b2b1d] border-green-800 text-green-200' : 'bg-[#f0fdf4] border-green-300 text-gray-900'
              }`}>
                <pre className="text-[12px] whitespace-pre-wrap">
                  {result.expectedOutput || '(Empty)'}
                </pre>
              </div>
            </div>

            {/* Actual Output */}
            <div>
              <div
                className={`font-sans font-semibold text-xs mb-1 flex items-center gap-1 ${
                  result.verdict === 'AC' ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {result.verdict === 'AC' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                {t.actualOutputTab}:
              </div>
              <div
                className={`border p-2.5 rounded max-h-60 overflow-y-auto ${
                  result.verdict === 'AC'
                    ? appTheme === 'dark' ? 'bg-[#1b2b1d] border-green-800 text-green-200' : 'bg-[#f0fdf4] border-green-300'
                    : appTheme === 'dark' ? 'bg-[#2b1b1b] border-red-800 text-red-200' : 'bg-[#fef2f2] border-red-300'
                }`}
              >
                <pre className="text-[12px] whitespace-pre-wrap">
                  {result.actualOutput || (result.verdict === 'TLE' ? '(Time Limit Exceeded)' : '(No output)')}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-end shrink-0 ${
          appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f5f5f5] border-[#ddd]'
        }`}>
          <button onClick={onClose} className="btn-classic btn-default text-xs">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
