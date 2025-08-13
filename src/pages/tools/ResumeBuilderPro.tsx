import { useEffect, useMemo, useState, useRef } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Types
interface Education { school: string; degree: string; dates: string; }
interface Experience { role: string; company: string; dates: string; bullets: string[]; }
interface Project { name: string; description: string; link?: string; }

interface ResumeData {
  personal: { name: string; title: string; email: string; phone: string; location: string; links: string; };
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  achievements: string[];
  template: "modern" | "minimal" | "compact";
}

const STORAGE_KEY = "resumeBuilder.v1";

export default function ResumeBuilderPro() {
  useMemo(() => { document.title = "Resume Builder – Live Preview | Note Bot AI"; }, []);

  const [data, setData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      personal: { name: "", title: "", email: "", phone: "", location: "", links: "" },
      education: [{ school: "", degree: "", dates: "" }],
      experience: [{ role: "", company: "", dates: "", bullets: [""] }],
      skills: [],
      projects: [{ name: "", description: "", link: "" }],
      achievements: [""],
      template: "modern",
    };
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);

  const previewRef = useRef<HTMLDivElement>(null);

  // Helpers
  const update = (patch: Partial<ResumeData>) => setData(prev => ({ ...prev, ...patch }));

  const addItem = <T,>(list: T[], empty: T, setter: (arr: T[]) => void) => setter([...list, empty]);
  const removeItem = <T,>(list: T[], index: number, setter: (arr: T[]) => void) => setter(list.filter((_, i) => i !== index));

  const exportPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = 20;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save("resume.pdf");
  };

  const exportDOCX = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: data.personal.name, heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `${data.personal.title} • ${data.personal.location}` }),
            new Paragraph({ text: `${data.personal.email} • ${data.personal.phone} • ${data.personal.links}` }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }),
            ...data.experience.flatMap(exp => [
              new Paragraph({ text: `${exp.role} — ${exp.company} (${exp.dates})`, heading: HeadingLevel.HEADING_3 }),
              ...exp.bullets.filter(Boolean).map(b => new Paragraph({ text: `• ${b}` })),
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }),
            ...data.education.map(ed => new Paragraph({ text: `${ed.degree} — ${ed.school} (${ed.dates})` })),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: data.skills.join(", ") }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_2 }),
            ...data.projects.filter(p => p.name || p.description).map(p => new Paragraph({ children: [ new TextRun({ text: `${p.name}: ${p.description} ${p.link ? `(${p.link})` : ""}` }) ] })),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Achievements", heading: HeadingLevel.HEADING_2 }),
            ...data.achievements.filter(Boolean).map(a => new Paragraph({ text: `• ${a}` })),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "resume.docx"; a.click();
    URL.revokeObjectURL(url);
  };

  const badge = (txt: string) => (
    <span key={txt} className="inline-block px-2 py-1 rounded-md bg-primary/10 text-primary text-xs mr-1 mb-1">{txt}</span>
  );

  const templateClasses = {
    modern: "prose prose-sm max-w-none",
    minimal: "prose prose-sm max-w-none",
    compact: "text-sm leading-tight",
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <Card className="rounded-2xl bg-card shadow p-5 md:p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Resume Builder</CardTitle>
            <CardDescription>Live preview, templates, export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Info */}
            <section>
              <h3 className="font-semibold mb-2">Personal Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input placeholder="Full Name" value={data.personal.name} onChange={e => update({ personal: { ...data.personal, name: e.target.value } })} />
                <Input placeholder="Title" value={data.personal.title} onChange={e => update({ personal: { ...data.personal, title: e.target.value } })} />
                <Input placeholder="Email" value={data.personal.email} onChange={e => update({ personal: { ...data.personal, email: e.target.value } })} />
                <Input placeholder="Phone" value={data.personal.phone} onChange={e => update({ personal: { ...data.personal, phone: e.target.value } })} />
                <Input placeholder="Location" value={data.personal.location} onChange={e => update({ personal: { ...data.personal, location: e.target.value } })} />
                <Input placeholder="Links (portfolio, LinkedIn)" value={data.personal.links} onChange={e => update({ personal: { ...data.personal, links: e.target.value } })} />
              </div>
            </section>

            {/* Education */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Education</h3>
                <Button size="sm" variant="outline" onClick={() => update({ education: [...data.education, { school: "", degree: "", dates: "" }] })}>Add</Button>
              </div>
              {data.education.map((ed, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <Input placeholder="School" value={ed.school} onChange={e => { const arr = [...data.education]; arr[i] = { ...ed, school: e.target.value }; update({ education: arr }); }} />
                  <Input placeholder="Degree" value={ed.degree} onChange={e => { const arr = [...data.education]; arr[i] = { ...ed, degree: e.target.value }; update({ education: arr }); }} />
                  <Input placeholder="Dates" value={ed.dates} onChange={e => { const arr = [...data.education]; arr[i] = { ...ed, dates: e.target.value }; update({ education: arr }); }} />
                  {data.education.length > 1 && <Button size="sm" variant="ghost" onClick={() => update({ education: data.education.filter((_, idx) => idx !== i) })}>Remove</Button>}
                </div>
              ))}
            </section>

            {/* Experience */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Work Experience</h3>
                <Button size="sm" variant="outline" onClick={() => update({ experience: [...data.experience, { role: "", company: "", dates: "", bullets: [""] }] })}>Add</Button>
              </div>
              {data.experience.map((ex, i) => (
                <div key={i} className="space-y-2 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input placeholder="Role" value={ex.role} onChange={e => { const arr = [...data.experience]; arr[i] = { ...ex, role: e.target.value }; update({ experience: arr }); }} />
                    <Input placeholder="Company" value={ex.company} onChange={e => { const arr = [...data.experience]; arr[i] = { ...ex, company: e.target.value }; update({ experience: arr }); }} />
                    <Input placeholder="Dates" value={ex.dates} onChange={e => { const arr = [...data.experience]; arr[i] = { ...ex, dates: e.target.value }; update({ experience: arr }); }} />
                  </div>
                  {ex.bullets.map((b, j) => (
                    <div key={j} className="flex gap-2">
                      <Input placeholder="Bullet" value={b} onChange={e => { const arr = [...data.experience]; const bullets = [...ex.bullets]; bullets[j] = e.target.value; arr[i] = { ...ex, bullets }; update({ experience: arr }); }} />
                      <Button size="sm" variant="outline" onClick={() => { const arr = [...data.experience]; const bullets = ex.bullets.filter((_, idx) => idx !== j); arr[i] = { ...ex, bullets }; update({ experience: arr }); }}>Remove</Button>
                    </div>
                  ))}
                  <Button size="sm" variant="secondary" onClick={() => { const arr = [...data.experience]; arr[i] = { ...ex, bullets: [...ex.bullets, ""] }; update({ experience: arr }); }}>Add bullet</Button>
                </div>
              ))}
            </section>

            {/* Skills */}
            <section>
              <h3 className="font-semibold mb-2">Skills (comma or Enter)</h3>
              <Input placeholder="e.g., JavaScript, React, Tailwind, Node.js" onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, "");
                  if (!val) return; update({ skills: [...data.skills, val] }); (e.target as HTMLInputElement).value = "";
                }
              }} />
              <div className="mt-2">{data.skills.map(badge)}</div>
            </section>

            {/* Projects */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Projects</h3>
                <Button size="sm" variant="outline" onClick={() => update({ projects: [...data.projects, { name: "", description: "", link: "" }] })}>Add</Button>
              </div>
              {data.projects.map((p, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <Input placeholder="Name" value={p.name} onChange={e => { const arr = [...data.projects]; arr[i] = { ...p, name: e.target.value }; update({ projects: arr }); }} />
                  <Input placeholder="Link" value={p.link || ''} onChange={e => { const arr = [...data.projects]; arr[i] = { ...p, link: e.target.value }; update({ projects: arr }); }} />
                  <Input placeholder="Description" value={p.description} onChange={e => { const arr = [...data.projects]; arr[i] = { ...p, description: e.target.value }; update({ projects: arr }); }} />
                  {data.projects.length > 1 && <Button size="sm" variant="ghost" onClick={() => update({ projects: data.projects.filter((_, idx) => idx !== i) })}>Remove</Button>}
                </div>
              ))}
            </section>

            {/* Achievements */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Achievements</h3>
                <Button size="sm" variant="outline" onClick={() => update({ achievements: [...data.achievements, ""] })}>Add</Button>
              </div>
              {data.achievements.map((a, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="Achievement" value={a} onChange={e => { const arr = [...data.achievements]; arr[i] = e.target.value; update({ achievements: arr }); }} />
                  {data.achievements.length > 1 && <Button size="sm" variant="ghost" onClick={() => update({ achievements: data.achievements.filter((_, idx) => idx !== i) })}>Remove</Button>}
                </div>
              ))}
            </section>

            {/* Template Selector */}
            <section>
              <h3 className="font-semibold mb-2">Template</h3>
              <Select value={data.template} onValueChange={(v) => update({ template: v as ResumeData["template"] })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </section>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={exportPDF}>Export PDF</Button>
              <Button variant="outline" onClick={exportDOCX}>Export DOCX</Button>
              <Button variant="ghost" onClick={() => { localStorage.removeItem(STORAGE_KEY); location.reload(); }}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <Card className="rounded-2xl bg-white shadow p-5 md:p-6 sticky top-4 h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Live Preview</CardTitle>
            <CardDescription>Switch templates anytime</CardDescription>
          </CardHeader>
          <CardContent>
            <div ref={previewRef} className={`bg-white text-black p-6 rounded-xl border border-border ${templateClasses[data.template]}`}>
              <header className="mb-2">
                <h1 className="text-2xl font-bold truncate">{data.personal.name || "Your Name"}</h1>
                <p className="text-sm text-gray-600 break-words">{[data.personal.title, data.personal.location].filter(Boolean).join(" • ")}</p>
                <p className="text-xs text-gray-600 break-words">{[data.personal.email, data.personal.phone, data.personal.links].filter(Boolean).join(" • ")}</p>
              </header>
              <section className="mt-3">
                <h2 className="font-semibold">Experience</h2>
                {data.experience.filter(ex => ex.role || ex.company || ex.bullets.some(Boolean)).map((ex, i) => (
                  <div key={i} className="mt-1">
                    <p className="font-medium break-words">{ex.role || "Role"} — {ex.company || "Company"} <span className="text-xs text-gray-600">{ex.dates}</span></p>
                    <ul className="list-disc pl-5">
                      {ex.bullets.filter(Boolean).map((b, j) => (<li key={j} className="break-words">{b}</li>))}
                    </ul>
                  </div>
                ))}
              </section>
              <section className="mt-3">
                <h2 className="font-semibold">Education</h2>
                {data.education.filter(ed => ed.school || ed.degree).map((ed, i) => (
                  <p key={i} className="break-words">{ed.degree || "Degree"} — {ed.school || "School"} <span className="text-xs text-gray-600">{ed.dates}</span></p>
                ))}
              </section>
              <section className="mt-3">
                <h2 className="font-semibold">Skills</h2>
                <div className="mt-1">{data.skills.map(badge)}</div>
              </section>
              {data.projects.some(p => p.name || p.description) && (
                <section className="mt-3">
                  <h2 className="font-semibold">Projects</h2>
                  {data.projects.filter(p => p.name || p.description).map((p, i) => (
                    <p key={i} className="break-words"><span className="font-medium">{p.name}:</span> {p.description} {p.link && (<a href={p.link} className="text-blue-600" target="_blank" rel="noopener noreferrer">({p.link})</a>)}</p>
                  ))}
                </section>
              )}
              {data.achievements.some(Boolean) && (
                <section className="mt-3">
                  <h2 className="font-semibold">Achievements</h2>
                  <ul className="list-disc pl-5">
                    {data.achievements.filter(Boolean).map((a, i) => (<li key={i} className="break-words">{a}</li>))}
                  </ul>
                </section>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
