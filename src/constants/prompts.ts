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

export const DIFFERENTIAL_TEST_PROMPT = (
  problemTitle: string,
  problemMarkdown: string,
  timeLimit: number,
  memoryLimit: number,
  language: string,
  count: number,
  includeComments: boolean,
  customInstructions?: string
) => `Bạn là chuyên gia Lập trình thi đấu (Competitive Programming).
Nhiệm vụ của bạn gồm 2 phần cho bài toán sau:
1. Viết mã nguồn lời giải chuẩn xác, tối ưu bằng ngôn ngữ ${language} ("referenceCode").
2. Viết một hàm JavaScript sinh dữ liệu đầu vào (input) ngẫu nhiên ("inputGeneratorJs") để chạy đối chứng giữa code AI và code người dùng. TUYỆT ĐỐI KHÔNG tự tính hay sinh expectedOutput.

Tiêu đề: ${problemTitle}
Giới hạn: ${timeLimit}s, ${memoryLimit}MB
Đề bài:
"""
${problemMarkdown}
"""
${customInstructions ? `Yêu cầu bổ sung: ${customInstructions}` : ''}

QUY TẮC BẮT BUỘC:
1. "referenceCode":
   - ${includeComments ? 'Thêm comment ngắn gọn giải thích thuật toán.' : 'TUYỆT ĐỐI KHÔNG viết comment (//, /* */, #) trong mã nguồn.'}
   - Dùng Fast I/O, xử lý kiểu dữ liệu 64-bit tránh tràn số, đọc/ghi chuẩn theo đề bài.
2. "inputGeneratorJs":
   - Là phần thân (body) của một hàm JavaScript nhận 3 tham số: (testIndex, totalTests, helpers).
   - Trả về (return) đúng 1 chuỗi string là dữ liệu Input hợp lệ theo đúng định dạng và ràng buộc của đề bài.
   - Các hàm có sẵn trong đối tượng \`helpers\`:
     * helpers.randInt(min, max): số nguyên ngẫu nhiên trong [min, max]
     * helpers.randFloat(min, max, decimals): số thực ngẫu nhiên
     * helpers.randArray(len, min, max): mảng len số nguyên ngẫu nhiên trong [min, max]
     * helpers.randPermutation(n, oneIndexed): hoán vị ngẫu nhiên độ dài n (mặc định 1..n)
     * helpers.randString(len, alphabet): chuỗi ngẫu nhiên độ dài len
     * helpers.randTree(n, oneIndexed): mảng các cặp cạnh [u, v] của cây n đỉnh
     * helpers.choice(arr): chọn ngẫu nhiên 1 phần tử từ mảng arr
   - Chiến lược sinh theo \`testIndex\` (từ 0 đến totalTests - 1, tổng ${count} test):
     * testIndex === 0: test biên nhỏ nhất (VD: N = 1 hoặc giá trị nhỏ nhất).
     * Các test giữa: sinh kích thước và giá trị ngẫu nhiên đa dạng (có số âm/0/trùng nếu đề cho phép).
     * testIndex === totalTests - 1: test lớn/stress (giữ kích thước hợp lý <= 2000 phần tử để sandbox chạy nhanh, trừ khi đề nhỏ hơn hoặc có yêu cầu khác).
   - KHÔNG dùng import/require, KHÔNG dùng console.log, chỉ return string.
3. Đầu ra BẮT BUỘC là JSON thuần túy hợp lệ theo đúng cấu trúc sau:
{
  "referenceCode": "toàn bộ mã nguồn lời giải",
  "inputGeneratorJs": "toàn bộ thân hàm JS kết thúc bằng return ..."
}`;
