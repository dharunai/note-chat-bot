import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { PenTool, Copy, Download, Loader2 } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';

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

  const inputContent = (
    <>
      <Textarea
        placeholder="Paste your text here to paraphrase..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="min-h-[300px] resize-none"
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
        className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Paraphrasing...
          </>
        ) : (
          <>
            <PenTool className="w-4 h-4 mr-2" />
            Paraphrase Text
          </>
        )}
      </Button>
    </>
  );

  const outputContent = (
    <>
      <Textarea
        value={paraphrasedText}
        placeholder="Paraphrased text will appear here..."
        className="min-h-[300px] resize-none"
        readOnly
      />

      {paraphrasedText && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(paraphrasedText)}
            className="flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTxt(paraphrasedText, 'paraphrased-text.txt')}
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
      pageTitle="AI Paraphrasing Tool"
      pageDescription="Rewrite your text with different styles while maintaining the original meaning"
      heroIcon={<PenTool className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
      heroTitle="AI Paraphrasing Tool"
      heroDescription="Rewrite your text with different styles while maintaining the original meaning"
      floatingKeywords={['Rewrite', 'Clarity', 'Style', 'Academic', 'Creative', 'Enhanced']}
      inputTitle="Paraphrase Your Text"
      inputDescription="Choose your writing style and let AI rewrite your content"
      inputChildren={inputContent}
      outputTitle="Paraphrased Text"
      outputDescription="AI-rewritten version of your original text"
      outputChildren={outputContent}
      provider={provider}
    />
  );
}