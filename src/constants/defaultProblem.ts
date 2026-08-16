import type { ProblemStatement } from '../types/problem';

export const DEFAULT_PROBLEM: ProblemStatement = {
  title: 'SUMARR - Tổng Các Phần Tử Trong Mảng',
  timeLimit: 1.0,
  memoryLimit: 256,
  markdown: `### Đề bài
Cho một dãy số nguyên gồm $N$ phần tử $A_1, A_2, \\dots, A_N$.
Nhiệm vụ của bạn là tính tổng tất cả các phần tử trong dãy số đã cho.

*Chú ý: Tổng có thể vượt quá giới hạn của số nguyên 32-bit có dấu.*

### Định dạng Input
- Dòng đầu tiên chứa số nguyên dương $N$ ($1 \\le N \\le 10^5$).
- Dòng thứ hai chứa $N$ số nguyên $A_1, A_2, \\dots, A_N$ ($-10^9 \\le A_i \\le 10^9$).

### Định dạng Output
- In ra một số nguyên duy nhất là tổng các phần tử trong dãy.

### Ràng buộc
- $1 \\le N \\le 10^5$
- $-10^9 \\le A_i \\le 10^9$
- Giới hạn thời gian: 1.0 giây
- Giới hạn bộ nhớ: 256 MB

### Ví dụ
**Sample 1:**
- Input:
\`\`\`
5
1 2 3 4 5
\`\`\`
- Output:
\`\`\`
15
\`\`\`
*(Giải thích: 1 + 2 + 3 + 4 + 5 = 15)*

**Sample 2:**
- Input:
\`\`\`
4
-10 20 -30 40
\`\`\`
- Output:
\`\`\`
20
\`\`\`
`,
  sampleCases: [
    {
      id: 'sample-1',
      name: 'Sample 1',
      input: `5\n1 2 3 4 5`,
      expectedOutput: `15`,
      isSample: true,
      type: 'sample',
      description: 'Ví dụ cơ bản 1 + 2 + 3 + 4 + 5 = 15'
    },
    {
      id: 'sample-2',
      name: 'Sample 2',
      input: `4\n-10 20 -30 40`,
      expectedOutput: `20`,
      isSample: true,
      type: 'sample',
      description: 'Ví dụ có số âm'
    },
    {
      id: 'sample-3',
      name: 'Sample 3 (Edge Case: N=1)',
      input: `1\n1000000000`,
      expectedOutput: `1000000000`,
      isSample: true,
      type: 'edge',
      description: 'Dãy chỉ có 1 phần tử lớn'
    },
    {
      id: 'sample-4',
      name: 'Sample 4 (Overflow 32-bit check)',
      input: `3\n1000000000 1000000000 1000000000`,
      expectedOutput: `3000000000`,
      isSample: true,
      type: 'tricky',
      description: 'Tổng vượt 2^31 - 1, kiểm tra tràn số 32-bit'
    }
  ]
};
