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
import { Copy, Download, BookOpen, Wand2, Edit3, Eye, FileText } from "lucide-react";

type BlogStyle = "informative" | "persuasive" | "entertaining" | "tutorial" | "opinion" | "news";
type BlogLength = "short" | "medium" | "long";

const styleOptions = [
  { value: "informative", label: "Informative", description: "Educational and fact-based", icon: "📚" },
  { value: "persuasive", label: "Persuasive", description: "Convincing and compelling", icon: "🎯" },
  { value: "entertaining", label: "Entertaining", description: "Engaging and fun to read", icon: "🎭" },
  { value: "tutorial", label: "Tutorial", description: "Step-by-step how-to guide", icon: "📋" },
  { value: "opinion", label: "Opinion", description: "Personal perspective and views", icon: "💭" },
  { value: "news", label: "News", description: "Current events and updates", icon: "📰" }
];

const lengthOptions = [
  { value: "short", label: "Short (300-500 words)", description: "Quick read, focused content" },
  { value: "medium", label: "Medium (500-800 words)", description: "Balanced depth and readability" },
  { value: "long", label: "Long (800-1200 words)", description: "Comprehensive and detailed" }
];

const topicSuggestions = [
  "How to manage time effectively as a student",
  "The future of artificial intelligence in education",
  "Sustainable living tips for college students",
  "Building a personal brand on social media",
  "The benefits of mindfulness and meditation",
  "Remote work vs office work: pros and cons",
  "Healthy eating habits for busy professionals",
  "The impact of technology on mental health"
];

export default function BlogGenerator() {
  useMemo(() => {
    document.title = "Blog Post Generator – Student Productivity";
  }, []);

  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<BlogStyle>("informative");
  const [length, setLength] = useState<BlogLength>("medium");
  const [keywords, setKeywords] = useState("");
  const [generatedBlog, setGeneratedBlog] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const generateBlog = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a blog topic to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const selectedStyle = styleOptions.find(s => s.value === style);
      const selectedLength = lengthOptions.find(l => l.value === length);

      const prompt = `Write a comprehensive blog post about "${topic}" with the following specifications:

Style: ${selectedStyle?.label} - ${selectedStyle?.description}
Length: ${selectedLength?.label} - ${selectedLength?.description}
Keywords to include: ${keywords || "None specified"}

Requirements:
1. Create an engaging, SEO-friendly title
2. Write a compelling introduction that hooks the reader
3. Structure the content with clear headings and subheadings
4. Include practical examples and actionable advice where relevant
5. Write in a ${style} style that is ${style === "entertaining" ? "engaging and fun" : style === "tutorial" ? "clear and instructional" : style === "persuasive" ? "convincing and compelling" : style === "opinion" ? "personal and thoughtful" : style === "news" ? "objective and factual" : "educational and informative"}
6. Include a strong conclusion with key takeaways
7. Use markdown formatting for better readability
8. Aim for approximately ${length === "short" ? "400" : length === "medium" ? "650" : "1000"} words
9. Make it suitable for a student/young professional audience
10. Include relevant statistics or facts where appropriate

Format the blog post with proper markdown headers (# for title, ## for main sections, ### for subsections) and ensure it's well-structured and easy to read.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate blog post');

      const result = await response.json();
      setGeneratedBlog(result.content);
      
      toast({
        title: "Blog Post Generated!",
        description: "Your blog post has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate blog post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedBlog);
      toast({
        title: "Copied!",
        description: "Blog post copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadAsMarkdown = () => {
    if (!generatedBlog) return;
    
    const blob = new Blob([generatedBlog], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_blog_post.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Blog post saved as Markdown file."
    });
  };

  const useSuggestion = (suggestion: string) => {
    setTopic(suggestion);
  };

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2 mt-4">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
      .replace(/<\/p><p class="mb-4">(<[h|l])/g, '$1')
      .replace(/(<li class="mb-1">.*<\/li>)/g, '<ul class="list-disc list-inside mb-4">$1</ul>')
      .replace(/<\/li><\/ul><ul class="list-disc list-inside mb-4"><li class="mb-1">/g, '</li><li class="mb-1">');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-blue-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full border border-green-500/20"
            >
              <BookOpen className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">AI Blog Post Generator</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
            >
              Create Engaging Blog Content
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Generate well-structured, SEO-friendly blog posts with AI assistance in minutes
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
                    <Edit3 className="h-5 w-5 text-green-600" />
                    Blog Configuration
                  </CardTitle>
                  <CardDescription>
                    Set up your blog post parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Blog Topic *</Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter your blog topic..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Writing Style</Label>
                    <Select value={style} onValueChange={(value: BlogStyle) => setStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleOptions.map(option => (
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
                    <Label>Post Length</Label>
                    <Select value={length} onValueChange={(value: BlogLength) => setLength(value)}>
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
                    <Label htmlFor="keywords">SEO Keywords (Optional)</Label>
                    <Input
                      id="keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate keywords with commas for better SEO
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Topic Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topicSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full text-left justify-start h-auto p-3 text-sm"
                        onClick={() => useSuggestion(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={generateBlog}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg text-lg py-6"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Generating Blog Post...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Generate Blog Post
                  </div>
                )}
              </Button>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Generated Blog Post
                      </CardTitle>
                      <CardDescription>
                        Your AI-generated blog content
                      </CardDescription>
                    </div>
                    {generatedBlog && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? <Eye className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                          {isEditing ? "Preview" : "Edit"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAsMarkdown}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedBlog ? (
                    <div className="space-y-4">
                      {isEditing ? (
                        <Textarea
                          value={generatedBlog}
                          onChange={(e) => setGeneratedBlog(e.target.value)}
                          rows={25}
                          className="font-mono text-sm"
                        />
                      ) : (
                        <div className="p-6 bg-white border rounded-lg shadow-sm min-h-[600px] max-h-[800px] overflow-y-auto">
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(generatedBlog) }}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Words: {generatedBlog.trim().split(/\s+/).length}</span>
                        <span>Characters: {generatedBlog.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[600px] text-center text-muted-foreground">
                      <BookOpen className="h-16 w-16 mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Blog Post Yet</h3>
                      <p className="text-sm max-w-md">
                        Enter a topic and click "Generate Blog Post" to create your content.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Tips */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">🚀 SEO & Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">SEO Best Practices</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Use focus keywords naturally</li>
                        <li>• Include keywords in headings</li>
                        <li>• Write compelling meta descriptions</li>
                        <li>• Use internal and external links</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Writing Tips</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Hook readers with strong openings</li>
                        <li>• Use subheadings for readability</li>
                        <li>• Include actionable advice</li>
                        <li>• End with clear conclusions</li>
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
