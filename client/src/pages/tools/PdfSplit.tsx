import { useMemo, useState } from "react";
import { parsePageRanges, splitPdfByPages } from "@/lib/pdfUtils";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import FileDropZone from "@/components/tools/FileDropZone";

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState("1-3");
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  useMemo(() => { document.title = "PDF Split – Note Bot AI"; }, []);

  const handleDrop = (list: File[]) => {
    setDownUrl(null);
    setFile(list[0] || null);
  };

  const split = async () => {
    if (!file) return;
    const pages = parsePageRanges(ranges);
    if (!pages.length) return;
    setProgress(40);
    const blob = await splitPdfByPages(file, pages);
    setProgress(100);
    setDownUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Floating text animations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-text text-6xl font-bold text-primary/5 absolute top-20 left-10 animate-float">SPLIT</div>
        <div className="floating-text text-4xl font-bold text-accent/5 absolute top-40 right-20 animate-float-delayed">PDF</div>
        <div className="floating-text text-5xl font-bold text-primary/5 absolute bottom-32 left-20 animate-float-slow">PAGES</div>
        <div className="floating-text text-3xl font-bold text-accent/5 absolute bottom-20 right-10 animate-bounce-slow">DIVIDE</div>
      </div>
      
      <TopNav />
      <main className="container mx-auto px-4 py-10 relative z-10">
        <div className="text-center mb-8 animate-slide-in-up">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PDF Split Tool
          </h1>
          <p className="text-muted-foreground text-lg">Split PDF files by page numbers or ranges</p>
        </div>
        
        <Card className="max-w-3xl mx-auto backdrop-blur-sm bg-card/80 shadow-2xl border-primary/10 animate-scale-in">
          <CardHeader>
            <CardTitle>PDF Split</CardTitle>
            <CardDescription>Split a PDF by page numbers or ranges like 1-3,5,7-9.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone accept={{ "application/pdf": [".pdf"] }} multiple={false} onDrop={handleDrop}>
              <p className="text-sm text-muted-foreground">Drag & drop a PDF file here</p>
            </FileDropZone>

            <div className="flex items-center gap-2">
              <Input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3,5,8-9" />
            </div>

            {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={split} disabled={!file}>Split</Button>
              {downUrl && (
                <a href={downUrl} download="split.pdf">
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
