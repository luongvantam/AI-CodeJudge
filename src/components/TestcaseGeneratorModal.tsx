import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { ProblemStatement } from '../types/problem';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface TestcaseGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  problem: ProblemStatement;
  onStartGenerate: (count: number, mode: 'replace' | 'append', customInstructions?: string) => void;
  onOpenApiKeyModal: () => void;
  model: string;
  languageCode?: LanguageCode;
  appTheme?: 'light' | 'dark';
}

export const TestcaseGeneratorModal: React.FC<TestcaseGeneratorModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  problem,
  onStartGenerate,
  onOpenApiKeyModal,
  model,
  languageCode = 'en',
  appTheme = 'light',
}) => {
  const [count, setCount] = useState<number>(10);
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const t = TRANSLATIONS[languageCode];

  if (!isOpen) return null;

  const handleStart = () => {
    if (!apiKey) {
      onOpenApiKeyModal();
      return;
    }
    onStartGenerate(count, mode, customInstructions.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className={`border rounded shadow-xl w-full max-w-lg overflow-hidden text-sm ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#444] text-gray-200' : 'bg-white border-[#999] text-gray-800'
      }`}>
        {/* Header */}
        <div className="bg-[#337ab7] text-white px-4 py-2.5 flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f1c40f]" />
            <span>{t.aiGenModalTitle}</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {!apiKey && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded text-xs flex items-center justify-between">
              <span>{t.enterGeminiKey}</span>
              <button
                onClick={onOpenApiKeyModal}
                className="btn-classic bg-amber-600 text-white hover:bg-amber-700 text-xs py-0.5 px-2"
              >
                Key
              </button>
            </div>
          )}

          {/* Problem Info */}
          <div className={`p-2.5 rounded text-xs border ${
            appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f0f7fd] border-[#d0e5f5]'
          }`}>
            <span className="font-semibold text-[#337ab7] block">{problem.title}</span>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">
                {t.testcaseCountLabel}
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className={`w-full border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#337ab7] ${
                  appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value={5}>5 tests</option>
                <option value={10}>10 tests (Recommended)</option>
                <option value={15}>15 tests</option>
                <option value={20}>20 tests (Full coverage)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">{t.saveModeLabel}</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'replace' | 'append')}
                className={`w-full border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#337ab7] ${
                  appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="replace">{t.saveModeReplace}</option>
                <option value="append">{t.saveModeAppend}</option>
              </select>
            </div>
          </div>

          {/* Test Coverage Explanation */}
          <div className={`p-2.5 rounded text-xs space-y-1 border ${
            appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333] text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <span className="font-semibold block">{t.testCoverageInfo}</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>{t.covSample}</li>
              <li>{t.covEdge}</li>
              <li>{t.covStress}</li>
              <li>{t.covTricky}</li>
            </ul>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="text-xs font-semibold block mb-1">
              {t.customPromptLabel}
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder={t.customPromptPlaceholder}
              className={`w-full border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#337ab7] ${
                appTheme === 'dark' ? 'bg-[#333] border-[#555] text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between ${
          appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f5f5f5] border-[#ddd]'
        }`}>
          <span className="text-xs text-gray-500">Model: <strong className="font-mono">{model}</strong></span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-classic btn-default text-xs">
              {t.cancel}
            </button>
            <button
              onClick={handleStart}
              className="btn-classic btn-success text-xs font-semibold px-3 py-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.startGenBtn} {count} Tests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
