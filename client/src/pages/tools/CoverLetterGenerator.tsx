import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Copy, Download, FileText, Wand2, User, Building, Briefcase } from "lucide-react";
import { textToSimplePdf } from "@/lib/pdfUtils";

interface CoverLetterData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  address: string;
  
  // Job Details
  jobTitle: string;
  companyName: string;
  hiringManager: string;
  jobDescription: string;
  
  // Student Details
  university: string;
  major: string;
  graduationYear: string;
  gpa: string;
  relevantExperience: string;
  skills: string;
  
  // Settings
  tone: "professional" | "casual";
}

const toneOptions = [
  { value: "professional", label: "Professional", description: "Formal and business-oriented" },
  { value: "casual", label: "Casual", description: "Friendly and approachable" }
];

export default function CoverLetterGenerator() {
  useMemo(() => {
    document.title = "Cover Letter Generator – Student Productivity";
  }, []);

  const [data, setData] = useState<CoverLetterData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    jobTitle: "",
    companyName: "",
    hiringManager: "",
    jobDescription: "",
    university: "",
    major: "",
    graduationYear: "",
    gpa: "",
    relevantExperience: "",
    skills: "",
    tone: "professional"
  });

  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const updateData = (field: keyof CoverLetterData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const generateCoverLetter = async () => {
    if (!data.fullName || !data.jobTitle || !data.companyName) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, job title, and company name.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Generate a ${data.tone} cover letter for a student applying for a ${data.jobTitle} position at ${data.companyName}.

Student Details:
- Name: ${data.fullName}
- University: ${data.university || "Current University"}
- Major: ${data.major || "Current Major"}
- Graduation: ${data.graduationYear || "Upcoming"}
- GPA: ${data.gpa || "Strong academic record"}
- Experience: ${data.relevantExperience || "Relevant coursework and projects"}
- Skills: ${data.skills || "Technical and soft skills"}

Job Details:
- Position: ${data.jobTitle}
- Company: ${data.companyName}
- Hiring Manager: ${data.hiringManager || "Hiring Manager"}
- Job Description: ${data.jobDescription || "No specific description provided"}

Requirements:
1. ${data.tone === "professional" ? "Use formal business language" : "Use friendly but professional language"}
2. Highlight relevant education and skills
3. Show enthusiasm for the role and company
4. Include specific examples when possible
5. Keep it concise (3-4 paragraphs)
6. End with a strong call to action

Format the letter properly with:
- Header with contact information
- Date
- Employer address
- Salutation
- Body paragraphs
- Professional closing`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate cover letter');

      const result = await response.json();
      setGeneratedLetter(result.content);
      
      toast({
        title: "Cover Letter Generated!",
        description: "Your cover letter has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadAsPdf = async () => {
    if (!generatedLetter) return;
    
    try {
      const blob = await textToSimplePdf(generatedLetter);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.fullName}_Cover_Letter_${data.companyName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "Cover letter saved as PDF."
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/20"
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">AI Cover Letter Generator</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Create Professional Cover Letters
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Generate compelling, personalized cover letters that help you stand out from the competition
            </motion.p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Enter your contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={data.fullName}
                        onChange={(e) => updateData('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => updateData('email', e.target.value)}
                        placeholder="john.doe@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => updateData('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={data.address}
                        onChange={(e) => updateData('address', e.target.value)}
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    Job Information
                  </CardTitle>
                  <CardDescription>
                    Details about the position you're applying for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        value={data.jobTitle}
                        onChange={(e) => updateData('jobTitle', e.target.value)}
                        placeholder="Software Engineer Intern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={data.companyName}
                        onChange={(e) => updateData('companyName', e.target.value)}
                        placeholder="Google Inc."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hiringManager">Hiring Manager</Label>
                    <Input
                      id="hiringManager"
                      value={data.hiringManager}
                      onChange={(e) => updateData('hiringManager', e.target.value)}
                      placeholder="Ms. Jane Smith"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      value={data.jobDescription}
                      onChange={(e) => updateData('jobDescription', e.target.value)}
                      placeholder="Paste the job description here for better customization..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Academic & Experience
                  </CardTitle>
                  <CardDescription>
                    Your educational background and relevant experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={data.university}
                        onChange={(e) => updateData('university', e.target.value)}
                        placeholder="Stanford University"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        value={data.major}
                        onChange={(e) => updateData('major', e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={data.graduationYear}
                        onChange={(e) => updateData('graduationYear', e.target.value)}
                        placeholder="2025"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA (Optional)</Label>
                      <Input
                        id="gpa"
                        value={data.gpa}
                        onChange={(e) => updateData('gpa', e.target.value)}
                        placeholder="3.8/4.0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relevantExperience">Relevant Experience</Label>
                    <Textarea
                      id="relevantExperience"
                      value={data.relevantExperience}
                      onChange={(e) => updateData('relevantExperience', e.target.value)}
                      placeholder="Internships, projects, volunteer work, etc."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Key Skills</Label>
                    <Textarea
                      id="skills"
                      value={data.skills}
                      onChange={(e) => updateData('skills', e.target.value)}
                      placeholder="Programming languages, software, certifications, etc."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Tone & Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Label>Writing Tone</Label>
                    <Select value={data.tone} onValueChange={(value: "professional" | "casual") => updateData('tone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map(option => (
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

              <Button 
                onClick={generateCoverLetter}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg py-6"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Generate Cover Letter
                  </div>
                )}
              </Button>
            </div>

            {/* Generated Output */}
            <div className="space-y-6">
              <Card className="shadow-lg min-h-[600px]">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Generated Cover Letter</CardTitle>
                      <CardDescription>
                        Your personalized cover letter will appear here
                      </CardDescription>
                    </div>
                    {generatedLetter && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAsPdf}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedLetter ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-white rounded-lg border shadow-sm min-h-[500px]">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                          {generatedLetter}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] text-center text-muted-foreground">
                      <FileText className="h-16 w-16 mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Cover Letter Yet</h3>
                      <p className="text-sm max-w-md">
                        Fill in the form and click "Generate Cover Letter" to create your personalized cover letter.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Tips for Better Cover Letters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {[
                      "Research the company and mention specific details",
                      "Quantify your achievements with numbers when possible",
                      "Match your skills to the job requirements",
                      "Show enthusiasm for the role and company",
                      "Keep it concise - one page maximum",
                      "Proofread carefully for grammar and spelling"
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
