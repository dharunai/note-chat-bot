import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard, downloadTxt } from "@/lib/clientUtils";
import { supabase } from "@/integrations/supabase/client";
import { Languages } from "lucide-react";

export default function Translator() {
  useMemo(() => { document.title = "AI Translator – Note Bot AI"; }, []);
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
  const [targetLang, setTargetLang] = useState("es");
  const [output, setOutput] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [loading, setLoading] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'zh', label: 'Chinese (Simplified)' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'ar', label: 'Arabic' },
    { code: 'hi', label: 'Hindi' },
    { code: 'bn', label: 'Bengali' },
    { code: 'tr', label: 'Turkish' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'th', label: 'Thai' },
    { code: 'nl', label: 'Dutch' },
    { code: 'sv', label: 'Swedish' },
    { code: 'pl', label: 'Polish' },
    { code: 'uk', label: 'Ukrainian' },
  ];

  const translate = async () => {
    if (!input.trim()) {
      toast({ title: "Please enter text to translate", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', { 
        body: { text: input, targetLang } 
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setOutput(data.translated);
      setDetectedLang(data.detected);
      toast({ title: "Text translated successfully!" });
    } catch (error: any) {
      toast({ 
        title: 'Translation failed', 
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
    downloadTxt('translation.txt', output);
  };

  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.label || code.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Translator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Translate text between 20+ languages with AI-powered accuracy
          </p>
        </header>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Text Translator
            </CardTitle>
            <CardDescription>
              Enter text and select target language for instant translation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Input Text</label>
                  {detectedLang && (
                    <span className="text-xs text-muted-foreground">
                      Detected: {getLanguageName(detectedLang)}
                    </span>
                  )}
                </div>
                <Textarea 
                  placeholder="Enter text to translate..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-48"
                />
                <div className="flex gap-2 items-center">
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Target Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={translate} 
                    disabled={loading || !input.trim()}
                    className="flex-1"
                  >
                    {loading ? "Translating..." : "Translate"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Translation ({getLanguageName(targetLang)})
                  </label>
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
                  placeholder="Translation will appear here..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}