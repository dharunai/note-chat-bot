import React, { useEffect, useMemo, useState } from "react";
interface DocumentViewerProps {
  file: File | null;
  extractedText?: string;
}
const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file,
  extractedText
}) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const obj = URL.createObjectURL(file);
    setUrl(obj);
    return () => URL.revokeObjectURL(obj);
  }, [file]);
  const ext = useMemo(() => file?.name.toLowerCase() || "", [file]);
  if (!file) {
    return <div className="text-xs md:text-sm text-muted-foreground text-center py-8">Document preview will appear here</div>;
  }
  if (ext.endsWith(".pdf") && url) {
    return <div className="rounded-lg md:rounded-xl overflow-hidden border border-border/50 h-[40vh] md:h-[60vh] bg-background">
        <iframe title="Document preview" src={url} className="w-full h-full" />
      </div>;
  }

  // Fallback preview for DOCX/TXT: show extracted text snippet
  const preview = (extractedText || "").slice(0, 4000);
  return <div className="rounded-lg md:rounded-xl border border-border/50 bg-muted/40 p-3 md:p-4 h-[40vh] md:h-[60vh] overflow-auto">
      <pre className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed text-foreground break-words">{preview || "Preview not available. The file will still be used for Q&A."}</pre>
    </div>;
};
export default DocumentViewer;