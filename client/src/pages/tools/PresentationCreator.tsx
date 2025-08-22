import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Presentation, Download, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
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
}

const THEMES: Theme[] = [
  {
    id: 'professional',
    name: 'Professional Blue',
    bgColor: '#1E3A8A',
    titleColor: '#FFFFFF',
    textColor: '#E2E8F0',
    accentColor: '#3B82F6'
  },
  {
    id: 'modern',
    name: 'Modern Dark',
    bgColor: '#1F2937',
    titleColor: '#F9FAFB',
    textColor: '#D1D5DB',
    accentColor: '#10B981'
  },
  {
    id: 'elegant',
    name: 'Elegant White',
    bgColor: '#FFFFFF',
    titleColor: '#1F2937',
    textColor: '#374151',
    accentColor: '#8B5CF6'
  },
  {
    id: 'creative',
    name: 'Creative Gradient',
    bgColor: '#4C1D95',
    titleColor: '#FFFFFF',
    textColor: '#DDD6FE',
    accentColor: '#F59E0B'
  },
  {
    id: 'minimal',
    name: 'Minimal Gray',
    bgColor: '#F3F4F6',
    titleColor: '#111827',
    textColor: '#4B5563',
    accentColor: '#EF4444'
  }
];

export default function PresentationCreator() {
  const [presentationData, setPresentationData] = useState<PresentationData>({
    title: '',
    agenda: '',
    slides: [{ id: '1', title: '', content: '' }]
  });
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

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

  const addSlide = () => {
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

  const removeSlide = (id: string) => {
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

  const generateWithAI = async () => {
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
1. A comprehensive agenda (4-5 main points)
2. 5-6 slide titles and content (each slide should have a title and 3-4 bullet points of content)

Format the response clearly with sections for agenda and slides.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      const content = data.content;

      // Parse AI response to extract agenda and slides
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      // Extract agenda (first few lines typically)
      const agendaStart = lines.findIndex((line: string) => line.toLowerCase().includes('agenda'));
      const slidesStart = lines.findIndex((line: string) => line.toLowerCase().includes('slide'));
      
      let agenda = '';
      let slides: Slide[] = [];
      
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
        slides = [
          { id: '1', title: 'Introduction', content: '• Welcome and overview\n• Objectives\n• Agenda' },
          { id: '2', title: 'Main Topic', content: '• Key points\n• Supporting details\n• Examples' },
          { id: '3', title: 'Conclusion', content: '• Summary\n• Next steps\n• Questions' }
        ];
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

  const exportToPPTX = async () => {
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
        align: 'center'
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
          align: 'center'
        });

        titleSlide.addText(presentationData.agenda, {
          x: 1,
          y: 4.8,
          w: 8,
          h: 2,
          fontSize: 16,
          color: selectedTheme.textColor,
          align: 'left'
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
              color: selectedTheme.titleColor
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
              valign: 'top'
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

  const exportToPDF = async () => {
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
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Presentation className="h-8 w-8" />
              Presentation Creator
            </h1>
            <p className="text-muted-foreground">
              Create professional presentations with AI assistance and export to PPTX or PDF
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Presentation Details */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Presentation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Digital Marketing Strategy"
                      value={presentationData.title}
                      onChange={(e) => updatePresentationData('title', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agenda">Agenda</Label>
                    <Textarea
                      id="agenda"
                      placeholder="• Introduction\n• Market Analysis\n• Strategy Overview\n• Implementation\n• Q&A"
                      value={presentationData.agenda}
                      onChange={(e) => updatePresentationData('agenda', e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button
                    onClick={generateWithAI}
                    disabled={aiGenerating || !presentationData.title.trim()}
                    className="w-full"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {THEMES.map((theme) => (
                      <div
                        key={theme.id}
                        className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                          selectedTheme.id === theme.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedTheme(theme)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: theme.bgColor }}
                          />
                          <span className="font-medium">{theme.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={exportToPPTX}
                    disabled={loading || !presentationData.title.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export as PPTX
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportToPDF}
                    disabled={loading || !presentationData.title.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export as PDF
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Slide Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Slides</h2>
                <Button onClick={addSlide} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </div>

              <div className="space-y-4">
                {presentationData.slides.map((slide, index) => (
                  <Card key={slide.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Slide {index + 1}</CardTitle>
                        {presentationData.slides.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlide(slide.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Slide Title</Label>
                        <Input
                          placeholder="Enter slide title..."
                          value={slide.title}
                          onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          placeholder="• Bullet point 1&#10;• Bullet point 2&#10;• Bullet point 3"
                          value={slide.content}
                          onChange={(e) => updateSlide(slide.id, 'content', e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}