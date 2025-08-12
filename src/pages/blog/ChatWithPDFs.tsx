import { useEffect, useMemo } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
export default function ChatWithPDFs() {
  const title = "Chat With Your PDFs for Free – Read Less, Learn More";
  const description = "Turn long PDFs into instant conversations. Ask questions and get answers directly from your documents.";
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/chat-with-pdfs` : "/blog/chat-with-pdfs";
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    mainEntityOfPage: canonical,
    author: {
      "@type": "Person",
      name: "Note Bot AI (Student)"
    },
    publisher: {
      "@type": "Organization",
      name: "Note Bot AI"
    },
    datePublished: "2025-08-01"
  }), [canonical]);
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", description);
    document.head.appendChild(meta);
    let link = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", canonical);
    document.head.appendChild(link);
  }, [canonical]);
  return <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <header className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Chat With PDFs – Stop Scrolling, Start Asking
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Turn long PDFs into instant chats. Ask questions and get answers from your textbook, research paper, or report—no more endless scrolling.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border">Made by a Student</Badge>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section aria-labelledby="hook">
          <h2 id="hook" className="text-2xl md:text-3xl font-semibold">Imagine your PDFs answering back… now they can.</h2>
          <p className="mt-2 text-muted-foreground">Paste a question and get instant answers pulled directly from your document. Perfect for textbooks, reports, and research papers.</p>
        </section>

        <section aria-labelledby="what" className="mt-8">
          <h2 id="what" className="text-2xl md:text-3xl font-semibold">What It Is</h2>
          <p className="mt-2 text-muted-foreground">Upload a PDF and chat with it like a friend. Ask for definitions, summaries, quotes, and exact page references—without reading every page.</p>
        </section>

        <section aria-labelledby="why" className="mt-8">
          <h2 id="why" className="text-2xl md:text-3xl font-semibold">Why It’s a Game-Changer</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Saves hours of reading time.</li>
            <li>Finds the exact answer with quoted context.</li>
            <li>Works on textbooks, research papers, reports, even scanned PDFs.</li>
          </ul>
        </section>

        <section aria-labelledby="steps" className="mt-8">
          <h2 id="steps" className="text-2xl md:text-3xl font-semibold">Step-by-Step Guide</h2>
          <ol className="mt-3 list-decimal pl-5 text-muted-foreground">
            <li>Upload your PDF.</li>
            <li>Wait a few seconds while the AI processes it.</li>
            <li>Ask questions in plain English and get precise answers.</li>
          </ol>
        </section>

        <section aria-labelledby="uses" className="mt-8">
          <h2 id="uses" className="text-2xl md:text-3xl font-semibold">Real-Life Use Cases</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Students: Understand chapters, formulas, and key concepts faster.</li>
            <li>Researchers: Extract citations and related sections instantly.</li>
            <li>Professionals: Pull insights from reports without skimming.</li>
          </ul>
        </section>

        <section aria-labelledby="tips" className="mt-8">
          <h2 id="tips" className="text-2xl md:text-3xl font-semibold">Tips for Best Results</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Ask specific questions ("What does section 3 say about X?").</li>
            <li>Use PDFs with selectable text for best accuracy.</li>
            <li>Split very large files for faster responses.</li>
          </ul>
        </section>

        <section aria-labelledby="free" className="mt-8">
          <h2 id="free" className="text-2xl md:text-3xl font-semibold">Free Forever?</h2>
          <p className="mt-2 text-muted-foreground">Yes—no login, no trial, no ads. Just upload and start asking.</p>
        </section>

        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/tools" aria-label="Try Chat With PDFs for Free – Start Now">
              Try Chat With PDFs – Start Now
            </Link>
          </Button>
        </div>
      </main>

      <footer className="border-t bg-background/50">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
          Note Bot AI – Built by a Student. Loved by Students. No ads. No logins. Just tools.
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(jsonLd)
    }} />
    </div>;
}