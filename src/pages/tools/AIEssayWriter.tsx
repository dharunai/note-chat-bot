import { useMemo, useState } from "react";
import TopNav from "@/components/navigation/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export default function AIEssayWriter() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [progress, setProgress] = useState(0);
  useMemo(() => { document.title = "AI Essay Writer – Note Bot AI"; }, []);

  const run = async () => {
    if (!prompt.trim()) return;
    setProgress(10);
    const { data, error } = await supabase.functions.invoke("generate-essay", { headers: { 'Content-Type': 'application/json' }, body: { prompt } });
    if (error) {
      setOutput(`Error: ${error.message}`);
      setProgress(0);
      return;
    }
    setOutput(data.generatedText || "");
    setProgress(100);
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "essay.txt";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>AI Essay Writer</CardTitle>
            <CardDescription>Generate a structured essay from your prompt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter your topic and requirements..." />
            <div className="flex gap-2">
              <Button onClick={run} disabled={!prompt.trim()}>Generate</Button>
              {output && <Button variant="outline" onClick={download}>Download</Button>}
            </div>
            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">Processing... {progress}%</p>
              </div>
            )}
            {output && (
              <Textarea value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-48" />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
