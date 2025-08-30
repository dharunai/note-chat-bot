import { type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TopNav from '@/components/navigation/TopNav';
import { Badge } from '../ui/badge';

interface ToolLayoutProps {
  pageTitle: string;
  pageDescription: ReactNode;
  heroIcon: ReactNode;
  heroTitle: string;
  heroDescription: string;
  floatingKeywords?: string[];
  inputTitle: string;
  inputDescription: string;
  inputChildren: ReactNode;
  outputTitle: string;
  outputDescription: string;
  outputChildren: ReactNode;
  provider?: string;
}

export default function ToolLayout({
  pageTitle,
  pageDescription,
  heroIcon,
  heroTitle,
  heroDescription,
  floatingKeywords = [],
  inputTitle,
  inputDescription,
  inputChildren,
  outputTitle,
  outputDescription,
  outputChildren,
  provider,
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Enhanced Hero Section */}
        <section className="relative text-center mb-8 md:mb-12 py-8 md:py-12 tool-hero-section rounded-xl md:rounded-2xl">
          {/* Floating keywords */}
          {floatingKeywords.map((keyword, index) => (
            <div key={index} className={`floating-text floating-text-${index + 1}`}>
              {keyword}
            </div>
          ))}

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4 animate-fade-in opacity-0 animate-stagger-1">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mr-3 hover-glow">
                {heroIcon}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text-shimmer">
                {heroTitle}
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto animate-fade-in opacity-0 animate-stagger-2">
              {heroDescription}
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="tool-card-enhanced shadow-elegant border-2 border-border/50 hover:border-primary/30 animate-fade-in-scale opacity-0 animate-stagger-3">
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 hover-glow">
                  {heroIcon}
                </div>
                {inputTitle}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {inputDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {inputChildren}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="tool-card-enhanced shadow-elegant border-2 border-border/50 hover:border-primary/30 animate-fade-in-scale opacity-0 animate-stagger-4">
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-accent/20 to-primary/20 hover-glow">
                    {heroIcon}
                  </div>
                  {outputTitle}
                </div>
                {provider && (
                  <Badge variant="secondary" className="text-xs">
                    Powered by {provider}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {outputDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {outputChildren}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}