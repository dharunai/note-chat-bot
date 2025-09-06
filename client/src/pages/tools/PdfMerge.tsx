import { useMemo, useState } from "react";
import { mergePdfFiles } from "@/lib/pdfUtils";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileDropZone from "@/components/tools/FileDropZone";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  useMemo(() => { document.title = "PDF Merge – Note Bot AI"; }, []);

  const handleDrop = (list: File[]) => {
    setDownUrl(null);
    setFiles((prev) => [...prev, ...list]);
  };

  const merge = async () => {
    if (files.length < 2) return;
    setProgress(40);
    const blob = await mergePdfFiles(files);
    setProgress(100);
    setDownUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>PDF Merge</CardTitle>
            <CardDescription>Combine multiple PDFs into one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone accept={{ "application/pdf": [".pdf"] }} multiple onDrop={handleDrop}>
              <p className="text-sm text-muted-foreground">Drag & drop multiple PDFs here</p>
            </FileDropZone>

            {files.length > 0 && <p className="text-sm text-muted-foreground">Selected: {files.length} file(s)</p>}

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={merge} disabled={files.length < 2}>Merge</Button>
              {downUrl && (
                <a href={downUrl} download="merged.pdf">
                  <Button variant="outline">Download PDF</Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-muted-foreground">
            Notebot AI © 2025 All rights reserved
          </p>
        </div>
      </main>
    </div>
  );
}
