import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileDropZone from "@/components/tools/FileDropZone";
import { extractTextFromFile } from "@/lib/fileExtractors";
import { textToSimplePdf } from "@/lib/pdfUtils";

interface Sections {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
}

function parseSections(raw: string): Sections {
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
  return {
    name: header.length < 80 ? header.trim() : "",
    email,
    phone,
    summary,
    skills,
    experience,
    education,
  };
}

function compileResume(s: Sections): string {
  const skillsLine = s.skills.join(", ");
  return [
    s.name && `${s.name}`,
    [s.email, s.phone].filter(Boolean).join(" • "),
    "",
    s.summary && `SUMMARY\n${s.summary}`,
    s.skills.length ? `\nSKILLS\n${skillsLine}` : "",
    s.experience && `\nEXPERIENCE\n${s.experience}`,
    s.education && `\nEDUCATION\n${s.education}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ResumeBuilder() {
  useMemo(() => {
    document.title = "Resume Builder – Note Bot AI";
  }, []);

  const [fileName, setFileName] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [sections, setSections] = useState<Sections>({
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: [],
    experience: "",
    education: "",
  });

  const onDrop = async (files: File[]) => {
    const f = files?.[0];
    if (!f) return;
    setFileName(f.name);
    const text = await extractTextFromFile(f);
    setRawText(text);
    setSections(parseSections(text));
  };

  const handleExportPdf = async () => {
    const compiled = compileResume(sections);
    const blob = await textToSimplePdf(compiled);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const compiled = compileResume(sections);
    const blob = new Blob([compiled], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <img src="/icons/resume.svg" alt="Resume icon" className="h-6 w-6" loading="lazy" decoding="async" />
              Resume Builder
            </CardTitle>
            <CardDescription>Upload your DOCX, PDF, or TXT. We’ll extract Skills, Experience, Education for quick edits and export.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileDropZone
              accept={{
                "application/pdf": [".pdf"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                "text/plain": [".txt"],
              }}
              multiple={false}
              onDrop={onDrop}
            >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Drag & drop your resume (PDF/DOCX/TXT) or click to select.
                </p>
                {fileName && <p className="text-xs text-muted-foreground">Selected: {fileName}</p>}
              </div>
            </FileDropZone>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="space-y-3">
                <h2 className="font-semibold">Header</h2>
                <Input placeholder="Full Name" value={sections.name} onChange={(e) => setSections({ ...sections, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Email" value={sections.email} onChange={(e) => setSections({ ...sections, email: e.target.value })} />
                  <Input placeholder="Phone" value={sections.phone} onChange={(e) => setSections({ ...sections, phone: e.target.value })} />
                </div>

                <h2 className="font-semibold mt-4">Summary</h2>
                <Textarea placeholder="Professional summary" value={sections.summary} onChange={(e) => setSections({ ...sections, summary: e.target.value })} className="min-h-28" />

                <h2 className="font-semibold mt-4">Skills (comma or newline separated)</h2>
                <Textarea
                  placeholder="e.g., JavaScript, React, TailwindCSS, Node.js"
                  value={sections.skills.join(", ")}
                  onChange={(e) => setSections({ ...sections, skills: e.target.value.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean) })}
                  className="min-h-24"
                />
              </section>

              <section className="space-y-3">
                <h2 className="font-semibold">Experience</h2>
                <Textarea placeholder="Work experience" value={sections.experience} onChange={(e) => setSections({ ...sections, experience: e.target.value })} className="min-h-40" />

                <h2 className="font-semibold mt-4">Education</h2>
                <Textarea placeholder="Education details" value={sections.education} onChange={(e) => setSections({ ...sections, education: e.target.value })} className="min-h-32" />
              </section>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleExportPdf}>Export PDF</Button>
              <Button variant="outline" onClick={handleDownloadTxt}>Download .txt</Button>
              {rawText && (
                <Button variant="ghost" asChild>
                  <a href="#raw" aria-label="Jump to raw text preview">View Raw</a>
                </Button>
              )}
            </div>

            {rawText && (
              <section id="raw" className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Raw text extracted</h3>
                <Textarea readOnly value={rawText} className="min-h-32" />
              </section>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
