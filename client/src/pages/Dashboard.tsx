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
import { Upload, MessageSquare, LogOut, BookOpen, FileText, Sparkles, Cpu, Mail, Instagram, Linkedin, Bot, Zap, Stars, Send, FileUp, Brain, Lightbulb, User, Plus, Paperclip, Image as ImageIcon, RefreshCw, Download, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [userName] = useState('User');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic suggestions based on document content
  const [documentSuggestions, setDocumentSuggestions] = useState<string[]>([
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the important dates mentioned?",
    "Who are the key people or organizations?",
  ]);

  const suggestedQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the important dates mentioned?",
    "Who are the key people or organizations?",
    "What are the main conclusions?",
    "Are there any important statistics or data?",
  ];

  const downloadChat = () => {
    if (!messages.length) return;
    
    const chatData = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateDocumentSuggestions = (fileName: string, content: string) => {
    const isResume = fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv');
    const isBusinessDoc = content.toLowerCase().includes('business') || content.toLowerCase().includes('analytics');
    
    if (isResume) {
      return [
        "What are the key skills mentioned in this resume?",
        "What work experience is highlighted?",
        "What educational qualifications are listed?",
        "What achievements or projects are mentioned?",
        "What technical skills does this person have?",
        "What certifications are included?"
      ];
    } else if (isBusinessDoc) {
      return [
        "What are the main business objectives?",
        "What analytics tools or methods are discussed?",
        "What are the key findings or insights?",
        "What recommendations are provided?",
        "What data sources are mentioned?",
        "What business metrics are analyzed?"
      ];
    } else {
      return [
        "What is the main topic of this document?",
        "Can you summarize the key points?",
        "What are the important dates mentioned?",
        "Who are the key people or organizations?",
        "What are the main conclusions?",
        "Are there any important statistics or data?"
      ];
    }
  };

  const formatAIResponse = (text: string) => {
    // Better formatting for AI responses
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '• ')
      .replace(/\d+\. /g, (match) => `<strong>${match}</strong>`);
  };
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
      
      // Update suggestions with document-specific questions
      setSuggestions(suggestedQuestions);
      
      // Generate dynamic suggestions based on document type and content
      const dynamicSuggestions = generateDocumentSuggestions(file.name, text);
      setDocumentSuggestions(dynamicSuggestions);

      // Don't auto-start with greeting - let user initiate conversation
      
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
      
      // Hide suggestions after first interaction
      if (messages.length === 0) {
        setTimeout(() => setShowSuggestions(false), 3000);
      }
      
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
        
        {/* Download Chat Button */}
        {messages.length > 0 && (
          <div className="mt-4">
            <Button 
              onClick={downloadChat}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Chat
            </Button>
          </div>
        )}
        
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
      <div className="ml-64 h-screen bg-gray-50 overflow-hidden">
        {!uploadedFile ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-2xl w-full text-center">
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Upload your document
                </h2>
                <p className="text-gray-600">
                  Select a PDF, DOCX, or TXT file to start analyzing
                </p>
              </div>
              
              {/* File Upload Zone */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-1">
                    Choose a file or drag it here
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOCX, TXT up to 10MB
                  </p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              
              {/* Upload Animation */}
              {showUploadAnimation && (
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Uploading document...</p>
                      <p className="text-sm text-gray-500">{uploadedFile?.name}</p>
                    </div>
                    <div className="text-sm font-medium text-blue-600">{uploadProgress}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-screen">
            {/* Left Side - Document */}
            <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
              {/* Document Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Document</h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={downloadChat}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center gap-3 mt-4 p-3 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Document Preview */}
              <div className="flex-1 overflow-auto p-4">
                <div className="bg-gray-50 rounded-lg p-4 h-full">
                  <DocumentViewer file={uploadedFile} extractedText={fileContent} />
                </div>
              </div>
            </div>

            {/* Right Side - Chat */}
            <div className="w-1/2 bg-white flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Chat with PDF</h3>
                    <p className="text-sm text-gray-500">Ask your PDF questions</p>
                  </div>
                </div>
              </div>
              
              {/* Suggested Questions */}
              {showSuggestions && (
                <div className="bg-blue-50 border-b border-blue-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-800">Suggested questions:</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSuggestions(false)}
                      className="p-1 h-6 w-6 text-blue-600"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {documentSuggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuestion(suggestion);
                          handleAskQuestion(suggestion);
                        }}
                        className="w-full text-left p-2 text-xs text-blue-700 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        {suggestion} →
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatAIResponse(message.content) }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Hey! Ask me anything about your PDF..."
                    className="w-full rounded-full border border-gray-300 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion();
                      }
                    }}
                  />
                  <Button
                    onClick={() => handleAskQuestion()}
                    disabled={loading || !question.trim()}
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">0/1000</p>
              </div>
            </div>
          </div>
        )}
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
  );
};

export default Dashboard;
