import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Testcase } from '../types/judge';

export async function exportTestcasesToZip(
  testcases: Testcase[],
  problemName: string = 'problem',
  format: 'standard' | 'themis' = 'standard'
): Promise<void> {
  const zip = new JSZip();
  const cleanName = problemName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'problem';

  if (format === 'themis') {
    // Themis folder structure: PROBLEM/TEST01/PROBLEM.IN, PROBLEM.OUT
    testcases.forEach((tc, index) => {
      const testFolderNum = (index + 1).toString().padStart(2, '0');
      const folderName = `${cleanName}/TEST${testFolderNum}`;
      zip.file(`${folderName}/${cleanName}.IN`, tc.input || '');
      zip.file(`${folderName}/${cleanName}.OUT`, tc.expectedOutput || '');
    });
  } else {
    // Standard format: 1.in, 1.out, 2.in, 2.out
    testcases.forEach((tc, index) => {
      const idx = index + 1;
      zip.file(`${idx}.in`, tc.input || '');
      zip.file(`${idx}.out`, tc.expectedOutput || '');
    });

    // Also include a metadata summary
    const meta = {
      problemName: cleanName,
      totalTestcases: testcases.length,
      createdAt: new Date().toISOString(),
      tests: testcases.map((t, idx) => ({
        id: idx + 1,
        name: t.name,
        type: t.type || 'standard',
        description: t.description || ''
      }))
    };
    zip.file('metadata.json', JSON.stringify(meta, null, 2));
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${cleanName}_testcases_${format}.zip`);
}
