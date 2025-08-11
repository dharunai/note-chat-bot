import { useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export default function GrammarChecker() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  useMemo(() => { document.title = "Grammar Checker – Note Bot AI"; }, []);

  const check = async () => {
    if (!text.trim()) return;
    setProgress(20);
    const params = new URLSearchParams();
    params.set("text", text);
    params.set("language", "en-US");
    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    setMatches(data.matches || []);
    setProgress(100);
  };

  const applyAll = () => {
    let out = text;
    // Apply from end to start to keep indices stable
    const sorted = [...matches].sort((a, b) => (b.offset + b.length) - (a.offset + a.length));
    sorted.forEach((m) => {
      const repl = m.replacements?.[0]?.value;
      if (!repl) return;
      out = out.slice(0, m.offset) + repl + out.slice(m.offset + m.length);
    });
    setText(out);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Grammar Checker</CardTitle>
            <CardDescription>Fix grammar & spelling using LanguageTool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-48" placeholder="Paste text here..." />
            <div className="flex gap-2">
              <Button onClick={check} disabled={!text.trim()}>Check</Button>
              {matches.length > 0 && <Button variant="outline" onClick={applyAll}>Apply All</Button>}
            </div>
            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}
            {matches.length > 0 && (
              <ul className="space-y-2 text-sm">
                {matches.map((m, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted">
                    <strong>Issue:</strong> {m.message}
                    {m.replacements?.[0]?.value && (
                      <span className="block text-xs text-muted-foreground">Suggestion: {m.replacements[0].value}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
