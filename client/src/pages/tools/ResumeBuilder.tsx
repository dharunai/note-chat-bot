import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import FileDropZone from "@/components/tools/FileDropZone";
import { extractTextFromFile } from "@/lib/fileExtractors";
import { textToSimplePdf } from "@/lib/pdfUtils";
import { 
  User, Mail, Phone, MapPin, Globe, Github, Linkedin, 
  Download, FileText, Plus, Trash2, Eye, Wand2, 
  Briefcase, GraduationCap, Award, Code, Palette,
  Star, Calendar, Link, Sparkles, Camera, Save
} from "lucide-react";

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

interface ResumeData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  
  // Professional
  title: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  
  // Additional
  languages: { name: string; level: string }[];
  certifications: { name: string; issuer: string; date: string }[];
  
  // Styling
  template: string;
  colorScheme: string;
  font: string;
}

const TEMPLATES = [
  { id: 'modern', name: 'Modern Professional', icon: '💼' },
  { id: 'creative', name: 'Creative Design', icon: '🎨' },
  { id: 'minimal', name: 'Minimal Clean', icon: '✨' },
  { id: 'executive', name: 'Executive Level', icon: '👔' },
  { id: 'tech', name: 'Tech Focused', icon: '💻' },
  { id: 'academic', name: 'Academic Research', icon: '🎓' }
];

const COLOR_SCHEMES = [
  { id: 'blue', name: 'Professional Blue', primary: '#2563EB', secondary: '#EFF6FF' },
  { id: 'emerald', name: 'Success Green', primary: '#059669', secondary: '#ECFDF5' },
  { id: 'purple', name: 'Creative Purple', primary: '#7C3AED', secondary: '#F3E8FF' },
  { id: 'rose', name: 'Elegant Rose', primary: '#E11D48', secondary: '#FFF1F2' },
  { id: 'amber', name: 'Warm Amber', primary: '#D97706', secondary: '#FFFBEB' },
  { id: 'slate', name: 'Modern Slate', primary: '#475569', secondary: '#F8FAFC' }
];

const FONTS = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' }
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const LANGUAGE_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'];

function parseSections(raw: string): Partial<ResumeData> {
  const text = raw.replace(/\r/g, "").trim();
  const get = (h: string) => {
    const reg = new RegExp(`(^|\n)\s*${h}\s*:?\s*\n([\s\S]*?)(\n\s*[A-Z][A-Za-z\s]{2,}:|$)`, "i");
    const m = text.match(reg);
    return (m?.[2] || "").trim();
  };
  
  const summary = get("(summary|objective)");
  const skillsBlock = get("skills?");
  const experience = get("(experience|work experience|professional experience)");
  const education = get("education");
  const skills = skillsBlock
    ? skillsBlock
        .split(/[,•\n]+/)
        .map((s) => s.replace(/[-•]/g, "").trim())
        .filter(Boolean)
    : [];
    
  // Try to infer name/email/phone from header
  const header = text.split(/\n+/)[0] || "";
  const email = (text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/) || [""])[0];
  const phone = (text.match(/(\+?\d[\d\s().-]{7,}\d)/) || [""])[0];
  const name = header.length < 80 ? header.trim() : "";
  const [firstName, ...lastNameParts] = name.split(' ');
  
  return {
    firstName: firstName || "",
    lastName: lastNameParts.join(' ') || "",
    email,
    phone,
    summary,
    skills,
    template: 'modern',
    colorScheme: 'blue',
    font: 'inter'
  };
}

export default function ResumeBuilder() {
  useMemo(() => {
    document.title = "AI Resume Builder – Note Bot AI";
  }, []);

  const [fileName, setFileName] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    title: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    languages: [],
    certifications: [],
    template: 'modern',
    colorScheme: 'blue',
    font: 'inter'
  });

  const selectedTemplate = TEMPLATES.find(t => t.id === resumeData.template);
  const selectedColorScheme = COLOR_SCHEMES.find(c => c.id === resumeData.colorScheme);
  const selectedFont = FONTS.find(f => f.id === resumeData.font);

  const updateResumeData = (field: keyof ResumeData, value: any) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const onDrop = async (files: File[]) => {
    const f = files?.[0];
    if (!f) return;
    setFileName(f.name);
    const text = await extractTextFromFile(f);
    setRawText(text);
    const parsed = parseSections(text);
    setResumeData(prev => ({ ...prev, ...parsed }));
    toast({
      title: "Resume Imported",
      description: "Your resume has been successfully parsed and imported."
    });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    };
    updateResumeData('experience', [...resumeData.experience, newExp]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const updated = resumeData.experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateResumeData('experience', updated);
  };

  const removeExperience = (id: string) => {
    updateResumeData('experience', resumeData.experience.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: ""
    };
    updateResumeData('education', [...resumeData.education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    const updated = resumeData.education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateResumeData('education', updated);
  };

  const removeEducation = (id: string) => {
    updateResumeData('education', resumeData.education.filter(edu => edu.id !== id));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
      link: "",
      github: ""
    };
    updateResumeData('projects', [...resumeData.projects, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updated = resumeData.projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    updateResumeData('projects', updated);
  };

  const removeProject = (id: string) => {
    updateResumeData('projects', resumeData.projects.filter(proj => proj.id !== id));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      updateResumeData('skills', [...resumeData.skills, skill.trim()]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateResumeData('skills', resumeData.skills.filter(skill => skill !== skillToRemove));
  };

  const generateWithAI = async () => {
    if (!resumeData.title) {
      toast({
        title: "Job Title Required",
        description: "Please enter your target job title to generate AI content.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Generate professional resume content for a ${resumeData.title} position. Include:
1. A compelling professional summary (3-4 sentences)
2. 8-10 relevant technical and soft skills
3. Suggest 2-3 relevant certifications for this role

Format as JSON:
{
  "summary": "Professional summary text...",
  "skills": ["skill1", "skill2", ...],
  "certifications": [{"name": "cert name", "issuer": "issuer", "date": "suggested date"}]
}`;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      
      try {
        const aiContent = JSON.parse(data.content);
        
        if (aiContent.summary) {
          updateResumeData('summary', aiContent.summary);
        }
        
        if (aiContent.skills && Array.isArray(aiContent.skills)) {
          const newSkills = [...new Set([...resumeData.skills, ...aiContent.skills])];
          updateResumeData('skills', newSkills);
        }
        
        if (aiContent.certifications && Array.isArray(aiContent.certifications)) {
          const newCerts = [...resumeData.certifications, ...aiContent.certifications];
          updateResumeData('certifications', newCerts);
        }

        toast({
          title: "AI Content Generated",
          description: "Professional content has been generated and added to your resume."
        });
      } catch (parseError) {
        // Fallback if JSON parsing fails
        updateResumeData('summary', data.content);
        toast({
          title: "Content Generated",
          description: "AI content has been added to your summary."
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportPdf = async () => {
    const compiled = compileResume(resumeData);
    const blob = await textToSimplePdf(compiled);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.firstName}_${resumeData.lastName}_Resume.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Resume Downloaded",
      description: "Your resume has been exported as PDF successfully."
    });
  };

  const handleDownloadTxt = () => {
    const compiled = compileResume(resumeData);
    const blob = new Blob([compiled], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.firstName}_${resumeData.lastName}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const compileResume = (data: ResumeData): string => {
    const sections = [];
    
    // Header
    sections.push(`${data.firstName} ${data.lastName}`);
    sections.push(`${data.title}`);
    
    const contact = [data.email, data.phone, data.location].filter(Boolean);
    if (contact.length) sections.push(contact.join(" • "));
    
    const links = [data.website, data.linkedin, data.github].filter(Boolean);
    if (links.length) sections.push(links.join(" • "));
    
    sections.push("");
    
    // Summary
    if (data.summary) {
      sections.push("PROFESSIONAL SUMMARY");
      sections.push(data.summary);
      sections.push("");
    }
    
    // Skills
    if (data.skills.length) {
      sections.push("TECHNICAL SKILLS");
      sections.push(data.skills.join(" • "));
      sections.push("");
    }
    
    // Experience
    if (data.experience.length) {
      sections.push("PROFESSIONAL EXPERIENCE");
      data.experience.forEach(exp => {
        sections.push(`${exp.position} - ${exp.company}`);
        sections.push(`${exp.location} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`);
        if (exp.description) sections.push(exp.description);
        sections.push("");
      });
    }
    
    // Education
    if (data.education.length) {
      sections.push("EDUCATION");
      data.education.forEach(edu => {
        sections.push(`${edu.degree} in ${edu.field}`);
        sections.push(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`);
        if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
        if (edu.description) sections.push(edu.description);
        sections.push("");
      });
    }
    
    // Projects
    if (data.projects.length) {
      sections.push("PROJECTS");
      data.projects.forEach(proj => {
        sections.push(`${proj.name}`);
        if (proj.description) sections.push(proj.description);
        if (proj.technologies.length) sections.push(`Technologies: ${proj.technologies.join(", ")}`);
        if (proj.link || proj.github) {
          const projLinks = [proj.link, proj.github].filter(Boolean);
          sections.push(projLinks.join(" • "));
        }
        sections.push("");
      });
    }
    
    return sections.filter(Boolean).join("\n");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <TopNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/20 backdrop-blur-sm">
              <Briefcase className="h-6 w-6 text-primary animate-pulse" />
              <span className="text-sm font-medium">AI-Powered Resume Builder</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              Build Your Dream
              <br />
              <span className="relative">
                Career Resume
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create professional, ATS-friendly resumes with AI assistance. Choose from stunning templates, 
              customize with ease, and land your dream job.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['AI-Powered', 'ATS-Friendly', 'Multiple Templates', 'Real-time Preview', 'PDF Export'].map((feature, index) => (
                <Badge 
                  key={feature} 
                  variant="secondary" 
                  className="animate-fade-in-scale"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Controls */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant={previewMode ? "default" : "outline"}
                onClick={() => setPreviewMode(!previewMode)}
                className="shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>
              
              <Button
                onClick={generateWithAI}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleExportPdf} className="shadow-md hover:shadow-lg">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              
              <Button variant="outline" onClick={handleDownloadTxt}>
                <FileText className="h-4 w-4 mr-2" />
                Export TXT
              </Button>
            </div>
          </div>

          {previewMode ? (
            // Preview Mode
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Template & Style Controls */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-2 border-primary/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select value={resumeData.template} onValueChange={(value) => updateResumeData('template', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATES.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.icon} {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color Scheme</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {COLOR_SCHEMES.map(color => (
                          <button
                            key={color.id}
                            onClick={() => updateResumeData('colorScheme', color.id)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              resumeData.colorScheme === color.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div 
                              className="w-full h-4 rounded mb-2" 
                              style={{ backgroundColor: color.primary }}
                            ></div>
                            <div className="text-xs font-medium">{color.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font</Label>
                      <Select value={resumeData.font} onValueChange={(value) => updateResumeData('font', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map(font => (
                            <SelectItem key={font.id} value={font.id}>
                              <span style={{ fontFamily: font.family }}>{font.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Resume Preview */}
              <div className="lg:col-span-4">
                <Card className="border-2 border-accent/20 shadow-2xl min-h-[800px]">
                  <CardContent className="p-8">
                    <div 
                      className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 min-h-[700px]"
                      style={{
                        fontFamily: selectedFont?.family,
                        borderTop: `4px solid ${selectedColorScheme?.primary}`
                      }}
                    >
                      {/* Header */}
                      <div className="text-center border-b pb-6 mb-6">
                        <h1 
                          className="text-3xl font-bold mb-2"
                          style={{ color: selectedColorScheme?.primary }}
                        >
                          {resumeData.firstName} {resumeData.lastName}
                        </h1>
                        {resumeData.title && (
                          <h2 className="text-xl text-gray-600 mb-4">{resumeData.title}</h2>
                        )}
                        
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                          {resumeData.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {resumeData.email}
                            </div>
                          )}
                          {resumeData.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {resumeData.phone}
                            </div>
                          )}
                          {resumeData.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {resumeData.location}
                            </div>
                          )}
                        </div>
                        
                        {(resumeData.website || resumeData.linkedin || resumeData.github) && (
                          <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm">
                            {resumeData.website && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Globe className="h-4 w-4" />
                                {resumeData.website}
                              </div>
                            )}
                            {resumeData.linkedin && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Linkedin className="h-4 w-4" />
                                {resumeData.linkedin}
                              </div>
                            )}
                            {resumeData.github && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Github className="h-4 w-4" />
                                {resumeData.github}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content Sections */}
                      <div className="space-y-6">
                        {/* Summary */}
                        {resumeData.summary && (
                          <div>
                            <h3 
                              className="text-lg font-semibold mb-3 border-b-2 pb-1"
                              style={{ 
                                color: selectedColorScheme?.primary,
                                borderColor: selectedColorScheme?.primary 
                              }}
                            >
                              PROFESSIONAL SUMMARY
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
                          </div>
                        )}

                        {/* Skills */}
                        {resumeData.skills.length > 0 && (
                          <div>
                            <h3 
                              className="text-lg font-semibold mb-3 border-b-2 pb-1"
                              style={{ 
                                color: selectedColorScheme?.primary,
                                borderColor: selectedColorScheme?.primary 
                              }}
                            >
                              TECHNICAL SKILLS
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {resumeData.skills.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 rounded-full text-sm font-medium"
                                  style={{ 
                                    backgroundColor: selectedColorScheme?.secondary,
                                    color: selectedColorScheme?.primary 
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Experience */}
                        {resumeData.experience.length > 0 && (
                          <div>
                            <h3 
                              className="text-lg font-semibold mb-3 border-b-2 pb-1"
                              style={{ 
                                color: selectedColorScheme?.primary,
                                borderColor: selectedColorScheme?.primary 
                              }}
                            >
                              PROFESSIONAL EXPERIENCE
                            </h3>
                            <div className="space-y-4">
                              {resumeData.experience.map((exp) => (
                                <div key={exp.id}>
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                                      <p className="text-gray-700">{exp.company}</p>
                                    </div>
                                    <div className="text-right text-sm text-gray-600">
                                      <p>{exp.location}</p>
                                      <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                                    </div>
                                  </div>
                                  {exp.description && (
                                    <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {resumeData.education.length > 0 && (
                          <div>
                            <h3 
                              className="text-lg font-semibold mb-3 border-b-2 pb-1"
                              style={{ 
                                color: selectedColorScheme?.primary,
                                borderColor: selectedColorScheme?.primary 
                              }}
                            >
                              EDUCATION
                            </h3>
                            <div className="space-y-3">
                              {resumeData.education.map((edu) => (
                                <div key={edu.id}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h4>
                                      <p className="text-gray-700">{edu.institution}</p>
                                      {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                    </div>
                                    <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
                                  </div>
                                  {edu.description && (
                                    <p className="text-gray-700 text-sm mt-1">{edu.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {resumeData.projects.length > 0 && (
                          <div>
                            <h3 
                              className="text-lg font-semibold mb-3 border-b-2 pb-1"
                              style={{ 
                                color: selectedColorScheme?.primary,
                                borderColor: selectedColorScheme?.primary 
                              }}
                            >
                              PROJECTS
                            </h3>
                            <div className="space-y-3">
                              {resumeData.projects.map((project) => (
                                <div key={project.id}>
                                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                  {project.description && (
                                    <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                                  )}
                                  {project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {project.technologies.map((tech, index) => (
                                        <span 
                                          key={index}
                                          className="px-2 py-1 text-xs rounded-full"
                                          style={{ 
                                            backgroundColor: selectedColorScheme?.secondary,
                                            color: selectedColorScheme?.primary 
                                          }}
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {(project.link || project.github) && (
                                    <div className="flex gap-4 mt-2 text-sm text-blue-600">
                                      {project.link && (
                                        <div className="flex items-center gap-1">
                                          <Link className="h-3 w-3" />
                                          {project.link}
                                        </div>
                                      )}
                                      {project.github && (
                                        <div className="flex items-center gap-1">
                                          <Github className="h-3 w-3" />
                                          {project.github}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Import Section */}
              <div className="lg:col-span-3 mb-6">
                <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-6">
                    <FileDropZone
                      accept={{
                        "application/pdf": [".pdf"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                        "text/plain": [".txt"],
                      }}
                      multiple={false}
                      onDrop={onDrop}
                      className="border-2 border-dashed border-primary/50 rounded-xl p-8 text-center hover:border-primary transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">Import Existing Resume</p>
                          <p className="text-sm text-muted-foreground">
                            Drag & drop your resume (PDF/DOCX/TXT) or click to select
                          </p>
                          {fileName && (
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm font-medium">{fileName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </FileDropZone>
                  </CardContent>
                </Card>
              </div>

              {/* Form Tabs */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-6 bg-muted/50 rounded-xl p-1">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="experience" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experience
                    </TabsTrigger>
                    <TabsTrigger value="education" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Education
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Projects
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Skills
                    </TabsTrigger>
                    <TabsTrigger value="additional" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Additional
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <Card className="shadow-lg border-l-4 border-l-primary">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Tell us about yourself and your contact information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={resumeData.firstName}
                              onChange={(e) => updateResumeData('firstName', e.target.value)}
                              placeholder="John"
                              className="focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={resumeData.lastName}
                              onChange={(e) => updateResumeData('lastName', e.target.value)}
                              placeholder="Doe"
                              className="focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title">Professional Title *</Label>
                          <Input
                            id="title"
                            value={resumeData.title}
                            onChange={(e) => updateResumeData('title', e.target.value)}
                            placeholder="Senior Software Engineer"
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={resumeData.email}
                              onChange={(e) => updateResumeData('email', e.target.value)}
                              placeholder="john.doe@email.com"
                              className="focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={resumeData.phone}
                              onChange={(e) => updateResumeData('phone', e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              className="focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={resumeData.location}
                            onChange={(e) => updateResumeData('location', e.target.value)}
                            placeholder="San Francisco, CA"
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={resumeData.website}
                              onChange={(e) => updateResumeData('website', e.target.value)}
                              placeholder="www.johndoe.com"
                              className="focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              value={resumeData.linkedin}
                              onChange={(e) => updateResumeData('linkedin', e.target.value)}
                              placeholder="linkedin.com/in/johndoe"
                              className="focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="github">GitHub</Label>
                            <Input
                              id="github"
                              value={resumeData.github}
                              onChange={(e) => updateResumeData('github', e.target.value)}
                              placeholder="github.com/johndoe"
                              className="focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="summary">Professional Summary</Label>
                          <Textarea
                            id="summary"
                            value={resumeData.summary}
                            onChange={(e) => updateResumeData('summary', e.target.value)}
                            placeholder="A passionate software engineer with 5+ years of experience..."
                            rows={4}
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                          <p className="text-xs text-muted-foreground">
                            Write a compelling 3-4 sentence summary highlighting your key achievements and career goals.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Experience Tab */}
                  <TabsContent value="experience" className="space-y-6">
                    <Card className="shadow-lg border-l-4 border-l-accent">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-accent" />
                              Work Experience
                            </CardTitle>
                            <CardDescription>
                              Add your professional work experience
                            </CardDescription>
                          </div>
                          <Button onClick={addExperience} className="shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Experience
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {resumeData.experience.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No work experience added yet.</p>
                            <p className="text-sm">Click "Add Experience" to get started.</p>
                          </div>
                        ) : (
                          resumeData.experience.map((exp) => (
                            <Card key={exp.id} className="border-2 border-muted hover:border-accent/50 transition-all">
                              <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-lg">
                                    {exp.position || 'New Position'} {exp.company && `at ${exp.company}`}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExperience(exp.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Position Title *</Label>
                                    <Input
                                      value={exp.position}
                                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                      placeholder="Software Engineer"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Company *</Label>
                                    <Input
                                      value={exp.company}
                                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                      placeholder="Google Inc."
                                    />
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input
                                      value={exp.location}
                                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                      placeholder="San Francisco, CA"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                      type="month"
                                      value={exp.startDate}
                                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                      type="month"
                                      value={exp.endDate}
                                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                      disabled={exp.current}
                                      placeholder={exp.current ? "Present" : ""}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`current-${exp.id}`}
                                    checked={exp.current}
                                    onChange={(e) => {
                                      updateExperience(exp.id, 'current', e.target.checked);
                                      if (e.target.checked) {
                                        updateExperience(exp.id, 'endDate', '');
                                      }
                                    }}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <Label htmlFor={`current-${exp.id}`} className="text-sm">
                                    I currently work here
                                  </Label>
                                </div>

                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={exp.description}
                                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                    placeholder="• Led a team of 5 developers to build a new feature that increased user engagement by 30%&#10;• Implemented automated testing that reduced bugs by 50%&#10;• Mentored junior developers and conducted code reviews"
                                    rows={4}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Use bullet points to highlight your achievements and responsibilities.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Education Tab */}
                  <TabsContent value="education" className="space-y-6">
                    <Card className="shadow-lg border-l-4 border-l-emerald-500">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-emerald-500" />
                              Education
                            </CardTitle>
                            <CardDescription>
                              Add your educational background
                            </CardDescription>
                          </div>
                          <Button onClick={addEducation} className="shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {resumeData.education.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No education added yet.</p>
                            <p className="text-sm">Click "Add Education" to get started.</p>
                          </div>
                        ) : (
                          resumeData.education.map((edu) => (
                            <Card key={edu.id} className="border-2 border-muted hover:border-emerald-500/50 transition-all">
                              <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-lg">
                                    {edu.degree || 'New Degree'} {edu.institution && `at ${edu.institution}`}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEducation(edu.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Degree *</Label>
                                    <Input
                                      value={edu.degree}
                                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                      placeholder="Bachelor of Science"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Field of Study *</Label>
                                    <Input
                                      value={edu.field}
                                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                      placeholder="Computer Science"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Institution *</Label>
                                  <Input
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                    placeholder="Stanford University"
                                  />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                      type="month"
                                      value={edu.startDate}
                                      onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                      type="month"
                                      value={edu.endDate}
                                      onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>GPA (Optional)</Label>
                                    <Input
                                      value={edu.gpa}
                                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                      placeholder="3.85 / 4.0"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Description (Optional)</Label>
                                  <Textarea
                                    value={edu.description}
                                    onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                    placeholder="Relevant coursework: Data Structures, Algorithms, Machine Learning"
                                    rows={2}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Projects Tab */}
                  <TabsContent value="projects" className="space-y-6">
                    <Card className="shadow-lg border-l-4 border-l-purple-500">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Code className="h-5 w-5 text-purple-500" />
                              Projects
                            </CardTitle>
                            <CardDescription>
                              Showcase your best projects and work
                            </CardDescription>
                          </div>
                          <Button onClick={addProject} className="shadow-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {resumeData.projects.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No projects added yet.</p>
                            <p className="text-sm">Click "Add Project" to showcase your work.</p>
                          </div>
                        ) : (
                          resumeData.projects.map((project) => (
                            <Card key={project.id} className="border-2 border-muted hover:border-purple-500/50 transition-all">
                              <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-lg">
                                    {project.name || 'New Project'}
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeProject(project.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Project Name *</Label>
                                  <Input
                                    value={project.name}
                                    onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                    placeholder="E-commerce Platform"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Description *</Label>
                                  <Textarea
                                    value={project.description}
                                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                                    placeholder="Built a full-stack e-commerce platform with React, Node.js, and MongoDB..."
                                    rows={3}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Technologies Used</Label>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {project.technologies.map((tech, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => {
                                          const updated = project.technologies.filter((_, i) => i !== index);
                                          updateProject(project.id, 'technologies', updated);
                                        }}
                                      >
                                        {tech} ×
                                      </Badge>
                                    ))}
                                  </div>
                                  <Input
                                    placeholder="Add technology (press Enter)"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.target as HTMLInputElement;
                                        const tech = input.value.trim();
                                        if (tech && !project.technologies.includes(tech)) {
                                          updateProject(project.id, 'technologies', [...project.technologies, tech]);
                                          input.value = '';
                                        }
                                      }
                                    }}
                                  />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Live Demo URL</Label>
                                    <Input
                                      value={project.link}
                                      onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                      placeholder="https://myproject.com"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>GitHub Repository</Label>
                                    <Input
                                      value={project.github}
                                      onChange={(e) => updateProject(project.id, 'github', e.target.value)}
                                      placeholder="https://github.com/username/project"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Skills Tab */}
                  <TabsContent value="skills" className="space-y-6">
                    <Card className="shadow-lg border-l-4 border-l-orange-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-orange-500" />
                          Skills & Technologies
                        </CardTitle>
                        <CardDescription>
                          Add your technical and soft skills
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, index) => (
                              <Badge 
                                key={index} 
                                variant="default"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-sm py-1 px-3"
                                onClick={() => removeSkill(skill)}
                              >
                                {skill} ×
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a skill (press Enter)"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  const skill = input.value.trim();
                                  if (skill) {
                                    addSkill(skill);
                                    input.value = '';
                                  }
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                                const skill = input?.value.trim();
                                if (skill) {
                                  addSkill(skill);
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p className="mb-2">Popular skills to consider:</p>
                            <div className="flex flex-wrap gap-2">
                              {['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Git', 'SQL', 'Agile'].map((skill) => (
                                <Button
                                  key={skill}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addSkill(skill)}
                                  className="h-6 text-xs hover:bg-primary/10"
                                  disabled={resumeData.skills.includes(skill)}
                                >
                                  + {skill}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Additional Tab */}
                  <TabsContent value="additional" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Languages */}
                      <Card className="shadow-lg border-l-4 border-l-blue-500">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Globe className="h-5 w-5 text-blue-500" />
                            Languages
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {resumeData.languages.map((lang, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={lang.name}
                                onChange={(e) => {
                                  const updated = [...resumeData.languages];
                                  updated[index].name = e.target.value;
                                  updateResumeData('languages', updated);
                                }}
                                placeholder="Language"
                                className="flex-1"
                              />
                              <Select
                                value={lang.level}
                                onValueChange={(value) => {
                                  const updated = [...resumeData.languages];
                                  updated[index].level = value;
                                  updateResumeData('languages', updated);
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LANGUAGE_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = resumeData.languages.filter((_, i) => i !== index);
                                  updateResumeData('languages', updated);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              updateResumeData('languages', [...resumeData.languages, { name: '', level: 'Conversational' }]);
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Language
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Certifications */}
                      <Card className="shadow-lg border-l-4 border-l-green-500">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Award className="h-5 w-5 text-green-500" />
                            Certifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {resumeData.certifications.map((cert, index) => (
                            <div key={index} className="space-y-2 p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                  <Input
                                    value={cert.name}
                                    onChange={(e) => {
                                      const updated = [...resumeData.certifications];
                                      updated[index].name = e.target.value;
                                      updateResumeData('certifications', updated);
                                    }}
                                    placeholder="Certification Name"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      value={cert.issuer}
                                      onChange={(e) => {
                                        const updated = [...resumeData.certifications];
                                        updated[index].issuer = e.target.value;
                                        updateResumeData('certifications', updated);
                                      }}
                                      placeholder="Issuing Organization"
                                    />
                                    <Input
                                      type="month"
                                      value={cert.date}
                                      onChange={(e) => {
                                        const updated = [...resumeData.certifications];
                                        updated[index].date = e.target.value;
                                        updateResumeData('certifications', updated);
                                      }}
                                    />
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = resumeData.certifications.filter((_, i) => i !== index);
                                    updateResumeData('certifications', updated);
                                  }}
                                  className="ml-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              updateResumeData('certifications', [...resumeData.certifications, { name: '', issuer: '', date: '' }]);
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
