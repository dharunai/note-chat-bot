import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard, downloadTxt } from "@/lib/clientUtils";
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "lucide-react";

export default function CitationGenerator() {
  useMemo(() => { document.title = "Citation Generator – Note Bot AI"; }, []);
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      l.setAttribute('href', window.location.href);
      document.head.appendChild(l);
    }
  }, []);

  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<'apa'|'mla'|'chicago'|'all'>("all");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCitation = async () => {
    if (!query.trim()) {
      toast({ title: "Please enter a title, URL, or DOI", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('citations', { 
        body: { query, style } 
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const citation = style === 'apa' ? data.apa 
        : style === 'mla' ? data.mla 
        : style === 'chicago' ? data.chicago 
        : [data.apa, data.mla, data.chicago].join('\n\n');
      
      setOutput(citation);
      toast({ title: "Citation generated successfully!" });
    } catch (error: any) {
      toast({ 
        title: 'Citation generation failed', 
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
    downloadTxt('citation.txt', output);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Citation Generator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Generate properly formatted citations in APA, MLA, and Chicago styles
          </p>
        </header>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-primary" />
              Academic Citation Generator
            </CardTitle>
            <CardDescription>
              Enter a title, URL, DOI, or any source information to generate citations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium">Source Information</label>
                <Textarea 
                  placeholder="e.g., 10.1038/s41586-020-2649-2 or article title or URL..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-32"
                />
                <div className="flex gap-2 items-center">
                  <Select value={style} onValueChange={(v) => setStyle(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Citation Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      <SelectItem value="apa">APA</SelectItem>
                      <SelectItem value="mla">MLA</SelectItem>
                      <SelectItem value="chicago">Chicago</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={generateCitation} 
                    disabled={loading || !query.trim()}
                    className="flex-1"
                  >
                    {loading ? "Generating..." : "Generate Citation"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Generated Citation</label>
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
                  placeholder="Your formatted citation(s) will appear here..."
                />
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium mb-2">Supported Sources:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• DOI links (e.g., 10.1038/s41586-020-2649-2)</li>
                <li>• Article titles and journal names</li>
                <li>• Website URLs</li>
                <li>• Book titles and authors</li>
                <li>• Any academic source information</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}