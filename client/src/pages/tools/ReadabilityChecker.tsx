import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Target, TrendingUp, AlertCircle, CheckCircle, Copy, Download, RotateCcw } from "lucide-react";

interface ReadabilityScore {
  fleschKincaid: number;
  fleschReading: number;
  gunningFog: number;
  colemanLiau: number;
  automatedReadability: number;
  smogIndex: number;
}

interface ReadabilityAnalysis {
  scores: ReadabilityScore;
  gradeLevel: string;
  readingAge: string;
  difficulty: "Very Easy" | "Easy" | "Fairly Easy" | "Standard" | "Fairly Difficult" | "Difficult" | "Very Difficult";
  audience: string;
  statistics: {
    words: number;
    sentences: number;
    paragraphs: number;
    characters: number;
    charactersNoSpaces: number;
    averageWordsPerSentence: number;
    averageSyllablesPerWord: number;
    complexWords: number;
    longWords: number;
  };
  suggestions: string[];
  highlights: {
    longSentences: string[];
    complexWords: string[];
    passiveVoice: string[];
  };
}

const sampleTexts = [
  {
    category: "Academic",
    title: "Scientific Research Abstract",
    text: "The proliferation of artificial intelligence technologies has fundamentally transformed contemporary computational paradigms. This comprehensive investigation examines the multifaceted implications of machine learning algorithms in educational contexts, utilizing quantitative methodologies to assess pedagogical effectiveness across diverse demographic populations."
  },
  {
    category: "Business",
    title: "Corporate Communications",
    text: "Our organization is committed to delivering exceptional value through innovative solutions and collaborative partnerships. We leverage cutting-edge technologies and strategic initiatives to optimize operational efficiency while maintaining the highest standards of quality and customer satisfaction."
  },
  {
    category: "General",
    title: "Health Information",
    text: "Regular exercise is important for good health. It helps your heart, makes your muscles stronger, and can make you feel better. Try to exercise for at least 30 minutes most days of the week. Walking, swimming, and cycling are great ways to stay active."
  },
  {
    category: "Technical",
    title: "Software Documentation",
    text: "The application programming interface facilitates seamless integration between disparate software components through standardized communication protocols. Implementation requires authentication mechanisms and error handling procedures to ensure robust performance across various operational environments."
  }
];

const readabilityBenchmarks = [
  { grade: "5th Grade", age: "10-11", examples: "Comics, simple stories" },
  { grade: "6th-8th Grade", age: "11-14", examples: "Young adult novels" },
  { grade: "9th-10th Grade", age: "14-16", examples: "High school textbooks" },
  { grade: "11th-12th Grade", age: "16-18", examples: "Newspapers, magazines" },
  { grade: "College", age: "18+", examples: "Academic papers" },
  { grade: "Graduate", age: "22+", examples: "Scientific journals" }
];

export default function ReadabilityChecker() {
  useMemo(() => {
    document.title = "Readability Checker – Student Productivity";
  }, []);

  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<ReadabilityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const analysisResult = calculateReadability(text);
      setAnalysis(analysisResult);

      toast({
        title: "Analysis Complete!",
        description: "Readability analysis has been completed."
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateReadability = (inputText: string): ReadabilityAnalysis => {
    // Basic text statistics
    const words = inputText.split(/\s+/).filter(word => word.length > 0);
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;
    const characterCount = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    
    // Calculate syllables (simplified approach)
    const syllableCount = words.reduce((count, word) => {
      return count + countSyllables(word);
    }, 0);
    
    const averageWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    const averageSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
    
    // Complex words (3+ syllables)
    const complexWords = words.filter(word => countSyllables(word) >= 3);
    const longWords = words.filter(word => word.length > 6);
    
    // Readability formulas
    const fleschKincaid = 0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;
    const fleschReading = 206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord;
    const gunningFog = 0.4 * (averageWordsPerSentence + 100 * (complexWords.length / wordCount));
    const colemanLiau = 0.0588 * (charactersNoSpaces / wordCount * 100) - 0.296 * (sentenceCount / wordCount * 100) - 15.8;
    const automatedReadability = 4.71 * (charactersNoSpaces / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43;
    const smogIndex = 1.043 * Math.sqrt(complexWords.length * (30 / sentenceCount)) + 3.1291;

    const averageGradeLevel = (fleschKincaid + gunningFog + colemanLiau + automatedReadability + smogIndex) / 5;

    // Determine difficulty level
    let difficulty: ReadabilityAnalysis['difficulty'];
    let audience: string;
    let gradeLevel: string;
    let readingAge: string;

    if (fleschReading >= 90) {
      difficulty = "Very Easy";
      audience = "5th grade students";
      gradeLevel = "5th Grade";
      readingAge = "10-11 years";
    } else if (fleschReading >= 80) {
      difficulty = "Easy";
      audience = "6th grade students";
      gradeLevel = "6th Grade";
      readingAge = "11-12 years";
    } else if (fleschReading >= 70) {
      difficulty = "Fairly Easy";
      audience = "7th grade students";
      gradeLevel = "7th Grade";
      readingAge = "12-13 years";
    } else if (fleschReading >= 60) {
      difficulty = "Standard";
      audience = "8th-9th grade students";
      gradeLevel = "8th-9th Grade";
      readingAge = "13-15 years";
    } else if (fleschReading >= 50) {
      difficulty = "Fairly Difficult";
      audience = "High school students";
      gradeLevel = "10th-12th Grade";
      readingAge = "15-18 years";
    } else if (fleschReading >= 30) {
      difficulty = "Difficult";
      audience = "College students";
      gradeLevel = "College Level";
      readingAge = "18+ years";
    } else {
      difficulty = "Very Difficult";
      audience = "Graduate students";
      gradeLevel = "Graduate Level";
      readingAge = "22+ years";
    }

    // Generate suggestions
    const suggestions: string[] = [];
    
    if (averageWordsPerSentence > 20) {
      suggestions.push("Consider breaking up long sentences. Average sentence length is high.");
    }
    
    if (complexWords.length / wordCount > 0.15) {
      suggestions.push("Reduce complex words. Consider simpler alternatives.");
    }
    
    if (averageSyllablesPerWord > 1.7) {
      suggestions.push("Use shorter words when possible to improve readability.");
    }
    
    if (fleschReading < 60) {
      suggestions.push("Text may be difficult for general audiences. Consider simplifying.");
    }
    
    if (sentences.some(s => s.split(/\s+/).length > 30)) {
      suggestions.push("Some sentences are very long. Break them into shorter sentences.");
    }

    // Find problematic content
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).slice(0, 3);
    const highlightedComplexWords = complexWords.slice(0, 10);
    const passiveVoicePatterns = findPassiveVoice(inputText);

    return {
      scores: {
        fleschKincaid: Math.round(fleschKincaid * 10) / 10,
        fleschReading: Math.round(fleschReading * 10) / 10,
        gunningFog: Math.round(gunningFog * 10) / 10,
        colemanLiau: Math.round(colemanLiau * 10) / 10,
        automatedReadability: Math.round(automatedReadability * 10) / 10,
        smogIndex: Math.round(smogIndex * 10) / 10
      },
      gradeLevel,
      readingAge,
      difficulty,
      audience,
      statistics: {
        words: wordCount,
        sentences: sentenceCount,
        paragraphs: paragraphCount,
        characters: characterCount,
        charactersNoSpaces,
        averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
        averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 10) / 10,
        complexWords: complexWords.length,
        longWords: longWords.length
      },
      suggestions,
      highlights: {
        longSentences,
        complexWords: highlightedComplexWords,
        passiveVoice: passiveVoicePatterns
      }
    };
  };

  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const findPassiveVoice = (inputText: string): string[] => {
    const passivePatterns = [
      /\b(?:am|is|are|was|were|being|been|be)\s+\w+ed\b/gi,
      /\b(?:am|is|are|was|were|being|been|be)\s+\w+en\b/gi
    ];
    
    const matches: string[] = [];
    passivePatterns.forEach(pattern => {
      const found = inputText.match(pattern);
      if (found) {
        matches.push(...found.slice(0, 3));
      }
    });
    
    return matches;
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard."
    });
  };

  const downloadReport = () => {
    if (!analysis) return;

    const report = `READABILITY ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

TEXT STATISTICS:
- Words: ${analysis.statistics.words}
- Sentences: ${analysis.statistics.sentences}
- Paragraphs: ${analysis.statistics.paragraphs}
- Characters: ${analysis.statistics.characters}
- Average words per sentence: ${analysis.statistics.averageWordsPerSentence}
- Average syllables per word: ${analysis.statistics.averageSyllablesPerWord}

READABILITY SCORES:
- Flesch-Kincaid Grade Level: ${analysis.scores.fleschKincaid}
- Flesch Reading Ease: ${analysis.scores.fleschReading}
- Gunning Fog Index: ${analysis.scores.gunningFog}
- Coleman-Liau Index: ${analysis.scores.colemanLiau}
- Automated Readability Index: ${analysis.scores.automatedReadability}
- SMOG Index: ${analysis.scores.smogIndex}

ASSESSMENT:
- Grade Level: ${analysis.gradeLevel}
- Reading Age: ${analysis.readingAge}
- Difficulty: ${analysis.difficulty}
- Target Audience: ${analysis.audience}

SUGGESTIONS:
${analysis.suggestions.map(s => `- ${s}`).join('\n')}

ORIGINAL TEXT:
${text}`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readability_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const useSampleText = (sample: typeof sampleTexts[0]) => {
    setText(sample.text);
    setAnalysis(null);
  };

  const clearText = () => {
    setText("");
    setAnalysis(null);
  };

  const getDifficultyColor = (difficulty: ReadabilityAnalysis['difficulty']) => {
    const colors = {
      "Very Easy": "text-green-600 bg-green-100",
      "Easy": "text-green-600 bg-green-100",
      "Fairly Easy": "text-blue-600 bg-blue-100",
      "Standard": "text-yellow-600 bg-yellow-100",
      "Fairly Difficult": "text-orange-600 bg-orange-100",
      "Difficult": "text-red-600 bg-red-100",
      "Very Difficult": "text-red-700 bg-red-200"
    };
    return colors[difficulty] || "text-gray-600 bg-gray-100";
  };

  const getScoreColor = (score: number, type: 'grade' | 'ease') => {
    if (type === 'ease') {
      if (score >= 90) return "text-green-600";
      if (score >= 70) return "text-blue-600";
      if (score >= 50) return "text-yellow-600";
      if (score >= 30) return "text-orange-600";
      return "text-red-600";
    } else {
      if (score <= 6) return "text-green-600";
      if (score <= 9) return "text-blue-600";
      if (score <= 12) return "text-yellow-600";
      if (score <= 16) return "text-orange-600";
      return "text-red-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/20"
            >
              <BookOpen className="h-6 w-6 text-amber-600" />
              <span className="text-sm font-medium">Readability Checker</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
            >
              Analyze Text Readability
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Evaluate text complexity, grade level, and audience suitability with comprehensive readability metrics
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Text Input */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-amber-600" />
                        Text Analysis
                      </CardTitle>
                      <CardDescription>
                        Enter or paste your text to analyze its readability
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {text && (
                        <Button onClick={copyText} variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button onClick={clearText} variant="ghost" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Text to Analyze</label>
                      <span className="text-xs text-muted-foreground">
                        {text.length} characters | {text.split(/\s+/).filter(w => w.length > 0).length} words
                      </span>
                    </div>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your text here to analyze its readability..."
                      className="min-h-[300px] resize-none"
                    />
                  </div>

                  <Button
                    onClick={analyzeText}
                    disabled={isAnalyzing || !text.trim()}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="spinner"></div>
                        Analyzing Text...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Analyze Readability
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysis && (
                <>
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Readability Assessment
                        </CardTitle>
                        <Button onClick={downloadReport} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Assessment */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-amber-600">{analysis.gradeLevel}</div>
                          <div className="text-sm text-muted-foreground">Grade Level</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{analysis.readingAge}</div>
                          <div className="text-sm text-muted-foreground">Reading Age</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Badge className={`${getDifficultyColor(analysis.difficulty)} text-lg px-3 py-1`}>
                            {analysis.difficulty}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">Difficulty</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-sm font-medium">{analysis.audience}</div>
                          <div className="text-sm text-muted-foreground">Target Audience</div>
                        </div>
                      </div>

                      {/* Readability Scores */}
                      <div>
                        <h4 className="font-semibold mb-4">Readability Scores</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Flesch Reading Ease</span>
                              <span className={`font-medium ${getScoreColor(analysis.scores.fleschReading, 'ease')}`}>
                                {analysis.scores.fleschReading}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Flesch-Kincaid Grade</span>
                              <span className={`font-medium ${getScoreColor(analysis.scores.fleschKincaid, 'grade')}`}>
                                {analysis.scores.fleschKincaid}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Gunning Fog Index</span>
                              <span className={`font-medium ${getScoreColor(analysis.scores.gunningFog, 'grade')}`}>
                                {analysis.scores.gunningFog}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Coleman-Liau Index</span>
                              <span className={`font-medium ${getScoreColor(analysis.scores.colemanLiau, 'grade')}`}>
                                {analysis.scores.colemanLiau}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Automated Readability</span>
                              <span className={`font-medium ${getScoreColor(analysis.scores.automatedReadability, 'grade')}`}>
                                {analysis.scores.automatedReadability}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">SMOG Index</span>
                              <span className={`font-medium ${getScoreColor(analysis.scores.smogIndex, 'grade')}`}>
                                {analysis.scores.smogIndex}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Text Statistics */}
                      <div>
                        <h4 className="font-semibold mb-4">Text Statistics</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Words:</span>
                              <span className="font-medium">{analysis.statistics.words}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sentences:</span>
                              <span className="font-medium">{analysis.statistics.sentences}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Paragraphs:</span>
                              <span className="font-medium">{analysis.statistics.paragraphs}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Avg. words/sentence:</span>
                              <span className="font-medium">{analysis.statistics.averageWordsPerSentence}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg. syllables/word:</span>
                              <span className="font-medium">{analysis.statistics.averageSyllablesPerWord}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Complex words:</span>
                              <span className="font-medium">{analysis.statistics.complexWords}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Characters:</span>
                              <span className="font-medium">{analysis.statistics.characters}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Characters (no spaces):</span>
                              <span className="font-medium">{analysis.statistics.charactersNoSpaces}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Long words (6+ chars):</span>
                              <span className="font-medium">{analysis.statistics.longWords}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {analysis.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            Improvement Suggestions
                          </h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Issues Highlights */}
                  {(analysis.highlights.longSentences.length > 0 || analysis.highlights.complexWords.length > 0) && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          Potential Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analysis.highlights.longSentences.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Long Sentences:</h5>
                            <div className="space-y-2">
                              {analysis.highlights.longSentences.map((sentence, index) => (
                                <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                  {sentence.trim().slice(0, 150)}...
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysis.highlights.complexWords.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Complex Words:</h5>
                            <div className="flex flex-wrap gap-2">
                              {analysis.highlights.complexWords.map((word, index) => (
                                <Badge key={index} variant="outline" className="text-orange-600 border-orange-300">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Sample Texts & Guidelines */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">📚 Sample Texts</CardTitle>
                  <CardDescription>
                    Try analyzing different text types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sampleTexts.map((sample, index) => (
                      <div key={index}>
                        <Button
                          variant="ghost"
                          onClick={() => useSampleText(sample)}
                          className="w-full text-left justify-start h-auto p-3"
                        >
                          <div>
                            <div className="font-medium text-sm">{sample.title}</div>
                            <div className="text-xs text-muted-foreground">{sample.category}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {sample.text.slice(0, 80)}...
                            </div>
                          </div>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">📏 Grade Level Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {readabilityBenchmarks.map((benchmark, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{benchmark.grade}</div>
                        <div className="text-muted-foreground text-xs">
                          Age {benchmark.age} • {benchmark.examples}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">• Short sentences:</span>
                      <span className="ml-1">Keep under 20 words when possible</span>
                    </div>
                    <div>
                      <span className="font-medium">• Simple words:</span>
                      <span className="ml-1">Choose common over complex terms</span>
                    </div>
                    <div>
                      <span className="font-medium">• Active voice:</span>
                      <span className="ml-1">Prefer "We decided" over "It was decided"</span>
                    </div>
                    <div>
                      <span className="font-medium">• Clear structure:</span>
                      <span className="ml-1">Use headings and short paragraphs</span>
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
