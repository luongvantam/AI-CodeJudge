import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { ocrProblemImage } from '../services/geminiService';
import type { ProblemStatement } from '../types/problem';
import { TRANSLATIONS, type LanguageCode } from '../constants/translations';

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onProblemExtracted: (problem: ProblemStatement) => void;
  onOpenApiKeyModal: () => void;
  model: string;
  languageCode?: LanguageCode;
  appTheme?: 'light' | 'dark';
}

export const OcrModal: React.FC<OcrModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onProblemExtracted,
  onOpenApiKeyModal,
  model,
  languageCode = 'en',
  appTheme = 'light',
}) => {
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[languageCode];

  // Paste screenshot event listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setSelectedImage({
        base64: resultStr,
        mimeType: file.type,
        preview: resultStr,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartOcr = async () => {
    if (!apiKey) {
      setError(t.ocrNeedKey);
      return;
    }
    if (!selectedImage) {
      setError('Please select or paste an image first!');
      return;
    }

    setLoading(true);
    setError(null);
    setProgressStatus('Sending image to Gemini Vision...');
    setProgressPercent(20);

    const timer1 = setTimeout(() => {
      setProgressStatus('Recognizing text & LaTeX math formulas...');
      setProgressPercent(60);
    }, 1200);

    const timer2 = setTimeout(() => {
      setProgressStatus('Formatting Markdown...');
      setProgressPercent(90);
    }, 3000);

    try {
      const result = await ocrProblemImage(
        apiKey,
        selectedImage.base64,
        selectedImage.mimeType,
        model,
        (status, percent) => {
          setProgressStatus(status);
          setProgressPercent(percent);
        }
      );
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgressPercent(100);
      setProgressStatus('Complete!');
      setTimeout(() => {
        onProblemExtracted(result.problem);
        onClose();
      }, 400);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setError(err.message || 'Error during OCR extraction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className={`border rounded shadow-xl w-full max-w-xl overflow-hidden text-sm ${
        appTheme === 'dark' ? 'bg-[#252526] border-[#444] text-gray-200' : 'bg-white border-[#999] text-gray-800'
      }`}>
        {/* Modal Header */}
        <div className="bg-[#337ab7] text-white px-4 py-2.5 flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f1c40f]" />
            <span>{t.ocrTitle}</span>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {!apiKey && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded text-xs flex items-center justify-between">
              <span>{t.ocrNeedKey}</span>
              <button
                onClick={onOpenApiKeyModal}
                className="btn-classic bg-amber-600 text-white hover:bg-amber-700 text-xs py-0.5 px-2"
              >
                Key
              </button>
            </div>
          )}

          {/* Upload / Paste Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              selectedImage
                ? 'border-[#5cb85c] bg-green-50/20'
                : appTheme === 'dark'
                ? 'border-gray-600 hover:border-[#337ab7] bg-[#1e1e1e]'
                : 'border-gray-300 hover:border-[#337ab7] bg-[#fafafa]'
            } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {selectedImage ? (
              <div className="space-y-3">
                <div className={`max-h-56 overflow-auto flex justify-center border rounded p-1 ${
                  appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#444]' : 'bg-white border-gray-200'
                }`}>
                  <img
                    src={selectedImage.preview}
                    alt="Problem Preview"
                    className="max-h-48 object-contain rounded"
                  />
                </div>
                <p className="text-xs text-green-600 font-medium">
                  {t.ocrUploadedSuccess}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Upload className="w-10 h-10 text-[#337ab7]" />
                </div>
                <p className="font-semibold text-sm">
                  {t.ocrDropzoneText}
                </p>
                <p className="text-xs text-gray-500">
                  {t.ocrPasteHint}
                </p>
                <p className="text-[11px] text-gray-400">
                  {t.ocrSupportedFormats}
                </p>
              </div>
            )}
          </div>

          {/* Loading status bar */}
          {loading && (
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 font-semibold">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#337ab7]" />
                  <span>{progressStatus}</span>
                </div>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#337ab7] h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded text-xs bg-red-50 text-red-700 border border-red-200 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between ${
          appTheme === 'dark' ? 'bg-[#1e1e1e] border-[#333]' : 'bg-[#f5f5f5] border-[#ddd]'
        }`}>
          <span className="text-xs text-gray-500">
            Model: <strong className="font-mono">{model}</strong>
          </span>
          <div className="flex items-center gap-2">
            {!loading && (
              <button onClick={onClose} className="btn-classic btn-default text-xs">
                {t.cancel}
              </button>
            )}
            <button
              onClick={handleStartOcr}
              disabled={loading || !selectedImage}
              className="btn-classic btn-success text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.ocrExtracting}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.ocrButton}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
