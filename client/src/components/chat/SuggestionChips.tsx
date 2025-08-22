import React from "react";
import { Sparkles, MessageSquare, ListChecks, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  suggestions: string[];
  onClick: (text: string) => void;
}

const icons = [Sparkles, MessageSquare, ListChecks, HelpCircle];

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-2 md:mt-3">
      {suggestions.map((s, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Button
            key={s}
            type="button"
            variant="secondary"
            onClick={() => onClick(s)}
            className="justify-start h-auto py-2 md:py-3 px-3 md:px-4 text-left rounded-lg md:rounded-xl bg-secondary hover:bg-secondary/80 shadow-elegant"
          >
            <Icon className="h-4 w-4 mr-2 text-primary" />
            <span className="text-xs md:text-sm leading-tight">{s}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default SuggestionChips;
