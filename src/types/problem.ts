import type { Testcase } from './judge';

export interface ProblemStatement {
  title: string;
  markdown: string; // Toàn bộ nội dung đề bài dạng Markdown (chứa mô tả, input/output, ràng buộc, ví dụ)
  timeLimit: number; // in seconds, e.g. 1.0
  memoryLimit: number; // in MB, e.g. 256
  inputFile?: string; // Tên file input nếu dùng File I/O, e.g. "BAI1.INP"
  outputFile?: string; // Tên file output nếu dùng File I/O, e.g. "BAI1.OUT"
  sampleCases?: Testcase[];
}

export interface OcrResult {
  markdown: string;
  parsedProblem: ProblemStatement;
}
