import { useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PenTool, Mail, BookOpen, Scroll, Image, Mic, Video, 
  Globe, Volume2, MessageSquare, BarChart3, Sparkles,
  FileText, Languages, AudioLines, Palette, FileImage,
  FileSpreadsheet, FileCheck, Scissors, Archive,
  Zap, CheckCircle, Shield, User
} from "lucide-react";
import { Link } from "react-router-dom";

const toolCategories = [
  {
    title: "Academic Writing & Research",
    description: "Essential tools for essays, research, and academic success",
    icon: PenTool,
    color: "from-blue-500 to-indigo-600",
    tools: [
      {
        name: "AI Essay Writer",
        description: "Generate well-structured essays with AI assistance",
        icon: PenTool,
        path: "/tools/essay-writer",
        features: ["Topic analysis", "Structured outline", "Citation ready"]
      },
      {
        name: "Citation Generator",
        description: "Create perfect citations in any format",
        icon: Scroll,
        path: "/tools/citation-generator",
        features: ["APA/MLA/Chicago", "Auto-formatting", "Bibliography"]
      },
      {
        name: "Plagiarism Checker",
        description: "Ensure your work is original and unique",
        icon: Shield,
        path: "/tools/plagiarism-checker",
        features: ["Similarity check", "Detailed report", "Safe writing"]
      },
      {
        name: "Grammar Checker",
        description: "Perfect your writing with advanced grammar checking",
        icon: CheckCircle,
        path: "/tools/grammar-checker",
        features: ["Advanced AI", "Style suggestions", "Error correction"]
      }
    ]
  },
  {
    title: "Content Creation & Communication",
    description: "Create engaging content and communicate effectively",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-600",
    tools: [
      {
        name: "Blog Post Generator",
        description: "Generate structured blog posts with SEO optimization",
        icon: BookOpen,
        path: "/tools/blog-generator",
        features: ["SEO-friendly", "Editable output", "Multiple formats"]
      },
      {
        name: "AI Email Assistant",
        description: "Rewrite emails with perfect tone and professionalism",
        icon: Mail,
        path: "/tools/email-assistant",
        features: ["Formal/informal", "Copy to clipboard", "Quick rewrite"]
      },
      {
        name: "Cover Letter Generator",
        description: "Create polished, job-ready cover letters",
        icon: FileText,
        path: "/tools/cover-letter-generator",
        features: ["Job description input", "Professional tone", "PDF export"]
      },
      {
        name: "Story Writer",
        description: "Creative storytelling with AI assistance",
        icon: Scroll,
        path: "/tools/story-writer",
        features: ["Multiple genres", "Character development", "Plot variations"]
      }
    ]
  },
  {
    title: "File Processing & Conversion",
    description: "Convert, compress, and optimize your files",
    icon: FileText,
    color: "from-green-500 to-emerald-600",
    tools: [
      {
        name: "PDF Merge",
        description: "Combine multiple PDFs into one document",
        icon: FileText,
        path: "/tools/pdf-merge",
        features: ["Merge/Split PDFs", "Compress files", "Format conversion"]
      },
      {
        name: "Image Compressor",
        description: "Compress and resize images for web optimization",
        icon: FileImage,
        path: "/tools/image-compressor",
        features: ["Batch processing", "Quality control", "Web optimization"]
      },
      {
        name: "File Converter",
        description: "Convert between multiple file formats",
        icon: Zap,
        path: "/tools/file-converter",
        features: ["Multiple formats", "Batch convert", "Cloud storage"]
      },
      {
        name: "Word to PDF",
        description: "Convert Word documents to PDF format",
        icon: FileCheck,
        path: "/tools/word-to-pdf",
        features: ["Preserve formatting", "Batch conversion", "Quick export"]
      }
    ]
  },
  {
    title: "Language & Learning Tools",
    description: "Bridge language barriers and enhance learning",
    icon: Globe,
    color: "from-orange-500 to-red-600",
    tools: [
      {
        name: "Language Translator",
        description: "Translate text to any language instantly",
        icon: Languages,
        path: "/tools/translator",
        features: ["100+ languages", "Context aware", "Instant translation"]
      },
      {
        name: "Text-to-Speech",
        description: "Convert text to natural speech for accessibility",
        icon: Volume2,
        path: "/tools/text-to-speech",
        features: ["Natural voices", "Speed control", "Download audio"]
      },
      {
        name: "Speech-to-Text",
        description: "Real-time speech recognition and transcription",
        icon: MessageSquare,
        path: "/tools/speech-to-text",
        features: ["Real-time dictation", "Multi-language", "Export text"]
      },
      {
        name: "Summarizer",
        description: "Condense long texts into key points",
        icon: BarChart3,
        path: "/tools/summarizer",
        features: ["Smart extraction", "Key points", "Quick overview"]
      }
    ]
  },
  {
    title: "Media & Audio Processing",
    description: "Process audio and video content with AI",
    icon: Mic,
    color: "from-cyan-500 to-blue-600",
    tools: [
      {
        name: "Audio Transcriber",
        description: "Convert speech to text with high accuracy",
        icon: Mic,
        path: "/tools/audio-transcriber",
        features: ["Multiple formats", "High accuracy", "Export options"]
      },
      {
        name: "Video to GIF",
        description: "Create GIFs from video clips",
        icon: Video,
        path: "/tools/video-to-gif",
        features: ["Time selection", "Quality options", "Fast conversion"]
      },
      {
        name: "Presentation Creator",
        description: "Generate professional presentations",
        icon: Palette,
        path: "/tools/presentation-creator",
        features: ["Auto-layout", "Templates", "Export ready"]
      },
      {
        name: "Flashcard Creator",
        description: "Create study flashcards from any content",
        icon: BookOpen,
        path: "/tools/flashcard-creator",
        features: ["Auto-generation", "Spaced repetition", "Export decks"]
      }
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function StudentProductivity() {
  useMemo(() => {
    document.title = "Student Productivity Platform – Note Bot AI";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/20 backdrop-blur-sm"
            >
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <span className="text-sm font-medium">Student Productivity Suite</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            >
              Supercharge Your
              <br />
              <span className="relative">
                Academic Journey
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              20+ powerful AI-driven tools organized into 5 functional categories. Write better, create faster, 
              and communicate more effectively with our comprehensive productivity platform.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-2 mt-8"
            >
              {['AI-Powered', 'Free to Use', 'No Registration', 'Export Options', 'Mobile Friendly'].map((feature, index) => (
                <Badge 
                  key={feature} 
                  variant="secondary" 
                  className="animate-fade-in-scale"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {feature}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tools Categories */}
      <main className="container mx-auto px-4 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {toolCategories.map((category, categoryIndex) => (
            <motion.section 
              key={category.title}
              variants={itemVariants}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${category.color} text-white rounded-full shadow-lg`}>
                  <category.icon className="h-6 w-6" />
                  <span className="font-semibold">{category.title}</span>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {category.tools.map((tool, toolIndex) => (
                  <motion.div
                    key={tool.name}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: categoryIndex * 0.2 + toolIndex * 0.1 
                    }}
                    whileHover={{ 
                      y: -8, 
                      transition: { duration: 0.2 } 
                    }}
                  >
                    <Link to={tool.path}>
                      <Card className="h-full border-2 border-transparent hover:border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                        <CardHeader className="space-y-6 text-center">
                          <div className="flex justify-center">
                            <tool.icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {tool.name}
                            </CardTitle>
                            <CardDescription className="text-sm mt-2">
                              {tool.description}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {tool.features.map((feature, featureIndex) => (
                                <Badge 
                                  key={featureIndex} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            <Button 
                              variant="ghost" 
                              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            >
                              Get Started
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.section 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 py-16 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl border"
        >
          <div className="text-center space-y-12">
            <h2 className="text-3xl font-bold">Everything You Need to Succeed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "20+", label: "Powerful Tools" },
                { number: "5", label: "Categories" },
                { number: "∞", label: "Usage Limit" },
                { number: "100%", label: "Free" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
