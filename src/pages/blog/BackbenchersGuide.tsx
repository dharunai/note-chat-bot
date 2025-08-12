import { useEffect, useMemo } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function BackbenchersGuide() {
  const title = "How Backbenchers Can Pass Exams with AI – 2025 Edition";
  const description = "Learn how to turn your last-minute panic into a calm, focused prep session using AI tools.";
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/backbenchers-guide` : "/blog/backbenchers-guide";

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
                Backbencher’s Guide to Passing Without Pain
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                You skipped a few lectures. It’s fine. Here’s the one‑night plan to go from panic to passing with AI.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border">Made by a Student</Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center rounded-md bg-background/60 p-4 ring-1 ring-border">
              <img src="https://placehold.co/120x120/svg?text=Exam" alt="Backbencher exam prep graphic" loading="lazy" decoding="async" className="h-20 w-20 opacity-80" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section aria-labelledby="hook">
          <h2 id="hook" className="text-2xl md:text-3xl font-semibold">The One-Night Game Plan</h2>
          <ol className="mt-3 list-decimal pl-5 text-muted-foreground">
            <li>Summarize your syllabus (or any notes you can find).</li>
            <li>Chat with your notes to fill gaps and clarify concepts.</li>
            <li>Create a mini-FAQ of likely questions.</li>
          </ol>
        </section>

        <section aria-labelledby="what" className="mt-8">
          <h2 id="what" className="text-2xl md:text-3xl font-semibold">What It Is</h2>
          <p className="mt-2 text-muted-foreground">A stress-free, student-first approach to exams using Note Bot AI’s free tools: summarizer, chat with notes/PDFs, and quick converters.</p>
        </section>

        <section aria-labelledby="why" className="mt-8">
          <h2 id="why" className="text-2xl md:text-3xl font-semibold">Why It Works</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Focuses on what’s likely to be asked.</li>
            <li>Turns passive reading into active Q&A.</li>
            <li>Works on your phone—study anywhere.</li>
          </ul>
        </section>

        <section aria-labelledby="tips" className="mt-8">
          <h2 id="tips" className="text-2xl md:text-3xl font-semibold">Tips for Best Results</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Prioritize topics by weightage.</li>
            <li>Use the summarizer first, then chat deepen understanding.</li>
            <li>Sleep. Seriously, your brain needs it.</li>
          </ul>
        </section>

        <section aria-labelledby="free" className="mt-8">
          <h2 id="free" className="text-2xl md:text-3xl font-semibold">Free Forever?</h2>
          <p className="mt-2 text-muted-foreground">Yes. Use the entire workflow without creating an account.</p>
        </section>

        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/tools" aria-label="Try the Backbencher plan – Start Now">
              Try the Backbencher Plan – Start Now
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
