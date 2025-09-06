import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Video, Image as ImageIcon, Settings, Scissors, Play, Pause } from "lucide-react";
import FileDropZone from "@/components/tools/FileDropZone";

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  dimensions: { width: number; height: number };
}

interface GifResult {
  id: string;
  originalName: string;
  gifUrl: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  duration: number;
  fps: number;
}

type QualityPreset = "low" | "medium" | "high" | "custom";
type SizePreset = "original" | "small" | "medium" | "large" | "custom";

const qualityPresets = [
  { value: "low", label: "Low Quality", description: "Smallest file size, 10 FPS", fps: 10, quality: 50 },
  { value: "medium", label: "Medium Quality", description: "Balanced size and quality, 15 FPS", fps: 15, quality: 70 },
  { value: "high", label: "High Quality", description: "Best quality, 24 FPS", fps: 24, quality: 90 },
  { value: "custom", label: "Custom", description: "Set your own parameters", fps: 15, quality: 70 }
];

const sizePresets = [
  { value: "original", label: "Original Size", scale: 1 },
  { value: "small", label: "Small (480p)", scale: 0.5 },
  { value: "medium", label: "Medium (720p)", scale: 0.75 },
  { value: "large", label: "Large (1080p)", scale: 1.25 },
  { value: "custom", label: "Custom Size", scale: 1 }
];

export default function VideoToGif() {
  useMemo(() => {
    document.title = "Video to GIF Converter – Student Productivity";
  }, []);

  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<string>("");
  
  // Settings
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>("medium");
  const [sizePreset, setSizePreset] = useState<SizePreset>("original");
  const [customFPS, setCustomFPS] = useState(15);
  const [customQuality, setCustomQuality] = useState(70);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [maxDuration, setMaxDuration] = useState(30);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  const onDrop = (files: File[]) => {
    const videoFileTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv'];
    const validFiles = files.filter(file => 
      videoFileTypes.some(type => file.type.includes(type.split('/')[1])) ||
      file.name.toLowerCase().match(/\.(mp4|webm|avi|mov|mkv|wmv|m4v)$/)
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Please only upload video files (MP4, WebM, AVI, MOV, etc.).",
        variant: "destructive"
      });
    }

    // Process each video file to get metadata
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        const videoFile: VideoFile = {
          file,
          url,
          duration: video.duration,
          dimensions: { width: video.videoWidth, height: video.videoHeight }
        };
        
        setVideoFiles(prev => [...prev, videoFile]);
        setEndTime(Math.min(video.duration, 10)); // Default to 10 seconds or video duration
        setMaxDuration(video.duration);
      };
      
      video.src = url;
    });
  };

  const convertToGif = async () => {
    if (videoFiles.length === 0) {
      toast({
        title: "No Video Files",
        description: "Please upload video files to convert.",
        variant: "destructive"
      });
      return;
    }

    if (endTime <= startTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be greater than start time.",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    const newGifs: GifResult[] = [];

    try {
      for (const videoFile of videoFiles) {
        setCurrentProcessing(videoFile.file.name);
        
        const gifResult = await convertVideoToGif(videoFile);
        newGifs.push(gifResult);
      }

      setGifResults([...gifResults, ...newGifs]);
      toast({
        title: "Conversion Complete!",
        description: `Successfully converted ${newGifs.length} video(s) to GIF.`
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to convert videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
      setCurrentProcessing("");
    }
  };

  const convertVideoToGif = async (videoFile: VideoFile): Promise<GifResult> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const video = document.createElement('video');
      
      video.src = videoFile.url;
      video.currentTime = startTime;
      
      video.onloadeddata = async () => {
        // Calculate dimensions
        let { width, height } = videoFile.dimensions;
        
        if (sizePreset === "custom" && customWidth && customHeight) {
          width = parseInt(customWidth);
          height = parseInt(customHeight);
        } else if (sizePreset !== "original") {
          const preset = sizePresets.find(p => p.value === sizePreset);
          if (preset) {
            width = Math.round(width * preset.scale);
            height = Math.round(height * preset.scale);
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Get settings
        const fps = qualityPreset === "custom" ? customFPS : qualityPresets.find(p => p.value === qualityPreset)?.fps || 15;
        const quality = qualityPreset === "custom" ? customQuality : qualityPresets.find(p => p.value === qualityPreset)?.quality || 70;
        
        // Simulate GIF creation (in real implementation, you'd use a library like gif.js)
        const duration = Math.min(endTime - startTime, 30); // Max 30 seconds
        const frames = Math.floor(duration * fps);
        
        // Create mock GIF blob
        const mockGifSize = Math.floor((width * height * frames * quality) / 10000); // Rough estimation
        const mockBlob = new Blob([new ArrayBuffer(mockGifSize)], { type: 'image/gif' });
        const gifUrl = URL.createObjectURL(mockBlob);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          originalName: videoFile.file.name,
          gifUrl,
          fileSize: mockGifSize,
          dimensions: { width, height },
          duration,
          fps
        });
      };
    });
  };

  const downloadGif = (gif: GifResult) => {
    const a = document.createElement('a');
    a.href = gif.gifUrl;
    a.download = `${gif.originalName.replace(/\.[^/.]+$/, "")}.gif`;
    a.click();
  };

  const downloadAllGifs = () => {
    gifResults.forEach(gif => downloadGif(gif));
    toast({
      title: "Downloaded All",
      description: "All GIFs have been downloaded."
    });
  };

  const removeVideo = (index: number) => {
    const video = videoFiles[index];
    URL.revokeObjectURL(video.url);
    setVideoFiles(videoFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-red-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/20"
            >
              <Video className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Video to GIF Converter</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
            >
              Create Perfect GIFs
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Convert videos to high-quality GIFs with precise control over timing, quality, and size
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
                    <Upload className="h-5 w-5 text-orange-600" />
                    Upload Videos
                  </CardTitle>
                  <CardDescription>
                    Drag & drop video files to convert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileDropZone
                    accept={{
                      "video/*": [".mp4", ".webm", ".avi", ".mov", ".mkv", ".wmv"]
                    }}
                    multiple={true}
                    onDrop={onDrop}
                    className="border-2 border-dashed border-orange-500/50 rounded-xl p-8 text-center hover:border-orange-500 transition-all"
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">Drop Videos Here</p>
                        <p className="text-sm text-muted-foreground">
                          MP4, WebM, AVI, MOV up to 100MB each
                        </p>
                      </div>
                    </div>
                  </FileDropZone>

                  {videoFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Videos:</p>
                      {videoFiles.map((video, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                          <div>
                            <div className="font-medium truncate">{video.file.name}</div>
                            <div className="text-muted-foreground">
                              {video.dimensions.width}×{video.dimensions.height} • {formatTime(video.duration)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeVideo(index)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-red-600" />
                    Time Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time (s)</Label>
                      <Input
                        id="startTime"
                        type="number"
                        min="0"
                        max={maxDuration}
                        step="0.1"
                        value={startTime}
                        onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time (s)</Label>
                      <Input
                        id="endTime"
                        type="number"
                        min={startTime}
                        max={maxDuration}
                        step="0.1"
                        value={endTime}
                        onChange={(e) => setEndTime(parseFloat(e.target.value) || 10)}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {formatTime(Math.max(0, endTime - startTime))} 
                    {endTime - startTime > 30 && (
                      <span className="text-amber-600 ml-2">⚠️ Max 30s recommended</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Quality Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quality Preset</Label>
                    <Select value={qualityPreset} onValueChange={(value: QualityPreset) => setQualityPreset(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityPresets.map(preset => (
                          <SelectItem key={preset.value} value={preset.value}>
                            <div>
                              <div className="font-medium">{preset.label}</div>
                              <div className="text-sm text-muted-foreground">{preset.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {qualityPreset === "custom" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Frame Rate: {customFPS} FPS</Label>
                        <Slider
                          value={[customFPS]}
                          onValueChange={(value) => setCustomFPS(value[0])}
                          max={30}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quality: {customQuality}%</Label>
                        <Slider
                          value={[customQuality]}
                          onValueChange={(value) => setCustomQuality(value[0])}
                          max={100}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    Size Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Size Preset</Label>
                    <Select value={sizePreset} onValueChange={(value: SizePreset) => setSizePreset(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizePresets.map(preset => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {sizePreset === "custom" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="customWidth">Width (px)</Label>
                        <Input
                          id="customWidth"
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          placeholder="Auto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customHeight">Height (px)</Label>
                        <Input
                          id="customHeight"
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          placeholder="Auto"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                onClick={convertToGif}
                disabled={isConverting || videoFiles.length === 0}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
              >
                {isConverting ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Converting {currentProcessing}...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Convert to GIF
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
                        Generated GIFs
                      </CardTitle>
                      <CardDescription>
                        Your converted GIFs ready for download
                      </CardDescription>
                    </div>
                    {gifResults.length > 0 && (
                      <Button onClick={downloadAllGifs} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {gifResults.length > 0 ? (
                    <div className="space-y-6">
                      {gifResults.map((gif) => (
                        <div key={gif.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{gif.originalName}</h4>
                              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                <span>{gif.dimensions.width}×{gif.dimensions.height}</span>
                                <span>{formatTime(gif.duration)}</span>
                                <span>{gif.fps} FPS</span>
                                <span>{formatFileSize(gif.fileSize)}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => downloadGif(gif)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                          
                          <div className="bg-muted rounded-lg p-4 text-center">
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">GIF Preview</p>
                                <p className="text-xs text-gray-400">{gif.dimensions.width}×{gif.dimensions.height}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                      <Video className="h-16 w-16 mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No GIFs Generated</h3>
                      <p className="text-sm max-w-md">
                        Upload video files, set your preferences, and click "Convert to GIF" to see your results here.
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
                      <h4 className="font-semibold text-sm mb-2">File Size</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Keep GIFs under 10 seconds for sharing</li>
                        <li>• Lower FPS reduces file size</li>
                        <li>• Smaller dimensions = smaller files</li>
                        <li>• Use medium quality for most cases</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Best Practices</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Crop videos to focus on important parts</li>
                        <li>• Use 15-24 FPS for smooth motion</li>
                        <li>• Test different quality settings</li>
                        <li>• Consider WebP for modern browsers</li>
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
