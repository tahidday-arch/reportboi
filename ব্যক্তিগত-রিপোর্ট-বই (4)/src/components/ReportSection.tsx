import React, { useState } from 'react';
import {
  Save,
  Edit,
  RotateCcw,
  Eye,
  FileDown,
  Calendar,
  Clock,
  CheckCircle2,
  Table as TableIcon,
  Smartphone,
  Plus,
  Minus,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderKanban,
  FileCheck,
  Share2,
  Download,
} from 'lucide-react';
import { DailyReportEntry, MonthlyPlanData, ReportRecord } from '../types';
import {
  toBengaliNumber,
  toEnglishNumber,
  saveSingleReport,
  BENGALI_MONTHS,
  REPORT_YEARS,
  getOrCreateReport,
  getDaysInBengaliMonth,
} from '../utils/storage';
import { createEmptyDailyEntries, defaultMonthlyPlan } from '../data/defaultReport';
import { ReportShareModal } from './ReportShareModal';

interface ReportSectionProps {
  currentReport: ReportRecord;
  onUpdateReport: (report: ReportRecord) => void;
  savedReports: ReportRecord[];
  onSelectReport: (report: ReportRecord) => void;
  onOpenPDF: (report: ReportRecord) => void;
  userName?: string;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  currentReport,
  onUpdateReport,
  savedReports,
  onSelectReport,
  onOpenPDF,
  userName,
}) => {
  // Tabs: 'daily' (ব্যক্তিগত রিপোর্ট), 'plan' (মাসিক পরিকল্পনা), 'list' (সংরক্ষিত রিপোর্টসমূহ)
  const [activeTab, setActiveTab] = useState<'daily' | 'plan' | 'list'>('daily');

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareTargetReport, setShareTargetReport] = useState<ReportRecord | null>(null);

  const handleOpenShare = (rep?: ReportRecord) => {
    setShareTargetReport(rep || currentReport);
    setIsShareModalOpen(true);
  };

  // Daily entry view mode: 'card' (মোবাইল এন্ট্রি ফরম) or 'table' (রিপোর্ট বই টেবিল ভিউ)
  const [dailyViewMode, setDailyViewMode] = useState<'card' | 'table'>('card');

  // Selected date for daily fill-up (1 to 31)
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Form edit mode state
  const [isEditable, setIsEditable] = useState<boolean>(true);

  // Real-time auto-save indicator state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const autoSaveTimerRef = React.useRef<any>(null);

  const triggerAutoSaveStatus = () => {
    setSaveStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  // Feedback notification
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'warn'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Current selected daily entry
  const currentDailyEntry =
    currentReport.dailyEntries.find((d) => d.date === selectedDay) ||
    currentReport.dailyEntries[0];

  // Helper to update field in selected day
  const updateDailyField = (field: keyof DailyReportEntry, value: any) => {
    if (!isEditable) {
      showToast('সম্পাদনা করতে নিচের "সম্পাদনা করুন" বাটনে ক্লিক করুন', 'info');
      return;
    }
    const updatedEntries = currentReport.dailyEntries.map((item) => {
      if (item.date === selectedDay) {
        return { ...item, [field]: value };
      }
      return item;
    });
    triggerAutoSaveStatus();
    onUpdateReport({
      ...currentReport,
      dailyEntries: updatedEntries,
    });
  };

  // Quick stepper helper for number inputs
  const adjustDailyNumber = (field: keyof DailyReportEntry, delta: number, min = 0) => {
    if (!isEditable) return;
    const currentVal = Number(currentDailyEntry[field]) || 0;
    const newVal = Math.max(min, currentVal + delta);
    updateDailyField(field, newVal === 0 ? '' : newVal);
  };

  // Helper to update field in Monthly Plan
  const updatePlanField = (field: keyof MonthlyPlanData, value: any) => {
    if (!isEditable) {
      showToast('সম্পাদনা করতে নিচের "সম্পাদনা করুন" বাটনে ক্লিক করুন', 'info');
      return;
    }
    triggerAutoSaveStatus();
    onUpdateReport({
      ...currentReport,
      monthlyPlan: {
        ...currentReport.monthlyPlan,
        [field]: value,
      },
    });
  };

  // ACTION: সংরক্ষণ করুন
  const handleSave = () => {
    const savedList = saveSingleReport(currentReport);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    showToast(`রিপোর্ট বই সফলভাবে সংরক্ষিত হয়েছে! (সংরক্ষণের সময়: ${dateStr}, ${timeStr})`, 'success');
  };

  // ACTION: সম্পাদনা করুন
  const handleToggleEdit = () => {
    setIsEditable(!isEditable);
    showToast(!isEditable ? 'সম্পাদনা মোড সক্রিয় হয়েছে।' : 'রিপোর্ট বই লক করা হয়েছে।', 'info');
  };

  // ACTION: বাতিল করুন
  const handleReset = () => {
    if (window.confirm('আপনি কি পরিবর্তনসমূহ বাতিল করে পূর্বাবস্থায় ফিরতে চান?')) {
      const found = savedReports.find((r) => r.id === currentReport.id);
      if (found) {
        onUpdateReport(JSON.parse(JSON.stringify(found)));
      } else {
        onUpdateReport({
          ...currentReport,
          dailyEntries: createEmptyDailyEntries(),
        });
      }
      showToast('পরিবর্তনসমূহ বাতিল করা হয়েছে।', 'warn');
    }
  };

  // Handlers for month & year switching (Supports 12 months & up to 2030)
  const handleSelectMonth = (monthName: string) => {
    const { report } = getOrCreateReport(monthName, currentReport.year, savedReports);
    onSelectReport(report);
    if (selectedDay > report.dailyEntries.length) {
      setSelectedDay(1);
    }
    showToast(`${monthName} ${currentReport.year} এর রিপোর্ট নির্বাচিত হয়েছে।`, 'info');
  };

  const handleSelectYear = (yearName: string) => {
    const { report } = getOrCreateReport(currentReport.month, yearName, savedReports);
    onSelectReport(report);
    if (selectedDay > report.dailyEntries.length) {
      setSelectedDay(1);
    }
    showToast(`${currentReport.month} ${yearName} এর রিপোর্ট নির্বাচিত হয়েছে।`, 'info');
  };

  const handlePrevMonth = () => {
    const currentIdx = BENGALI_MONTHS.indexOf(currentReport.month as any);
    if (currentIdx > 0) {
      handleSelectMonth(BENGALI_MONTHS[currentIdx - 1]);
    } else {
      const numYear = parseInt(toEnglishNumber(currentReport.year), 10) || 2026;
      const prevYear = toBengaliNumber(numYear - 1);
      const { report } = getOrCreateReport('ডিসেম্বর', prevYear, savedReports);
      onSelectReport(report);
      showToast(`ডিসেম্বর ${prevYear} এর রিপোর্ট নির্বাচিত হয়েছে।`, 'info');
    }
  };

  const handleNextMonth = () => {
    const currentIdx = BENGALI_MONTHS.indexOf(currentReport.month as any);
    if (currentIdx < BENGALI_MONTHS.length - 1 && currentIdx >= 0) {
      handleSelectMonth(BENGALI_MONTHS[currentIdx + 1]);
    } else {
      const numYear = parseInt(toEnglishNumber(currentReport.year), 10) || 2026;
      const nextYear = toBengaliNumber(numYear + 1);
      const { report } = getOrCreateReport('জানুয়ারি', nextYear, savedReports);
      onSelectReport(report);
      showToast(`জানুয়ারি ${nextYear} এর রিপোর্ট নির্বাচিত হয়েছে।`, 'info');
    }
  };

  // ACTION: নতুন রিপোর্ট তৈরি
  const handleCreateNewReport = () => {
    const newMonth = prompt('কোন মাসের জন্য রিপোর্ট তৈরি করতে চান? (যেমন: জানুয়ারি থেকে ডিসেম্বর)', currentReport.month);
    if (!newMonth) return;
    const { report: newReport } = getOrCreateReport(newMonth, currentReport.year, savedReports);
    onSelectReport(newReport);
    setActiveTab('daily');
    showToast(`${newMonth} ${currentReport.year} মাসের রিপোর্ট প্রস্তুত হয়েছে।`, 'success');
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Toast notification banner */}
      {notification && (
        <div
          id="report-toast-msg"
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : notification.type === 'warn'
              ? 'bg-amber-600 text-white'
              : 'bg-blue-700 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header: Report Book Banner with 12-Month & Year Pickers */}
      <div className="bg-gradient-to-r from-[#0f2b5c] via-[#143c7d] to-[#0f2b5c] text-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border-b-2 border-blue-400/30 space-y-2 sm:space-y-3">
        <div className="text-center">
          <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium leading-tight">বিসমিল্লাহির রাহমানির রাহিম</p>
          <h2 className="text-base sm:text-lg font-bold tracking-tight leading-tight mt-0.5">ব্যক্তিগত রিপোর্ট বই</h2>
        </div>

        {/* 12-Month Picker Dropdown and Year Picker Dropdown (Targeted CSS element) */}
        <div className="bg-white/10 backdrop-blur-xs p-1.5 sm:p-2.5 rounded-xl border border-white/15 flex items-center justify-between gap-1 sm:gap-2">
          {/* Quick Prev Button */}
          <button
            onClick={handlePrevMonth}
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
            title="পূর্ববর্তী মাস"
            aria-label="পূর্ববর্তী মাস"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Month Dropdown (জানুয়ারি থেকে ডিসেম্বর) */}
          <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5 bg-white text-slate-900 rounded-lg px-2 py-1 sm:py-1.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700 shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase leading-none truncate">মাস</span>
              <select
                id="month-picker-select"
                value={currentReport.month}
                onChange={(e) => handleSelectMonth(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-900 border-none focus:outline-none cursor-pointer py-0 sm:py-0.5 truncate w-full"
              >
                {BENGALI_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Dropdown (আনলিমিটেড সাল ও কাস্টম সাল নির্বাচন) */}
          <div className="w-[82px] sm:w-[110px] shrink-0 flex items-center gap-1 sm:gap-1.5 bg-white text-slate-900 rounded-lg px-1.5 sm:px-2.5 py-1 sm:py-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700 shrink-0 hidden xs:block" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase leading-none truncate">সাল</span>
              <select
                id="year-picker-select"
                value={currentReport.year}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    const customInput = prompt('যেকোনো সাল লিখুন (যেমন: ২০৩৫ বা ২০৭০):', currentReport.year);
                    if (customInput && customInput.trim()) {
                      const formattedYear = toBengaliNumber(customInput.trim());
                      handleSelectYear(formattedYear);
                    }
                  } else {
                    handleSelectYear(val);
                  }
                }}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-900 border-none focus:outline-none cursor-pointer py-0 sm:py-0.5 truncate w-full"
              >
                {!REPORT_YEARS.includes(currentReport.year) && (
                  <option value={currentReport.year}>{currentReport.year} সাল</option>
                )}
                {REPORT_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y} সাল
                  </option>
                ))}
                <option value="custom">+ নতুন সাল...</option>
              </select>
            </div>
          </div>

          {/* Quick Next Button */}
          <button
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
            title="পরবর্তী মাস"
            aria-label="পরবর্তী মাস"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Current status info bar with Real-time Auto-save status */}
        <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-blue-100 pt-1.5 border-t border-blue-400/20 px-0.5 gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex items-center gap-1 font-bold truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentReport.month} {currentReport.year}
            </span>
            {saveStatus === 'saving' ? (
              <span className="bg-blue-400/30 text-blue-200 border border-blue-300/40 px-1.5 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 animate-spin" /> সংরক্ষণ হচ্ছে...
              </span>
            ) : (
              <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" /> অটো-সেভ
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="text-blue-200 hidden md:inline text-[10px]">
              আপডেট: {new Date(currentReport.updatedAt).toLocaleDateString('bn-BD')}
            </span>
            <button
              onClick={() => onOpenPDF(currentReport)}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2 py-0.5 rounded-lg font-bold text-[10px] shadow-xs transition-all cursor-pointer"
              title="রিপোর্ট বই, মাসিক রিপোর্ট ও পরিকল্পনা PDF বা গ্যালারিতে ছবি হিসেবে ডাউনলোড করুন"
            >
              <Download className="w-3 h-3 text-white" />
              <span>ডাউনলোড</span>
            </button>
            <button
              onClick={() => handleOpenShare()}
              className="flex items-center gap-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white px-2 py-0.5 rounded-lg font-bold text-[10px] shadow-xs transition-all cursor-pointer"
              title="রিপোর্ট শেয়ার করুন"
            >
              <Share2 className="w-3 h-3 text-white" />
              <span>শেয়ার</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12-Month Quick Navigation Strip (Pill Bar) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            ১২ মাসের দ্রুত নির্বাচন ({currentReport.year} সাল):
          </span>
          <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {currentReport.month} ({BENGALI_MONTHS.indexOf(currentReport.month as any) + 1}/১২)
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {BENGALI_MONTHS.map((m) => {
            const isSelected = m === currentReport.month;
            const existingRep = savedReports.find((r) => r.month === m && r.year === currentReport.year);
            const hasData = existingRep && existingRep.dailyEntries.some((d) => d.quranAyat || d.prayerJamaat);

            return (
              <button
                key={m}
                onClick={() => handleSelectMonth(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0f2b5c] text-white shadow-sm ring-2 ring-blue-300'
                    : hasData
                    ? 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{m}</span>
                {hasData && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-emerald-400' : 'bg-blue-600'
                    }`}
                    title="সংরক্ষিত ডাটা রয়েছে"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 Primary PDF Category Tabs + Saved Reports Tab */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl shadow-inner text-xs font-bold gap-1">
        <button
          id="tab-btn-daily"
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 rounded-lg text-center transition-all ${
            activeTab === 'daily'
              ? 'bg-[#0f2b5c] text-white shadow'
              : 'text-slate-700 hover:bg-white/50'
          }`}
        >
          ১. ব্যক্তিগত রিপোর্ট
        </button>
        <button
          id="tab-btn-plan"
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-2 rounded-lg text-center transition-all ${
            activeTab === 'plan'
              ? 'bg-[#0f2b5c] text-white shadow'
              : 'text-slate-700 hover:bg-white/50'
          }`}
        >
          ২. মাসিক পরিকল্পনা
        </button>
        <button
          id="tab-btn-list"
          onClick={() => setActiveTab('list')}
          className={`px-3 py-2 rounded-lg text-center transition-all flex items-center gap-1 ${
            activeTab === 'list'
              ? 'bg-[#0f2b5c] text-white shadow'
              : 'text-slate-700 hover:bg-white/50'
          }`}
          title="সংরক্ষিত রিপোর্ট দেখুন"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">রিপোর্ট তালিকা</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PART 1: ব্যক্তিগত রিপোর্ট (1st Page of PDF)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Day selection and View Mode Toggle */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">তারিখ নির্বাচন:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="bg-blue-50 border border-blue-300 text-blue-900 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-blue-600 cursor-pointer"
                >
                  {Array.from({ length: currentReport.dailyEntries.length }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {toBengaliNumber(d)} {currentReport.month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle view between Card form and Table */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setDailyViewMode('card')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                    dailyViewMode === 'card'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="মোবাইল এন্ট্রি ফরম"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[11px]">ফরম</span>
                </button>
                <button
                  onClick={() => setDailyViewMode('table')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                    dailyViewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="রিপোর্ট বই টেবিল ভিউ"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">টেবিল</span>
                </button>
              </div>
            </div>

            {/* Quick date scroll pills for mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedDay((prev) => Math.max(1, prev - 1))}
                disabled={selectedDay === 1}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: currentReport.dailyEntries.length }, (_, i) => i + 1).map((day) => {
                const isSelected = selectedDay === day;
                const hasData =
                  currentReport.dailyEntries[day - 1]?.quranAyat ||
                  currentReport.dailyEntries[day - 1]?.prayerJamaat;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex flex-col items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                        : hasData
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{toBengaliNumber(day)}</span>
                    {hasData && !isSelected && (
                      <span className="w-1 h-1 bg-blue-600 rounded-full -mt-0.5"></span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedDay((prev) => Math.min(currentReport.dailyEntries.length, prev + 1))}
                disabled={selectedDay >= currentReport.dailyEntries.length}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 shrink-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* VIEW 1: Mobile Form Mode for selected date */}
          {dailyViewMode === 'card' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {toBengaliNumber(selectedDay)} {currentReport.month} এর ব্যক্তিগত রিপোর্ট
                </span>
                {!isEditable && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    রিভিউ মোড (লক করা)
                  </span>
                )}
              </div>

              {/* ১. কুরআন অধ্যয়ন */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    কুরআন অধ্যয়ন
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ■ সূরা (নাম / বিষয়)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: আল-বাকারা"
                      value={currentDailyEntry.quranSurah}
                      disabled={!isEditable}
                      onChange={(e) => updateDailyField('quranSurah', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ■ আয়াত (সংখ্যা)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustDailyNumber('quranAyat', -1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        placeholder="০"
                        value={currentDailyEntry.quranAyat}
                        disabled={!isEditable}
                        onChange={(e) => updateDailyField('quranAyat', e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 focus:bg-white focus:outline-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => adjustDailyNumber('quranAyat', 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ২. হাদিস অধ্যয়ন ও সাহিত্য অধ্যয়ন */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    হাদিস ও সাহিত্য অধ্যয়ন
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      হাদিস অধ্যয়ন (সংখ্যা)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="০"
                      value={currentDailyEntry.hadithCount}
                      disabled={!isEditable}
                      onChange={(e) => updateDailyField('hadithCount', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 focus:bg-white focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      সাহিত্য (ইসলামী পৃষ্ঠা)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="০"
                      value={currentDailyEntry.literatureIslamic}
                      disabled={!isEditable}
                      onChange={(e) => updateDailyField('literatureIslamic', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 focus:bg-white focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      সাহিত্য (অন্যান্য পৃষ্ঠা)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="০"
                      value={currentDailyEntry.literatureOther}
                      disabled={!isEditable}
                      onChange={(e) => updateDailyField('literatureOther', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 focus:bg-white focus:outline-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* ৩. পাঠ্যপুস্তক অধ্যয়ন ও ক্লাস */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    পাঠ্যপুস্তক অধ্যয়ন ও ক্লাস
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      পাঠ্যপুস্তক অধ্যয়ন (ঘণ্টা)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="০"
                      value={currentDailyEntry.textbookHours}
                      disabled={!isEditable}
                      onChange={(e) => updateDailyField('textbookHours', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 focus:bg-white focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ক্লাসে উপস্থিতি
                    </label>
                    <button
                      type="button"
                      disabled={!isEditable}
                      onClick={() => updateDailyField('classPresent', !currentDailyEntry.classPresent)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                        currentDailyEntry.classPresent
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {currentDailyEntry.classPresent ? (
                        <>
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                          <span>উপস্থিত ছিলেন</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4 text-slate-400" />
                          <span>অনুপস্থিত / ছিল না</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ৪. নামাজ (জামায়াত ও কাযা) */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    নামাজ
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                    <label className="text-[11px] font-bold text-blue-900 block mb-1">
                      ■ জামায়াত (ওয়াক্ত)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((w) => (
                        <button
                          key={w}
                          type="button"
                          disabled={!isEditable}
                          onClick={() => updateDailyField('prayerJamaat', w)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            Number(currentDailyEntry.prayerJamaat) === w
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-100'
                          }`}
                        >
                          {toBengaliNumber(w)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
                    <label className="text-[11px] font-bold text-rose-900 block mb-1">
                      ■ কাযা (ওয়াক্ত)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((w) => (
                        <button
                          key={w}
                          type="button"
                          disabled={!isEditable}
                          onClick={() => updateDailyField('prayerQaza', w)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            Number(currentDailyEntry.prayerQaza) === w
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-100'
                          }`}
                        >
                          {toBengaliNumber(w)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ৫. যোগাযোগ (১ম ও ২য় অংশ) */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-600"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    যোগাযোগ (জন)
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      সাংগঠনিক স্তর
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'সদস্য', key: 'commMember' as const },
                        { label: 'সাথী', key: 'commSathi' as const },
                        { label: 'কর্মী', key: 'commKormi' as const },
                        { label: 'সমর্থক', key: 'commSupporter' as const },
                      ].map((item) => (
                        <div key={item.key} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            {item.label}
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="০"
                            value={currentDailyEntry[item.key]}
                            disabled={!isEditable}
                            onChange={(e) => updateDailyField(item.key, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1 text-center text-xs font-bold text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      সাধারণ স্তর
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'বন্ধু', key: 'commFriend' as const },
                        { label: 'মেধাবীছাত্র', key: 'commMeritStudent' as const },
                        { label: 'শুভাকাঙ্ক্ষী', key: 'commWellWisher' as const },
                        { label: 'মুহাররমা', key: 'commMuharrama' as const },
                      ].map((item) => (
                        <div key={item.key} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                          <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                            {item.label}
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="০"
                            value={currentDailyEntry[item.key]}
                            disabled={!isEditable}
                            onChange={(e) => updateDailyField(item.key, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1 text-center text-xs font-bold text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ৬. বিতরণ */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    বিতরণ (টি)
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'সাহিত্য', key: 'distLiterature' as const },
                    { label: 'ম্যাগাজিন', key: 'distMagazine' as const },
                    { label: 'স্টিকার/কার্ড', key: 'distStickerCard' as const },
                    { label: 'উপহার', key: 'distGift' as const },
                  ].map((item) => (
                    <div key={item.key} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                        {item.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="০"
                        value={currentDailyEntry[item.key]}
                        disabled={!isEditable}
                        onChange={(e) => updateDailyField(item.key, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-1 text-center text-xs font-bold text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ৭. সাংগঠনিক দায়িত্ব পালন ও চেকমার্ক বিষয়সমূহ */}
              <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    সাংগঠনিক দায়িত্ব ও দৈনন্দিন আমল
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      দাওয়াতি কাজ (ঘণ্টা)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="০"
                      value={currentDailyEntry.orgDawatiHours}
                      disabled={!isEditable}
                      onChange={(e) => updateDailyField('orgDawatiHours', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 focus:bg-white focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      অন্যান্য সাংগঠনিক কাজ (ঘণ্টা)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="০"
                      value={currentDailyEntry.orgOtherHours}
                      disabled={!isEditable}
                      onChange={(e) => updateDailyField('orgOtherHours', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 focus:bg-white focus:outline-blue-600"
                    />
                  </div>
                </div>

                {/* চেকমার্কসমূহ: পত্রিকা পাঠ, কর্মী চর্চা, আত্মসমালোচনা */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {[
                    { label: 'পত্রিকা পাঠ', key: 'newspaperRead' as const },
                    { label: 'শরীর চর্চা', key: 'kormiChorcha' as const },
                    { label: 'আত্ম-সমালোচনা', key: 'selfCritique' as const },
                  ].map((item) => {
                    const isChecked = Boolean(currentDailyEntry[item.key]);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        disabled={!isEditable}
                        onClick={() => updateDailyField(item.key, !isChecked)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>■ {item.label}</span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: Report Book Full 1-31 Table View */}
          {dailyViewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    ব্যক্তিগত রিপোর্ট টেবিল (১ থেকে ৩১ তারিখ)
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    যেকোনো তারিখে ট্যাপ করে দ্রুত এন্ট্রি করতে পারেন
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[480px] overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[10px] border-collapse text-center leading-tight">
                  <thead className="sticky top-0 bg-[#0f2b5c] text-white z-10">
                    <tr>
                      <th className="p-1.5 border border-blue-900">তারিখ</th>
                      <th className="p-1.5 border border-blue-900">সূরা</th>
                      <th className="p-1.5 border border-blue-900">আয়াত</th>
                      <th className="p-1.5 border border-blue-900">হাদিস</th>
                      <th className="p-1.5 border border-blue-900">সাহিত্য</th>
                      <th className="p-1.5 border border-blue-900">পড়াশোনা</th>
                      <th className="p-1.5 border border-blue-900">ক্লাস</th>
                      <th className="p-1.5 border border-blue-900">জামায়াত</th>
                      <th className="p-1.5 border border-blue-900">কাযা</th>
                      <th className="p-1.5 border border-blue-900">যোগাযোগ</th>
                      <th className="p-1.5 border border-blue-900">বিতরণ</th>
                      <th className="p-1.5 border border-blue-900">সাংগঠনিক</th>
                      <th className="p-1.5 border border-blue-900">পত্রিকা</th>
                      <th className="p-1.5 border border-blue-900">শরীর চর্চা</th>
                      <th className="p-1.5 border border-blue-900">আত্মসমালোচনা</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReport.dailyEntries.map((row) => {
                      const isSelected = row.date === selectedDay;
                      return (
                        <tr
                          key={row.date}
                          onClick={() => {
                            setSelectedDay(row.date);
                            setDailyViewMode('card');
                          }}
                          className={`cursor-pointer border-b border-slate-200 hover:bg-blue-50 transition-colors ${
                            isSelected ? 'bg-blue-100/70 font-bold' : ''
                          }`}
                        >
                          <td className="p-1.5 border-r border-slate-200 bg-slate-50 font-bold">
                            {toBengaliNumber(row.date)}
                          </td>
                          <td className="p-1.5 border-r border-slate-200 truncate max-w-[50px]">
                            {row.quranSurah || '—'}
                          </td>
                          <td className="p-1.5 border-r border-slate-200">{toBengaliNumber(row.quranAyat)}</td>
                          <td className="p-1.5 border-r border-slate-200">{toBengaliNumber(row.hadithCount)}</td>
                          <td className="p-1.5 border-r border-slate-200">
                            {toBengaliNumber((Number(row.literatureIslamic) || 0) + (Number(row.literatureOther) || 0))}
                          </td>
                          <td className="p-1.5 border-r border-slate-200">{toBengaliNumber(row.textbookHours)} ঘ</td>
                          <td className="p-1.5 border-r border-slate-200">{row.classPresent ? '✓' : '—'}</td>
                          <td className="p-1.5 border-r border-slate-200">{toBengaliNumber(row.prayerJamaat)}</td>
                          <td className="p-1.5 border-r border-slate-200">{toBengaliNumber(row.prayerQaza)}</td>
                          <td className="p-1.5 border-r border-slate-200">
                            {toBengaliNumber(
                              (Number(row.commMember) || 0) +
                                (Number(row.commSathi) || 0) +
                                (Number(row.commKormi) || 0) +
                                (Number(row.commSupporter) || 0)
                            )}
                          </td>
                          <td className="p-1.5 border-r border-slate-200">
                            {toBengaliNumber(
                              (Number(row.distLiterature) || 0) +
                                (Number(row.distMagazine) || 0) +
                                (Number(row.distStickerCard) || 0) +
                                (Number(row.distGift) || 0)
                            )}
                          </td>
                          <td className="p-1.5 border-r border-slate-200">
                            {toBengaliNumber(
                              (Number(row.orgDawatiHours) || 0) + (Number(row.orgOtherHours) || 0)
                            )} ঘ
                          </td>
                          <td className="p-1.5 border-r border-slate-200">{row.newspaperRead ? '✓' : '—'}</td>
                          <td className="p-1.5 border-r border-slate-200">{row.kormiChorcha ? '✓' : '—'}</td>
                          <td className="p-1.5">{row.selfCritique ? '✓' : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PART 2: মাসিক পরিকল্পনা (2nd Page of PDF)                                  */}
      {/* ========================================================================= */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          {/* Month & Year Select Card */}
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">পরিকল্পনার মাস:</span>
              <select
                value={currentReport.monthlyPlan.month}
                disabled={!isEditable}
                onChange={(e) => updatePlanField('month', e.target.value)}
                className="bg-blue-50 border border-blue-300 text-blue-900 font-bold text-xs rounded-lg px-2 py-1 focus:outline-blue-600"
              >
                {BENGALI_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">সাল:</span>
              <select
                value={currentReport.monthlyPlan.year}
                disabled={!isEditable}
                onChange={(e) => updatePlanField('year', e.target.value)}
                className="bg-blue-50 border border-blue-300 text-blue-900 font-bold text-xs rounded-lg px-2 py-1 focus:outline-blue-600"
              >
                {REPORT_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ১. কুরআন অধ্যয়ন */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">কুরআন অধ্যয়ন</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মোট দিন</label>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.quranTotalDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('quranTotalDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">গড় আয়াত</label>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.quranAvgAyat}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('quranAvgAyat', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">সূরার নাম</label>
                <input
                  type="text"
                  placeholder="সূরার নাম লিখুন"
                  value={currentReport.monthlyPlan.quranSurahName}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('quranSurahName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">দারস প্রস্তুত</label>
                <input
                  type="text"
                  placeholder="দারসের বিষয় / আয়াত"
                  value={currentReport.monthlyPlan.quranDarsPrepared}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('quranDarsPrepared', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মুখস্থ: আয়াত</label>
                <input
                  type="text"
                  placeholder="সংখ্যা বা আয়াত"
                  value={currentReport.monthlyPlan.quranMemorizedAyat}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('quranMemorizedAyat', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মুখস্থ: অর্থসহ সূরা</label>
                <input
                  type="text"
                  placeholder="অর্থসহ সূরার নাম"
                  value={currentReport.monthlyPlan.quranMemorizedSurahWithMeaning}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('quranMemorizedSurahWithMeaning', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ২. হাদিস অধ্যয়ন */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">হাদিস অধ্যয়ন</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মোট দিন</label>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.hadithTotalDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('hadithTotalDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">গড় হাদিস</label>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.hadithAvgCount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('hadithAvgCount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">গ্রন্থ / বিষয়</label>
                <input
                  type="text"
                  placeholder="গ্রন্থ বা বিষয়ের নাম"
                  value={currentReport.monthlyPlan.hadithBookSubject}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('hadithBookSubject', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">দারস প্রস্তুত</label>
                <input
                  type="text"
                  placeholder="দারসের বিবরণ"
                  value={currentReport.monthlyPlan.hadithDarsPrepared}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('hadithDarsPrepared', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মুখস্থ হাদিস সংখ্যা</label>
                <input
                  type="text"
                  placeholder="সংখ্যা"
                  value={currentReport.monthlyPlan.hadithMemorizedCount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('hadithMemorizedCount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মুখস্থ বিষয়</label>
                <input
                  type="text"
                  placeholder="হাদিসের বিষয়"
                  value={currentReport.monthlyPlan.hadithMemorizedSubject}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('hadithMemorizedSubject', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ৩. সাহিত্য অধ্যয়ন */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">সাহিত্য অধ্যয়ন</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">মোট পৃষ্ঠা</label>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.literatureTotalPages}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('literatureTotalPages', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">ইসলামী পৃষ্ঠা</label>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.literatureIslamicPages}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('literatureIslamicPages', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">অন্যান্য পৃষ্ঠা</label>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.literatureOtherPages}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('literatureOtherPages', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div className="col-span-3">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">বইয়ের নাম</label>
                <input
                  type="text"
                  placeholder="পঠিত বইয়ের নাম"
                  value={currentReport.monthlyPlan.literatureBookName}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('literatureBookName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">বই নোট</label>
                <input
                  type="text"
                  placeholder="বই নোটের বিবরণ"
                  value={currentReport.monthlyPlan.literatureBookNotes}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('literatureBookNotes', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">আলোচনা নোট</label>
                <input
                  type="text"
                  placeholder="আলোচনা নোটের বিবরণ"
                  value={currentReport.monthlyPlan.literatureDiscussionNotes}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('literatureDiscussionNotes', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ৪. পাঠ্যপুস্তক অধ্যয়ন ও নামাজ */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">পাঠ্যপুস্তক অধ্যয়ন ও নামাজ</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">মোট দিন</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.textbookTotalDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('textbookTotalDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">গড় ঘণ্টা</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentReport.monthlyPlan.textbookAvgHours}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('textbookAvgHours', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">মোট ক্লাস</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.classTotalClasses}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('classTotalClasses', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">উপস্থিতি</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.classAttended}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('classAttended', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
            </div>

            {/* নামাজ পরিকল্পনা */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">নামাজ অঙ্গীকার:</span>
              <button
                type="button"
                disabled={!isEditable}
                onClick={() => updatePlanField('prayerJamaatPledge', !currentReport.monthlyPlan.prayerJamaatPledge)}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between text-left transition-all ${
                  currentReport.monthlyPlan.prayerJamaatPledge
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>● প্রতি ওয়াক্ত নামাজ জামায়াতে আদায় করা হবে ইনশাআল্লাহ</span>
                {currentReport.monthlyPlan.prayerJamaatPledge ? (
                  <CheckSquare className="w-4 h-4 text-blue-700 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              <button
                type="button"
                disabled={!isEditable}
                onClick={() => updatePlanField('prayerNafalPledge', !currentReport.monthlyPlan.prayerNafalPledge)}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between text-left transition-all ${
                  currentReport.monthlyPlan.prayerNafalPledge
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>● কিছু নফল নামাজ/ইবাদত আদায় করা হবে ইনশাআল্লাহ</span>
                {currentReport.monthlyPlan.prayerNafalPledge ? (
                  <CheckSquare className="w-4 h-4 text-blue-700 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* ৫. যোগাযোগ পরিকল্পনা */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">যোগাযোগ পরিকল্পনা (জন)</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
              {[
                { label: 'সদস্য', key: 'commMember' as const },
                { label: 'সাথী', key: 'commSathi' as const },
                { label: 'কর্মী', key: 'commKormi' as const },
                { label: 'সমর্থক', key: 'commSupporter' as const },
                { label: 'বন্ধু', key: 'commFriend' as const },
                { label: 'শুভাকাঙ্ক্ষী', key: 'commWellWisher' as const },
                { label: 'স্কুল ছাত্র', key: 'commSchoolStudent' as const },
                { label: 'মেধাবী ছাত্র', key: 'commMeritStudent' as const },
                { label: 'শিক্ষক', key: 'commTeacher' as const },
                { label: 'মুহাররমা', key: 'commMuharrama' as const },
                { label: 'ভিআইপি', key: 'commVIP' as const },
              ].map((item) => (
                <div key={item.key} className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">{item.label}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="০"
                    value={currentReport.monthlyPlan[item.key]}
                    disabled={!isEditable}
                    onChange={(e) => updatePlanField(item.key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1 text-xs font-bold text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ৬. সাংগঠনিক দায়িত্ব পালন */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">সাংগঠনিক দায়িত্ব পালন</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মোট দিন</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.orgTotalDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('orgTotalDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">গড় ঘণ্টা</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentReport.monthlyPlan.orgAvgHours}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('orgAvgHours', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">দাওয়াতি কাজ দিন</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.orgDawatiDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('orgDawatiDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">দাওয়াতি কাজ গড় ঘণ্টা</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentReport.monthlyPlan.orgDawatiAvgHours}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('orgDawatiAvgHours', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">অন্যান্য কাজ দিন</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.orgOtherDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('orgOtherDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">অন্যান্য কাজ গড় ঘণ্টা</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentReport.monthlyPlan.orgOtherAvgHours}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('orgOtherAvgHours', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* ৭. বিতরণ (PDF Page 2 Table Replica) */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">বিতরণ পরিকল্পনা (টি)</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'ইসলামী সাহিত্য', key: 'distIslamicLiterature' as const },
                { label: 'ছাত্র সংবাদ', key: 'distChhatroSongbad' as const },
                { label: 'ক্লাস রুটিন', key: 'distClassRoutine' as const },
                { label: 'কিশোর পত্রিকা', key: 'distKishorePotrika' as const },
                { label: 'ইংরেজি পত্রিকা', key: 'distEnglishPotrika' as const },
                { label: 'স্টিকার/কার্ড', key: 'distStickerCard' as const },
                { label: 'Y.W.', key: 'distYW' as const },
                { label: 'পরিচিতি', key: 'distPorichiti' as const },
                { label: 'উপহার/মেসেজ', key: 'distGiftMessage' as const },
              ].map((item) => (
                <div key={item.key} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">{item.label}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="০"
                    value={currentReport.monthlyPlan[item.key]}
                    disabled={!isEditable}
                    onChange={(e) => updatePlanField(item.key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1 text-xs font-bold text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ৮. বৃদ্ধি (PDF Page 2 Table Replica) */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">বৃদ্ধি পরিকল্পনা (জন)</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'সদস্য', key: 'growthMember' as const },
                { label: 'কর্মী', key: 'growthKormi' as const },
                { label: 'সদস্যপ্রার্থী', key: 'growthMemberCandidate' as const },
                { label: 'সমর্থক', key: 'growthSupporter' as const },
                { label: 'সাথী', key: 'growthSathi' as const },
                { label: 'বন্ধু', key: 'growthFriend' as const },
                { label: 'সাথীপ্রার্থী', key: 'growthSathiCandidate' as const },
                { label: 'শুভাকাঙ্ক্ষী', key: 'growthWellWisher' as const },
              ].map((item) => (
                <div key={item.key} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">{item.label}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="০"
                    value={currentReport.monthlyPlan[item.key]}
                    disabled={!isEditable}
                    onChange={(e) => updatePlanField(item.key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1 text-xs font-bold text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ৯. বায়তুলমাল */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">বায়তুলমাল</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">পরিশোধের তারিখ</label>
                <input
                  type="date"
                  value={currentReport.monthlyPlan.baitulPaymentDate}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('baitulPaymentDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">ব্যক্তিগত বৃদ্ধি (টাকা)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.baitulPersonalGrowthAmount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('baitulPersonalGrowthAmount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">মোট বৃদ্ধি (টাকা)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.baitulTotalGrowthAmount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('baitulTotalGrowthAmount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">ছাত্রকল্যাণ (টাকা)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.baitulStudentWelfareAmount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('baitulStudentWelfareAmount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">টেবিল ব্যাংক (টাকা)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.baitulTableBankAmount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('baitulTableBankAmount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">কলসি/হাঁড়ি (টি)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.baitulKolsiCount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('baitulKolsiCount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* ১০. বিবিধ (PDF Page 2 Exact Fields) */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">বিবিধ</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">আত্মসমালোচনা (দিন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscSelfCritiqueDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscSelfCritiqueDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">শরীরচর্চা (দিন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscExerciseDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscExerciseDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">পত্রিকা পাঠ (দিন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscNewspaperDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscNewspaperDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">আত্মীয়স্বজন (পুরুষ) যোগাযোগ (জন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscRelativeCommCount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscRelativeCommCount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">গ্রুপ দাওয়াতি কাজ (বার)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscGroupDawatiCount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscGroupDawatiCount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">দাওয়াতি মেসেজ প্রেরণ (টি)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscDawatiMessageCount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscDawatiMessageCount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">দাওয়াতি ই-মেইল প্রেরণ (টি)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscDawatiEmailCount}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscDawatiEmailCount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">অমুসলিম বন্ধু যোগাযোগ (জন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscNonMuslimFriendComm}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscNonMuslimFriendComm', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">বন্ধু সংগঠনের সাথে যোগাযোগ (জন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscFriendOrgComm}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscFriendOrgComm', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">কম্পিউটার শিক্ষা (দিন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscComputerSkillDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscComputerSkillDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">ভাষা শিক্ষা (দিন)</label>
                <input
                  type="number"
                  value={currentReport.monthlyPlan.miscLanguageSkillDays}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscLanguageSkillDays', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">অন্যান্য দক্ষতা</label>
                <input
                  type="text"
                  placeholder="বিবরণ"
                  value={currentReport.monthlyPlan.miscSkillOther}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscSkillOther', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs"
                />
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-700">নিজ উদ্যোগে দায়িত্বশীলকে রিপোর্ট দেখানো হয়েছে:</span>
                <input
                  type="number"
                  placeholder="০"
                  value={currentReport.monthlyPlan.miscReportShownToLeaderTimes}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscReportShownToLeaderTimes', e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                />
                <span className="text-[11px] font-semibold text-slate-700">বার ; তারিখ:</span>
                <input
                  type="date"
                  value={currentReport.monthlyPlan.miscReportShownDate}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('miscReportShownDate', e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ১১. দায়িত্বশীলের পরামর্শ ও স্বাক্ষর এবং পরিকল্পনা গ্রহণকারীর স্বাক্ষর */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">পরামর্শ ও স্বাক্ষর</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  দায়িত্বশীলের পরামর্শ ও মন্তব্য:
                </label>
                <textarea
                  rows={3}
                  placeholder="দায়িত্বশীলের পরামর্শ লিখুন..."
                  value={currentReport.monthlyPlan.leaderComments}
                  disabled={!isEditable}
                  onChange={(e) => updatePlanField('leaderComments', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    পরিকল্পনা গ্রহণকারীর স্বাক্ষর / নাম:
                  </label>
                  <input
                    type="text"
                    value={currentReport.monthlyPlan.plannerSignature}
                    disabled={!isEditable}
                    onChange={(e) => updatePlanField('plannerSignature', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">তারিখ:</label>
                  <input
                    type="date"
                    value={currentReport.monthlyPlan.plannerDate}
                    disabled={!isEditable}
                    onChange={(e) => updatePlanField('plannerDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PART 3: সংরক্ষিত রিপোর্ট তালিকা (List of saved records)                     */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Annual 12-Month Overview Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span>১২ মাসের বাৎসরিক রিপোর্ট খতিয়ান ({currentReport.year} সাল)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  জানুয়ারি থেকে ডিসেম্বর পর্যন্ত যেকোনো মাসের রিপোর্টে এক ক্লিকে প্রবেশ ও PDF তৈরি করুন
                </p>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 pl-1.5">সাল:</span>
                <select
                  value={currentReport.year}
                  onChange={(e) => handleSelectYear(e.target.value)}
                  className="bg-white border border-slate-200 text-blue-900 font-bold text-xs rounded-lg px-2 py-1 focus:outline-blue-600 cursor-pointer"
                >
                  {REPORT_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y} সাল
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 12-Month Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {BENGALI_MONTHS.map((m, idx) => {
                const isCurrent = m === currentReport.month;
                const matchingRep = savedReports.find(
                  (r) => r.month === m && r.year === currentReport.year
                );
                const filledDaysCount = matchingRep
                  ? matchingRep.dailyEntries.filter((d) => d.quranAyat || d.prayerJamaat).length
                  : 0;
                const hasData = filledDaysCount > 0;

                return (
                  <div
                    key={m}
                    className={`rounded-xl p-2.5 border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-200'
                        : hasData
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{m}</span>
                        {isCurrent ? (
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-md">
                            সক্রিয়
                          </span>
                        ) : hasData ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            তথ্য সংরক্ষিত
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400">খালি</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">
                        {hasData
                          ? `${toBengaliNumber(filledDaysCount)} দিন পূরণকৃত`
                          : 'কোনো এন্ট্রি নেই'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 pt-1.5 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          handleSelectMonth(m);
                          setActiveTab('daily');
                        }}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#0f2b5c] text-white'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {isCurrent ? 'চলমান' : 'খুলুন'}
                      </button>
                      <button
                        onClick={() => {
                          const target = matchingRep || getOrCreateReport(m, currentReport.year, savedReports).report;
                          onOpenPDF(target);
                        }}
                        className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                        title={`${m} মাসের PDF`}
                      >
                        <FileDown className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xs font-bold text-slate-800">সমস্ত সংরক্ষিত রিপোর্ট সমূহ ({toBengaliNumber(savedReports.length)} টি)</h3>
            <button
              onClick={handleCreateNewReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন রিপোর্ট তৈরি</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {savedReports.map((rep) => {
              const isCurrent = rep.id === currentReport.id;
              return (
                <div
                  key={rep.id}
                  className={`bg-white rounded-2xl p-4 border shadow-xs transition-all ${
                    isCurrent ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rep.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          সংরক্ষণের তারিখ: {new Date(rep.updatedAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                        বর্তমান সক্রিয়
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSelectReport(rep);
                        setActiveTab('daily');
                        showToast(`${rep.title} লোড করা হয়েছে`, 'info');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs"
                    >
                      রিপোর্ট দেখুন ও পূরণ করুন
                    </button>
                    <button
                      onClick={() => onOpenPDF(rep)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-200"
                      title="PDF বা গ্যালারিতে ছবি হিসেবে ডাউনলোড করুন"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PDF / ছবি</span>
                    </button>
                    <button
                      onClick={() => handleOpenShare(rep)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-200"
                      title="রিপোর্ট শেয়ার করুন"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>শেয়ার</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REQUIRED MANDATORY FORM ACTIONS AT END OF FORM                            */}
      {/* - সংরক্ষণ করুন                                                            */}
      {/* - সম্পাদনা করুন                                                            */}
      {/* - বাতিল করুন                                                              */}
      {/* - রিপোর্ট দেখুন                                                            */}
      {/* - PDF তৈরি করুন                                                            */}
      {/* - শেয়ার করুন (WhatsApp / Social)                                          */}
      {/* ========================================================================= */}
      <div
        id="report-form-action-bar"
        className="bg-white rounded-2xl p-4 border border-slate-300 shadow-md space-y-2.5 sticky bottom-14 z-20"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
          রিপোর্ট বই ফর্ম একশন কন্ট্রোল
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* ১. সংরক্ষণ করুন */}
          <button
            id="btn-save-report"
            onClick={handleSave}
            className="bg-[#0f2b5c] hover:bg-blue-900 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>সংরক্ষণ করুন</span>
          </button>

          {/* ২. সম্পাদনা করুন */}
          <button
            id="btn-edit-report"
            onClick={handleToggleEdit}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              isEditable
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Edit className="w-4 h-4 text-blue-600" />
            <span>{isEditable ? 'লক করুন' : 'সম্পাদনা করুন'}</span>
          </button>

          {/* ৩. বাতিল করুন */}
          <button
            id="btn-cancel-report"
            onClick={handleReset}
            className="bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>বাতিল করুন</span>
          </button>

          {/* ৪. রিপোর্ট দেখুন */}
          <button
            id="btn-view-reports"
            onClick={() => setActiveTab('list')}
            className="bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-800 border border-purple-200 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-purple-600" />
            <span>রিপোর্ট দেখুন</span>
          </button>

          {/* ৫. PDF ও ছবি ডাউনলোড */}
          <button
            id="btn-generate-pdf"
            onClick={() => onOpenPDF(currentReport)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="রিপোর্ট বই, মাসিক রিপোর্ট ও পরিকল্পনা PDF বা গ্যালারিতে ছবি হিসেবে ডাউনলোড করুন"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>PDF ও ছবি ডাউনলোড</span>
          </button>

          {/* ৬. শেয়ার করুন */}
          <button
            id="btn-share-report"
            onClick={() => handleOpenShare()}
            className="col-span-2 sm:col-span-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="WhatsApp বা সোশ্যাল মিডিয়ায় শেয়ার করুন"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>শেয়ার করুন</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ReportShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        report={shareTargetReport || currentReport}
        userName={userName}
      />
    </div>
  );
};
