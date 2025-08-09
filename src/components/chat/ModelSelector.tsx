import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ModelSelectorProps {
  open: boolean;
  onSelect: (model: "Google Gemini" | "OpenAI GPT") => void;
}

export default function ModelSelector({ open, onSelect }: ModelSelectorProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose your AI model
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button className="w-full" onClick={() => onSelect("Google Gemini")}>1️⃣ Google Gemini</Button>
          <Button variant="secondary" className="w-full" onClick={() => onSelect("OpenAI GPT")}>2️⃣ OpenAI GPT</Button>
          <p className="text-xs text-muted-foreground">
            You can switch later from the chat header.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
