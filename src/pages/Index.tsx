import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MessageSquare, History, BookOpen, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Turn Your Notes Into a Conversation
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Studying doesn't have to be one-way anymore. Upload your files and start an AI-powered conversation with your study materials.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = '/auth'}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload a File & Start Chatting
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = '/auth'}
            >
              <History className="h-5 w-5 mr-2" />
              View Chat History
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle>Upload Your Files</CardTitle>
              <CardDescription>
                Support for PDF, DOCX, and TXT files. Secure storage in the cloud.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle>Ask Natural Questions</CardTitle>
              <CardDescription>
                Chat with your documents like you're talking to a study buddy.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardTitle>Get Smart Answers</CardTitle>
              <CardDescription>
                Powered by Google's Gemini AI for accurate, contextual responses.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Study Sessions?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of students who are already having conversations with their notes.
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started for Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
