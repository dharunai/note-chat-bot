import React from "react";

interface ChatMessageProps {
  role: "assistant" | "user";
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-elegant ${
          isUser
            ? "gradient-primary text-primary-foreground"
            : "bg-muted/50 text-foreground border border-border/50"
        }`}
        aria-label={isUser ? "User message" : "AI message"}
      >
        <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-[0.95rem]">{content}</p>
      </article>
    </div>
  );
};

export default ChatMessage;
