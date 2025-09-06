import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileType, RefreshCw, Archive, Image as ImageIcon, FileText, Music } from "lucide-react";
import FileDropZone from "@/components/tools/FileDropZone";

interface FileItem {
  id: string;
  file: File;
  originalName: string;
  originalFormat: string;
  targetFormat: string;
  status: "pending" | "converting" | "completed" | "error";
  convertedUrl?: string;
  convertedSize?: number;
}

type FileCategory = "document" | "image" | "audio" | "video" | "archive";

const formatCategories = {
  document: {
    name: "Documents",
    icon: FileText,
    formats: {
      input: ["pdf", "doc", "docx", "txt", "rtf", "odt", "html", "md"],
      output: ["pdf", "doc", "docx", "txt", "rtf", "odt", "html"]
    }
  },
  image: {
    name: "Images",
    icon: ImageIcon,
    formats: {
      input: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "svg", "ico"],
      output: ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "pdf"]
    }
  },
  audio: {
    name: "Audio",
    icon: Music,
    formats: {
      input: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"],
      output: ["mp3", "wav", "flac", "aac", "ogg", "m4a"]
    }
  },
  video: {
    name: "Video",
    icon: FileType,
    formats: {
      input: ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"],
      output: ["mp4", "avi", "mov", "wmv", "webm", "mkv"]
    }
  },
  archive: {
    name: "Archives",
    icon: Archive,
    formats: {
      input: ["zip", "rar", "7z", "tar", "gz", "bz2"],
      output: ["zip", "7z", "tar", "gz"]
    }
  }
};

const popularConversions = [
  { from: "pdf", to: "docx", category: "document", name: "PDF to Word" },
  { from: "docx", to: "pdf", category: "document", name: "Word to PDF" },
  { from: "png", to: "jpg", category: "image", name: "PNG to JPEG" },
  { from: "jpg", to: "png", category: "image", name: "JPEG to PNG" },
  { from: "wav", to: "mp3", category: "audio", name: "WAV to MP3" },
  { from: "mp4", to: "avi", category: "video", name: "MP4 to AVI" },
  { from: "zip", to: "7z", category: "archive", name: "ZIP to 7Z" },
  { from: "webp", to: "png", category: "image", name: "WebP to PNG" }
];

export default function FileConverter() {
  useMemo(() => {
    document.title = "File Converter – Student Productivity";
  }, []);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>("document");

  const onDrop = (droppedFiles: File[]) => {
    const newFiles: FileItem[] = droppedFiles.map(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || "";
      const category = detectFileCategory(extension);
      const defaultTargetFormat = getDefaultTargetFormat(extension, category);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        originalName: file.name,
        originalFormat: extension,
        targetFormat: defaultTargetFormat,
        status: "pending"
      };
    });

    setFiles([...files, ...newFiles]);
  };

  const detectFileCategory = (extension: string): FileCategory => {
    for (const [category, config] of Object.entries(formatCategories)) {
      if (config.formats.input.includes(extension)) {
        return category as FileCategory;
      }
    }
    return "document"; // Default fallback
  };

  const getDefaultTargetFormat = (extension: string, category: FileCategory): string => {
    const categoryConfig = formatCategories[category];
    if (!categoryConfig) return extension;

    // Return a common alternative format
    const commonAlternatives: { [key: string]: string } = {
      pdf: "docx",
      docx: "pdf",
      png: "jpg",
      jpg: "png",
      wav: "mp3",
      mp3: "wav",
      mp4: "avi",
      avi: "mp4",
      zip: "7z"
    };

    return commonAlternatives[extension] || categoryConfig.formats.output[0];
  };

  const updateTargetFormat = (fileId: string, newFormat: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, targetFormat: newFormat } : file
    ));
  };

  const convertFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload files to convert.",
        variant: "destructive"
      });
      return;
    }

    const pendingFiles = files.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) {
      toast({
        title: "No Files to Convert",
        description: "All files have already been processed.",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);

    // Update status to converting
    setFiles(files.map(file => 
      file.status === "pending" ? { ...file, status: "converting" } : file
    ));

    try {
      // Simulate conversion process
      for (const file of pendingFiles) {
        await convertFile(file);
      }

      toast({
        title: "Conversion Complete!",
        description: `Successfully converted ${pendingFiles.length} file(s).`
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Some files failed to convert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const convertFile = async (fileItem: FileItem): Promise<void> => {
    // Simulate conversion time
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Mock conversion - in real implementation, this would call a conversion API
      const convertedBlob = new Blob([fileItem.file], { type: getMimeType(fileItem.targetFormat) });
      const convertedUrl = URL.createObjectURL(convertedBlob);
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { 
              ...f, 
              status: "completed", 
              convertedUrl,
              convertedSize: convertedBlob.size 
            }
          : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: "error" } : f
      ));
    }
  };

  const getMimeType = (extension: string): string => {
    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
      html: "text/html",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      zip: "application/zip"
    };
    return mimeTypes[extension] || "application/octet-stream";
  };

  const downloadFile = (fileItem: FileItem) => {
    if (!fileItem.convertedUrl) return;

    const a = document.createElement('a');
    a.href = fileItem.convertedUrl;
    a.download = `${fileItem.originalName.replace(/\.[^/.]+$/, "")}.${fileItem.targetFormat}`;
    a.click();
  };

  const downloadAllFiles = () => {
    const completedFiles = files.filter(f => f.status === "completed");
    completedFiles.forEach(file => downloadFile(file));
    
    toast({
      title: "Downloaded All",
      description: "All converted files have been downloaded."
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const clearAll = () => {
    files.forEach(file => {
      if (file.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl);
      }
    });
    setFiles([]);
  };

  const useQuickConversion = (conversion: typeof popularConversions[0]) => {
    setSelectedCategory(conversion.category as FileCategory);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: FileItem['status']): string => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "converting": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const completedFiles = files.filter(f => f.status === "completed");
  const currentCategory = formatCategories[selectedCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full border border-blue-500/20"
            >
              <RefreshCw className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Universal File Converter</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Convert Any File Format
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Transform documents, images, audio, video, and archive files between hundreds of formats
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Quick Conversions */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-lg">⚡ Popular Conversions</CardTitle>
              <CardDescription>Click to quickly set up common file conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {popularConversions.map((conversion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => useQuickConversion(conversion)}
                    className="h-auto p-3 text-left justify-start"
                  >
                    <div>
                      <div className="font-medium text-sm">{conversion.name}</div>
                      <div className="text-xs text-muted-foreground">
                        .{conversion.from} → .{conversion.to}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload & Settings */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Upload Files
                  </CardTitle>
                  <CardDescription>
                    Drag & drop files to convert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileDropZone
                    accept={{}}
                    multiple={true}
                    onDrop={onDrop}
                    className="border-2 border-dashed border-blue-500/50 rounded-xl p-8 text-center hover:border-blue-500 transition-all"
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <FileType className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">Drop Files Here</p>
                        <p className="text-sm text-muted-foreground">
                          Any file type, up to 50MB each
                        </p>
                      </div>
                    </div>
                  </FileDropZone>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Files ({files.length})</p>
                        <Button size="sm" variant="ghost" onClick={clearAll}>
                          Clear All
                        </Button>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{file.originalName}</div>
                              <div className="text-xs text-muted-foreground">
                                .{file.originalFormat} → .{file.targetFormat}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(file.status)}>
                                {file.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFile(file.id)}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <currentCategory.icon className="h-5 w-5 text-indigo-600" />
                    Format Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedCategory} onValueChange={(value: FileCategory) => setSelectedCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(formatCategories).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Supported Input Formats:</div>
                    <div className="flex flex-wrap gap-1">
                      {currentCategory.formats.input.map((format: string) => (
                        <Badge key={format} variant="outline" className="text-xs">
                          .{format}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Available Output Formats:</div>
                    <div className="flex flex-wrap gap-1">
                      {currentCategory.formats.output.map((format: string) => (
                        <Badge key={format} variant="secondary" className="text-xs">
                          .{format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={convertFiles}
                disabled={isConverting || files.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                {isConverting ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Converting Files...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Convert Files ({files.filter(f => f.status === "pending").length})
                  </div>
                )}
              </Button>
            </div>

            {/* File Management & Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* File List */}
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileType className="h-5 w-5 text-green-600" />
                        File Queue
                      </CardTitle>
                      <CardDescription>
                        Manage conversion settings for each file
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {files.length > 0 ? (
                    <div className="space-y-4">
                      {files.map((file) => (
                        <div key={file.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{file.originalName}</h4>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatFileSize(file.file.size)} • {file.originalFormat.toUpperCase()}
                              </div>
                            </div>
                            <Badge className={getStatusColor(file.status)}>
                              {file.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">.{file.originalFormat}</Badge>
                            <span className="text-muted-foreground">→</span>
                            <Select 
                              value={file.targetFormat} 
                              onValueChange={(value) => updateTargetFormat(file.id, value)}
                              disabled={file.status === "converting"}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currentCategory.formats.output.map((format: string) => (
                                  <SelectItem key={format} value={format}>
                                    .{format}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {file.status === "completed" && file.convertedUrl && (
                            <Button
                              size="sm"
                              onClick={() => downloadFile(file)}
                              className="w-full"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download {file.targetFormat.toUpperCase()}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                      <FileType className="h-12 w-12 mb-3 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Files Uploaded</h3>
                      <p className="text-sm max-w-md">
                        Drag and drop files or click the upload area to get started with file conversion.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Downloads */}
              {completedFiles.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="h-5 w-5 text-blue-600" />
                          Completed Conversions
                        </CardTitle>
                        <CardDescription>
                          {completedFiles.length} file(s) ready for download
                        </CardDescription>
                      </div>
                      <Button onClick={downloadAllFiles} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {completedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {file.originalName.replace(/\.[^/.]+$/, "")}.{file.targetFormat}
                            </div>
                            <div className="text-xs text-green-600">
                              {file.convertedSize && formatFileSize(file.convertedSize)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => downloadFile(file)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
