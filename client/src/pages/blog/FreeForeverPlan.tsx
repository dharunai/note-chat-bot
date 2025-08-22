import { useEffect, useMemo } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function FreeForeverPlan() {
  const title = "Free AI Tools for Students & Professionals – No Credit Card Needed";
  const description = "Use Note Bot AI’s best features without paying a rupee. Here’s how to make the most of the free plan.";
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/free-forever-plan` : "/blog/free-forever-plan";

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
    const meta = document.querySelector('meta[name=\"description\"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", description);
    document.head.appendChild(meta);

    let link = document.querySelector('link[rel=\"canonical\"]') || document.createElement("link");
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
                Free Forever Plan – Premium Power Without Paying
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Not a trial. Not a bait. Use core AI tools for free—any time you want. Built by a student for students.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border">Made by a Student</Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center rounded-md bg-background/60 p-4 ring-1 ring-border">
              <img src="https://placehold.co/120x120/svg?text=Free" alt="Free forever plan badge" loading="lazy" decoding="async" className="h-20 w-20 opacity-80" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section aria-labelledby="what">
          <h2 id="what" className="text-2xl md:text-3xl font-semibold">What It Is</h2>
          <p className="mt-2 text-muted-foreground">A genuinely free plan covering the essentials: chat with notes, chat with PDFs, summarization, conversions, and compression.</p>
        </section>

        <section aria-labelledby="why" className="mt-8">
          <h2 id="why" className="text-2xl md:text-3xl font-semibold">Why It’s a Game-Changer</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>No signups, ads, or paywalls.</li>
            <li>Mobile-friendly—use it on the bus or between classes.</li>
            <li>Fast, clean UI built for actual students.</li>
          </ul>
        </section>

        <section aria-labelledby="steps" className="mt-8">
          <h2 id="steps" className="text-2xl md:text-3xl font-semibold">Get Started in 2 Minutes</h2>
          <ol className="mt-3 list-decimal pl-5 text-muted-foreground">
            <li>Open Note Bot AI.</li>
            <li>Pick a tool—no login screens to block you.</li>
            <li>Drop your file and go.</li>
          </ol>
        </section>

        <section aria-labelledby="uses" className="mt-8">
          <h2 id="uses" className="text-2xl md:text-3xl font-semibold">Real-Life Use Cases</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Students: Last-minute prep without hassle.</li>
            <li>Freelancers: Convert, compress, and share files quickly.</li>
            <li>Professionals: Edit PDFs and summarize reports on the go.</li>
          </ul>
        </section>

        <section aria-labelledby="tips" className="mt-8">
          <h2 id="tips" className="text-2xl md:text-3xl font-semibold">Tips for Best Results</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Pin the site to your phone home screen.</li>
            <li>Use the summarizer before deep reading.</li>
            <li>Compress before emailing assignments.</li>
          </ul>
        </section>

        <section aria-labelledby="free" className="mt-8">
          <h2 id="free" className="text-2xl md:text-3xl font-semibold">Free Forever?</h2>
          <p className="mt-2 text-muted-foreground">Yes. No account needed, ever. It’s built that way.</p>
        </section>

        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/tools" aria-label="Explore free AI tools – Start Now">
              Explore Free Tools – Start Now
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
