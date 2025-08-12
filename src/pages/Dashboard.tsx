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
import { supabase } from '@/integrations/supabase/client';
import { Upload, MessageSquare, LogOut, BookOpen, FileText, Sparkles, Cpu, Mail, Instagram, Linkedin } from 'lucide-react';
import ModelSelector from '@/components/chat/ModelSelector';
import { extractTextFromFile } from '@/lib/fileExtractors';
import ChatMessage from '@/components/chat/ChatMessage';
import SuggestionChips from '@/components/chat/SuggestionChips';
import DocumentViewer from '@/components/chat/DocumentViewer';
const Dashboard = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [model, setModel] = useState<string | null>(null);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  type ChatMessageType = {
    role: 'assistant' | 'user';
    content: string;
  };
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  useEffect(() => {
    const saved = sessionStorage.getItem('activeModel');
    if (saved) setModel(saved);
    document.title = 'NoteBot AI — Dashboard';
  }, []);
  const handleModelSelect = (choice: "Google Gemini" | "OpenAI GPT") => {
    setModel(choice);
    sessionStorage.setItem('activeModel', choice);
    setShowModelDialog(false);
    toast({
      title: 'Model selected',
      description: `Using ${choice} for this session.`
    });
    if (choice === 'OpenAI GPT') {
      toast({
        title: 'Heads up',
        description: 'OpenAI support will be enabled next. Using Gemini endpoint for now.',
        variant: 'default'
      });
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive"
      });
      return;
    }
    setUploadedFile(file);

    // Upload to Supabase Storage (if logged in)
    if (user) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('student-files').upload(fileName, file);
      if (error) {
        toast({
          title: "Upload Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    }

    // Extract text client-side
    try {
      const text = await extractTextFromFile(file);
      setFileContent(text);
    } catch (err: any) {
      toast({
        title: 'Extraction failed',
        description: err?.message || 'Unable to read file text.',
        variant: 'destructive'
      });
      setFileContent('');
    }
    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded successfully.`
    });
    const defaultSuggestions = ['Summarize this document', 'What are the key points?', 'Explain this section in simple terms', `How does this relate to ${file.name.split('.')[0]}?`];
    setSuggestions(defaultSuggestions);

    // Auto-start: greeting + concise summary
    if (model) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Analyzing your document… generating a quick summary."
      }]);
      const autoPrompt = "Provide a warm, friendly greeting and a concise summary of the uploaded document. Remove any markdown symbols like #, *, `, and keep the formatting clean with short paragraphs or bullet points.";
      await handleAskQuestion(autoPrompt);
    } else {
      setShowModelDialog(true);
    }
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
    if (!model) {
      setShowModelDialog(true);
      toast({
        title: "Choose a model",
        description: "Please select Google Gemini or OpenAI GPT to continue."
      });
      return;
    }
    setLoading(true);
    setAnswer('');
    setQuestion('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: q
    }]);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          question: q,
          fileContent: uploadedFile ? fileContent : null,
          fileName: uploadedFile?.name || null,
          model
        }
      });
      if (error) throw error;
      const cleaned = cleanText(data.answer || '');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleaned
      }]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-cosmic">
      <header className="border-b bg-card/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent tracking-tight md:text-base">NoteBot AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowModelDialog(true)} className="px-4 py-2 bg-card rounded-lg shadow text-sm flex items-center gap-2 border-0 transition-smooth">
              <Cpu className="h-4 w-4" />
              {model ? `Model: ${model}` : 'Choose Model'}
            </Button>
            <Button onClick={() => setShowContactDialog(true)} className="px-4 py-2 bg-card rounded-lg shadow text-sm flex items-center gap-2 border-0 transition-smooth">
              <Mail className="h-4 w-4" />
              Contact Us
            </Button>
            {user && (
              <Button onClick={signOut} className="px-4 py-2 bg-card rounded-lg shadow text-sm flex items-center gap-2 border-0 transition-smooth">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <section className="relative overflow-hidden rounded-3xl bg-cosmic p-10 mb-8 shadow-glow border border-border/50">
          <div className="max-w-3xl">

            <h2 className="text-4xl md:text-6xl font-bold mb-3 tracking-tight leading-[0.9]">
              <span className="relative inline-block">
                <span className="absolute -inset-1 blur-2xl opacity-20 bg-gradient-to-r from-primary to-accent rounded-2xl"></span>
                <span className="relative">Turn Your Notes Into a Conversation</span>
              </span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl">Upload your notes and I’ll summarize them automatically so you can chat with your content right away.</p>
            <div className="flex gap-3">
              <Button onClick={() => fileInputRef.current?.click()} className="shadow-glow">Upload a File</Button>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* File Upload Section */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="file-upload" className="text-sm font-medium">Choose File</Label>
                    <Input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt" className="mt-2 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-smooth" />
                  </div>
                  {uploadedFile && <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 p-2 rounded-lg">
                          <FileText className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • Uploaded successfully
                          </p>
                        </div>
                      </div>
                    </div>}
                </div>
              </CardContent>
            </Card>

            {/* Document Preview */}
            <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Document Preview</CardTitle>
                <CardDescription>Embedded preview or extracted text</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentViewer file={uploadedFile} extractedText={fileContent} />
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                Chat
              </CardTitle>
              <CardDescription className="text-base">Don't worry Notebot AI is here to Assist You </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-3 max-h-[60vh] overflow-auto pr-1">
                  {messages.map((m, idx) => <ChatMessage key={idx} role={m.role} content={m.content} />)}
                </div>

                {messages[messages.length - 1]?.role === 'assistant' && suggestions.length > 0 && <SuggestionChips suggestions={suggestions} onClick={t => handleAskQuestion(t)} />}

                <div>
                  <Label htmlFor="question" className="text-sm font-medium"></Label>
                  <Textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Type a question — or tap a suggestion above" className="mt-2 min-h-[100px] resize-none transition-smooth focus:ring-2 focus:ring-primary" rows={4} />
                </div>
                <Button onClick={() => handleAskQuestion()} disabled={loading} className="w-full h-12 text-base gradient-primary shadow-glow hover:shadow-lg transition-smooth">
                  {loading ? <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Thinking...
                    </div> : <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send
                    </>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Contact Us</DialogTitle>
              <DialogDescription>Was There Any bugs ..?</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <a href="mailto:dharunshanmugavel12@gmail.com" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-smooth">
                <Mail className="h-4 w-4 text-primary" />
                <span>dharunshanmugavel12@gmail.com</span>
              </a>
              <a href="https://www.instagram.com/_havoc_dharun_/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-smooth">
                <Instagram className="h-4 w-4 text-primary" />
                <span>_havoc_dharun_</span>
              </a>
              <a href="https://www.linkedin.com/in/dharun-shanmugavel-bb7304315" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-smooth">
                <Linkedin className="h-4 w-4 text-primary" />
                <span>Dharun Shanmugavel</span>
              </a>
            </div>
          </DialogContent>
        </Dialog>
        <ModelSelector open={showModelDialog} onSelect={handleModelSelect} />
      </div>
    </div>;
};
export default Dashboard;