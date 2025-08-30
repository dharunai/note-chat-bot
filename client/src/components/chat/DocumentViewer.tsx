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
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="w-full h-full max-w-full">
          <iframe 
            title="Document preview" 
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0 rounded-lg"
            style={{ minHeight: '800px' }}
          />
        </div>
      </div>
    );
  }

  // Fallback preview for DOCX/TXT: show extracted text snippet with A4 styling
  const preview = (extractedText || "").slice(0, 8000);
  return (
    <div className="w-full h-full bg-white p-8 overflow-auto">
      <div 
        className="mx-auto bg-white shadow-sm border rounded-lg p-8"
        style={{
          width: '100%',
          maxWidth: '595px', // A4 width in points
          minHeight: '842px', // A4 height in points
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.6',
          fontSize: '12px'
        }}
      >
        <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed break-words">
          {preview || "Preview not available. The file will still be used for Q&A."}
        </pre>
      </div>
    </div>
  );
};
export default DocumentViewer;