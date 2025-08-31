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
        <section className="relative text-center mb-6 py-8 md:py-12 tool-hero-section rounded-xl md:rounded-2xl overflow-hidden">
          {/* Floating keywords - properly distributed */}
          {floatingKeywords.map((keyword, index) => {
            const positions = [
              'top-4 left-6',      // top-left
              'top-6 right-8',     // top-right  
              'bottom-6 left-8',   // bottom-left
              'bottom-4 right-6',  // bottom-right
              'top-1/2 left-4 -translate-y-1/2',  // center-left
              'top-1/2 right-4 -translate-y-1/2'  // center-right
            ];
            const delays = ['0s', '1s', '2s', '0.5s', '1.5s', '2.5s'];
            const opacities = ['opacity-60', 'opacity-50', 'opacity-70', 'opacity-40', 'opacity-50', 'opacity-60'];
            const colors = ['text-primary/70', 'text-accent/70', 'text-primary-glow/70', 'text-accent/80', 'text-primary/60', 'text-accent/60'];
            
            return (
              <div 
                key={index} 
                className={`absolute ${positions[index % positions.length]} text-sm font-medium ${colors[index % colors.length]} ${opacities[index % opacities.length]} animate-pulse pointer-events-none select-none whitespace-nowrap`}
                style={{animationDelay: delays[index % delays.length]}}
              >
                {keyword}
              </div>
            );
          })}

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4 animate-fade-in opacity-0 animate-stagger-1">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mr-3 hover-glow">
                {heroIcon}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text-shimmer">
                {heroTitle}
              </h1>
            </div>
          </div>
        </section>

        {/* Description moved outside and below the hero box */}
        <div className="text-center mb-8">
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto animate-fade-in opacity-0 animate-stagger-2">
            {heroDescription}
          </p>
        </div>

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