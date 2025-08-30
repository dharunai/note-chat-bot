import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt } from '@/lib/clientUtils';
import { FileText, Copy, Download, Loader2, Search } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';
import { Card, CardContent } from '@/components/ui/card';

interface PlagiarismResult {
  url: string;
  title: string;
  snippet: string;
}

export default function PlagiarismChecker() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<PlagiarismResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handlePlagiarismCheck = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text to check for plagiarism',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const response = await fetch('/api/plagiarism-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check for plagiarism');
      }

      const data = await response.json();
      setResults(data.results);
      setProvider(data.provider || '');
      
      toast({
        title: 'Plagiarism Check Complete',
        description: 'The plagiarism check has been completed successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check for plagiarism',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputContent = (
    <>
      <Textarea
        placeholder="Enter or paste your text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="min-h-[300px]"
      />
      
      <Button 
        onClick={handlePlagiarismCheck} 
        disabled={loading || !inputText.trim()}
        className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Check for Plagiarism
          </>
        )}
      </Button>
    </>
  );

  const outputContent = (
    <>
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-600">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground break-words">{result.url}</p>
                <p className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: result.snippet }}></p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">No plagiarism results found.</p>
        </div>
      )}
    </>
  );

  return (
    <ToolLayout
      pageTitle="Plagiarism Checker"
      pageDescription="Check your text for potential plagiarism against online sources."
      heroIcon={<Search className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
      heroTitle="Plagiarism Checker"
      heroDescription="Check your text for potential plagiarism against online sources."
      floatingKeywords={['Plagiarism', 'Checker', 'Academic', 'Integrity', 'Verify', 'Originality']}
      inputTitle="Input Text"
      inputDescription="Paste your text, article, or document to check for plagiarism"
      inputChildren={inputContent}
      outputTitle="Plagiarism Results"
      outputDescription="Potential sources of plagiarism found online."
      outputChildren={outputContent}
      provider={provider}
    />
  );
}