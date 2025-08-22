import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { PenTool, Copy, Download, Loader2 } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';

export default function ParaphraseTool() {
  const [inputText, setInputText] = useState('');
  const [style, setStyle] = useState<'standard' | 'academic' | 'simple' | 'creative'>('standard');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text to paraphrase',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          style 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to paraphrase');
      }

      const data = await response.json();
      setParaphrasedText(data.paraphrased);
      setProvider(data.provider || '');
      
      toast({
        title: 'Text Paraphrased',
        description: 'Your text has been rewritten successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to paraphrase text',
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
              <PenTool className="h-8 w-8" />
              AI Paraphrase Tool
            </h1>
            <p className="text-muted-foreground">
              Rewrite and rephrase text while maintaining original meaning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Original Text</CardTitle>
                <CardDescription>
                  Enter text you want to paraphrase or rewrite
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your text here to paraphrase..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px]"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Writing Style</label>
                  <Select value={style} onValueChange={(value) => setStyle(value as 'standard' | 'academic' | 'simple' | 'creative')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleParaphrase} 
                  disabled={loading || !inputText.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Paraphrasing...
                    </>
                  ) : (
                    <>
                      <PenTool className="h-4 w-4 mr-2" />
                      Paraphrase Text
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Paraphrased Text
                  {provider && (
                    <Badge variant="secondary" className="text-xs">
                      Powered by {provider}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-rewritten version of your original text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={paraphrasedText}
                  placeholder="Paraphrased text will appear here..."
                  className="min-h-[300px]"
                  readOnly
                />
                
                {paraphrasedText && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(paraphrasedText)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTxt(paraphrasedText, 'paraphrased.txt')}
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