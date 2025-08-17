import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard, downloadTxt } from "@/lib/clientUtils";
import { supabase } from "@/integrations/supabase/client";
import { Shuffle } from "lucide-react";

export default function ParaphraseTool() {
  useMemo(() => { document.title = "Paraphrasing Tool – Note Bot AI"; }, []);
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
  const [tone, setTone] = useState<'formal'|'casual'|'academic'>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const paraphrase = async () => {
    if (!input.trim()) {
      toast({ title: "Please enter text to paraphrase", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('paraphrase', { 
        body: { text: input, tone } 
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setOutput(data.paraphrased);
      toast({ title: "Text paraphrased successfully!" });
    } catch (error: any) {
      toast({ 
        title: 'Paraphrasing failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    copyToClipboard(output);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleDownload = () => {
    downloadTxt('paraphrased.txt', output);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Paraphrasing Tool</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rewrite text with different tones while maintaining the original meaning
          </p>
        </header>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-primary" />
              AI Text Paraphraser
            </CardTitle>
            <CardDescription>
              Enter text and choose a tone to generate a paraphrased version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium">Original Text</label>
                <Textarea 
                  placeholder="Paste text to paraphrase..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-48"
                />
                <div className="flex gap-2 items-center">
                  <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={paraphrase} 
                    disabled={loading || !input.trim()}
                    className="flex-1"
                  >
                    {loading ? "Paraphrasing..." : "Paraphrase Text"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Paraphrased Text</label>
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
                
                <Textarea 
                  readOnly 
                  value={output} 
                  className="min-h-48" 
                  placeholder="Paraphrased text will appear here..."
                />
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium mb-2">Tone Styles:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Formal:</strong> Professional, business-appropriate language</li>
                <li>• <strong>Casual:</strong> Conversational, relaxed tone</li>
                <li>• <strong>Academic:</strong> Scholarly, research-oriented style</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}