import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ExportData } from "@/types/extraction";

interface PdfUploaderProps {
  onExtracted: (data: ExportData) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

const PdfUploader = ({ onExtracted, isProcessing, setIsProcessing }: PdfUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-paper`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Extraction failed");
      }

      const data: ExportData = await response.json();
      onExtracted(data);
      
      toast({
        title: "Extraction complete",
        description: `Processed in ${data.normalized.metadata.processingTimeMs}ms with ${Math.round(data.normalized.metadata.overallConfidence * 100)}% confidence`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Extraction failed";
      setError(message);
      toast({
        title: "Extraction failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
          dragActive
            ? "border-primary bg-primary/5"
            : error
            ? "border-destructive/50 bg-destructive/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center py-10 px-4">
          {selectedFile ? (
            <>
              <FileText className="h-12 w-12 text-primary mb-3" />
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                Drop a PDF here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: 20MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Extract button */}
      {selectedFile && (
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleExtract}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Extract & Normalize
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null);
              setError(null);
            }}
            disabled={isProcessing}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Processing info */}
      {isProcessing && (
        <div className="mt-4 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Processing pipeline:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Layer 1: GROBID extraction (parsing PDF structure)</li>
            <li>Layer 2: LLM normalization (standardizing data)</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
