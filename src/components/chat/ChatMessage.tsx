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
        className={`max-w-[90%] md:max-w-[85%] rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-elegant ${
          isUser
            ? "gradient-primary text-primary-foreground"
            : "bg-muted/50 text-foreground border border-border/50"
        }`}
        aria-label={isUser ? "User message" : "AI message"}
      >
        <p className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm lg:text-[0.95rem] break-words">{content}</p>
      </article>
    </div>
  );
};

export default ChatMessage;
