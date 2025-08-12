import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard, downloadTxt, exportFlashcardsPdf } from "@/lib/clientUtils";
import { supabase } from "@/integrations/supabase/client";
import { Quote, Shuffle, ListChecks, PenTool, ScanText, Languages, SpellCheck, BadgeCheck } from "lucide-react";


export default function StudyTools() {
  useMemo(() => { document.title = "Study Tools – Note Bot AI"; }, []);
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      l.setAttribute('href', window.location.href);
      document.head.appendChild(l);
    }
  }, []);

  // Citation Generator
  const [citationQuery, setCitationQuery] = useState("");
  const [citationStyle, setCitationStyle] = useState<'apa'|'mla'|'chicago'|'all'>("all");
  const [citationOut, setCitationOut] = useState("");
  const genCitations = async () => {
    if (!citationQuery.trim()) return;
    const { data, error } = await supabase.functions.invoke('citations', { body: { query: citationQuery, style: citationStyle } });
    if (error) { toast({ title: 'Citation error', description: error.message, variant: 'destructive' }); return; }
    const out = citationStyle === 'apa' ? data.apa : citationStyle === 'mla' ? data.mla : citationStyle === 'chicago' ? data.chicago : [data.apa, data.mla, data.chicago].join('\n\n');
    setCitationOut(out);
  };

  // Paraphrasing
  const [paraIn, setParaIn] = useState("");
  const [tone, setTone] = useState<'formal'|'casual'|'academic'>("formal");
  const [paraOut, setParaOut] = useState("");
  const paraphrase = async () => {
    if (!paraIn.trim()) return;
    const { data, error } = await supabase.functions.invoke('paraphrase', { body: { text: paraIn, tone } });
    if (error) { toast({ title: 'Paraphrase error', description: error.message, variant: 'destructive' }); return; }
    setParaOut(data.paraphrased);
  };

  // Summarizer
  const [sumIn, setSumIn] = useState("");
  const [sumMode, setSumMode] = useState<'bullets'|'paragraph'>("bullets");
  const [sumOut, setSumOut] = useState<string | string[]>("");
  const summarize = async () => {
    if (!sumIn.trim()) return;
    const { data, error } = await supabase.functions.invoke('summarize', { body: { text: sumIn, mode: sumMode, max_points: 6 } });
    if (error) { toast({ title: 'Summarize error', description: error.message, variant: 'destructive' }); return; }
    setSumOut(sumMode === 'bullets' ? data.bullets : data.paragraph);
  };

  // Essay Writer + Plagiarism
  const [topic, setTopic] = useState("");
  const [research, setResearch] = useState(false);
  const [essay, setEssay] = useState("");
  const [plag, setPlag] = useState<{ score: number; sources: { title: string; url: string; snippet: string }[] } | null>(null);
  const generateEssay = async () => {
    if (!topic.trim()) return;
    const prompt = research ? `Research Mode: Include relevant facts and context with inline mentions when obvious.\n\nTopic: ${topic}` : topic;
    const { data, error } = await supabase.functions.invoke('generate-essay', { body: { prompt } });
    if (error) { toast({ title: 'Essay error', description: error.message, variant: 'destructive' }); return; }
    setEssay(data.generatedText);
    setPlag(null);
  };
  const runPlag = async () => {
    if (!essay.trim()) return;
    const { data, error } = await supabase.functions.invoke('plagiarism-check', { body: { text: essay } });
    if (error) { toast({ title: 'Plagiarism error', description: error.message, variant: 'destructive' }); return; }
    setPlag(data);
  };

  // Flashcards
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(12);
  const [cards, setCards] = useState<{ q: string; a: string }[]>([]);
  const createCards = async () => {
    if (!notes.trim()) return;
    const { data, error } = await supabase.functions.invoke('flashcards', { body: { notes, count } });
    if (error) { toast({ title: 'Flashcards error', description: error.message, variant: 'destructive' }); return; }
    setCards(data.cards || []);
  };
  const shuffleCards = () => setCards((c) => [...c].sort(() => Math.random() - 0.5));

  // Grammar Checker (inline)
  const [gramIn, setGramIn] = useState("");
  const [gramMatches, setGramMatches] = useState<any[]>([]);
  const checkGrammar = async () => {
    const params = new URLSearchParams();
    params.set('text', gramIn);
    params.set('language', 'en-US');
    const res = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
    const data = await res.json();
    setGramMatches(data.matches || []);
  };

  // Translator
  const [trIn, setTrIn] = useState("");
  const [trTarget, setTrTarget] = useState("es");
  const [trOut, setTrOut] = useState("");
  const [trDetected, setTrDetected] = useState("");
  const translate = async () => {
    if (!trIn.trim()) return;
    const { data, error } = await supabase.functions.invoke('translate', { body: { text: trIn, targetLang: trTarget } });
    if (error) { toast({ title: 'Translate error', description: error.message, variant: 'destructive' }); return; }
    setTrOut(data.translated);
    setTrDetected(data.detected);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'zh', label: 'Chinese (Simplified)' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'ar', label: 'Arabic' },
    { code: 'hi', label: 'Hindi' },
    { code: 'bn', label: 'Bengali' },
    { code: 'tr', label: 'Turkish' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'th', label: 'Thai' },
    { code: 'nl', label: 'Dutch' },
    { code: 'sv', label: 'Swedish' },
    { code: 'pl', label: 'Polish' },
    { code: 'uk', label: 'Ukrainian' },
  ];

  const sectionCls = "grid gap-4 md:grid-cols-2";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Study Tools</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Made by a student, for students — 100% free, no sign-ups.</p>
        </header>

        {/* Citation Generator */}
        <section className="mb-8" aria-labelledby="citation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Quote className="h-5 w-5 text-primary" /> Citation Generator</CardTitle>
              <CardDescription>APA, MLA, Chicago. Paste a title, URL, or DOI.</CardDescription>
            </CardHeader>
            <CardContent className={sectionCls}>
              <div className="space-y-3">
                <Textarea placeholder="e.g., 10.1038/s41586-020-2649-2 or article title" value={citationQuery} onChange={(e) => setCitationQuery(e.target.value)} />
                <div className="flex gap-2 items-center">
                  <Select value={citationStyle} onValueChange={(v) => setCitationStyle(v as any)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Style" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="apa">APA</SelectItem>
                      <SelectItem value="mla">MLA</SelectItem>
                      <SelectItem value="chicago">Chicago</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={genCitations}>Generate Citation</Button>
                  <Button variant="outline" onClick={() => { copyToClipboard(citationOut); toast({ title: 'Copied!' }); }} disabled={!citationOut}>Copy</Button>
                  <Button variant="outline" onClick={() => downloadTxt('citation.txt', citationOut)} disabled={!citationOut}>Download .txt</Button>
                </div>
              </div>
              <div>
                <Textarea readOnly value={citationOut} placeholder="Your formatted citation will appear here" className="min-h-40" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Paraphrasing */}
        <section className="mb-8" aria-labelledby="paraphrase">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shuffle className="h-5 w-5 text-primary" /> Paraphrasing Tool</CardTitle>
              <CardDescription>Choose a tone and compare side-by-side.</CardDescription>
            </CardHeader>
            <CardContent className={sectionCls}>
              <div className="space-y-3">
                <Textarea placeholder="Paste text to paraphrase..." value={paraIn} onChange={(e) => setParaIn(e.target.value)} />
                <div className="flex gap-2 items-center flex-wrap">
                  <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Tone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={paraphrase}>Paraphrase Now</Button>
                  <Button variant="outline" onClick={() => { copyToClipboard(paraOut); toast({ title: 'Copied!' }); }} disabled={!paraOut}>Copy</Button>
                  <Button variant="outline" onClick={() => downloadTxt('paraphrased.txt', paraOut)} disabled={!paraOut}>Download .txt</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Paraphrased</label>
                <Textarea readOnly value={paraOut} className="min-h-40" placeholder="Paraphrased text will appear here" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Summarizer */}
        <section className="mb-8" aria-labelledby="summarizer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Summarizer</CardTitle>
              <CardDescription>Bullet points or a concise paragraph.</CardDescription>
            </CardHeader>
            <CardContent className={sectionCls}>
              <div className="space-y-3">
                <Textarea placeholder="Paste long text to summarize..." value={sumIn} onChange={(e) => setSumIn(e.target.value)} />
                <div className="flex gap-2 items-center">
                  <Select value={sumMode} onValueChange={(v) => setSumMode(v as any)}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullets">Bullet points</SelectItem>
                      <SelectItem value="paragraph">Paragraph</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={summarize}>Summarize</Button>
                  <Button variant="outline" onClick={() => { const out = Array.isArray(sumOut) ? (sumOut as string[]).map(b => `- ${b}`).join('\n') : String(sumOut); copyToClipboard(out); toast({ title: 'Copied!' }); }} disabled={!sumOut}>Copy</Button>
                  <Button variant="outline" onClick={() => { const out = Array.isArray(sumOut) ? (sumOut as string[]).map(b => `- ${b}`).join('\n') : String(sumOut); downloadTxt('summary.txt', out); }} disabled={!sumOut}>Download .txt</Button>
                </div>
              </div>
              <div>
                {Array.isArray(sumOut) ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {(sumOut as string[]).map((b, i) => (<li key={i}>{b}</li>))}
                  </ul>
                ) : (
                  <Textarea readOnly value={String(sumOut)} className="min-h-40" placeholder="Summary will appear here" />
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Essay Writer */}
        <section className="mb-8" aria-labelledby="essay-writer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PenTool className="h-5 w-5 text-primary" /> Essay Writer</CardTitle>
              <CardDescription>Enter a topic. Research mode adds relevant facts. Run a quick plagiarism check.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col md:flex-row gap-2">
                <Input placeholder="e.g., The impact of renewable energy on local economies" value={topic} onChange={(e) => setTopic(e.target.value)} />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" className="accent-primary" checked={research} onChange={(e) => setResearch(e.target.checked)} /> Research mode
                </label>
                <Button onClick={generateEssay}>Generate Essay</Button>
                <Button variant="outline" onClick={() => { copyToClipboard(essay); toast({ title: 'Copied!' }); }} disabled={!essay}>Copy</Button>
                <Button variant="outline" onClick={() => downloadTxt('essay.txt', essay)} disabled={!essay}>Download .txt</Button>
              </div>
              <Textarea readOnly value={essay} className="min-h-56" placeholder="Your essay will appear here" />
              <div className="flex items-center gap-2">
                <Button onClick={runPlag} variant="secondary" disabled={!essay}><BadgeCheck className="h-4 w-4 mr-1" /> Run Plagiarism Check</Button>
                {plag && <span className="text-sm text-muted-foreground">Score: {(plag.score * 100).toFixed(0)}% similar</span>}
              </div>
              {plag && plag.sources?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Potential sources:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {plag.sources.map((s, i) => (<li key={i}><a className="text-primary underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a> – <span className="text-muted-foreground">{s.snippet}</span></li>))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Flashcard Creator */}
        <section className="mb-8" aria-labelledby="flashcards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ScanText className="h-5 w-5 text-primary" /> Flashcard Creator</CardTitle>
              <CardDescription>Turn notes into Q&A cards. Shuffle or study mode. Export as PDF.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-3">
                  <Textarea placeholder="Paste notes here..." value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-40" />
                  <div className="flex items-center gap-2">
                    <Input type="number" min={4} max={40} value={count} onChange={(e) => setCount(parseInt(e.target.value || '12'))} className="w-28" />
                    <Button onClick={createCards}>Create Flashcards</Button>
                    <Button variant="outline" onClick={shuffleCards} disabled={!cards.length}>Shuffle</Button>
                    <Button variant="outline" onClick={() => exportFlashcardsPdf(cards)} disabled={!cards.length}>Export PDF</Button>
                  </div>
                </div>
                <div>
                  {cards.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Your flashcards will appear here.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {cards.map((c, i) => (
                        <li key={i} className="p-3 rounded-md bg-muted">
                          <p className="font-medium">Q{i + 1}. {c.q}</p>
                          <p className="text-muted-foreground">A{i + 1}. {c.a}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Grammar Checker */}
        <section className="mb-8" aria-labelledby="grammar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><SpellCheck className="h-5 w-5 text-primary" /> Grammar Checker</CardTitle>
              <CardDescription>Detect grammar, spelling, and clarity issues with inline suggestions.</CardDescription>
            </CardHeader>
            <CardContent className={sectionCls}>
              <div className="space-y-3">
                <Textarea placeholder="Paste text to check..." value={gramIn} onChange={(e) => setGramIn(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={checkGrammar}>Check</Button>
                  <Button variant="outline" onClick={() => { copyToClipboard(gramIn); toast({ title: 'Copied!' }); }} disabled={!gramIn}>Copy</Button>
                  <Button variant="outline" onClick={() => downloadTxt('text.txt', gramIn)} disabled={!gramIn}>Download .txt</Button>
                </div>
              </div>
              <div>
                {gramMatches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Suggestions will appear here.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {gramMatches.map((m, i) => (
                      <li key={i} className="p-2 rounded-md bg-muted">
                        <strong>Issue:</strong> {m.message}
                        {m.replacements?.[0]?.value && (
                          <span className="block text-xs text-muted-foreground">Suggestion: {m.replacements[0].value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Translator */}
        <section className="mb-8" aria-labelledby="translator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /> Translator</CardTitle>
              <CardDescription>Auto-detect source language, translate to 20+ languages.</CardDescription>
            </CardHeader>
            <CardContent className={sectionCls}>
              <div className="space-y-3">
                <Textarea placeholder="Paste text to translate..." value={trIn} onChange={(e) => setTrIn(e.target.value)} />
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={trTarget} onValueChange={(v) => setTrTarget(v)}>
                    <SelectTrigger className="w-56"><SelectValue placeholder="Target language" /></SelectTrigger>
                    <SelectContent>{languages.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button onClick={translate}>Translate</Button>
                  <Button variant="outline" onClick={() => { copyToClipboard(trOut); toast({ title: 'Copied!' }); }} disabled={!trOut}>Copy</Button>
                  <Button variant="outline" onClick={() => downloadTxt('translation.txt', trOut)} disabled={!trOut}>Download .txt</Button>
                </div>
              </div>
              <div>
                <Textarea readOnly value={trOut} className="min-h-40" placeholder="Translation will appear here" />
                {trDetected && <p className="text-xs text-muted-foreground mt-1">Detected: {trDetected.toUpperCase()}</p>}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />
        <footer className="text-center text-xs text-muted-foreground">SEO: Study tools for students – paraphrasing, summarizing, citations, grammar, translation.</footer>
      </main>
    </div>
  );
}
