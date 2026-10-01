import { ReportRecord } from '../types';
import { toBengaliNumber } from './storage';

export interface CalculatedReportSummary {
  month: string;
  year: string;
  totalDays: number;
  activeDaysCount: number;
  // Quran
  quranTotalAyat: number;
  quranActiveDays: number;
  quranSurah: string;
  quranDars: string;
  quranMemorized: string;
  // Hadith
  hadithTotalCount: number;
  hadithActiveDays: number;
  hadithDars: string;
  hadithMemorized: string;
  // Literature
  literatureIslamicPages: number;
  literatureOtherPages: number;
  literatureTotalPages: number;
  // Textbook & Class
  textbookTotalHours: number;
  classAttendedDays: number;
  // Prayer
  prayerJamaatTotal: number;
  prayerQazaTotal: number;
  // Dawah & Communication
  commMemberTotal: number;
  commSathiTotal: number;
  commKormiTotal: number;
  commSupporterTotal: number;
  commFriendTotal: number;
  commMeritTotal: number;
  commWellWisherTotal: number;
  commTotalCount: number;
  // Distribution
  distLitTotal: number;
  distMagTotal: number;
  distTotal: number;
  // Org Hours
  orgDawatiHoursTotal: number;
  orgOtherHoursTotal: number;
  orgTotalHours: number;
  // Daily Habits
  newspaperDays: number;
  exerciseDays: number;
  selfCritiqueDays: number;
  // Overall Consistency percentage (0 - 100)
  consistencyScore: number;
}

/**
 * Computes consolidated monthly statistics from daily entries and monthly plan
 */
export function calculateReportSummary(report: ReportRecord): CalculatedReportSummary {
  const daily = report.dailyEntries || [];
  const plan = report.monthlyPlan || {};
  const totalDays = daily.length || 30;

  let quranTotalAyat = 0;
  let quranActiveDays = 0;
  let hadithTotalCount = 0;
  let hadithActiveDays = 0;
  let literatureIslamicPages = 0;
  let literatureOtherPages = 0;
  let textbookTotalHours = 0;
  let classAttendedDays = 0;
  let prayerJamaatTotal = 0;
  let prayerQazaTotal = 0;

  let commMemberTotal = 0;
  let commSathiTotal = 0;
  let commKormiTotal = 0;
  let commSupporterTotal = 0;
  let commFriendTotal = 0;
  let commMeritTotal = 0;
  let commWellWisherTotal = 0;

  let distLitTotal = 0;
  let distMagTotal = 0;
  let distStickerTotal = 0;
  let distGiftTotal = 0;

  let orgDawatiHoursTotal = 0;
  let orgOtherHoursTotal = 0;

  let newspaperDays = 0;
  let exerciseDays = 0;
  let selfCritiqueDays = 0;
  let activeDaysCount = 0;

  daily.forEach((day) => {
    const qAyat = Number(day.quranAyat) || 0;
    const hCount = Number(day.hadithCount) || 0;
    const litIsl = Number(day.literatureIslamic) || 0;
    const litOth = Number(day.literatureOther) || 0;
    const tbHours = Number(day.textbookHours) || 0;
    const pJam = Number(day.prayerJamaat) || 0;
    const pQaz = Number(day.prayerQaza) || 0;

    if (qAyat > 0) {
      quranTotalAyat += qAyat;
      quranActiveDays++;
    }
    if (hCount > 0) {
      hadithTotalCount += hCount;
      hadithActiveDays++;
    }
    literatureIslamicPages += litIsl;
    literatureOtherPages += litOth;
    textbookTotalHours += tbHours;
    if (day.classPresent) classAttendedDays++;

    prayerJamaatTotal += pJam;
    prayerQazaTotal += pQaz;

    commMemberTotal += Number(day.commMember) || 0;
    commSathiTotal += Number(day.commSathi) || 0;
    commKormiTotal += Number(day.commKormi) || 0;
    commSupporterTotal += Number(day.commSupporter) || 0;
    commFriendTotal += Number(day.commFriend) || 0;
    commMeritTotal += Number(day.commMeritStudent) || 0;
    commWellWisherTotal += Number(day.commWellWisher) || 0;

    distLitTotal += Number(day.distLiterature) || 0;
    distMagTotal += Number(day.distMagazine) || 0;
    distStickerTotal += Number(day.distStickerCard) || 0;
    distGiftTotal += Number(day.distGift) || 0;

    orgDawatiHoursTotal += Number(day.orgDawatiHours) || 0;
    orgOtherHoursTotal += Number(day.orgOtherHours) || 0;

    if (day.newspaperRead) newspaperDays++;
    if (day.kormiChorcha) exerciseDays++;
    if (day.selfCritique) selfCritiqueDays++;

    // Did user perform any constructive activity this day?
    if (qAyat > 0 || hCount > 0 || pJam > 0 || litIsl > 0 || tbHours > 0 || day.selfCritique) {
      activeDaysCount++;
    }
  });

  const commTotalCount =
    commMemberTotal +
    commSathiTotal +
    commKormiTotal +
    commSupporterTotal +
    commFriendTotal +
    commMeritTotal +
    commWellWisherTotal;

  const distTotal = distLitTotal + distMagTotal + distStickerTotal + distGiftTotal;
  const orgTotalHours = orgDawatiHoursTotal + orgOtherHoursTotal;
  const literatureTotalPages = literatureIslamicPages + literatureOtherPages;

  // Calculate consistency score out of 100
  let consistencyScore = 0;
  if (totalDays > 0) {
    const rawRatio = activeDaysCount / totalDays;
    const prayerConsistency = Math.min(1, prayerJamaatTotal / (totalDays * 4));
    const quranConsistency = Math.min(1, quranActiveDays / totalDays);
    consistencyScore = Math.round((rawRatio * 0.4 + prayerConsistency * 0.35 + quranConsistency * 0.25) * 100);
  }

  return {
    month: report.month,
    year: report.year,
    totalDays,
    activeDaysCount,
    quranTotalAyat,
    quranActiveDays,
    quranSurah: plan.quranSurahName || '',
    quranDars: plan.quranDarsPrepared || '',
    quranMemorized: plan.quranMemorizedAyat || '',
    hadithTotalCount,
    hadithActiveDays,
    hadithDars: plan.hadithDarsPrepared || '',
    hadithMemorized: plan.hadithMemorizedCount || '',
    literatureIslamicPages,
    literatureOtherPages,
    literatureTotalPages,
    textbookTotalHours,
    classAttendedDays,
    prayerJamaatTotal,
    prayerQazaTotal,
    commMemberTotal,
    commSathiTotal,
    commKormiTotal,
    commSupporterTotal,
    commFriendTotal,
    commMeritTotal,
    commWellWisherTotal,
    commTotalCount,
    distLitTotal,
    distMagTotal,
    distTotal,
    orgDawatiHoursTotal,
    orgOtherHoursTotal,
    orgTotalHours,
    newspaperDays,
    exerciseDays,
    selfCritiqueDays,
    consistencyScore,
  };
}

/**
 * Formats rich Bengali text summary optimized for WhatsApp and social media sharing
 */
export function generateWhatsAppReportSummary(
  report: ReportRecord,
  userName?: string
): string {
  const s = calculateReportSummary(report);
  const nameStr = userName?.trim() ? `👤 নাম: ${userName}` : '';

  const lines: string[] = [
    `📊 *ব্যক্তিগত রিপোর্ট বই — মাসিক সারাংশ*`,
    `🗓️ *মাস:* ${s.month} ${s.year}`,
  ];

  if (nameStr) {
    lines.push(nameStr);
  }

  lines.push(`🏛️ *বাংলাদেশ ইসলামী ছাত্রশিবির*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

  // 1. Quran
  lines.push(`📖 *১. আল-কুরআন অধ্যয়ন:*`);
  lines.push(`  • তিলাওয়াতকৃত আয়াত: ${toBengaliNumber(s.quranTotalAyat)}টি (${toBengaliNumber(s.quranActiveDays)} দিন)`);
  if (s.quranSurah) lines.push(`  • পঠিত সূরা: ${s.quranSurah}`);
  if (s.quranMemorized) lines.push(`  • মুখস্থ আয়াত: ${s.quranMemorized}`);
  if (s.quranDars) lines.push(`  • প্রস্তুতকৃত দরস: ${s.quranDars}`);

  // 2. Hadith
  lines.push(`📚 *২. হাদিস অধ্যয়ন:*`);
  lines.push(`  • পঠিত হাদিস: ${toBengaliNumber(s.hadithTotalCount)}টি (${toBengaliNumber(s.hadithActiveDays)} দিন)`);
  if (s.hadithMemorized) lines.push(`  • মুখস্থ হাদিস: ${s.hadithMemorized}`);
  if (s.hadithDars) lines.push(`  • হাদিস দরস: ${s.hadithDars}`);

  // 3. Literature
  lines.push(`📘 *৩. সাহিত্য অধ্যয়ন:*`);
  lines.push(`  • ইসলামী সাহিত্য: ${toBengaliNumber(s.literatureIslamicPages)} পৃষ্ঠা`);
  if (s.literatureOtherPages > 0) {
    lines.push(`  • অন্যান্য সাহিত্য: ${toBengaliNumber(s.literatureOtherPages)} পৃষ্ঠা`);
  }

  // 4. Prayer
  lines.push(`🕌 *৪. সালাত (নামাজ):*`);
  lines.push(`  • জামায়াতে সালাত: ${toBengaliNumber(s.prayerJamaatTotal)} ওয়াক্ত`);
  if (s.prayerQazaTotal > 0) {
    lines.push(`  • কাজা সালাত: ${toBengaliNumber(s.prayerQazaTotal)} ওয়াক্ত`);
  }

  // 5. Dawah & Organization
  lines.push(`🤝 *৫. দাওয়াতি যোগাযোগ ও বিতরণ:*`);
  lines.push(`  • মোট যোগাযোগ: ${toBengaliNumber(s.commTotalCount)} জন`);
  if (s.distTotal > 0) {
    lines.push(`  • সাহিত্য ও সামগ্রী বিতরণ: ${toBengaliNumber(s.distTotal)}টি`);
  }
  if (s.orgTotalHours > 0) {
    lines.push(`  • সাংগঠনিক সময় প্রদান: ${toBengaliNumber(s.orgTotalHours)} ঘণ্টা`);
  }

  // 6. Studies & Habits
  lines.push(`⏱️ *৬. পড়াশোনা ও আত্মগঠন:*`);
  lines.push(`  • পাঠ্যবই অধ্যয়ন: ${toBengaliNumber(s.textbookTotalHours)} ঘণ্টা`);
  if (s.classAttendedDays > 0) {
    lines.push(`  • ক্লাসে উপস্থিতি: ${toBengaliNumber(s.classAttendedDays)} দিন`);
  }
  lines.push(`  • আত্ম-সমালোচনা: ${toBengaliNumber(s.selfCritiqueDays)} দিন`);
  if (s.exerciseDays > 0) {
    lines.push(`  • শরীরচর্চা: ${toBengaliNumber(s.exerciseDays)} দিন`);
  }
  if (s.newspaperDays > 0) {
    lines.push(`  • পত্রিকা পাঠ: ${toBengaliNumber(s.newspaperDays)} দিন`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🎯 *মাসিক ধারাবাহিকতা:* ${toBengaliNumber(s.consistencyScore)}% (${toBengaliNumber(s.activeDaysCount)}/${toBengaliNumber(s.totalDays)} দিন সক্রিয়)`);
  lines.push(``);
  lines.push(`✨ _"হে আমাদের পালনকর্তা! আমাদের সৎকর্মে অবিচল রাখুন এবং দ্বীনের পথে কবুল করুন।"_`);
  lines.push(`📱 *ডিজিটাল ব্যক্তিগত রিপোর্ট বই অ্যাপ*`);

  return lines.join('\n');
}
