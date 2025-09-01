import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { copyToClipboard, downloadTxt, exportFlashcardsPdf } from '@/lib/clientUtils';
import { Brain, Copy, Download, FileText, ChevronLeft, ChevronRight, Shuffle, Loader2 } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Touch gesture handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

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
    if (flashcards.length <= 1) return;
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    if (flashcards.length <= 1) return;
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  };

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
    
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = Math.abs(touchStartY.current - touchEndY.current);
    
    // Only process horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) > 20 && deltaY < 100) {
      e.preventDefault(); // Prevent scrolling
      
      if (deltaX > 20) {
        setSwipeDirection('left');
      } else if (deltaX < -20) {
        setSwipeDirection('right');
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipeActive) return;
    
    setIsSwipeActive(false);
    
    if (!touchStartX.current || !touchEndX.current) {
      setSwipeDirection(null);
      return;
    }
    
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = Math.abs(touchStartY.current - touchEndY.current);
    const distance = Math.abs(deltaX);
    
    // Only trigger if it's a clear horizontal swipe
    if (distance > 80 && deltaY < 100 && flashcards.length > 1) {
      if (deltaX > 0) {
        nextCard(); // Swipe left = next card
      } else {
        prevCard(); // Swipe right = previous card
      }
    }
    
    setSwipeDirection(null);
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

  const inputContent = (
    <>
      <Textarea
        placeholder="Paste your study notes, textbook content, or lecture material here..."
        value={inputNotes}
        onChange={(e) => setInputNotes(e.target.value)}
        className="min-h-[200px] resize-none"
      />
      
      <div className="space-y-2">
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
        className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
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
    </>
  );

  const outputContent = (
    <>
      {flashcards.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Study Session</h3>
                {provider && (
                  <Badge variant="secondary" className="text-xs">
                    Powered by {provider}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={shuffleCards} className="flex-1 sm:flex-none">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle
                </Button>
                <Button variant="outline" size="sm" onClick={exportAsText} className="flex-1 sm:flex-none">
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportFlashcardsPdf(flashcards)} className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile swipe instructions */}
          {isMobile && flashcards.length > 1 && (
            <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Swipe left or right to navigate cards</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Flashcard Container */}
          <div className="flashcard-swipe-container relative rounded-xl">
            <Card 
              ref={cardRef}
              className={`min-h-[350px] md:min-h-[450px] cursor-pointer select-none flashcard-mobile-touch transition-all duration-300 ease-out ${
                isSwipeActive ? 'flashcard-swipe-active' : ''
              } ${
                isSwipeActive && swipeDirection === 'left' ? 'flashcard-swipe-left' :
                isSwipeActive && swipeDirection === 'right' ? 'flashcard-swipe-right' :
                ''
              } border-2 hover:border-primary/20 hover:shadow-lg bg-gradient-to-br from-card via-card to-card/95`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <CardContent className="p-6 md:p-8 h-full relative">
                {/* Visual feedback for swipe direction */}
                {isSwipeActive && swipeDirection && (
                  <div className={`absolute inset-0 transition-opacity duration-200 ${
                    swipeDirection === 'left' 
                      ? 'bg-gradient-to-r from-transparent via-primary/5 to-primary/20' 
                      : 'bg-gradient-to-r from-accent/20 via-accent/5 to-transparent'
                  } pointer-events-none rounded-lg`} />
                )}
                
                <div className="flex flex-col justify-between h-full space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground bg-muted/80 backdrop-blur-sm rounded-full px-4 py-2 inline-block border">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-3xl w-full px-4">
                      <div className="text-lg md:text-xl font-semibold text-primary">
                        {showAnswer ? 'Answer:' : 'Question:'}
                      </div>
                      <div className="text-xl md:text-2xl leading-relaxed break-words text-foreground min-h-[60px] flex items-center justify-center">
                        {currentCard && (showAnswer ? currentCard.a : currentCard.q)}
                      </div>
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="flex flex-col items-center space-y-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAnswer(!showAnswer);
                      }}
                      variant={showAnswer ? "default" : "outline"}
                      className="w-full max-w-sm h-12 text-base font-medium hover-lift hover-glow ripple-effect"
                    >
                      {showAnswer ? 'Show Question' : 'Show Answer'}
                    </Button>
                    
                    {isMobile && (
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        Tap card or button to flip
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-6 gap-4">
            <Button 
              variant="outline" 
              onClick={prevCard} 
              disabled={flashcards.length <= 1}
              className="flex items-center gap-2 min-w-[100px] h-12"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            {/* Card indicators */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <div className="flex gap-1 px-4 py-2 bg-muted/50 backdrop-blur-sm rounded-full overflow-x-auto max-w-sm border">
                {flashcards.slice(0, 12).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer ${
                      index === currentCardIndex 
                        ? 'bg-primary scale-125 shadow-md flashcard-indicator-active' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-110'
                    }`}
                    onClick={() => {
                      setCurrentCardIndex(index);
                      setShowAnswer(false);
                    }}
                  />
                ))}
                {flashcards.length > 12 && (
                  <div className="text-xs text-muted-foreground px-2 py-1 font-medium">
                    +{flashcards.length - 12}
                  </div>
                )}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={nextCard} 
              disabled={flashcards.length <= 1}
              className="flex items-center gap-2 min-w-[100px] h-12"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <div className="mb-4">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Flashcards Yet</h3>
          <p>Generated flashcards will appear here...</p>
        </div>
      )}
    </>
  );

  return (
    <ToolLayout
      pageTitle="AI Flashcard Creator"
      pageDescription="Generate interactive study flashcards from your notes"
      heroIcon={<Brain className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
      heroTitle="AI Flashcard Creator"
      heroDescription="Generate interactive study flashcards from your notes"
      floatingKeywords={['Flashcard', 'Study', 'Memory', 'Learn', 'Practice', 'Review']}
      inputTitle="Study Notes"
      inputDescription="Enter your study material to generate flashcards"
      inputChildren={inputContent}
      outputTitle="Generated Flashcards"
      outputDescription="Interactive study cards with questions and answers"
      outputChildren={outputContent}
      provider={provider}
    />
  );
}