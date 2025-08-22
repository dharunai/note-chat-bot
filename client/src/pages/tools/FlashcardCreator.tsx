import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt, exportFlashcardsPdf } from '@/lib/clientUtils';
import { Brain, Copy, Download, FileText, ChevronLeft, ChevronRight, Shuffle, Loader2 } from 'lucide-react';
import TopNav from '@/components/navigation/TopNav';

interface Flashcard {
  q: string;
  a: string;
}

export default function FlashcardCreator() {
  const [inputNotes, setInputNotes] = useState('');
  const [cardCount, setCardCount] = useState(12);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  const handleGenerateFlashcards = async () => {
    if (!inputNotes.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter your study notes',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: inputNotes, 
          count: cardCount 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data.cards || []);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setProvider(data.provider || '');
      
      toast({
        title: 'Flashcards Generated',
        description: `Created ${data.cards?.length || 0} flashcards from your notes`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate flashcards',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const exportAsText = () => {
    const text = flashcards.map((card, i) => 
      `Card ${i + 1}:\nQ: ${card.q}\nA: ${card.a}\n`
    ).join('\n');
    downloadTxt(text, 'flashcards.txt');
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Brain className="h-8 w-8" />
              AI Flashcard Creator
            </h1>
            <p className="text-muted-foreground">
              Generate interactive study flashcards from your notes
            </p>
          </div>

          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Study Notes</CardTitle>
              <CardDescription>
                Enter your study material to generate flashcards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your study notes, textbook content, or lecture material here..."
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                className="min-h-[200px]"
              />
              
              <div className="flex gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">Number of Cards</label>
                  <Select value={cardCount.toString()} onValueChange={(value) => setCardCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Cards</SelectItem>
                      <SelectItem value="12">12 Cards</SelectItem>
                      <SelectItem value="18">18 Cards</SelectItem>
                      <SelectItem value="24">24 Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateFlashcards} 
                  disabled={loading || !inputNotes.trim()}
                  className="px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Cards
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Flashcard Display */}
          {flashcards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Study Session</h2>
                  {provider && (
                    <Badge variant="secondary" className="text-xs">
                      Powered by {provider}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={shuffleCards}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportAsText}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportFlashcardsPdf(flashcards)}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>

              <Card className="min-h-[300px]">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </div>
                    
                    <div className="min-h-[150px] flex items-center justify-center">
                      <div className="text-center space-y-4 max-w-2xl">
                        <div className="text-lg font-medium">
                          {showAnswer ? 'Answer:' : 'Question:'}
                        </div>
                        <div className="text-xl leading-relaxed">
                          {currentCard && (showAnswer ? currentCard.a : currentCard.q)}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowAnswer(!showAnswer)}
                      variant={showAnswer ? "default" : "outline"}
                      className="w-full max-w-xs"
                    >
                      {showAnswer ? 'Show Question' : 'Show Answer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={prevCard} disabled={flashcards.length <= 1}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {flashcards.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentCardIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <Button variant="outline" onClick={nextCard} disabled={flashcards.length <= 1}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}