import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  FileDown,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ReportRecord } from '../types';
import { toBengaliNumber } from '../utils/storage';
import { ReportShareModal } from './ReportShareModal';
import {
  exportSinglePageToPDF,
  exportFullBookToPDF,
  captureElementToCanvas,
  saveCanvasToGalleryImage,
  combineCanvases,
  ExportDocChoice,
} from '../utils/pdfExport';

interface ReportPDFViewProps {
  report: ReportRecord;
  onBack: () => void;
  userName?: string;
}

export const ReportPDFView: React.FC<ReportPDFViewProps> = ({ report, onBack, userName }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ExportDocChoice>('full');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const page1Ref = useRef<HTMLDivElement | null>(null);
  const page2Ref = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const plan = report.monthlyPlan;

  // Base sanitized filename helper
  const getBaseFileName = (type: ExportDocChoice, ext: string) => {
    const cleanMonth = report.month.replace(/\s+/g, '-');
    const cleanYear = report.year;
    if (type === 'monthly_report') {
      return `shibir-masik-report-${cleanMonth}-${cleanYear}.${ext}`;
    }
    if (type === 'monthly_plan') {
      return `shibir-masik-porikolpona-${cleanMonth}-${cleanYear}.${ext}`;
    }
    return `shibir-purno-report-boi-${cleanMonth}-${cleanYear}.${ext}`;
  };

  // 1. Download as PDF (Files saved to Folder)
  const handleDownloadPDF = async (docChoice: ExportDocChoice = selectedDoc) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      if (docChoice === 'monthly_report') {
        setDownloadStatusText('মাসিক রিপোর্ট PDF তৈরি হচ্ছে...');
        if (!page1Ref.current) throw new Error('Report element not found');
        const fileName = getBaseFileName('monthly_report', 'pdf');
        await exportSinglePageToPDF(page1Ref.current, fileName, 'landscape');
        showToast('✓ মাসিক রিপোর্ট PDF ডাউনলোড সম্পন্ন হয়েছে! ফাইলটি আপনার ডিভাইসের ফোল্ডারে সেভ হয়েছে।');
      } else if (docChoice === 'monthly_plan') {
        setDownloadStatusText('মাসিক পরিকল্পনা PDF তৈরি হচ্ছে...');
        if (!page2Ref.current) throw new Error('Plan element not found');
        const fileName = getBaseFileName('monthly_plan', 'pdf');
        await exportSinglePageToPDF(page2Ref.current, fileName, 'portrait');
        showToast('✓ মাসিক পরিকল্পনা PDF ডাউনলোড সম্পন্ন হয়েছে! ফাইলটি আপনার ফোল্ডারে সেভ হয়েছে।');
      } else {
        setDownloadStatusText('পূর্ণাঙ্গ রিপোর্ট বই (উভয় অংশ) PDF তৈরি হচ্ছে...');
        if (!page1Ref.current || !page2Ref.current) throw new Error('Elements not found');
        const fileName = getBaseFileName('full', 'pdf');
        await exportFullBookToPDF(page1Ref.current, page2Ref.current, fileName);
        showToast('✓ পূর্ণাঙ্গ রিপোর্ট বই PDF সফলভাবে ডাউনলোড হয়েছে! আপনার Downloads ফোল্ডারে পাওয়া যাবে।');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('PDF তৈরিতে সমস্যা হয়েছে। ব্রাউজার প্রিন্ট অপশনটি ব্যবহার করুন।');
    } finally {
      setIsDownloading(false);
      setDownloadStatusText('');
    }
  };

  // 2. Download as Image (Directly goes to Mobile Gallery / Photos)
  const handleDownloadGalleryImage = async (docChoice: ExportDocChoice = selectedDoc) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      if (docChoice === 'monthly_report') {
        setDownloadStatusText('গ্যালারির জন্য মাসিক রিপোর্টের ছবি প্রস্তুত হচ্ছে...');
        if (!page1Ref.current) throw new Error('Report element not found');
        const canvas = await captureElementToCanvas(page1Ref.current, { scale: 2 });
        const fileName = getBaseFileName('monthly_report', 'png');
        saveCanvasToGalleryImage(canvas, fileName);
        showToast('✓ মাসিক রিপোর্টের ছবি ডাউনলোড হয়েছে! সরাসরি আপনার ফোনের গ্যালারি (Gallery)-তে পাবেন।');
      } else if (docChoice === 'monthly_plan') {
        setDownloadStatusText('গ্যালারির জন্য পরিকল্পনার ছবি প্রস্তুত হচ্ছে...');
        if (!page2Ref.current) throw new Error('Plan element not found');
        const canvas = await captureElementToCanvas(page2Ref.current, { scale: 2 });
        const fileName = getBaseFileName('monthly_plan', 'png');
        saveCanvasToGalleryImage(canvas, fileName);
        showToast('✓ পরিকল্পনার ছবি ডাউনলোড হয়েছে! আপনার ফোনের গ্যালারি (Gallery)-তে সেভ হয়েছে।');
      } else {
        setDownloadStatusText('গ্যালারির জন্য সম্পূর্ণ রিপোর্ট বইয়ের ছবি প্রস্তুত হচ্ছে...');
        if (!page1Ref.current || !page2Ref.current) throw new Error('Elements not found');
        const canvas1 = await captureElementToCanvas(page1Ref.current, { scale: 2 });
        const canvas2 = await captureElementToCanvas(page2Ref.current, { scale: 2 });
        const combined = combineCanvases(canvas1, canvas2);
        const fileName = getBaseFileName('full', 'png');
        saveCanvasToGalleryImage(combined, fileName);
        showToast('✓ সম্পূর্ণ রিপোর্ট বইয়ের ছবি সফলভাবে ডাউনলোড হয়েছে এবং গ্যালারিতে সংরক্ষিত হয়েছে!');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      showToast('ছবি তৈরিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
      setDownloadStatusText('');
    }
  };

  // Calculate totals for table
  const totals = report.dailyEntries.reduce(
    (acc, row) => {
      return {
        quranAyat: acc.quranAyat + (Number(row.quranAyat) || 0),
        hadithCount: acc.hadithCount + (Number(row.hadithCount) || 0),
        litIslamic: acc.litIslamic + (Number(row.literatureIslamic) || 0),
        litOther: acc.litOther + (Number(row.literatureOther) || 0),
        textbookHours: acc.textbookHours + (Number(row.textbookHours) || 0),
        classPresent: acc.classPresent + (row.classPresent ? 1 : 0),
        prayerJamaat: acc.prayerJamaat + (Number(row.prayerJamaat) || 0),
        prayerQaza: acc.prayerQaza + (Number(row.prayerQaza) || 0),
        commMember: acc.commMember + (Number(row.commMember) || 0),
        commSathi: acc.commSathi + (Number(row.commSathi) || 0),
        commKormi: acc.commKormi + (Number(row.commKormi) || 0),
        commSupporter: acc.commSupporter + (Number(row.commSupporter) || 0),
        commFriend: acc.commFriend + (Number(row.commFriend) || 0),
        commMerit: acc.commMerit + (Number(row.commMeritStudent) || 0),
        commWellWisher: acc.commWellWisher + (Number(row.commWellWisher) || 0),
        commMuharrama: acc.commMuharrama + (Number(row.commMuharrama) || 0),
        distLit: acc.distLit + (Number(row.distLiterature) || 0),
        distMag: acc.distMag + (Number(row.distMagazine) || 0),
        distSticker: acc.distSticker + (Number(row.distStickerCard) || 0),
        distGift: acc.distGift + (Number(row.distGift) || 0),
        orgDawati: acc.orgDawati + (Number(row.orgDawatiHours) || 0),
        orgOther: acc.orgOther + (Number(row.orgOtherHours) || 0),
        newspaper: acc.newspaper + (row.newspaperRead ? 1 : 0),
        kormi: acc.kormi + (row.kormiChorcha ? 1 : 0),
        selfCritique: acc.selfCritique + (row.selfCritique ? 1 : 0),
      };
    },
    {
      quranAyat: 0,
      hadithCount: 0,
      litIslamic: 0,
      litOther: 0,
      textbookHours: 0,
      classPresent: 0,
      prayerJamaat: 0,
      prayerQaza: 0,
      commMember: 0,
      commSathi: 0,
      commKormi: 0,
      commSupporter: 0,
      commFriend: 0,
      commMerit: 0,
      commWellWisher: 0,
      commMuharrama: 0,
      distLit: 0,
      distMag: 0,
      distSticker: 0,
      distGift: 0,
      orgDawati: 0,
      orgOther: 0,
      newspaper: 0,
      kormi: 0,
      selfCritique: 0,
    }
  );

  return (
    <div className="bg-slate-100 min-h-screen text-slate-900 pb-16">
      {/* ============================================================== */}
      {/* 1. TOP STICKY APP BAR (Hidden during printing)                 */}
      {/* ============================================================== */}
      <header className="bg-[#0f2b5c] text-white px-3 sm:px-4 py-2.5 sticky top-0 z-30 shadow-md flex items-center justify-between no-print">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="truncate">
            <h2 className="text-sm font-bold truncate">রিপোর্ট বই ও পরিকল্পনা ডাউনলোড</h2>
            <p className="text-[11px] text-blue-200">
              {report.month} {report.year} • সরাসরি ফোল্ডার বা গ্যালারিতে সেভ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            title="হোয়াটসঅ্যাপ বা সোশ্যাল মিডিয়ায় শেয়ার করুন"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">শেয়ার</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-white/15 hover:bg-white/25 active:scale-95 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-white/20"
            title="ব্রাউজারে সরাসরি প্রিন্ট বা সেভ করুন"
          >
            <Printer className="w-3.5 h-3.5 text-blue-200" />
            <span className="hidden sm:inline">প্রিন্ট</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 max-w-[90vw] text-center">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Loading Modal Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ডাউনলোড প্রক্রিয়া চলছে</h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">{downloadStatusText}</p>
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-200">
              ফাইলটি সম্পূর্ণ প্রস্তুত হওয়ার পর স্বয়ংক্রিয়ভাবে ডাউনলোড হয়ে যাবে...
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DEDICATED DOWNLOAD & GALLERY CONTROL PANEL                  */}
      {/* ============================================================== */}
      <div className="no-print max-w-4xl mx-auto px-2 sm:px-6 pt-4 pb-2">
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-300 shadow-sm space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FileDown className="w-4 h-4 text-blue-700" />
                <span>রিপোর্ট বই ও পরিকল্পনা ডাউনলোড অপশন</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                নিচের যেকোনো অপশন বেছে নিয়ে সরাসরি মোবাইলের গ্যালারি বা ফোল্ডারে ডাউনলোড করুন
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-center">
              {report.month} {report.year}
            </span>
          </div>

          {/* Step 1: Select which document to view/download */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
              ১. কোন ডকুমেন্ট ডাউনলোড করতে চান?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option A: Full Report Book */}
              <button
                type="button"
                onClick={() => setSelectedDoc('full')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  selectedDoc === 'full'
                    ? 'bg-blue-50/80 border-[#0f2b5c] ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    selectedDoc === 'full' ? 'bg-[#0f2b5c] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900">সম্পূর্ণ রিপোর্ট বই</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    উভয় অংশ (মাসিক রিপোর্ট + পরিকল্পনা একসাথে)
                  </div>
                </div>
              </button>

              {/* Option B: Monthly Report Table Only */}
              <button
                type="button"
                onClick={() => setSelectedDoc('monthly_report')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  selectedDoc === 'monthly_report'
                    ? 'bg-blue-50/80 border-[#0f2b5c] ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    selectedDoc === 'monthly_report'
                      ? 'bg-[#0f2b5c] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900">১. মাসিক রিপোর্ট (ছক)</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    দৈনিক আমল, অধ্যয়ন ও যোগাযোগের ছক
                  </div>
                </div>
              </button>

              {/* Option C: Monthly Plan Only */}
              <button
                type="button"
                onClick={() => setSelectedDoc('monthly_plan')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  selectedDoc === 'monthly_plan'
                    ? 'bg-blue-50/80 border-[#0f2b5c] ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    selectedDoc === 'monthly_plan'
                      ? 'bg-[#0f2b5c] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900">২. মাসিক পরিকল্পনা</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    মাসিক লক্ষ্যমাত্রা, বিতরণ ও বাজেট পরিকল্পনা
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Primary One-Click Action Buttons */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
              ২. ডাউনলোডের মাধ্যম ও গন্তব্য বেছে নিন:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Action 1: Download PDF (Saves to Folder) */}
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedDoc)}
                disabled={isDownloading}
                className="bg-[#0f2b5c] hover:bg-blue-900 active:scale-98 text-white p-3 rounded-xl flex items-center justify-between shadow-md transition-all cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-400/20 text-white shrink-0 group-hover:scale-105 transition-transform">
                    <FileDown className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>PDF ডাউনলোড করুন</span>
                      <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-black">
                        .PDF
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-200 mt-0.5">
                      সরাসরি মোবাইল বা পিসির ফোল্ডারে সেভ হবে
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-blue-200 shrink-0 ml-2" />
              </button>

              {/* Action 2: Download Image (Saves to Gallery / Photos) */}
              <button
                type="button"
                onClick={() => handleDownloadGalleryImage(selectedDoc)}
                disabled={isDownloading}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white p-3 rounded-xl flex items-center justify-between shadow-md transition-all cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20 text-white shrink-0 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>গ্যালারিতে ছবি সেভ করুন</span>
                      <span className="text-[10px] bg-yellow-400 text-slate-900 px-1.5 py-0.2 rounded font-black">
                        .PNG
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-100 mt-0.5">
                      সরাসরি মোবাইল গ্যালারি / ফটোসে চলে যাবে
                    </div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-200 shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Quick Helpful Notice */}
          <div className="flex items-center gap-2 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <b>সহায়িকা:</b> “গ্যালারিতে ছবি সেভ করুন” চাপলে আল্ট্রা-এইচডি ফরম্যাটে ছবি ডাউনলোড হয়ে সরাসরি ফোনের <b>গ্যালারি (Gallery / Photos)</b>-তে জমা হবে। আর “PDF ডাউনলোড” চাপলে তা ফাইল ম্যানেজারের <b>Downloads</b> ফোল্ডারে পাওয়া যাবে।
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. DOCUMENT PREVIEW CONTENT (Printable & Exportable)            */}
      {/* ============================================================== */}
      <div id="pdf-full-book" className="max-w-4xl mx-auto p-2 sm:p-6 space-y-8">
        {/* ============================================================== */}
        {/* PAGE 1: ব্যক্তিগত রিপোর্ট (Table Replica)                        */}
        {/* ============================================================== */}
        {(selectedDoc === 'full' || selectedDoc === 'monthly_report') && (
          <div
            id="pdf-page-monthly"
            ref={page1Ref}
            className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border border-slate-300 print:border-none print:shadow-none print:p-0 page-break"
          >
            {/* Header */}
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-slate-700">বিসমিল্লাহির রাহমানির রাহিম</p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">ব্যক্তিগত রিপোর্ট</h1>
              <div className="flex justify-between items-center text-xs font-medium text-slate-600 mt-2 px-1 border-b pb-1 border-slate-300">
                <span>
                  মাস: <b className="text-slate-900">{report.month}</b>
                </span>
                {userName && (
                  <span className="hidden sm:inline text-slate-800 font-bold">
                    নাম: {userName}
                  </span>
                )}
                <span>
                  সাল: <b className="text-slate-900">{report.year}</b>
                </span>
              </div>
            </div>

            {/* Full Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[9px] sm:text-[11px] border-collapse border border-slate-800 text-center leading-tight">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-800">
                    <th rowSpan={2} className="border border-slate-700 p-1 w-6">
                      তারিখ
                    </th>
                    <th colSpan={2} className="border border-slate-700 p-1">
                      কুরআন অধ্যয়ন
                    </th>
                    <th rowSpan={2} className="border border-slate-700 p-1">
                      হাদিস অধ্যয়ন
                      <br />
                      <span className="font-normal text-[8px] sm:text-[10px]">■ সংখ্যা</span>
                    </th>
                    <th colSpan={2} className="border border-slate-700 p-1">
                      সাহিত্য অধ্যয়ন
                    </th>
                    <th rowSpan={2} className="border border-slate-700 p-1">
                      পাঠ্যপুস্তক
                      <br />
                      অধ্যয়ন
                      <br />
                      <span className="font-normal text-[8px] sm:text-[10px]">■ ঘণ্টা</span>
                    </th>
                    <th rowSpan={2} className="border border-slate-700 p-1 w-5">
                      ক্লাস
                      <br />☑
                    </th>
                    <th colSpan={2} className="border border-slate-700 p-1">
                      নামাজ
                    </th>
                    <th colSpan={4} className="border border-slate-700 p-1">
                      যোগাযোগ (১)
                    </th>
                    <th colSpan={4} className="border border-slate-700 p-1">
                      যোগাযোগ (২)
                    </th>
                    <th colSpan={4} className="border border-slate-700 p-1">
                      বিতরণ
                    </th>
                    <th colSpan={2} className="border border-slate-700 p-1">
                      সাংগঠনিক দায়িত্ব (ঘণ্টা)
                    </th>
                    <th rowSpan={2} className="border border-slate-700 p-1 w-6">
                      পত্রিকা
                      <br />
                      পাঠ
                      <br />☑
                    </th>
                    <th rowSpan={2} className="border border-slate-700 p-1 w-6">
                      শরীর
                      <br />
                      চর্চা
                      <br />☑
                    </th>
                    <th rowSpan={2} className="border border-slate-700 p-1 w-6">
                      আত্ম-
                      <br />
                      সমালোচনা
                      <br />☑
                    </th>
                  </tr>
                  <tr className="bg-slate-50 font-semibold border-b border-slate-800 text-[8px] sm:text-[10px]">
                    <th className="border border-slate-700 p-0.5">■ সূরা</th>
                    <th className="border border-slate-700 p-0.5">■ আয়াত</th>
                    <th className="border border-slate-700 p-0.5">■ ইসলামী</th>
                    <th className="border border-slate-700 p-0.5">■ অন্যান্য</th>
                    <th className="border border-slate-700 p-0.5">■ জামায়াত</th>
                    <th className="border border-slate-700 p-0.5">■ কাযা</th>
                    <th className="border border-slate-700 p-0.5">■ সদস্য</th>
                    <th className="border border-slate-700 p-0.5">■ সাথী</th>
                    <th className="border border-slate-700 p-0.5">■ কর্মী</th>
                    <th className="border border-slate-700 p-0.5">■ সমর্থক</th>
                    <th className="border border-slate-700 p-0.5">■ বন্ধু</th>
                    <th className="border border-slate-700 p-0.5">■ মেধাবীছাত্র</th>
                    <th className="border border-slate-700 p-0.5">■ শুভাকাঙ্ক্ষী</th>
                    <th className="border border-slate-700 p-0.5">■ মুহাররমা</th>
                    <th className="border border-slate-700 p-0.5">■ সাহিত্য</th>
                    <th className="border border-slate-700 p-0.5">■ ম্যাগাজিন</th>
                    <th className="border border-slate-700 p-0.5">■ স্টিকার</th>
                    <th className="border border-slate-700 p-0.5">■ উপহার</th>
                    <th className="border border-slate-700 p-0.5">দাওয়াতি কাজ</th>
                    <th className="border border-slate-700 p-0.5">অন্যান্য সাংগঠনিক</th>
                  </tr>
                </thead>
                <tbody>
                  {report.dailyEntries.map((row) => (
                    <tr key={row.date} className="hover:bg-blue-50/40">
                      <td className="border border-slate-600 font-bold bg-slate-50 p-0.5">
                        {toBengaliNumber(row.date)}
                      </td>
                      <td className="border border-slate-600 p-0.5 text-left truncate max-w-[40px] px-1">
                        {row.quranSurah || '—'}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.quranAyat)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.hadithCount)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.literatureIslamic)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.literatureOther)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.textbookHours)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {row.classPresent ? '✓' : '—'}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.prayerJamaat)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.prayerQaza)}
                      </td>
                      {/* যোগাযোগ ১ */}
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commMember)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commSathi)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commKormi)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commSupporter)}
                      </td>
                      {/* যোগাযোগ ২ */}
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commFriend)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commMeritStudent)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commWellWisher)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.commMuharrama)}
                      </td>
                      {/* বিতরণ */}
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.distLiterature)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.distMagazine)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.distStickerCard)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.distGift)}
                      </td>
                      {/* সাংগঠনিক কাজ */}
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.orgDawatiHours)}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {toBengaliNumber(row.orgOtherHours)}
                      </td>
                      {/* চেকমার্ক */}
                      <td className="border border-slate-600 p-0.5">
                        {row.newspaperRead ? '✓' : '—'}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {row.kormiChorcha ? '✓' : '—'}
                      </td>
                      <td className="border border-slate-600 p-0.5">
                        {row.selfCritique ? '✓' : '—'}
                      </td>
                    </tr>
                  ))}

                  {/* মোট Row (Sum) */}
                  <tr className="bg-slate-200 font-bold border-t-2 border-slate-800">
                    <td className="border border-slate-800 p-1">মোট</td>
                    <td className="border border-slate-800 p-1">—</td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.quranAyat)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.hadithCount)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.litIslamic)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.litOther)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.textbookHours)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.classPresent)} দিন
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.prayerJamaat)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.prayerQaza)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commMember)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commSathi)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commKormi)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commSupporter)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commFriend)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commMerit)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commWellWisher)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.commMuharrama)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.distLit)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.distMag)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.distSticker)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.distGift)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.orgDawati)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.orgOther)}
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.newspaper)} দিন
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.kormi)} দিন
                    </td>
                    <td className="border border-slate-800 p-1">
                      {toBengaliNumber(totals.selfCritique)} দিন
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 2: মাসিক পরিকল্পনা (Form Replica matching PDF Page 2)      */}
        {/* ============================================================== */}
        {(selectedDoc === 'full' || selectedDoc === 'monthly_plan') && (
          <div
            id="pdf-page-plan"
            ref={page2Ref}
            className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border border-slate-300 print:border-none print:shadow-none print:p-0"
          >
            <div className="text-center mb-3">
              <p className="text-xs font-semibold text-slate-700">বিসমিল্লাহির রাহমানির রাহিম</p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">মাসিক পরিকল্পনা</h1>
              <div className="flex justify-between items-center text-xs font-medium text-slate-800 mt-2 px-2 border-b pb-1 border-slate-400">
                <span>
                  মাস : <b className="font-bold underline ml-1">{plan.month}</b>
                </span>
                {userName && (
                  <span className="hidden sm:inline text-slate-800 font-bold">
                    পরিকল্পনাকারী: {userName}
                  </span>
                )}
                <span>
                  সাল : <b className="font-bold underline ml-1">{plan.year}</b>
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-900">
              {/* Row 1: কুরআন অধ্যয়ন & হাদিস অধ্যয়ন */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-700 p-3 rounded">
                {/* কুরআন অধ্যয়ন */}
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-300 sm:pr-3 pb-2 sm:pb-0">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-400 pb-0.5">
                    কুরআন অধ্যয়ন
                  </h3>
                  <p>
                    ● মোট দিন :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.quranTotalDays)}</b> দিন
                    &nbsp;&nbsp;&nbsp; ● গড় আয়াত :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.quranAvgAyat)}</b> টি
                  </p>
                  <p>
                    ● সূরার নাম : <b className="underline ml-1">{plan.quranSurahName || '—'}</b>
                  </p>
                  <p>
                    ● দারস প্রস্তুত :{' '}
                    <b className="underline ml-1">{plan.quranDarsPrepared || '—'}</b>
                  </p>
                  <p>
                    ● মুখস্থ : আয়াত :{' '}
                    <b className="underline ml-1">
                      {plan.quranMemorizedAyat ? toBengaliNumber(plan.quranMemorizedAyat) : '—'}
                    </b>{' '}
                    ; অর্থসহ সূরা :{' '}
                    <b className="underline ml-1">
                      {plan.quranMemorizedSurahWithMeaning || '—'}
                    </b>
                  </p>
                </div>

                {/* হাদিস অধ্যয়ন */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-400 pb-0.5">
                    হাদিস অধ্যয়ন
                  </h3>
                  <p>
                    ● মোট দিন :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.hadithTotalDays)}</b> দিন
                    &nbsp;&nbsp;&nbsp; ● গড় হাদিস :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.hadithAvgCount)}</b> টি
                  </p>
                  <p>
                    ● গ্রন্থ/বিষয় : <b className="underline ml-1">{plan.hadithBookSubject || '—'}</b>
                  </p>
                  <p>
                    ● দারস প্রস্তুত :{' '}
                    <b className="underline ml-1">{plan.hadithDarsPrepared || '—'}</b>
                  </p>
                  <p>
                    ● মুখস্থ :{' '}
                    <b className="underline ml-1">
                      {plan.hadithMemorizedCount ? toBengaliNumber(plan.hadithMemorizedCount) : '—'}
                    </b>{' '}
                    টি ; বিষয় : <b className="underline ml-1">{plan.hadithMemorizedSubject || '—'}</b>
                  </p>
                </div>
              </div>

              {/* Row 2: সাহিত্য অধ্যয়ন & পাঠ্যপুস্তক অধ্যয়ন */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-700 p-3 rounded">
                {/* সাহিত্য অধ্যয়ন */}
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-300 sm:pr-3 pb-2 sm:pb-0">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-400 pb-0.5">
                    সাহিত্য অধ্যয়ন
                  </h3>
                  <p>
                    ● মোট পৃষ্ঠা :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.literatureTotalPages)}</b>{' '}
                    &nbsp; ইসলামী :{' '}
                    <b className="underline ml-1">
                      {toBengaliNumber(plan.literatureIslamicPages)}
                    </b>{' '}
                    &nbsp; অন্যান্য :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.literatureOtherPages)}</b>
                  </p>
                  <p>
                    ● বইয়ের নাম :{' '}
                    <b className="underline ml-1">{plan.literatureBookName || '—'}</b>
                  </p>
                  <p>
                    ● বই নোট : <b className="underline ml-1">{plan.literatureBookNotes || '—'}</b>{' '}
                    &nbsp;&nbsp; আলোচনা নোট :{' '}
                    <b className="underline ml-1">{plan.literatureDiscussionNotes || '—'}</b>
                  </p>
                </div>

                {/* পাঠ্যপুস্তক অধ্যয়ন */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-400 pb-0.5">
                    পাঠ্যপুস্তক অধ্যয়ন
                  </h3>
                  <p>
                    ● মোট দিন :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.textbookTotalDays)}</b> দিন
                    &nbsp;&nbsp;&nbsp; গড় ঘণ্টা :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.textbookAvgHours)}</b> ঘণ্টা
                  </p>
                  <p>
                    ক্লাসে উপস্থিতি : মোট ক্লাস :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.classTotalClasses)}</b>{' '}
                    &nbsp;&nbsp; উপস্থিতি :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.classAttended)}</b>
                  </p>
                  <div className="pt-1 text-[11px] space-y-0.5">
                    <p className="font-semibold text-slate-800">নামাজ</p>
                    <p>
                      {plan.prayerJamaatPledge ? '☑' : '☐'} প্রতি ওয়াক্ত নামাজ জামায়াতে আদায় করা হবে
                      ইনশাআল্লাহ
                    </p>
                    <p>
                      {plan.prayerNafalPledge ? '☑' : '☐'} কিছু নফল নামাজ/ইবাদত আদায় করা হবে
                      ইনশাআল্লাহ
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: যোগাযোগ & সাংগঠনিক দায়িত্ব পালন */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-700 p-3 rounded">
                {/* যোগাযোগ */}
                <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-slate-300 sm:pr-3 pb-2 sm:pb-0">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-400 pb-0.5">
                    যোগাযোগ
                  </h3>
                  <p>
                    সদস্য : <b className="underline">{toBengaliNumber(plan.commMember)}</b>{' '}
                    &nbsp;&nbsp; সাথী : <b className="underline">{toBengaliNumber(plan.commSathi)}</b>{' '}
                    &nbsp;&nbsp; কর্মী :{' '}
                    <b className="underline">{toBengaliNumber(plan.commKormi)}</b>
                  </p>
                  <p>
                    সমর্থক : <b className="underline">{toBengaliNumber(plan.commSupporter)}</b>{' '}
                    &nbsp;&nbsp; বন্ধু :{' '}
                    <b className="underline">{toBengaliNumber(plan.commFriend)}</b> &nbsp;&nbsp;
                    শুভাকাঙ্ক্ষী :{' '}
                    <b className="underline">{toBengaliNumber(plan.commWellWisher)}</b>
                  </p>
                  <p>
                    স্কুল ছাত্র :{' '}
                    <b className="underline">{toBengaliNumber(plan.commSchoolStudent)}</b>{' '}
                    &nbsp;&nbsp; মেধাবী ছাত্র :{' '}
                    <b className="underline">{toBengaliNumber(plan.commMeritStudent)}</b>{' '}
                    &nbsp;&nbsp; শিক্ষক :{' '}
                    <b className="underline">{toBengaliNumber(plan.commTeacher)}</b>
                  </p>
                  <p>
                    মুহাররমা : <b className="underline">{toBengaliNumber(plan.commMuharrama)}</b>{' '}
                    &nbsp;&nbsp; ভিআইপি :{' '}
                    <b className="underline">{toBengaliNumber(plan.commVIP)}</b>
                  </p>
                </div>

                {/* সাংগঠনিক দায়িত্ব পালন */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-400 pb-0.5">
                    সাংগঠনিক দায়িত্ব পালন
                  </h3>
                  <p>
                    ● মোট দিন :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.orgTotalDays)}</b> দিন
                    &nbsp;&nbsp;&nbsp; গড় ঘণ্টা :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.orgAvgHours)}</b> ঘণ্টা
                  </p>
                  <p>
                    দাওয়াতি কাজ : দিন :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.orgDawatiDays)}</b>{' '}
                    &nbsp;&nbsp; গড় ঘণ্টা :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.orgDawatiAvgHours)}</b>
                  </p>
                  <p>
                    অন্যান্য সাংগঠনিক কাজ : দিন :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.orgOtherDays)}</b>{' '}
                    &nbsp;&nbsp; গড় ঘণ্টা :{' '}
                    <b className="underline ml-1">{toBengaliNumber(plan.orgOtherAvgHours)}</b>
                  </p>
                </div>
              </div>

              {/* Row 4: বিতরণ (টেবিল) */}
              <div className="border border-slate-700 p-2 rounded">
                <h3 className="font-bold text-xs uppercase mb-1">বিতরণ</h3>
                <table className="w-full text-center border-collapse border border-slate-600 text-[10px]">
                  <tbody>
                    <tr className="border-b border-slate-600">
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold w-1/3">
                        ইসলামী সাহিত্য :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.distIslamicLiterature)}</b>
                      </td>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold w-1/3">
                        ছাত্র সংবাদ :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.distChhatroSongbad)}</b>
                      </td>
                      <td className="p-1 bg-slate-50 font-semibold w-1/3">
                        ক্লাস রুটিন :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.distClassRoutine)}</b>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-600">
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold">
                        কিশোর পত্রিকা :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.distKishorePotrika)}</b>
                      </td>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold">
                        ইংরেজি পত্রিকা :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.distEnglishPotrika)}</b>
                      </td>
                      <td className="p-1 bg-slate-50 font-semibold">
                        স্টিকার/কার্ড :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.distStickerCard)}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold">
                        Y.W. : <b className="font-bold">{toBengaliNumber(plan.distYW)}</b>
                      </td>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold">
                        পরিচিতি : <b className="font-bold">{toBengaliNumber(plan.distPorichiti)}</b>
                      </td>
                      <td className="p-1 bg-slate-50 font-semibold">
                        উপহার/মেসেজ :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.distGiftMessage)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Row 5: বৃদ্ধি (টেবিল) */}
              <div className="border border-slate-700 p-2 rounded">
                <h3 className="font-bold text-xs uppercase mb-1">বৃদ্ধি</h3>
                <table className="w-full text-center border-collapse border border-slate-600 text-[10px]">
                  <tbody>
                    <tr className="border-b border-slate-600">
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold w-1/4">
                        সদস্য : <b className="font-bold">{toBengaliNumber(plan.growthMember)}</b>
                      </td>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold w-1/4">
                        কর্মী : <b className="font-bold">{toBengaliNumber(plan.growthKormi)}</b>
                      </td>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold w-1/4">
                        সদস্যপ্রার্থী :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.growthMemberCandidate)}</b>
                      </td>
                      <td className="p-1 bg-slate-50 font-semibold w-1/4">
                        সমর্থক :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.growthSupporter)}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold">
                        সাথী : <b className="font-bold">{toBengaliNumber(plan.growthSathi)}</b>
                      </td>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold">
                        বন্ধু : <b className="font-bold">{toBengaliNumber(plan.growthFriend)}</b>
                      </td>
                      <td className="border-r border-slate-600 p-1 bg-slate-50 font-semibold">
                        সাথীপ্রার্থী :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.growthSathiCandidate)}</b>
                      </td>
                      <td className="p-1 bg-slate-50 font-semibold">
                        শুভাকাঙ্ক্ষী :{' '}
                        <b className="font-bold">{toBengaliNumber(plan.growthWellWisher)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Row 6: বায়তুলমাল */}
              <div className="border border-slate-700 p-2 rounded">
                <h3 className="font-bold text-xs uppercase mb-1">বায়তুলমাল</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <p>
                    পরিশোধের তারিখ :{' '}
                    <b className="underline font-bold">{plan.baitulPaymentDate || '—'}</b>
                  </p>
                  <p>
                    ব্যক্তিগত বৃদ্ধি :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.baitulPersonalGrowthAmount)}
                    </b>{' '}
                    টাকা
                  </p>
                  <p>
                    মোট বৃদ্ধি :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.baitulTotalGrowthAmount)}
                    </b>{' '}
                    টাকা
                  </p>
                  <p>
                    ছাত্রকল্যাণ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.baitulStudentWelfareAmount)}
                    </b>{' '}
                    টাকা
                  </p>
                  <p>
                    টেবিল ব্যাংক :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.baitulTableBankAmount)}
                    </b>{' '}
                    টাকা
                  </p>
                  <p>
                    কলসি/হাঁড়ি :{' '}
                    <b className="underline font-bold">{toBengaliNumber(plan.baitulKolsiCount)}</b>{' '}
                    টি
                  </p>
                </div>
              </div>

              {/* Row 7: বিবিধ */}
              <div className="border border-slate-700 p-3 rounded space-y-1.5 leading-relaxed text-[11px]">
                <h3 className="font-bold text-xs uppercase border-b border-slate-400 pb-0.5">
                  বিবিধ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <p>
                    ● আত্মসমালোচনা :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscSelfCritiqueDays)}
                    </b>{' '}
                    দিন
                  </p>
                  <p>
                    ● শরীরচর্চা :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscExerciseDays)}
                    </b>{' '}
                    দিন
                  </p>
                  <p>
                    ● পত্রিকা পাঠ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscNewspaperDays)}
                    </b>{' '}
                    দিন
                  </p>
                  <p>
                    ● আত্মীয়স্বজন (পুরুষ) যোগাযোগ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscRelativeCommCount)}
                    </b>{' '}
                    জন
                  </p>
                  <p>
                    ● গ্রুপ দাওয়াতি কাজ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscGroupDawatiCount)}
                    </b>{' '}
                    বার
                  </p>
                  <p>
                    ● দাওয়াতি ম্যাসেজ প্রেরণ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscDawatiMessageCount)}
                    </b>{' '}
                    টি
                  </p>
                  <p>
                    ● দাওয়াতি ই-মেইল প্রেরণ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscDawatiEmailCount)}
                    </b>{' '}
                    টি
                  </p>
                  <p>
                    ● অমুসলিম বন্ধু যোগাযোগ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscNonMuslimFriendComm)}
                    </b>{' '}
                    জন
                  </p>
                  <p>
                    ● বন্ধু সংগঠনের সাথে যোগাযোগ :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscFriendOrgComm)}
                    </b>{' '}
                    জন
                  </p>
                  <p>
                    ● দক্ষতা উন্নয়ন কার্যক্রম: কম্পিউটার শিক্ষা :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscComputerSkillDays)}
                    </b>{' '}
                    দিন ; ভাষা শিক্ষা :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscLanguageSkillDays)}
                    </b>{' '}
                    দিন
                  </p>
                  <p className="col-span-1 sm:col-span-2">
                    ● অন্যান্য :{' '}
                    <b className="underline font-bold">{plan.miscSkillOther || '—'}</b>
                  </p>
                  <p className="col-span-1 sm:col-span-2">
                    ● নিজ উদ্যোগে দায়িত্বশীলকে রিপোর্ট দেখানো হয়েছে :{' '}
                    <b className="underline font-bold">
                      {toBengaliNumber(plan.miscReportShownToLeaderTimes)}
                    </b>{' '}
                    বার ; তারিখ :{' '}
                    <b className="underline font-bold">{plan.miscReportShownDate || '—'}</b>
                  </p>
                </div>
              </div>

              {/* Row 8: দায়িত্বশীলের পরামর্শ ও স্বাক্ষর এবং পরিকল্পনা গ্রহণকারীর স্বাক্ষর */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="border border-slate-700 p-3 rounded min-h-[90px] flex flex-col justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    দায়িত্বশীলের পরামর্শ ও স্বাক্ষর :
                  </span>
                  <p className="italic text-slate-700 text-[11px] my-2">
                    {plan.leaderComments || 'পরামর্শ লেখা হয়নি'}
                  </p>
                  <div className="border-t border-dotted border-slate-400 pt-1 text-[10px] text-slate-500 text-right">
                    দায়িত্বশীলের স্বাক্ষর
                  </div>
                </div>

                <div className="border border-slate-700 p-3 rounded min-h-[90px] flex flex-col justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    পরিকল্পনা গ্রহণকারীর স্বাক্ষর ও তারিখ :
                  </span>
                  <div className="my-2">
                    <p className="font-bold text-slate-900">{plan.plannerSignature || userName || '—'}</p>
                    <p className="text-[10px] text-slate-600">তারিখ : {plan.plannerDate || '—'}</p>
                  </div>
                  <div className="border-t border-dotted border-slate-400 pt-1 text-[10px] text-slate-500 text-right">
                    স্বাক্ষর
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ReportShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        report={report}
        userName={userName}
      />
    </div>
  );
};
