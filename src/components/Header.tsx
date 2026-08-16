import React, { useState, useRef, useEffect } from 'react';
import { Key, Server, HelpCircle, Code2, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import type { JudgeEngineConfig } from '../types/judge';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface HeaderProps {
  apiKey: string;
  onOpenApiKeyModal: () => void;
  judgeConfig: JudgeEngineConfig;
  onOpenJudgeConfigModal: () => void;
  onOpenHelpModal: () => void;
  appTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  languageCode: LanguageCode;
  onToggleLanguage: () => void;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  apiKey,
  onOpenApiKeyModal,
  judgeConfig,
  onOpenJudgeConfigModal,
  onOpenHelpModal,
  appTheme,
  onToggleTheme,
  languageCode,
  onToggleLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasKey = Boolean(apiKey && apiKey.trim().length > 5);
  const t = TRANSLATIONS[languageCode];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-[#2c3e50] text-white border-b border-[#1a252f] px-3 md:px-4 py-2 flex items-center justify-between shadow-sm select-none relative z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-[#34495e] px-2 py-1 rounded border border-[#4a627a]">
          <Code2 className="w-4 h-4 text-[#3498db]" />
          <span className="font-bold text-sm md:text-base tracking-wide text-white">AI CodeJudge</span>
        </div>
        <span className="text-xs text-gray-300 hidden lg:inline font-normal">
          {t.brandTag}
        </span>
      </div>

      {/* Desktop Navigation Actions */}
      <div className="hidden md:flex items-center gap-2">
        {/* GitHub Repository Link */}
        <a
          href="https://github.com/luongvantam/ai-codejudge"
          target="_blank"
          rel="noreferrer"
          className="btn-classic bg-[#34495e] hover:bg-[#415b76] text-gray-200 border-[#4e6d8d] text-xs py-1 px-2 flex items-center gap-1.5"
          title="GitHub: luongvantam/ai-codejudge"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          <span className="font-medium">GitHub</span>
        </a>

        {/* Language Switcher Button */}
        <button
          onClick={onToggleLanguage}
          className="btn-classic bg-[#34495e] hover:bg-[#415b76] text-gray-200 border-[#4e6d8d] text-xs py-1 px-2 font-bold"
          title={languageCode === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
        >
          <Globe className="w-3.5 h-3.5 text-[#5bc0de]" />
          <span className="uppercase">{languageCode}</span>
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="btn-classic bg-[#34495e] hover:bg-[#415b76] text-gray-200 border-[#4e6d8d] text-xs py-1 px-2"
          title={appTheme === 'dark' ? t.themeLight : t.themeDark}
        >
          {appTheme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-200" />
          )}
        </button>

        {/* Gemini API Key Button */}
        <button
          onClick={onOpenApiKeyModal}
          className={`btn-classic text-xs py-1 px-2.5 ${hasKey
            ? 'bg-[#27ae60] hover:bg-[#219150] text-white border-[#1e8449]'
            : 'bg-[#e67e22] hover:bg-[#d35400] text-white border-[#b94a00] animate-pulse'
            }`}
          title={hasKey ? t.geminiKeyOk : t.enterGeminiKey}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{hasKey ? t.geminiKeyOk : t.enterGeminiKey}</span>
          <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-300' : 'bg-red-200'}`} />
        </button>

        {/* Judge Engine Config Button */}
        <button
          onClick={onOpenJudgeConfigModal}
          className="btn-classic bg-[#34495e] hover:bg-[#415b76] text-gray-200 border-[#4e6d8d] text-xs py-1 px-2.5"
          title={t.engine}
        >
          <Server className="w-3.5 h-3.5 text-[#3498db]" />
          <span>{t.engine}:</span>
          <span className="font-mono font-semibold uppercase">{judgeConfig.type}</span>
        </button>

        {/* Help / Docs */}
        <button
          onClick={onOpenHelpModal}
          className="btn-classic bg-[#34495e] hover:bg-[#415b76] text-gray-200 border-[#4e6d8d] text-xs py-1 px-2"
          title={t.help}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile Hamburger / Options Button */}
      <div className="flex md:hidden items-center gap-1.5" ref={menuRef}>
        {/* GitHub link */}
        <a
          href="https://github.com/luongvantam/ai-codejudge"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 bg-[#34495e] text-white rounded border border-[#4a627a]"
          title="GitHub"
        >
          <GithubIcon className="w-3.5 h-3.5" />
        </a>

        {/* Language switcher */}
        <button
          onClick={onToggleLanguage}
          className="px-2 py-1 bg-[#34495e] text-white text-[11px] font-bold rounded border border-[#4a627a]"
        >
          {languageCode.toUpperCase()}
        </button>

        {/* Theme switcher */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 bg-[#34495e] text-white rounded border border-[#4a627a]"
        >
          {appTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Quick API status dot */}
        <button
          onClick={onOpenApiKeyModal}
          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded font-semibold border ${hasKey
            ? 'bg-[#27ae60] text-white border-[#1e8449]'
            : 'bg-[#e67e22] text-white border-[#b94a00]'
            }`}
        >
          <Key className="w-3 h-3" />
          <span>{hasKey ? 'API OK' : 'Key'}</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 bg-[#34495e] hover:bg-[#415b76] text-white rounded border border-[#4a627a]"
          title={t.menu}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Vertical Mobile Navbar Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute right-3 top-12 w-64 bg-[#2c3e50] border border-[#4a627a] rounded shadow-2xl py-2 z-50 text-xs flex flex-col space-y-1">
            <button
              onClick={() => {
                onOpenApiKeyModal();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left hover:bg-[#34495e] flex items-center justify-between text-gray-100"
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#2ecc71]" />
                <span className="font-semibold">{t.settingsTitle}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${hasKey ? 'bg-green-600' : 'bg-red-600'}`}>
                {hasKey ? 'OK' : 'No key'}
              </span>
            </button>

            <button
              onClick={() => {
                onOpenJudgeConfigModal();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left hover:bg-[#34495e] flex items-center justify-between text-gray-100 border-t border-[#3b5168]"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#3498db]" />
                <span>{t.engine}</span>
              </div>
              <span className="font-mono text-[11px] uppercase bg-gray-700 px-1 rounded text-gray-300">
                {judgeConfig.type}
              </span>
            </button>

            <a
              href="https://github.com/luongvantam/ai-codejudge"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-left hover:bg-[#34495e] flex items-center gap-2 text-gray-100 border-t border-[#3b5168]"
            >
              <GithubIcon className="w-4 h-4 text-gray-300" />
              <span>GitHub: luongvantam/ai-codejudge</span>
            </a>

            <button
              onClick={() => {
                onOpenHelpModal();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left hover:bg-[#34495e] flex items-center gap-2 text-gray-100 border-t border-[#3b5168]"
            >
              <HelpCircle className="w-4 h-4 text-blue-300" />
              <span>{t.help}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
