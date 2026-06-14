import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, Loader2 } from "lucide-react";

export default function DocumentScanner({ t, onFileScanned, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      // FileReader result is a data URL: "data:image/jpeg;base64,/9j/4AAQ..."
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        onFileScanned(base64Data, file.type, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-6 rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t?.scan_header || "Document Scan"}
          </span>
        </div>
        <h2 className="text-xl font-heading font-semibold text-foreground mt-2">
          {t?.scan_title || "Upload Official Document"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t?.scan_desc || "Upload an image of a form. Our AI will scan it, extract the required fields, and generate an editable digital interface."}
        </p>
      </div>

      <div
        className={`flex-1 min-h-[280px] mb-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${dragActive ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/5"
          } ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={handleChange}
        />
        <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          ) : (
            <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
          )}

          <h3 className="text-lg font-medium text-foreground mb-1">
            {isProcessing ? "Scanning Document..." : "Drag & Drop or Click to Upload"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG, WEBP, and other image formats
          </p>
        </label>
      </div>
    </motion.div>
  );
}
