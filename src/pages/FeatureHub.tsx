import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopNav from "@/components/navigation/TopNav";
import { FileImage, FileText, Images, FileCog, FilePlus2, FileDown, FileUp, Shrink, ScanText, PenTool, SpellCheck, Quote, Shuffle, ListChecks, Presentation, Image as ImageIcon, FileUser, Hand, GraduationCap } from "lucide-react";

const tools = [
  { title: "Study Tools (All-in-One)", desc: "Paraphrase, summarize, cite, translate, more.", to: "/tools/study", icon: GraduationCap },
  { title: "Image → PDF", desc: "Convert images into a single PDF.", to: "/tools/image-to-pdf", icon: FileImage },
  { title: "Text → PDF", desc: "Turn notes into a clean PDF.", to: "/tools/text-to-pdf", icon: FileText },
  { title: "Word → PDF", desc: "Save DOCX as PDF.", to: "/tools/word-to-pdf", icon: FileDown },
  { title: "PDF → Word", desc: "Convert PDFs back to DOCX.", to: "/tools/pdf-to-word", icon: FileUp },
  { title: "PDF Merge", desc: "Combine multiple PDFs.", to: "/tools/pdf-merge", icon: Images },
  { title: "PDF Split", desc: "Split a PDF by pages.", to: "/tools/pdf-split", icon: FilePlus2 },
  { title: "PDF Compressor", desc: "Reduce PDF size.", to: "/tools/pdf-compress", icon: Shrink },
  { title: "Excel → PDF", desc: "Export XLSX to PDF.", to: "/tools/excel-to-pdf", icon: FileCog },
  { title: "Image Compressor", desc: "Resize & compress images.", to: "/tools/image-compress", icon: ImageIcon },
  { title: "Plagiarism Checker", desc: "Check for originality.", to: "/tools/plagiarism-check", icon: ScanText },
  { title: "AI Essay Writer", desc: "Drafts and outlines.", to: "/tools/essay-writer", icon: PenTool },
  { title: "Grammar Checker", desc: "Fix grammar & spelling.", to: "/tools/grammar", icon: SpellCheck },
  { title: "Citation Generator", desc: "APA, MLA, Chicago.", to: "/tools/citation", icon: Quote },
  { title: "Paraphrasing Tool", desc: "Improve clarity.", to: "/tools/paraphrase", icon: Shuffle },
  { title: "Summarizer", desc: "Condense long text.", to: "/tools/summarizer", icon: ListChecks },
  { title: "Presentation Maker", desc: "Slides from notes.", to: "/tools/presentation", icon: Presentation },
  { title: "Poster / Flyer", desc: "Generate designs.", to: "/tools/poster", icon: ImageIcon },
  { title: "Resume Builder", desc: "Resume & cover letter.", to: "/tools/resume", icon: FileUser },
  { title: "Handwriting → Text", desc: "OCR handwritten notes.", to: "/tools/ocr", icon: Hand },
];

const FeatureHub = () => {
  useMemo(() => { document.title = "Note Bot AI – Tools Hub"; }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />

      <main className="container mx-auto px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Note Bot AI – Your all-in-one hub to chat, convert, create, and conquer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fast, lightweight, mobile-first tools for documents, writing, and creativity.
          </p>
        </header>

        <section aria-label="Tools" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((t) => (
            <Card key={t.title} className="group hover:shadow-elegant transition-smooth">
              <CardHeader className="flex-row items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{t.title}</CardTitle>
                  <CardDescription>{t.desc}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link to={t.to}>Open</Link>
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
