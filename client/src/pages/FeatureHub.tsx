import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopNav from "@/components/navigation/TopNav";

const tools = [
  { title: "Image → PDF", desc: "Convert images into a single PDF.", to: "/tools/image-to-pdf", iconPath: "/icons/image.svg" },
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
  { title: "Resume Builder", desc: "Live preview, templates, export", to: "/tools/resume-builder", iconPath: "/icons/resume.svg" },
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
        <header className="text-center mb-6 md:mb-10 animate-fade-in-scale opacity-0 animate-stagger-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-2 md:mb-3 gradient-text-shimmer">
            Note Bot AI – Your all-in-one hub to chat, convert, create, and conquer
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-typewriter">
            Fast, lightweight, mobile-first tools for documents, writing, and creativity.
          </p>
        </header>

        <section aria-label="Tools" className="grid gap-5 md:gap-6 lg:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map(({ title, desc, to, iconPath }, index) => (
            <Link 
              key={title} 
              to={to} 
              className={`block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl animate-scale-in opacity-0 animate-stagger-${(index % 6) + 1}`}
            >
              <Card className="text-left hover-lift hover-glow hover-magnetic morphing-border ripple-effect relative overflow-hidden border-2 border-border/50 hover:border-primary/30 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm h-full group-hover:shadow-2xl transition-all duration-500 glass-effect">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10" />

                <CardHeader className="relative z-10 p-5 md:p-6">
                  <div className="flex items-start gap-4 mb-3 md:mb-4">
                    <div className="relative rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 p-3 md:p-3.5 flex-shrink-0 group-hover:from-primary/25 group-hover:to-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2">
                      <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
                      <img 
                        src={iconPath} 
                        alt={`${title} icon`} 
                        className="relative h-5 w-5 md:h-6 md:w-6 object-contain filter group-hover:brightness-110 transition-all duration-300" 
                        loading="lazy" 
                        decoding="async" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors duration-300 tracking-tight">
                        {title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-sm md:text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 font-medium break-words">
                    {desc}
                  </CardDescription>

                  {/* Progress bar effect on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default FeatureHub;