import { useEffect, useMemo, useRef, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { removeBackground, downloadProcessedImage } from "@/lib/removeBgService";

export default function RemoveBg() {
  useMemo(() => { document.title = "Image Background Remover – Note Bot AI"; }, []);
  const [file, setFile] = useState<File | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string>("");
  const [afterUrl, setAfterUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelect = (f: File) => {
    setFile(f);
    setError(null);
    const url = URL.createObjectURL(f);
    setBeforeUrl(url);
    setAfterUrl("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/(image\/png|image\/jpe?g)/.test(f.type)) {
      setError("Please select a PNG or JPG image.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("File too large. Max 8MB.");
      return;
    }
    onSelect(f);
  };

  const processImage = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    try {
      const result = await removeBackground(file);
      
      if (result.success && result.imageUrl) {
        setAfterUrl(result.imageUrl);
        toast({ title: "Background removed successfully!" });
      } else {
        setError(result.error || "Failed to process image");
        toast({ 
          title: "Processing failed", 
          description: result.error, 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong.";
      setError(errorMessage);
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    if (beforeUrl) URL.revokeObjectURL(beforeUrl);
    if (afterUrl) URL.revokeObjectURL(afterUrl);
    setBeforeUrl("");
    setAfterUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Floating text animations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-text text-6xl font-bold text-primary/5 absolute top-20 left-10 animate-float">REMOVE</div>
        <div className="floating-text text-4xl font-bold text-accent/5 absolute top-40 right-20 animate-float-delayed">BG</div>
        <div className="floating-text text-5xl font-bold text-primary/5 absolute bottom-32 left-20 animate-float-slow">MAGIC</div>
        <div className="floating-text text-3xl font-bold text-accent/5 absolute bottom-20 right-10 animate-bounce-slow">CLEAN</div>
      </div>
      
      <TopNav />
      <main className="max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        <div className="text-center mb-8 animate-slide-in-up">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Background Remover
          </h1>
          <p className="text-muted-foreground text-lg">Remove backgrounds with one click using advanced AI</p>
        </div>
        
        <Card className="rounded-2xl bg-card/80 backdrop-blur-sm shadow-2xl border-primary/10 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">Image Background Remover</CardTitle>
            <CardDescription>Remove backgrounds in 1 click (Eremove.bg)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/30 cursor-pointer transition-smooth" onClick={() => inputRef.current?.click()}>
              <input ref={inputRef} type="file" accept="image/png,image/jpg,image/jpeg" className="hidden" onChange={handleFileChange} />
              <p className="text-sm text-muted-foreground">Drag & drop image here, or click to select (PNG/JPG)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Before</h3>
                <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                  {beforeUrl ? (
                    <img src={beforeUrl} alt="Before" className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-muted-foreground text-sm">No image selected</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">After</h3>
                <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                  {afterUrl ? (
                    <img src={afterUrl} alt="After (transparent PNG)" className="w-full h-full object-contain" loading="lazy" />
                  ) : loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin"/>Processing…</div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Processed image will appear here</span>
                  )}
                </div>
                {afterUrl && (
                  <p className="text-xs text-muted-foreground mt-2">Processed with Eremove.bg</p>
                )}
              </div>
            </div>

            {error && <div className="mt-4 text-sm text-destructive">{error}</div>}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={processImage} disabled={!file || loading}>
                {loading ? "Processing…" : "Remove Background"}
              </Button>
              {afterUrl && (
                <Button variant="outline" onClick={() => downloadProcessedImage(afterUrl)}>
                  Download PNG
                </Button>
              )}
              <Button variant="ghost" onClick={reset}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
