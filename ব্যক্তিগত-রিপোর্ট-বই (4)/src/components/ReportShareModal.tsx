import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Send,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { ReportRecord } from '../types';
import {
  renderReportToCanvas,
  downloadReportImage,
  getCanvasBlob,
  ReportCardTheme,
} from '../utils/reportImageGenerator';
import { generateWhatsAppReportSummary } from '../utils/reportSummary';

interface ReportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportRecord;
  userName?: string;
}

export const ReportShareModal: React.FC<ReportShareModalProps> = ({
  isOpen,
  onClose,
  report,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [theme, setTheme] = useState<ReportCardTheme>('navy');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const textSummary = generateWhatsAppReportSummary(report, userName);
  const fileName = `bekti-report-${report.month}-${report.year}.png`.replace(/\s+/g, '-');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Re-render canvas whenever report, theme, or modal visibility changes
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      renderReportToCanvas(canvasRef.current, report, userName, theme);
    }
  }, [isOpen, report, userName, theme, activeTab]);

  if (!isOpen) return null;

  // Direct WhatsApp Share Handler
  const handleShareToWhatsApp = () => {
    const encoded = encodeURIComponent(textSummary);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Native Web Share API Handler for Text
  const handleNativeShareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ব্যক্তিগত রিপোর্ট বই — ${report.month} ${report.year}`,
          text: textSummary,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyToClipboard();
        }
      }
    } else {
      handleCopyToClipboard();
    }
  };

  // Direct Text Copy to Clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textSummary);
      setCopiedText(true);
      showToast('টেক্সট সারাংশ সফলভাবে কপি হয়েছে!');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      showToast('কপি করা সম্ভব হয়নি। ম্যানুয়ালি কপি করুন।');
    }
  };

  // Direct PNG Download
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    downloadReportImage(canvasRef.current, fileName);
    showToast('রিপোর্ট কার্ডের ছবি ডাউনলোড শুরু হয়েছে!');
  };

  // Native Web Share for Image file (WhatsApp, Messenger, Telegram etc.)
  const handleShareImageFile = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await getCanvasBlob(canvasRef.current);
      if (!blob) {
        handleDownloadImage();
        return;
      }
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `ব্যক্তিগত রিপোর্ট সারাংশ — ${report.month} ${report.year}`,
          text: `বাংলাদেশ ইসলামী ছাত্রশিবির — ${report.month} ${report.year} এর ব্যক্তিগত রিপোর্ট সারাংশ কার্ড`,
          files: [file],
        });
      } else {
        handleDownloadImage();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleDownloadImage();
      }
    }
  };

  // Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await getCanvasBlob(canvasRef.current);
      if (!blob) return;

      if ((window as any).ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        const item = new (window as any).ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopiedImage(true);
        showToast('ছবি ক্লিপবোর্ডে কপি হয়েছে!');
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        handleDownloadImage();
      }
    } catch {
      handleDownloadImage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl relative border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0f2b5c] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate">
                রিপোর্ট শেয়ার করুন
              </h3>
              <p className="text-[11px] text-blue-200 truncate mt-0.5">
                {report.month} {report.year} — হোয়াটসঅ্যাপ ও সোশ্যাল মিডিয়ায় পাঠানোর জন্য প্রস্তুত
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md animate-in slide-in-from-top duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>ফটো কার্ড (ছবি)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>টেক্সট সারাংশ (WhatsApp)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'image' ? (
            /* TAB 1: Image Infographic Card */
            <div className="space-y-4">
              {/* Theme Picker */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-blue-600" />
                  কার্ডের থিম ডিজাইন:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme('navy')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      theme === 'navy'
                        ? 'bg-[#0f2b5c] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    রয়েল নেভি
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('emerald')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      theme === 'emerald'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    ইসলামিক গ্রিন
                  </button>
                </div>
              </div>

              {/* Canvas Preview Container */}
              <div className="bg-slate-900 rounded-2xl p-2 sm:p-3 border border-slate-300 shadow-inner flex items-center justify-center overflow-hidden max-h-[380px]">
                <canvas
                  ref={canvasRef}
                  className="max-h-[360px] w-auto h-auto rounded-xl shadow-lg object-contain"
                />
              </div>

              <p className="text-[11px] text-slate-500 text-center font-medium">
                উচ্চ রেজ্যুলেশনের ১০৮০x১৪৪০ পিক্সেল ইনফোগ্রাফিক কার্ড প্রস্তুত করা হয়েছে
              </p>

              {/* Image Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* 1. Share File */}
                <button
                  type="button"
                  onClick={handleShareImageFile}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>ছবি শেয়ার করুন</span>
                </button>

                {/* 2. Download Image */}
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ডাউনলোড (PNG)</span>
                </button>

                {/* 3. Copy Image */}
                <button
                  type="button"
                  onClick={handleCopyImageToClipboard}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-95 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedImage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedImage ? 'কপি হয়েছে' : 'ছবি কপি করুন'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: Text Summary (WhatsApp format) */
            <div className="space-y-4">
              {/* WhatsApp Quick Action Button */}
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>সরাসরি হোয়াটসঅ্যাপে (WhatsApp) পাঠান</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Text Area Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>টেক্সট সারাংশ প্রিভিউ:</span>
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'কপি সম্পন্ন!' : 'সব কপি করুন'}</span>
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 font-mono text-[11px] leading-relaxed text-slate-800 max-h-[260px] overflow-y-auto whitespace-pre-wrap select-text">
                  {textSummary}
                </div>
              </div>

              {/* Text Bottom Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText ? 'কপি হয়েছে' : 'ক্লিপবোর্ডে কপি করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShareText}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-95 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>অন্যান্য মাধ্যমে শেয়ার</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 shrink-0">
          দায়িত্বশীল ভাইয়ের কাছে রিপোর্ট পাঠাতে বা ব্যক্তিগত ডায়রিতে সংরক্ষণ করতে এই শেয়ার অপশনটি ব্যবহার করুন।
        </div>
      </div>
    </div>
  );
};
