# ⚡ AI CodeJudge - Nền Tảng Chấm Bài & Lập Trình Thi Đấu Tích Hợp AI

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Monaco_Editor-0.52-007ACC?logo=visualstudiocode&logoColor=white" alt="Monaco Editor" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Google_Antigravity-Powered-4285F4?logo=google&logoColor=white" alt="Google Antigravity" />
  <img src="https://img.shields.io/badge/License-CC_BY--NC_4.0-orange.svg" alt="License" />
</p>

---

## 📌 Giới Thiệu
**AI CodeJudge** là nền tảng luyện tập, biên soạn và tự động chấm bài lập trình thi đấu (Competitive Programming) thế hệ mới, được phát triển với sự hỗ trợ đắc lực của **Google Antigravity** cùng mô hình trí tuệ nhân tạo **Google Gemini AI** và trình thực thi mã nguồn an toàn **Piston API Sandbox**.

Hệ thống hỗ trợ toàn diện từ việc trích xuất đề bài qua hình ảnh, sinh bộ dữ liệu kiểm thử (test cases) đa dạng, phát hiện lỗi cú pháp thời gian thực, trợ lý AI sửa lỗi code 1-click cho đến chấm điểm chính xác với File I/O chuẩn thi HSG/Themis.

---

## ✨ Tính Năng Nổi Bật

### 1. 📸 AI Vision OCR - Trích Xuất Đề Bài Bằng Hình Ảnh
- Kéo thả hoặc dán ảnh chụp đề bài từ tài liệu, sách giáo khoa hoặc đề thi.
- Gemini Vision tự động nhận diện chính xác văn bản tiếng Việt, bảng biểu, giới hạn thời gian / bộ nhớ và định dạng chuẩn công thức toán học **LaTeX / KaTeX**.
- Tự động bóc tách các test ví dụ từ đề bài.

### 2. 🤖 AI Testcase Generator - Sinh Bộ Dữ Liệu Kiểm Thử Tự Động
- Tự động sinh từ 1 đến 50+ test cases chất lượng cao chỉ trong vài giây.
- Bao phủ đầy đủ các trường hợp:
  - **Sample Tests:** Kiểm tra đúng định dạng cơ bản.
  - **Edge Cases:** Các giá trị biên nhỏ nhất, lớn nhất ($N = 0, 1, 10^5, 10^{18}$).
  - **Stress Tests:** Bộ dữ liệu kích thước lớn kiểm tra độ phức tạp thời gian $O(N \log N)$.
  - **Tricky Cases:** Bẫy tràn số nguyên 32-bit/64-bit, số âm, đồ thị đặc biệt.
- Tự động chạy kiểm chứng với code chuẩn trước khi xuất.

### 3. 🛠️ AI Code Fix & Debug Agent - Trợ Lý Sửa Lỗi 1 Chạm
- Phân tích mã nguồn và bắt lỗi cú pháp thời gian thực với **dấu gạch chân lượn sóng màu đỏ (`^^^^`)** trong Monaco Editor.
- Thu thập lỗi biên dịch (`CE stderr`) hoặc test case sai (`WA/RTE`), phân tích nguyên nhân và đưa ra lời giải thích chi tiết.
- Giao diện 2 cột thông minh với 2 Tab: `Mã nguồn đã sửa` và `Mã nguồn gốc`.
- Áp dụng bản vá vào editor chỉ với 1 cú click chuột.

### 4. ⚡ Trình Soạn Thảo & Chấm Bài Tự Động (Piston Sandbox)
- **Monaco Code Editor** (trình soạn thảo lõi của VS Code) với font chữ lập trình **JetBrains Mono**, đổi theme Sáng/Tối linh hoạt.
- Hỗ trợ đa ngôn ngữ thi đấu: **C++17, C++20, Python 3, PyPy 3, Free Pascal, Java, Rust, Go**.
- Trả về chi tiết các trạng thái: `AC (Accepted)`, `WA (Wrong Answer)`, `TLE (Time Limit Exceeded)`, `MLE (Memory Limit Exceeded)`, `RTE (Runtime Error)`, `CE (Compilation Error)`.

### 5. 📁 Hỗ Trợ File I/O (`.INP` / `.OUT` / `freopen`) Chuẩn Thi HSG & Themis
- Hỗ trợ nhập tên File Input (VD: `BAI1.INP`) và File Output (VD: `BAI1.OUT`).
- Trình chấm tự động nạp multi-file vào sandbox để code sử dụng `freopen`, `ifstream` hoặc `assign` chạy chính xác 100%.
- Xuất trọn gói bộ test cases định dạng **ZIP** chuẩn Themis (`BAI1\BAI1.INP`, `BAI1\BAI1.OUT`) hoặc định dạng Input/Output chuẩn CMS/Polygon.

### 6. 🌐 Đa Ngôn Ngữ & Giao Diện Sáng / Tối
- Chuyển đổi linh hoạt giữa **Tiếng Việt (VI)** và **Tiếng Anh (EN)**.
- Giao diện Dark Mode & Light Mode êm dịu, bảo vệ mắt khi lập trình thời gian dài.

---

## 🚀 Cài Đặt & Chạy Trên Máy Cục Bộ

### Yêu Cầu Hệ Thống
- **Node.js**: Phiên bản `>= 18.0.0`
- **npm** hoặc **pnpm / yarn**

### Các Bước Thực Hiện

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/luongvantam/ai-codejudge.git
   cd ai-codejudge
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Dev Server):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: `http://localhost:5173`

4. **Đóng gói sản phẩm (Build Production):**
   ```bash
   npm run build
   ```

---

## 🔑 Thiết Lập Gemini API Key
Để sử dụng các tính năng AI (OCR, Sinh test case, AI Sửa lỗi), bạn cần chuẩn bị một mã khóa Google Gemini API miễn phí:
1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Tạo API Key mới.
3. Trong giao diện AI CodeJudge, bấm nút **"🔑 API Key"** trên thanh tiêu đề và dán key vào. Mã khóa được lưu trữ an toàn trong `localStorage` của trình duyệt của bạn.

---

## 🤝 Lời Cảm Ơn & Sự Hỗ Trợ (Acknowledgements)
Dự án được xây dựng và tối ưu hóa với sự hỗ trợ đắc lực từ:
- **Google Antigravity**: Nền tảng phát triển và trợ lý AI thế hệ mới từ Google DeepMind.
- **Google Gemini API**: Cung cấp khả năng suy luận đa phương thức và sinh test case thông minh.
- **Piston API Sandbox**: Môi trường thực thi mã nguồn an toàn và tốc độ cao.

---

## 📜 Giấy Phép & Bản Quyền (License)

Dự án này được cấp phép theo giấy phép **[Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](LICENSE)**:

- ✅ **Bạn ĐƯỢC PHÉP:** Sử dụng, sao chép, chỉnh sửa, phân phối và đóng góp cho dự án cho mục đích học tập, nghiên cứu và phi thương mại.
- ❌ **BẠN KHÔNG ĐƯỢC PHÉP:** Sử dụng mã nguồn hoặc dự án này cho bất kỳ mục đích thương mại hoặc kinh doanh sinh lời nào nếu chưa có sự đồng ý bằng văn bản của tác giả.
- 🏷️ **BẮT BUỘC GHI NHẬN TÁC GIẢ:** Giữ nguyên thông tin tác giả **luongvantam** và đính kèm đường dẫn đến [Repository gốc](https://github.com/luongvantam/ai-codejudge).

---

## 👨‍💻 Tác Giả & Bản Quyền

- **Tác giả:** [luongvantam](https://github.com/luongvantam)
- **GitHub Repository:** [https://github.com/luongvantam/ai-codejudge](https://github.com/luongvantam/ai-codejudge)
- **Copyright:** © 2026 luongvantam • All rights reserved.
