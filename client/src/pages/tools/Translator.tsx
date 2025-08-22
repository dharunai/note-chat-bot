import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/clientUtils';
import { Languages, Copy, Loader2, ArrowRight } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' }
];

export default function Translator() {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text to translate',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          targetLang 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate');
      }

      const data = await response.json();
      setTranslatedText(data.translated);
      setDetectedLang(data.detected || '');
      setProvider(data.provider || '');
      
      toast({
        title: 'Translation Complete',
        description: 'Your text has been translated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to translate text',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Floating text animations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-text text-6xl font-bold text-primary/5 absolute top-20 left-10 animate-float">TRANSLATE</div>
        <div className="floating-text text-4xl font-bold text-accent/5 absolute top-40 right-20 animate-float-delayed">LANGUAGE</div>
        <div className="floating-text text-5xl font-bold text-primary/5 absolute bottom-32 left-20 animate-float-slow">GLOBAL</div>
        <div className="floating-text text-3xl font-bold text-accent/5 absolute bottom-20 right-10 animate-bounce-slow">AI</div>
      </div>
      
      <TopNav />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2 animate-slide-in-up">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              <Languages className="h-8 w-8 text-primary" />
              AI Language Translator
            </h1>
            <p className="text-muted-foreground text-lg">
              Translate text between multiple languages with AI precision
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-xl border-primary/10 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl">Source Text</CardTitle>
                <CardDescription>
                  Enter text in any language to translate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter text to translate..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px]"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Translate to</label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleTranslate} 
                  disabled={loading || !inputText.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="h-4 w-4 mr-2" />
                      Translate
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="backdrop-blur-sm bg-card/80 shadow-xl border-primary/10 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-2xl">
                  Translation Result
                  {provider && (
                    <Badge variant="secondary" className="text-xs">
                      Powered by {provider}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {detectedLang && translatedText && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>{getLanguageName(detectedLang)}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{getLanguageName(targetLang)}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={translatedText}
                  placeholder="Translation will appear here..."
                  className="min-h-[300px]"
                  readOnly
                />
                
                {translatedText && (
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(translatedText)}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Translation
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}