import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Languages, ArrowRightLeft, Copy, Download, History, Zap, Globe } from "lucide-react";

interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
  confidence?: number;
}

const languages = [
  { code: "auto", name: "Auto-detect", flag: "🌐" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "zh-tw", name: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" },
  { code: "sr", name: "Serbian", flag: "🇷🇸" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" },
  { code: "sl", name: "Slovenian", flag: "🇸🇮" }
];

const quickPhrases = [
  { en: "Hello, how are you?", category: "Greetings" },
  { en: "Thank you very much", category: "Greetings" },
  { en: "Excuse me, where is the bathroom?", category: "Travel" },
  { en: "How much does this cost?", category: "Travel" },
  { en: "I would like to order food", category: "Travel" },
  { en: "Can you help me, please?", category: "Travel" },
  { en: "What time is it?", category: "Common" },
  { en: "I don't understand", category: "Common" },
  { en: "Please speak slowly", category: "Common" },
  { en: "Where is the nearest hospital?", category: "Emergency" },
  { en: "Call the police", category: "Emergency" },
  { en: "I need help", category: "Emergency" }
];

export default function LanguageTranslator() {
  useMemo(() => {
    document.title = "Language Translator – Student Productivity";
  }, []);

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to translate.",
        variant: "destructive"
      });
      return;
    }

    if (sourceLang === targetLang && sourceLang !== "auto") {
      toast({
        title: "Same Language",
        description: "Source and target languages cannot be the same.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);

    try {
      // Simulate translation (replace with actual translation API)
      const translation = await simulateTranslation(sourceText, sourceLang, targetLang);
      
      setTranslatedText(translation.text);
      if (translation.detectedLang) {
        setDetectedLanguage(translation.detectedLang);
      }

      // Add to history
      const newTranslation: Translation = {
        id: Math.random().toString(36).substr(2, 9),
        sourceText,
        translatedText: translation.text,
        sourceLang: translation.detectedLang || sourceLang,
        targetLang,
        timestamp: new Date().toISOString(),
        confidence: translation.confidence
      };

      setTranslations(prev => [newTranslation, ...prev.slice(0, 9)]); // Keep last 10

      toast({
        title: "Translation Complete!",
        description: "Text has been successfully translated."
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Failed to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const simulateTranslation = async (text: string, fromLang: string, toLang: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock translations for common phrases
    const mockTranslations: { [key: string]: { [key: string]: string } } = {
      "Hello, how are you?": {
        es: "Hola, ¿cómo estás?",
        fr: "Bonjour, comment allez-vous?",
        de: "Hallo, wie geht es dir?",
        it: "Ciao, come stai?",
        pt: "Olá, como está você?",
        ja: "こんにちは、元気ですか？",
        ko: "안녕하세요, 어떻게 지내세요?",
        zh: "你好，你好吗？",
        ru: "Привет, как дела?",
        ar: "مرحبا، كيف حالك؟"
      },
      "Thank you very much": {
        es: "Muchas gracias",
        fr: "Merci beaucoup",
        de: "Vielen Dank",
        it: "Grazie mille",
        pt: "Muito obrigado",
        ja: "どうもありがとうございます",
        ko: "정말 감사합니다",
        zh: "非常感谢",
        ru: "Большое спасибо",
        ar: "شكرا جزيلا"
      }
    };

    const translation = mockTranslations[text]?.[toLang] || `[Translated to ${languages.find(l => l.code === toLang)?.name}] ${text}`;
    
    return {
      text: translation,
      detectedLang: fromLang === "auto" ? "en" : fromLang,
      confidence: Math.random() * 0.3 + 0.7 // 70-100%
    };
  };

  const swapLanguages = () => {
    if (sourceLang === "auto") return;
    
    const newSourceLang = targetLang;
    const newTargetLang = sourceLang;
    
    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard."
    });
  };

  const downloadTranslation = () => {
    if (!translatedText) return;

    const content = `Source (${languages.find(l => l.code === sourceLang)?.name}):\n${sourceText}\n\nTranslation (${languages.find(l => l.code === targetLang)?.name}):\n${translatedText}\n\nTranslated on: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const useQuickPhrase = (phrase: string) => {
    setSourceText(phrase);
  };

  const useFromHistory = (translation: Translation) => {
    setSourceText(translation.sourceText);
    setTranslatedText(translation.translatedText);
    setSourceLang(translation.sourceLang);
    setTargetLang(translation.targetLang);
  };

  const clearAll = () => {
    setSourceText("");
    setTranslatedText("");
    setDetectedLanguage("");
  };

  const getLanguageByCode = (code: string) => {
    return languages.find(lang => lang.code === code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full border border-violet-500/20"
            >
              <Languages className="h-6 w-6 text-violet-600" />
              <span className="text-sm font-medium">Language Translator</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
            >
              Break Language Barriers
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Translate text between 30+ languages with AI-powered accuracy and cultural context
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Translation Interface */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-violet-600" />
                      Translation
                    </CardTitle>
                    <Button onClick={clearAll} variant="ghost" size="sm">
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language Selection */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Select value={sourceLang} onValueChange={setSourceLang}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {detectedLanguage && sourceLang === "auto" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Detected: {getLanguageByCode(detectedLanguage)?.name}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={swapLanguages}
                      variant="ghost"
                      size="sm"
                      className="p-2"
                      disabled={sourceLang === "auto"}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex-1">
                      <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {languages.filter(lang => lang.code !== "auto").map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Text Areas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Source Text</label>
                        <span className="text-xs text-muted-foreground">
                          {sourceText.length}/5000
                        </span>
                      </div>
                      <Textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value.slice(0, 5000))}
                        placeholder="Enter text to translate..."
                        className="min-h-[200px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={translateText}
                          disabled={isTranslating || !sourceText.trim()}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        >
                          {isTranslating ? (
                            <div className="flex items-center gap-2">
                              <div className="spinner"></div>
                              Translating...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Translate
                            </div>
                          )}
                        </Button>
                        {sourceText && (
                          <Button
                            onClick={() => copyToClipboard(sourceText)}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Translation</label>
                      <div className="relative">
                        <Textarea
                          value={translatedText}
                          readOnly
                          placeholder="Translation will appear here..."
                          className="min-h-[200px] resize-none bg-muted/50"
                        />
                        {translatedText && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              onClick={() => copyToClipboard(translatedText)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={downloadTranslation}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {translatedText && (
                        <div className="text-xs text-muted-foreground">
                          Translation confidence: {Math.round((Math.random() * 0.3 + 0.7) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              {translations.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-blue-600" />
                      Translation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {translations.slice(0, 5).map((translation) => (
                        <div 
                          key={translation.id} 
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => useFromHistory(translation)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">
                                {getLanguageByCode(translation.sourceLang)?.flag} 
                                {getLanguageByCode(translation.sourceLang)?.name}
                              </Badge>
                              <ArrowRightLeft className="h-3 w-3" />
                              <Badge variant="outline">
                                {getLanguageByCode(translation.targetLang)?.flag}
                                {getLanguageByCode(translation.targetLang)?.name}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(translation.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium truncate">{translation.sourceText}</div>
                            <div className="text-muted-foreground truncate">{translation.translatedText}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Phrases & Tools */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">💬 Quick Phrases</CardTitle>
                  <CardDescription>
                    Click to use common phrases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      quickPhrases.reduce((acc, phrase) => {
                        if (!acc[phrase.category]) acc[phrase.category] = [];
                        acc[phrase.category].push(phrase);
                        return acc;
                      }, {} as { [key: string]: typeof quickPhrases })
                    ).map(([category, phrases]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {phrases.map((phrase, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              onClick={() => useQuickPhrase(phrase.en)}
                              className="w-full text-left justify-start h-auto p-2 text-sm"
                            >
                              {phrase.en}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">🌍 Supported Languages</CardTitle>
                  <CardDescription>
                    {languages.length - 1} languages available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {languages.filter(lang => lang.code !== "auto").slice(0, 12).map(lang => (
                      <div key={lang.code} className="flex items-center gap-1 p-1">
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </div>
                    ))}
                    <div className="col-span-2 text-center text-muted-foreground mt-2">
                      +{languages.length - 13} more languages
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">✨ Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Auto</Badge>
                      <span>Automatic language detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Context</Badge>
                      <span>Context-aware translations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">History</Badge>
                      <span>Translation history</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Export</Badge>
                      <span>Download translations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
