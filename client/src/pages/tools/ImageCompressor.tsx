import { useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import FileDropZone from "@/components/tools/FileDropZone";

async function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise((res) => (img.onload = () => res(null)));
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/jpeg" });
}

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [processed, setProcessed] = useState<{ name: string; url: string }[]>([]);
  const [maxWidth, setMaxWidth] = useState(1280);
  const [quality, setQuality] = useState(0.7);
  const [progress, setProgress] = useState(0);
  useMemo(() => { document.title = "Image Compressor – Note Bot AI"; }, []);

  const handleDrop = (list: File[]) => { setFiles((prev) => [...prev, ...list]); };

  const run = async () => {
    setProcessed([]);
    if (files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const out = await compressImage(files[i], maxWidth, quality);
      const url = URL.createObjectURL(out);
      setProcessed((p) => [...p, { name: files[i].name.replace(/\.[^.]+$/, ".jpg"), url }]);
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Floating text animations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-text text-6xl font-bold text-primary/5 absolute top-20 left-10 animate-float">COMPRESS</div>
        <div className="floating-text text-4xl font-bold text-accent/5 absolute top-40 right-20 animate-float-delayed">IMAGE</div>
        <div className="floating-text text-5xl font-bold text-primary/5 absolute bottom-32 left-20 animate-float-slow">OPTIMIZE</div>
        <div className="floating-text text-3xl font-bold text-accent/5 absolute bottom-20 right-10 animate-bounce-slow">RESIZE</div>
      </div>
      
      <TopNav />
      <main className="container mx-auto px-4 py-10 relative z-10">
        <div className="text-center mb-8 animate-slide-in-up">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Image Compressor
          </h1>
          <p className="text-muted-foreground text-lg">Resize and compress images without quality loss</p>
        </div>
        
        <Card className="max-w-3xl mx-auto backdrop-blur-sm bg-card/80 shadow-2xl border-primary/10 animate-scale-in">
          <CardHeader>
            <CardTitle>Image Compressor</CardTitle>
            <CardDescription>Resize and compress images in your browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone accept={{ "image/*": [] }} multiple onDrop={handleDrop} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Max Width (px)</label>
                <Input type="number" value={maxWidth} onChange={(e) => setMaxWidth(parseInt(e.target.value || "0", 10))} />
              </div>
              <div>
                <label className="text-sm">JPEG Quality (0.1 - 0.95)</label>
                <Input type="number" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value || "0.7"))} />
              </div>
            </div>

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={run} disabled={files.length === 0}>Compress</Button>
            </div>

            {processed.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {processed.map((p) => (
                  <a key={p.url} href={p.url} download={p.name} className="block rounded-md overflow-hidden bg-muted">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
