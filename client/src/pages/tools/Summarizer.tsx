import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { FileText, Copy, Download, Loader2 } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';

export default function Summarizer() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'paragraph' | 'bullets'>('paragraph');
  const [maxPoints, setMaxPoints] = useState(5);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text to summarize',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          mode, 
          max_points: maxPoints 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to summarize');
      }

      const data = await response.json();
      
      if (mode === 'bullets') {
        setResult(data.bullets.map((b: string, i: number) => `${i + 1}. ${b}`).join('\n'));
      } else {
        setResult(data.paragraph);
      }
      
      setProvider(data.provider || '');
      
      toast({
        title: 'Summary Generated',
        description: 'Your text has been summarized successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate summary',
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
              <FileText className="h-8 w-8" />
              AI Text Summarizer
            </h1>
            <p className="text-muted-foreground">
              Transform long content into concise summaries using AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Input Text</CardTitle>
                <CardDescription>
                  Paste your text, article, or document to summarize
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter or paste your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px]"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Summary Type</label>
                    <Select value={mode} onValueChange={(value) => setMode(value as 'paragraph' | 'bullets')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="bullets">Bullet Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {mode === 'bullets' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Points</label>
                      <Select value={maxPoints.toString()} onValueChange={(value) => setMaxPoints(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Points</SelectItem>
                          <SelectItem value="5">5 Points</SelectItem>
                          <SelectItem value="8">8 Points</SelectItem>
                          <SelectItem value="10">10 Points</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSummarize} 
                  disabled={loading || !inputText.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Summary Result
                  {provider && (
                    <Badge variant="secondary" className="text-xs">
                      Powered by {provider}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-generated summary of your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={result}
                  placeholder="Your summary will appear here..."
                  className="min-h-[300px]"
                  readOnly
                />
                
                {result && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTxt(result, 'summary.txt')}
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