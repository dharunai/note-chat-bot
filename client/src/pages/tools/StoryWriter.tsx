import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Copy, Download, Scroll, Wand2, RefreshCw, BookOpen, Sparkles } from "lucide-react";

type StoryGenre = "fantasy" | "sci-fi" | "mystery" | "romance" | "adventure" | "horror" | "drama" | "comedy";
type StoryLength = "flash" | "short" | "medium" | "long";
type WritingStyle = "descriptive" | "dialogue-heavy" | "action-packed" | "character-driven" | "atmospheric";

const genreOptions = [
  { value: "fantasy", label: "Fantasy", description: "Magic, mythical creatures, otherworldly", icon: "🧙‍♂️" },
  { value: "sci-fi", label: "Science Fiction", description: "Future tech, space, aliens", icon: "🚀" },
  { value: "mystery", label: "Mystery", description: "Puzzles, investigations, suspense", icon: "🔍" },
  { value: "romance", label: "Romance", description: "Love stories, relationships", icon: "💕" },
  { value: "adventure", label: "Adventure", description: "Journeys, quests, exploration", icon: "🗺️" },
  { value: "horror", label: "Horror", description: "Scary, supernatural, thriller", icon: "👻" },
  { value: "drama", label: "Drama", description: "Emotional, realistic, human stories", icon: "🎭" },
  { value: "comedy", label: "Comedy", description: "Humorous, light-hearted, funny", icon: "😄" }
];

const lengthOptions = [
  { value: "flash", label: "Flash Fiction (100-300 words)", description: "Very short, focused story" },
  { value: "short", label: "Short Story (500-1000 words)", description: "Complete narrative arc" },
  { value: "medium", label: "Medium Story (1000-2000 words)", description: "Detailed character development" },
  { value: "long", label: "Long Story (2000-3000 words)", description: "Complex plot and world-building" }
];

const styleOptions = [
  { value: "descriptive", label: "Descriptive", description: "Rich imagery and detailed scenes" },
  { value: "dialogue-heavy", label: "Dialogue-Heavy", description: "Character interactions and conversations" },
  { value: "action-packed", label: "Action-Packed", description: "Fast-paced with lots of movement" },
  { value: "character-driven", label: "Character-Driven", description: "Focus on internal thoughts and growth" },
  { value: "atmospheric", label: "Atmospheric", description: "Mood and setting-focused" }
];

const promptSuggestions = [
  {
    genre: "fantasy" as StoryGenre,
    prompt: "A young librarian discovers that the books in their library are portals to other worlds"
  },
  {
    genre: "sci-fi" as StoryGenre,
    prompt: "The last human on Earth receives a message from an AI that claims to be their friend"
  },
  {
    genre: "mystery" as StoryGenre,
    prompt: "A detective investigates a crime that seems to repeat every Tuesday at 3 PM"
  },
  {
    genre: "romance" as StoryGenre,
    prompt: "Two rival coffee shop owners are forced to work together during a city-wide blackout"
  },
  {
    genre: "adventure" as StoryGenre,
    prompt: "A map found in an old attic leads to a treasure hunt across the city"
  },
  {
    genre: "horror" as StoryGenre,
    prompt: "Moving into their dream house, a family discovers the previous owner left more than just furniture"
  }
];

interface StoryVariation {
  id: string;
  title: string;
  content: string;
  style: WritingStyle;
}

export default function StoryWriter() {
  useMemo(() => {
    document.title = "Story Writer – Student Productivity";
  }, []);

  const [genre, setGenre] = useState<StoryGenre>("fantasy");
  const [length, setLength] = useState<StoryLength>("short");
  const [style, setStyle] = useState<WritingStyle>("descriptive");
  const [theme, setTheme] = useState("");
  const [characters, setCharacters] = useState("");
  const [setting, setSetting] = useState("");
  const [plotPrompt, setPlotPrompt] = useState("");
  const [storyVariations, setStoryVariations] = useState<StoryVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);

  const generateStory = async () => {
    if (!theme.trim() && !plotPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide either a theme or plot prompt to generate a story.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const selectedGenre = genreOptions.find(g => g.value === genre);
      const selectedLength = lengthOptions.find(l => l.value === length);
      const selectedStyle = styleOptions.find(s => s.value === style);

      // Generate 3 variations with different approaches
      const variations = await Promise.all([
        generateSingleStory("Classic Approach"),
        generateSingleStory("Creative Twist"),
        generateSingleStory("Unique Perspective")
      ]);

      setStoryVariations(variations);
      setSelectedVariation(0);
      
      toast({
        title: "Stories Generated!",
        description: "3 story variations have been created for you."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate stories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSingleStory = async (approach: string): Promise<StoryVariation> => {
    const selectedGenre = genreOptions.find(g => g.value === genre);
    const selectedLength = lengthOptions.find(l => l.value === length);
    const selectedStyle = styleOptions.find(s => s.value === style);

    const prompt = `Write a ${approach.toLowerCase()} ${genre} story with the following specifications:

Genre: ${selectedGenre?.label} - ${selectedGenre?.description}
Length: ${selectedLength?.label}
Writing Style: ${selectedStyle?.label} - ${selectedStyle?.description}
Theme: ${theme || "Open theme"}
Plot Prompt: ${plotPrompt || "Creative freedom"}
Characters: ${characters || "Create original characters"}
Setting: ${setting || "Choose appropriate setting"}

Story Approach: ${approach}
${approach === "Classic Approach" ? "- Follow traditional storytelling structure with clear beginning, middle, and end" : 
  approach === "Creative Twist" ? "- Include an unexpected plot twist or unique narrative element" : 
  "- Tell the story from an unusual perspective or narrative voice"}

Requirements:
1. Create engaging characters with clear motivations
2. Build an appropriate setting for the ${genre} genre
3. Include conflict and resolution
4. Use ${style} writing style throughout
5. Aim for approximately ${length === "flash" ? "200" : length === "short" ? "750" : length === "medium" ? "1500" : "2500"} words
6. Include dialogue to bring characters to life
7. Create a satisfying conclusion
8. Make it suitable for a general audience
9. Focus on ${style === "descriptive" ? "vivid imagery and sensory details" : 
     style === "dialogue-heavy" ? "character interactions and conversations" :
     style === "action-packed" ? "dynamic scenes and movement" :
     style === "character-driven" ? "internal thoughts and character development" :
     "mood, atmosphere, and setting"}

Write a complete, engaging story that demonstrates creativity and good storytelling techniques.`;

    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error('Failed to generate story');

    const result = await response.json();
    
    return {
      id: Date.now().toString() + Math.random(),
      title: extractTitle(result.content) || `${approach} ${selectedGenre?.label} Story`,
      content: result.content,
      style: style
    };
  };

  const extractTitle = (content: string): string | null => {
    const titleMatch = content.match(/^#\s*(.+)$/m) || content.match(/^(.+)\n={3,}/m);
    return titleMatch ? titleMatch[1].trim() : null;
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Story copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadStory = (story: StoryVariation) => {
    const blob = new Blob([story.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Story saved as text file."
    });
  };

  const useSuggestion = (suggestion: typeof promptSuggestions[0]) => {
    setGenre(suggestion.genre);
    setPlotPrompt(suggestion.prompt);
  };

  const clearAll = () => {
    setTheme("");
    setCharacters("");
    setSetting("");
    setPlotPrompt("");
    setStoryVariations([]);
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
              <Scroll className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">AI Story Writer</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Unleash Your Creativity
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Generate compelling stories across multiple genres with AI assistance and creative variations
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Story Configuration
                  </CardTitle>
                  <CardDescription>
                    Set up your story parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={(value: StoryGenre) => setGenre(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {genreOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Story Length</Label>
                    <Select value={length} onValueChange={(value: StoryLength) => setLength(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lengthOptions.map(option => (
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
                    <Label>Writing Style</Label>
                    <Select value={style} onValueChange={(value: WritingStyle) => setStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleOptions.map(option => (
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
                    <Label htmlFor="theme">Theme or Message</Label>
                    <Input
                      id="theme"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="e.g., friendship, redemption, discovery"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plotPrompt">Plot Prompt</Label>
                    <Textarea
                      id="plotPrompt"
                      value={plotPrompt}
                      onChange={(e) => setPlotPrompt(e.target.value)}
                      placeholder="Describe the basic plot or starting situation..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="characters">Characters (Optional)</Label>
                    <Input
                      id="characters"
                      value={characters}
                      onChange={(e) => setCharacters(e.target.value)}
                      placeholder="Main character descriptions"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setting">Setting (Optional)</Label>
                    <Input
                      id="setting"
                      value={setting}
                      onChange={(e) => setSetting(e.target.value)}
                      placeholder="Where and when the story takes place"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Story Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full text-left justify-start h-auto p-3 text-sm"
                        onClick={() => useSuggestion(suggestion)}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span>{genreOptions.find(g => g.value === suggestion.genre)?.icon}</span>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.genre}
                            </Badge>
                          </div>
                          <div>{suggestion.prompt}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button 
                  onClick={generateStory}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner"></div>
                      Creating Stories...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      Generate Stories
                    </div>
                  )}
                </Button>
                
                <Button 
                  onClick={clearAll}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-2 space-y-6">
              {storyVariations.length > 0 ? (
                <>
                  {/* Variation Selector */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-pink-600" />
                        Story Variations
                      </CardTitle>
                      <CardDescription>
                        Choose from different creative approaches
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {storyVariations.map((variation, index) => (
                          <Button
                            key={variation.id}
                            variant={selectedVariation === index ? "default" : "outline"}
                            onClick={() => setSelectedVariation(index)}
                            className="h-auto p-4 text-center"
                          >
                            <div>
                              <div className="font-medium text-sm">
                                {index === 0 ? "Classic" : index === 1 ? "Twist" : "Unique"}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {variation.content.trim().split(/\s+/).length} words
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Selected Story */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>{storyVariations[selectedVariation]?.title}</CardTitle>
                          <CardDescription>
                            {styleOptions.find(s => s.value === storyVariations[selectedVariation]?.style)?.label} style
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(storyVariations[selectedVariation]?.content)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadStory(storyVariations[selectedVariation])}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-6 bg-white border rounded-lg shadow-sm min-h-[600px] max-h-[800px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800">
                          {storyVariations[selectedVariation]?.content}
                        </pre>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                        <span>Words: {storyVariations[selectedVariation]?.content.trim().split(/\s+/).length}</span>
                        <span>Characters: {storyVariations[selectedVariation]?.content.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center h-[600px] text-center text-muted-foreground">
                    <Scroll className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Stories Yet</h3>
                    <p className="text-sm max-w-md">
                      Set up your story parameters and click "Generate Stories" to create multiple variations.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Writing Tips */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">✍️ Storytelling Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Story Structure</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Hook readers with strong openings</li>
                        <li>• Develop relatable characters</li>
                        <li>• Create compelling conflicts</li>
                        <li>• Build to satisfying resolutions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Writing Techniques</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Show, don't tell</li>
                        <li>• Use sensory details</li>
                        <li>• Include meaningful dialogue</li>
                        <li>• Maintain consistent voice</li>
                      </ul>
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
