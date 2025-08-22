import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import TopNav from "@/components/navigation/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, Sparkles, Files, BadgeCheck, GraduationCap, Wrench, Image as ImageIcon, Recycle, Archive, Palette, Shield } from "lucide-react";

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
  // New series
  {
    slug: "pdf-editing-annotation",
    title: "PDF Editing & Annotation Tools",
    seoTitle: "Free PDF Editing & Annotation – No Login",
    description:
      "Edit, highlight, and annotate PDFs for assignments and reports—fast and free in your browser.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: Wrench,
  },
  {
    slug: "image-to-pdf-and-pdf-to-image",
    title: "Image to PDF & PDF to Image Conversions",
    seoTitle: "Image to PDF & PDF to Image – Free",
    description:
      "Convert images to PDF and export PDF pages as images—perfect for submissions and slides.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: ImageIcon,
  },
  {
    slug: "file-format-conversions",
    title: "File Format Conversions (DOCX, PPT, Excel ↔ PDF, PNG ↔ JPG, WebP ↔ JPG/PNG)",
    seoTitle: "DOCX/PPT/Excel ↔ PDF Converter – Free",
    description:
      "Convert between Word, PowerPoint, Excel and PDF instantly. Clean, fast, and mobile-friendly.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: Recycle,
  },
  {
    slug: "file-compression",
    title: "File Compression Without Quality Loss",
    seoTitle: "Compress Files Without Quality Loss",
    description:
      "Reduce file size for faster uploads and submissions while keeping clarity and quality.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: Archive,
  },
  {
    slug: "ai-creativity-design-tools",
    title: "AI Creativity & Design Tools (Posters, Flyers, Background Removal, QR Codes)",
    seoTitle: "AI Posters, Flyers, QR Codes – Free Tools",
    description:
      "Create posters, flyers, remove backgrounds, and generate QR codes—no design skills needed.",
    category: "Student Hacks",
    date: "Aug 2025",
    icon: Palette,
  },
  {
    slug: "security-privacy-features",
    title: "Security & Privacy Features (Password Protection, Secure Links, Offline Mode)",
    seoTitle: "Privacy-First Tools: Passwords & Secure Links",
    description:
      "Protect your documents with passwords, secure links, and optional offline mode.",
    category: "AI Tools",
    date: "Aug 2025",
    icon: Shield,
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

      <header className="relative border-b overflow-hidden">
        {/* Floating particles background */}
        <div className="absolute inset-0 opacity-30">
          <div className="floating-text absolute top-10 left-10 text-primary/20 font-bold text-lg animate-float">AI</div>
          <div className="floating-text absolute top-20 right-20 text-accent/20 font-bold text-lg animate-float" style={{animationDelay: '1s'}}>Tools</div>
          <div className="floating-text absolute top-32 left-1/4 text-primary/15 font-bold text-sm animate-float" style={{animationDelay: '2s'}}>Study</div>
          <div className="floating-text absolute top-16 right-1/3 text-accent/15 font-bold text-sm animate-float" style={{animationDelay: '3s'}}>Learn</div>
          <div className="floating-text absolute top-40 left-1/2 text-primary/10 font-bold text-xs animate-float" style={{animationDelay: '4s'}}>Smart</div>
          <div className="floating-text absolute top-24 right-1/4 text-accent/10 font-bold text-xs animate-float" style={{animationDelay: '5s'}}>Free</div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10 lg:py-14 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="animate-slide-in-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight gradient-text-animated">
                Note Bot AI Blog – Tools, Tips & Hacks for Smarter Study
              </h1>
              <p className="mt-2 md:mt-3 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed animate-fade-in-scale" style={{animationDelay: '0.3s'}}>
                Built by a student, for students. We share quick wins, friendly walkthroughs, and AI tricks that save time, cut stress, and make studying way less boring.
              </p>
              <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2 animate-slide-up" style={{animationDelay: '0.6s'}}>
                <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20 hover-glow">No logins required</Badge>
                <Badge variant="secondary" className="ring-1 ring-border text-xs md:text-sm hover-lift">Note Bot AI Features – Explained & Explored</Badge>
              </div>
            </div>

            <div className="hidden md:block relative animate-bounce-in" style={{animationDelay: '0.9s'}}>
              <span className="absolute -top-3 right-0 rotate-3 rounded-sm bg-secondary px-2 md:px-3 py-1 text-xs font-semibold text-secondary-foreground shadow-sm ring-1 ring-border hover-magnetic">
                Made by a Student
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
        <section aria-labelledby="blog-list">
          <h2 id="blog-list" className="sr-only">Blog posts</h2>

          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => {
              const Icon = post.icon;
              const to = idx === 0 ? `/blog/${post.slug}` : `/blog/${post.slug}`;
              const isFeatured = idx === 0;
              const animationClass = `animate-fade-in-scale animate-stagger-${Math.min(idx % 6 + 1, 6)}`;
              return (
                <article key={post.slug} className={`group ${animationClass}`}>
                  <Card className="h-full overflow-hidden hover-lift transition-smooth border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="p-0">
                      <div className="relative h-32 md:h-40 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 overflow-hidden">
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-2 left-2 w-1 h-1 bg-primary rounded-full animate-pulse-slow"></div>
                          <div className="absolute top-4 right-4 w-1 h-1 bg-accent rounded-full animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                          <div className="absolute bottom-3 left-6 w-1 h-1 bg-primary rounded-full animate-pulse-slow" style={{animationDelay: '2s'}}></div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary drop-shadow-sm" aria-hidden="true" />
                        </div>
                        {isFeatured && (
                          <div className="absolute left-3 top-3 animate-pulse-glow">
                            <Badge className="bg-primary text-primary-foreground text-xs shadow-lg">Featured</Badge>
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3 md:pt-4 px-4 md:px-6">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs hover-magnetic">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                      <CardTitle className="text-base md:text-lg lg:text-xl leading-tight group-hover:text-primary transition-colors duration-300">{post.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-relaxed line-clamp-3">{post.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="pt-2 px-4 md:px-6 pb-4 md:pb-6">
                      <Button asChild className="text-sm w-full group-hover:shadow-glow transition-all duration-300 ripple-effect">
                        <Link to={to} aria-label={`Read more: ${post.title}`}>
                          Read More
                          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 md:mt-12 border-t pt-6 md:pt-8 relative overflow-hidden">
          {/* Floating background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-4 left-10 w-2 h-2 bg-primary rounded-full animate-float"></div>
            <div className="absolute bottom-8 right-20 w-1 h-1 bg-accent rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-6 left-1/3 w-1 h-1 bg-primary rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          </div>

          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-4 md:gap-6 text-sm text-muted-foreground relative z-10 animate-slide-up">
            <nav className="flex flex-wrap items-center gap-3 md:gap-4">
              <Link to="/" className="hover:text-foreground transition-colors duration-300 hover-lift">About</Link>
              <Link to="/tools" className="hover:text-foreground transition-colors duration-300 hover-lift">Features</Link>
              <Link to="/tools" className="hover:text-foreground transition-colors duration-300 hover-lift">Tools</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors duration-300 hover-lift">Privacy Policy</Link>
            </nav>
            <p className="text-xs md:text-sm gradient-text-shimmer">
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