import { useEffect, useMemo } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function FileCompression() {
  const title = "Compress Files Without Quality Loss";
  const description = "Reduce file size for faster uploads and submissions while keeping clarity and quality.";
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/file-compression` : "/blog/file-compression";

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
                File Compression Without Quality Loss
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Shrink PDFs and images for faster submissions—keep them sharp, not blurry.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border">Made by a Student</Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center rounded-md bg-background/60 p-4 ring-1 ring-border">
              <img src="https://placehold.co/120x120/svg?text=Zip" alt="Compression graphic" loading="lazy" decoding="async" className="h-20 w-20 opacity-80" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section aria-labelledby="what">
          <h2 id="what" className="text-2xl md:text-3xl font-semibold">What It Is</h2>
          <p className="mt-2 text-muted-foreground">A quick compressor for PDFs and images that keeps them clear enough for grading, printing, or presenting.</p>
        </section>

        <section aria-labelledby="why" className="mt-8">
          <h2 id="why" className="text-2xl md:text-3xl font-semibold">Why It’s a Game-Changer</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Faster uploads to portals with strict size limits.</li>
            <li>Adjustable quality for the perfect balance.</li>
            <li>No watermarks—ever.</li>
          </ul>
        </section>

        <section aria-labelledby="steps" className="mt-8">
          <h2 id="steps" className="text-2xl md:text-3xl font-semibold">Step-by-Step Guide</h2>
          <ol className="mt-3 list-decimal pl-5 text-muted-foreground">
            <li>Upload your file(s).</li>
            <li>Pick compression level.</li>
            <li>Download and submit with confidence.</li>
          </ol>
        </section>

        <section aria-labelledby="uses" className="mt-8">
          <h2 id="uses" className="text-2xl md:text-3xl font-semibold">Real-Life Use Cases</h2>
          <ul className="mt-3 list-disc pl-5 text-muted-foreground">
            <li>Submit forms on slow campus Wi‑Fi.</li>
            <li>Email assignments under tight size limits.</li>
            <li>Share portfolios without losing detail.</li>
          </ul>
        </section>

        <section aria-labelledby="free" className="mt-8">
          <h2 id="free" className="text-2xl md:text-3xl font-semibold">Free Forever?</h2>
          <p className="mt-2 text-muted-foreground">Yes. Compress as much as you want—no login walls.</p>
        </section>

        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/tools" aria-label="Try file compression – Start Now">
              Try Compression – Start Now
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
