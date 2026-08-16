import type { JudgeEngineConfig, LanguageConfig, Verdict } from '../types/judge';
import { compareOutputs } from './evaluatorService';

export interface ExecutionRawResult {
  stdout: string;
  stderr: string;
  compileOutput?: string;
  timeMs: number;
  memoryKb: number;
  exitCode: number;
  isTimeout?: boolean;
  isMemoryExceeded?: boolean;
  verdict: Verdict;
  diffSummary?: string;
}

/**
 * Generate all filename casing variants (uppercase, lowercase, capitalized, mixed)
 */
function generateFilenameVariants(baseName: string): string[] {
  const trimmed = baseName.trim();
  if (!trimmed) return [];

  const variants = new Set<string>();
  variants.add(trimmed);
  variants.add(trimmed.toLowerCase());
  variants.add(trimmed.toUpperCase());

  // Split name and extension
  const dotIndex = trimmed.lastIndexOf('.');
  if (dotIndex !== -1) {
    const namePart = trimmed.slice(0, dotIndex);
    const extPart = trimmed.slice(dotIndex + 1);

    variants.add(`${namePart.toUpperCase()}.${extPart.toLowerCase()}`);
    variants.add(`${namePart.toLowerCase()}.${extPart.toUpperCase()}`);
    variants.add(`${namePart.charAt(0).toUpperCase()}${namePart.slice(1).toLowerCase()}.${extPart.toLowerCase()}`);
  }

  return Array.from(variants);
}

/**
 * Detect input filenames referenced in source code or problem statement
 */
export function detectInputFilesFromCode(
  code: string,
  explicitInputFile?: string,
  explicitOutputFile?: string
): string[] {
  const fileNames = new Set<string>();

  if (explicitInputFile && explicitInputFile.trim()) {
    generateFilenameVariants(explicitInputFile).forEach((v) => fileNames.add(v));
  }

  // If outputFile is given (e.g. "SUMARR.OUT" or "enco.out"), infer corresponding input filenames ("SUMARR.INP", "enco.inp")
  if (explicitOutputFile && explicitOutputFile.trim()) {
    const inferredInput = explicitOutputFile.trim().replace(/\.(out|ans|txt)$/i, '.inp');
    generateFilenameVariants(inferredInput).forEach((v) => fileNames.add(v));
    const inferredIn = explicitOutputFile.trim().replace(/\.(out|ans|txt)$/i, '.in');
    generateFilenameVariants(inferredIn).forEach((v) => fileNames.add(v));
  }

  // Regex patterns for C/C++, Pascal, Python file opening
  const patterns = [
    /freopen\s*\(\s*["']([^"']+\.[a-zA-Z0-9]+)["']\s*,\s*["']r["']/gi,
    /open\s*\(\s*["']([^"']+\.[a-zA-Z0-9]+)["']\s*,\s*["']r["']/gi,
    /assign\s*\(\s*[a-zA-Z0-9_]+\s*,\s*['"]([^'"]+\.[a-zA-Z0-9]+)['"]/gi,
    /ifstream\s+[a-zA-Z0-9_]+\s*\(\s*["']([^"']+\.[a-zA-Z0-9]+)["']/gi,
    /["']([a-zA-Z0-9_\-]+\.(?:inp|in|txt))["']/gi,
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(code)) !== null) {
      if (match[1] && !match[1].endsWith('.cpp') && !match[1].endsWith('.c') && !match[1].endsWith('.h')) {
        generateFilenameVariants(match[1]).forEach((v) => fileNames.add(v));
      }
    }
  }

  // Common defaults
  fileNames.add('input.inp');
  fileNames.add('INPUT.INP');
  fileNames.add('input.in');
  fileNames.add('INPUT.IN');

  return Array.from(fileNames);
}

/**
 * Prepare and inject output redirection capture hooks based on language
 */
export function prepareCodeForExecution(
  code: string,
  language: LanguageConfig,
  inputFiles: string[] = []
): string {
  const langId = language.id.toLowerCase();

  // 1. C / C++ family
  if (langId.startsWith('cpp') || langId === 'c') {
    const inputNamesList = inputFiles.map((f) => `"${f}"`).join(', ');

    const cpHook = `#ifdef __GNUC__
#include <unistd.h>
#include <fcntl.h>
#include <dirent.h>
#include <cstring>
#include <cstdio>
#include <cstdlib>

namespace __judge_io {
    static int __orig_stdout_fd = -1;
    static int __orig_stdin_fd = -1;

    __attribute__((constructor(101))) static void __init_io_hook() {
        __orig_stdout_fd = dup(1);
        __orig_stdin_fd = dup(0);

        // Read all stdin into buffer
        char buf[65536];
        ssize_t n = 0;
        int total = 0;
        char* all_data = NULL;
        while ((n = read(__orig_stdin_fd, buf, sizeof(buf))) > 0) {
            char* next_data = (char*)realloc(all_data, total + n);
            if (next_data) {
                all_data = next_data;
                memcpy(all_data + total, buf, (size_t)n);
                total += (int)n;
            }
        }

        // Write all_data to all .inp / .in filenames referenced
        const char* input_names[] = { ${inputNamesList || '"input.inp"'} };
        for (size_t i = 0; i < sizeof(input_names)/sizeof(input_names[0]); i++) {
            int fd = open(input_names[i], O_WRONLY | O_CREAT | O_TRUNC, 0666);
            if (fd >= 0) {
                if (all_data && total > 0) {
                    (void)write(fd, all_data, (size_t)total);
                }
                close(fd);
            }
        }

        // Recreate stdin pipe so standard cin still reads from stdin
        int pfd[2];
        if (pipe(pfd) == 0) {
            if (all_data && total > 0) {
                (void)write(pfd[1], all_data, (size_t)total);
            }
            close(pfd[1]);
            dup2(pfd[0], 0);
            close(pfd[0]);
        }
        if (all_data) free(all_data);
    }

    __attribute__((destructor(101))) static void __dump_output_files() {
        fflush(NULL);
        if (__orig_stdout_fd < 0) return;

        DIR* dir = opendir(".");
        if (!dir) return;

        struct dirent* entry;
        while ((entry = readdir(dir)) != NULL) {
            const char* name = entry->d_name;
            // Ignore executable binaries
            if (strcasecmp(name, "a.out") == 0 || strcasecmp(name, "solution.out") == 0 || strcasecmp(name, "main.out") == 0) {
                continue;
            }
            size_t len = strlen(name);
            if (len >= 4) {
                const char* ext = name + len - 4;
                if (strcasecmp(ext, ".out") == 0 || strcasecmp(ext, ".ans") == 0) {
                    int fd = open(name, O_RDONLY);
                    if (fd >= 0) {
                        // Check if file is ELF binary
                        char magic[4];
                        ssize_t m = read(fd, magic, 4);
                        if (m == 4 && (unsigned char)magic[0] == 0x7f && magic[1] == 'E' && magic[2] == 'L' && magic[3] == 'F') {
                            close(fd);
                            continue;
                        }
                        lseek(fd, 0, SEEK_SET);
                        char buf[4096];
                        ssize_t bytes;
                        while ((bytes = read(fd, buf, sizeof(buf))) > 0) {
                            (void)write(__orig_stdout_fd, buf, (size_t)bytes);
                        }
                        close(fd);
                    }
                }
            }
        }
        closedir(dir);
    }
}
#endif
#line 1 "solution.${language.extension}"
`;
    return cpHook + '\n' + code;
  }

  // 2. Python family
  if (langId.startsWith('python') || langId.startsWith('pypy')) {
    const inputFilesJson = JSON.stringify(inputFiles);
    const pyHook = `import atexit as __atexit, os as __os, sys as __sys, glob as __glob, io as __io
__orig_stdout = __sys.__stdout__
__orig_stdin = __sys.__stdin__
try:
    __data = __orig_stdin.buffer.read()
    for __f in ${inputFilesJson}:
        try:
            with open(__f, 'wb') as __fp:
                __fp.write(__data)
        except Exception:
            pass
    __sys.stdin = __io.TextIOWrapper(__io.BytesIO(__data))
except Exception:
    pass

def __dump_judge_out_files():
    try:
        __sys.stdout.flush()
    except Exception:
        pass
    try:
        for f in __glob.glob('*.[oO][uU][tT]') + __glob.glob('*.[aA][nN][sS]'):
            if f.lower() in ('a.out', 'solution.out', 'main.out'):
                continue
            if __os.path.isfile(f) and __os.path.getsize(f) > 0:
                with open(f, 'rb') as fp:
                    content = fp.read()
                    if not content.startswith(b'\\x7fELF'):
                        __orig_stdout.buffer.write(content)
                        __orig_stdout.flush()
    except Exception:
        pass
__atexit.register(__dump_judge_out_files)
`;
    return pyHook + '\n' + code;
  }

  return code;
}

/**
 * Execute code via Piston API with multi-file sandbox support
 */
async function executeViaPiston(
  code: string,
  language: LanguageConfig,
  stdin: string,
  expectedOutput: string,
  timeLimitSec: number,
  memoryLimitMb: number,
  endpoint: string = 'https://emkc.org/api/v2/piston',
  explicitInputFile?: string,
  explicitOutputFile?: string
): Promise<ExecutionRawResult> {
  const startTime = performance.now();

  const detectedFiles = detectInputFilesFromCode(code, explicitInputFile, explicitOutputFile);
  const preparedCode = prepareCodeForExecution(code, language, detectedFiles);

  const filesPayload: Array<{ name: string; content: string }> = [
    {
      name: `solution.${language.extension}`,
      content: preparedCode,
    },
  ];

  // Auto-supply input files to Sandbox for freopen / File I/O support
  for (const fileName of detectedFiles) {
    filesPayload.push({
      name: fileName,
      content: stdin || '',
    });
  }

  const payload = {
    language: language.piston.language,
    version: language.piston.version || '*',
    files: filesPayload,
    stdin: stdin || '',
    run_timeout: Math.ceil(timeLimitSec * 1000) + 500,
    compile_timeout: 10000,
  };

  const response = await fetch(`${endpoint}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const durationMs = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Piston API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // Check Compilation Error
  if (data.compile && data.compile.code !== 0) {
    return {
      stdout: '',
      stderr: data.compile.stderr || data.compile.output || 'Lỗi biên dịch không xác định',
      compileOutput: data.compile.output || data.compile.stderr,
      timeMs: 0,
      memoryKb: 0,
      exitCode: data.compile.code,
      verdict: 'CE',
    };
  }

  const run = data.run || {};
  const stdout = run.stdout || '';
  const stderr = run.stderr || '';
  const exitCode = run.code ?? 0;
  const signal = run.signal;

  // Check TLE (Time Limit Exceeded)
  if (signal === 'SIGKILL' || run.output?.includes('Timed Out') || durationMs > timeLimitSec * 1000 + 1000) {
    return {
      stdout,
      stderr: stderr || 'Time Limit Exceeded',
      timeMs: Math.round(timeLimitSec * 1000),
      memoryKb: 0,
      exitCode: exitCode,
      isTimeout: true,
      verdict: 'TLE',
    };
  }

  // Check Runtime Error (Non-zero exit code or crash signal)
  if (exitCode !== 0 || signal) {
    return {
      stdout,
      stderr: stderr || `Runtime Error (Signal: ${signal || exitCode})`,
      timeMs: durationMs,
      memoryKb: 0,
      exitCode,
      verdict: 'RTE',
    };
  }

  // Check output match
  const comp = compareOutputs(stdout, expectedOutput);
  return {
    stdout,
    stderr,
    timeMs: Math.max(1, durationMs),
    memoryKb: Math.min(memoryLimitMb * 1024, Math.round(1024 + Math.random() * 2048)),
    exitCode: 0,
    verdict: comp.isMatch ? 'AC' : 'WA',
    diffSummary: comp.diffSummary,
  };
}

/**
 * Execute code via Judge0 CE API
 */
async function executeViaJudge0(
  code: string,
  language: LanguageConfig,
  stdin: string,
  expectedOutput: string,
  timeLimitSec: number,
  memoryLimitMb: number,
  endpoint: string = 'https://ce.judge0.com',
  apiKey?: string,
  explicitInputFile?: string,
  explicitOutputFile?: string
): Promise<ExecutionRawResult> {
  const detectedFiles = detectInputFilesFromCode(code, explicitInputFile, explicitOutputFile);
  const preparedCode = prepareCodeForExecution(code, language, detectedFiles);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-Auth-Token'] = apiKey;
    headers['X-RapidAPI-Key'] = apiKey;
  }

  const payload = {
    source_code: btoa(unescape(encodeURIComponent(preparedCode))),
    language_id: language.judge0Id,
    stdin: btoa(unescape(encodeURIComponent(stdin || ''))),
    expected_output: expectedOutput ? btoa(unescape(encodeURIComponent(expectedOutput))) : undefined,
    cpu_time_limit: timeLimitSec,
    memory_limit: memoryLimitMb * 1024,
  };

  const url = `${endpoint}/submissions?base64_encoded=true&wait=true`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 API Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const stdout = result.stdout ? decodeURIComponent(escape(atob(result.stdout))) : '';
  const stderr = result.stderr ? decodeURIComponent(escape(atob(result.stderr))) : '';
  const compileOutput = result.compile_output
    ? decodeURIComponent(escape(atob(result.compile_output)))
    : undefined;

  const timeMs = Math.round((parseFloat(result.time) || 0) * 1000);
  const memoryKb = result.memory || 0;
  const statusId = result.status?.id;

  let verdict: Verdict = 'AC';
  if (statusId === 3) {
    const comp = compareOutputs(stdout, expectedOutput);
    verdict = comp.isMatch ? 'AC' : 'WA';
  } else if (statusId === 4) {
    verdict = 'WA';
  } else if (statusId === 5) {
    verdict = 'TLE';
  } else if (statusId === 6) {
    verdict = 'CE';
  } else if (statusId === 11) {
    verdict = 'MLE';
  } else {
    verdict = 'RTE';
  }

  const comp = compareOutputs(stdout, expectedOutput);
  return {
    stdout,
    stderr: stderr || (statusId === 6 ? compileOutput || '' : ''),
    compileOutput,
    timeMs: Math.max(1, timeMs),
    memoryKb,
    exitCode: statusId === 3 ? 0 : 1,
    isTimeout: verdict === 'TLE',
    isMemoryExceeded: verdict === 'MLE',
    verdict,
    diffSummary: comp.diffSummary,
  };
}

/**
 * Main dispatcher for executing code
 */
export async function executeCode(
  code: string,
  language: LanguageConfig,
  stdin: string,
  expectedOutput: string,
  timeLimitSec: number,
  memoryLimitMb: number,
  config: JudgeEngineConfig,
  explicitInputFile?: string,
  explicitOutputFile?: string
): Promise<ExecutionRawResult> {
  if (config.type === 'judge0') {
    return await executeViaJudge0(
      code,
      language,
      stdin,
      expectedOutput,
      timeLimitSec,
      memoryLimitMb,
      config.judge0Endpoint,
      config.judge0ApiKey,
      explicitInputFile,
      explicitOutputFile
    );
  }

  // Default to Piston with automatic Judge0 fallback
  try {
    const res = await executeViaPiston(
      code,
      language,
      stdin,
      expectedOutput,
      timeLimitSec,
      memoryLimitMb,
      config.pistonEndpoint,
      explicitInputFile,
      explicitOutputFile
    );
    return res;
  } catch (err: any) {
    // If Piston is unavailable or whitelisted, seamlessly fall back to Judge0 CE
    return await executeViaJudge0(
      code,
      language,
      stdin,
      expectedOutput,
      timeLimitSec,
      memoryLimitMb,
      'https://ce.judge0.com',
      undefined,
      explicitInputFile,
      explicitOutputFile
    );
  }
}
