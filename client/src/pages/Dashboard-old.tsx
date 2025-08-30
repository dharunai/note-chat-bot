import { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Upload, MessageSquare, LogOut, BookOpen, FileText, Sparkles, Cpu, Mail, Instagram, Linkedin, Bot, Zap, Stars, Send, FileUp, Brain, Lightbulb, User, Plus, Paperclip, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { extractTextFromFile } from '@/lib/fileExtractors';
import ChatMessage from '@/components/chat/ChatMessage';
import SuggestionChips from '@/components/chat/SuggestionChips';
import DocumentViewer from '@/components/chat/DocumentViewer';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  
  // Dashboard is now available without authentication

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadAnimation, setShowUploadAnimation] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [userName] = useState('User'); // Can be made dynamic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  type ChatMessageType = {
    role: 'assistant' | 'user';
    content: string;
  };
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Write a to-do list for a personal project or task',
    'Generate an email or reply to a job offer', 
    'Summarize this article or text for me in one paragraph',
    'How does AI work in a technical capacity'
  ]);
  
  // Auto-select Gemini for seamless experience - no model selection needed
  const model = "Google Gemini";
  
  useEffect(() => {
    document.title = 'NoteBot AI — Dashboard';
  }, []);
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setShowUploadAnimation(true);
    setUploadProgress(0);
    
    // Animate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 15;
      });
    }, 120);

    try {
      // Extract text client-side
      const text = await extractTextFromFile(file);
      setFileContent(text);
      
      // Success animation
      setTimeout(() => {
        setUploadProgress(0);
        setShowUploadAnimation(false);
      }, 1000);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
      
      const defaultSuggestions = [
        'Summarize this document for me',
        'What are the key points in this document?', 
        'Explain the main ideas in simple terms',
        `What projects have you worked on related to ${file.name.split('.')[0]}?`,
        'What achievements are mentioned in this document?',
        'What technical skills are highlighted here?'
      ];
      setSuggestions(defaultSuggestions);

      // Auto-start: greeting + concise summary (no model selection needed)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "🤖 Analyzing your document… generating a quick summary."
      }]);
      
      const autoPrompt = "Provide a warm, friendly greeting and a concise summary of the uploaded document. Remove any markdown symbols like #, *, `, and keep the formatting clean with short paragraphs or bullet points.";
      await handleAskQuestion(autoPrompt);
      
    } catch (err: any) {
      toast({
        title: 'Extraction failed',
        description: err?.message || 'Unable to read file text.',
        variant: 'destructive'
      });
      setFileContent('');
      setUploadProgress(0);
      setShowUploadAnimation(false);
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && 
        file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive"
      });
      return;
    }
    
    await handleFileUpload(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && 
        file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive"
      });
      return;
    }
    
    await handleFileUpload(file);
  };
  const cleanText = (txt: string) => txt.replace(/^[#>*-]\s?/gm, '').replace(/[`*_]/g, '').replace(/\n{3,}/g, '\n\n').trim();
  
  const handleAskQuestion = async (override?: string) => {
    const q = (override ?? question).trim();
    if (!q) {
      toast({
        title: "No Question",
        description: "Please enter a question.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setIsTyping(true);
    setAnswer('');
    setQuestion('');
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: q
    }]);
    
    try {
      const response = await fetch('/api/chat-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: q,
          fileContent: uploadedFile ? fileContent : null,
          fileName: uploadedFile?.name || null,
          userId: null // No user authentication needed for basic features
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      
      const data = await response.json();
      const cleaned = cleanText(data.answer || '');
      
      // Simulate typing effect
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleaned
      }]);
      
    } catch (error: any) {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white p-4 z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold">NoteBot AI</h1>
        </div>
        
        <Button className="w-full mb-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
          <Plus className="h-4 w-4 mr-2" />
          New chat
        </Button>
        
        <div className="space-y-2">
          <div className="text-sm text-gray-400 px-2">Recent</div>
          {uploadedFile && (
            <div className="p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
              📄 {uploadedFile.name.substring(0, 20)}...
            </div>
          )}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {userName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{userName}</div>
              <div className="text-xs text-gray-400">Free plan</div>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowContactDialog(true)}
            className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-white text-sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
          
          {user && (
            <Button 
              onClick={signOut}
              className="w-full mt-2 bg-red-900 hover:bg-red-800 text-white text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-3xl w-full text-center">
              <h2 className="text-4xl font-semibold text-gray-800 mb-4">
                Hi there, <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{userName}</span>
              </h2>
              <h3 className="text-3xl text-gray-600 mb-8">What would like to know?</h3>
              <p className="text-gray-500 mb-12">Use one of the most common prompts below or use your own to begin</p>
              
              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300"
                    onClick={() => handleAskQuestion(suggestion)}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {index === 0 && <User className="h-4 w-4 text-gray-600" />}
                          {index === 1 && <Mail className="h-4 w-4 text-gray-600" />}
                          {index === 2 && <FileText className="h-4 w-4 text-gray-600" />}
                          {index === 3 && <Brain className="h-4 w-4 text-gray-600" />}
                        </div>
                        <p className="text-sm text-gray-700 text-left leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button 
                onClick={() => setSuggestions([
                  'Help me write a professional email',
                  'Create a study plan for my exams',
                  'Explain quantum computing simply',
                  'Draft a project proposal outline'
                ])}
                className="text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Prompts
              </Button>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className={`flex ${uploadedFile ? 'h-screen' : ''}`}>
            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${uploadedFile ? 'w-2/3' : 'w-full'}`}>
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((message, index) => (
                    <div key={index} className="animate-in slide-in-from-bottom-4 duration-500">
                      <ChatMessage role={message.role} content={message.content} />
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl p-4">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="border-t bg-white p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask whatever you want..."
                      className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-20 min-h-[60px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAskQuestion();
                        }
                      }}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 h-8 w-8 hover:bg-gray-100"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8 hover:bg-gray-100"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleAskQuestion()}
                        disabled={loading || !question.trim()}
                        size="sm"
                        className="h-8 w-8 p-0 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    0/1000
                  </div>
                </div>
              </div>
            </div>
            
            {/* Document Sidebar */}
            {uploadedFile && (
              <div className="w-1/3 border-l bg-gray-50 flex flex-col">
                <div className="p-4 border-b bg-white">
                  <h3 className="font-semibold text-gray-800 mb-2">Document</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-auto">
                  <h4 className="font-medium text-gray-700 mb-3">Suggested questions:</h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3 text-sm text-gray-600 hover:bg-gray-100 whitespace-normal"
                        onClick={() => handleAskQuestion(suggestion)}
                      >
                        {suggestion} →
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t">
                  <DocumentViewer file={uploadedFile} extractedText={fileContent} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particleAnimations.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.id * 0.2}s`,
              animationDuration: `${3 + (particle.id % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Floating Orb Effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NoteBot AI
              </h1>
              <p className="text-sm text-blue-300/70">Powered by Google Gemini</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowContactDialog(true)} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
            {user && (
              <Button 
                onClick={signOut} 
                className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30 text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section with Creative Effects */}
        <section className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
            <h2 className="relative text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              Turn Your Notes
              <br />
              Into Conversations
            </h2>
          </div>
          
          <p className="text-xl text-blue-200/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload your documents and chat with them instantly. 
            <span className="text-purple-300"> AI-powered insights</span> at your fingertips.
          </p>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="group relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative flex items-center gap-3">
                <FileUp className="h-6 w-6" />
                Upload Your Notes
                <Sparkles className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Button>
            
            <div className="flex items-center gap-2 text-blue-300/60">
              <Brain className="h-5 w-5" />
              <span>Supports PDF, DOCX, TXT</span>
            </div>
          </div>
        </section>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section with Enhanced UI */}
          <div className="space-y-6">
            {/* Interactive File Upload Zone */}
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg blur opacity-50" />
                    <div className="relative bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
                      <FileUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  Document Upload
                </CardTitle>
                <CardDescription className="text-blue-200/70">
                  Drag & drop or click to upload your notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-500/10 scale-105' 
                      : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {showUploadAnimation ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <FileUp className="h-8 w-8 text-white" />
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-blue-300">Processing your document...</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{uploadedFile.name}</p>
                        <p className="text-sm text-green-300">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Ready to chat!
                        </p>
                      </div>
                      <Button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        Upload Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white mb-2">Drop your files here</p>
                        <p className="text-blue-200/70">or click to browse</p>
                        <p className="text-sm text-blue-300/60 mt-2">Supports PDF, DOCX, TXT files</p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Document Preview with Glass Effect */}
            {uploadedFile && (
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-50" />
                      <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    Document Preview
                  </CardTitle>
                  <CardDescription className="text-blue-200/70">
                    Your uploaded content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentViewer file={uploadedFile} extractedText={fileContent} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Chat Section */}
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg blur opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-pink-500 to-orange-500 p-2 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                </div>
                AI Chat Assistant
                {isTyping && (
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                )}
              </CardTitle>
              <CardDescription className="text-blue-200/70">
                Powered by Google Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages Container with Enhanced Styling */}
                <div className="max-h-[60vh] overflow-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center opacity-50">
                        <Bot className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-blue-200/70">
                        {uploadedFile 
                          ? "Your document is ready! Ask me anything about it." 
                          : "Upload a document to start chatting with your notes."
                        }
                      </p>
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div key={idx} className="animate-in slide-in-from-bottom-4 duration-500">
                        <ChatMessage role={m.role} content={m.content} />
                      </div>
                    ))
                  )}
                  
                  {isTyping && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-200/70">AI is thinking</span>
                        <div className="flex gap-1 ml-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestion Chips with Enhanced Styling */}
                {messages[messages.length - 1]?.role === 'assistant' && suggestions.length > 0 && (
                  <div className="animate-in fade-in duration-500">
                    <SuggestionChips 
                      suggestions={suggestions} 
                      onClick={(suggestion) => handleAskQuestion(suggestion)} 
                    />
                  </div>
                )}

                {/* Enhanced Input Section */}
                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={uploadedFile ? "Ask me anything about your document..." : "Upload a document first to start chatting"}
                      className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-blue-200/50 resize-none focus:border-blue-400 focus:ring-blue-400/50 transition-all duration-300"
                      disabled={!uploadedFile}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAskQuestion();
                        }
                      }}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <div className="text-xs text-blue-300/60">
                        {uploadedFile ? "Enter to send" : "Upload document first"}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleAskQuestion()}
                    disabled={loading || !uploadedFile || !question.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>AI is thinking...</span>
                        <Brain className="h-5 w-5 opacity-50" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                        <Zap className="h-5 w-5 opacity-70" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Contact Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Get in Touch
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Connect with our team for support, feedback, or collaboration opportunities.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <a 
                href="mailto:dharunshanmugavel12@gmail.com" 
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
              >
                <div className="bg-red-500 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-sm text-gray-600 break-all">dharunshanmugavel12@gmail.com</p>
                </div>
              </a>
              
              <a 
                href="https://www.instagram.com/_havoc_dharun_/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
              >
                <div className="bg-pink-500 p-2 rounded-lg">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Instagram</p>
                  <p className="text-sm text-gray-600">@_havoc_dharun_</p>
                </div>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/dharun-shanmugavel-bb7304315" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
              >
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Linkedin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">LinkedIn</p>
                  <p className="text-sm text-gray-600">Dharun Shanmugavel</p>
                </div>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default Dashboard;