import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Volume2, Play, Pause, Download, Upload, Copy, RotateCcw, Mic, Settings } from "lucide-react";

interface VoiceOption {
  name: string;
  lang: string;
  gender: "male" | "female";
  accent?: string;
  premium?: boolean;
}

interface AudioHistory {
  id: string;
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  timestamp: string;
  audioUrl?: string;
}

const sampleTexts = [
  {
    category: "Educational",
    texts: [
      "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
      "Welcome to our presentation. Today we will explore the fascinating world of artificial intelligence and its applications in modern education.",
      "In conclusion, the research demonstrates significant improvements in student engagement through interactive learning technologies."
    ]
  },
  {
    category: "Professional",
    texts: [
      "Good morning team. I hope everyone is doing well. Let's begin today's meeting with a review of our quarterly objectives.",
      "Thank you for your time and consideration. I look forward to hearing from you soon regarding this proposal.",
      "Please note that all submissions must be completed by the deadline specified in the guidelines."
    ]
  },
  {
    category: "Creative",
    texts: [
      "Once upon a time, in a land far, far away, there lived a curious young explorer who dreamed of discovering new worlds.",
      "The sunset painted the sky in brilliant shades of orange and pink, casting a magical glow over the peaceful village below.",
      "With determination in her heart and courage in her soul, she took the first step on her incredible journey."
    ]
  }
];

export default function TextToSpeech() {
  useMemo(() => {
    document.title = "Text-to-Speech – Student Productivity";
  }, []);

  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioHistory, setAudioHistory] = useState<AudioHistory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useMemo(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          setSelectedVoice(voices[0].name);
        }
      };

      loadVoices();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, [selectedVoice]);

  const speak = () => {
    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to convert to speech.",
        variant: "destructive"
      });
      return;
    }

    if (!synthRef.current) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = availableVoices.find(v => v.name === selectedVoice);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsPlaying(false);
      setIsPaused(false);
      toast({
        title: "Speech Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive"
      });
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const pauseResume = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const generateAudioFile = async () => {
    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to generate audio file.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate audio file generation (in real implementation, use Web Audio API or server-side TTS)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const audioItem: AudioHistory = {
        id: Math.random().toString(36).substr(2, 9),
        text: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
        voice: selectedVoice,
        speed,
        pitch,
        timestamp: new Date().toISOString(),
        audioUrl: "mock-audio-url" // In real implementation, this would be a blob URL
      };

      setAudioHistory(prev => [audioItem, ...prev.slice(0, 9)]);

      toast({
        title: "Audio Generated!",
        description: "Audio file has been generated and added to history."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate audio file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = (audioItem: AudioHistory) => {
    // Mock download - in real implementation, would download the actual audio file
    const mockAudio = new Blob(["mock audio data"], { type: "audio/mp3" });
    const url = URL.createObjectURL(mockAudio);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tts_${audioItem.id}.mp3`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Audio file has been downloaded."
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard."
    });
  };

  const useSampleText = (sampleText: string) => {
    setText(sampleText);
  };

  const resetSettings = () => {
    setSpeed(1.0);
    setPitch(1.0);
    setVolume(1.0);
  };

  const clearHistory = () => {
    setAudioHistory([]);
  };

  const getVoiceDisplayName = (voice: SpeechSynthesisVoice) => {
    return `${voice.name} (${voice.lang})`;
  };

  const getVoiceFlag = (lang: string) => {
    const flagMap: { [key: string]: string } = {
      'en-US': '🇺🇸', 'en-GB': '🇬🇧', 'en-AU': '🇦🇺', 'en-CA': '🇨🇦',
      'es-ES': '🇪🇸', 'es-MX': '🇲🇽', 'fr-FR': '🇫🇷', 'fr-CA': '🇨🇦',
      'de-DE': '🇩🇪', 'it-IT': '🇮🇹', 'pt-BR': '🇧🇷', 'pt-PT': '🇵🇹',
      'ja-JP': '🇯🇵', 'ko-KR': '🇰🇷', 'zh-CN': '🇨🇳', 'zh-TW': '🇹🇼',
      'ru-RU': '🇷🇺', 'ar-SA': '🇸🇦', 'hi-IN': '🇮🇳', 'th-TH': '🇹🇭'
    };
    return flagMap[lang] || '🌐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-500/20"
            >
              <Volume2 className="h-6 w-6 text-emerald-600" />
              <span className="text-sm font-medium">Text-to-Speech</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            >
              Give Voice to Your Words
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Convert any text to natural-sounding speech with customizable voices, speed, and tone
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
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-emerald-600" />
                    Text Input
                  </CardTitle>
                  <CardDescription>
                    Enter or paste the text you want to convert to speech
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Text to Convert</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {text.length}/5000
                        </span>
                        {text && (
                          <Button
                            onClick={copyToClipboard}
                            variant="ghost"
                            size="sm"
                            className="h-6 p-1"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, 5000))}
                      placeholder="Enter the text you want to convert to speech..."
                      className="min-h-[200px] resize-none"
                    />
                  </div>

                  {/* Voice and Settings */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Voice</label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableVoices.map((voice, index) => (
                            <SelectItem key={index} value={voice.name}>
                              <div className="flex items-center gap-2">
                                <span>{getVoiceFlag(voice.lang)}</span>
                                <span>{getVoiceDisplayName(voice)}</span>
                                {voice.localService === false && (
                                  <Badge variant="secondary" className="text-xs">Cloud</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">Speed</label>
                          <span className="text-sm text-muted-foreground">{speed.toFixed(1)}x</span>
                        </div>
                        <Slider
                          value={[speed]}
                          onValueChange={(value) => setSpeed(value[0])}
                          max={2.0}
                          min={0.5}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Pitch</label>
                        <span className="text-sm text-muted-foreground">{pitch.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[pitch]}
                        onValueChange={(value) => setPitch(value[0])}
                        max={2.0}
                        min={0.5}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Volume</label>
                        <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                      </div>
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        max={1.0}
                        min={0.1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={speak}
                      disabled={isPlaying || !text.trim()}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Speak
                    </Button>

                    {isPlaying && (
                      <Button
                        onClick={pauseResume}
                        variant="outline"
                      >
                        {isPaused ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        )}
                      </Button>
                    )}

                    {isPlaying && (
                      <Button onClick={stop} variant="destructive">
                        Stop
                      </Button>
                    )}

                    <Button
                      onClick={generateAudioFile}
                      disabled={isGenerating || !text.trim()}
                      variant="outline"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="spinner"></div>
                          Generating...
                        </div>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Generate Audio
                        </>
                      )}
                    </Button>

                    <Button onClick={resetSettings} variant="ghost" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Audio History */}
              {audioHistory.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        Generated Audio Files
                      </CardTitle>
                      <Button onClick={clearHistory} variant="ghost" size="sm">
                        Clear History
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {audioHistory.map((audio) => (
                        <div key={audio.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{audio.text}</p>
                              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                <span>Voice: {audio.voice}</span>
                                <span>Speed: {audio.speed}x</span>
                                <span>Pitch: {audio.pitch}</span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(audio.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <Button
                            onClick={() => downloadAudio(audio)}
                            size="sm"
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download MP3
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sample Texts & Info */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">📝 Sample Texts</CardTitle>
                  <CardDescription>
                    Click to use example texts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sampleTexts.map((category) => (
                      <div key={category.category}>
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                          {category.category}
                        </h4>
                        <div className="space-y-2">
                          {category.texts.map((sampleText, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              onClick={() => useSampleText(sampleText)}
                              className="w-full text-left justify-start h-auto p-2 text-sm leading-relaxed"
                            >
                              {sampleText.slice(0, 80) + (sampleText.length > 80 ? "..." : "")}
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
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Voice Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Available Voices:</span>
                      <span className="ml-2">{availableVoices.length}</span>
                    </div>
                    <div>
                      <span className="font-medium">Languages:</span>
                      <span className="ml-2">{new Set(availableVoices.map(v => v.lang)).size}</span>
                    </div>
                    <div>
                      <span className="font-medium">Current Status:</span>
                      <Badge variant={isPlaying ? "default" : "secondary"} className="ml-2">
                        {isPlaying ? (isPaused ? "Paused" : "Playing") : "Ready"}
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
                      <span className="font-medium">• Punctuation:</span>
                      <span className="ml-1">Use commas and periods for natural pauses</span>
                    </div>
                    <div>
                      <span className="font-medium">• Speed:</span>
                      <span className="ml-1">0.8x for learning, 1.2x for quick playback</span>
                    </div>
                    <div>
                      <span className="font-medium">• Voices:</span>
                      <span className="ml-1">Try different voices for variety</span>
                    </div>
                    <div>
                      <span className="font-medium">• Length:</span>
                      <span className="ml-1">Shorter texts work better for mobile</span>
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
