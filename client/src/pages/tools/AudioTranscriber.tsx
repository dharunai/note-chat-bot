import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Mic, Play, Pause, FileText, Clock, Speaker } from "lucide-react";
import FileDropZone from "@/components/tools/FileDropZone";

interface TranscriptionResult {
  id: string;
  fileName: string;
  text: string;
  duration: number;
  timestamp: string;
  confidence?: number;
  language?: string;
}

type TranscriptionQuality = "standard" | "enhanced" | "premium";
type OutputFormat = "text" | "srt" | "vtt" | "json";

const qualityOptions = [
  { value: "standard", label: "Standard", description: "Basic transcription, faster processing" },
  { value: "enhanced", label: "Enhanced", description: "Better accuracy, speaker detection" },
  { value: "premium", label: "Premium", description: "Highest accuracy, punctuation, timestamps" }
];

const outputFormats = [
  { value: "text", label: "Plain Text (.txt)", description: "Simple text format" },
  { value: "srt", label: "SRT Subtitles (.srt)", description: "Standard subtitle format" },
  { value: "vtt", label: "WebVTT (.vtt)", description: "Web video text tracks" },
  { value: "json", label: "JSON (.json)", description: "Structured data with metadata" }
];

const supportedLanguages = [
  { code: "auto", name: "Auto-detect" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" }
];

export default function AudioTranscriber() {
  useMemo(() => {
    document.title = "Audio Transcriber – Student Productivity";
  }, []);

  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<string>("");
  const [quality, setQuality] = useState<TranscriptionQuality>("enhanced");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("text");
  const [language, setLanguage] = useState("auto");
  const [speakerSeparation, setSpeakerSeparation] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const onDrop = (files: File[]) => {
    const audioFileTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/flac', 'video/mp4', 'video/webm'];
    const validFiles = files.filter(file => 
      audioFileTypes.some(type => file.type.includes(type.split('/')[1])) ||
      file.name.toLowerCase().match(/\.(mp3|wav|m4a|ogg|flac|mp4|webm|avi|mov)$/)
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please only upload audio or video files.",
        variant: "destructive"
      });
    }
    
    setAudioFiles([...audioFiles, ...validFiles]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
        setAudioFiles([...audioFiles, file]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Store timer reference
      (recorder as any).timer = timer;
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      clearInterval((mediaRecorder as any).timer);
      setIsRecording(false);
      setMediaRecorder(null);
      setRecordingTime(0);
    }
  };

  const transcribeAudio = async () => {
    if (audioFiles.length === 0) {
      toast({
        title: "No Audio Files",
        description: "Please upload audio files or record audio to transcribe.",
        variant: "destructive"
      });
      return;
    }

    setIsTranscribing(true);
    const newTranscriptions: TranscriptionResult[] = [];

    try {
      for (const file of audioFiles) {
        setCurrentProcessing(file.name);
        
        // Simulate transcription process (replace with actual API call)
        const transcription = await simulateTranscription(file);
        newTranscriptions.push(transcription);
      }

      setTranscriptions([...transcriptions, ...newTranscriptions]);
      toast({
        title: "Transcription Complete!",
        description: `Successfully transcribed ${newTranscriptions.length} file(s).`
      });
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
      setCurrentProcessing("");
    }
  };

  const simulateTranscription = async (file: File): Promise<TranscriptionResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transcription results
    const mockTexts = [
      "Welcome to this presentation. Today we'll be discussing the impact of artificial intelligence on modern education. AI has revolutionized how students learn and teachers instruct.",
      "In this lecture, we're examining the fundamentals of quantum physics. Quantum mechanics describes the behavior of matter and energy at the molecular, atomic, nuclear, and even smaller microscopic levels.",
      "This recording covers our team meeting from today. We discussed project timelines, budget allocations, and resource requirements for the upcoming quarter.",
      "Good morning everyone. In today's class, we'll explore the history of the Renaissance period, focusing on its cultural, artistic, and scientific developments in Europe.",
      "This is a sample audio recording for testing transcription accuracy. The quick brown fox jumps over the lazy dog. Testing one, two, three."
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      text: randomText,
      duration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
      timestamp: new Date().toISOString(),
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      language: language === "auto" ? "en" : language
    };
  };

  const downloadTranscription = (transcription: TranscriptionResult) => {
    let content = "";
    let filename = "";
    let mimeType = "";

    switch (outputFormat) {
      case "text":
        content = transcription.text;
        filename = `${transcription.fileName}_transcript.txt`;
        mimeType = "text/plain";
        break;
      
      case "srt":
        content = generateSRT(transcription);
        filename = `${transcription.fileName}_subtitles.srt`;
        mimeType = "text/plain";
        break;
      
      case "vtt":
        content = generateVTT(transcription);
        filename = `${transcription.fileName}_subtitles.vtt`;
        mimeType = "text/vtt";
        break;
      
      case "json":
        content = JSON.stringify(transcription, null, 2);
        filename = `${transcription.fileName}_transcript.json`;
        mimeType = "application/json";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSRT = (transcription: TranscriptionResult): string => {
    const words = transcription.text.split(' ');
    const wordsPerSubtitle = 10;
    const secondsPerWord = transcription.duration / words.length;
    
    let srt = "";
    let subtitleIndex = 1;
    
    for (let i = 0; i < words.length; i += wordsPerSubtitle) {
      const startTime = formatTime(i * secondsPerWord);
      const endTime = formatTime(Math.min((i + wordsPerSubtitle) * secondsPerWord, transcription.duration));
      const text = words.slice(i, i + wordsPerSubtitle).join(' ');
      
      srt += `${subtitleIndex}\n${startTime} --> ${endTime}\n${text}\n\n`;
      subtitleIndex++;
    }
    
    return srt;
  };

  const generateVTT = (transcription: TranscriptionResult): string => {
    const srt = generateSRT(transcription);
    return "WEBVTT\n\n" + srt.replace(/(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g, 
      '$2 --> $3');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const removeFile = (index: number) => {
    setAudioFiles(audioFiles.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setAudioFiles([]);
    setTranscriptions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/20"
            >
              <Mic className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Audio Transcriber</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Convert Audio to Text
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Transcribe lectures, meetings, interviews, and any audio content with AI-powered accuracy
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload & Settings */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-purple-600" />
                    Audio Input
                  </CardTitle>
                  <CardDescription>
                    Upload files or record directly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileDropZone
                    accept={{
                      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac"],
                      "video/*": [".mp4", ".webm", ".avi", ".mov"]
                    }}
                    multiple={true}
                    onDrop={onDrop}
                    className="border-2 border-dashed border-purple-500/50 rounded-xl p-6 text-center hover:border-purple-500 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Drop Audio/Video Files</p>
                        <p className="text-sm text-muted-foreground">
                          MP3, WAV, M4A, MP4, WebM up to 100MB
                        </p>
                      </div>
                    </div>
                  </FileDropZone>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className="w-full"
                    >
                      {isRecording ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          Stop Recording ({formatDuration(recordingTime)})
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          Start Recording
                        </div>
                      )}
                    </Button>
                  </div>

                  {audioFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Files ({audioFiles.length})</p>
                        <Button size="sm" variant="ghost" onClick={clearAll}>
                          Clear All
                        </Button>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {audioFiles.map((file, index) => (
                          <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                            <span className="truncate">{file.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(index)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Speaker className="h-5 w-5 text-pink-600" />
                    Transcription Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quality Level</Label>
                    <Select value={quality} onValueChange={(value: TranscriptionQuality) => setQuality(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {outputFormats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            <div>
                              <div className="font-medium">{format.label}</div>
                              <div className="text-sm text-muted-foreground">{format.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="timestamps"
                        checked={includeTimestamps}
                        onChange={(e) => setIncludeTimestamps(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Label htmlFor="timestamps" className="text-sm">
                        Include timestamps
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="speakers"
                        checked={speakerSeparation}
                        onChange={(e) => setSpeakerSeparation(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Label htmlFor="speakers" className="text-sm">
                        Separate speakers
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={transcribeAudio}
                disabled={isTranscribing || audioFiles.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                {isTranscribing ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Transcribing {currentProcessing}...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Start Transcription
                  </div>
                )}
              </Button>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Transcriptions
                      </CardTitle>
                      <CardDescription>
                        Your transcribed text ready for download
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {transcriptions.length > 0 ? (
                    <div className="space-y-6">
                      {transcriptions.map((transcription) => (
                        <div key={transcription.id} className="border rounded-lg p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{transcription.fileName}</h4>
                              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(transcription.duration)}
                                </span>
                                {transcription.confidence && (
                                  <span>
                                    Confidence: {Math.round(transcription.confidence * 100)}%
                                  </span>
                                )}
                                {transcription.language && (
                                  <span>
                                    Language: {supportedLanguages.find(l => l.code === transcription.language)?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => downloadTranscription(transcription)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download {outputFormat.toUpperCase()}
                            </Button>
                          </div>
                          
                          <div className="bg-muted rounded-lg p-4">
                            <h5 className="font-medium mb-2">Transcription:</h5>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {transcription.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                      <Mic className="h-16 w-16 mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Transcriptions Yet</h3>
                      <p className="text-sm max-w-md">
                        Upload audio files or record directly, then click "Start Transcription" to see your results here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Supported Formats</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Audio</Badge>
                          <span className="text-sm text-muted-foreground">MP3, WAV, M4A, OGG, FLAC</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Video</Badge>
                          <span className="text-sm text-muted-foreground">MP4, WebM, AVI, MOV</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Live</Badge>
                          <span className="text-sm text-muted-foreground">Direct microphone recording</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Output Options</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">TXT</Badge>
                          <span className="text-sm text-muted-foreground">Plain text transcription</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">SRT</Badge>
                          <span className="text-sm text-muted-foreground">Subtitle files for videos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">VTT</Badge>
                          <span className="text-sm text-muted-foreground">Web video text tracks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">JSON</Badge>
                          <span className="text-sm text-muted-foreground">Structured data with metadata</span>
                        </div>
                      </div>
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
