import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { Quote, Copy, Download, Loader2 } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';

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

  const inputContent = (
    <>
      <Textarea
        placeholder="Paste your text, research content, or references here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="min-h-[300px] resize-none"
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
        className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Quote className="w-4 h-4 mr-2" />
            Generate Citations
          </>
        )}
      </Button>
    </>
  );

  const outputContent = (
    <>
      <Textarea
        value={citations}
        placeholder="Generated citations will appear here..."
        className="min-h-[300px] font-mono text-sm resize-none"
        readOnly
      />

      {citations && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(citations)}
            className="flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTxt(citations, 'citations.txt')}
            className="flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
          >
            <Download className="w-3 h-3" />
            Download
          </Button>
        </div>
      )}
    </>
  );

  return (
    <ToolLayout
      pageTitle="AI Citation Generator"
      pageDescription="Generate proper academic citations in APA, MLA, and Chicago formats"
      heroIcon={<Quote className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
      heroTitle="AI Citation Generator"
      heroDescription="Generate proper academic citations in APA, MLA, and Chicago formats"
      floatingKeywords={['Citation', 'Academic', 'APA', 'MLA', 'Chicago', 'References']}
      inputTitle="Source Text"
      inputDescription="Enter your text to generate appropriate citations"
      inputChildren={inputContent}
      outputTitle="Generated Citations"
      outputDescription="Properly formatted academic citations"
      outputChildren={outputContent}
      provider={provider}
    />
  );
}