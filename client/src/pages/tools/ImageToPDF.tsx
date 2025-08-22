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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Floating text animations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-text text-6xl font-bold text-primary/5 absolute top-20 left-10 animate-float">IMAGE</div>
        <div className="floating-text text-4xl font-bold text-accent/5 absolute top-40 right-20 animate-float-delayed">PDF</div>
        <div className="floating-text text-5xl font-bold text-primary/5 absolute bottom-32 left-20 animate-float-slow">CONVERT</div>
        <div className="floating-text text-3xl font-bold text-accent/5 absolute bottom-20 right-10 animate-bounce-slow">MERGE</div>
      </div>
      
      <TopNav />
      <main className="container mx-auto px-4 py-10 relative z-10">
        <div className="text-center mb-8 animate-slide-in-up">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Image to PDF Converter
          </h1>
          <p className="text-muted-foreground text-lg">Transform your images into professional PDFs instantly</p>
        </div>
        
        <Card className="max-w-3xl mx-auto backdrop-blur-sm bg-card/80 shadow-2xl border-primary/10 animate-scale-in">
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
