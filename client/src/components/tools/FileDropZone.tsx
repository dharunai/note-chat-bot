import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  accept?: Record<string, string[]>;
  multiple?: boolean;
  onDrop: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function FileDropZone({ accept, multiple = true, onDrop, className, children }: FileDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    onDrop: (accepted) => onDrop(accepted),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "rounded-lg border-2 border-dashed p-6 md:p-8 text-center cursor-pointer transition-smooth",
        isDragActive ? "border-primary bg-primary/5" : "border-muted",
        className
      )}
    >
      <input {...getInputProps()} />
      {children || <p className="text-xs md:text-sm text-muted-foreground">Drag & drop files here, or tap to select</p>}
    </div>
  );
}
