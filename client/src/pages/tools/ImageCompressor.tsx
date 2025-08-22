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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
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
