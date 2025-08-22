import { useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface Source { title: string; url: string; snippet: string; }

export default function PlagiarismChecker() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  useMemo(() => { document.title = "Plagiarism Checker – Note Bot AI"; }, []);

  const run = async () => {
    if (!text.trim()) return;
    setProgress(20);
    const response = await fetch('/api/plagiarism-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) { setScore(null); setSources([]); setProgress(0); return; }
    
    const data = await response.json();
    setScore(data.score);
    setSources(data.suggestions || []);
    setProgress(100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Plagiarism Checker</CardTitle>
            <CardDescription>Compare your text against Wikipedia sources.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-48" placeholder="Paste text here..." />
            <div className="flex gap-2">
              <Button onClick={run} disabled={!text.trim()}>Check</Button>
            </div>
            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}
            {score !== null && (
              <div>
                <p className="text-sm">Estimated overlap: <strong>{Math.round(score * 100)}%</strong></p>
                <ul className="mt-3 space-y-2">
                  {sources.map((s, i) => (
                    <li key={i} className="p-3 rounded-md bg-muted">
                      <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-primary">{s.title}</a>
                      <p className="text-xs text-muted-foreground mt-1">{s.snippet}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
