import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/clientUtils';
import { Languages, Copy, Loader2, ArrowRight } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';

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

  const inputContent = (
    <>
      <Textarea
        placeholder="Enter text to translate..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="min-h-[300px] resize-none"
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
        className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Translating...
          </>
        ) : (
          <>
            <Languages className="w-4 h-4 mr-2" />
            Translate
          </>
        )}
      </Button>
    </>
  );

  const outputContent = (
    <>
      <Textarea
        value={translatedText}
        placeholder="Translation will appear here..."
        className="min-h-[300px] resize-none"
        readOnly
      />

      {translatedText && (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(translatedText)}
            className="flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
          >
            <Copy className="w-3 h-3" />
            Copy Translation
          </Button>
          {detectedLang && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{getLanguageName(detectedLang)}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{getLanguageName(targetLang)}</span>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <ToolLayout
      pageTitle="AI Language Translator"
      pageDescription="Translate text between multiple languages with AI precision"
      heroIcon={<Languages className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
      heroTitle="AI Language Translator"
      heroDescription="Translate text between multiple languages with AI precision"
      floatingKeywords={['Translate', 'Language', 'Global', 'Multilingual', 'Convert', 'Communicate']}
      inputTitle="Source Text"
      inputDescription="Enter text in any language to translate"
      inputChildren={inputContent}
      outputTitle="Translation Result"
      outputDescription="AI-translated text in your target language"
      outputChildren={outputContent}
      provider={provider}
    />
  );
}