import { useMemo, useState } from "react";
import { compressPdfRasterize } from "@/lib/pdfUtils";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import FileDropZone from "@/components/tools/FileDropZone";

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1.0);
  const [quality, setQuality] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  useMemo(() => { document.title = "PDF Compressor – Note Bot AI"; }, []);

  const handleDrop = (list: File[]) => { setDownUrl(null); setFile(list[0] || null); };

  const compress = async () => {
    if (!file) return;
    setProgress(20);
    const blob = await compressPdfRasterize(file, Math.max(0.3, Math.min(2, scale)), Math.max(0.1, Math.min(0.9, quality)));
    setProgress(100);
    setDownUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>PDF Compressor</CardTitle>
            <CardDescription>Reduce PDF size by rasterizing pages at lower quality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone accept={{ "application/pdf": [".pdf"] }} multiple={false} onDrop={handleDrop} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Scale (0.3 - 2.0)</label>
                <Input type="number" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
              </div>
              <div>
                <label className="text-sm">JPEG Quality (0.1 - 0.9)</label>
                <Input type="number" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} />
              </div>
            </div>

            {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={compress} disabled={!file}>Compress</Button>
              {downUrl && (
                <a href={downUrl} download="compressed.pdf">
                  <Button variant="outline">Download PDF</Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
