import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Palette, Download, Upload, Sparkles, FileImage, Loader2 } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface FlyerData {
  title: string;
  date: string;
  venue: string;
  description: string;
  contact: string;
  logo?: string;
}

interface FlyerTemplate {
  id: string;
  name: string;
  bgColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  titleSize: string;
  fontFamily: string;
}

const TEMPLATES: FlyerTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    bgColor: 'from-blue-50 to-blue-100',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    accentColor: 'border-blue-400',
    titleSize: 'text-4xl',
    fontFamily: 'font-sans'
  },
  {
    id: 'vibrant',
    name: 'Vibrant Energy',
    bgColor: 'from-purple-400 via-pink-500 to-red-500',
    titleColor: 'text-white',
    textColor: 'text-white',
    accentColor: 'border-yellow-300',
    titleSize: 'text-4xl',
    fontFamily: 'font-bold'
  },
  {
    id: 'professional',
    name: 'Professional',
    bgColor: 'from-gray-100 to-gray-200',
    titleColor: 'text-gray-900',
    textColor: 'text-gray-700',
    accentColor: 'border-gray-400',
    titleSize: 'text-3xl',
    fontFamily: 'font-serif'
  },
  {
    id: 'retro',
    name: 'Retro Style',
    bgColor: 'from-orange-200 via-yellow-100 to-orange-200',
    titleColor: 'text-orange-900',
    textColor: 'text-orange-800',
    accentColor: 'border-orange-500',
    titleSize: 'text-4xl',
    fontFamily: 'font-mono'
  },
  {
    id: 'elegant',
    name: 'Elegant Dark',
    bgColor: 'from-gray-900 to-gray-800',
    titleColor: 'text-gold-400',
    textColor: 'text-gray-300',
    accentColor: 'border-gold-400',
    titleSize: 'text-4xl',
    fontFamily: 'font-serif'
  },
  {
    id: 'nature',
    name: 'Nature Fresh',
    bgColor: 'from-green-100 via-emerald-50 to-green-100',
    titleColor: 'text-green-900',
    textColor: 'text-green-800',
    accentColor: 'border-green-500',
    titleSize: 'text-4xl',
    fontFamily: 'font-sans'
  }
];

export default function FlyerCreator() {
  const [flyerData, setFlyerData] = useState<FlyerData>({
    title: '',
    date: '',
    venue: '',
    description: '',
    contact: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState<FlyerTemplate>(TEMPLATES[0]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof FlyerData, value: string) => {
    setFlyerData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFlyerData(prev => ({ ...prev, logo: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const generateWithAI = async () => {
    if (!flyerData.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter an event title first',
        variant: 'destructive'
      });
      return;
    }

    setAiGenerating(true);
    try {
      const prompt = `Create compelling event flyer content for: "${flyerData.title}". Generate:
- An engaging description (2-3 sentences)
- Professional contact information format
- Venue suggestions if none provided
Keep it professional and exciting.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      const content = data.content;

      // Parse AI response and update form fields
      const lines = content.split('\n').filter((line: string) => line.trim());
      const descriptionLines = lines.slice(0, 2).join(' ');
      
      setFlyerData(prev => ({
        ...prev,
        description: prev.description || descriptionLines,
        venue: prev.venue || 'Event Venue',
        contact: prev.contact || 'Contact: info@event.com | (555) 123-4567'
      }));

      toast({
        title: 'Content Generated',
        description: 'AI has enhanced your flyer content'
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

  const exportFlyer = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!flyerRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${flyerData.title || 'flyer'}.pdf`);
      } else {
        const link = document.createElement('a');
        link.download = `${flyerData.title || 'flyer'}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      }

      toast({
        title: 'Export Complete',
        description: `Flyer exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export flyer',
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
              <Palette className="h-8 w-8" />
              Flyer & Poster Creator
            </h1>
            <p className="text-muted-foreground">
              Design professional flyers with customizable templates and AI assistance
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Form Inputs */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>
                    Fill in your event information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="Summer Music Festival 2024"
                      value={flyerData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      placeholder="July 15-16, 2024 | 6:00 PM"
                      value={flyerData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      placeholder="Central Park Amphitheater"
                      value={flyerData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Join us for an unforgettable evening of music..."
                      value={flyerData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Information</Label>
                    <Input
                      id="contact"
                      placeholder="tickets@festival.com | (555) 123-4567"
                      value={flyerData.contact}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo/Image</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={generateWithAI}
                        disabled={aiGenerating || !flyerData.title.trim()}
                      >
                        {aiGenerating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        AI Generate
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Selection</CardTitle>
                  <CardDescription>
                    Choose a design template for your flyer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                          selectedTemplate.id === template.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className={`w-full h-16 rounded bg-gradient-to-br ${template.bgColor} mb-2`} />
                        <p className="text-sm font-medium">{template.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Live Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See how your flyer looks in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    ref={flyerRef}
                    className={`w-full aspect-[3/4] rounded-lg bg-gradient-to-br ${selectedTemplate.bgColor} p-8 ${selectedTemplate.fontFamily} relative overflow-hidden`}
                  >
                    {flyerData.logo && (
                      <div className="text-center mb-6">
                        <img
                          src={flyerData.logo}
                          alt="Logo"
                          className="mx-auto max-h-16 w-auto object-contain"
                        />
                      </div>
                    )}

                    <div className="text-center space-y-6">
                      <h1 className={`${selectedTemplate.titleSize} font-bold ${selectedTemplate.titleColor} leading-tight`}>
                        {flyerData.title || 'Your Event Title'}
                      </h1>

                      {flyerData.date && (
                        <div className={`text-xl ${selectedTemplate.textColor} font-semibold`}>
                          {flyerData.date}
                        </div>
                      )}

                      {flyerData.venue && (
                        <div className={`text-lg ${selectedTemplate.textColor}`}>
                          📍 {flyerData.venue}
                        </div>
                      )}

                      {flyerData.description && (
                        <div className={`${selectedTemplate.textColor} leading-relaxed px-4`}>
                          {flyerData.description}
                        </div>
                      )}

                      {flyerData.contact && (
                        <div className={`border-t-2 ${selectedTemplate.accentColor} pt-4 mt-6`}>
                          <div className={`text-sm ${selectedTemplate.textColor} font-medium`}>
                            {flyerData.contact}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Download your flyer in different formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => exportFlyer('png')}
                      disabled={loading || !flyerData.title.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileImage className="h-4 w-4 mr-2" />
                      )}
                      PNG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportFlyer('jpg')}
                      disabled={loading || !flyerData.title.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileImage className="h-4 w-4 mr-2" />
                      )}
                      JPG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportFlyer('pdf')}
                      disabled={loading || !flyerData.title.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}