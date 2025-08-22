import { useMemo, useState } from "react";
import { extractPdfText } from "@/lib/pdfUtils";
import { Document, Packer, Paragraph } from "docx";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileDropZone from "@/components/tools/FileDropZone";

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  useMemo(() => { document.title = "PDF to Word – Note Bot AI"; }, []);

  const handleDrop = async (files: File[]) => {
    setDownUrl(null);
    const f = files[0];
    if (!f) return;
    setFile(f);
  };

  const convert = async () => {
    if (!file) return;
    setProgress(20);
    const text = await extractPdfText(file);
    setProgress(60);
    const paragraphs = text.split(/\n+/).map((t) => new Paragraph(t));
    const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    setProgress(100);
    setDownUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>PDF → Word</CardTitle>
            <CardDescription>Extract text from a PDF and download a DOCX. (Formatting and images not preserved)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone accept={{ "application/pdf": [".pdf"] }} multiple={false} onDrop={handleDrop}>
              <p className="text-sm text-muted-foreground">Drag & drop a PDF file here</p>
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
                <a href={downUrl} download="document.docx">
                  <Button variant="outline">Download DOCX</Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
