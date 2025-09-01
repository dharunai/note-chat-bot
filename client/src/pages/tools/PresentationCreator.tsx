import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Presentation, Download, Plus, Trash2, Loader2, Palette, Type, Wand2, FileText, Eye, Briefcase } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';
// @ts-ignore
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';

interface Slide {
  id: string;
  title: string;
  content: string;
}

interface PresentationData {
  title: string;
  agenda: string;
  slides: Slide[];
}

interface Theme {
  id: string;
  name: string;
  bgColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  gradient?: string;
  category: 'business' | 'creative' | 'academic' | 'minimal';
}

interface Font {
  id: string;
  name: string;
  family: string;
  style: 'modern' | 'classic' | 'creative' | 'technical';
}

const FONTS: Font[] = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', style: 'modern' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', style: 'modern' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', style: 'creative' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif', style: 'technical' },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif', style: 'classic' },
  { id: 'source-sans', name: 'Source Sans Pro', family: 'Source Sans Pro, sans-serif', style: 'technical' },
  { id: 'nunito', name: 'Nunito', family: 'Nunito, sans-serif', style: 'creative' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', style: 'classic' }
];

const THEMES: Theme[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    bgColor: '#0F172A',
    titleColor: '#FFFFFF',
    textColor: '#CBD5E1',
    accentColor: '#3B82F6',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    category: 'business'
  },
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    bgColor: '#7C3AED',
    titleColor: '#FFFFFF',
    textColor: '#E2E8F0',
    accentColor: '#F59E0B',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F59E0B 100%)',
    category: 'creative'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    bgColor: '#0891B2',
    titleColor: '#FFFFFF',
    textColor: '#F0F9FF',
    accentColor: '#06B6D4',
    gradient: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
    category: 'business'
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    bgColor: '#DC2626',
    titleColor: '#FFFFFF',
    textColor: '#FEF2F2',
    accentColor: '#F59E0B',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #F59E0B 100%)',
    category: 'creative'
  },
  {
    id: 'academic-clean',
    name: 'Academic Clean',
    bgColor: '#FFFFFF',
    titleColor: '#1F2937',
    textColor: '#4B5563',
    accentColor: '#059669',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
    category: 'academic'
  },
  {
    id: 'dark-elegance',
    name: 'Dark Elegance',
    bgColor: '#111827',
    titleColor: '#F9FAFB',
    textColor: '#D1D5DB',
    accentColor: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
    category: 'minimal'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    bgColor: '#064E3B',
    titleColor: '#FFFFFF',
    textColor: '#D1FAE5',
    accentColor: '#10B981',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
    category: 'business'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    bgColor: '#581C87',
    titleColor: '#FFFFFF',
    textColor: '#F3E8FF',
    accentColor: '#A855F7',
    gradient: 'linear-gradient(135deg, #581C87 0%, #7C3AED 100%)',
    category: 'creative'
  }
];

export default function PresentationCreator() {
  const [presentationData, setPresentationData] = useState<PresentationData>({
    title: '',
    agenda: '',
    slides: [{ id: '1', title: '', content: '' }]
  });
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
  const [selectedFont, setSelectedFont] = useState<Font>(FONTS[0]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [currentSlidePreview, setCurrentSlidePreview] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'preview'>('content');

  const updatePresentationData = (field: keyof Omit<PresentationData, 'slides'>, value: string) => {
    setPresentationData(prev => ({ ...prev, [field]: value }));
  };

  const updateSlide = (id: string, field: keyof Slide, value: string) => {
    setPresentationData(prev => ({
      ...prev,
      slides: prev.slides.map(slide => 
        slide.id === id ? { ...slide, [field]: value } : slide
      )
    }));
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: '',
      content: ''
    };
    setPresentationData(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
  };

  const handleRemoveSlide = (id: string) => {
    if (presentationData.slides.length <= 1) {
      toast({
        title: 'Cannot Remove',
        description: 'You need at least one slide',
        variant: 'destructive'
      });
      return;
    }
    
    setPresentationData(prev => ({
      ...prev,
      slides: prev.slides.filter(slide => slide.id !== id)
    }));
  };

  const handleGenerateWithAI = async () => {
    if (!presentationData.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a presentation title first',
        variant: 'destructive'
      });
      return;
    }

    setAiGenerating(true);
    try {
      const prompt = `Create a structured presentation outline for: "${presentationData.title}".
      
Generate:
1. A comprehensive agenda (5-7 main points)
2. 5-6 detailed slides with titles and bullet points
3. Professional content suitable for business/academic presentation

Format as:
AGENDA:
• Point 1
• Point 2
...

SLIDES:
Slide 1: [Title]
• Content point 1
• Content point 2
...

Slide 2: [Title]
• Content point 1
• Content point 2
...`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      const content = data.content || '';

      // Parse the AI response
      const lines = content.split('\n').filter((line: string) => line.trim());
      let agenda = '';
      const slides: Slide[] = [];

      const agendaStart = lines.findIndex((line: string) => line.toLowerCase().includes('agenda'));
      const slidesStart = lines.findIndex((line: string) => line.toLowerCase().includes('slides'));

      // Extract agenda
      if (agendaStart !== -1 && slidesStart !== -1) {
        agenda = lines.slice(agendaStart + 1, slidesStart).join('\n').trim();
      } else {
        agenda = lines.slice(0, 5).join('\n').trim();
      }

      // Create slides from content
      const slideContent = lines.slice(slidesStart !== -1 ? slidesStart : 5);
      let currentSlide: Partial<Slide> = {};
      
      slideContent.forEach((line: string, index: number) => {
        if (line.toLowerCase().includes('slide') || line.match(/^\d+\./)) {
          if (currentSlide.title) {
            slides.push({
              id: Date.now().toString() + index,
              title: currentSlide.title,
              content: currentSlide.content || ''
            });
          }
          currentSlide = { title: line.replace(/^\d+\.?\s*/, '').replace(/slide\s*\d*:?\s*/i, ''), content: '' };
        } else if (line.trim() && currentSlide.title) {
          currentSlide.content = (currentSlide.content || '') + line + '\n';
        }
      });

      if (currentSlide.title) {
        slides.push({
          id: Date.now().toString(),
          title: currentSlide.title,
          content: currentSlide.content || ''
        });
      }

      // If no slides were parsed, create some default ones
      if (slides.length === 0) {
        slides.push(
          { id: '1', title: 'Introduction', content: '• Welcome and overview\n• Objectives\n• Agenda' },
          { id: '2', title: 'Main Topic', content: '• Key points\n• Supporting details\n• Examples' },
          { id: '3', title: 'Conclusion', content: '• Summary\n• Next steps\n• Questions' }
        );
      }

      setPresentationData(prev => ({
        ...prev,
        agenda: agenda || prev.agenda,
        slides: slides.length > 0 ? slides : prev.slides
      }));

      toast({
        title: 'Content Generated',
        description: `Created ${slides.length} slides with AI assistance`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content with AI',
        variant: 'destructive'
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleExportToPPTX = async () => {
    if (!presentationData.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a presentation title',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const pptx = new PptxGenJS();

      // Set presentation properties
      pptx.author = 'Note Bot AI';
      pptx.company = 'Generated by Note Bot AI';
      pptx.title = presentationData.title;

      // Title slide
      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: selectedTheme.bgColor };
      
      titleSlide.addText(presentationData.title, {
        x: 0.5,
        y: 2,
        w: 9,
        h: 1.5,
        fontSize: 36,
        bold: true,
        color: selectedTheme.titleColor,
        align: 'center',
        fontFace: selectedFont.name
      });

      if (presentationData.agenda) {
        titleSlide.addText('Agenda', {
          x: 0.5,
          y: 4,
          w: 9,
          h: 0.5,
          fontSize: 24,
          bold: true,
          color: selectedTheme.titleColor,
          align: 'center',
          fontFace: selectedFont.name
        });

        titleSlide.addText(presentationData.agenda, {
          x: 1,
          y: 4.8,
          w: 8,
          h: 2,
          fontSize: 16,
          color: selectedTheme.textColor,
          align: 'left',
          fontFace: selectedFont.name
        });
      }

      // Content slides
      presentationData.slides.forEach((slide) => {
        if (slide.title.trim() || slide.content.trim()) {
          const contentSlide = pptx.addSlide();
          contentSlide.background = { color: selectedTheme.bgColor };

          if (slide.title.trim()) {
            contentSlide.addText(slide.title, {
              x: 0.5,
              y: 0.5,
              w: 9,
              h: 1,
              fontSize: 28,
              bold: true,
              color: selectedTheme.titleColor,
              fontFace: selectedFont.name
            });
          }

          if (slide.content.trim()) {
            contentSlide.addText(slide.content, {
              x: 0.5,
              y: 1.8,
              w: 9,
              h: 4.5,
              fontSize: 18,
              color: selectedTheme.textColor,
              valign: 'top',
              fontFace: selectedFont.name
            });
          }
        }
      });

      await pptx.writeFile({ fileName: `${presentationData.title || 'presentation'}.pptx` });

      toast({
        title: 'Export Complete',
        description: 'Presentation exported as PPTX'
      });
    } catch (error) {
      console.error('PPTX export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export as PPTX',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportToPDF = async () => {
    if (!presentationData.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a presentation title',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Title page
      pdf.setFillColor(selectedTheme.bgColor);
      pdf.rect(0, 0, 297, 210, 'F');
      
      pdf.setTextColor(selectedTheme.titleColor);
      pdf.setFontSize(32);
      pdf.text(presentationData.title, 148.5, 80, { align: 'center' });

      if (presentationData.agenda) {
        pdf.setFontSize(18);
        pdf.text('Agenda', 148.5, 120, { align: 'center' });
        pdf.setFontSize(12);
        const agendaLines = pdf.splitTextToSize(presentationData.agenda, 200);
        pdf.text(agendaLines, 148.5, 140, { align: 'center' });
      }

      // Content slides
      presentationData.slides.forEach((slide, index) => {
        if (slide.title.trim() || slide.content.trim()) {
          pdf.addPage();
          
          pdf.setFillColor(selectedTheme.bgColor);
          pdf.rect(0, 0, 297, 210, 'F');

          if (slide.title.trim()) {
            pdf.setTextColor(selectedTheme.titleColor);
            pdf.setFontSize(24);
            pdf.text(slide.title, 20, 40);
          }

          if (slide.content.trim()) {
            pdf.setTextColor(selectedTheme.textColor);
            pdf.setFontSize(14);
            const contentLines = pdf.splitTextToSize(slide.content, 250);
            pdf.text(contentLines, 20, 70);
          }
        }
      });

      pdf.save(`${presentationData.title || 'presentation'}.pdf`);

      toast({
        title: 'Export Complete',
        description: 'Presentation exported as PDF'
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export as PDF',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/20 backdrop-blur-sm">
              <Presentation className="h-6 w-6 text-primary animate-pulse" />
              <span className="text-sm font-medium">AI-Powered Presentation Creator</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              Create Stunning
              <br />
              <span className="relative">
                Presentations
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Design professional presentations with AI assistance, beautiful themes, and custom fonts. 
              Export to PPTX or PDF in seconds.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['AI-Powered', 'Beautiful Themes', 'Custom Fonts', 'PPTX Export', 'PDF Export'].map((feature, index) => (
                <Badge 
                  key={feature} 
                  variant="secondary" 
                  className="animate-fade-in-scale"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-muted/50 backdrop-blur-sm rounded-xl p-1 border">
              {[
                { id: 'content', label: 'Content', icon: FileText },
                { id: 'design', label: 'Design', icon: Palette },
                { id: 'preview', label: 'Preview', icon: Eye }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === id
                      ? 'bg-primary text-primary-foreground shadow-lg transform scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'content' && (
              <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
                {/* Content Creation */}
                <div className="space-y-6">
                  <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5">
                    <CardHeader className="relative">
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
                          <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        Presentation Details
                      </CardTitle>
                      <CardDescription>
                        Define your presentation's core information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="title" className="text-base font-medium">Presentation Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Digital Marketing Strategy 2024"
                          value={presentationData.title}
                          onChange={(e) => updatePresentationData('title', e.target.value)}
                          className="h-12 text-lg font-medium border-2 border-border/50 focus:border-primary/50 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="agenda" className="text-base font-medium">Agenda & Overview</Label>
                        <Textarea
                          id="agenda"
                          placeholder="• Introduction & Objectives&#10;• Market Analysis & Trends&#10;• Strategy Framework&#10;• Implementation Plan&#10;• Q&A Session"
                          value={presentationData.agenda}
                          onChange={(e) => updatePresentationData('agenda', e.target.value)}
                          className="min-h-[160px] border-2 border-border/50 focus:border-primary/50 transition-all duration-300"
                        />
                      </div>

                      <Button
                        onClick={handleGenerateWithAI}
                        disabled={aiGenerating || !presentationData.title.trim()}
                        className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Generating Magic...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-5 w-5 mr-2" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Slide Editor */}
                <div className="space-y-6">
                  <Card className="border-2 border-accent/20 shadow-2xl bg-gradient-to-br from-card via-card to-accent/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-accent to-primary">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          Slide Content
                        </CardTitle>
                        <Button onClick={handleAddSlide} size="sm" className="shadow-md hover:shadow-lg transition-all duration-300">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Slide
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {presentationData.slides.map((slide, index) => (
                          <Card key={slide.id} className="border border-border/50 hover:border-primary/30 transition-all duration-300 transform hover:scale-[1.02]">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  Slide {index + 1}
                                </CardTitle>
                                {presentationData.slides.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSlide(slide.id)}
                                    className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label className="font-medium">Slide Title</Label>
                                <Input
                                  placeholder="Enter slide title..."
                                  value={slide.title}
                                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                                  className="border-2 border-border/50 focus:border-primary/50 transition-all duration-300"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="font-medium">Content</Label>
                                <Textarea
                                  placeholder="• Key point 1&#10;• Key point 2&#10;• Key point 3"
                                  value={slide.content}
                                  onChange={(e) => updateSlide(slide.id, 'content', e.target.value)}
                                  className="min-h-[120px] border-2 border-border/50 focus:border-primary/50 transition-all duration-300"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
                {/* Theme Selection */}
                <div className="space-y-6">
                  <Card className="border-2 border-primary/20 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
                          <Palette className="h-5 w-5 text-white" />
                        </div>
                        Theme Selection
                      </CardTitle>
                      <CardDescription>
                        Choose a theme that matches your presentation style
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {THEMES.map((theme) => (
                          <div
                            key={theme.id}
                            className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 transform hover:scale-105 ${
                              selectedTheme.id === theme.id
                                ? 'border-primary ring-4 ring-primary/20 shadow-xl'
                                : 'border-border hover:border-primary/50 hover:shadow-lg'
                            }`}
                            onClick={() => setSelectedTheme(theme)}
                          >
                            <div className="space-y-3">
                              <div
                                className="w-full h-20 rounded-lg shadow-inner relative overflow-hidden"
                                style={{ 
                                  background: theme.gradient || theme.bgColor,
                                  border: '1px solid rgba(255,255,255,0.1)'
                                }}
                              >
                                <div className="absolute inset-0 p-3 flex flex-col justify-center">
                                  <div 
                                    className="text-xs font-bold mb-1" 
                                    style={{ color: theme.titleColor }}
                                  >
                                    Title
                                  </div>
                                  <div 
                                    className="text-[8px] leading-tight" 
                                    style={{ color: theme.textColor }}
                                  >
                                    • Sample content
                                    <br />
                                    • Bullet points
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <h4 className="font-semibold text-sm">{theme.name}</h4>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {theme.category}
                                  </Badge>
                                  <div className="flex gap-1">
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: theme.accentColor }}
                                    ></div>
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: theme.titleColor }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {selectedTheme.id === theme.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Font Selection and Export */}
                <div className="space-y-6">
                  <Card className="border-2 border-accent/20 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-accent to-primary">
                          <Type className="h-5 w-5 text-white" />
                        </div>
                        Typography
                      </CardTitle>
                      <CardDescription>
                        Select fonts that enhance readability and style
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {FONTS.map((font) => (
                          <div
                            key={font.id}
                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 ${
                              selectedFont.id === font.id
                                ? 'border-accent ring-4 ring-accent/20 bg-accent/5'
                                : 'border-border hover:border-accent/50 hover:bg-accent/5'
                            }`}
                            onClick={() => setSelectedFont(font)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 
                                  className="text-lg font-semibold mb-1"
                                  style={{ fontFamily: font.family }}
                                >
                                  {font.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {font.style}
                                  </Badge>
                                  {selectedFont.id === font.id && (
                                    <Badge className="text-xs bg-accent">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div 
                                  className="text-sm text-muted-foreground mb-1"
                                  style={{ fontFamily: font.family }}
                                >
                                  Sample Text
                                </div>
                                <div 
                                  className="text-2xl font-semibold"
                                  style={{ fontFamily: font.family }}
                                >
                                  Aa
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Export Options */}
                  <Card className="border-2 border-primary/20 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
                          <Download className="h-5 w-5 text-white" />
                        </div>
                        Export Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={handleExportToPPTX}
                        disabled={loading || !presentationData.title.trim()}
                        className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-5 w-5 mr-2" />
                        )}
                        Export as PPTX
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleExportToPDF}
                        disabled={loading || !presentationData.title.trim()}
                        className="w-full h-12 border-2 border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5 font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <FileText className="h-5 w-5 mr-2" />
                        )}
                        Export as PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="animate-fade-in">
                <Card className="border-2 border-accent/20 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-accent to-primary">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                        Live Preview
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentSlidePreview(Math.max(0, currentSlidePreview - 1))}
                          disabled={currentSlidePreview === 0}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground px-3">
                          {currentSlidePreview + 1} of {Math.max(1, presentationData.slides.length)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentSlidePreview(Math.min(presentationData.slides.length - 1, currentSlidePreview + 1))}
                          disabled={currentSlidePreview >= presentationData.slides.length - 1}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div
                        className="w-full aspect-video rounded-xl shadow-2xl border-2 border-border/20 p-8 flex flex-col justify-center relative overflow-hidden"
                        style={{ 
                          background: selectedTheme.gradient || selectedTheme.bgColor,
                          fontFamily: selectedFont.family
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                        <div className="relative z-10 text-center space-y-6">
                          {currentSlidePreview === 0 ? (
                            // Title slide
                            <>
                              <h1 
                                className="text-4xl md:text-5xl font-bold mb-4"
                                style={{ color: selectedTheme.titleColor }}
                              >
                                {presentationData.title || 'Your Presentation Title'}
                              </h1>
                              {presentationData.agenda && (
                                <div className="space-y-4">
                                  <h2 
                                    className="text-2xl font-semibold"
                                    style={{ color: selectedTheme.titleColor }}
                                  >
                                    Agenda
                                  </h2>
                                  <div 
                                    className="text-lg leading-relaxed max-w-2xl mx-auto"
                                    style={{ color: selectedTheme.textColor }}
                                  >
                                    {presentationData.agenda.split('\n').map((line, i) => (
                                      <div key={i} className="mb-2">{line}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            // Content slide
                            <>
                              <h1 
                                className="text-3xl md:text-4xl font-bold mb-6"
                                style={{ color: selectedTheme.titleColor }}
                              >
                                {presentationData.slides[currentSlidePreview - 1]?.title || 'Slide Title'}
                              </h1>
                              <div 
                                className="text-xl leading-relaxed max-w-3xl mx-auto text-left"
                                style={{ color: selectedTheme.textColor }}
                              >
                                {presentationData.slides[currentSlidePreview - 1]?.content.split('\n').map((line, i) => (
                                  <div key={i} className="mb-3">{line}</div>
                                )) || ['• Content will appear here', '• Add your key points', '• Use bullet points for clarity']}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
