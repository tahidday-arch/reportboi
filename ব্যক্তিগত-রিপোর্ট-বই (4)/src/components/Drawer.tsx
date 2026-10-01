import React from 'react';
import { Home, FileText, Edit3, User, Settings, X, BookOpen, LogIn, Cloud, Download } from 'lucide-react';
import { ActiveScreen } from '../types';
import { ShibirLogo } from './ShibirLogo';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  userName?: string;
  profileImage?: string;
  isLoggedIn?: boolean;
  userEmail?: string;
  onOpenAuth?: () => void;
  onOpenInstall?: () => void;
  isInstalled?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  userName = 'ব্যবহারকারী',
  profileImage,
  isLoggedIn = false,
  userEmail,
  onOpenAuth,
  onOpenInstall,
  isInstalled = false,
}) => {
  if (!isOpen) return null;

  const menuItems: { id: ActiveScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'হোম', icon: <Home className="w-5 h-5" /> },
    { id: 'report', label: 'রিপোর্ট বই ও ডাউনলোড', icon: <FileText className="w-5 h-5" /> },
    { id: 'about_shibir', label: 'ছাত্রশিবির সম্পর্কে', icon: <ShibirLogo size={20} /> },
    { id: 'notes', label: 'নোটস', icon: <Edit3 className="w-5 h-5" /> },
    { id: 'profile', label: 'প্রোফাইল', icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: 'সেটিংস', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div id="drawer-overlay" className="fixed inset-0 z-50 flex no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-[290px] max-w-[85vw] bg-[#0f2b5c] text-white h-full flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-5 border-b border-blue-800/60 bg-[#0d2244]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {profileImage ? (
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl border-2 border-emerald-400 overflow-hidden shadow-sm">
                    <img src={profileImage} alt={userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <ShibirLogo size={18} />
                  </div>
                </div>
              ) : (
                <div className="shrink-0">
                  <ShibirLogo size={42} />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white leading-tight truncate">{userName}</h2>
                <p className="text-[11px] text-emerald-300 font-semibold leading-tight mt-0.5 truncate">
                  বাংলাদেশ ইসলামী ছাত্রশিবির
                </p>
                {isLoggedIn && userEmail && (
                  <p className="text-[10px] text-blue-200/80 truncate mt-0.5">{userEmail}</p>
                )}
              </div>
            </div>
            <button
              id="drawer-close-btn"
              onClick={onClose}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 shrink-0"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account status or login button */}
          <div className="mt-2 pt-2 border-t border-blue-800/40">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth?.();
                }}
                className="w-full flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-[11px] text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ক্লাউড সিঙ্ক সক্রিয়</span>
                </span>
                <span className="text-[10px] bg-emerald-600/60 text-white px-1.5 py-0.5 rounded font-bold">
                  অ্যাকাউন্ট
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth?.();
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>গুগল দিয়ে লগইন করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`drawer-item-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-100 hover:bg-blue-800/40'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-blue-300'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Install App button if not already installed */}
          {!isInstalled && onOpenInstall && (
            <button
              onClick={() => {
                onClose();
                onOpenInstall();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 transition-colors cursor-pointer mt-2"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              <span>অ্যাপ ইনস্টল করুন (Add to Phone)</span>
            </button>
          )}
        </div>

        {/* Footer quote */}
        <div className="p-4 border-t border-blue-800/40 bg-[#0c1f3d] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1 text-blue-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-[11px] font-bold tracking-wide">রিপোর্ট বই নির্দেশিকা</span>
          </div>
          <p className="text-[11px] text-blue-200/80 leading-relaxed italic">
            "হে ঈমানদারগণ! তোমরা আল্লাহকে যেমন ভয় করা উচিত তেমনি ভয় কর এবং আত্মসমর্পণকারী (মুসলিম) না হয়ে মৃত্যুবরণ করো না।"
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">— সূরা আলে ইমরান: ১০২</p>
        </div>
      </div>
    </div>
  );
};
