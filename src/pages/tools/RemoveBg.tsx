import { useEffect, useMemo, useRef, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/integrations/supabase/client";

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

  const removeBackground = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("image_file", file, file.name);
      form.append("size", "auto");
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/remove-bg`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb3ViYnRuemZmcHZkamhuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1Njg5ODIsImV4cCI6MjA3MDE0NDk4Mn0.HsnosAWMperDILZGNILIzF-MgQmeSE2JbrNvqqf8Kn8`,
          'apikey': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb3ViYnRuemZmcHZkamhuYnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1Njg5ODIsImV4cCI6MjA3MDE0NDk4Mn0.HsnosAWMperDILZGNILIzF-MgQmeSE2JbrNvqqf8Kn8`,
        },
        body: form,
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(err || "Failed to process image");
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setAfterUrl(url);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <Card className="rounded-2xl bg-card shadow-lg">
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
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={removeBackground} disabled={!file || loading}>
                {loading ? "Processing…" : "Remove Background"}
              </Button>
              {afterUrl && (
                <Button variant="outline" onClick={() => {
                  const a = document.createElement('a');
                  a.href = afterUrl; a.download = 'removed-bg.png'; a.click();
                }}>Download PNG</Button>
              )}
              <Button variant="ghost" onClick={reset}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
