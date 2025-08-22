import { useEffect, useMemo } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function AISummarization() {
  const title = "Free AI Summarizer – Make Any Document Bite-Sized";
  const description = "Summarize anything instantly – from eBooks to meeting notes – with Note Bot AI’s summarizer tool.";
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/ai-summarization` : "/blog/ai-summarization";

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    mainEntityOfPage: canonical,
    author: { "@type": "Person", name: "Note Bot AI (Student)" },
    publisher: { "@type": "Organization", name: "Note Bot AI" },
    datePublished: "2025-08-01",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <header className="border-b bg-gradient-to-r from-primary/10 to-secondary/10 particles-bg">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-start justify-between gap-4">
            <div className="animate-fade-in-scale opacity-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text-shimmer">
                AI-Powered Summarization – Turn 50 Pages Into 5
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Too many pages, too little time? Convert chapters, reports, and lecture notes into clean, bullet summaries.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border">Made by a Student</Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center rounded-md bg-background/60 p-4 ring-1 ring-border">
              <img src="https://placehold.co/120x120/svg?text=TL;DR" alt="AI summarizer illustration" loading="lazy" decoding="async" className="h-20 w-20 opacity-80" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section aria-labelledby="hook">
          <h2 id="hook" className="text-2xl md:text-3xl font-semibold">Skim less. Learn more.</h2>
          <p className="mt-2 text-muted-foreground">Get bite-sized takeaways in seconds, then dive deeper with follow-up questions.</p>
        </section>

        <section aria-labelledby="what" className="mt-8">
          <h2 id="what" className="text-2xl md:text-3xl font-semibold">What It Is</h2>
          <p className="mt-2 text-muted-foreground">An AI summarizer that turns dense material into clean paragraphs and bullet points you can revise quickly.</p>
        </section>

        <section aria-labelledby="why" className="mt-8">
          <h2 id="why" className="text-2xl md:text-3xl font-semibold">Why It’s a Game-Changer</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Grabs the main ideas instantly.</li>
            <li>Bullet points perfect for revision and flashcards.</li>
            <li>Works on PDFs, notes, articles—anything text-based.</li>
          </ul>
        </section>

        <section aria-labelledby="steps" className="mt-8">
          <h2 id="steps" className="text-2xl md:text-3xl font-semibold">Step-by-Step Guide</h2>
          <ol className="mt-3 list-decimal pl-5 text-muted-foreground">
            <li>Upload your file or paste text.</li>
            <li>Select summary style: bullets or short paragraph.</li>
            <li>Copy, download, or continue chatting with your summary.</li>
          </ol>
        </section>

        <section aria-labelledby="uses" className="mt-8">
          <h2 id="uses" className="text-2xl md:text-3xl font-semibold">Real-Life Use Cases</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Students: Pre-class prep and night-before revision.</li>
            <li>Professionals: Meeting notes and deck prep.</li>
            <li>Bloggers: Turn long posts into quick TL;DRs.</li>
          </ul>
        </section>

        <section aria-labelledby="tips" className="mt-8">
          <h2 id="tips" className="text-2xl md:text-3xl font-semibold">Tips for Best Results</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Use clean text (avoid watermarked scans).</li>
            <li>Break massive files into sections.</li>
            <li>Ask follow-up questions to clarify details.</li>
          </ul>
        </section>

        <section aria-labelledby="free" className="mt-8">
          <h2 id="free" className="text-2xl md:text-3xl font-semibold">Free Forever?</h2>
          <p className="mt-2 text-muted-foreground">Yep. No login. No cards. Just open and summarize.</p>
        </section>

        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/tools" aria-label="Try AI Summarizer for Free – Start Now">
              Try the AI Summarizer – Start Now
            </Link>
          </Button>
        </div>
      </main>

      <footer className="border-t bg-background/50">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
          Note Bot AI – Built by a Student. Loved by Students. No ads. No logins. Just tools.
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
