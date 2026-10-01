import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Award,
  Users,
  HeartHandshake,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Building,
  Target,
  FileText,
} from 'lucide-react';
import { ShibirLogo } from './ShibirLogo';
import { ActiveScreen } from '../types';

interface AboutShibirViewProps {
  onBack: () => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const AboutShibirView: React.FC<AboutShibirViewProps> = ({
  onBack,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'program' | 'structure' | 'welfare' | 'motto'>('overview');

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-[#0a1f44] via-[#0f2b5c] to-blue-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-3 top-3 opacity-15 pointer-events-none">
          <ShibirLogo size={120} />
        </div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 active:bg-white/30 text-white px-3 py-1.5 rounded-full transition-all cursor-pointer backdrop-blur-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরুন</span>
          </button>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold">
            সংগঠন পরিচিতি
          </span>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-1 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 shadow-md">
            <ShibirLogo size={58} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              বাংলাদেশ ইসলামী ছাত্রশিবির
            </h1>
            <p className="text-xs text-blue-200 mt-0.5 font-medium">
              Bangladesh Islami Chhatrashibir
            </p>
            <p className="text-[11px] text-emerald-300 font-semibold mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              প্রতিষ্ঠা: ৬ ফেব্রুয়ারি, ১৯৭৭
            </p>
          </div>
        </div>

        {/* Motto Banner */}
        <div className="mt-4 pt-3.5 border-t border-blue-700/50 relative z-10">
          <p className="text-xs text-amber-200 font-bold tracking-wide leading-relaxed">
            &ldquo;আল্লাহ আমাদের রব, মুহাম্মদ আমাদের রাসুল, কুরআন আমাদের সংবিধান, জিহাদ আমাদের পথ, শাহাদাত আমাদের তামান্না।&rdquo;
          </p>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'পরিচিতি ও লক্ষ্য', icon: BookOpen },
          { id: 'motto', label: 'মূল স্লোগান', icon: Target },
          { id: 'program', label: '৪ দফা কর্মসূচি', icon: Compass },
          { id: 'structure', label: 'সাংগঠনিক স্তর', icon: Users },
          { id: 'welfare', label: 'ছাত্রকল্যাণ', icon: HeartHandshake },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: পরিচিতি ও লক্ষ্য */}
      {activeTab === 'overview' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* সংক্ষেপ পরিচিতি */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 border-b border-slate-100 pb-2.5">
              <Building className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold">সংক্ষিপ্ত পরিচিতি ও ইতিহাস</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 text-justify font-medium">
              বাংলাদেশ ইসলামী ছাত্রশিবির বাংলাদেশের একটি সুশৃঙ্খল ও সর্ববৃহৎ আদর্শিক ছাত্র সংগঠন। ১৯৭৭ সালের ৬ ফেব্রুয়ারি ঐতিহাসিক ঢাকা বিশ্ববিদ্যালয় কেন্দ্রীয় জামে মসজিদ চত্বরে ৬ জন দূরদর্শী ছাত্রনেতার হাত ধরে এ কাফেলার শুভ সূচনা হয়। সংগঠনের প্রথম নির্বাচিত কেন্দ্রীয় সভাপতি ছিলেন মীর কাসেম আলী।
            </p>
            <p className="text-xs leading-relaxed text-slate-700 text-justify font-medium">
              প্রতিষ্ঠালগ্ন থেকেই ছাত্রসমাজকে কুরআন ও সুন্নাহর ভিত্তিতে যোগ্য, সৎ, চরিত্রবান, দেশপ্রেমিক ও দক্ষ ভবিষ্যৎ নেতৃত্ব হিসেবে গড়ে তুলতে সংগঠনটি নিরলসভাবে কাজ করে যাচ্ছে।
            </p>
          </div>

          {/* লক্ষ্য ও উদ্দেশ্য */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 border-b border-emerald-200/60 pb-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold">সংগঠনের লক্ষ্য ও উদ্দেশ্য</h3>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
              <p className="text-xs font-bold text-emerald-950 leading-relaxed text-center">
                &ldquo;আল্লাহ তায়ালা প্রদত্ত ও তাঁর রাসূল (সা.) প্রদর্শিত জীবনবিধান অনুযায়ী মানুষের সার্বিক জীবনের পুনর্গঠন করে মহান আল্লাহর সন্তুষ্টি অর্জন।&rdquo;
              </p>
            </div>
            <ul className="space-y-1.5 pt-1 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>ছাত্রদেরকে দ্বীন ইসলামের সার্বিক জ্ঞানের অধিকারী হিসেবে গড়ে তোলা।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>নৈতিক অবক্ষয় থেকে মুক্ত রেখে ব্যক্তিগত চরিত্রবান নাগরিক তৈরি করা।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>মেধা বিকাশে সহযোগিতা ও জাতির যেকোনো প্রয়োজনে ইতিবাচক ভূমিকা পালন।</span>
              </li>
            </ul>
          </div>

          {/* ৫ দফা গুণাবলি */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold">ছাত্রশিবিরের একজন কর্মীর ৫টি মৌলিক গুণাবলি</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { title: '১. মজবুত ঈমান ও তাকওয়া', desc: 'সকল কাজে মহান আল্লাহর ভয় ও সার্বক্ষণিক সন্তুষ্টি অর্জনের ব্যাকুলতা।' },
                { title: '২. উন্নত আখলাক ও চরিত্র', desc: 'রাসূলুল্লাহ (সা.)-এর আদর্শে নম্রতা, সত্যবাদিতা ও আমানতদারিতা রক্ষা।' },
                { title: '৩. পড়াশোনায় শ্রেষ্ঠত্ব', desc: 'একাডেমিক ক্লাসে মেধার সর্বোচ্চ বিকাশ ঘটিয়ে শ্রেষ্ঠ ফলাফল অর্জন।' },
                { title: '৪. নিঃস্বার্থ সমাজসেবা', desc: 'সাধারণ শিক্ষার্থী ও মানবতার কল্যাণে আত্মনিয়োগ করা।' },
                { title: '৫. দেশপ্রেম ও জাতির দায়বদ্ধতা', desc: 'মাতৃভূমির স্বাধীনতা-সার্বভৌমত্ব রক্ষা ও সত্যের পথে অবিচল থাকা।' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-blue-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: মূল স্লোগান */}
      {activeTab === 'motto' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 border-b border-slate-100 pb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold">ঐতিহাসিক ৫ মূলনীতি ও স্লোগান</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              ছাত্রশিবিরের প্রতিটি দায়িত্বশীল ও কর্মীর জীবনের মূল চালিকাশক্তি হলো এই কালজয়ী বিপ্লবী স্লোগান:
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  motto: 'আল্লাহ আমাদের রব (Allah is our Lord)',
                  desc: 'আমাদের একমাত্র উপাস্য, পালনকর্তা ও সার্বভৌম ক্ষমতার মালিক আল্লাহ তায়ালা। তাঁর সন্তুষ্টিই চূড়ান্ত লক্ষ্য।',
                  badge: 'তাওহীদ',
                  color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
                },
                {
                  motto: 'মুহাম্মদ আমাদের রাসুল (Muhammad is our Prophet)',
                  desc: 'হযরত মুহাম্মদ (সা.) আমাদের জীবনের একমাত্র আদর্শ শিক্ষক, পথপ্রদর্শক ও অনুসরণীয় নেতা।',
                  badge: 'রিসালাত',
                  color: 'border-blue-200 bg-blue-50/50 text-blue-900',
                },
                {
                  motto: 'কুরআন আমাদের সংবিধান (Quran is our Constitution)',
                  desc: 'পবিত্র কুরআন আমাদের ব্যক্তিগত, পারিবারিক, সামাজিক ও রাষ্ট্রীয় জীবনের একমাত্র নির্ভুল পথনির্দেশ।',
                  badge: 'হেদায়েত',
                  color: 'border-teal-200 bg-teal-50/50 text-teal-900',
                },
                {
                  motto: 'জিহাদ আমাদের পথ (Jihad is our Path)',
                  desc: 'অন্যায়, জুলুম ও অসত্যের মূলোৎপাটন এবং সত্য ও ইনসাফ কায়েমে আজীবন সর্বাত্মক প্রচেষ্টা চালানো।',
                  badge: 'সংগ্রাম',
                  color: 'border-amber-200 bg-amber-50/50 text-amber-900',
                },
                {
                  motto: 'শাহাদাত আমাদের তামান্না (Martyrdom is our Desire)',
                  desc: 'আল্লাহর সন্তুষ্টি ও দ্বীনের বিজয়ের জন্য জীবন উৎসর্গ করতে পারা একজন মুমিনের সর্বোচ্চ আকাঙ্ক্ষা।',
                  badge: 'চূড়ান্ত লক্ষ্য',
                  color: 'border-rose-200 bg-rose-50/50 text-rose-900',
                },
              ].map((item, i) => (
                <div key={i} className={`p-3.5 rounded-2xl border ${item.color} shadow-2xs space-y-1`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold">{item.motto}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-current shadow-2xs">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ৪ দফা কর্মসূচি */}
      {activeTab === 'program' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 border-b border-slate-100 pb-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold">ছাত্রশিবিরের ৪ দফা কর্মসূচি</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              লক্ষ্য অর্জনের উদ্দেশ্যে বাংলাদেশ ইসলামী ছাত্রশিবির সুনির্দিষ্ট ৪ দফা কর্মসূচির মাধ্যমে সারা দেশে কার্যক্রম পরিচালনা করে:
            </p>

            <div className="space-y-3 pt-1">
              {[
                {
                  no: '১',
                  name: 'দাওয়াত (Call to Truth)',
                  summary: 'ছাত্র সমাজের মাঝে ইসলামের সুমহান জীবনব্যবস্থার দাওয়াত পৌঁছে দেওয়া।',
                  points: [
                    'স্কুল, কলেজ, বিশ্ববিদ্যালয় ও মাদ্রাসার সাধারণ ছাত্রদের সাথে আন্তরিক সম্পর্ক স্থাপন।',
                    'ইসলামী সাহিত্য, ম্যাগাজিন, পত্রিকা ও দাওয়াতি উপহার বিতরণ।',
                    'কুরআন ও হাদিসের শিক্ষায় উদ্বুদ্ধকরণ।',
                  ],
                  bg: 'bg-blue-50 border-blue-200',
                  badgeBg: 'bg-blue-600 text-white',
                },
                {
                  no: '২',
                  name: 'সংগঠন (Organization)',
                  summary: 'দাওয়াতে সাড়াদানকারী ছাত্রদের ঐক্যবদ্ধ ও সুশৃঙ্খল করা।',
                  points: [
                    'ছাত্র সমাজকে একতাবদ্ধ কাফেলায় একত্রিত করা।',
                    'শৃঙ্খলা, ভ্রাতৃত্ববোধ ও পারস্পরিক ভালোবাসার পরিবেশ নিশ্চিত করা।',
                    'সমর্থক থেকে কর্মী, সাথী ও সদস্য হিসেবে সাংগঠনিক বিকাশ সাধন।',
                  ],
                  bg: 'bg-emerald-50 border-emerald-200',
                  badgeBg: 'bg-emerald-600 text-white',
                },
                {
                  no: '৩',
                  name: 'প্রশিক্ষণ (Training & Tarbiyat)',
                  summary: 'জ্ঞান, চরিত্র, নৈতিকতা ও নেতৃত্বে সমৃদ্ধ হিসেবে গড়ে তোলা।',
                  points: [
                    'নিয়মিত কুরআন অধ্যয়ন, হাদিস চর্চা ও ইসলামী সাহিত্যের পাঠ্যসূচি সম্পন্ন করা।',
                    'দৈনন্দিন ব্যক্তিগত রিপোর্ট বই লিখে আত্মমূল্যায়ন ও মুহাসাবাহ করা।',
                    'স্টাডি সার্কেল, শিক্ষাশিবির, লিডারশিপ ট্রেনিং ও স্কিল ডেভেলপমেন্ট ক্যাম্প।',
                  ],
                  bg: 'bg-teal-50 border-teal-200',
                  badgeBg: 'bg-teal-600 text-white',
                },
                {
                  no: '৪',
                  name: 'ইসলামী সমাজ বিনির্মাণ (Islamic Social Reconstruction)',
                  summary: 'সকল অন্যায়, অবিচার দূর করে একটি ইনসাফভিত্তিক সমাজ বিনির্মাণ।',
                  points: [
                    'দুর্নীতি, সামাজিক অপরাধ ও অবিচারের বিরুদ্ধে সচেতনতা গড়ে তোলা।',
                    'ছাত্রদের ন্যায্য অধিকার রক্ষা ও সুস্থ ধারার সাংস্কৃতিক বিকাশ।',
                    'একটি শোষণমুক্ত, নৈতিক ও সমৃদ্ধ বাংলাদেশ বিনির্মাণে ভূমিকা রাখা।',
                  ],
                  bg: 'bg-amber-50 border-amber-200',
                  badgeBg: 'bg-amber-600 text-white',
                },
              ].map((prog) => (
                <div key={prog.no} className={`p-4 rounded-2xl border ${prog.bg} shadow-2xs space-y-2`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${prog.badgeBg}`}>
                      {prog.no}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{prog.name}</h4>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">{prog.summary}</p>
                  <ul className="space-y-1 pl-1 text-[11px] text-slate-600 font-medium">
                    {prog.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: সাংগঠনিক স্তর */}
      {activeTab === 'structure' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 border-b border-slate-100 pb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold">ছাত্রশিবিরের ৪টি সাংগঠনিক স্তর</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              সংগঠনে ব্যক্তির যোগ্যতা, নিষ্ঠা, পাঠ্যসূচি ও আমলী অগ্রগতির ভিত্তিতে ৪টি ধাপে পদোন্নতি ঘটে:
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  rank: '১. সমর্থক (Supporter)',
                  desc: 'যে শিক্ষার্থী ছাত্রশিবিরের লক্ষ্য ও উদ্দেশ্যের সাথে নীতিগতভাবে একমত পোষণ করে ও কল্যাণকামী ভূমিকা পালন করে।',
                  icon: Bookmark,
                  color: 'border-slate-200 bg-slate-50 text-slate-800',
                  badge: 'প্রাথমিক স্তর',
                },
                {
                  rank: '২. কর্মী (Kormi)',
                  desc: 'যে সমর্থক সংগঠনের নিয়মিত কার্যক্রমে অংশ নেয়, নির্ধারিত সিলেবাস পাঠ করে এবং প্রতিদিনের আমল ব্যক্তিগত রিপোর্ট বইয়ে সংরক্ষণ করে।',
                  icon: FileText,
                  color: 'border-blue-200 bg-blue-50 text-blue-900',
                  badge: 'সক্রিয় কর্মী',
                },
                {
                  rank: '৩. সাথী (Sathi)',
                  desc: 'নির্ধারিত সাথী সিলেবাস সম্পন্ন করে মৌখিক ও ব্যবহারিক পরীক্ষায় উত্তীর্ণ হয়ে সংগঠনের আনুগত্যের আনুষ্ঠানিক শপথ গ্রহণকারী ভাই।',
                  icon: ShieldCheck,
                  color: 'border-emerald-200 bg-emerald-50 text-emerald-900',
                  badge: 'শপথবদ্ধ দায়িত্বশীল',
                },
                {
                  rank: '৪. সদস্য (Member)',
                  desc: 'সংগঠনের সর্বোচ্চ সাংগঠনিক মর্যাদা। পূর্ণ আনুগত্য, আর্থিক কোরবানি এবং আজীবন দ্বীনের কাজে আত্মনিবেদনের অঙ্গীকারকারী।',
                  icon: Award,
                  color: 'border-amber-200 bg-amber-50 text-amber-900',
                  badge: 'সর্বোচ্চ স্তর',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`p-3.5 rounded-2xl border ${item.color} shadow-2xs space-y-1.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <h4 className="text-xs font-bold">{item.rank}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-current shadow-2xs">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* রিপোর্ট বইয়ের তাৎপর্য */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              ব্যক্তিগত রিপোর্ট বইয়ের আবশ্যকতা
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              ছাত্রশিবিরের একজন সাথী বা কর্মীর আত্মগঠন ও উন্নতির মূল ভিত্তি হলো দৈনন্দিন ব্যক্তিগত রিপোর্ট লেখা। নিয়মিত কুরআন তিলাওয়াত, হাদিস অধ্যয়ন, নামাজ জামায়াতে আদায়, পাঠ্যবই পড়া, শরীরচর্চা ও দাওয়াতি যোগাযোগের হিসাব রাখাই একজন আদর্শ দায়ী গড়ে ওঠার পূর্বশর্ত।
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('report')}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>ব্যক্তিগত রিপোর্ট বই খুলুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: ছাত্রকল্যাণ ও সমাজসেবা */}
      {activeTab === 'welfare' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 border-b border-slate-100 pb-2">
              <HeartHandshake className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-bold">ছাত্রকল্যাণ ও বহুমুখী সামাজিক কার্যক্রম</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              বাংলাদেশ ইসলামী ছাত্রশিবির ছাত্র সমাজের সার্বিক কল্যাণ ও জাতীয় দুর্যোগে সবসময় অগ্রণী ভূমিকা পালন করে:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                {
                  title: 'মেধাবৃত্তি ও কৃতি শিক্ষার্থী সংবর্ধনা',
                  desc: 'এসএসসি, এইচএসসি ও আলিম পরীক্ষায় জিপিএ-৫ প্রাপ্ত শিক্ষার্থীদের সংবর্ধনা ও মেধাবৃত্তি প্রদান।',
                },
                {
                  title: 'দরিদ্র ও মেধাবী তহবিল',
                  desc: 'অসচ্ছল ও সুবিধাবঞ্চিত শিক্ষার্থীদের বই, খাতা, টিউশন ফি প্রদান ও শিক্ষা সহায়তা।',
                },
                {
                  title: 'রক্তদান কর্মসূচি ও মেডিকেল ক্যাম্প',
                  desc: 'স্বেচ্ছায় রক্তদান নেটওয়ার্ক এবং বন্যা ও দুর্যোগপূর্ণ এলাকায় ফ্রি মেডিকেল ক্যাম্প ও ওষুধ বিতরণ।',
                },
                {
                  title: 'দুর্যোগে ত্রাণ ও পুনর্বাসন',
                  desc: 'বন্যা, ঘুর্ণিঝড় ও যেকোনো জাতীয় দুর্যোগে সরাসরি মাঠে থেকে ত্রাণ পৌঁছানো ও ঘর নির্মাণ সহায়তা।',
                },
                {
                  title: 'ক্যারিয়ার ও স্কিল ডেভেলপমেন্ট',
                  desc: 'আইটি স্কিল, ইংরেজি ভাষা শিক্ষা, বিসিএস ও উচ্চশিক্ষা বিষয়ক সেমিনার পরিচালনা।',
                },
                {
                  title: 'সাংস্কৃতিক ও বিতর্ক প্রতিযোগিতা',
                  desc: 'সুস্থ সংস্কৃতির বিকাশ, হিফজুল কুরআন, সাধারণ জ্ঞান ও জাতীয় বিতর্ক প্রতিযোগিতা আয়োজন।',
                },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <h4 className="text-xs font-bold">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium pl-5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>হোম পেজে ফিরুন</span>
        </button>
        <button
          onClick={() => onNavigate('report')}
          className="flex-1 bg-gradient-to-r from-blue-700 to-[#0f2b5c] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>রিপোর্ট লিখুন</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
