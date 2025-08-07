import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MessageSquare, FileText, Calendar, BookOpen, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  file_name: string | null;
  question: string;
  answer: string;
  created_at: string;
}

const History = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="hover:bg-primary/5 transition-smooth"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Chat History
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading chat history...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="bg-muted/30 p-8 rounded-3xl mb-8">
                <MessageSquare className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No chat history yet</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Start uploading files and asking questions to build your chat history.
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="gradient-primary shadow-glow hover:shadow-lg transition-smooth"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                Found {messages.length} conversation{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {messages.map((message, index) => (
              <Card key={message.id} className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    {message.file_name && (
                      <div className="flex items-center gap-2 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                        <FileText className="h-3 w-3" />
                        {message.file_name}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500/10 p-2 rounded-lg mt-1">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base mb-2 text-green-600 dark:text-green-400">Question:</CardTitle>
                        <p className="text-foreground bg-muted/30 p-4 rounded-xl border border-border/50 leading-relaxed">
                          {message.question}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500/10 p-2 rounded-lg mt-1">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base mb-2 text-purple-600 dark:text-purple-400">Answer:</CardTitle>
                        <div className="prose prose-sm max-w-none">
                          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                              {message.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;