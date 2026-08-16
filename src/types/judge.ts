export type Verdict =
  | 'PENDING'
  | 'RUNNING'
  | 'AC'  // Accepted
  | 'WA'  // Wrong Answer
  | 'TLE' // Time Limit Exceeded
  | 'MLE' // Memory Limit Exceeded
  | 'RTE' // Runtime Error
  | 'CE'; // Compilation Error

export interface LanguageConfig {
  id: string;
  name: string;
  category: 'C/C++' | 'Python' | 'Pascal' | 'Other';
  monacoLang: string;
  extension: string;
  // Piston API mapping
  piston: {
    language: string;
    version?: string;
  };
  // Judge0 API language ID
  judge0Id: number;
  boilerplate: string;
}

export interface Testcase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  isSample?: boolean;
  type?: 'sample' | 'edge' | 'random' | 'stress' | 'tricky' | 'custom';
  description?: string;
}

export interface TestcaseResult {
  testcaseId: string;
  testcaseName: string;
  verdict: Verdict;
  timeMs: number;
  memoryKb: number;
  actualOutput: string;
  expectedOutput: string;
  input: string;
  errorMessage?: string;
  compileError?: string;
  diffSummary?: string;
  exitCode?: number;
}

export interface JudgeSummaryStats {
  total: number;
  passed: number;
  verdict: Verdict;
  maxTimeMs: number;
  peakMemoryKb: number;
  score: number; // percentage 0 - 100
}

export type JudgeEngineType = 'piston' | 'judge0' | 'custom';

export interface JudgeEngineConfig {
  type: JudgeEngineType;
  pistonEndpoint?: string;
  judge0Endpoint?: string;
  judge0ApiKey?: string;
}
