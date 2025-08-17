import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard, downloadTxt } from "@/lib/clientUtils";
import { supabase } from "@/integrations/supabase/client";
import { ListChecks } from "lucide-react";

export default function Summarizer() {
  useMemo(() => { document.title = "AI Summarizer – Note Bot AI"; }, []);
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      l.setAttribute('href', window.location.href);
      document.head.appendChild(l);
    }
  }, []);

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<'bullets'|'paragraph'>("bullets");
  const [output, setOutput] = useState<string | string[]>("");
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    if (!input.trim()) {
      toast({ title: "Please enter text to summarize", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize', { 
        body: { text: input, mode, max_points: 6 } 
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setOutput(mode === 'bullets' ? data.bullets : data.paragraph);
      toast({ title: "Text summarized successfully!" });
    } catch (error: any) {
      toast({ 
        title: 'Summarization failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = Array.isArray(output) 
      ? output.map(b => `• ${b}`).join('\n') 
      : String(output);
    copyToClipboard(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleDownload = () => {
    const text = Array.isArray(output) 
      ? output.map(b => `• ${b}`).join('\n') 
      : String(output);
    downloadTxt('summary.txt', text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Summarizer</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform long text into concise summaries with bullet points or paragraphs
          </p>
        </header>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Text Summarizer
            </CardTitle>
            <CardDescription>
              Enter your text and choose between bullet points or paragraph format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium">Input Text</label>
                <Textarea 
                  placeholder="Paste your long text here to summarize..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-48"
                />
                <div className="flex gap-2 items-center">
                  <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullets">Bullet Points</SelectItem>
                      <SelectItem value="paragraph">Paragraph</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={summarize} 
                    disabled={loading || !input.trim()}
                    className="flex-1"
                  >
                    {loading ? "Summarizing..." : "Summarize Text"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Summary</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopy} 
                      disabled={!output}
                    >
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownload} 
                      disabled={!output}
                    >
                      Download
                    </Button>
                  </div>
                </div>
                
                {Array.isArray(output) ? (
                  <div className="border rounded-lg p-4 min-h-48 bg-muted/30">
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {output.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Textarea 
                    readOnly 
                    value={String(output)} 
                    className="min-h-48" 
                    placeholder="Your summary will appear here..."
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}