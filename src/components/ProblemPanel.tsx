import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  BookOpen,
  Image,
  Edit3,
  Save,
  Eye,
  Clock,
  HardDrive,
  Sparkles,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import type { ProblemStatement } from '../types/problem';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface ProblemPanelProps {
  problem: ProblemStatement;
  onChangeProblem: (updated: ProblemStatement) => void;
  onOpenOcrModal: () => void;
  onGenerateAiSolution: () => void;
  onCancelAiSolution?: () => void;
  isAiGeneratingSolution?: boolean;
  appTheme?: 'light' | 'dark';
  languageCode?: LanguageCode;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({
  problem,
  onChangeProblem,
  onOpenOcrModal,
  onGenerateAiSolution,
  onCancelAiSolution,
  isAiGeneratingSolution = false,
  appTheme = 'light',
  languageCode = 'en',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(problem.title);
  const [markdownDraft, setMarkdownDraft] = useState(problem.markdown);
  const [timeLimitDraft, setTimeLimitDraft] = useState(problem.timeLimit);
  const [memoryLimitDraft, setMemoryLimitDraft] = useState(problem.memoryLimit);
  const [inputFileDraft, setInputFileDraft] = useState(problem.inputFile || '');
  const [outputFileDraft, setOutputFileDraft] = useState(problem.outputFile || '');

  const t = TRANSLATIONS[languageCode];

  // Sync draft when problem changes from outside (e.g. OCR)
  useEffect(() => {
    setTitleDraft(problem.title);
    setMarkdownDraft(problem.markdown);
    setTimeLimitDraft(problem.timeLimit);
    setMemoryLimitDraft(problem.memoryLimit);
    setInputFileDraft(problem.inputFile || '');
    setOutputFileDraft(problem.outputFile || '');
  }, [problem]);

  const handleSave = () => {
    onChangeProblem({
      ...problem,
      title: titleDraft.trim() || 'Untitled Problem',
      markdown: markdownDraft,
      timeLimit: timeLimitDraft > 0 ? timeLimitDraft : 1.0,
      memoryLimit: memoryLimitDraft > 0 ? memoryLimitDraft : 256,
      inputFile: inputFileDraft.trim() || undefined,
      outputFile: outputFileDraft.trim() || undefined,
    });
    setIsEditing(false);
  };

  return (
    <div className={`flex flex-col h-full min-h-0 rounded shadow-xs overflow-hidden border ${
      appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-[#d5d5d5]'
    }`}>
      {/* Panel Header */}
      <div className={`px-3 py-1.5 flex items-center justify-between shrink-0 border-b ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#333] text-gray-200' : 'bg-[#f5f5f5] border-[#ddd] text-gray-800'
      }`}>
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-[#337ab7]" />
          <span>{t.problemStatement}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenOcrModal}
            className="btn-classic btn-primary text-xs py-1 px-2"
            title={t.ocrImage}
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.ocrImage}</span>
          </button>

          {isEditing ? (
            <button
              onClick={handleSave}
              className="btn-classic btn-success text-xs py-1 px-2 font-semibold"
              title={t.save}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-classic btn-default text-xs py-1 px-2"
              title={t.editMarkdown}
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-500" />
              <span>{t.editMarkdown}</span>
            </button>
          )}

          {isEditing && (
            <button
              onClick={() => {
                setTitleDraft(problem.title);
                setMarkdownDraft(problem.markdown);
                setTimeLimitDraft(problem.timeLimit);
                setMemoryLimitDraft(problem.memoryLimit);
                setInputFileDraft(problem.inputFile || '');
                setOutputFileDraft(problem.outputFile || '');
                setIsEditing(false);
              }}
              className="btn-classic btn-default text-xs py-1 px-2"
              title={t.cancel}
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              <span>{t.cancel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel Body */}
      {isEditing ? (
        /* Edit Mode: Direct inline editor */
        <div className={`p-3 overflow-y-auto flex-1 min-h-0 flex flex-col space-y-2 ${
          appTheme === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-[#fdfdfd] text-gray-800'
        }`}>
          <div>
            <label className="text-[11px] font-bold block mb-1">
              {t.problemTitle}:
            </label>
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder="Problem Title..."
              className={`w-full border rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#337ab7] ${
                appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold block mb-1">
                {t.timeLimitSec}:
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={timeLimitDraft}
                onChange={(e) => setTimeLimitDraft(parseFloat(e.target.value) || 1.0)}
                className={`w-full border rounded px-2 py-1 text-xs font-mono ${
                  appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold block mb-1">
                {t.memoryLimitMb}:
              </label>
              <input
                type="number"
                step="16"
                min="16"
                max="2048"
                value={memoryLimitDraft}
                onChange={(e) => setMemoryLimitDraft(parseInt(e.target.value, 10) || 256)}
                className={`w-full border rounded px-2 py-1 text-xs font-mono ${
                  appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* File I/O Configuration (.INP / .OUT) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold block mb-1">
                {t.inputFileLabel}
              </label>
              <input
                type="text"
                value={inputFileDraft}
                onChange={(e) => setInputFileDraft(e.target.value)}
                placeholder="VD: BAI1.INP (Để trống = stdin)"
                className={`w-full border rounded px-2 py-1 text-xs font-mono ${
                  appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold block mb-1">
                {t.outputFileLabel}
              </label>
              <input
                type="text"
                value={outputFileDraft}
                onChange={(e) => setOutputFileDraft(e.target.value)}
                placeholder="VD: BAI1.OUT (Để trống = stdout)"
                className={`w-full border rounded px-2 py-1 text-xs font-mono ${
                  appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="flex-1 min-h-[160px] flex flex-col">
            <label className="text-[11px] font-bold mb-1 flex items-center justify-between">
              <span>{t.problemMarkdownLabel}</span>
              <span className="text-[10px] text-gray-400 font-normal">$N \le 10^5$, LaTeX...</span>
            </label>
            <textarea
              value={markdownDraft}
              onChange={(e) => setMarkdownDraft(e.target.value)}
              placeholder={t.pasteMarkdownPlaceholder}
              className={`w-full flex-1 border rounded p-2 text-xs font-mono focus:outline-none focus:border-[#337ab7] resize-none ${
                appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      ) : (
        /* View Mode: Rendered Markdown with KaTeX */
        <div className={`p-4 overflow-y-auto flex-1 min-h-0 space-y-3 text-xs leading-relaxed select-text ${
          appTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {/* Header Banner */}
          <div className={`border-b pb-2 ${appTheme === 'dark' ? 'border-[#333]' : 'border-gray-200'}`}>
            <h2 className={`text-base font-bold mb-1.5 ${appTheme === 'dark' ? 'text-white' : 'text-[#2c3e50]'}`}>
              {problem.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                appTheme === 'dark' ? 'bg-[#2d2d30] border-[#444] text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                <Clock className="w-3.5 h-3.5 text-[#337ab7]" /> {t.timeLimit}: <strong>{problem.timeLimit}s</strong>
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                appTheme === 'dark' ? 'bg-[#2d2d30] border-[#444] text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                <HardDrive className="w-3.5 h-3.5 text-[#337ab7]" /> {t.memoryLimit}: <strong>{problem.memoryLimit}MB</strong>
              </span>
              {problem.inputFile && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                  appTheme === 'dark' ? 'bg-[#18232c] border-[#224560] text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800 font-semibold'
                }`}>
                  <FileCode className="w-3.5 h-3.5 text-[#337ab7]" /> {problem.inputFile} &rarr; {problem.outputFile || 'stdout'}
                </span>
              )}
            </div>
          </div>

          {/* Full Markdown Rendering */}
          <div className={`prose prose-sm max-w-none text-xs space-y-2 ${
            appTheme === 'dark' ? 'text-gray-300 prose-invert' : 'text-gray-800'
          }`}>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {problem.markdown || t.emptyProblem}
            </ReactMarkdown>
          </div>

          {/* AI Solver Button / Active Generating State */}
          <div className={`pt-2 border-t ${appTheme === 'dark' ? 'border-[#333]' : 'border-gray-200'}`}>
            {isAiGeneratingSolution ? (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#337ab7]" />
                  <span className="font-medium">{t.aiGeneratingSolution}</span>
                </div>
                {onCancelAiSolution && (
                  <button
                    onClick={onCancelAiSolution}
                    className="btn-classic btn-danger text-[11px] py-0.5 px-2"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onGenerateAiSolution}
                className="w-full btn-classic btn-default text-xs py-1.5 text-[#337ab7] hover:text-[#23527c] border-dashed border-[#337ab7]/40 hover:border-[#337ab7]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f1c40f]" />
                <span>{t.aiWriteSolution}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
