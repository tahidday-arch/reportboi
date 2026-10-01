import { DailyReportEntry, MonthlyPlanData, ReportRecord } from '../types';

export const createEmptyDailyEntries = (numDays: number = 31): DailyReportEntry[] => {
  return Array.from({ length: numDays }, (_, index) => {
    const day = index + 1;
    return {
      date: day,
      quranSurah: '',
      quranAyat: '',
      hadithCount: '',
      literatureIslamic: '',
      literatureOther: '',
      textbookHours: '',
      classPresent: false,
      prayerJamaat: '',
      prayerQaza: '',
      commMember: '',
      commSathi: '',
      commKormi: '',
      commSupporter: '',
      commFriend: '',
      commMeritStudent: '',
      commWellWisher: '',
      commMuharrama: '',
      distLiterature: '',
      distMagazine: '',
      distStickerCard: '',
      distGift: '',
      orgDawatiHours: '',
      orgOtherHours: '',
      newspaperRead: false,
      kormiChorcha: false,
      selfCritique: false,
    };
  });
};

export const defaultMonthlyPlan: MonthlyPlanData = {
  month: 'অক্টোবর',
  year: '২০২৬',
  // ১. কুরআন অধ্যয়ন
  quranTotalDays: '',
  quranAvgAyat: '',
  quranSurahName: '',
  quranDarsPrepared: '',
  quranMemorizedAyat: '',
  quranMemorizedSurahWithMeaning: '',

  // ২. হাদিস অধ্যয়ন
  hadithTotalDays: '',
  hadithAvgCount: '',
  hadithBookSubject: '',
  hadithDarsPrepared: '',
  hadithMemorizedCount: '',
  hadithMemorizedSubject: '',

  // ৩. সাহিত্য অধ্যয়ন
  literatureTotalPages: '',
  literatureIslamicPages: '',
  literatureOtherPages: '',
  literatureBookName: '',
  literatureBookNotes: '',
  literatureDiscussionNotes: '',

  // ৪. পাঠ্যপুস্তক অধ্যয়ন
  textbookTotalDays: '',
  textbookAvgHours: '',
  classTotalClasses: '',
  classAttended: '',

  // ৫. নামাজ
  prayerJamaatPledge: false,
  prayerNafalPledge: false,

  // ৬. যোগাযোগ
  commMember: '',
  commSathi: '',
  commKormi: '',
  commSupporter: '',
  commFriend: '',
  commWellWisher: '',
  commSchoolStudent: '',
  commMeritStudent: '',
  commTeacher: '',
  commMuharrama: '',
  commVIP: '',

  // ৭. সাংগঠনিক দায়িত্ব পালন
  orgTotalDays: '',
  orgAvgHours: '',
  orgDawatiDays: '',
  orgDawatiAvgHours: '',
  orgOtherDays: '',
  orgOtherAvgHours: '',

  // ৮. বিতরণ (টেবিল)
  distIslamicLiterature: '',
  distChhatroSongbad: '',
  distClassRoutine: '',
  distKishorePotrika: '',
  distEnglishPotrika: '',
  distStickerCard: '',
  distYW: '',
  distPorichiti: '',
  distGiftMessage: '',

  // ৯. বৃদ্ধি (টেবিল)
  growthMember: '',
  growthKormi: '',
  growthMemberCandidate: '',
  growthSupporter: '',
  growthSathi: '',
  growthFriend: '',
  growthSathiCandidate: '',
  growthWellWisher: '',

  // ১০. বায়তুলমাল
  baitulPaymentDate: '',
  baitulPersonalGrowthAmount: '',
  baitulTotalGrowthAmount: '',
  baitulStudentWelfareAmount: '',
  baitulTableBankAmount: '',
  baitulKolsiCount: '',

  // ১১. বিবিধ
  miscSelfCritiqueDays: '',
  miscExerciseDays: '',
  miscNewspaperDays: '',
  miscRelativeCommCount: '',
  miscGroupDawatiCount: '',
  miscDawatiMessageCount: '',
  miscDawatiEmailCount: '',
  miscNonMuslimFriendComm: '',
  miscFriendOrgComm: '',
  miscComputerSkillDays: '',
  miscLanguageSkillDays: '',
  miscSkillOther: '',
  miscReportShownToLeaderTimes: '',
  miscReportShownDate: '',

  // ১২. স্বাক্ষর ও মন্তব্য
  leaderComments: '',
  plannerSignature: '',
  plannerDate: '',
};

export const defaultInitialReport: ReportRecord = {
  id: 'rep-oct-2026',
  title: 'অক্টোবর ২০২৬ - রিপোর্ট বই',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  month: 'অক্টোবর',
  year: '২০২৬',
  dailyEntries: createEmptyDailyEntries(),
  monthlyPlan: defaultMonthlyPlan,
};

export const sampleUser = {
  name: '',
  subtitle: '',
  avatar: '',
  father: '',
  mother: '',
  birthDate: '',
  nid: '',
  religion: 'ইসলাম',
  nationality: 'বাংলাদেশী',
  phone: '',
  address: '',
  bloodGroup: '',
  height: '',
  weight: '',
  eyeProblem: '',
  otherHealth: '',
  education: [] as { title: string; year: string; board: string }[],
  family: [] as { relation: string; name: string }[],
  profession: {
    name: '',
    institute: '',
    duration: '',
    certified: '',
  },
  skills: '',
  languages: '',
};
