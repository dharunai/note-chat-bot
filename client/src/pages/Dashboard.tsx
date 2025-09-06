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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-gray-900 hover:bg-gray-800 text-white p-2"
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Sidebar - Hidden on mobile, overlay on mobile when open */}
      <div className={`fixed left-0 top-0 w-64 h-full bg-gray-900 text-white p-4 z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center gap-3 mb-8 mt-12 md:mt-0">
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
      <div className={`h-screen bg-gray-50 overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-64'
      }`}>
        {!uploadedFile ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-2xl w-full text-center">
              <div className="mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                  Upload your document
                </h2>
                <p className="text-sm md:text-base text-gray-600 px-4 md:px-0">
                  Select a PDF, DOCX, or TXT file to start analyzing
                </p>
              </div>
              
              {/* File Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-xl md:rounded-2xl p-4 md:p-8 transition-all duration-300 cursor-pointer ${
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
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
                  </div>
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-1">
                    Choose a file or drag it here
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 text-center">
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
                <div className="mt-4 md:mt-8 bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border">
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm md:text-base">Uploading document...</p>
                    </div>
                    <div className="text-xs md:text-sm font-medium text-blue-600">{uploadProgress}%</div>
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
          <div className="flex overflow-x-auto snap-x snap-mandatory md:overflow-x-visible h-screen">
            {/* Mobile: Horizontal Swipe Layout, Desktop: Side-by-side */}
            {/* Document Panel */}
            <div className="snap-start w-screen md:w-1/2 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
              {/* Document Header */}
              <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base md:text-lg font-semibold text-gray-800">Document</h2>
                    <div className="md:hidden flex items-center gap-1 text-xs text-gray-500">
                      <span>•</span>
                      <span>Swipe right for chat</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs md:text-sm px-2 md:px-3"
                    onClick={downloadChat}
                  >
                    <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4 p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-gray-200">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-xs md:text-sm truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Document Preview */}
              <div className="flex-1 overflow-auto p-3 md:p-4">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 h-full">
                  <DocumentViewer file={uploadedFile} extractedText={fileContent} />
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="snap-start w-screen md:w-1/2 bg-white flex flex-col flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200">
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">Chat with PDF</h3>
                      <div className="md:hidden flex items-center gap-1 text-xs text-gray-500">
                        <span>•</span>
                        <span>Swipe left for document</span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 truncate">Ask your PDF questions</p>
                  </div>
                </div>
              </div>
              
              {/* Suggested Questions */}
              {showSuggestions && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 p-2 md:p-4">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-800">Suggested questions:</h4>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSuggestions(false)}
                      className="p-1 h-6 w-6 text-blue-600 hover:bg-blue-100"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {documentSuggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuestion(suggestion);
                          handleAskQuestion(suggestion);
                        }}
                        className="w-full text-left p-2 md:p-3 text-xs md:text-sm text-blue-700 bg-white rounded-lg md:rounded-xl border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500 group-hover:text-blue-600 text-sm">💡</span>
                          <span className="leading-relaxed text-left">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-auto p-2 md:p-4 space-y-3 md:space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-start gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                    {/* Bot Avatar - Left Side */}
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`max-w-[80%] xs:max-w-[75%] sm:max-w-[70%] md:max-w-[65%] ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-2xl rounded-br-md ml-auto'
                        : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md mr-auto'
                    } px-3 py-2 md:px-4 md:py-3 shadow-sm`}>
                      {message.role === 'assistant' ? (
                        <div
                          className="text-sm leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatAIResponse(message.content) }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* User Avatar - Right Side */}
                    {message.role === 'user' && (
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-2 md:gap-3 justify-start w-full">
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3 py-2 md:px-4 md:py-3 shadow-sm mr-auto">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
                <div className="relative">
                  <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask me anything about your document..."
                    className="w-full rounded-full border border-gray-300 pl-10 md:pl-12 pr-12 md:pr-12 py-3 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-8 md:w-8 p-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Send className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {question.length}/1000
                  </p>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                    <span>Press Enter to send</span>
                  </div>
                  <div className="sm:hidden text-xs text-gray-400">
                    <span>Tap send</span>
                  </div>
                </div>
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
