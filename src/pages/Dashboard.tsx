import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, MessageSquare, History, LogOut, BookOpen, FileText, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('student-files')
      .upload(fileName, file);

    if (error) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, simulate file content extraction
    if (file.type === 'text/plain') {
      const text = await file.text();
      setFileContent(text);
    } else {
      // Simulate content for PDF/DOCX files
      setFileContent(`Content from ${file.name}: This is a sample document about various topics. Students can ask questions about the content and get AI-powered answers.`);
    }

    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "No Question",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          question,
          fileContent: uploadedFile ? fileContent : null,
          fileName: uploadedFile?.name || null,
        }
      });

      if (error) throw error;

      setAnswer(data.answer);
      setQuestion('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              NoteBot AI Dashboard
            </h1>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/history'}
              className="hover:bg-primary/5 transition-smooth"
            >
              <History className="h-4 w-4 mr-2" />
              Chat History
            </Button>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="hover:bg-destructive/5 hover:text-destructive transition-smooth"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Upload className="h-5 w-5 text-blue-500" />
                </div>
                Upload Study File
              </CardTitle>
              <CardDescription className="text-base">
                Upload a PDF, DOCX, or TXT file to start asking questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium">Choose File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt"
                    className="mt-2 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-smooth"
                  />
                </div>
                {uploadedFile && (
                  <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                Ask Questions
              </CardTitle>
              <CardDescription className="text-base">
                Ask questions about your uploaded file or general study topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="question" className="text-sm font-medium">Your Question</Label>
                  <Textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What would you like to know about your file?"
                    className="mt-2 min-h-[100px] resize-none transition-smooth focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleAskQuestion}
                  disabled={loading}
                  className="w-full h-12 text-base gradient-primary shadow-glow hover:shadow-lg transition-smooth"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Getting Answer...
                    </div>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask Question
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Answer Section */}
        {answer && (
          <Card className="mt-8 shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                AI Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">{answer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;