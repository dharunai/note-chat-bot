import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopNav from "@/components/navigation/TopNav";

const tools = [
  { title: "Image → PDF", to: "/tools/image-to-pdf", iconPath: "/icons/image-to-pdf.svg" },
  { title: "Text → PDF", to: "/tools/text-to-pdf", iconPath: "/icons/text.svg" },
  { title: "Word → PDF", to: "/tools/word-to-pdf", iconPath: "/icons/word.svg" },
  { title: "PDF → Word", to: "/tools/pdf-to-word", iconPath: "/icons/pdf.svg" },
  { title: "PDF Merge", to: "/tools/pdf-merge", iconPath: "/icons/pdf-merge.svg" },
  { title: "PDF Split", to: "/tools/pdf-split", iconPath: "/icons/pdf.svg" },
  { title: "PDF Compressor", to: "/tools/pdf-compress", iconPath: "/icons/pdf-compress.svg" },
  { title: "Excel → PDF", to: "/tools/excel-to-pdf", iconPath: "/icons/excel.svg" },
  { title: "Image Compressor", to: "/tools/image-compress", iconPath: "/icons/image.svg" },
  { title: "Plagiarism Checker", to: "/tools/plagiarism-checker", iconPath: "/icons/plagiarism-check.svg" },
  { title: "AI Essay Writer", to: "/tools/essay-writer", iconPath: "/icons/ai-writer.svg" },
  { title: "Grammar Checker", to: "/tools/grammar", iconPath: "/icons/grammar.svg" },
  { title: "Citation Generator", to: "/tools/citation-generator", iconPath: "/icons/citation.svg" },
  { title: "Paraphrasing Tool", to: "/tools/paraphrase", iconPath: "/icons/paraphrase-new.svg" },
  { title: "Summarizer", to: "/tools/summarizer", iconPath: "/icons/summarize.svg" },
  { title: "Translator", to: "/tools/translator", iconPath: "/icons/translator.svg" },
  { title: "Flashcard Creator", to: "/tools/flashcard-creator", iconPath: "/icons/flashcards.svg" },
  { title: "Image Background Remover", to: "/tools/remove-bg", iconPath: "/icons/magic-wand.svg" },
  { title: "Resume Builder", to: "/tools/resume-builder", iconPath: "/icons/resume.svg" },
  { title: "Presentation Maker", to: "/tools/presentation-creator", iconPath: "/icons/powerpoint.svg" },
  { title: "Poster / Flyer", to: "/tools/flyer-creator", iconPath: "/icons/poster.svg" },
  { title: "OCR (Handwriting → Text)", to: "/tools/ocr-tool", iconPath: "/icons/ocr.svg" },
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
          {tools.map(({ title, to, iconPath }, index) => (
            <Link 
              key={title} 
              to={to} 
              className={`block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl animate-scale-in opacity-0 animate-stagger-${(index % 6) + 1}`}
            >
              <Card className="text-left hover-lift hover-glow hover-magnetic morphing-border ripple-effect relative overflow-hidden border-2 border-border/50 hover:border-primary/30 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm h-full group-hover:shadow-2xl transition-all duration-500 glass-effect">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10" />

                <CardHeader className="relative z-10 p-5 md:p-6 text-center">
                  <div className="flex flex-col items-center gap-4 mb-3 md:mb-4">
                    <div className="flex justify-center">
                      <img 
                        src={iconPath} 
                        alt={`${title} icon`} 
                        className="h-10 w-10 md:h-12 md:w-12 object-contain filter group-hover:brightness-110 group-hover:scale-110 transition-all duration-300" 
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