export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

export function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function exportFlashcardsPdf(cards: { q: string; a: string }[], filename = 'flashcards.pdf') {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  const lineHeight = 14;
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const maxWidth = pageWidth - margin * 2;

  const wrap = (text: string, maxChars = 90) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > maxChars) {
        lines.push(line.trim());
        line = w;
      } else {
        line += ' ' + w;
      }
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  };

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  cards.forEach((c, idx) => {
    const qLines = wrap(`Q${idx + 1}. ${c.q}`);
    const aLines = wrap(`A${idx + 1}. ${c.a}`);
    const blockHeight = (qLines.length + aLines.length + 2) * lineHeight + 10;
    if (y - blockHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    // Question
    qLines.forEach((l) => {
      page.drawText(l, { x: margin, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
      y -= lineHeight;
    });
    y -= 6;
    // Answer
    aLines.forEach((l) => {
      page.drawText(l, { x: margin, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    });
    y -= 16;
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
