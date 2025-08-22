import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopNav from "@/components/navigation/TopNav";

const tools = [
  { title: "Image → PDF", desc: "Convert images into a single PDF.", to: "/tools/image-to-pdf", iconPath: "/icons/pdf.svg" },
  { title: "Text → PDF", desc: "Turn notes into a clean PDF.", to: "/tools/text-to-pdf", iconPath: "/icons/text.svg" },
  { title: "Word → PDF", desc: "Save DOCX as PDF.", to: "/tools/word-to-pdf", iconPath: "/icons/word.svg" },
  { title: "PDF → Word", desc: "Convert PDFs back to DOCX.", to: "/tools/pdf-to-word", iconPath: "/icons/word.svg" },
  { title: "PDF Merge", desc: "Combine multiple PDFs.", to: "/tools/pdf-merge", iconPath: "/icons/pdf.svg" },
  { title: "PDF Split", desc: "Split a PDF by pages.", to: "/tools/pdf-split", iconPath: "/icons/pdf.svg" },
  { title: "PDF Compressor", desc: "Reduce PDF size.", to: "/tools/pdf-compress", iconPath: "/icons/pdf.svg" },
  { title: "Excel → PDF", desc: "Export XLSX to PDF.", to: "/tools/excel-to-pdf", iconPath: "/icons/excel.svg" },
  { title: "Image Compressor", desc: "Resize & compress images.", to: "/tools/image-compress", iconPath: "/icons/image.svg" },
  { title: "Plagiarism Checker", desc: "Check for originality.", to: "/tools/plagiarism-check", iconPath: "/icons/plagiarism.svg" },
  { title: "AI Essay Writer", desc: "Drafts and outlines.", to: "/tools/essay-writer", iconPath: "/icons/essay.svg" },
  { title: "Grammar Checker", desc: "Fix grammar & spelling.", to: "/tools/grammar", iconPath: "/icons/grammar.svg" },
  { title: "Citation Generator", desc: "APA, MLA, Chicago.", to: "/tools/citation-generator", iconPath: "/icons/citation.svg" },
  { title: "Paraphrasing Tool", desc: "Improve clarity.", to: "/tools/paraphrase", iconPath: "/icons/paraphrase.svg" },
  { title: "Summarizer", desc: "Condense long text.", to: "/tools/summarizer", iconPath: "/icons/summarize.svg" },
  { title: "Translator", desc: "Translate to 20+ languages.", to: "/tools/translator", iconPath: "/icons/translator.svg" },
  { title: "Flashcard Creator", desc: "Turn notes into Q&A.", to: "/tools/flashcard-creator", iconPath: "/icons/flashcards.svg" },
  { title: "Image Background Remover", desc: "Remove backgrounds in 1 click (Eremove.bg)", to: "/tools/remove-bg", iconPath: "/icons/magic-wand.svg" },
  { title: "Resume Builder", desc: "Live preview, templates, export", to: "/tools/resume-builder", iconPath: "/icons/document-text.svg" },
  { title: "Presentation Maker", desc: "Slides from notes.", to: "/tools/presentation-creator", iconPath: "/icons/presentation.svg" },
  { title: "Poster / Flyer", desc: "Generate designs.", to: "/tools/flyer-creator", iconPath: "/icons/poster.svg" },
  { title: "OCR (Handwriting → Text)", desc: "OCR handwritten notes.", to: "/tools/ocr-tool", iconPath: "/icons/ocr.svg" },
];

const FeatureHub = () => {
  useMemo(() => { document.title = "Note Bot AI – Tools Hub"; }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />

      <main className="container mx-auto px-4 py-6 md:py-10">
        <header className="text-center mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-2 md:mb-3">
            Note Bot AI – Your all-in-one hub to chat, convert, create, and conquer
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fast, lightweight, mobile-first tools for documents, writing, and creativity.
          </p>
        </header>

        <section aria-label="Tools" className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((t) => (
            <Card key={t.title} className="group hover:shadow-elegant transition-smooth">
              <CardHeader className="flex-row items-start gap-3 p-4 md:p-6">
                <div className="p-2 rounded-lg md:rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 flex-shrink-0">
                  <img src={t.iconPath} alt={`${t.title} icon`} className="h-4 w-4 md:h-5 md:w-5" loading="lazy" decoding="async" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm md:text-base leading-tight mb-1">{t.title}</CardTitle>
                  <CardDescription className="text-xs md:text-sm break-words whitespace-normal leading-relaxed">{t.desc}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 md:px-6 pb-4 md:pb-6">
                <Button className="w-full text-sm" asChild>
                  <Link to={t.to} aria-label={`Open ${t.title}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
};

export default FeatureHub;
