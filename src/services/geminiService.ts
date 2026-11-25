import { OCR_SYSTEM_PROMPT, DIFFERENTIAL_TEST_PROMPT } from '../constants/prompts';
import type { Testcase } from '../types/judge';
import type { ProblemStatement } from '../types/problem';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Remove comments from source code
 */
function stripComments(code: string, language: string): string {
  const langLower = language.toLowerCase();
  let cleaned = code;

  if (
    langLower.includes('c') ||
    langLower.includes('cpp') ||
    langLower.includes('c++') ||
    langLower.includes('java') ||
    langLower.includes('rust') ||
    langLower.includes('go') ||
    langLower.includes('javascript') ||
    langLower.includes('typescript')
  ) {
    // Remove multi-line comments /* ... */
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove single-line comments // ...
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
  } else if (langLower.includes('python') || langLower.includes('pypy')) {
    // Remove triple-quote docstrings if isolated
    cleaned = cleaned.replace(/'''[\s\S]*?'''/g, '');
    cleaned = cleaned.replace(/"""[\s\S]*?"""/g, '');
    // Remove # comments
    cleaned = cleaned.replace(/#.*$/gm, '');
  } else if (langLower.includes('pascal')) {
    // Remove { ... } and (* ... *) and // ...
    cleaned = cleaned.replace(/\{[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/\(\*[\s\S]*?\*\)/g, '');
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
  }

  // Remove excessive blank lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  return cleaned.trim();
}

/**
 * Unescape string helper for regex parsed JSON fragments
 */
function unescapeJsonString(str: string): string {
  try {
    return JSON.parse(`"${str}"`);
  } catch {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
}

/**
 * Sanitize raw JSON text by escaping literal unescaped control characters inside string literals
 */
function sanitizeJsonStringLiterals(raw: string): string {
  let inString = false;
  let isEscaped = false;
  let out = '';

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];

    if (inString) {
      if (isEscaped) {
        out += char;
        isEscaped = false;
      } else if (char === '\\') {
        out += char;
        isEscaped = true;
      } else if (char === '"') {
        out += char;
        inString = false;
      } else if (char === '\n') {
        out += '\\n';
      } else if (char === '\r') {
        out += '\\r';
      } else if (char === '\t') {
        out += '\\t';
      } else if (char.charCodeAt(0) < 32) {
        out += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
      } else {
        out += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      out += char;
    }
  }

  if (inString) {
    out += '"';
  }

  return out;
}

/**
 * Repair trailing commas and unclosed brackets/braces
 */
function repairJsonStructure(text: string): string {
  let cleaned = text.replace(/,\s*([\]}])/g, '$1');

  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (inString) {
      if (isEscaped) isEscaped = false;
      else if (c === '\\') isEscaped = true;
      else if (c === '"') inString = false;
    } else {
      if (c === '"') inString = true;
      else if (c === '{') openBraces++;
      else if (c === '}') openBraces = Math.max(0, openBraces - 1);
      else if (c === '[') openBrackets++;
      else if (c === ']') openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  while (openBrackets > 0) {
    cleaned += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    cleaned += '}';
    openBraces--;
  }

  return cleaned;
}

/**
 * Fallback regex extractor for individual testcase objects
 */
export function extractTestcasesWithRegex(rawText: string): any[] {
  const tests: any[] = [];
  if (!rawText) return tests;

  // 1. Try to find all object blocks { ... } containing input or output fields
  const objectRegex = /\{[^{}]*"(?:input|expectedOutput|output)"[^{}]*\}/gs;
  let match: RegExpExecArray | null;

  while ((match = objectRegex.exec(rawText)) !== null) {
    const block = match[0];
    try {
      const sanitized = sanitizeJsonStringLiterals(block);
      const repaired = repairJsonStructure(sanitized);
      const obj = JSON.parse(repaired);
      if (obj.input !== undefined || obj.expectedOutput !== undefined || obj.output !== undefined) {
        tests.push(obj);
        continue;
      }
    } catch {}

    // Regex property extraction as sub-fallback
    const nameMatch = block.match(/"name"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    const typeMatch = block.match(/"type"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    const inputMatch = block.match(/"input"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    const outputMatch = block.match(/"(?:expectedOutput|output)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    const descMatch = block.match(/"description"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);

    if (inputMatch || outputMatch) {
      tests.push({
        name: nameMatch ? unescapeJsonString(nameMatch[1]) : `Test ${tests.length + 1}`,
        type: typeMatch ? typeMatch[1] : 'sample',
        input: inputMatch ? unescapeJsonString(inputMatch[1]) : '',
        expectedOutput: outputMatch ? unescapeJsonString(outputMatch[1]) : '',
        description: descMatch ? unescapeJsonString(descMatch[1]) : '',
      });
    }
  }

  return tests;
}

/**
 * Robust extractor for JSON strings returned from AI
 */
function extractJsonFromResponse(text: string): any {
  if (!text || typeof text !== 'string') {
    throw new Error('Không nhận được phản hồi từ AI.');
  }

  let cleanText = text.trim();

  // Remove markdown code fences if present (e.g. ```json ... ``` or ``` ...)
  cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. Try direct parse first
  try {
    return JSON.parse(cleanText);
  } catch {}

  // 2. Sanitize string literals & trailing commas
  try {
    const sanitized = sanitizeJsonStringLiterals(cleanText);
    const repaired = repairJsonStructure(sanitized);
    return JSON.parse(repaired);
  } catch {}

  // 3. Find bounding braces { ... } or [ ... ]
  const firstBrace = cleanText.indexOf('{');
  const firstBracket = cleanText.indexOf('[');
  
  let startIndex = -1;
  let endIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = cleanText.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = cleanText.lastIndexOf(']');
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const jsonSubStr = cleanText.slice(startIndex, endIndex + 1);
    try {
      return JSON.parse(jsonSubStr);
    } catch {}

    try {
      const sanitizedSub = sanitizeJsonStringLiterals(jsonSubStr);
      const repairedSub = repairJsonStructure(sanitizedSub);
      return JSON.parse(repairedSub);
    } catch {}
  }

  // 4. Try regex testcase fallback
  const fallbackTests = extractTestcasesWithRegex(cleanText);
  if (fallbackTests.length > 0) {
    return { testcases: fallbackTests };
  }

  throw new Error(`Dữ liệu JSON từ AI không đúng định dạng. Chi tiết: ${text.slice(0, 150)}...`);
}

/**
 * Test Gemini API Key
 */
export async function testApiKey(apiKey: string, model: string = 'gemini-2.5-flash'): Promise<boolean> {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey.trim()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Ping test. Reply with: OK' }] }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Lỗi kết nối Gemini API (${response.status})`);
  }
  return true;
}

/**
 * OCR problem statement from image
 */
export async function ocrProblemImage(
  apiKey: string,
  base64Data: string,
  mimeType: string = 'image/png',
  model: string = 'gemini-2.5-flash',
  onProgress?: (status: string, percent: number) => void,
  signal?: AbortSignal
): Promise<{ rawMarkdown: string; problem: ProblemStatement }> {
  onProgress?.('Đang gửi ảnh lên Gemini Vision...', 25);
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey.trim()}`;

  const cleanBase64 = base64Data.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');

  const payload = {
    contents: [
      {
        parts: [
          { text: OCR_SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  onProgress?.('Đang nhận diện văn bản & công thức toán LaTeX...', 60);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi OCR hình ảnh (${response.status})`);
  }

  onProgress?.('Đang hoàn thiện nội dung Markdown...', 90);

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const parsed = extractJsonFromResponse(rawText);

  const sampleCases: Testcase[] = (parsed.sampleCases || []).map((sc: any, index: number) => ({
    id: `sample-${index + 1}`,
    name: sc.name || `Sample ${index + 1}`,
    input: (sc.input || '').toString().trim(),
    expectedOutput: (sc.expectedOutput || '').toString().trim(),
    isSample: true,
    type: 'sample',
    description: sc.description || 'Test ví dụ từ đề bài',
  }));

  const problem: ProblemStatement = {
    title: parsed.title || 'Bài toán trích xuất từ ảnh',
    timeLimit: parseFloat(parsed.timeLimit) || 1.0,
    memoryLimit: parseInt(parsed.memoryLimit, 10) || 256,
    markdown: parsed.markdown || rawText,
    sampleCases: sampleCases,
  };

  onProgress?.('Hoàn tất!', 100);
  return { rawMarkdown: rawText, problem };
}

export interface DifferentialTestSuite {
  referenceCode: string;
  inputGeneratorJs: string;
}

const RANDOM_HELPERS = {
  randInt(min: number, max: number): number {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  },
  randFloat(min: number, max: number, decimals: number = 2): number {
    const val = Math.random() * (max - min) + min;
    return Number(val.toFixed(decimals));
  },
  randArray(len: number, min: number, max: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(RANDOM_HELPERS.randInt(min, max));
    }
    return arr;
  },
  randPermutation(n: number, oneIndexed: boolean = true): number[] {
    const arr = Array.from({ length: n }, (_, i) => (oneIndexed ? i + 1 : i));
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
  randString(len: number, alphabet: string = 'abcdefghijklmnopqrstuvwxyz'): string {
    let out = '';
    for (let i = 0; i < len; i++) {
      out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return out;
  },
  randTree(n: number, oneIndexed: boolean = true): Array<[number, number]> {
    const perm = RANDOM_HELPERS.randPermutation(n, oneIndexed);
    const edges: Array<[number, number]> = [];
    for (let i = 1; i < n; i++) {
      const parentIdx = Math.floor(Math.random() * i);
      edges.push([perm[parentIdx], perm[i]]);
    }
    return edges;
  },
  choice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  },
};

/**
 * Execute the AI-authored JS random input generator locally to produce genuine random subtests
 */
export function runRandomInputGenerator(
  inputGeneratorJs: string,
  count: number,
  languageCode: 'en' | 'vi' = 'vi'
): Testcase[] {
  let body = (inputGeneratorJs || '').trim();
  // Strip accidental markdown fences
  body = body.replace(/^```(?:js|javascript)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // If AI wrapped it in `function ...(testIndex, totalTests, helpers) { ... }`, invoke it
  const isNamedOrArrowFunc = /^(?:function\b|\([^)]*\)\s*=>)/.test(body);
  const fn = isNamedOrArrowFunc
    ? (new Function('testIndex', 'totalTests', 'helpers', `const __gen = ${body}; return __gen(testIndex, totalTests, helpers);`) as (
        testIndex: number,
        totalTests: number,
        helpers: typeof RANDOM_HELPERS
      ) => unknown)
    : (new Function('testIndex', 'totalTests', 'helpers', body) as (
        testIndex: number,
        totalTests: number,
        helpers: typeof RANDOM_HELPERS
      ) => unknown);

  const stamp = Date.now();
  const tests: Testcase[] = [];

  for (let i = 0; i < count; i++) {
    const raw = fn(i, count, RANDOM_HELPERS);
    const inputStr = (raw === undefined || raw === null ? '' : String(raw)).trim();
    const type: Testcase['type'] = i === 0 ? 'edge' : i === count - 1 ? 'stress' : 'random';
    const labelPrefix = type === 'edge' ? 'Edge' : type === 'stress' ? 'Stress' : 'Random';

    tests.push({
      id: `rand-${stamp}-${i + 1}`,
      name: `${labelPrefix} #${i + 1}`,
      input: inputStr,
      expectedOutput: '',
      type,
      isSample: false,
      description:
        languageCode === 'vi'
          ? 'Subtest random (đối chứng Code AI vs Code bạn)'
          : 'Random subtest (AI Code vs Your Code)',
    });
  }

  return tests;
}

/**
 * Generate AI reference solution code + JS random input generator
 */
export async function generateDifferentialTestSuite(
  apiKey: string,
  problem: ProblemStatement,
  language: string = 'C++17 (GCC)',
  count: number = 10,
  customInstructions?: string,
  model: string = 'gemini-2.5-flash',
  includeComments: boolean = false,
  onProgress?: (status: string, percent: number) => void,
  signal?: AbortSignal
): Promise<DifferentialTestSuite> {
  onProgress?.('Đang gửi yêu cầu AI viết Code chuẩn & Bộ sinh Random...', 20);
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey.trim()}`;

  const prompt = DIFFERENTIAL_TEST_PROMPT(
    problem.title,
    problem.markdown,
    problem.timeLimit,
    problem.memoryLimit,
    language,
    count,
    includeComments,
    customInstructions
  );

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  onProgress?.('Gemini đang viết Code lời giải & hàm Random Input...', 55);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi tạo Code AI & bộ sinh random (${response.status})`);
  }

  onProgress?.('Đang giải mã Code AI & khởi tạo subtest random...', 85);

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const parsed = extractJsonFromResponse(rawText);

  let referenceCode = String(parsed?.referenceCode || '').trim();
  const codeMatch = referenceCode.match(/```[a-z0-9_+-]*\s*([\s\S]*?)\s*```/i);
  if (codeMatch) referenceCode = codeMatch[1].trim();

  if (!includeComments && referenceCode) {
    referenceCode = stripComments(referenceCode, language);
  }

  const inputGeneratorJs = String(parsed?.inputGeneratorJs || '').trim();

  if (!referenceCode) {
    throw new Error('AI không trả về mã nguồn lời giải (referenceCode).');
  }
  if (!inputGeneratorJs) {
    throw new Error('AI không trả về hàm sinh input ngẫu nhiên (inputGeneratorJs).');
  }

  onProgress?.('Hoàn tất viết Code AI & bộ sinh Random!', 100);
  return { referenceCode, inputGeneratorJs };
}

/**
 * Generate reference solution with optional comments based on user preference
 */
export async function generateReferenceSolution(
  apiKey: string,
  problem: ProblemStatement,
  language: string = 'cpp',
  model: string = 'gemini-2.5-flash',
  includeComments: boolean = false,
  onProgress?: (status: string, percent: number) => void,
  signal?: AbortSignal
): Promise<string> {
  onProgress?.('Đang kết nối AI...', 30);
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey.trim()}`;

  const commentRule = includeComments
    ? 'Thêm các chú thích (comments) ngắn gọn, rõ ràng giải thích ý tưởng chính và các bước giải thuật trong code.'
    : 'TUYỆT ĐỐI KHÔNG VIẾT BẤT CỨ DÒNG COMMENT NÀO (Không dùng //, /* */, #, ...) TRONG MÃ NGUỒN. Chỉ viết thuần code thực thi sạch sẽ.';

  const prompt = `Viết mã nguồn giải thuật chuẩn xác và tối ưu bằng ngôn ngữ ${language} cho bài toán Competitive Programming sau:

Tiêu đề: ${problem.title}
Giới hạn: ${problem.timeLimit}s, ${problem.memoryLimit}MB
Nội dung đề bài:
"""
${problem.markdown}
"""

QUY TẮC BẮT BUỘC:
1. ${commentRule}
2. Chỉ trả về duy nhất khối mã nguồn (\`\`\`${language} ... \`\`\`), không kèm lời chào hay bất kỳ văn bản giải thích nào ngoài khối code.
3. Áp dụng Fast I/O và xử lý kiểu dữ liệu tránh tràn số.`;

  onProgress?.('Đang viết mã nguồn giải thuật...', 70);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
      },
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi sinh lời giải (${response.status})`);
  }

  onProgress?.('Hoàn tất mã nguồn!', 100);
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = rawText.match(/```[a-z0-9_+-]*\s*([\s\S]*?)\s*```/i);
  const codeContent = match ? match[1].trim() : rawText.trim();

  // If comments are not requested, enforce clean stripping
  return includeComments ? codeContent : stripComments(codeContent, language);
}

export interface CodeDiagnosticError {
  line: number;
  column?: number;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface CodeFixResult {
  errors: CodeDiagnosticError[];
  explanation: string;
  fixedCode: string;
}

/**
 * Robust parser for AI Fix Code response to accurately extract fixedCode, explanation and errors
 */
function parseCodeFixResponse(rawText: string, originalCode: string): CodeFixResult {
  // Clean fences if rawText itself is fenced
  const unfenced = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. Try standard JSON extraction
  try {
    const parsed = JSON.parse(unfenced);
    if (parsed && typeof parsed === 'object') {
      const errors: CodeDiagnosticError[] = Array.isArray(parsed.errors)
        ? parsed.errors.map((e: any) => ({
            line: typeof e.line === 'number' ? e.line : 1,
            column: typeof e.column === 'number' ? e.column : 1,
            message: String(e.message || 'Syntax or logic issue'),
            severity: e.severity === 'warning' ? 'warning' : 'error',
          }))
        : [];

      let fixed = String(parsed.fixedCode || originalCode).trim();
      // If fixedCode has code fence inside, strip it
      const match = fixed.match(/```[a-z0-9_+-]*\s*([\s\S]*?)\s*```/i);
      if (match) fixed = match[1].trim();

      return {
        errors,
        explanation: String(parsed.explanation || '').trim(),
        fixedCode: fixed,
      };
    }
  } catch (err) {
    console.warn('Direct JSON.parse failed, using specialized regex extraction...', err);
  }

  // 2. Fallback: Regex extraction for "fixedCode"
  let fixedCode = originalCode;
  const fixedCodeRegex = /"fixedCode"\s*:\s*"((?:[^"\\]|\\.)*)"/s;
  const fixedMatch = unfenced.match(fixedCodeRegex);
  if (fixedMatch && fixedMatch[1]) {
    try {
      fixedCode = JSON.parse(`"${fixedMatch[1]}"`);
    } catch (_) {
      fixedCode = fixedMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\t/g, '\t');
    }
  } else {
    // Check if there is a markdown code block ```cpp ... ```
    const fence = unfenced.match(/```[a-z0-9_+-]*\s*([\s\S]*?)```/i);
    if (fence && fence[1].trim().length > 5) {
      fixedCode = fence[1].trim();
    }
  }

  // Strip code block fences if any
  const codeBlockMatch = fixedCode.match(/```[a-z0-9_+-]*\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    fixedCode = codeBlockMatch[1].trim();
  }

  // 3. Fallback: Regex extraction for "explanation"
  let explanation = '';
  const explRegex = /"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/s;
  const explMatch = unfenced.match(explRegex);
  if (explMatch && explMatch[1]) {
    try {
      explanation = JSON.parse(`"${explMatch[1]}"`);
    } catch (_) {
      explanation = explMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
  }

  // 4. Fallback: Regex extraction for errors
  const errors: CodeDiagnosticError[] = [];
  const lineMatches = unfenced.matchAll(/["']?line["']?\s*:\s*(\d+)[\s\S]*?["']?message["']?\s*:\s*["']([^"']+)["']/gi);
  for (const m of lineMatches) {
    errors.push({
      line: parseInt(m[1], 10),
      message: m[2],
      severity: 'error',
    });
  }

  return {
    errors,
    explanation: explanation || 'Mã nguồn đã được phân tích và kiểm tra tối ưu.',
    fixedCode: fixedCode.trim(),
  };
}

/**
 * AI Code Fix & Debug Agent: Analyzes code, pinpoints syntax/runtime bugs and repairs the source code
 */
export async function diagnoseAndFixCode(
  apiKey: string,
  code: string,
  language: string,
  problem: ProblemStatement,
  compilerError?: string,
  failedTestInfo?: { input: string; expectedOutput: string; actualOutput: string },
  model: string = 'gemini-2.5-flash',
  includeComments: boolean = false,
  languageCode: 'en' | 'vi' = 'en',
  signal?: AbortSignal
): Promise<CodeFixResult> {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey.trim()}`;

  const commentRule = includeComments
    ? 'Có thể giữ hoặc thêm comment giải thích ngắn gọn.'
    : 'TUYỆT ĐỐI KHÔNG VIẾT BẤT KỲ DÒNG COMMENT NÀO (Không dùng //, /* */, #) TRONG MÃ NGUỒN ĐÃ SỬA. Chỉ viết thuần code thực thi sạch sẽ.';

  const langInstruction = languageCode === 'vi'
    ? 'Viết toàn bộ phần giải thích (explanation) bằng TIẾNG VIỆT tự nhiên, rõ ràng, phân tích thuật toán chuẩn.'
    : 'Write the entire explanation in clear, natural ENGLISH.';

  const prompt = `Bạn là một Compiler Engineer & Trợ Lý AI Chuyên Sửa Lỗi Lập Trình Thi Đấu (Competitive Programming Code Fix Agent).
Nhiệm vụ của bạn là phân tích mã nguồn hiện tại của người dùng, xác định chính xác các vị trí lỗi (cú pháp, kiểu dữ liệu, tràn số 64-bit, lỗi logic, lỗi I/O) và tạo ra bản vá mã nguồn hoàn chỉnh đã sửa lỗi.

NGÔN NGỮ GIẢI THÍCH:
${langInstruction}

ĐỀ BÀI:
Tiêu đề: ${problem.title}
Giới hạn: ${problem.timeLimit}s, ${problem.memoryLimit}MB
Nội dung:
"""
${problem.markdown}
"""

MÃ NGUỒN CỦA NGƯỜI DÙNG (${language}):
\`\`\`${language}
${code}
\`\`\`

${compilerError ? `THÔNG ĐIỆP LỖI TỪ TRÌNH BIÊN DỊCH (Compiler Output):\n"""\n${compilerError}\n"""\n` : ''}
${failedTestInfo ? `TEST CASE BỊ SAI:\nInput:\n${failedTestInfo.input}\nĐáp án mong đợi:\n${failedTestInfo.expectedOutput}\nKết quả thực tế của code:\n${failedTestInfo.actualOutput}\n` : ''}

QUY TẮC:
1. Xác định số dòng (line number - 1-indexed) của từng lỗi tìm thấy.
2. ${commentRule}
3. Trả về kết quả DUY NHẤT dưới dạng đối tượng JSON thuần túy theo cấu trúc:
{
  "errors": [
    {
      "line": 5,
      "message": "Mô tả ngắn gọn lỗi tại dòng này",
      "severity": "error"
    }
  ],
  "explanation": "Giải thích chi tiết nguyên nhân lỗi và các điểm đã được sửa",
  "fixedCode": "Toàn bộ mã nguồn hoàn chỉnh đã sửa lỗi 100%"
}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Lỗi kết nối AI (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const parsed = parseCodeFixResponse(rawText, code);

  let finalFixedCode = parsed.fixedCode;
  if (!includeComments) {
    finalFixedCode = stripComments(finalFixedCode, language);
  }

  return {
    errors: parsed.errors,
    explanation: parsed.explanation,
    fixedCode: finalFixedCode,
  };
}
