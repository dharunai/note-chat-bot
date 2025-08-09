import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// Vite: import the worker as a URL
// @ts-ignore Vite url import typing
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let text = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : (item as any).text) || '')
      .join(' ');
    text += `[Page ${pageNum}]\n${pageText}\n\n`;
  }

  return text.trim();
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Dynamically import mammoth browser build to keep bundle light
  // @ts-ignore - mammoth provides a browser bundle path
  const mammoth = await import('mammoth/mammoth.browser');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return String(result?.value || '').trim();
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.toLowerCase();
  if (ext.endsWith('.pdf')) return extractTextFromPDF(file);
  if (ext.endsWith('.docx')) return extractTextFromDOCX(file);
  if (ext.endsWith('.txt')) return file.text();
  throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
}
