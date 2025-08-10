import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MessageSquare, BookOpen, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-slow rounded-full bg-primary/20 scale-110"></div>
              <div className="relative bg-primary/10 p-6 rounded-full shadow-elegant animate-float">
                <BookOpen className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent leading-tight">
            Turn Your Notes Into a Conversation
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Studying doesn't have to be one-way anymore. Upload your files and start an AI-powered conversation with your study materials.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 gradient-primary shadow-glow hover:shadow-lg transition-smooth group"
              onClick={() => window.location.href = '/auth'}
            >
              <Upload className="h-6 w-6 mr-3 group-hover:rotate-12 transition-smooth" />
              Upload a File & Start Chatting
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          <Card className="text-center group hover:shadow-elegant transition-smooth border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-500/10 p-4 rounded-2xl group-hover:bg-blue-500/20 transition-smooth group-hover:scale-110">
                  <Upload className="h-10 w-10 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-xl mb-3">Upload Your Files</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Support for PDF, DOCX, and TXT files. Secure storage in the cloud with instant processing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center group hover:shadow-elegant transition-smooth border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-green-500/10 p-4 rounded-2xl group-hover:bg-green-500/20 transition-smooth group-hover:scale-110">
                  <MessageSquare className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xl mb-3">Ask Natural Questions</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Chat with your documents like you're talking to a study buddy. No complex commands needed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center group hover:shadow-elegant transition-smooth border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-purple-500/10 p-4 rounded-2xl group-hover:bg-purple-500/20 transition-smooth group-hover:scale-110">
                  <Sparkles className="h-10 w-10 text-purple-500" />
                </div>
              </div>
              <CardTitle className="text-xl mb-3">Get Smart Answers</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Powered by Google's Gemini AI for accurate, contextual responses to your questions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-3xl mx-auto bg-card/60 backdrop-blur-lg border-0 shadow-elegant">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-6 text-foreground">Ready to Transform Your Study Sessions?</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join thousands of students who are already having conversations with their notes.
              </p>
              <Button 
                size="lg"
                className="text-lg px-12 py-6 gradient-primary shadow-glow hover:shadow-lg transition-smooth"
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
