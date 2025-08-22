import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { ScanText, Upload, FileImage, Copy, Download, Loader2, Sparkles } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';
import Tesseract from 'tesseract.js';
import jsPDF from 'jspdf';

export default function OCRTool() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiCleaning, setAiCleaning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedImage(e.target?.result as string);
      setExtractedText('');
      setCleanedText('');
    };
    reader.readAsDataURL(file);
  }, []);

  const performOCR = async () => {
    if (!selectedImage) {
      toast({
        title: 'No Image',
        description: 'Please upload an image first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setOcrProgress(0);
    
    try {
      const result = await Tesseract.recognize(
        selectedImage,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text.trim();
      if (!text) {
        toast({
          title: 'No Text Found',
          description: 'Could not extract any text from the image. Try a clearer image.',
          variant: 'destructive'
        });
        return;
      }

      setExtractedText(text);
      setCleanedText(text); // Initialize cleaned text with extracted text
      
      toast({
        title: 'OCR Complete',
        description: 'Text extracted successfully from image'
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: 'OCR Failed',
        description: 'Failed to extract text from image',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setOcrProgress(0);
    }
  };

  const cleanWithAI = async () => {
    if (!extractedText.trim()) {
      toast({
        title: 'No Text to Clean',
        description: 'Please extract text from an image first',
        variant: 'destructive'
      });
      return;
    }

    setAiCleaning(true);
    try {
      const prompt = `Clean up this OCR-extracted text by:
1. Fixing spelling errors and typos
2. Correcting grammar and punctuation
3. Improving formatting and structure
4. Making it more readable while preserving the original meaning

Raw OCR text:
${extractedText}

Return only the cleaned text without any explanations.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to clean text');

      const data = await response.json();
      setCleanedText(data.content);

      toast({
        title: 'Text Cleaned',
        description: 'AI has improved the extracted text'
      });
    } catch (error) {
      toast({
        title: 'Cleaning Failed',
        description: 'Failed to clean text with AI',
        variant: 'destructive'
      });
    } finally {
      setAiCleaning(false);
    }
  };

  const updateCleanedText = (value: string) => {
    setCleanedText(value);
  };

  const exportToDocx = () => {
    // For simplicity, we'll export as a formatted text file
    // In a real implementation, you might want to use a library like docx
    const content = `${cleanedText || extractedText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-extracted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const text = cleanedText || extractedText;
    
    // Split text to fit PDF pages
    const lines = pdf.splitTextToSize(text, 170);
    
    pdf.setFontSize(12);
    pdf.text(lines, 20, 20);
    
    pdf.save('ocr-extracted-text.pdf');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <ScanText className="h-8 w-8" />
              OCR Handwriting to Text
            </h1>
            <p className="text-muted-foreground">
              Extract and clean up text from handwritten notes and images using AI
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Image Upload and OCR */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Image</CardTitle>
                  <CardDescription>
                    Upload an image of handwritten notes or printed text
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedImage ? (
                      <div className="space-y-4">
                        <img
                          src={selectedImage}
                          alt="Uploaded"
                          className="mx-auto max-w-full max-h-64 object-contain rounded"
                        />
                        <p className="text-sm text-muted-foreground">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileImage className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">Upload an image</p>
                          <p className="text-sm text-muted-foreground">
                            Supports JPG, PNG, and other image formats
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedImage ? 'Change Image' : 'Upload Image'}
                  </Button>

                  <Button
                    onClick={performOCR}
                    disabled={loading || !selectedImage}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting... {ocrProgress}%
                      </>
                    ) : (
                      <>
                        <ScanText className="h-4 w-4 mr-2" />
                        Extract Text (OCR)
                      </>
                    )}
                  </Button>

                  {loading && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {extractedText && (
                <Card>
                  <CardHeader>
                    <CardTitle>Raw OCR Output</CardTitle>
                    <CardDescription>
                      Text extracted directly from the image
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={extractedText}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Text Editing and Export */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Cleaned Text
                    {extractedText && (
                      <Button
                        onClick={cleanWithAI}
                        disabled={aiCleaning}
                        size="sm"
                        variant="outline"
                      >
                        {aiCleaning ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cleaning...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Clean with AI
                          </>
                        )}
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Edit and improve the extracted text
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Cleaned text will appear here. You can edit it manually."
                    value={cleanedText}
                    onChange={(e) => updateCleanedText(e.target.value)}
                    className="min-h-[300px]"
                  />

                  {cleanedText && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(cleanedText)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadTxt(cleanedText, 'extracted-text.txt')}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        TXT
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {cleanedText && (
                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>
                      Download your text in different formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={exportToDocx}
                        disabled={!cleanedText.trim()}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Text File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={exportToPDF}
                        disabled={!cleanedText.trim()}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Tips for better OCR results:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use good lighting and avoid shadows</li>
                      <li>• Keep the image straight and in focus</li>
                      <li>• Ensure text is clearly visible and not blurry</li>
                      <li>• Higher resolution images work better</li>
                      <li>• Clean, handwritten text is easier to recognize</li>
                    </ul>
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