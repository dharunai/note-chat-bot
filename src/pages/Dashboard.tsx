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
import { Upload, MessageSquare, History, LogOut } from 'lucide-react';

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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">NoteBot AI Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/history'}>
              <History className="h-4 w-4 mr-2" />
              Chat History
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Study File
              </CardTitle>
              <CardDescription>
                Upload a PDF, DOCX, or TXT file to start asking questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Choose File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt"
                    className="mt-2"
                  />
                </div>
                {uploadedFile && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Uploaded: {uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Ask Questions
              </CardTitle>
              <CardDescription>
                Ask questions about your uploaded file or general study topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What would you like to know about your file?"
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleAskQuestion}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Getting Answer...' : 'Ask Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Answer Section */}
        {answer && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{answer}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;