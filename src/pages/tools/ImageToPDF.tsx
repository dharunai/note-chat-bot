import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TopNav from "@/components/navigation/TopNav";

const ImageToPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);

  useMemo(() => { document.title = "Image to PDF – Note Bot AI"; }, []);

  const onDrop = useCallback((accepted: File[]) => {
    setDownUrl(null);
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const createPdf = async () => {
    if (files.length === 0) return;
    setProgress(5);
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const bytes = new Uint8Array(await f.arrayBuffer());
      const isPng = f.type.includes("png");
      const img = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      const { width, height } = img.size();
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
      setProgress(Math.round(((i + 1) / files.length) * 90));
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setDownUrl(url);
    setProgress(100);
  };

  const clearAll = () => {
    setFiles([]);
    setDownUrl(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Image → PDF Converter</CardTitle>
            <CardDescription>Upload one or more images and export a single PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-smooth ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}`}
            >
              <input {...getInputProps()} />
              <p className="text-sm text-muted-foreground">Drag & drop images here, or tap to select</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{files.length} file(s) selected</p>
                  <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {files.map((f) => (
                    <div key={f.name} className="rounded-md overflow-hidden bg-muted aspect-square">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={createPdf} disabled={files.length === 0}>Create PDF</Button>
              {downUrl && (
                <a href={downUrl} download="images.pdf">
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

export default ImageToPDF;
