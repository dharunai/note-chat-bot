import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { PenTool, Copy, Download, Loader2 } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';

export default function ParaphraseTool() {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState<'standard' | 'academic' | 'simple' | 'creative'>('standard');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text to paraphrase',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          style 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to paraphrase');
      }

      const data = await response.json();
      setParaphrasedText(data.paraphrased);
      setProvider(data.provider || '');

      toast({
        title: 'Text Paraphrased',
        description: 'Your text has been rewritten successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to paraphrase text',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Enhanced Hero Section */}
        <section className="relative text-center mb-8 md:mb-12 py-8 md:py-12 tool-hero-section rounded-xl md:rounded-2xl">
          {/* Floating keywords related to paraphrasing */}
          <div className="floating-text floating-text-1">Rewrite</div>
          <div className="floating-text floating-text-2">Clarity</div>
          <div className="floating-text floating-text-3">Style</div>
          <div className="floating-text floating-text-4">Academic</div>
          <div className="floating-text floating-text-5">Creative</div>
          <div className="floating-text floating-text-6">Enhanced</div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4 animate-fade-in opacity-0 animate-stagger-1">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mr-3 hover-glow">
                <PenTool className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text-shimmer">
                AI Paraphrasing Tool
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto animate-fade-in opacity-0 animate-stagger-2">
              Rewrite your text with different styles while maintaining the original meaning
            </p>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="tool-card-enhanced shadow-elegant border-2 border-border/50 hover:border-primary/30 animate-fade-in-scale opacity-0 animate-stagger-3">
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 hover-glow">
                  <PenTool className="w-5 h-5 text-primary" />
                </div>
                Paraphrase Your Text
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose your writing style and let AI rewrite your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <Textarea
                placeholder="Paste your text here to paraphrase..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] resize-none"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Writing Style</label>
                <Select value={style} onValueChange={(value) => setStyle(value as 'standard' | 'academic' | 'simple' | 'creative')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleParaphrase}
                disabled={loading || !inputText.trim()}
                className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Paraphrasing...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Paraphrase Text
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="tool-card-enhanced shadow-elegant border-2 border-border/50 hover:border-primary/30 animate-fade-in-scale opacity-0 animate-stagger-4">
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-accent/20 to-primary/20 hover-glow">
                    <Copy className="w-5 h-5 text-accent" />
                  </div>
                  Paraphrased Text
                </div>
                {provider && (
                  <Badge variant="secondary" className="text-xs">
                    Powered by {provider}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                AI-rewritten version of your original text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <Textarea
                value={paraphrasedText}
                placeholder="Paraphrased text will appear here..."
                className="min-h-[300px] resize-none"
                readOnly
              />

              {paraphrasedText && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(paraphrasedText)}
                    className="flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTxt(paraphrasedText, 'paraphrased-text.txt')}
                    className="flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}