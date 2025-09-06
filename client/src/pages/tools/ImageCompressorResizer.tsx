import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Image as ImageIcon, Settings, Zap, Sliders } from "lucide-react";
import FileDropZone from "@/components/tools/FileDropZone";

interface ProcessedImage {
  name: string;
  originalSize: number;
  processedSize: number;
  url: string;
  originalUrl: string;
}

type QualityLevel = "low" | "medium" | "high" | "ultra";

const qualityOptions = [
  { value: "low", label: "Low Quality (50%)", description: "Maximum compression, smallest file size" },
  { value: "medium", label: "Medium Quality (70%)", description: "Balanced compression and quality" },
  { value: "high", label: "High Quality (85%)", description: "Minimal compression, good quality" },
  { value: "ultra", label: "Ultra Quality (95%)", description: "Highest quality, larger file size" }
];

const presetSizes = [
  { name: "Social Media Profile", width: 400, height: 400 },
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Twitter Header", width: 1500, height: 500 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
  { name: "LinkedIn Banner", width: 1584, height: 396 },
  { name: "Web Banner", width: 1920, height: 1080 },
  { name: "Avatar", width: 200, height: 200 }
];

export default function ImageCompressorResizer() {
  useMemo(() => {
    document.title = "Image Compressor & Resizer – Student Productivity";
  }, []);

  const [images, setImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<QualityLevel>("medium");
  const [resizeMode, setResizeMode] = useState<"compress" | "resize" | "both">("compress");
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const onDrop = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please only upload image files (JPG, PNG, GIF, WebP).",
        variant: "destructive"
      });
    }
    setImages(imageFiles);
    setProcessedImages([]);
  };

  const processImages = async () => {
    if (images.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload images to process.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    const processed: ProcessedImage[] = [];

    try {
      for (const image of images) {
        const processedImage = await processImage(image);
        processed.push(processedImage);
      }

      setProcessedImages(processed);
      toast({
        title: "Images Processed!",
        description: `Successfully processed ${processed.length} image(s).`
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processImage = async (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      img.onload = () => {
        let { width, height } = img;

        // Resize logic
        if (resizeMode === "resize" || resizeMode === "both") {
          const targetWidth = parseInt(customWidth) || width;
          const targetHeight = parseInt(customHeight) || height;

          if (maintainAspectRatio) {
            const aspectRatio = width / height;
            if (customWidth && !customHeight) {
              width = targetWidth;
              height = targetWidth / aspectRatio;
            } else if (customHeight && !customWidth) {
              height = targetHeight;
              width = targetHeight * aspectRatio;
            } else if (customWidth && customHeight) {
              const scale = Math.min(targetWidth / width, targetHeight / height);
              width = width * scale;
              height = height * scale;
            }
          } else {
            width = targetWidth;
            height = targetHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Compress based on quality
        const qualityMap = {
          low: 0.5,
          medium: 0.7,
          high: 0.85,
          ultra: 0.95
        };

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                name: file.name,
                originalSize: file.size,
                processedSize: blob.size,
                url,
                originalUrl: URL.createObjectURL(file)
              });
            }
          },
          'image/jpeg',
          qualityMap[quality]
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const downloadImage = (image: ProcessedImage) => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `processed_${image.name}`;
    a.click();
  };

  const downloadAll = () => {
    processedImages.forEach(image => downloadImage(image));
    toast({
      title: "Downloaded All",
      description: "All processed images have been downloaded."
    });
  };

  const usePreset = (preset: typeof presetSizes[0]) => {
    setCustomWidth(preset.width.toString());
    setCustomHeight(preset.height.toString());
    setResizeMode("resize");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCompressionRatio = (original: number, processed: number): string => {
    const ratio = ((original - processed) / original) * 100;
    return ratio.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-teal-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full border border-green-500/20"
            >
              <ImageIcon className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Image Compressor & Resizer</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent"
            >
              Optimize Your Images
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Compress and resize images for web, social media, and any platform with perfect quality control
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload & Settings */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    Upload Images
                  </CardTitle>
                  <CardDescription>
                    Drag & drop or click to select images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileDropZone
                    accept={{
                      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"]
                    }}
                    multiple={true}
                    onDrop={onDrop}
                    className="border-2 border-dashed border-green-500/50 rounded-xl p-8 text-center hover:border-green-500 transition-all"
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">Drop Images Here</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, GIF, WebP up to 10MB each
                        </p>
                      </div>
                    </div>
                  </FileDropZone>

                  {images.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Images:</p>
                      {images.map((image, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                          <span className="truncate">{image.name}</span>
                          <span className="text-muted-foreground">{formatFileSize(image.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-teal-600" />
                    Processing Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Processing Mode</Label>
                    <Select value={resizeMode} onValueChange={(value: "compress" | "resize" | "both") => setResizeMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compress">Compress Only</SelectItem>
                        <SelectItem value="resize">Resize Only</SelectItem>
                        <SelectItem value="both">Compress & Resize</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(resizeMode === "compress" || resizeMode === "both") && (
                    <div className="space-y-2">
                      <Label>Quality Level</Label>
                      <Select value={quality} onValueChange={(value: QualityLevel) => setQuality(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {qualityOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(resizeMode === "resize" || resizeMode === "both") && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="width">Width (px)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(e.target.value)}
                            placeholder="Auto"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (px)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(e.target.value)}
                            placeholder="Auto"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="aspectRatio"
                          checked={maintainAspectRatio}
                          onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <Label htmlFor="aspectRatio" className="text-sm">
                          Maintain aspect ratio
                        </Label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">📐 Size Presets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {presetSizes.map((preset, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        onClick={() => usePreset(preset)}
                        className="h-auto p-3 text-left justify-start"
                      >
                        <div>
                          <div className="font-medium text-sm">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {preset.width} × {preset.height}px
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={processImages}
                disabled={isProcessing || images.length === 0}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Processing Images...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Process Images
                  </div>
                )}
              </Button>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        Processed Images
                      </CardTitle>
                      <CardDescription>
                        Your optimized images ready for download
                      </CardDescription>
                    </div>
                    {processedImages.length > 0 && (
                      <Button onClick={downloadAll} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {processedImages.length > 0 ? (
                    <div className="space-y-4">
                      {processedImages.map((image, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{image.name}</h4>
                              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                <span>Original: {formatFileSize(image.originalSize)}</span>
                                <span>Processed: {formatFileSize(image.processedSize)}</span>
                                <span className="text-green-600 font-medium">
                                  -{calculateCompressionRatio(image.originalSize, image.processedSize)}%
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => downloadImage(image)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Original</p>
                              <img 
                                src={image.originalUrl} 
                                alt="Original" 
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Processed</p>
                              <img 
                                src={image.url} 
                                alt="Processed" 
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                      <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Processed Images</h3>
                      <p className="text-sm max-w-md">
                        Upload images and click "Process Images" to see your optimized results here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Web Optimization</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Use JPEG for photos, PNG for graphics</li>
                        <li>• Aim for &lt; 100KB for web images</li>
                        <li>• Consider WebP for better compression</li>
                        <li>• Resize before compressing for best results</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Social Media</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Use exact dimensions for best quality</li>
                        <li>• High quality for profile pictures</li>
                        <li>• Medium quality for posts and banners</li>
                        <li>• Test on different devices</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
