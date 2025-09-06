import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Copy, Mail, Wand2, RefreshCw, MessageSquare, Zap } from "lucide-react";

type EmailTone = "formal" | "informal" | "friendly" | "professional" | "persuasive" | "apologetic";
type EmailType = "general" | "request" | "follow_up" | "complaint" | "thank_you" | "introduction";

const toneOptions = [
  { value: "formal", label: "Formal", description: "Professional and respectful", icon: "👔" },
  { value: "informal", label: "Informal", description: "Casual and conversational", icon: "😊" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable", icon: "🤝" },
  { value: "professional", label: "Professional", description: "Business-oriented", icon: "💼" },
  { value: "persuasive", label: "Persuasive", description: "Compelling and convincing", icon: "🎯" },
  { value: "apologetic", label: "Apologetic", description: "Sorry and understanding", icon: "🙏" }
];

const emailTypes = [
  { value: "general", label: "General Email", description: "Standard email communication" },
  { value: "request", label: "Request", description: "Asking for something specific" },
  { value: "follow_up", label: "Follow-up", description: "Following up on previous communication" },
  { value: "complaint", label: "Complaint", description: "Expressing dissatisfaction" },
  { value: "thank_you", label: "Thank You", description: "Expressing gratitude" },
  { value: "introduction", label: "Introduction", description: "Introducing yourself or others" }
];

const quickTemplates = [
  {
    name: "Job Application Follow-up",
    tone: "professional" as EmailTone,
    type: "follow_up" as EmailType,
    text: "I wanted to follow up on my job application for the Software Engineer position I submitted last week. I'm very excited about the opportunity to join your team."
  },
  {
    name: "Professor Meeting Request",
    tone: "formal" as EmailTone,
    type: "request" as EmailType,
    text: "I would like to schedule a meeting with you to discuss my research project. I have some questions about the methodology and would appreciate your guidance."
  },
  {
    name: "Internship Thank You",
    tone: "professional" as EmailTone,
    type: "thank_you" as EmailType,
    text: "Thank you for the internship opportunity at your company. I learned a lot and really enjoyed working with the team."
  },
  {
    name: "Class Absence Explanation",
    tone: "apologetic" as EmailTone,
    type: "general" as EmailType,
    text: "I was unable to attend class yesterday due to a family emergency. Could you please let me know what I missed and if there are any assignments I need to catch up on?"
  }
];

export default function EmailAssistant() {
  useMemo(() => {
    document.title = "AI Email Assistant – Student Productivity";
  }, []);

  const [inputEmail, setInputEmail] = useState("");
  const [outputEmail, setOutputEmail] = useState("");
  const [selectedTone, setSelectedTone] = useState<EmailTone>("professional");
  const [selectedType, setSelectedType] = useState<EmailType>("general");
  const [isRewriting, setIsRewriting] = useState(false);

  const rewriteEmail = async () => {
    if (!inputEmail.trim()) {
      toast({
        title: "Empty Email",
        description: "Please enter some email content to rewrite.",
        variant: "destructive"
      });
      return;
    }

    setIsRewriting(true);

    try {
      const selectedToneOption = toneOptions.find(t => t.value === selectedTone);
      const selectedTypeOption = emailTypes.find(t => t.value === selectedType);

      const prompt = `Rewrite the following email to be ${selectedTone} in tone and appropriate for a ${selectedType} email.

Original email:
"${inputEmail}"

Requirements:
1. Tone: ${selectedToneOption?.description}
2. Email Type: ${selectedTypeOption?.description}
3. Make it clear, concise, and well-structured
4. Include appropriate greeting and closing
5. Maintain the original intent and key information
6. Use proper email etiquette
7. Make it suitable for a student/young professional context

Please provide only the rewritten email without any additional explanations or formatting markers.`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to rewrite email');

      const result = await response.json();
      setOutputEmail(result.content);
      
      toast({
        title: "Email Rewritten!",
        description: "Your email has been improved successfully."
      });
    } catch (error) {
      toast({
        title: "Rewrite Failed",
        description: "Failed to rewrite email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputEmail);
      toast({
        title: "Copied!",
        description: "Email copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const useTemplate = (template: typeof quickTemplates[0]) => {
    setInputEmail(template.text);
    setSelectedTone(template.tone);
    setSelectedType(template.type);
  };

  const clearAll = () => {
    setInputEmail("");
    setOutputEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full border border-blue-500/20"
            >
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">AI Email Assistant</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Perfect Your Email Communication
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Transform your drafts into professional, clear, and effective emails with AI assistance
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Quick Templates */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Quick Templates
                </CardTitle>
                <CardDescription>
                  Start with a common email template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {quickTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => useTemplate(template)}
                    >
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {toneOptions.find(t => t.value === template.tone)?.icon} {template.tone} • {template.type}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Your Email Draft
                  </CardTitle>
                  <CardDescription>
                    Paste or type your email content below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inputEmail">Email Content</Label>
                    <Textarea
                      id="inputEmail"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="Hi,

I wanted to reach out about the summer internship position. I think I would be a good fit for the role because I have experience with the technologies mentioned in the job posting.

Let me know if you need any additional information.

Thanks"
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Characters: {inputEmail.length} | Words: {inputEmail.trim() ? inputEmail.trim().split(/\s+/).length : 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>
                    Choose the tone and type for your email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Tone</Label>
                    <Select value={selectedTone} onValueChange={(value: EmailTone) => setSelectedTone(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-muted-foreground">{option.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Type</Label>
                    <Select value={selectedType} onValueChange={(value: EmailType) => setSelectedType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTypes.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button 
                  onClick={rewriteEmail}
                  disabled={isRewriting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  {isRewriting ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner"></div>
                      Rewriting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      Rewrite Email
                    </div>
                  )}
                </Button>
                
                <Button 
                  onClick={clearAll}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-green-600" />
                        Improved Email
                      </CardTitle>
                      <CardDescription>
                        Your rewritten, professional email
                      </CardDescription>
                    </div>
                    {outputEmail && (
                      <Button
                        onClick={copyToClipboard}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {outputEmail ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {toneOptions.find(t => t.value === selectedTone)?.icon} {selectedTone}
                          </Badge>
                          <Badge variant="outline">
                            {emailTypes.find(t => t.value === selectedType)?.label}
                          </Badge>
                        </div>
                        <div className="bg-white p-4 rounded border min-h-[300px]">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                            {outputEmail}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Characters: {outputEmail.length} | Words: {outputEmail.trim().split(/\s+/).length}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                      <Mail className="h-16 w-16 mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Email Generated</h3>
                      <p className="text-sm max-w-md">
                        Enter your email draft and click "Rewrite Email" to see the improved version.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">✨ Email Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {[
                      "Start with a clear, descriptive subject line",
                      "Use a proper greeting (Dear, Hello, Hi)",
                      "Keep paragraphs short and focused",
                      "Include a clear call-to-action if needed",
                      "End with an appropriate closing",
                      "Proofread before sending"
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5 text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tone Examples */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">🎭 Tone Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {toneOptions.slice(0, 4).map((tone) => (
                      <div key={tone.value} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{tone.icon}</span>
                          <span className="font-medium text-sm">{tone.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{tone.description}</p>
                      </div>
                    ))}
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
