import { useEffect, useMemo } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export default function ChatWithYourNotes() {
  const title = "Chat With Your Own Notes for Free – Game-Changer for Students & Professionals";
  const description =
    "Learn how Note Bot AI lets you chat with your notes like a friend. Perfect for backbenchers, busy professionals, and anyone who hates revising the old way.";
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/chat-with-your-notes` : "/blog/chat-with-your-notes";

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

      <header className="border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Chat With Your Own Notes – The Backbencher’s Secret Weapon
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Imagine your notes answering back instead of just sitting there… now they can. Upload your notes and chat with them like a friend.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border">Made by a Student</Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center rounded-md bg-background/60 p-4 ring-1 ring-border">
              <MessageSquare className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section aria-labelledby="what" className="prose max-w-none prose-headings:scroll-mt-20">
          <h2 id="what" className="text-2xl md:text-3xl font-semibold">What It Is</h2>
          <p className="mt-2 text-muted-foreground">
            Upload your class notes, PDFs, or typed summaries, and instantly chat with them using AI. Ask questions, get direct answers, and pull quotes from your own content.
          </p>
        </section>

        <section aria-labelledby="why" className="mt-8">
          <h2 id="why" className="text-2xl md:text-3xl font-semibold">Why It’s a Game-Changer</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Cuts study time and makes revision focused.</li>
            <li>Perfect for last-minute prep (we’ve all been there).</li>
            <li>Works even if you missed a few classes.</li>
          </ul>
        </section>

        <section aria-labelledby="how" className="mt-8">
          <h2 id="how" className="text-2xl md:text-3xl font-semibold">How It Works (Step-by-Step)</h2>
          <ol className="mt-3 list-decimal pl-5 text-muted-foreground">
            <li>Upload your notes (PDF, Word, or text).</li>
            <li>AI processes them instantly.</li>
            <li>You ask questions; it answers from your own content.</li>
          </ol>
        </section>

        <section aria-labelledby="uses" className="mt-8">
          <h2 id="uses" className="text-2xl md:text-3xl font-semibold">Real-Life Uses</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Backbenchers prepping for exams.</li>
            <li>Professionals preparing presentations.</li>
            <li>Bloggers turning long posts into FAQs.</li>
          </ul>
        </section>

        <section aria-labelledby="free" className="mt-8">
          <h2 id="free" className="text-2xl md:text-3xl font-semibold">Free Forever?</h2>
          <p className="mt-2 text-muted-foreground">
            Yes. Note Bot AI’s base plan lets you use this without paying. No ads, no forced signups, no drama.
          </p>
        </section>

        <section aria-labelledby="tips" className="mt-8">
          <h2 id="tips" className="text-2xl md:text-3xl font-semibold">Tips for Best Results</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Use clean, readable notes.</li>
            <li>Ask clear questions.</li>
            <li>Upload in small chunks for faster replies.</li>
          </ul>
        </section>

        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/tools" aria-label="Try Chat With Your Notes for Free – Start Now">
              Try Chat With Your Notes for Free – Start Now
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
