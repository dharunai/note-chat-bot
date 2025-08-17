import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { exportFlashcardsPdf } from "@/lib/clientUtils";
import { supabase } from "@/integrations/supabase/client";
import { ScanText, Shuffle, Download } from "lucide-react";

export default function FlashcardCreator() {
  useMemo(() => { document.title = "Flashcard Creator – Note Bot AI"; }, []);
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      l.setAttribute('href', window.location.href);
      document.head.appendChild(l);
    }
  }, []);

  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(12);
  const [cards, setCards] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const createCards = async () => {
    if (!notes.trim()) {
      toast({ title: "Please enter notes to create flashcards", variant: "destructive" });
      return;
    }
    
    if (count < 4 || count > 40) {
      toast({ title: "Number of cards must be between 4 and 40", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('flashcards', { 
        body: { notes, count } 
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setCards(data.cards || []);
      toast({ title: `${data.cards?.length || 0} flashcards created successfully!` });
    } catch (error: any) {
      toast({ 
        title: 'Flashcard creation failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const shuffleCards = () => {
    setCards(currentCards => [...currentCards].sort(() => Math.random() - 0.5));
    toast({ title: "Flashcards shuffled!" });
  };

  const handleExportPdf = () => {
    exportFlashcardsPdf(cards);
    toast({ title: "PDF exported successfully!" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Flashcard Creator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your notes into Q&A flashcards for effective studying
          </p>
        </header>

        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanText className="h-5 w-5 text-primary" />
              AI Flashcard Generator
            </CardTitle>
            <CardDescription>
              Paste your study notes and generate question-answer flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Study Notes</label>
                  <Textarea 
                    placeholder="Paste your notes here..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-48"
                  />
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Cards:</label>
                    <Input 
                      type="number" 
                      min={4} 
                      max={40} 
                      value={count} 
                      onChange={(e) => setCount(parseInt(e.target.value) || 12)}
                      className="w-20"
                    />
                  </div>
                  <Button 
                    onClick={createCards} 
                    disabled={loading || !notes.trim()}
                    className="flex-1 min-w-40"
                  >
                    {loading ? "Creating..." : "Create Flashcards"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={shuffleCards} 
                    disabled={!cards.length}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportPdf} 
                    disabled={!cards.length}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Generated Flashcards</label>
                  {cards.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {cards.length} cards
                    </span>
                  )}
                </div>
                
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-muted/30">
                  {cards.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Your flashcards will appear here after generation
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {cards.map((card, i) => (
                        <div key={i} className="p-3 rounded-md bg-background border">
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-primary">Q{i + 1}:</span>
                              <p className="text-sm font-medium">{card.q}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">A{i + 1}:</span>
                              <p className="text-sm text-muted-foreground">{card.a}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium mb-2">Tips for Better Flashcards:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Include key concepts, definitions, and important facts</li>
                <li>• Add examples and case studies for context</li>
                <li>• Use clear, well-structured notes for best results</li>
                <li>• Shuffle cards regularly to improve memory retention</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}