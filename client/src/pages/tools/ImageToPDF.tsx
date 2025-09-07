import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileImage, FileType, Check, X, ArrowRight, Image, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";

const ImageToPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [downUrl, setDownUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useMemo(() => { document.title = "Convert Images to Professional PDFs Instantly – Notebot AI"; }, []);

  const onDrop = useCallback((accepted: File[]) => {
    setDownUrl(null);
    setProgress(0);
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const createPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
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
    setIsProcessing(false);
  };

  const clearAll = () => {
    setFiles([]);
    setDownUrl(null);
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Floating Background Keywords */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute inset-0"
        >
          {/* Floating words positioned around the page */}
          <div className="absolute top-20 left-10 text-4xl font-bold text-purple-400/20 blur-[1px] transform rotate-12">
            Convert
          </div>
          <div className="absolute top-32 right-16 text-3xl font-bold text-indigo-400/20 blur-[1px] transform -rotate-6">
            Image
          </div>
          <div className="absolute top-60 left-20 text-5xl font-bold text-purple-400/15 blur-[1px] transform rotate-6">
            PDF
          </div>
          <div className="absolute bottom-40 right-20 text-3xl font-bold text-violet-400/20 blur-[1px] transform rotate-12">
            Upload
          </div>
          <div className="absolute bottom-60 left-16 text-2xl font-bold text-purple-400/25 blur-[1px] transform -rotate-12">
            Fast
          </div>
          <div className="absolute top-80 right-32 text-2xl font-bold text-indigo-400/20 blur-[1px] transform rotate-8">
            Easy
          </div>
          <div className="absolute bottom-32 center text-4xl font-bold text-purple-400/15 blur-[1px] transform -rotate-6">
            Free
          </div>
          <div className="absolute top-48 left-32 text-2xl font-bold text-violet-400/25 blur-[1px] transform rotate-15">
            Smart
          </div>
          <div className="absolute bottom-80 right-8 text-3xl font-bold text-purple-400/20 blur-[1px] transform -rotate-8">
            Quick
          </div>
          <div className="absolute top-96 right-40 text-2xl font-bold text-indigo-400/20 blur-[1px] transform rotate-10">
            Secure
          </div>
        </motion.div>
      </div>

      {/* Top Navigation */}
      <TopNav />
      
      {/* Single Page Layout */}
      <div className="container mx-auto px-3 py-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header with Icon */}
          <div className="text-center mb-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center mb-3"
            >
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                  <div className="flex items-center gap-0.5">
                    <Image className="w-4 h-4 text-white" />
                    <ArrowRight className="w-3 h-3 text-white/80" />
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm"
                >
                  <Sparkles className="w-2 h-2 text-yellow-800" />
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent leading-tight">
              Convert Images to PDF
            </h1>
            <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
              Upload your images and get a polished PDF in seconds
            </p>
          </div>

          {/* Main Converter Card */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-4 md:p-6">
              {/* Upload Area */}
              <div className="mb-6">
                <div
                  {...getRootProps()}
                  className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive 
                      ? "border-purple-400 bg-purple-50 scale-[1.01]" 
                      : "border-slate-300 hover:border-purple-300 hover:bg-purple-25"
                  }`}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      {isDragActive ? "Drop your images here" : "Upload Image(s)"}
                    </h3>
                    <p className="text-slate-500 text-sm mb-3">
                      Drag & drop images here, or click to browse
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FileImage className="w-3 h-3" />
                        PNG
                      </span>
                      <span className="flex items-center gap-1">
                        <FileImage className="w-3 h-3" />
                        JPG
                      </span>
                      <span className="flex items-center gap-1">
                        <FileImage className="w-3 h-3" />
                        JPEG
                      </span>
                      <span className="flex items-center gap-1">
                        <FileImage className="w-3 h-3" />
                        WEBP
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* File Preview Grid */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.4 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                      <FileType className="w-4 h-4 text-purple-600" />
                      {files.length} Image{files.length > 1 ? 's' : ''} Selected
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAll}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs px-2 py-1"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {files.map((file, index) => (
                      <motion.div
                        key={file.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 shadow-sm">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy" 
                          />
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-2 h-2" />
                        </button>
                        <p className="mt-1 text-xs text-slate-500 truncate">{file.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Progress Bar */}
              {progress > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="bg-slate-100 rounded-full p-1">
                    <Progress 
                      value={progress} 
                      className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2 text-center">
                    {isProcessing ? `Processing... ${progress}%` : "Complete!"}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button 
                    onClick={createPdf} 
                    disabled={files.length === 0 || isProcessing}
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 mr-2" />
                        Create PDF
                      </>
                    )}
                  </Button>
                </motion.div>
                
                {downUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <a href={downUrl} download="converted-images.pdf">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm font-semibold"
                      >
                        <Check className="w-3 h-3 mr-2" />
                        Download PDF
                      </Button>
                    </a>
                  </motion.div>
                )}
              </div>

              {/* Quick Features */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center border-t pt-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-800 mb-1">Multiple Formats</h3>
                  <p className="text-xs text-slate-600">PNG, JPG, JPEG, WEBP</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-800 mb-1">No Watermarks</h3>
                  <p className="text-xs text-slate-600">Clean, professional PDFs</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-800 mb-1">Free & Unlimited</h3>
                  <p className="text-xs text-slate-600">Convert as many as you need</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Notebot AI © 2025 All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDF;
