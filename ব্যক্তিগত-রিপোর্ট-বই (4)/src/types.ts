export interface DailyReportEntry {
  date: number; // 1 to 31
  // কুরআন অধ্যয়ন
  quranSurah: string;
  quranAyat: number | string;
  // হাদিস অধ্যয়ন
  hadithCount: number | string;
  // সাহিত্য অধ্যয়ন
  literatureIslamic: number | string;
  literatureOther: number | string;
  // পাঠ্যপুস্তক অধ্যয়ন
  textbookHours: number | string;
  // ক্লাস
  classPresent: boolean;
  // নামাজ
  prayerJamaat: number | string; // জামায়াত
  prayerQaza: number | string; // কাযা
  // যোগাযোগ (সাংগঠনিক/দাওয়াতি)
  commMember: number | string; // সদস্য
  commSathi: number | string; // সাথী
  commKormi: number | string; // কর্মী
  commSupporter: number | string; // সমর্থক
  // যোগাযোগ (সাধারণ)
  commFriend: number | string; // বন্ধু
  commMeritStudent: number | string; // মেধাবীছাত্র
  commWellWisher: number | string; // শুভাকাঙ্ক্ষী
  commMuharrama: number | string; // মুহাররমা
  // বিতরণ
  distLiterature: number | string; // সাহিত্য
  distMagazine: number | string; // ম্যাগাজিন
  distStickerCard: number | string; // স্টিকার/কার্ড
  distGift: number | string; // উপহার
  // সাংগঠনিক দায়িত্ব পালন (ঘণ্টা)
  orgDawatiHours: number | string; // দাওয়াতি কাজ
  orgOtherHours: number | string; // অন্যান্য সাংগঠনিক কাজ
  // চেকমার্কসমূহ
  newspaperRead: boolean; // পত্রিকা পাঠ
  kormiChorcha: boolean; // শরীল চর্চা
  selfCritique: boolean; // আত্ম-সমালোচনা
}

export interface MonthlyPlanData {
  month: string;
  year: string;
  // ১. কুরআন অধ্যয়ন
  quranTotalDays: number | string;
  quranAvgAyat: number | string;
  quranSurahName: string;
  quranDarsPrepared: string;
  quranMemorizedAyat: string;
  quranMemorizedSurahWithMeaning: string;

  // ২. হাদিস অধ্যয়ন
  hadithTotalDays: number | string;
  hadithAvgCount: number | string;
  hadithBookSubject: string;
  hadithDarsPrepared: string;
  hadithMemorizedCount: string;
  hadithMemorizedSubject: string;

  // ৩. সাহিত্য অধ্যয়ন
  literatureTotalPages: number | string;
  literatureIslamicPages: number | string;
  literatureOtherPages: number | string;
  literatureBookName: string;
  literatureBookNotes: string;
  literatureDiscussionNotes: string;

  // ৪. পাঠ্যপুস্তক অধ্যয়ন
  textbookTotalDays: number | string;
  textbookAvgHours: number | string;
  classTotalClasses: number | string;
  classAttended: number | string;

  // ৫. নামাজ
  prayerJamaatPledge: boolean;
  prayerNafalPledge: boolean;

  // ৬. যোগাযোগ
  commMember: number | string;
  commSathi: number | string;
  commKormi: number | string;
  commSupporter: number | string;
  commFriend: number | string;
  commWellWisher: number | string;
  commSchoolStudent: number | string;
  commMeritStudent: number | string;
  commTeacher: number | string;
  commMuharrama: number | string;
  commVIP: number | string;

  // ৭. সাংগঠনিক দায়িত্ব পালন
  orgTotalDays: number | string;
  orgAvgHours: number | string;
  orgDawatiDays: number | string;
  orgDawatiAvgHours: number | string;
  orgOtherDays: number | string;
  orgOtherAvgHours: number | string;

  // ৮. বিতরণ (টেবিল)
  distIslamicLiterature: number | string;
  distChhatroSongbad: number | string;
  distClassRoutine: number | string;
  distKishorePotrika: number | string;
  distEnglishPotrika: number | string;
  distStickerCard: number | string;
  distYW: number | string;
  distPorichiti: number | string;
  distGiftMessage: number | string;

  // ৯. বৃদ্ধি (টেবিল)
  growthMember: number | string;
  growthKormi: number | string;
  growthMemberCandidate: number | string;
  growthSupporter: number | string;
  growthSathi: number | string;
  growthFriend: number | string;
  growthSathiCandidate: number | string;
  growthWellWisher: number | string;

  // ১০. বায়তুলমাল
  baitulPaymentDate: string;
  baitulPersonalGrowthAmount: number | string;
  baitulTotalGrowthAmount: number | string;
  baitulStudentWelfareAmount: number | string;
  baitulTableBankAmount: number | string;
  baitulKolsiCount: number | string;

  // ১১. বিবিধ
  miscSelfCritiqueDays: number | string;
  miscExerciseDays: number | string;
  miscNewspaperDays: number | string;
  miscRelativeCommCount: number | string;
  miscGroupDawatiCount: number | string;
  miscDawatiMessageCount: number | string;
  miscDawatiEmailCount: number | string;
  miscNonMuslimFriendComm: number | string;
  miscFriendOrgComm: number | string;
  miscComputerSkillDays: number | string;
  miscLanguageSkillDays: number | string;
  miscSkillOther: string;
  miscReportShownToLeaderTimes: number | string;
  miscReportShownDate: string;

  // ১২. স্বাক্ষর ও মন্তব্য
  leaderComments: string;
  plannerSignature: string;
  plannerDate: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  month: string;
  year: string;
  dailyEntries: DailyReportEntry[];
  monthlyPlan: MonthlyPlanData;
}

export type ActiveScreen = 
  | 'home'
  | 'report'
  | 'notes'
  | 'profile'
  | 'settings'
  | 'category_detail'
  | 'about_shibir';

export type CategoryId = 
  | 'personal_info'
  | 'edu_info'
  | 'health_info'
  | 'family_info'
  | 'job_info'
  | 'extra_info'
  | 'view_reports'
  | 'settings'
  | 'about_shibir';
