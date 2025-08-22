import { useMemo, useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import TopNav from "@/components/navigation/TopNav";

const TextToPDF = () => {
  const [text, setText] = useState("");
  const [downUrl, setDownUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useMemo(() => { document.title = "Text to PDF – Note Bot AI"; }, []);

  const createPdf = async () => {
    if (!text.trim()) return;
    setProgress(10);
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const size = 12;
    const margin = 50;
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points

    const wrapText = (str: string, maxWidth: number) => {
      const words = str.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      words.forEach((w) => {
        const test = line ? line + " " + w : w;
        const width = font.widthOfTextAtSize(test, size);
        if (width > maxWidth) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
      return lines;
    };

    const paragraphs = text.split(/\n+/);
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const maxWidth = pageWidth - margin * 2;
    paragraphs.forEach((p, idx) => {
      const lines = wrapText(p, maxWidth);
      lines.forEach((ln) => {
        if (y < margin + size) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(ln, { x: margin, y, size, font });
        y -= size * 1.4;
      });
      if (idx < paragraphs.length - 1) y -= size * 0.8;
    });

    setProgress(90);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    setDownUrl(URL.createObjectURL(blob));
    setProgress(100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Text → PDF</CardTitle>
            <CardDescription>Paste your notes and export a clean PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="min-h-48"
            />

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={createPdf} disabled={!text.trim()}>Create PDF</Button>
              {downUrl && (
                <a href={downUrl} download="note.pdf">
                  <Button variant="outline">Download PDF</Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TextToPDF;
