import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, Sparkles, Files, BadgeCheck, GraduationCap } from "lucide-react";

interface BlogCard {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: "AI Tools" | "Student Hacks";
  date: string; // Month YYYY
  icon: any;
}

const posts: BlogCard[] = [
  {
    slug: "chat-with-your-notes",
    title: "Chat With Your Own Notes – The Backbencher’s Secret Weapon",
    seoTitle: "Chat With Your Own Notes for Free – Game-Changer for Students & Professionals",
    description:
      "Learn how Note Bot AI lets you chat with your notes like a friend. Perfect for backbenchers, busy professionals, and anyone who hates revising the old way.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: MessageSquare,
  },
  {
    slug: "chat-with-pdfs",
    title: "Chat With PDFs – Stop Scrolling, Start Asking",
    seoTitle: "Chat With Your PDFs for Free – Read Less, Learn More",
    description:
      "Turn long PDFs into instant conversations. Ask questions and get answers directly from your documents.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: FileText,
  },
  {
    slug: "ai-summarization",
    title: "AI-Powered Summarization – Turn 50 Pages Into 5",
    seoTitle: "Free AI Summarizer – Make Any Document Bite-Sized",
    description:
      "Summarize anything instantly – from eBooks to meeting notes – with Note Bot AI’s summarizer tool.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: Sparkles,
  },
  {
    slug: "multi-file-learning",
    title: "Multi-File Learning – Merge Notes & PDFs into One Brain",
    seoTitle: "Learn from Multiple Files at Once – Free AI Tool for Smarter Study",
    description:
      "Combine your notes, textbooks, and PDFs into one searchable, chat-friendly workspace.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: Files,
  },
  {
    slug: "free-forever-plan",
    title: "Free Forever Plan – Premium Power Without Paying",
    seoTitle: "Free AI Tools for Students & Professionals – No Credit Card Needed",
    description:
      "Use Note Bot AI’s best features without paying a rupee. Here’s how to make the most of the free plan.",
    category: "Student Hacks",
    date: "Aug 2025",
    icon: BadgeCheck,
  },
  {
    slug: "backbenchers-guide",
    title: "Backbencher’s Guide to Passing Without Pain",
    seoTitle: "How Backbenchers Can Pass Exams with AI – 2025 Edition",
    description:
      "Turn last‑minute panic into a calm, focused prep session using AI tools.",
    category: "Student Hacks",
    date: "Aug 2025",
    icon: GraduationCap,
  },
];

export default function Blogs() {
  const pageTitle = "Note Bot AI Blog – Tools, Tips & Hacks for Smarter Study";
  const metaDescription =
    "Student-built blog on AI study tools, tips, and time-saving hacks. No logins, no ads—just fast, free tools.";
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog` : "/blog";

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Note Bot AI Blog",
      description: metaDescription,
      url: canonical,
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.seoTitle,
        about: p.category,
        datePublished: "2025-08-01",
        url: `${canonical}/${p.slug}`,
        description: p.description,
      })),
    };
  }, [canonical]);

  useEffect(() => {
    document.title = "Note Bot AI Blog – Tools, Tips & Study Hacks";
    const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
    meta.setAttribute("name", "description");
    meta.setAttribute("content", metaDescription);
    document.head.appendChild(meta);

    let link = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", canonical);
    document.head.appendChild(link);
  }, [canonical]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <header className="relative border-b">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Note Bot AI Blog – Tools, Tips & Hacks for Smarter Study
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Built by a student, for students. We share quick wins, friendly walkthroughs, and AI tricks that save time, cut stress, and make studying way less boring.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border">Note Bot AI Features – Explained & Explored</Badge>
              </div>
            </div>

            <div className="hidden md:block relative">
              <span className="absolute -top-3 right-0 rotate-3 rounded-sm bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground shadow-sm ring-1 ring-border">
                Made by a Student
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <section aria-labelledby="blog-list">
          <h2 id="blog-list" className="sr-only">Blog posts</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => {
              const Icon = post.icon;
              const to = idx === 0 ? `/blog/${post.slug}` : `/blog/${post.slug}`;
              const isFeatured = idx === 0;
              return (
                <article key={post.slug} className="group">
                  <Card className="h-full overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-40 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="h-10 w-10 text-primary" aria-hidden="true" />
                        </div>
                        {isFeatured && (
                          <div className="absolute left-3 top-3">
                            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">{post.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button asChild>
                        <Link to={to} aria-label={`Read more: ${post.title}`}>Read More</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 border-t pt-8">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <nav className="flex flex-wrap items-center gap-4">
              <Link to="/" className="hover:text-foreground">About</Link>
              <Link to="/tools" className="hover:text-foreground">Features</Link>
              <Link to="/tools" className="hover:text-foreground">Tools</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            </nav>
            <p className="w-full md:w-auto">
              Note Bot AI – Built by a Student. Loved by Students. No ads. No logins. Just tools.
            </p>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
