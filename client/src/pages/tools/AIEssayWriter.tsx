import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { FileText, Copy, Download, Loader2, PenSquare } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';

export default function AIEssayWriter() {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [style, setStyle] = useState<'standard' | 'persuasive' | 'informative' | 'narrative'>('standard');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handleGenerateEssay = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a topic for the essay',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          length,
          style
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate essay');
      }

      const data = await response.json();
      setResult(data.essay);
      setProvider(data.provider || '');
      
      toast({
        title: 'Essay Generated',
        description: 'Your essay has been generated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate essay',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputContent = (
    <>
      <Textarea
        placeholder="Enter the topic for your essay..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="min-h-[150px]"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Essay Length</label>
          <Select value={length} onValueChange={(value) => setLength(value as 'short' | 'medium' | 'long')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (300-500 words)</SelectItem>
              <SelectItem value="medium">Medium (600-900 words)</SelectItem>
              <SelectItem value="long">Long (1000+ words)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Essay Style</label>
          <Select value={style} onValueChange={(value) => setStyle(value as 'standard' | 'persuasive' | 'informative' | 'narrative')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="persuasive">Persuasive</SelectItem>
              <SelectItem value="informative">Informative</SelectItem>
              <SelectItem value="narrative">Narrative</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleGenerateEssay} 
        disabled={loading || !topic.trim()}
        className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <PenSquare className="h-4 w-4 mr-2" />
            Generate Essay
          </>
        )}
      </Button>
    </>
  );

  const outputContent = (
    <>
      <Textarea
        value={result}
        placeholder="Your generated essay will appear here..."
        className="min-h-[300px]"
        readOnly
      />
      
      {result && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(result)}
            className="flex-1 flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTxt(result, 'essay.txt')}
            className="flex-1 flex items-center gap-1 hover-lift hover-magnetic transition-all duration-300 border-primary/30 hover:bg-primary/10"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      )}
    </>
  );

  return (
    <ToolLayout
      pageTitle="AI Essay Writer"
      pageDescription="Generate well-structured essays on any topic using AI."
      heroIcon={<PenSquare className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
      heroTitle="AI Essay Writer"
      heroDescription="Generate well-structured essays on any topic using AI."
      floatingKeywords={['Essay', 'Writer', 'AI', 'Academic', 'Generate', 'Content']}
      inputTitle="Essay Topic & Requirements"
      inputDescription="Provide a topic and select the desired length and style for your essay."
      inputChildren={inputContent}
      outputTitle="Generated Essay"
      outputDescription="The AI-generated essay based on your requirements."
      outputChildren={outputContent}
      provider={provider}
    />
  );
}