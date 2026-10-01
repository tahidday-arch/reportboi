import React from 'react';
import { Menu, Settings, ArrowLeft, User, LogIn, Cloud, Download } from 'lucide-react';
import { ShibirLogo } from './ShibirLogo';

interface NavbarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenDrawer: () => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  onOpenAuth?: () => void;
  onOpenInstall?: () => void;
  isLoggedIn?: boolean;
  isInstalled?: boolean;
  profileImage?: string;
  onUpdateProfileImage?: (base64: string) => void;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenDrawer,
  onOpenSettings,
  onOpenProfile,
  onOpenAuth,
  onOpenInstall,
  isLoggedIn = false,
  isInstalled = false,
  profileImage,
  userName = 'ইউজার',
}) => {
  return (
    <header
      id="app-top-navbar"
      className="w-full bg-[#0f2b5c] text-white px-3 sm:px-4 py-2 flex items-center justify-between shadow-md select-none sticky top-0 z-30 no-print border-b border-blue-900/60"
    >
      {/* Left section: Drawer/Back toggle + Shibir Monogram + Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {showBack ? (
          <button
            id="nav-back-button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors focus:outline-none shrink-0"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button
            id="nav-drawer-toggle"
            onClick={onOpenDrawer}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors focus:outline-none shrink-0"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 drop-shadow-sm">
            <ShibirLogo size={36} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight truncate">
              {title || 'ব্যক্তিগত রিপোর্ট বই'}
            </h1>
            <p className="text-[10px] text-emerald-300 font-semibold leading-none mt-0.5 truncate">
              বাংলাদেশ ইসলামী ছাত্রশিবির
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Install + Login button / Profile Picture + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Install App Button if not already installed */}
        {!isInstalled && onOpenInstall && (
          <button
            id="nav-install-button"
            onClick={onOpenInstall}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs border border-emerald-400/50 shadow-xs transition-all cursor-pointer"
            title="অ্যাপ ইনস্টল করুন"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold hidden xs:inline">ইনস্টল</span>
          </button>
        )}

        {/* If not logged in, show quick login button */}
        {!isLoggedIn ? (
          <button
            id="nav-login-button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="গুগল দিয়ে লগইন করুন"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">লগইন</span>
          </button>
        ) : null}

        {/* User Profile Avatar */}
        <div className="relative flex items-center">
          <button
            id="nav-profile-button"
            onClick={onOpenProfile}
            title={profileImage ? 'প্রোফাইল দেখুন' : 'প্রোফাইল'}
            className="w-9 h-9 rounded-xl border border-emerald-400/60 bg-white/10 hover:bg-white/20 active:scale-95 transition-all p-0.5 flex items-center justify-center relative overflow-hidden shadow-xs focus:outline-none cursor-pointer"
            aria-label="প্রোফাইল"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={userName}
                className="w-full h-full object-cover rounded-[10px]"
              />
            ) : (
              <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-blue-700 to-emerald-600 flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
            )}
          </button>

          {/* Cloud Synced Online Indicator if logged in */}
          {isLoggedIn && (
            <span
              title="ক্লাউড ডাটাবেজ সক্রিয়"
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-[#0f2b5c] shadow-xs"
            >
              <Cloud className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Settings button */}
        <button
          id="nav-settings-button"
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
          aria-label="সেটিংস"
        >
          <Settings className="w-5 h-5 text-white/90" />
        </button>
      </div>
    </header>
  );
};
