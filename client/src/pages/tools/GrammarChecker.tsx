import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { SpellCheck, Copy, Download, Loader2 } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import { copyToClipboard, downloadTxt } from "@/lib/clientUtils";

export default function GrammarChecker() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useMemo(() => { document.title = "Grammar Checker – Note Bot AI"; }, []);

  const check = async () => {
    if (!text.trim()) return;
    setLoading(true);
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
    setLoading(false);
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
    setMatches([]);
  };

  const inputContent = (
    <>
      <Textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        className="min-h-48" 
        placeholder="Paste text here..." 
      />
      <Button 
        onClick={check} 
        disabled={!text.trim() || loading}
        className="w-full hover-lift hover-glow ripple-effect bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <SpellCheck className="w-4 h-4 mr-2" />
            Check Grammar
          </>
        )}
      </Button>
    </>
  );

  const outputContent = (
    <>
      {progress > 0 && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
        </div>
      )}
      {matches.length > 0 && (
        <>
          <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
            {matches.map((m, i) => (
              <li key={i} className="p-2 rounded-md bg-muted">
                <strong>Issue:</strong> {m.message}
                {m.replacements?.[0]?.value && (
                  <span className="block text-xs text-muted-foreground">Suggestion: {m.replacements[0].value}</span>
                )}
              </li>
            ))}
          </ul>
          <Button 
            variant="outline" 
            onClick={applyAll}
            className="w-full"
          >
            Apply All Suggestions
          </Button>
        </>
      )}
      {matches.length === 0 && progress === 100 && (
        <div className="text-center text-muted-foreground">
          <p>No grammar issues found!</p>
        </div>
      )}
    </>
  );

  return (
    <ToolLayout
      pageTitle="Grammar Checker"
      pageDescription="Fix grammar & spelling mistakes in your text."
      heroIcon={<SpellCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />}
      heroTitle="AI Grammar Checker"
      heroDescription="Fix grammar & spelling mistakes in your text with our powerful AI tool."
      floatingKeywords={['Grammar', 'Spelling', 'Proofread', 'Correct', 'Accurate', 'Flawless']}
      inputTitle="Your Text"
      inputDescription="Paste your text below to check for grammar and spelling errors."
      inputChildren={inputContent}
      outputTitle="Corrections"
      outputDescription="Review the suggestions and apply them to your text."
      outputChildren={outputContent}
    />
  );
}
