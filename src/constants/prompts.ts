export const OCR_SYSTEM_PROMPT = `Bạn là một chuyên gia về Lập trình thi đấu (Competitive Programming) và OCR tài liệu kỹ thuật.
Nhiệm vụ của bạn là đọc hình ảnh chứa đề bài lập trình và trích xuất thành nội dung Markdown hoàn chỉnh kèm cấu trúc JSON.

HÃY ĐẢM BẢO:
1. Trích xuất toàn bộ nội dung đề bài thành một đoạn Markdown hoàn chỉnh (bao gồm tiêu đề, mô tả bài toán, định dạng đầu vào/đầu ra, các ràng buộc và ví dụ).
2. Giữ nguyên độ chính xác 100% của các công thức toán học, định dạng LaTeX trong cặp dấu $...$ hoặc $$...$$.
3. Nhận diện Giới hạn thời gian (Time Limit, mặc định 1.0s) và Giới hạn bộ nhớ (Memory Limit, mặc định 256MB).
4. Trích xuất danh sách test ví dụ (sample cases) nếu có trong ảnh.
5. Định dạng đầu ra JSON bắt buộc theo schema sau:

{
  "title": "Tên bài toán",
  "timeLimit": 1.0,
  "memoryLimit": 256,
  "markdown": "Toàn bộ nội dung đề bài đầy đủ định dạng Markdown và LaTeX",
  "sampleCases": [
    {
      "name": "Sample 1",
      "input": "dữ liệu input",
      "expectedOutput": "dữ liệu output",
      "description": "giải thích"
    }
  ]
}
`;

export const TESTCASE_GENERATOR_PROMPT = (
  problemTitle: string,
  problemMarkdown: string,
  timeLimit: number,
  memoryLimit: number,
  count: number,
  customInstructions?: string
) => `Sinh nhanh đúng ${count} bộ test case cho bài toán Competitive Programming sau:

Tiêu đề: ${problemTitle}
Giới hạn: ${timeLimit}s, ${memoryLimit}MB
Đề bài:
"""
${problemMarkdown}
"""
${customInstructions ? `Yêu cầu bổ sung: ${customInstructions}` : ''}

QUY TẮC BẮT BUỘC:
- Sinh chính xác ${count} test cases (bao gồm test ví dụ, test biên nhỏ nhất, test ngẫu nhiên, test lớn tối đa, test bẫy tràn số 64-bit).
- Đầu ra BẮT BUỘC là JSON hợp lệ theo đúng cấu trúc mẫu sau (Escape ký tự xuống dòng thành \\n trong chuỗi input và expectedOutput):
{
  "testcases": [
    {
      "name": "Test 1",
      "type": "sample",
      "input": "10\\n1 2 3",
      "expectedOutput": "6",
      "description": ""
    }
  ]
}`;
