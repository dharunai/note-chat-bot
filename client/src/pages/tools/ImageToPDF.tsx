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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40">
      {/* Top Navigation */}
      <TopNav />
      
      {/* Single Page Layout */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <div className="flex items-center gap-1">
                    <Image className="w-5 h-5 text-white" />
                    <ArrowRight className="w-4 h-4 text-white/80" />
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-md"
                >
                  <Sparkles className="w-2 h-2 text-yellow-800" />
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent leading-tight">
              Convert Images to PDF
            </h1>
            <p className="text-base text-slate-600 mb-6 max-w-xl mx-auto">
              Upload your images and get a polished PDF in seconds
            </p>
          </div>

          {/* Main Converter Card */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              {/* Upload Area */}
              <div className="mb-8">
                <div
                  {...getRootProps()}
                  className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive 
                      ? "border-purple-400 bg-purple-50 scale-[1.02]" 
                      : "border-slate-300 hover:border-purple-300 hover:bg-purple-25"
                  }`}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                      <Upload className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                      {isDragActive ? "Drop your images here" : "Upload Image(s)"}
                    </h3>
                    <p className="text-slate-500 text-lg mb-4">
                      Drag & drop images here, or click to browse
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <FileImage className="w-4 h-4" />
                        PNG
                      </span>
                      <span className="flex items-center gap-1">
                        <FileImage className="w-4 h-4" />
                        JPG
                      </span>
                      <span className="flex items-center gap-1">
                        <FileImage className="w-4 h-4" />
                        JPEG
                      </span>
                      <span className="flex items-center gap-1">
                        <FileImage className="w-4 h-4" />
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
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <FileType className="w-5 h-5 text-purple-600" />
                      {files.length} Image{files.length > 1 ? 's' : ''} Selected
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAll}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files.map((file, index) => (
                      <motion.div
                        key={file.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-md">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy" 
                          />
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="mt-2 text-xs text-slate-500 truncate">{file.name}</p>
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
                  className="mb-8"
                >
                  <div className="bg-slate-100 rounded-full p-1">
                    <Progress 
                      value={progress} 
                      className="h-3 bg-gradient-to-r from-purple-500 to-indigo-500"
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-2 text-center">
                    {isProcessing ? `Processing... ${progress}%` : "Complete!"}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={createPdf} 
                    disabled={files.length === 0 || isProcessing}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Creating PDF...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
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
                  >
                    <a href={downUrl} download="converted-images.pdf">
                      <Button 
                        size="lg"
                        variant="outline"
                        className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                    </a>
                  </motion.div>
                )}
              </div>

              {/* Quick Features */}
              <div className="mt-12 grid md:grid-cols-3 gap-6 text-center border-t pt-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Multiple Formats</h3>
                  <p className="text-sm text-slate-600">PNG, JPG, JPEG, WEBP</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">No Watermarks</h3>
                  <p className="text-sm text-slate-600">Clean, professional PDFs</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">Free & Unlimited</h3>
                  <p className="text-sm text-slate-600">Convert as many as you need</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Notebot AI © 2025 All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDF;
