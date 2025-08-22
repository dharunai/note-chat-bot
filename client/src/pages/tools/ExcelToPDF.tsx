import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts } from "pdf-lib";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileDropZone from "@/components/tools/FileDropZone";

export default function ExcelToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  useMemo(() => { document.title = "Excel to PDF – Note Bot AI"; }, []);

  const handleDrop = (list: File[]) => { setDownUrl(null); setFile(list[0] || null); };

  const convert = async () => {
    if (!file) return;
    setProgress(20);
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const pageWidth = 595, pageHeight = 842, margin = 40, size = 10;
    let page = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const colCount = Math.max(...rows.map((r) => r.length));
    const maxWidth = pageWidth - margin * 2;
    const colWidth = maxWidth / Math.max(1, colCount);

    const drawRow = (cells: any[]) => {
      cells = Array.from({ length: colCount }, (_, i) => (cells[i] ?? "").toString());
      let x = margin;
      cells.forEach((cell) => {
        const text = String(cell).slice(0, 40);
        page.drawText(text, { x: x + 2, y, size, font });
        x += colWidth;
      });
      y -= size * 1.6;
    };

    rows.forEach((row, idx) => {
      if (y < margin + size * 2) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      drawRow(row);
      if (idx === 0) y -= 6; // small gap after header
    });

    setProgress(90);
    const bytes = await pdf.save();
    setDownUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
    setProgress(100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Excel → PDF</CardTitle>
            <CardDescription>Convert the first sheet of an XLSX into a simple PDF table.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone accept={{ "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }} multiple={false} onDrop={handleDrop} />

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
                <a href={downUrl} download="sheet.pdf">
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
