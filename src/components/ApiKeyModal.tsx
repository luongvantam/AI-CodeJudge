import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle, RefreshCw, Server, ExternalLink, Code2 } from 'lucide-react';
import { testApiKey } from '../services/geminiService';
import type { JudgeEngineConfig } from '../types/judge';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  model: string;
  onSaveModel: (model: string) => void;
  judgeConfig: JudgeEngineConfig;
  onSaveJudgeConfig: (config: JudgeEngineConfig) => void;
  includeComments: boolean;
  onSaveIncludeComments: (include: boolean) => void;
  languageCode?: LanguageCode;
  appTheme?: 'light' | 'dark';
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast & Reliable' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'High Accuracy' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'High Performance' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', desc: 'Ultra Fast' },
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  model,
  onSaveModel,
  judgeConfig,
  onSaveJudgeConfig,
  includeComments,
  onSaveIncludeComments,
  languageCode = 'en',
  appTheme = 'light',
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState(model || 'gemini-2.5-flash');
  const [customModel, setCustomModel] = useState('');
  const [isCustomModel, setIsCustomModel] = useState(
    !AVAILABLE_MODELS.some((m) => m.id === model) && Boolean(model)
  );

  const [commentsOption, setCommentsOption] = useState<boolean>(includeComments);
  const [engineType, setEngineType] = useState<JudgeEngineConfig['type']>(judgeConfig.type);
  const [pistonUrl, setPistonUrl] = useState(judgeConfig.pistonEndpoint || 'https://emkc.org/api/v2/piston');
  const [judge0Url, setJudge0Url] = useState(judgeConfig.judge0Endpoint || 'https://ce.judge0.com');
  const [judge0ApiKey, setJudge0ApiKey] = useState(judgeConfig.judge0ApiKey || '');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const t = TRANSLATIONS[languageCode];

  if (!isOpen) return null;

  const currentActiveModel = isCustomModel ? customModel.trim() || 'gemini-2.5-flash' : selectedModel;

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API Key first!' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await testApiKey(inputKey.trim(), currentActiveModel);
      setTestResult({ success: true, message: `${t.keyValid} (${currentActiveModel})` });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || `${t.keyInvalid}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    onSaveModel(currentActiveModel);
    onSaveIncludeComments(commentsOption);
    onSaveJudgeConfig({
      type: engineType,
      pistonEndpoint: pistonUrl.trim(),
      judge0Endpoint: judge0Url.trim(),
      judge0ApiKey: judge0ApiKey.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className={`border rounded shadow-xl w-full max-w-lg overflow-hidden text-sm ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#444] text-gray-200' : 'bg-white border-[#999] text-gray-800'
      }`}>
        {/* Modal Header */}
        <div className="bg-[#337ab7] text-white px-4 py-2.5 flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span>{t.settingsTitle}</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Gemini API Key Section */}
          <div className={`p-3 rounded space-y-3 border ${
            appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f9f9f9] border-[#e5e5e5]'
          }`}>
            <div className="flex items-center justify-between">
              <label className="font-semibold flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#337ab7]" />
                {t.geminiKeyLabel}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#337ab7] hover:underline flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className={`w-full border rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#337ab7] ${
                appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
              }`}
            />

            {/* Model Selection */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">{t.modelSelectLabel}</label>
                <button
                  type="button"
                  onClick={() => setIsCustomModel(!isCustomModel)}
                  className="text-[11px] text-[#337ab7] hover:underline"
                >
                  {isCustomModel ? t.useStandardModelList : t.customModelLabel}
                </button>
              </div>

              {isCustomModel ? (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder={t.customModelPrompt}
                  className={`w-full border rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#337ab7] ${
                    appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                  }`}
                />
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`w-full border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#337ab7] ${
                    appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.desc})
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleTestKey}
                disabled={testing}
                className="w-full btn-classic btn-default text-xs py-1.5 mt-1"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing {currentActiveModel}...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#337ab7]" />
                    <span>{t.testKeyBtn} ({currentActiveModel})</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                  testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* AI Solution Comments Toggle Option */}
          <div className={`p-3 rounded border space-y-1.5 ${
            appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f9f9f9] border-[#e5e5e5]'
          }`}>
            <label className="font-semibold flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={commentsOption}
                onChange={(e) => setCommentsOption(e.target.checked)}
                className="w-4 h-4 accent-[#337ab7]"
              />
              <Code2 className="w-4 h-4 text-[#337ab7]" />
              <span>{t.solutionCommentsLabel}</span>
            </label>
            <p className="text-[11px] text-gray-500 pl-6">
              {t.solutionCommentsDesc}
            </p>
          </div>

          {/* Execution Sandbox Engine Section */}
          <div className={`p-3 rounded space-y-3 border ${
            appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f9f9f9] border-[#e5e5e5]'
          }`}>
            <label className="font-semibold flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#337ab7]" />
              {t.judgeEngineTitle}
            </label>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="engineType"
                  value="piston"
                  checked={engineType === 'piston'}
                  onChange={() => setEngineType('piston')}
                />
                <span className="font-medium">Piston API (Default)</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="engineType"
                  value="judge0"
                  checked={engineType === 'judge0'}
                  onChange={() => setEngineType('judge0')}
                />
                <span className="font-medium">Judge0 CE API</span>
              </label>
            </div>

            {engineType === 'piston' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Piston Endpoint URL:</label>
                <input
                  type="text"
                  value={pistonUrl}
                  onChange={(e) => setPistonUrl(e.target.value)}
                  placeholder="https://emkc.org/api/v2/piston"
                  className={`w-full border rounded px-2.5 py-1 text-xs font-mono ${
                    appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  {t.pistonDesc}
                </p>
              </div>
            )}

            {engineType === 'judge0' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Judge0 Endpoint URL:</label>
                  <input
                    type="text"
                    value={judge0Url}
                    onChange={(e) => setJudge0Url(e.target.value)}
                    placeholder="https://ce.judge0.com"
                    className={`w-full border rounded px-2.5 py-1 text-xs font-mono ${
                      appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">RapidAPI / Auth Token (optional):</label>
                  <input
                    type="password"
                    value={judge0ApiKey}
                    onChange={(e) => setJudge0ApiKey(e.target.value)}
                    placeholder="Leave blank for public CE"
                    className={`w-full border rounded px-2.5 py-1 text-xs font-mono ${
                      appTheme === 'dark' ? 'bg-[#2d2d30] border-[#555] text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-end gap-2 ${
          appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f5f5f5] border-[#ddd]'
        }`}>
          <button onClick={onClose} className="btn-classic btn-default text-xs">
            {t.cancel}
          </button>
          <button onClick={handleSave} className="btn-classic btn-primary text-xs">
            {t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
};
