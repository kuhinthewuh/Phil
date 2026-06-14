import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Edit3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DynamicDocumentView({ 
  base64Image, 
  mimeType, 
  fields, 
  collectedData, 
  onFieldChange, 
  signature 
}) {
  const containerRef = useRef(null);
  const [imgDim, setImgDim] = useState({ width: 1, height: 1 });

  const handleImageLoad = (e) => {
    setImgDim({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
  };

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Filled_Application_${Date.now()}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Digitized Document
          </h2>
        </div>
        <Button onClick={handleDownloadPDF} size="sm" variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left: Geographic Overlay Document */}
        <div className="flex-1 bg-muted/30 border border-border rounded-xl overflow-y-auto flex items-start justify-center relative shadow-inner p-4">
          {base64Image ? (
            <div ref={containerRef} className="relative inline-block shadow-sm bg-white" style={{ maxWidth: "100%" }}>
              <img 
                src={`data:${mimeType};base64,${base64Image}`} 
                alt="Scanned Document" 
                className="w-full h-auto block"
                onLoad={handleImageLoad}
              />
              {imgDim.width > 1 && fields.map((field, idx) => {
                if (!field.bbox) return null;
                const leftPct = (field.bbox.x0 / imgDim.width) * 100;
                const topPct = (field.bbox.y0 / imgDim.height) * 100;
                // Give it some extra width visually if needed, but match height closely
                const widthPct = Math.max(((field.bbox.x1 - field.bbox.x0) / imgDim.width) * 100, 15);
                const heightPct = Math.max(((field.bbox.y1 - field.bbox.y0) / imgDim.height) * 100, 3);

                return (
                  <input 
                    key={idx}
                    type="text"
                    value={collectedData[field.key] === "Unknown" ? "" : (collectedData[field.key] || "")}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px dashed rgba(59, 130, 246, 0.5)',
                      color: '#1e3a8a',
                      fontWeight: '600',
                      fontSize: 'min(14px, 1.5vw)',
                      padding: '0 4px',
                      zIndex: 10
                    }}
                    className="focus:bg-blue-50/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all rounded-sm font-handwriting"
                  />
                );
              })}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm m-auto">No Document</span>
          )}
        </div>

        {/* Right: Extracted Editable Fields List (Fallback/Verification) */}
        <div className="w-full lg:w-80 flex flex-col bg-card border border-border rounded-xl overflow-y-auto p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" />
              Extracted Fields
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {fields.length} Found
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {fields.map((field, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {field.label || field.key}
                </label>
                <input
                  type="text"
                  value={collectedData[field.key] === "Unknown" ? "" : (collectedData[field.key] || "")}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  placeholder="Waiting for input..."
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm 
                             text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
                             placeholder:text-muted-foreground/30"
                />
              </div>
            ))}

            {signature && (
              <div className="mt-6 pt-6 border-t border-border">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Electronic Signature
                </label>
                <div 
                  className="w-full bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-center justify-center text-blue-900 dark:text-blue-100 shadow-sm"
                  style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2rem", lineHeight: 1 }}
                >
                  {signature}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
