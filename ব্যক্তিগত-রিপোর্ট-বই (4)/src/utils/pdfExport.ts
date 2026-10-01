import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportRecord } from '../types';

export type ExportDocChoice = 'full' | 'monthly_report' | 'monthly_plan';

/**
 * Triggers browser download of a DataURL or Blob URL
 */
export function triggerDownloadUrl(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

/**
 * Captures an HTML element as a high-resolution Canvas using html2canvas
 * Formats the cloned DOM to desktop print width (1100px) so even on mobile phones
 * the table and columns don't get truncated by screen width or overflow!
 */
export async function captureElementToCanvas(
  element: HTMLElement,
  options?: { scale?: number }
): Promise<HTMLCanvasElement> {
  const scale = options?.scale || 2;
  
  return await html2canvas(element, {
    scale: scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1150,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(element.id);
      if (clonedEl) {
        clonedEl.style.width = '1150px';
        clonedEl.style.maxWidth = '1150px';
        clonedEl.style.overflow = 'visible';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.padding = '24px';
        
        // Remove overflow restrictions from any nested containers
        const overflowDivs = clonedEl.querySelectorAll('.overflow-x-auto');
        overflowDivs.forEach((div) => {
          (div as HTMLElement).style.overflow = 'visible';
          (div as HTMLElement).style.width = '100%';
        });

        // Ensure tables expand to full readable width
        const tables = clonedEl.querySelectorAll('table');
        tables.forEach((t) => {
          (t as HTMLElement).style.width = '100%';
          (t as HTMLElement).style.minWidth = '1050px';
        });
      }
    },
  });
}

/**
 * Downloads a captured canvas as an ultra-clear PNG image directly to device Gallery / Downloads
 */
export function saveCanvasToGalleryImage(
  canvas: HTMLCanvasElement,
  filename: string
): void {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  triggerDownloadUrl(dataUrl, filename);
}

/**
 * Creates and downloads a high-quality A4 PDF from a single HTML element
 */
export async function exportSinglePageToPDF(
  element: HTMLElement,
  filename: string,
  orientation: 'portrait' | 'landscape' = 'landscape'
): Promise<void> {
  const canvas = await captureElementToCanvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/jpeg', 0.96);

  const isLandscape = orientation === 'landscape';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Margins
  const margin = 5;
  const renderWidth = pageWidth - (margin * 2);
  const renderHeight = (canvas.height * renderWidth) / canvas.width;

  if (renderHeight <= pageHeight - (margin * 2)) {
    // Fits cleanly on one page
    pdf.addImage(imgData, 'JPEG', margin, margin, renderWidth, renderHeight, undefined, 'FAST');
  } else {
    // If it slightly exceeds, shrink to fit single page if within 15%, else multi-page
    if (renderHeight <= (pageHeight - (margin * 2)) * 1.2) {
      const fitHeight = pageHeight - (margin * 2);
      const fitWidth = (canvas.width * fitHeight) / canvas.height;
      const xOffset = margin + (renderWidth - fitWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, margin, fitWidth, fitHeight, undefined, 'FAST');
    } else {
      let heightLeft = renderHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, renderWidth, renderHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - renderHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, renderWidth, renderHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }
  }

  pdf.save(filename);
}

/**
 * Creates and downloads a multi-page A4 PDF combining Page 1 (Monthly Report - Landscape/Portrait) and Page 2 (Plan - Portrait)
 */
export async function exportFullBookToPDF(
  page1Element: HTMLElement,
  page2Element: HTMLElement,
  filename: string
): Promise<void> {
  // Capture Page 1 (ব্যক্তিগত মাসিক রিপোর্ট ছক)
  const canvas1 = await captureElementToCanvas(page1Element, { scale: 2 });
  const imgData1 = canvas1.toDataURL('image/jpeg', 0.96);

  // Capture Page 2 (মাসিক পরিকল্পনা ফরম)
  const canvas2 = await captureElementToCanvas(page2Element, { scale: 2 });
  const imgData2 = canvas2.toDataURL('image/jpeg', 0.96);

  // Page 1 is best presented in Landscape for the wide table
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const p1Width = pdf.internal.pageSize.getWidth();
  const p1Height = pdf.internal.pageSize.getHeight();
  const m1 = 5;
  const render1Width = p1Width - (m1 * 2);
  const render1Height = (canvas1.height * render1Width) / canvas1.width;
  
  if (render1Height <= p1Height - (m1 * 2)) {
    pdf.addImage(imgData1, 'JPEG', m1, m1, render1Width, render1Height, undefined, 'FAST');
  } else {
    const fit1Height = p1Height - (m1 * 2);
    const fit1Width = (canvas1.width * fit1Height) / canvas1.height;
    pdf.addImage(imgData1, 'JPEG', m1 + (render1Width - fit1Width) / 2, m1, fit1Width, fit1Height, undefined, 'FAST');
  }

  // Page 2: Monthly Plan in Portrait
  pdf.addPage('a4', 'portrait');
  const p2Width = pdf.internal.pageSize.getWidth();
  const p2Height = pdf.internal.pageSize.getHeight();
  const m2 = 6;
  const render2Width = p2Width - (m2 * 2);
  const render2Height = (canvas2.height * render2Width) / canvas2.width;

  if (render2Height <= p2Height - (m2 * 2)) {
    pdf.addImage(imgData2, 'JPEG', m2, m2, render2Width, render2Height, undefined, 'FAST');
  } else {
    const fit2Height = p2Height - (m2 * 2);
    const fit2Width = (canvas2.width * fit2Height) / canvas2.height;
    pdf.addImage(imgData2, 'JPEG', m2 + (render2Width - fit2Width) / 2, m2, fit2Width, fit2Height, undefined, 'FAST');
  }

  pdf.save(filename);
}

/**
 * Stitches two canvases into one tall canvas for combined full book image download
 */
export function combineCanvases(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement): HTMLCanvasElement {
  const combined = document.createElement('canvas');
  const width = Math.max(canvas1.width, canvas2.width);
  const padding = 20;
  const height = canvas1.height + canvas2.height + padding;

  combined.width = width;
  combined.height = height;

  const ctx = combined.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw canvas 1 centered
    const x1 = (width - canvas1.width) / 2;
    ctx.drawImage(canvas1, x1, 0);

    // Divider line
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(40, canvas1.height + padding / 2, width - 80, 2);

    // Draw canvas 2 centered
    const x2 = (width - canvas2.width) / 2;
    ctx.drawImage(canvas2, x2, canvas1.height + padding);
  }

  return combined;
}
