import React from 'react';
import {
  User,
  GraduationCap,
  Heart,
  Users,
  Briefcase,
  Star,
  FileText,
  Settings,
  LogIn,
  Cloud,
  Download,
} from 'lucide-react';
import { ActiveScreen, CategoryId } from '../types';
import { ShibirLogo } from './ShibirLogo';

interface HomeCategoriesProps {
  userName?: string;
  userSubtitle?: string;
  onSelectCategory: (categoryId: CategoryId) => void;
  onNavigate: (screen: ActiveScreen) => void;
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
  onOpenInstall?: () => void;
  isInstalled?: boolean;
}

export const HomeCategories: React.FC<HomeCategoriesProps> = ({
  userName = 'ব্যবহারকারী',
  userSubtitle,
  onSelectCategory,
  onNavigate,
  isLoggedIn = false,
  onOpenAuth,
  onOpenInstall,
  isInstalled = false,
}) => {
  const categories: {
    id: CategoryId;
    title: string;
    icon: React.ReactNode;
    bgColor: string;
    iconColor: string;
    action?: () => void;
  }[] = [
    {
      id: 'personal_info',
      title: 'ব্যক্তিগত তথ্য',
      icon: <User className="w-7 h-7" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100/80 border-blue-100',
      iconColor: 'text-blue-600',
      action: () => onSelectCategory('personal_info'),
    },
    {
      id: 'edu_info',
      title: 'শিক্ষাগত তথ্য',
      icon: <GraduationCap className="w-7 h-7" />,
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100',
      iconColor: 'text-emerald-600',
      action: () => onSelectCategory('edu_info'),
    },
    {
      id: 'health_info',
      title: 'স্বাস্থ্য তথ্য',
      icon: <Heart className="w-7 h-7" />,
      bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-100',
      iconColor: 'text-rose-500',
      action: () => onSelectCategory('health_info'),
    },
    {
      id: 'family_info',
      title: 'পারিবারিক তথ্য',
      icon: <Users className="w-7 h-7" />,
      bgColor: 'bg-teal-50 hover:bg-teal-100/80 border-teal-100',
      iconColor: 'text-teal-600',
      action: () => onSelectCategory('family_info'),
    },
    {
      id: 'job_info',
      title: 'পেশাগত তথ্য',
      icon: <Briefcase className="w-7 h-7" />,
      bgColor: 'bg-sky-50 hover:bg-sky-100/80 border-sky-100',
      iconColor: 'text-sky-600',
      action: () => onSelectCategory('job_info'),
    },
    {
      id: 'extra_info',
      title: 'অতিরিক্ত তথ্য',
      icon: <Star className="w-7 h-7" />,
      bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-100',
      iconColor: 'text-amber-500',
      action: () => onSelectCategory('extra_info'),
    },
    {
      id: 'about_shibir',
      title: 'ছাত্রশিবির সম্পর্কে',
      icon: <ShibirLogo size={28} />,
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
      iconColor: 'text-emerald-700',
      action: () => onNavigate('about_shibir'),
    },
    {
      id: 'view_reports',
      title: 'রিপোর্ট বই ও ডাউনলোড',
      icon: <FileText className="w-7 h-7" />,
      bgColor: 'bg-purple-50 hover:bg-purple-100/80 border-purple-100',
      iconColor: 'text-purple-600',
      action: () => onNavigate('report'),
    },
    {
      id: 'settings',
      title: 'সেটিংস',
      icon: <Settings className="w-7 h-7" />,
      bgColor: 'bg-slate-100 hover:bg-slate-200/80 border-slate-200',
      iconColor: 'text-slate-600',
      action: () => onNavigate('settings'),
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Account / Login Prompt Banner on Home */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-r from-blue-900 to-[#0f2b5c] text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <LogIn className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold truncate">ক্লাউডে ব্যাকআপ রাখতে লগইন করুন</h3>
              <p className="text-[10px] text-blue-200 truncate mt-0.5">
                গুগল বা ইমেইল দিয়ে সহজে লগইন করতে ট্যাপ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white text-xs font-bold shrink-0 shadow-xs transition-all cursor-pointer"
          >
            লগইন করুন
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">স্বাগতম, {userName}</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold shrink-0">
                  ক্লাউড সক্রিয়
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                আপনার রিপোর্ট ও তথ্য ক্লাউডে সংরক্ষিত রয়েছে
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold shrink-0 cursor-pointer"
          >
            অ্যাকাউন্ট
          </button>
        </div>
      )}

      {/* Install App Prompt Card if not already installed */}
      {!isInstalled && onOpenInstall && (
        <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">
                অ্যাপটি মোবাইলে ইনস্টল করুন
              </h4>
              <p className="text-[10px] text-emerald-800 font-medium truncate mt-0.5">
                অফলাইনে ইন্টারনেট ছাড়াই দ্রুত ব্যবহার করার জন্য
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInstall}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shrink-0 shadow-xs transition-all cursor-pointer"
          >
            ইনস্টল
          </button>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`home-category-card-${cat.id}`}
            onClick={cat.action}
            className={`${cat.bgColor} border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all transform active:scale-95 shadow-xs cursor-pointer`}
          >
            <div className={`p-2.5 rounded-xl bg-white shadow-xs ${cat.iconColor}`}>
              {cat.icon}
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              {cat.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
