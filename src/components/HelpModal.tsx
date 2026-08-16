import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Cpu,
  Code2,
  HelpCircle,
  ExternalLink,
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  User,
  FolderArchive,
  Scale,
  Copy,
  Check,
} from 'lucide-react';
import type { LanguageCode } from '../constants/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode?: LanguageCode;
  appTheme?: 'light' | 'dark';
}

const RAW_LICENSE_TEXT = `Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)
=======================================================================

Copyright (c) 2026 luongvantam
Project: AI CodeJudge (https://github.com/luongvantam/ai-codejudge)

=======================================================================
TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:

You are free to:
1. Share — copy and redistribute the material in any medium or format.
2. Adapt — remix, transform, and build upon the material.

Under the following terms:
* Attribution — You must give appropriate credit to the creator (luongvantam),
  provide a link to the license, and indicate if changes were made. You may do so
  in any reasonable manner, but not in any way that suggests the licensor endorses
  you or your use.
  
* NonCommercial — You may NOT use the material for commercial purposes or financial gain
  without prior written permission from the original author (luongvantam).

* No additional restrictions — You may not apply legal terms or technological measures
  that legally restrict others from doing anything the license permits.

=======================================================================
DISCLAIMER:
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Author: luongvantam
GitHub: https://github.com/luongvantam
Repository: https://github.com/luongvantam/ai-codejudge`;

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  languageCode = 'en',
  appTheme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<
    'quickstart' | 'ocr_vision' | 'ai_testcases' | 'sandbox' | 'cp_tips' | 'faq' | 'license'
  >('quickstart');
  const [copiedLicense, setCopiedLicense] = useState(false);

  if (!isOpen) return null;

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(RAW_LICENSE_TEXT);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  const menuItems = [
    {
      id: 'quickstart' as const,
      icon: Zap,
      labelVi: 'Bắt đầu nhanh',
      labelEn: 'Quick Start',
      badge: 'Step-by-step',
    },
    {
      id: 'ocr_vision' as const,
      icon: Sparkles,
      labelVi: 'OCR Đề & LaTeX',
      labelEn: 'OCR Vision & LaTeX',
      badge: 'Multimodal',
    },
    {
      id: 'ai_testcases' as const,
      icon: Layers,
      labelVi: 'Sinh Test Case AI',
      labelEn: 'AI Test Generator',
      badge: 'Smart Tests',
    },
    {
      id: 'sandbox' as const,
      icon: Cpu,
      labelVi: 'Trình Chấm & Verdict',
      labelEn: 'Judge & Compilers',
      badge: 'Multi-lang',
    },
    {
      id: 'cp_tips' as const,
      icon: Code2,
      labelVi: 'Bảng Tra Thuật Toán',
      labelEn: 'CP Cheatsheet & Tips',
      badge: 'Fast I/O',
    },
    {
      id: 'faq' as const,
      icon: HelpCircle,
      labelVi: 'Hỏi & Đáp (FAQ)',
      labelEn: 'FAQ & Tips',
      badge: 'Support',
    },
    {
      id: 'license' as const,
      icon: Scale,
      labelVi: 'Giấy Phép Bản Quyền',
      labelEn: 'License & Copyright',
      badge: 'CC BY-NC 4.0',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 md:p-6">
      <div
        className={`border rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden text-sm flex flex-col h-[85vh] max-h-[820px] transition-colors ${appTheme === 'dark'
          ? 'bg-[#202020] border-[#383838] text-gray-200'
          : 'bg-white border-[#c8c8c8] text-gray-800'
          }`}
      >
        {/* Header */}
        <div className="bg-[#2c3e50] text-white px-5 py-3.5 flex items-center justify-between font-bold shrink-0 border-b border-[#1a252f]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#34495e] rounded border border-[#4a627a]">
              <BookOpen className="w-4 h-4 text-[#3498db]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-wide">
                {languageCode === 'vi' ? 'Cẩm Nang Hướng Dẫn & Bản Quyền' : 'User Guide & Documentation'}
              </span>
              <span className="text-[11px] text-gray-300 block font-normal">
                AI CodeJudge • Competitive Programming Platform
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-[#34495e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Split: Sidebar Nav + Content */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Left Navigation Sidebar */}
          <div
            className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-3 space-y-1.5 shrink-0 overflow-y-auto ${appTheme === 'dark' ? 'bg-[#181818] border-[#333]' : 'bg-[#f4f6f8] border-gray-200'
              }`}
          >
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {languageCode === 'vi' ? 'Mục lục hướng dẫn' : 'Documentation Index'}
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between text-xs font-semibold transition-all ${isActive
                    ? 'bg-[#337ab7] text-white shadow-xs'
                    : appTheme === 'dark'
                      ? 'text-gray-300 hover:bg-[#282828]'
                      : 'text-gray-700 hover:bg-gray-200/70'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#337ab7]'}`} />
                    <span>{languageCode === 'vi' ? item.labelVi : item.labelEn}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-normal ${isActive
                      ? 'bg-black/25 text-white'
                      : appTheme === 'dark'
                        ? 'bg-[#333] text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}

            {/* Project & Author Box in Sidebar */}
            <div className={`pt-3.5 mt-3.5 border-t px-1 space-y-2 ${appTheme === 'dark' ? 'border-[#333]' : 'border-gray-200'
              }`}>
              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider px-1">
                {languageCode === 'vi' ? 'Dự án & Tác giả' : 'Project & Author'}
              </span>

              {/* GitHub Repo Link Card */}
              <a
                href="https://github.com/luongvantam/ai-codejudge"
                target="_blank"
                rel="noreferrer"
                className={`p-2 rounded border flex items-center justify-between transition-colors ${appTheme === 'dark'
                  ? 'bg-[#222] border-[#383838] hover:border-[#337ab7] text-gray-200'
                  : 'bg-white border-gray-200 hover:border-[#337ab7] text-gray-800 shadow-xs'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <GithubIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="font-semibold text-xs">GitHub Repository</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>

              {/* Author Link Card */}
              <a
                href="https://github.com/luongvantam"
                target="_blank"
                rel="noreferrer"
                className={`p-2 rounded border flex items-center justify-between transition-colors ${appTheme === 'dark'
                  ? 'bg-[#222] border-[#383838] hover:border-[#337ab7] text-gray-200'
                  : 'bg-white border-gray-200 hover:border-[#337ab7] text-gray-800 shadow-xs'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#337ab7]" />
                  <span className="font-semibold text-xs">Author: @luongvantam</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>

              {/* Google AI Studio */}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className={`p-2 rounded border flex items-center justify-between transition-colors ${appTheme === 'dark'
                  ? 'bg-[#222] border-[#383838] hover:border-[#337ab7] text-gray-300'
                  : 'bg-white border-gray-200 hover:border-[#337ab7] text-gray-700 shadow-xs'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs">Google AI Studio</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 p-5 md:p-7 overflow-y-auto space-y-5 text-xs leading-relaxed">
            {/* 1. QUICK START */}
            {activeTab === 'quickstart' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#337ab7] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>{languageCode === 'vi' ? 'Quy Trình 4 Bước Đơn Giản' : '4-Step Quick Start Workflow'}</span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {languageCode === 'vi'
                      ? 'Nắm bắt luồng làm việc cơ bản từ khi mở bài toán đến khi xuất bộ test đạt chuẩn.'
                      : 'Master the core flow from inputting problems to exporting validated contest packages.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className={`p-4 rounded-lg border flex gap-3.5 items-start ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <div className="w-6 h-6 rounded-full bg-[#337ab7] text-white flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                      1
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {languageCode === 'vi' ? 'Nhập Gemini API Key (Miễn phí 100%)' : 'Set your free Gemini API Key'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {languageCode === 'vi'
                          ? 'Bấm nút "Nhập Gemini API Key" trên thanh Header. Lấy key miễn phí trong 30 giây tại Google AI Studio và dán vào. Key được bảo mật lưu trên trình duyệt của riêng bạn.'
                          : 'Click "Enter Gemini Key" in the header. Create a free key at Google AI Studio. The key is securely stored in your local browser.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-4 rounded-lg border flex gap-3.5 items-start ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <div className="w-6 h-6 rounded-full bg-[#337ab7] text-white flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                      2
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {languageCode === 'vi' ? 'Nhập Đề bài hoặc Dán Ảnh Chụp (OCR)' : 'Input Problem or Paste Screenshot'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {languageCode === 'vi'
                          ? 'Bạn có thể chỉnh sửa trực tiếp Markdown ở cột trái, hoặc chụp ảnh màn hình đề thi từ bất kỳ trang nào (Codeforces, VNOI, PDF...) rồi bấm "OCR Ảnh" hoặc Ctrl + V để AI tự bóc tách nội dung và công thức toán KaTeX.'
                          : 'Edit Markdown directly on the left panel, or capture a problem screenshot and press "OCR Image" or Ctrl + V to automatically extract text, limits, and LaTeX formulas.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-4 rounded-lg border flex gap-3.5 items-start ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <div className="w-6 h-6 rounded-full bg-[#337ab7] text-white flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                      3
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {languageCode === 'vi' ? 'Bấm "AI Sinh Test" để Tạo Bộ Test Hoàn Chỉnh' : 'Click "AI Generate Tests"'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {languageCode === 'vi'
                          ? 'Gemini AI sẽ phân tích thuật toán, sinh nhanh các bộ test từ cận nhỏ nhất (Edge case), test lớn (Stress test) đến test bẫy tràn số (Tricky case) kèm kết quả mong đợi chính xác.'
                          : 'Gemini AI analyzes constraints and constructs sample cases, boundary conditions, large stress tests, and 64-bit overflow traps with verified expected outputs.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-4 rounded-lg border flex gap-3.5 items-start ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <div className="w-6 h-6 rounded-full bg-[#27ae60] text-white flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                      4
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {languageCode === 'vi' ? 'Viết Code & Bấm "CHẤM TOÀN BỘ TEST"' : 'Code & Click "JUDGE ALL TESTS"'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {languageCode === 'vi'
                          ? 'Soạn mã nguồn ở cột giữa (C++, Python, Pascal...), nhấn nút xanh để chấm toàn bộ test trên Sandbox độc lập. Bạn có thể nhấn vào từng test case để so khớp Visual Diff (Output của bạn vs Đáp án chuẩn).'
                          : 'Write your code in the middle editor (C++, Python, Pascal, Java...), hit the green judge button. Inspect visual diffs for any failing test cases.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. OCR VISION */}
            {activeTab === 'ocr_vision' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#337ab7] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>{languageCode === 'vi' ? 'Nhận Diện Ảnh Đề Bài & KaTeX Math' : 'Multimodal OCR & Mathematical Formulas'}</span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {languageCode === 'vi'
                      ? 'Trích xuất trực tiếp từ ảnh chụp màn hình sang Markdown chuẩn hoá trong nháy mắt.'
                      : 'Zero-friction conversion of raw problem screenshots into beautiful LaTeX-rendered Markdown.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-4 rounded-lg border space-y-2 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <h4 className="font-bold text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{languageCode === 'vi' ? 'Tự động nhận diện công thức toán' : 'LaTeX Formula Support'}</span>
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {languageCode === 'vi'
                        ? 'Các công thức toán như N ≤ 10⁵, tổng phần tử, ma trận, chỉ số dưới đều được Gemini tự động bọc trong dấu $...$ và hiển thị bằng KaTeX sắc nét.'
                        : 'Mathematical symbols, summation, indices, and constraints are auto-enclosed in $...$ and rendered with KaTeX.'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border space-y-2 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <h4 className="font-bold text-sm flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{languageCode === 'vi' ? 'Tự động bắt Time & Memory Limit' : 'Auto-detected Limits'}</span>
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {languageCode === 'vi'
                        ? 'Hệ thống tự động phát hiện giới hạn thời gian (ví dụ 1.0s, 2.0s) và bộ nhớ (256MB, 512MB) ghi trong ảnh để thiết lập thông số chấm chính xác.'
                        : 'Execution time limits (e.g. 1.0s) and memory caps (e.g. 256MB) are parsed and auto-configured.'}
                    </p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#18232c] border-[#224560] text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}>
                  <span className="font-bold block">
                    💡 {languageCode === 'vi' ? 'Mẹo sử dụng phím tắt:' : 'Pro Tip for pasting screenshots:'}
                  </span>
                  <p className="text-[11px]">
                    {languageCode === 'vi'
                      ? 'Bạn chỉ cần chụp màn hình đề thi bằng Snipping Tool / Lightshot / Command+Shift+4, sau đó bấm nút "OCR Ảnh" rồi nhấn Ctrl + V. Ảnh sẽ được xử lý ngay lập tức!'
                      : 'Capture any region with your favorite screenshot tool, open "OCR Image" dialog and press Ctrl + V. Instant processing without saving files.'}
                  </p>
                </div>
              </div>
            )}

            {/* 3. AI TESTCASES */}
            {activeTab === 'ai_testcases' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#337ab7] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#3498db]" />
                    <span>{languageCode === 'vi' ? 'Chi Tiết 4 Nhóm Test Case Của AI' : 'AI Testcase Generation Strategy'}</span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {languageCode === 'vi'
                      ? 'Gemini AI không chỉ tạo test ngẫu nhiên mà chủ động thiết kế các trường hợp nhằm bẫy các lỗi phổ biến trong lập trình thi đấu.'
                      : 'Engineered testsuites covering typical CP pitfalls, corner cases, and time/memory limits.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className={`p-3.5 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-blue-900/60' : 'bg-white border-blue-200 shadow-xs'
                    }`}>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                      1. Sample Tests (Test Ví Dụ)
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                      {languageCode === 'vi'
                        ? 'Các bộ test mẫu có trong đề bài nhằm xác thực logic giải thuật cơ sở của chương trình.'
                        : 'Standard examples from the problem statement to verify fundamental correctness.'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-purple-900/60' : 'bg-white border-purple-200 shadow-xs'
                    }`}>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block">
                      2. Edge Cases (Test Cận Biên)
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                      {languageCode === 'vi'
                        ? 'Cận dưới nhỏ nhất (N = 0, N = 1), mảng toàn số âm, các phần tử giống hệt nhau, chuỗi rỗng.'
                        : 'Smallest bounds (N = 0, N = 1), all negatives, identical elements, single character strings.'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-amber-900/60' : 'bg-white border-amber-200 shadow-xs'
                    }`}>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                      3. Stress Tests (Test Cực Đại)
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                      {languageCode === 'vi'
                        ? 'Dữ liệu lớn nhất có thể (N = 10⁵ đến 2×10⁵) để phát hiện thuật toán O(N²) bị quá thời gian (TLE).'
                        : 'Max constraint volumes (N = 10⁵ to 2×10⁵) to catch quadratic O(N²) solutions timing out.'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-red-900/60' : 'bg-white border-red-200 shadow-xs'
                    }`}>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                      4. Tricky / Overflow (Bẫy Tràn Số)
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                      {languageCode === 'vi'
                        ? 'Giá trị tổng vượt quá 2×10⁹ (bắt buộc dùng số nguyên 64-bit int64 / long long), đồ thị rời rạc.'
                        : 'Values exceeding 2×10⁹ requiring 64-bit integers, special boundary cases, disconnected graphs.'}
                    </p>
                  </div>
                </div>

                {/* Export ZIP note */}
                <div className={`p-4 rounded-lg border flex items-center justify-between ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                  }`}>
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-green-600 dark:text-green-400 block flex items-center gap-1.5">
                      <FolderArchive className="w-4 h-4" />
                      <span>{languageCode === 'vi' ? 'Xuất Gói Test ZIP (Chuẩn & Themis)' : 'Contest Export Formats'}</span>
                    </span>
                    <span className="text-gray-500">
                      {languageCode === 'vi'
                        ? 'Nhấn nút "Tải ZIP" để tải về toàn bộ bộ test theo định dạng chuẩn (1.in, 1.out) hoặc Themis phục vụ tổ chức thi đấu.'
                        : 'Export testsets directly in standard (1.in, 1.out) or Themis format for contest grading.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SANDBOX */}
            {activeTab === 'sandbox' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#337ab7] flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#3498db]" />
                    <span>{languageCode === 'vi' ? 'Trình Chấm Độc Lập & Kết Quả Chấm' : 'Sandbox Engines & Verdict Codes'}</span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {languageCode === 'vi'
                      ? 'Code được biên dịch và thực thi trên môi trường sandbox bảo mật cao, đo lường chính xác thời gian và bộ nhớ.'
                      : 'Sandboxed code execution with isolated resource containment.'}
                  </p>
                </div>

                <div className="border rounded-lg overflow-hidden border-gray-300 dark:border-gray-700">
                  <div className={`px-3 py-2 font-bold text-xs ${appTheme === 'dark' ? 'bg-[#282828] text-gray-100' : 'bg-gray-200 text-gray-900'
                    }`}>
                    {languageCode === 'vi' ? 'Bảng tra cứu kết quả chấm (Verdicts)' : 'Verdict Reference Table'}
                  </div>
                  <table className="w-full text-left text-xs border-collapse divide-y divide-gray-200 dark:divide-gray-700">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr className={appTheme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
                        <td className="py-2.5 px-3 w-20"><span className="bg-[#27ae60] text-white font-bold px-2 py-0.5 rounded text-[11px]">AC</span></td>
                        <td className={`py-2.5 px-3 font-bold ${appTheme === 'dark' ? 'text-gray-100' : 'text-[#0f172a]'}`}>Accepted</td>
                        <td className={`py-2.5 px-3 font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-[#1e293b]'}`}>{languageCode === 'vi' ? 'Kết quả đúng hoàn toàn' : 'Correct output within limits'}</td>
                      </tr>
                      <tr className={appTheme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
                        <td className="py-2.5 px-3 w-20"><span className="bg-[#e74c3c] text-white font-bold px-2 py-0.5 rounded text-[11px]">WA</span></td>
                        <td className={`py-2.5 px-3 font-bold ${appTheme === 'dark' ? 'text-gray-100' : 'text-[#0f172a]'}`}>Wrong Answer</td>
                        <td className={`py-2.5 px-3 font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-[#1e293b]'}`}>{languageCode === 'vi' ? 'Kết quả chạy sai khác đáp án mẫu' : 'Output differs from expected'}</td>
                      </tr>
                      <tr className={appTheme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
                        <td className="py-2.5 px-3 w-20"><span className="bg-[#e67e22] text-white font-bold px-2 py-0.5 rounded text-[11px]">TLE</span></td>
                        <td className={`py-2.5 px-3 font-bold ${appTheme === 'dark' ? 'text-gray-100' : 'text-[#0f172a]'}`}>Time Limit Exceeded</td>
                        <td className={`py-2.5 px-3 font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-[#1e293b]'}`}>{languageCode === 'vi' ? 'Chạy quá thời gian quy định (s)' : 'Program exceeded time limit'}</td>
                      </tr>
                      <tr className={appTheme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
                        <td className="py-2.5 px-3 w-20"><span className="bg-[#8e44ad] text-white font-bold px-2 py-0.5 rounded text-[11px]">MLE</span></td>
                        <td className={`py-2.5 px-3 font-bold ${appTheme === 'dark' ? 'text-gray-100' : 'text-[#0f172a]'}`}>Memory Limit Exceeded</td>
                        <td className={`py-2.5 px-3 font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-[#1e293b]'}`}>{languageCode === 'vi' ? 'Dùng vượt mức RAM cho phép (MB)' : 'Program exceeded memory limit'}</td>
                      </tr>
                      <tr className={appTheme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
                        <td className="py-2.5 px-3 w-20"><span className="bg-[#c0392b] text-white font-bold px-2 py-0.5 rounded text-[11px]">RTE</span></td>
                        <td className={`py-2.5 px-3 font-bold ${appTheme === 'dark' ? 'text-gray-100' : 'text-[#0f172a]'}`}>Runtime Error</td>
                        <td className={`py-2.5 px-3 font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-[#1e293b]'}`}>{languageCode === 'vi' ? 'Lỗi chia cho 0, tràn mảng, segmentation fault' : 'Segmentation fault or crash'}</td>
                      </tr>
                      <tr className={appTheme === 'dark' ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}>
                        <td className="py-2.5 px-3 w-20"><span className="bg-[#7f8c8d] text-white font-bold px-2 py-0.5 rounded text-[11px]">CE</span></td>
                        <td className={`py-2.5 px-3 font-bold ${appTheme === 'dark' ? 'text-gray-100' : 'text-[#0f172a]'}`}>Compilation Error</td>
                        <td className={`py-2.5 px-3 font-medium ${appTheme === 'dark' ? 'text-gray-300' : 'text-[#1e293b]'}`}>{languageCode === 'vi' ? 'Lỗi cú pháp khi biên dịch mã nguồn' : 'Syntax or compiler error'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. CP TIPS */}
            {activeTab === 'cp_tips' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#337ab7] flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#3498db]" />
                    <span>{languageCode === 'vi' ? 'Bí Quyết Tối Ưu Lập Trình Thi Đấu' : 'CP Cheatsheet & Optimization Tips'}</span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {languageCode === 'vi'
                      ? 'Quy tắc ước lượng độ phức tạp thuật toán và mẫu Fast I/O giúp tránh TLE.'
                      : 'Time complexity rules of thumb and boilerplate templates.'}
                  </p>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                  <div className={`px-3 py-2 font-bold text-xs ${appTheme === 'dark' ? 'bg-[#282828]' : 'bg-gray-100'
                    }`}>
                    {languageCode === 'vi' ? 'Ước lượng độ phức tạp với Time Limit 1.0s (~ 10^8 phép tính)' : 'Complexity Estimation (1.0s ~ 10^8 ops)'}
                  </div>
                  <table className="w-full text-left text-xs border-collapse divide-y dark:divide-gray-700">
                    <thead>
                      <tr className="border-b dark:border-gray-700 font-semibold text-gray-500">
                        <th className="py-2 px-3">Ràng buộc N</th>
                        <th className="py-2 px-3">Độ phức tạp phù hợp</th>
                        <th className="py-2 px-3">Thuật toán điển hình</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700 font-mono text-[11px]">
                      <tr><td className="py-2 px-3">N ≤ 11</td><td>O(N!)</td><td className="font-sans">Quay lui, hoán vị</td></tr>
                      <tr><td className="py-2 px-3">N ≤ 22</td><td>O(2^N)</td><td className="font-sans">Quy hoạch động Bitmask</td></tr>
                      <tr><td className="py-2 px-3">N ≤ 500</td><td>O(N^3)</td><td className="font-sans">Floyd-Warshall, nhân ma trận</td></tr>
                      <tr><td className="py-2 px-3">N ≤ 5,000</td><td>O(N^2)</td><td className="font-sans">Quy hoạch động 2 chiều, 2 con trỏ</td></tr>
                      <tr><td className="py-2 px-3">N ≤ 2 × 10^5</td><td>O(N log N)</td><td className="font-sans">Segment Tree, Fenwick, Sắp xếp</td></tr>
                      <tr><td className="py-2 px-3">N ≤ 10^7</td><td>O(N)</td><td className="font-sans">Mảng cộng dồn, Sàng số nguyên tố</td></tr>
                      <tr><td className="py-2 px-3">N ≥ 10^12</td><td>O(log N) / O(1)</td><td className="font-sans">Lũy thừa nhanh, Toán học</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Fast IO Snippet */}
                <div className="space-y-1.5">
                  <span className="font-bold text-xs block">
                    ⚡ {languageCode === 'vi' ? 'Mẫu Fast I/O C++ Chuẩn:' : 'Fast I/O C++ Template:'}
                  </span>
                  <pre className="bg-[#2d2d30] text-green-300 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-[#444]">
                    {`#include <bits/stdc++.h>
using namespace std;

int main() {
    // Tối ưu tốc độ đọc ghi dữ liệu lớn
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Dùng '\\n' thay vì endl để không bị ép flush bộ đệm
    return 0;
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* 6. FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#337ab7] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#3498db]" />
                    <span>{languageCode === 'vi' ? 'Câu Hỏi Thường Gặp (FAQ)' : 'Frequently Asked Questions'}</span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {languageCode === 'vi'
                      ? 'Giải đáp những thắc mắc phổ biến khi sử dụng ứng dụng AI CodeJudge.'
                      : 'Common questions and troubleshooting advice.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <h4 className="font-bold text-sm text-[#337ab7]">
                      {languageCode === 'vi' ? 'Gemini API Key có mất phí không?' : 'Is the Gemini API Key free?'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {languageCode === 'vi'
                        ? 'Hoàn toàn MIỄN PHÍ. Google cung cấp gói Free Tier với hàng chục lượt gọi mỗi phút cho Gemini Flash, thoải mái phục vụ cho việc học tập và thi đấu.'
                        : 'Yes, 100% free! Google provides a generous free tier for Gemini Flash models.'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <h4 className="font-bold text-sm text-[#337ab7]">
                      {languageCode === 'vi' ? 'Làm sao để tắt hẳn comment trong code lời giải của AI?' : 'How to toggle comments in AI solutions?'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {languageCode === 'vi'
                        ? 'Bạn vào menu Settings (nút Key). Mặc định tính năng comment đã được tắt để code sạch 100%. Nếu muốn đọc giải thích thuật toán, bạn chỉ cần tích chọn "Include explanation comments".'
                        : 'Open Settings (Key button). By default, comments are stripped for 100% clean code. Check the box if you want in-code explanations.'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-200 shadow-xs'
                    }`}>
                    <h4 className="font-bold text-sm text-[#337ab7]">
                      {languageCode === 'vi' ? 'Dữ liệu của tôi có được bảo mật không?' : 'Is my data secure?'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {languageCode === 'vi'
                        ? 'Tất cả API Key, đề bài và mã nguồn của bạn đều được lưu trữ trực tiếp trên LocalStorage của trình duyệt máy bạn, không gửi về bất kỳ máy chủ bên thứ ba nào ngoại trừ sandbox biên dịch.'
                        : 'All data and keys stay in your browser LocalStorage without third-party tracking.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. LICENSE & COPYRIGHT (RAW VIEWER) */}
            {activeTab === 'license' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#337ab7] flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-500" />
                    <span>
                      {languageCode === 'vi'
                        ? 'Giấy Phép Bản Quyền & Điều Khoản Sử Dụng'
                        : 'License & Terms of Use (CC BY-NC 4.0)'}
                    </span>
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {languageCode === 'vi'
                      ? 'Dự án AI CodeJudge được phát hành theo Giấy phép Quốc tế Creative Commons Ghi nhận công của tác giả - Phi thương mại 4.0.'
                      : 'AI CodeJudge is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.'}
                  </p>
                </div>

                {/* Key Points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-3.5 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#1a291f] border-[#255233]' : 'bg-green-50 border-green-300'
                    }`}>
                    <div className={`flex items-center gap-1.5 font-bold text-xs ${appTheme === 'dark' ? 'text-green-300' : 'text-green-900'
                      }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{languageCode === 'vi' ? 'Được phép tự do' : 'Permitted'}</span>
                    </div>
                    <p className={`text-xs leading-relaxed font-semibold ${appTheme === 'dark' ? 'text-gray-200' : 'text-[#0f172a]'
                      }`}>
                      {languageCode === 'vi'
                        ? 'Sử dụng, sao chép, chỉnh sửa, remix và đóng góp mã nguồn phục vụ học tập, nghiên cứu và cá nhân.'
                        : 'Free to use, modify, remix, and share for educational and non-commercial purposes.'}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-lg border space-y-1.5 ${appTheme === 'dark' ? 'bg-[#2d1c1c] border-[#5c2424]' : 'bg-red-50 border-red-300'
                    }`}>
                    <div className={`flex items-center gap-1.5 font-bold text-xs ${appTheme === 'dark' ? 'text-red-300' : 'text-red-900'
                      }`}>
                      <X className="w-4 h-4 shrink-0" />
                      <span>{languageCode === 'vi' ? 'Phi thương mại' : 'Non-Commercial'}</span>
                    </div>
                    <p className={`text-xs leading-relaxed font-semibold ${appTheme === 'dark' ? 'text-gray-200' : 'text-[#0f172a]'
                      }`}>
                      {languageCode === 'vi'
                        ? 'TUYỆT ĐỐI KHÔNG sử dụng dự án cho mục đích thương mại hoặc kinh doanh sinh lời nếu chưa có sự đồng ý của tác giả.'
                        : 'Commercial use or resale is strictly prohibited without explicit written consent.'}
                    </p>
                  </div>
                </div>

                {/* Raw License Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${appTheme === 'dark' ? 'text-gray-200' : 'text-[#0f172a]'
                      }`}>
                      <Code2 className="w-3.5 h-3.5 text-[#337ab7]" />
                      <span>{languageCode === 'vi' ? 'Toàn văn Raw Giấy Phép (LICENSE):' : 'Full Raw LICENSE Text:'}</span>
                    </span>

                    <button
                      onClick={handleCopyLicense}
                      className={`btn-classic btn-default text-xs py-1 px-2.5 flex items-center gap-1 font-semibold ${appTheme === 'dark' ? 'text-gray-200' : 'text-[#0f172a] border-gray-300'
                        }`}
                    >
                      {copiedLicense ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLicense ? 'Đã sao chép' : 'Sao chép Raw'}</span>
                    </button>
                  </div>

                  <pre className={`p-4 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto border max-h-72 select-all ${appTheme === 'dark'
                    ? 'bg-[#151515] border-[#333] text-gray-200'
                    : 'bg-gray-50 border-gray-300 text-[#0f172a] font-semibold'
                    }`}>
                    {RAW_LICENSE_TEXT}
                  </pre>
                </div>

                {/* Author & Repo Footnote */}
                <div className={`p-3.5 rounded-lg border flex items-center justify-between text-xs ${appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-gray-300 shadow-xs'
                  }`}>
                  <div className="space-y-0.5">
                    <span className={`font-bold text-sm block ${appTheme === 'dark' ? 'text-white' : 'text-[#0f172a]'}`}>
                      Tác giả: luongvantam
                    </span>
                    <span className={`block font-semibold ${appTheme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                      GitHub: <a href="https://github.com/luongvantam" target="_blank" rel="noreferrer" className="text-[#337ab7] hover:underline font-mono font-bold">@luongvantam</a>
                    </span>
                  </div>

                  <a
                    href="https://github.com/luongvantam/ai-codejudge"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-classic btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Xem trên GitHub</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${appTheme === 'dark' ? 'bg-[#181818] border-[#333]' : 'bg-[#f5f5f5] border-[#ddd]'
            }`}
        >
          <div className="flex items-center gap-2 text-gray-500 font-mono text-[11px]">
            <span>
              &copy; {new Date().getFullYear()}{' '}
              <a
                href="https://github.com/luongvantam"
                target="_blank"
                rel="noreferrer"
                className="text-[#337ab7] hover:underline font-bold"
              >
                luongvantam
              </a>{' '}
              • All rights reserved.
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn-classic btn-primary text-xs px-4 py-1.5 font-bold"
          >
            {languageCode === 'vi' ? 'Đã Hiểu / Đóng' : 'Got it / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
