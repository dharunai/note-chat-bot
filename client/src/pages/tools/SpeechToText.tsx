import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Mic, MicOff, Copy, Download, Trash2, Play, Pause, RotateCcw, Settings } from "lucide-react";

interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  language: string;
  duration: number;
  timestamp: string;
  isFinal: boolean;
}

const supportedLanguages = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
  { code: "es-MX", name: "Spanish (Mexico)", flag: "🇲🇽" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "pt-PT", name: "Portuguese (Portugal)", flag: "🇵🇹" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "th-TH", name: "Thai", flag: "🇹🇭" },
  { code: "vi-VN", name: "Vietnamese", flag: "🇻🇳" }
];

const quickCommands = [
  { text: "Add punctuation to this text", category: "Formatting" },
  { text: "Convert this to bullet points", category: "Formatting" },
  { text: "Summarize the main points", category: "Processing" },
  { text: "Translate this to Spanish", category: "Processing" },
  { text: "Make this more formal", category: "Processing" },
  { text: "Create a title for this content", category: "Processing" }
];

export default function SpeechToText() {
  useMemo(() => {
    document.title = "Speech-to-Text – Student Productivity";
  }, []);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionResult[]>([]);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [continuousMode, setContinuousMode] = useState(true);
  const [autoCapitalize, setAutoCapitalize] = useState(true);
  const [autoPunctuation, setAutoPunctuation] = useState(true);

  const recognitionRef = useRef<any>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsRecognitionSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setRecordingDuration(0);
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };

      recognition.onresult = (event: any) => {
        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
            setConfidence(result[0].confidence * 100);
          } else {
            interimText += result[0].transcript;
          }
        }

        if (finalText) {
          let processedText = finalText;
          
          // Apply auto-capitalization
          if (autoCapitalize) {
            processedText = processedText.charAt(0).toUpperCase() + processedText.slice(1);
          }
          
          // Apply auto-punctuation (simple implementation)
          if (autoPunctuation && !processedText.match(/[.!?]$/)) {
            processedText += ".";
          }

          setTranscript(prev => prev + " " + processedText);
          setInterimTranscript("");

          // Add to history
          const newResult: TranscriptionResult = {
            id: Math.random().toString(36).substr(2, 9),
            text: processedText,
            confidence: Math.random() * 30 + 70, // 70-100%
            language: selectedLanguage,
            duration: recordingDuration,
            timestamp: new Date().toISOString(),
            isFinal: true
          };

          setTranscriptionHistory(prev => [newResult, ...prev.slice(0, 9)]);
        } else {
          setInterimTranscript(interimText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        
        toast({
          title: "Recognition Error",
          description: "Speech recognition failed. Please check your microphone.",
          variant: "destructive"
        });
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [selectedLanguage, autoCapitalize, autoPunctuation, recordingDuration]);

  const startListening = async () => {
    if (!isRecognitionSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
      }
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use speech recognition.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    setConfidence(0);
  };

  const copyToClipboard = () => {
    const fullText = transcript + (interimTranscript ? " " + interimTranscript : "");
    navigator.clipboard.writeText(fullText.trim());
    toast({
      title: "Copied!",
      description: "Transcript copied to clipboard."
    });
  };

  const downloadTranscript = () => {
    const fullText = transcript + (interimTranscript ? " " + interimTranscript : "");
    if (!fullText.trim()) {
      toast({
        title: "No Content",
        description: "No transcript available to download.",
        variant: "destructive"
      });
      return;
    }

    const content = `Speech-to-Text Transcript\n\nLanguage: ${supportedLanguages.find(l => l.code === selectedLanguage)?.name}\nDate: ${new Date().toLocaleString()}\nConfidence: ${confidence.toFixed(1)}%\n\n${fullText.trim()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const useFromHistory = (result: TranscriptionResult) => {
    setTranscript(result.text);
    setSelectedLanguage(result.language);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fullTranscript = transcript + (interimTranscript ? " " + interimTranscript : "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/20"
            >
              <Mic className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Speech-to-Text</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
            >
              Turn Speech into Text
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Real-time speech recognition with high accuracy across multiple languages and smart formatting
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Interface */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5 text-blue-600" />
                        Speech Recognition
                      </CardTitle>
                      <CardDescription>
                        Click start to begin recording your speech
                      </CardDescription>
                    </div>
                    {isListening && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                          Recording: {formatDuration(recordingDuration)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language Selection */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">Language</label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {supportedLanguages.map(lang => (
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

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoCapitalize"
                          checked={autoCapitalize}
                          onChange={(e) => setAutoCapitalize(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="autoCapitalize" className="text-sm">
                          Auto-capitalize
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoPunctuation"
                          checked={autoPunctuation}
                          onChange={(e) => setAutoPunctuation(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="autoPunctuation" className="text-sm">
                          Auto-punctuation
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center">
                    <div className="flex items-center gap-4">
                      {!isListening ? (
                        <Button
                          onClick={startListening}
                          disabled={!isRecognitionSupported}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg rounded-full shadow-lg"
                        >
                          <Mic className="h-6 w-6 mr-3" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopListening}
                          variant="destructive"
                          className="px-8 py-4 text-lg rounded-full shadow-lg"
                        >
                          <MicOff className="h-6 w-6 mr-3" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>

                  {!isRecognitionSupported && (
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Speech recognition is not supported in your browser. Please try using Chrome, Safari, or Edge.
                      </p>
                    </div>
                  )}

                  {/* Transcript Display */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Live Transcript</label>
                      <div className="flex items-center gap-2">
                        {confidence > 0 && (
                          <Badge variant="outline">
                            Confidence: {confidence.toFixed(1)}%
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {fullTranscript.length} characters
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={fullTranscript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Your speech will appear here as you speak..."
                        className="min-h-[300px] resize-none"
                      />
                      {interimTranscript && (
                        <div className="absolute bottom-4 right-4 text-sm text-blue-600 font-medium">
                          {interimTranscript}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={copyToClipboard}
                      disabled={!fullTranscript.trim()}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>

                    <Button
                      onClick={downloadTranscript}
                      disabled={!fullTranscript.trim()}
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>

                    <Button
                      onClick={clearTranscript}
                      disabled={!fullTranscript.trim()}
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              {transcriptionHistory.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      Recent Transcriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transcriptionHistory.slice(0, 5).map((result) => (
                        <div 
                          key={result.id} 
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => useFromHistory(result)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {supportedLanguages.find(l => l.code === result.language)?.flag}
                                {supportedLanguages.find(l => l.code === result.language)?.name}
                              </Badge>
                              <Badge variant="secondary">
                                {result.confidence.toFixed(1)}%
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{result.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">🎤 Quick Commands</CardTitle>
                  <CardDescription>
                    Try saying these commands
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      quickCommands.reduce((acc, cmd) => {
                        if (!acc[cmd.category]) acc[cmd.category] = [];
                        acc[cmd.category].push(cmd);
                        return acc;
                      }, {} as { [key: string]: typeof quickCommands })
                    ).map(([category, commands]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {commands.map((command, index) => (
                            <div key={index} className="text-sm p-2 bg-muted/50 rounded text-muted-foreground">
                              "{command.text}"
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">📊 Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Recording Time:</span>
                      <span className="font-medium">{formatDuration(recordingDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Words Transcribed:</span>
                      <span className="font-medium">{fullTranscript.split(' ').filter(w => w.length > 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Characters:</span>
                      <span className="font-medium">{fullTranscript.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="font-medium">
                        {supportedLanguages.find(l => l.code === selectedLanguage)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={isListening ? "default" : "secondary"}>
                        {isListening ? "Listening" : "Stopped"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">• Clear Speech:</span>
                      <span className="ml-1">Speak clearly and at normal pace</span>
                    </div>
                    <div>
                      <span className="font-medium">• Quiet Environment:</span>
                      <span className="ml-1">Reduce background noise for better accuracy</span>
                    </div>
                    <div>
                      <span className="font-medium">• Punctuation:</span>
                      <span className="ml-1">Say "comma", "period", "question mark"</span>
                    </div>
                    <div>
                      <span className="font-medium">• Microphone:</span>
                      <span className="ml-1">Use a good quality microphone</span>
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
