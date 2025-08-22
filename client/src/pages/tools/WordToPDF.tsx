import { useMemo, useState } from "react";
import mammoth from "mammoth";
import { textToSimplePdf } from "@/lib/pdfUtils";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileDropZone from "@/components/tools/FileDropZone";

export default function WordToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  useMemo(() => { document.title = "Word to PDF – Note Bot AI"; }, []);

  const handleDrop = async (files: File[]) => {
    setDownUrl(null);
    const f = files[0];
    if (!f) return;
    setFile(f);
  };

  const convert = async () => {
    if (!file) return;
    setProgress(10);
    const arrayBuffer = await file.arrayBuffer();
    setProgress(30);
    const { value: text } = await mammoth.extractRawText({ arrayBuffer });
    setProgress(60);
    const pdfBlob = await textToSimplePdf(text || "");
    setProgress(90);
    setDownUrl(URL.createObjectURL(pdfBlob));
    setProgress(100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Word → PDF</CardTitle>
            <CardDescription>Upload a DOCX and export a simple PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone accept={{ "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] }} multiple={false} onDrop={handleDrop}>
              <p className="text-sm text-muted-foreground">Drag & drop a .docx file here</p>
            </FileDropZone>

            {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={convert} disabled={!file}>Convert</Button>
              {downUrl && (
                <a href={downUrl} download="document.pdf">
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
