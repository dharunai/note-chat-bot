import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";

// Configure worker from CDN to avoid bundler issues
// @ts-ignore
(pdfjs as any).GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.162/pdf.worker.min.js";

export async function mergePdfFiles(files: File[]): Promise<Blob> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer());
    const src = await PDFDocument.load(bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const pdfBytes = await out.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

export async function splitPdfByPages(file: File, pageNumbers: number[]): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const zeroBased = pageNumbers
    .filter((n) => Number.isFinite(n) && n > 0 && n <= src.getPageCount())
    .map((n) => n - 1);
  const pages = await out.copyPages(src, zeroBased);
  pages.forEach((p) => out.addPage(p));
  const pdfBytes = await out.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

export function parsePageRanges(input: string): number[] {
  // e.g. "1-3,5,7-8"
  const result: number[] = [];
  input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      const m = part.match(/^(\d+)-(\d+)$/);
      if (m) {
        const start = parseInt(m[1], 10);
        const end = parseInt(m[2], 10);
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) result.push(i);
      } else if (/^\d+$/.test(part)) {
        result.push(parseInt(part, 10));
      }
    });
  return Array.from(new Set(result)).sort((a, b) => a - b);
}

export async function compressPdfRasterize(file: File, scale = 1.0, quality = 0.6): Promise<Blob> {
  const data = new Uint8Array(await file.arrayBuffer());
  // @ts-ignore
  const loadingTask = (pdfjs as any).getDocument({ data });
  const pdf = await loadingTask.promise;
  const out = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    if (!ctx) throw new Error("Canvas not supported");
    await page.render({ canvasContext: ctx as any, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const imgBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));

    const pageDoc = out.addPage([canvas.width, canvas.height]);
    const jpg = await out.embedJpg(imgBytes);
    pageDoc.drawImage(jpg, { x: 0, y: 0, width: canvas.width, height: canvas.height });
  }

  const bytesOut = await out.save();
  return new Blob([bytesOut], { type: "application/pdf" });
}

export async function extractPdfText(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  // @ts-ignore
  const loadingTask = (pdfjs as any).getDocument({ data });
  const pdf = await loadingTask.promise;
  let full = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((it: any) => (it.str ?? "")).join(" ");
    full += pageText + "\n\n";
  }
  return full.trim();
}

export async function textToSimplePdf(text: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const size = 12;
  const margin = 50;
  const pageWidth = 595;
  const pageHeight = 842;
  const wrap = (line: string, max: number) => {
    const words = line.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    words.forEach((w) => {
      const t = current ? current + " " + w : w;
      if (font.widthOfTextAtSize(t, size) > max) {
        if (current) lines.push(current);
        current = w;
      } else current = t;
    });
    if (current) lines.push(current);
    return lines;
  };

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  const maxWidth = pageWidth - margin * 2;
  const paragraphs = text.split(/\n+/);
  paragraphs.forEach((p, idx) => {
    const lines = wrap(p, maxWidth);
    lines.forEach((ln) => {
      if (y < margin + size) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(ln, { x: margin, y, size, font, color: rgb(0, 0, 0) });
      y -= size * 1.4;
    });
    if (idx < paragraphs.length - 1) y -= size * 0.8;
  });

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}
