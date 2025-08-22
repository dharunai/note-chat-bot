import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { Quote, Copy, Download, Loader2 } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';

export default function CitationGenerator() {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState<'apa' | 'mla' | 'chicago' | 'all'>('all');
  const [citations, setCitations] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handleGenerateCitations = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text to generate citations for',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          style 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate citations');
      }

      const data = await response.json();
      
      // Handle different response formats
      if (style === 'all') {
        const formatted = [
          data.apa && `APA Format:\n${data.apa}`,
          data.mla && `MLA Format:\n${data.mla}`,
          data.chicago && `Chicago Format:\n${data.chicago}`
        ].filter(Boolean).join('\n\n');
        setCitations(formatted);
      } else {
        setCitations(data[style] || data.citations || 'No citations generated');
      }
      
      setProvider(data.provider || '');
      
      toast({
        title: 'Citations Generated',
        description: 'Your citations have been created successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate citations',
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Quote className="h-8 w-8" />
              AI Citation Generator
            </h1>
            <p className="text-muted-foreground">
              Generate proper academic citations in APA, MLA, and Chicago formats
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Source Text</CardTitle>
                <CardDescription>
                  Enter your text to generate appropriate citations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your text, research content, or references here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px]"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Citation Style</label>
                  <Select value={style} onValueChange={(value) => setStyle(value as 'apa' | 'mla' | 'chicago' | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats (APA, MLA, Chicago)</SelectItem>
                      <SelectItem value="apa">APA Format</SelectItem>
                      <SelectItem value="mla">MLA Format</SelectItem>
                      <SelectItem value="chicago">Chicago Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateCitations} 
                  disabled={loading || !inputText.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Quote className="h-4 w-4 mr-2" />
                      Generate Citations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Generated Citations
                  {provider && (
                    <Badge variant="secondary" className="text-xs">
                      Powered by {provider}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Properly formatted academic citations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={citations}
                  placeholder="Generated citations will appear here..."
                  className="min-h-[300px] font-mono text-sm"
                  readOnly
                />
                
                {citations && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(citations)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTxt(citations, 'citations.txt')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}