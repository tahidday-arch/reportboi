import { ReportRecord } from '../types';
import { calculateReportSummary } from './reportSummary';
import { toBengaliNumber } from './storage';

export type ReportCardTheme = 'navy' | 'emerald';

/**
 * Draws rounded rectangle helper on 2D context
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Renders high-resolution infographic summary poster of the monthly report to a canvas
 */
export function renderReportToCanvas(
  canvas: HTMLCanvasElement,
  report: ReportRecord,
  userName?: string,
  theme: ReportCardTheme = 'navy'
): void {
  const summary = calculateReportSummary(report);
  const width = 1080;
  const height = 1440;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Theme Color Palette
  const isNavy = theme === 'navy';
  const bgGradStart = isNavy ? '#081730' : '#042318';
  const bgGradEnd = isNavy ? '#0f2b5c' : '#0a3d2c';
  const cardBg = isNavy ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.09)';
  const cardBorder = isNavy ? 'rgba(56, 189, 248, 0.25)' : 'rgba(52, 211, 153, 0.3)';
  const primaryAccent = isNavy ? '#38bdf8' : '#34d399';
  const secondaryAccent = '#fbbf24'; // Gold
  const textWhite = '#ffffff';
  const textMuted = isNavy ? '#cbd5e1' : '#d1fae5';

  // 2. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, bgGradStart);
  bgGrad.addColorStop(0.5, bgGradEnd);
  bgGrad.addColorStop(1, isNavy ? '#050f21' : '#03170f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Subtle background geometric accents
  ctx.save();
  ctx.strokeStyle = isNavy ? 'rgba(56, 189, 248, 0.06)' : 'rgba(52, 211, 153, 0.06)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(width / 2, 200, 250 + i * 90, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Header Section
  // Bismillah
  ctx.textAlign = 'center';
  ctx.fillStyle = secondaryAccent;
  ctx.font = 'bold 24px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 70);

  // Organization Name Badge
  roundRect(ctx, width / 2 - 190, 95, 380, 42, 21);
  ctx.fillStyle = isNavy ? 'rgba(15, 43, 92, 0.8)' : 'rgba(6, 40, 30, 0.8)';
  ctx.fill();
  ctx.strokeStyle = primaryAccent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = textWhite;
  ctx.font = 'bold 20px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText('বাংলাদেশ ইসলামী ছাত্রশিবির', width / 2, 123);

  // Main Title
  ctx.fillStyle = textWhite;
  ctx.font = 'bold 42px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText('ব্যক্তিগত রিপোর্ট সারাংশ', width / 2, 195);

  // Month & Year Tag + User Name
  const monthYearText = `${summary.month} ${summary.year}`;
  ctx.font = 'bold 22px "Noto Sans Bengali", "SolaimanLipi", sans-serif';

  roundRect(ctx, width / 2 - 140, 220, 280, 46, 23);
  ctx.fillStyle = primaryAccent;
  ctx.fill();

  ctx.fillStyle = '#061727';
  ctx.fillText(monthYearText, width / 2, 251);

  if (userName?.trim()) {
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 20px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
    ctx.fillText(`দায়িত্বশীল / কর্মী: ${userName.trim()}`, width / 2, 298);
  }

  // Divider Line
  ctx.strokeStyle = isNavy ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 325);
  ctx.lineTo(width - 80, 325);
  ctx.stroke();

  // 5. Stat Cards Grid (2 columns x 3 rows)
  const gridStartX = 70;
  const gridStartY = 350;
  const cardW = 450;
  const cardH = 220;
  const gapX = 40;
  const gapY = 24;

  const cardsData = [
    {
      col: 0,
      row: 0,
      icon: '📖',
      title: 'আল-কুরআন অধ্যয়ন',
      accent: '#38bdf8',
      stats: [
        { label: 'মোট তিলাওয়াতকৃত আয়াত', value: `${toBengaliNumber(summary.quranTotalAyat)} টি` },
        { label: 'সক্রিয় অধ্যয়ন দিন', value: `${toBengaliNumber(summary.quranActiveDays)} দিন` },
        { label: 'মুখস্থ আয়াত / সূরা', value: summary.quranMemorized || '—' },
      ],
    },
    {
      col: 1,
      row: 0,
      icon: '📚',
      title: 'হাদিস অধ্যয়ন',
      accent: '#a7f3d0',
      stats: [
        { label: 'মোট পঠিত হাদিস', value: `${toBengaliNumber(summary.hadithTotalCount)} টি` },
        { label: 'সক্রিয় অধ্যয়ন দিন', value: `${toBengaliNumber(summary.hadithActiveDays)} দিন` },
        { label: 'মুখস্থ হাদিস সংখ্যা', value: summary.hadithMemorized || '—' },
      ],
    },
    {
      col: 0,
      row: 1,
      icon: '📘',
      title: 'সাহিত্য ও জ্ঞানচর্চা',
      accent: '#fbbf24',
      stats: [
        { label: 'ইসলামী সাহিত্য', value: `${toBengaliNumber(summary.literatureIslamicPages)} পৃষ্ঠা` },
        { label: 'পাঠ্যবই অধ্যয়ন', value: `${toBengaliNumber(summary.textbookTotalHours)} ঘণ্টা` },
        { label: 'ক্লাসে উপস্থিতি', value: `${toBengaliNumber(summary.classAttendedDays)} দিন` },
      ],
    },
    {
      col: 1,
      row: 1,
      icon: '🕌',
      title: 'সালাত (নামাজ)',
      accent: '#34d399',
      stats: [
        { label: 'জামায়াতে সালাত আদায়', value: `${toBengaliNumber(summary.prayerJamaatTotal)} ওয়াক্ত` },
        { label: 'কাজা নামাজ', value: summary.prayerQazaTotal > 0 ? `${toBengaliNumber(summary.prayerQazaTotal)} ওয়াক্ত` : 'নেই (আলহামদুলিল্লাহ)' },
        { label: 'তাহাজ্জুদ / নফল পালন', value: 'নিয়মিত' },
      ],
    },
    {
      col: 0,
      row: 2,
      icon: '🤝',
      title: 'দাওয়াতি যোগাযোগ',
      accent: '#c084fc',
      stats: [
        { label: 'মোট দাওয়াতি যোগাযোগ', value: `${toBengaliNumber(summary.commTotalCount)} জন` },
        { label: 'সাহিত্য ও সামগ্রী বিতরণ', value: `${toBengaliNumber(summary.distTotal)} টি` },
        { label: 'সাংগঠনিক সময় প্রদান', value: `${toBengaliNumber(summary.orgTotalHours)} ঘণ্টা` },
      ],
    },
    {
      col: 1,
      row: 2,
      icon: '🌱',
      title: 'দৈনন্দিন আমল ও চরিত্র',
      accent: '#f472b6',
      stats: [
        { label: 'আত্ম-সমালোচনা (মুহাসাবা)', value: `${toBengaliNumber(summary.selfCritiqueDays)} দিন` },
        { label: 'শারীরিক শরীরচর্চা', value: `${toBengaliNumber(summary.exerciseDays)} দিন` },
        { label: 'দৈনিক পত্রিকা পাঠ', value: `${toBengaliNumber(summary.newspaperDays)} দিন` },
      ],
    },
  ];

  cardsData.forEach((card) => {
    const cx = gridStartX + card.col * (cardW + gapX);
    const cy = gridStartY + card.row * (cardH + gapY);

    // Card background
    ctx.save();
    roundRect(ctx, cx, cy, cardW, cardH, 20);
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Card Header Bar
    ctx.textAlign = 'left';
    ctx.fillStyle = card.accent;
    ctx.font = '24px sans-serif';
    ctx.fillText(card.icon, cx + 18, cy + 38);

    ctx.fillStyle = textWhite;
    ctx.font = 'bold 21px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
    ctx.fillText(card.title, cx + 56, cy + 38);

    // Header subtle underline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 54);
    ctx.lineTo(cx + cardW - 18, cy + 54);
    ctx.stroke();

    // Stats lines inside card
    let statY = cy + 90;
    card.stats.forEach((st) => {
      // Label
      ctx.textAlign = 'left';
      ctx.fillStyle = textMuted;
      ctx.font = '16px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
      ctx.fillText(st.label, cx + 20, statY);

      // Value
      ctx.textAlign = 'right';
      ctx.fillStyle = textWhite;
      ctx.font = 'bold 18px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
      ctx.fillText(st.value, cx + cardW - 20, statY);

      statY += 44;
    });

    ctx.restore();
  });

  // 6. Overall Performance & Consistency Strip
  const barY = 1110;
  const barW = width - 140;
  const barH = 120;
  roundRect(ctx, 70, barY, barW, barH, 24);
  ctx.fillStyle = isNavy ? 'rgba(30, 58, 138, 0.5)' : 'rgba(6, 78, 59, 0.5)';
  ctx.fill();
  ctx.strokeStyle = primaryAccent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Progress Title & percentage
  ctx.textAlign = 'left';
  ctx.fillStyle = textWhite;
  ctx.font = 'bold 22px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText('🎯 মাসিক ধারাবাহিকতা ও নিয়মিত আমল:', 98, barY + 45);

  ctx.textAlign = 'right';
  ctx.fillStyle = secondaryAccent;
  ctx.font = 'bold 30px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText(`${toBengaliNumber(summary.consistencyScore)}%`, width - 98, barY + 46);

  // Visual Progress Track
  const trackX = 98;
  const trackY = barY + 68;
  const trackW = barW - 56;
  const trackH = 14;

  roundRect(ctx, trackX, trackY, trackW, trackH, 7);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();

  // Filled Progress
  const fillW = Math.max(16, (trackW * Math.min(100, summary.consistencyScore)) / 100);
  roundRect(ctx, trackX, trackY, fillW, trackH, 7);
  const progGrad = ctx.createLinearGradient(trackX, 0, trackX + fillW, 0);
  progGrad.addColorStop(0, primaryAccent);
  progGrad.addColorStop(1, secondaryAccent);
  ctx.fillStyle = progGrad;
  ctx.fill();

  // Active days label
  ctx.textAlign = 'left';
  ctx.fillStyle = textMuted;
  ctx.font = '14px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText(`মোট দিন: ${toBengaliNumber(summary.totalDays)} | সক্রিয় অধ্যয়ন ও আমল: ${toBengaliNumber(summary.activeDaysCount)} দিন`, 98, barY + 104);

  // 7. Footer
  const footerY = 1290;
  ctx.textAlign = 'center';
  ctx.fillStyle = secondaryAccent;
  ctx.font = 'italic 18px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText('“তোমরা সৎকর্ম ও আল্লাহভীতিতে একে অন্যের সাহায্য করো।” — সূরা আল-মায়িদাহ: ২', width / 2, footerY);

  ctx.fillStyle = isNavy ? '#94a3b8' : '#a7f3d0';
  ctx.font = 'bold 16px "Noto Sans Bengali", "SolaimanLipi", sans-serif';
  ctx.fillText('বাংলাদেশ ইসলামী ছাত্রশিবির • ডিজিটাল ব্যক্তিগত রিপোর্ট বই', width / 2, footerY + 40);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px "Noto Sans Bengali", sans-serif';
  ctx.fillText('স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত • কপিরাইট সংরক্ষিত', width / 2, footerY + 66);
}

/**
 * Converts canvas to PNG blob
 */
export function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Triggers direct download of the generated report image
 */
export function downloadReportImage(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
