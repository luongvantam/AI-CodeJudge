import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Code2,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import type { CodeFixResult } from '../services/geminiService';
import type { LanguageConfig } from '../types/judge';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface AiCodeFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  originalCode: string;
  fixResult: CodeFixResult | null;
  selectedLanguage: LanguageConfig;
  onApplyFixedCode: (code: string) => void;
  onReDiagnose?: () => void;
  appTheme?: 'light' | 'dark';
  languageCode?: LanguageCode;
}

export const AiCodeFixModal: React.FC<AiCodeFixModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  originalCode,
  fixResult,
  selectedLanguage,
  onApplyFixedCode,
  onReDiagnose,
  appTheme = 'light',
  languageCode = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'repaired' | 'original'>('repaired');
  const [loadingStep, setLoadingStep] = useState(0);

  const t = TRANSLATIONS[languageCode];

  // Cycling animated loading steps
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 3);
    }, 1600);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Clean and unwrap fixed code to guarantee only pure source code is shown
  const cleanFixedCode = React.useMemo(() => {
    if (!fixResult?.fixedCode) return originalCode;
    let code = fixResult.fixedCode.trim();
    if (code.startsWith('{') && code.includes('"fixedCode"')) {
      try {
        const parsed = JSON.parse(code);
        if (parsed.fixedCode) code = parsed.fixedCode.trim();
      } catch (_) {}
    }
    const match = code.match(/```[a-z0-9_+-]*\s*([\s\S]*?)\s*```/i);
    if (match) code = match[1].trim();
    return code;
  }, [fixResult, originalCode]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFixedCode(cleanFixedCode);
    onClose();
  };

  const currentDisplayCode =
    activeTab === 'repaired'
      ? cleanFixedCode
      : originalCode;

  const loadingStepsVi = [
    'Đang phân tích cấu trúc cú pháp & kiểu dữ liệu...',
    'Đang rà soát tràn số 64-bit & các trường hợp biên...',
    'Đang tạo mã nguồn tối ưu hóa...',
  ];

  const loadingStepsEn = [
    'Analyzing syntax structure & data types...',
    'Checking 64-bit overflow & edge case boundaries...',
    'Generating clean optimized source code...',
  ];

  const steps = languageCode === 'vi' ? loadingStepsVi : loadingStepsEn;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6">
      <div
        className={`border-2 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh] max-h-[880px] transition-colors ${
          appTheme === 'dark'
            ? 'bg-[#1e1e1e] border-[#444] text-gray-100'
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        {/* Top Header */}
        <div className="bg-[#2c3e50] text-white px-5 py-3.5 flex items-center justify-between font-bold shrink-0 border-b border-[#1a252f]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34495e] rounded-lg border border-[#4a627a] text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-base sm:text-lg font-bold tracking-wide">
                  {t.aiFixModalTitle}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#34495e] text-blue-200 border border-[#4e6d8d]">
                  {selectedLanguage.name}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#34495e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {isLoading ? (
            /* Loading State: Entire Box Containing Star Bounces */
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
              {/* Entire Card Containing Star Bounces */}
              <div className="p-6 rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 shadow-xl animate-bounce flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-amber-500" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {t.aiFixingCode}
                </h3>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 h-6">
                  {steps[loadingStep]}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-64 sm:w-80 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 via-[#337ab7] to-green-500 rounded-full animate-pulse w-full" />
              </div>
            </div>
          ) : fixResult ? (
            /* 2-Column Split: Left Sidebar (Diagnosis) + Right Main (Code Editor) */
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              {/* Left Sidebar: Diagnosis, Error Badges & Explanation (~380px) */}
              <div
                className={`w-full md:w-96 lg:w-[420px] border-b md:border-b-0 md:border-r flex flex-col shrink-0 overflow-hidden ${
                  appTheme === 'dark' ? 'bg-[#181818] border-[#333]' : 'bg-[#f8fafd] border-gray-200'
                }`}
              >
                {/* Top Status Banner */}
                <div
                  className={`p-4 border-b shrink-0 ${
                    appTheme === 'dark' ? 'border-[#2d2d2d]' : 'border-gray-200'
                  }`}
                >
                  {fixResult.errors.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>
                          {fixResult.errors.length} {t.syntaxErrorsCount}:
                        </span>
                      </div>

                      {/* Error List Badges */}
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                        {fixResult.errors.map((err, idx) => (
                          <div
                            key={idx}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5 shadow-2xs ${
                              appTheme === 'dark'
                                ? 'bg-red-950/60 border-red-800 text-red-300'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                          >
                            <span className="font-mono font-bold bg-red-600 text-white px-1.5 py-0.2 rounded text-[11px]">
                              L{err.line}
                            </span>
                            <span className="truncate max-w-[200px]">{err.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 p-3 rounded-xl border border-green-200 dark:border-green-900/60">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{t.noErrorsFoundMsg}</span>
                    </div>
                  )}
                </div>

                {/* Explanation Content (Scrollable, 13-14px font, KaTeX rendered) */}
                <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#337ab7] dark:text-blue-400">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t.aiFixExplanation}</span>
                  </div>

                  <div
                    className={`text-[13px] leading-relaxed prose prose-sm max-w-none ${
                      appTheme === 'dark' ? 'text-gray-200 prose-invert' : 'text-gray-800'
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {fixResult.explanation}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Left Sidebar Bottom Actions */}
                <div
                  className={`p-4 border-t shrink-0 space-y-2.5 ${
                    appTheme === 'dark' ? 'bg-[#202020] border-[#333]' : 'bg-[#eef2f7] border-gray-200'
                  }`}
                >
                  <button
                    onClick={handleApply}
                    className="w-full btn-classic btn-success py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>{t.applyFixBtn}</span>
                  </button>

                  {onReDiagnose && (
                    <button
                      onClick={onReDiagnose}
                      disabled={isLoading}
                      className="w-full btn-classic btn-default py-1.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{languageCode === 'vi' ? 'Phân tích lại' : 'Re-analyze'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Main: Full-Height Code Display with 2 Tabs */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* 2-Tab Switcher Bar */}
                <div
                  className={`px-4 py-2.5 border-b flex items-center justify-between shrink-0 ${
                    appTheme === 'dark' ? 'bg-[#222222] border-[#333]' : 'bg-[#eef2f5] border-gray-200'
                  }`}
                >
                  {/* Left: 2 Tabs */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('repaired')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        activeTab === 'repaired'
                          ? 'bg-[#27ae60] text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>
                        {languageCode === 'vi' ? 'Mã nguồn đã sửa (Khuyên dùng)' : 'Repaired Code (Fixed)'}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('original')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        activeTab === 'original'
                          ? 'bg-[#337ab7] text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <Code2 className="w-4 h-4" />
                      <span>{languageCode === 'vi' ? 'Mã nguồn gốc' : 'Original Code'}</span>
                    </button>
                  </div>

                  {/* Right Status Indicator */}
                  <div className="text-xs font-mono font-semibold">
                    {activeTab === 'repaired' ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span>Sẵn sàng áp dụng</span>
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Mã nguồn ban đầu</span>
                    )}
                  </div>
                </div>

                {/* Monaco Editor (Full Height, 14px Font, JetBrains Mono) */}
                <div className="flex-1 min-h-0 w-full relative">
                  <Editor
                    height="100%"
                    language={selectedLanguage.monacoLang}
                    value={currentDisplayCode}
                    theme={appTheme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                      fontWeight: '600',
                      lineHeight: 22,
                      readOnly: true,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Bottom Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-end shrink-0 ${
            appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f5f5f5] border-[#ddd]'
          }`}
        >
          <button
            onClick={onClose}
            className="btn-classic btn-default text-xs py-1.5 px-5 font-semibold text-gray-700 dark:text-gray-200"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
