export interface DiffResult {
  isMatch: boolean;
  diffSummary?: string;
  firstDiffLine?: number;
  expectedSnippet?: string;
  actualSnippet?: string;
}

/**
 * Standard competitive programming output comparator
 * Normalizes newlines (\r\n -> \n), trims trailing whitespace per line,
 * and ignores trailing empty lines.
 */
export function compareOutputs(
  actual: string,
  expected: string,
  options: {
    ignoreTrailingWhitespace?: boolean;
    ignoreCase?: boolean;
    floatTolerance?: number; // e.g. 1e-6
  } = {}
): DiffResult {
  const {
    ignoreTrailingWhitespace = true,
    ignoreCase = false,
    floatTolerance = 1e-6,
  } = options;

  let actualClean = actual ?? '';
  let expectedClean = expected ?? '';

  if (ignoreCase) {
    actualClean = actualClean.toLowerCase();
    expectedClean = expectedClean.toLowerCase();
  }

  // Split lines
  const actualLines = actualClean
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  const expectedLines = expectedClean
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');

  // Strip trailing whitespace per line if requested
  const processedActual = ignoreTrailingWhitespace
    ? actualLines.map((l) => l.trimEnd())
    : actualLines;

  const processedExpected = ignoreTrailingWhitespace
    ? expectedLines.map((l) => l.trimEnd())
    : expectedLines;

  // Remove trailing empty lines
  while (processedActual.length > 0 && processedActual[processedActual.length - 1] === '') {
    processedActual.pop();
  }
  while (processedExpected.length > 0 && processedExpected[processedExpected.length - 1] === '') {
    processedExpected.pop();
  }

  // Check line count match
  if (processedActual.length !== processedExpected.length) {
    const diffLine = Math.min(processedActual.length, processedExpected.length) + 1;
    return {
      isMatch: false,
      firstDiffLine: diffLine,
      diffSummary: `Số dòng không khớp: Nhận được ${processedActual.length} dòng, mong đợi ${processedExpected.length} dòng.`,
      expectedSnippet: processedExpected[diffLine - 1] ?? '(Hết dòng)',
      actualSnippet: processedActual[diffLine - 1] ?? '(Hết dòng)',
    };
  }

  // Compare line by line
  for (let i = 0; i < processedExpected.length; i++) {
    const expLine = processedExpected[i];
    const actLine = processedActual[i];

    if (expLine === actLine) continue;

    // Check if tokens are floating point numbers with tolerance
    const expTokens = expLine.trim().split(/\s+/).filter(Boolean);
    const actTokens = actLine.trim().split(/\s+/).filter(Boolean);

    let tokenMismatch = false;
    if (expTokens.length === actTokens.length) {
      for (let t = 0; t < expTokens.length; t++) {
        const eVal = parseFloat(expTokens[t]);
        const aVal = parseFloat(actTokens[t]);

        if (!isNaN(eVal) && !isNaN(aVal)) {
          if (Math.abs(eVal - aVal) > floatTolerance) {
            tokenMismatch = true;
            break;
          }
        } else if (expTokens[t] !== actTokens[t]) {
          tokenMismatch = true;
          break;
        }
      }
    } else {
      tokenMismatch = true;
    }

    if (tokenMismatch) {
      return {
        isMatch: false,
        firstDiffLine: i + 1,
        diffSummary: `Sai khác tại dòng ${i + 1}`,
        expectedSnippet: expLine,
        actualSnippet: actLine,
      };
    }
  }

  return {
    isMatch: true,
  };
}
