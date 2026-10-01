import React from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  ShieldCheck,
  WifiOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ShibirLogo } from './ShibirLogo';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { hasNativePrompt, isIOS, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4 pt-1">
          {/* Downloaded App Icon preview */}
          <div className="mx-auto flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="/installed-app-icon.png"
                alt="ডাউনলোড পরবর্তী অ্যাপ আইকন"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 mt-2">
              ডাউনলোড পরবর্তী হোমস্ক্রিন অ্যাপ আইকন
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              ব্যক্তিগত রিপোর্ট বই অ্যাপ
            </h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
              বাংলাদেশ ইসলামী ছাত্রশিবির
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ফোনে অ্যাপ হিসেবে ইনস্টল করে ইন্টারনেট ছাড়াও দ্রুত ব্যবহার করুন
            </p>
          </div>

          {/* Benefits list */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-left space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>মোবাইলের হোমস্ক্রিনে অ্যাপ আইকন যুক্ত হবে</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-blue-600 shrink-0" />
              <span>অফলাইনে নেট ছাড়াও তাৎক্ষণিক ডেটা পূরণ ও অটো-সেভ</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ব্রাউজার অ্যাড্রেস বার ছাড়া ফুল-স্ক্রিন এক্সপেরিয়েন্স</span>
            </div>
          </div>

          {/* iOS Safari Guided Steps */}
          {isIOS ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-left space-y-2 text-xs text-blue-950">
              <p className="font-bold text-blue-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-700" />
                <span>আইফোন (iOS) এ ইনস্টল করার নিয়ম:</span>
              </p>
              <div className="space-y-1.5 text-[11px] text-blue-900">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 font-bold flex items-center justify-center text-blue-900 shrink-0">
                    ১
                  </span>
                  <span>
                    Safari ব্রাউজারের নিচে <b>Share (শেয়ার)</b> আইকনে <Share className="w-3.5 h-3.5 inline mx-0.5" /> চাপুন।
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 font-bold flex items-center justify-center text-blue-900 shrink-0">
                    ২
                  </span>
                  <span>
                    মেনু থেকে <b>"Add to Home Screen"</b> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" /> নির্বাচন করে <b>"Add"</b> চাপুন।
                  </span>
                </div>
              </div>
            </div>
          ) : isInstalled ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে!</span>
            </div>
          ) : hasNativePrompt ? (
            /* Android / Desktop Direct 1-Click Install */
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-[#0f2b5c] hover:bg-blue-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>অ্যাপ ইনস্টল করুন (Add to Phone)</span>
            </button>
          ) : (
            /* Fallback browser menu prompt */
            <div className="space-y-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 text-left">
                <p className="font-bold">ব্রাউজার মেনু থেকে ইনস্টল করুন:</p>
                <p className="text-[11px] text-amber-800 mt-1">
                  ব্রাউজারের ৩ ডট (⋮) মেনু চেপে <b>"Install app"</b> অথবা <b>"Add to Home screen"</b> নির্বাচন করুন।
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            পরে করব
          </button>
        </div>
      </div>
    </div>
  );
};
