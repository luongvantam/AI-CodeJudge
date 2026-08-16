import type { JudgeEngineConfig } from '../types/judge';
import type { ProblemStatement } from '../types/problem';
import type { LanguageCode } from '../constants/translations';

const STORAGE_KEYS = {
  GEMINI_API_KEY: 'ai_codejudge_gemini_api_key',
  GEMINI_MODEL: 'ai_codejudge_gemini_model',
  JUDGE_CONFIG: 'ai_codejudge_judge_config',
  SAVED_PROBLEM: 'ai_codejudge_saved_problem',
  SAVED_CODE: 'ai_codejudge_saved_code_prefix_',
  SELECTED_LANG: 'ai_codejudge_selected_lang',
  APP_LANGUAGE: 'ai_codejudge_app_lang',
  APP_THEME: 'ai_codejudge_app_theme',
  INCLUDE_AI_COMMENTS: 'ai_codejudge_include_ai_comments',
};

export function getStoredLanguage(): LanguageCode {
  const lang = localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
  return lang === 'vi' ? 'vi' : 'en'; // Default to 'en'
}

export function setStoredLanguage(lang: LanguageCode): void {
  localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
}

export function getStoredTheme(): 'light' | 'dark' {
  const theme = localStorage.getItem(STORAGE_KEYS.APP_THEME);
  return theme === 'dark' ? 'dark' : 'light';
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(STORAGE_KEYS.APP_THEME, theme);
}

export function getStoredIncludeComments(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INCLUDE_AI_COMMENTS) === 'true'; // default false
}

export function setStoredIncludeComments(val: boolean): void {
  localStorage.setItem(STORAGE_KEYS.INCLUDE_AI_COMMENTS, String(val));
}

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (key) {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
  }
}

export function getStoredModel(): string {
  return localStorage.getItem(STORAGE_KEYS.GEMINI_MODEL) || 'gemini-2.5-flash';
}

export function setStoredModel(model: string): void {
  localStorage.setItem(STORAGE_KEYS.GEMINI_MODEL, model);
}

export function getStoredJudgeConfig(): JudgeEngineConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JUDGE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading judge config from storage', e);
  }
  return {
    type: 'piston',
    pistonEndpoint: 'https://emkc.org/api/v2/piston',
    judge0Endpoint: 'https://ce.judge0.com',
  };
}

export function setStoredJudgeConfig(config: JudgeEngineConfig): void {
  localStorage.setItem(STORAGE_KEYS.JUDGE_CONFIG, JSON.stringify(config));
}

export function getStoredProblem(): ProblemStatement | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROBLEM);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved problem', e);
  }
  return null;
}

export function setStoredProblem(problem: ProblemStatement): void {
  localStorage.setItem(STORAGE_KEYS.SAVED_PROBLEM, JSON.stringify(problem));
}

export function getStoredCode(langId: string): string | null {
  return localStorage.getItem(`${STORAGE_KEYS.SAVED_CODE}${langId}`);
}

export function setStoredCode(langId: string, code: string): void {
  localStorage.setItem(`${STORAGE_KEYS.SAVED_CODE}${langId}`, code);
}

export function getStoredSelectedLang(): string {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_LANG) || 'cpp20';
}

export function setStoredSelectedLang(langId: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_LANG, langId);
}
