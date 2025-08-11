import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";

function toTitle(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function BlogPostComingSoon() {
  const { slug = "post" } = useParams();
  const readable = toTitle(slug);
  const title = `Coming Soon: ${readable} – Note Bot AI Blog`;
  const description = `The article “${readable}” is coming soon. In the meantime, explore our tools and other posts.`;
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : `/blog/${slug}`;

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: readable,
    description,
    mainEntityOfPage: canonical,
    datePublished: "2025-08-01",
  }), [canonical, readable, description]);

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
  }, [canonical, title, description]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{readable}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          This article is brewing. Grab a coffee and check back soon.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/tools">Explore Tools</Link>
          </Button>
        </div>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
