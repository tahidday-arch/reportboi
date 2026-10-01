import { ReportRecord } from '../types';
import { defaultInitialReport, defaultMonthlyPlan, createEmptyDailyEntries, sampleUser } from '../data/defaultReport';

const STORAGE_KEY = 'bekti_report_boi_data_v2';
const USER_PROFILE_KEY = 'bekti_report_user_profile_v2';

export type UserProfileData = typeof sampleUser;

export const loadUserProfile = (): UserProfileData => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return sampleUser;
    const parsed = JSON.parse(raw);

    // Clean out demo education items from previous versions
    let cleanEducation = Array.isArray(parsed.education) ? parsed.education : [];
    cleanEducation = cleanEducation.filter((item: any) => {
      if (!item) return false;
      const title = (item.title || '').trim();
      const year = (item.year || '').trim();
      const board = (item.board || '').trim();
      // Filter out demo placeholders with no real user entered data
      if (
        (title === 'এসএসসি / সমমান' ||
          title === 'এইচএসসি / সমমান' ||
          title === 'স্নাতক (বিবি প্রযোজ্য)' ||
          title === 'এসএসসি / সমমান / দাখিল' ||
          title === 'এইচএসসি / সমমান / আলিম' ||
          title === 'স্নাতক / ফাজিল (যদি প্রযোজ্য)') &&
        (!year || year === '২০২৪' || year === '২০২৬' || year === '—') &&
        (!board || board === 'দিনাজপুর' || board === 'বাংলাদেশ' || board === '—')
      ) {
        return false;
      }
      return Boolean(title || year || board);
    });

    // Clean out demo family items from previous versions
    let cleanFamily = Array.isArray(parsed.family) ? parsed.family : [];
    cleanFamily = cleanFamily.filter((item: any) => {
      if (!item) return false;
      const name = (item.name || '').trim();
      return Boolean(name);
    });

    return {
      ...sampleUser,
      ...parsed,
      education: cleanEducation,
      family: cleanFamily,
    };
  } catch (err) {
    console.error('Failed to load user profile:', err);
    return sampleUser;
  }
};

export const saveUserProfile = (profile: UserProfileData): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
};

export const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
] as const;

export type BengaliMonth = typeof BENGALI_MONTHS[number];

export const toEnglishNumber = (str: string | number | undefined | null): string => {
  if (str === undefined || str === null || str === '') return '';
  const banglaDigits: { [key: string]: string } = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return String(str).replace(/[০-৯]/g, (w) => banglaDigits[w] || w);
};

export const toBengaliNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '০';
  const banglaDigits: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return String(num).replace(/[0-9]/g, (w) => banglaDigits[w] || w);
};

// Generates unlimited years list from 2020 to 2060+ and allows any custom year
export const generateYearsRange = (start = 2020, end = 2060): string[] => {
  const years: string[] = [];
  for (let y = start; y <= end; y++) {
    years.push(toBengaliNumber(y));
  }
  return years;
};

export const REPORT_YEARS: string[] = generateYearsRange(2020, 2060);

export type ReportYear = string;

export const getDaysInBengaliMonth = (monthName: string, yearStr: string = '২০২৬'): number => {
  const engYear = parseInt(toEnglishNumber(yearStr), 10) || 2026;
  switch (monthName) {
    case 'ফেব্রুয়ারি': {
      const isLeap = (engYear % 4 === 0 && engYear % 100 !== 0) || (engYear % 400 === 0);
      return isLeap ? 29 : 28;
    }
    case 'এপ্রিল':
    case 'জুন':
    case 'সেপ্টেম্বর':
    case 'নভেম্বর':
      return 30;
    default:
      return 31;
  }
};

export const createBlankReportForMonth = (month: string, year: string): ReportRecord => {
  const numDays = getDaysInBengaliMonth(month, year);
  return {
    id: `rep-${month}-${year}`,
    title: `${month} ${year} - রিপোর্ট বই`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    month,
    year,
    dailyEntries: createEmptyDailyEntries(numDays),
    monthlyPlan: {
      ...defaultMonthlyPlan,
      month,
      year,
    },
  };
};

export const loadReports = (): ReportRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveReports([defaultInitialReport]);
      return [defaultInitialReport];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Check if it contains old demo placeholders
      const hasOldDemo = parsed.some(
        (r: any) =>
          r.monthlyPlan?.plannerSignature === 'তানজুল ইসলাম' ||
          r.dailyEntries?.some((d: any) => d.date === 1 && d.quranSurah === 'আল-বাকারা')
      );
      if (hasOldDemo) {
        saveReports([defaultInitialReport]);
        return [defaultInitialReport];
      }
      return parsed;
    }
    return [defaultInitialReport];
  } catch (err) {
    console.error('Failed to load reports from storage:', err);
    return [defaultInitialReport];
  }
};

export const loadSavedReports = loadReports;

export const saveReports = (reports: ReportRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to storage:', err);
  }
};

export const saveSingleReport = (report: ReportRecord): ReportRecord[] => {
  const existing = loadReports();
  const index = existing.findIndex((r) => r.id === report.id || (r.month === report.month && r.year === report.year));
  const updatedReport: ReportRecord = {
    ...report,
    updatedAt: new Date().toISOString(),
  };

  let newReports: ReportRecord[];
  if (index >= 0) {
    newReports = [...existing];
    newReports[index] = updatedReport;
  } else {
    newReports = [updatedReport, ...existing];
  }
  saveReports(newReports);
  return newReports;
};

export const getOrCreateReport = (
  month: string,
  year: string,
  currentList?: ReportRecord[]
): { report: ReportRecord; allReports: ReportRecord[] } => {
  const list = currentList && currentList.length > 0 ? currentList : loadReports();
  const existing = list.find((r) => r.month === month && r.year === year);
  if (existing) {
    return { report: existing, allReports: list };
  }

  const newReport = createBlankReportForMonth(month, year);
  const updatedList = [newReport, ...list];
  saveReports(updatedList);
  return { report: newReport, allReports: updatedList };
};

