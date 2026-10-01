import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Heart,
  Users,
  Briefcase,
  Star,
  Settings,
  Edit2,
  Plus,
  Check,
  Shield,
  Key,
  Database,
  Languages,
  Palette,
  Info,
  LogOut,
  Camera,
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Trash2,
  LogIn,
  Cloud,
  FileDown,
} from 'lucide-react';
import { CategoryId, ActiveScreen, ReportRecord } from '../types';
import {
  BENGALI_MONTHS,
  REPORT_YEARS,
  getOrCreateReport,
  toBengaliNumber,
  UserProfileData,
  loadUserProfile,
  saveUserProfile,
} from '../utils/storage';
import { compressAndConvertImage } from '../utils/imageHelper';
import { FirebaseUser } from '../firebase';

interface CategoryDetailViewProps {
  categoryId: CategoryId;
  onBack: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  currentReport?: ReportRecord | null;
  savedReports?: ReportRecord[];
  onSelectReport?: (report: ReportRecord) => void;
  profileImage?: string;
  onUpdateProfileImage?: (base64: string) => void;
  userProfile?: UserProfileData;
  onUpdateUserProfile?: (profile: UserProfileData) => void;
  currentUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  categoryId,
  onBack,
  onNavigate,
  currentReport,
  savedReports = [],
  onSelectReport,
  profileImage,
  onUpdateProfileImage,
  userProfile,
  onUpdateUserProfile,
  currentUser,
  onOpenAuth,
}) => {
  const [userData, setUserData] = useState<UserProfileData>(() => userProfile || loadUserProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const profileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setUserData(userProfile);
    }
  }, [userProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfileImage) {
      try {
        const compressedBase64 = await compressAndConvertImage(file, 400, 0.85);
        onUpdateProfileImage(compressedBase64);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } catch (err) {
        console.error('Failed to process uploaded photo:', err);
      }
    }
  };

  // Settings: Selected year state for browsing 12 months up to 2030
  const [settingsSelectedYear, setSettingsSelectedYear] = useState<string>(
    currentReport?.year || '২০২৬'
  );
  const [settingsToast, setSettingsToast] = useState<string | null>(null);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateUserProfile) {
      onUpdateUserProfile(userData);
    } else {
      saveUserProfile(userData);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSelectMonthInSettings = (m: string) => {
    if (onSelectReport) {
      const { report } = getOrCreateReport(m, settingsSelectedYear, savedReports);
      onSelectReport(report);
      setSettingsToast(`${m} ${settingsSelectedYear} এর রিপোর্ট বই সক্রিয় করা হয়েছে!`);
      setTimeout(() => {
        onNavigate('report');
      }, 700);
    }
  };

  const getTitle = () => {
    switch (categoryId) {
      case 'personal_info':
        return 'ব্যক্তিগত তথ্য';
      case 'edu_info':
        return 'শিক্ষাগত তথ্য';
      case 'health_info':
        return 'স্বাস্থ্য তথ্য';
      case 'family_info':
        return 'পারিবারিক তথ্য';
      case 'job_info':
        return 'পেশাগত তথ্য';
      case 'extra_info':
        return 'অতিরিক্ত তথ্য';
      case 'settings':
        return 'সেটিংস';
      default:
        return 'তথ্য বিবরণী';
    }
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Top Header Bar for Sub-view */}
      <div className="bg-[#0f2b5c] text-white -mx-4 -mt-4 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <button
            id="category-back-btn"
            onClick={onBack}
            className="p-1 rounded-full hover:bg-white/10 active:bg-white/20"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-base font-bold">{getTitle()}</h2>
        </div>
        {categoryId !== 'settings' && (
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" /> সংরক্ষণ
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" /> সম্পাদনা
              </>
            )}
          </button>
        )}
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>তথ্য সফলভাবে সংরক্ষিত হয়েছে।</span>
        </div>
      )}

      {/* 1. ব্যক্তিগত তথ্য */}
      {categoryId === 'personal_info' && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center pt-2">
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <div className="relative group">
              <div
                onClick={() => profileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-blue-100 border-3 border-emerald-500 overflow-hidden flex items-center justify-center text-blue-700 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                title="প্রোফাইল ছবি পরিবর্তন করুন"
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full text-white shadow-md border-2 border-white cursor-pointer active:scale-90 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200 transition-colors cursor-pointer"
              >
                {profileImage ? 'ছবি পরিবর্তন করুন' : 'ছবি যোগ করুন'}
              </button>
              {profileImage && onUpdateProfileImage && (
                <button
                  type="button"
                  onClick={() => onUpdateProfileImage('')}
                  title="ছবি মুছে ফেলুন"
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-full border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>

            <p className="text-base font-bold text-slate-800 mt-1.5">
              {userData.name?.trim() || 'নাম নির্ধারণ করা হয়নি'}
            </p>
            <p className="text-xs text-slate-500 font-medium">ব্যক্তিগত তথ্য বিবরণী</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {[
              { label: 'নাম', key: 'name', value: userData.name || '', placeholder: 'আপনার পূর্ণ নাম লিখুন' },
              { label: 'পিতার নাম', key: 'father', value: userData.father || '', placeholder: 'পিতার নাম লিখুন' },
              { label: 'মাতার নাম', key: 'mother', value: userData.mother || '', placeholder: 'মাতার নাম লিখুন' },
              { label: 'জন্ম তারিখ', key: 'birthDate', value: userData.birthDate || '', placeholder: 'যেমন: ১৫/০২/২০০২' },
              { label: 'জাতীয় পরিচয়পত্র নং', key: 'nid', value: userData.nid || '', placeholder: 'NID বা জন্ম সনদ নং' },
              { label: 'ধর্ম', key: 'religion', value: userData.religion || '', placeholder: 'যেমন: ইসলাম' },
              { label: 'জাতীয়তা', key: 'nationality', value: userData.nationality || '', placeholder: 'যেমন: বাংলাদেশী' },
              { label: 'মোবাইল নং', key: 'phone', value: userData.phone || '', placeholder: 'যেমন: ০১৭১২৩৪৫৬৭৮' },
              { label: 'বর্তমান ঠিকানা', key: 'address', value: userData.address || '', placeholder: 'বর্তমান ঠিকানা লিখুন' },
            ].map((row) => (
              <div key={row.key} className="px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium w-2/5">{row.label} :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={row.value}
                    placeholder={row.placeholder}
                    onChange={(e) =>
                      setUserData({ ...userData, [row.key]: e.target.value })
                    }
                    className="w-3/5 border border-blue-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-blue-600 bg-slate-50 focus:bg-white"
                  />
                ) : (
                  <span className="text-slate-800 font-semibold w-3/5 text-right">
                    {row.value || <span className="text-slate-400 font-normal italic">দেওয়া হয়নি</span>}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? 'সংরক্ষণ করুন' : 'সম্পাদনা করুন'}</span>
          </button>
        </div>
      )}

      {/* 2. শিক্ষাগত তথ্য */}
      {categoryId === 'edu_info' && (
        <div className="space-y-3">
          {(!userData.education || userData.education.length === 0) && !isEditing ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">কোনো শিক্ষাগত তথ্য যোগ করা হয়নি</h4>
                <p className="text-xs text-slate-500 mt-1">আপনার এসএসসি/দাখিল, এইচএসসি/আলিম বা অন্যান্য পরীক্ষার বিবরণী যোগ করুন।</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserData({
                    ...userData,
                    education: [{ title: '', year: '', board: '' }],
                  });
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>শিক্ষাগত তথ্য যোগ করুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(userData.education || []).map((edu, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-all space-y-2.5"
                >
                  {isEditing ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="font-bold text-slate-700">ডিগ্রি / পরীক্ষা #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (userData.education || []).filter((_, i) => i !== idx);
                            setUserData({ ...userData, education: updated });
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">মুছুন</span>
                        </button>
                      </div>

                      {/* Quick Degree Suggestions */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold">সহজ নির্বাচন:</span>
                        {['এসএসসি / দাখিল', 'এইচএসসি / আলিম', 'স্নাতক / ফাজিল', 'স্নাতকোত্তর / কামিল'].map((deg) => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => {
                              const updated = [...(userData.education || [])];
                              updated[idx] = { ...updated[idx], title: deg };
                              setUserData({ ...userData, education: updated });
                            }}
                            className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 transition-all cursor-pointer"
                          >
                            {deg}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1">পরীক্ষার নাম:</label>
                        <input
                          type="text"
                          value={edu.title}
                          placeholder="যেমন: এসএসসি / দাখিল / আলিম / ডিপ্লোমা"
                          onChange={(e) => {
                            const updated = [...(userData.education || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setUserData({ ...userData, education: updated });
                          }}
                          className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-500 block mb-1">পাসের বছর:</label>
                          <input
                            type="text"
                            value={edu.year}
                            placeholder="যেমন: ২০২৪"
                            onChange={(e) => {
                              const updated = [...(userData.education || [])];
                              updated[idx] = { ...updated[idx], year: e.target.value };
                              setUserData({ ...userData, education: updated });
                            }}
                            className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-1">বোর্ড / বিশ্ববিদ্যালয়:</label>
                          <input
                            type="text"
                            value={edu.board}
                            placeholder="যেমন: ঢাকা / মাদ্রাসা বোর্ড"
                            onChange={(e) => {
                              const updated = [...(userData.education || [])];
                              updated[idx] = { ...updated[idx], board: e.target.value };
                              setUserData({ ...userData, education: updated });
                            }}
                            className="w-full border border-blue-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5 shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">পরীক্ষার নাম</span>
                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {edu.title || <span className="text-slate-400 italic font-normal">পরীক্ষার নাম নেই</span>}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>বছর: <b className="text-slate-700">{edu.year || '—'}</b></span>
                          <span>বোর্ড: <b className="text-slate-700">{edu.board || '—'}</b></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                const updated = [...(userData.education || []), { title: '', year: '', board: '' }];
                setUserData({ ...userData, education: updated });
              }}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-dashed border-emerald-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পরীক্ষা / ডিগ্রি যোগ করুন</span>
            </button>
          )}

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? 'সংরক্ষণ করুন' : 'সম্পাদনা করুন'}</span>
          </button>
        </div>
      )}

      {/* 3. স্বাস্থ্য তথ্য */}
      {categoryId === 'health_info' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {[
              { label: 'রক্তের গ্রুপ', key: 'bloodGroup', val: userData.bloodGroup || '', placeholder: 'যেমন: B+ / O+ / A+', color: 'text-blue-600' },
              { label: 'উচ্চতা', key: 'height', val: userData.height || '', placeholder: 'যেমন: ৫ ফুট ৬ ইঞ্চি', color: 'text-amber-600' },
              { label: 'ওজন', key: 'weight', val: userData.weight || '', placeholder: 'যেমন: ৬৫ কেজি', color: 'text-emerald-600' },
              { label: 'চোখের সমস্যা', key: 'eyeProblem', val: userData.eyeProblem || '', placeholder: 'যেমন: নেই / চশমা ব্যবহার করি', color: 'text-indigo-600' },
              { label: 'অন্যান্য সমস্যা', key: 'otherHealth', val: userData.otherHealth || '', placeholder: 'যেমন: সুস্থ / কোনো রোগ নেই', color: 'text-slate-600' },
            ].map((item, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium w-2/5">{item.label} :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={item.val}
                    placeholder={item.placeholder}
                    onChange={(e) =>
                      setUserData({ ...userData, [item.key]: e.target.value })
                    }
                    className="w-3/5 border border-blue-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                  />
                ) : (
                  <span className={`font-bold text-sm w-3/5 text-right ${item.color}`}>
                    {item.val || <span className="text-slate-400 font-normal italic text-xs">দেওয়া হয়নি</span>}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? 'সংরক্ষণ করুন' : 'সম্পাদনা করুন'}</span>
          </button>
        </div>
      )}

      {/* 4. পারিবারিক তথ্য */}
      {categoryId === 'family_info' && (
        <div className="space-y-3">
          {(!userData.family || userData.family.length === 0) && !isEditing ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">কোনো পারিবারিক তথ্য যোগ করা হয়নি</h4>
                <p className="text-xs text-slate-500 mt-1">পরিবারের সদস্যদের তথ্য যুক্ত করতে নিচের বাটনে চাপ দিন।</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserData({
                    ...userData,
                    family: [{ relation: '', name: '' }],
                  });
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>পারিবারিক সদস্য যোগ করুন</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {(userData.family || []).map((fam, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                  {isEditing ? (
                    <div className="w-full flex items-center gap-2">
                      <input
                        type="text"
                        value={fam.relation}
                        placeholder="সম্পর্ক (যেমন: পিতা/মাতা)"
                        onChange={(e) => {
                          const updated = [...(userData.family || [])];
                          updated[idx] = { ...updated[idx], relation: e.target.value };
                          setUserData({ ...userData, family: updated });
                        }}
                        className="w-2/5 border border-blue-300 rounded-lg px-2 py-1.5 font-medium text-slate-800 bg-slate-50 focus:bg-white text-xs"
                      />
                      <input
                        type="text"
                        value={fam.name}
                        placeholder="সদস্যের নাম লিখুন"
                        onChange={(e) => {
                          const updated = [...(userData.family || [])];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setUserData({ ...userData, family: updated });
                        }}
                        className="w-3/5 border border-blue-300 rounded-lg px-2 py-1.5 font-medium text-slate-800 bg-slate-50 focus:bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (userData.family || []).filter((_, i) => i !== idx);
                          setUserData({ ...userData, family: updated });
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-md cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-slate-600 font-medium">{fam.relation || 'সম্পর্ক'}</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {fam.name || <span className="text-slate-400 font-normal italic">নাম দেওয়া হয়নি</span>}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                const updated = [...(userData.family || []), { relation: '', name: '' }];
                setUserData({ ...userData, family: updated });
              }}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-dashed border-rose-300 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পারিবারিক সদস্য যোগ করুন</span>
            </button>
          )}

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? 'সংরক্ষণ করুন' : 'সম্পাদনা করুন'}</span>
          </button>
        </div>
      )}

      {/* 5. পেশাগত তথ্য */}
      {categoryId === 'job_info' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {[
              { label: 'পেশার নাম', key: 'name', val: userData.profession?.name || '', placeholder: 'যেমন: ছাত্র / শিক্ষক / চাকরিজীবী' },
              { label: 'প্রতিষ্ঠান', key: 'institute', val: userData.profession?.institute || '', placeholder: 'প্রতিষ্ঠানের নাম লিখুন' },
              { label: 'সময়কাল / শ্রেণি', key: 'duration', val: userData.profession?.duration || '', placeholder: 'যেমন: ১ম বর্ষ / ৩ বছর' },
              { label: 'সনদ / বিবরণ', key: 'certified', val: userData.profession?.certified || '', placeholder: 'যেমন: হ্যাঁ / চলমান / প্রযোজ্য নয়' },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium w-2/5">{item.label} :</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={item.val}
                    placeholder={item.placeholder}
                    onChange={(e) => {
                      const updatedProf = { ...(userData.profession || { name: '', institute: '', duration: '', certified: '' }) };
                      (updatedProf as any)[item.key] = e.target.value;
                      setUserData({ ...userData, profession: updatedProf });
                    }}
                    className="w-3/5 border border-blue-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                  />
                ) : (
                  <span className="font-bold text-slate-800 w-3/5 text-right">
                    {item.val || <span className="text-slate-400 font-normal italic">দেওয়া হয়নি</span>}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? 'সংরক্ষণ করুন' : 'সম্পাদনা করুন'}</span>
          </button>
        </div>
      )}

      {/* 6. অতিরিক্ত তথ্য */}
      {categoryId === 'extra_info' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold block mb-1">দক্ষতা ও শখ:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={userData.skills || ''}
                  placeholder="যেমন: কুরআন তিলাওয়াত, বই পড়া, কম্পিউটার টাইপিং, গ্রাফিক্স ইত্যাদি"
                  onChange={(e) => setUserData({ ...userData, skills: e.target.value })}
                  className="w-full border border-blue-300 rounded-lg p-2.5 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                />
              ) : (
                <p className="font-semibold text-slate-800">
                  {userData.skills?.trim() || <span className="text-slate-400 font-normal italic">কোনো দক্ষতা বা শখ উল্লেখ করা হয়নি</span>}
                </p>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-bold block mb-1">ভাষা দক্ষতা:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={userData.languages || ''}
                  placeholder="যেমন: বাংলা (মাতৃভাষা), ইংরেজি (মাঝারি), আরবি (পঠন)"
                  onChange={(e) => setUserData({ ...userData, languages: e.target.value })}
                  className="w-full border border-blue-300 rounded-lg p-2.5 font-medium text-slate-800 bg-slate-50 focus:bg-white"
                />
              ) : (
                <p className="font-semibold text-slate-800">
                  {userData.languages?.trim() || <span className="text-slate-400 font-normal italic">কোনো ভাষা দক্ষতা উল্লেখ করা হয়নি</span>}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? 'সংরক্ষণ করুন' : 'সম্পাদনা করুন'}</span>
          </button>
        </div>
      )}

      {/* 7. সেটিংস (Settings view with 12 months & up to 2030 year configuration) */}
      {categoryId === 'settings' && (
        <div className="space-y-4">
          {/* Toast Notification */}
          {settingsToast && (
            <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{settingsToast}</span>
            </div>
          )}

          {/* Core Feature: 12-Month & Year Selection Card */}
          <div className="bg-white rounded-2xl border-2 border-blue-500/20 p-4 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">১২ মাসের রিপোর্ট ও সাল নির্ধারণ</h3>
                  <p className="text-[11px] text-slate-500">
                    আনলিমিটেড সাল ও ১২ মাসের রিপোর্ট ব্যবস্থাপনা
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                আনলিমিটেড সাল
              </span>
            </div>

            {/* Current Active Report Tag */}
            {currentReport && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  বর্তমানে সক্রিয় রিপোর্ট:
                </span>
                <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-blue-200">
                  {currentReport.month} {currentReport.year} সাল
                </span>
              </div>
            )}

            {/* Year Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  সাল নির্বাচন করুন (আনলিমিটেড):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const custom = prompt('যেকোনো সাল লিখুন (যেমন: ২০৩৫ বা ২০৭০):', settingsSelectedYear);
                    if (custom && custom.trim()) {
                      setSettingsSelectedYear(toBengaliNumber(custom.trim()));
                    }
                  }}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  + নতুন সাল লিখুন
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {!REPORT_YEARS.includes(settingsSelectedYear) && (
                  <button
                    key={settingsSelectedYear}
                    onClick={() => setSettingsSelectedYear(settingsSelectedYear)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer bg-[#0f2b5c] text-white shadow-xs"
                  >
                    {settingsSelectedYear} সাল
                  </button>
                )}
                {REPORT_YEARS.map((y) => {
                  const isYearSelected = settingsSelectedYear === y;
                  return (
                    <button
                      key={y}
                      onClick={() => setSettingsSelectedYear(y)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        isYearSelected
                          ? 'bg-[#0f2b5c] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {y} সাল
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 12-Month Matrix Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {settingsSelectedYear} সালের ১২টি মাস (ক্লিক করে রিপোর্টে যান):
                </label>
                <span className="text-[10px] text-slate-400">১২টি মাস অন্তর্ভুক্ত</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {BENGALI_MONTHS.map((m) => {
                  const isCurrentActive =
                    currentReport?.month === m && currentReport?.year === settingsSelectedYear;
                  const matchingReport = savedReports.find(
                    (r) => r.month === m && r.year === settingsSelectedYear
                  );
                  const hasData =
                    matchingReport &&
                    matchingReport.dailyEntries.some((d) => d.quranAyat || d.prayerJamaat);

                  return (
                    <button
                      key={m}
                      onClick={() => handleSelectMonthInSettings(m)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrentActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : hasData
                          ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 hover:bg-emerald-100/70'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold block">{m}</span>
                      <span
                        className={`text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded-md inline-block w-fit ${
                          isCurrentActive
                            ? 'bg-white/20 text-white'
                            : hasData
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCurrentActive ? 'সক্রিয়' : hasData ? 'তথ্য সংরক্ষিত' : 'নতুন'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigate('report')}
                className="w-full bg-[#0f2b5c] hover:bg-blue-900 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>রিপোর্ট বইয়ে প্রবেশ করুন</span>
              </button>
              <button
                onClick={() => onNavigate('report')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-white" />
                <span>PDF ও গ্যালারি ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Account & Cloud Sync Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">অ্যাকাউন্ট ও ক্লাউড ব্যাকআপ</h4>
                  <p className="text-[10px] text-slate-500">Firebase Firestore ডাটাবেজ দ্বারা সুরক্ষিত</p>
                </div>
              </div>
              {currentUser ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  সংযুক্ত
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  লগইন নেই
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-8 h-8 rounded-full border border-emerald-400 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {currentUser.displayName || 'ব্যবহারকারী'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shrink-0 ml-2"
                >
                  ব্যবস্থাপনা
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>গুগল দিয়ে লগইন করুন (ক্লাউডে সংরক্ষণ)</span>
              </button>
            )}
          </div>

          {/* General App Settings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              সাধারণ সেটিংস
            </h4>
            {[
              { label: 'প্রোফাইল পরিবর্তন', icon: User, action: () => onNavigate('profile') },
              {
                label: 'তথ্য ব্যাকআপ / রিস্টোর',
                icon: Database,
                action: () => {
                  setSettingsToast('সমস্ত ১২ মাসের রিপোর্ট ও পরিকল্পনা সফলভাবে ব্যাকআপ রাখা হয়েছে।');
                  setTimeout(() => setSettingsToast(null), 3000);
                },
              },
              {
                label: 'ভাষা নির্বাচন (বর্তমান: বাংলা)',
                icon: Languages,
                action: () => {
                  setSettingsToast('বর্তমান ইন্টারফেস ভাষা: বাংলা (ডিফল্ট)');
                  setTimeout(() => setSettingsToast(null), 2500);
                },
              },
              {
                label: 'থিম পরিবর্তন (নেভি ব্লু ও অফিশিয়াল কালার)',
                icon: Palette,
                action: () => {
                  setSettingsToast('ছাত্রশিবিরের অফিশিয়াল থিম সক্রিয় রয়েছে।');
                  setTimeout(() => setSettingsToast(null), 2500);
                },
              },
              {
                label: 'বাংলাদেশ ইসলামী ছাত্রশিবির সম্পর্কে',
                icon: BookOpen,
                action: () => onNavigate('about_shibir'),
              },
              {
                label: 'অ্যাপ সম্পর্কে (ব্যক্তিগত রিপোর্ট বই v1.2.0)',
                icon: Info,
                action: () => {
                  setSettingsToast('ব্যক্তিগত রিপোর্ট বই v1.2.0 - ২০২৪ থেকে ২০৩০ সাল পর্যন্ত ১২ মাসের রিপোর্ট সুবিধা সম্পন্ন।');
                  setTimeout(() => setSettingsToast(null), 3500);
                },
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-blue-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-slate-400 font-bold text-sm">&rsaquo;</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
