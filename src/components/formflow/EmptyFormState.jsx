import React from "react";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";

export default function EmptyFormState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center justify-center h-full text-center px-8"
    >
      <div className="w-20 h-20 rounded-2xl bg-muted/60 flex items-center justify-center mb-6">
        <FileText className="w-8 h-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
        Application Preview
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        Your structured government housing application will appear here once
        the AI processes the narrative input.
      </p>
      <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground/50">
        <ArrowLeft className="w-3 h-3" />
        <span>Enter a story on the left to begin</span>
      </div>

      {/* Decorative form skeleton */}
      <div className="mt-8 w-full max-w-xs space-y-3 opacity-[0.07]">
        <div className="h-3 bg-foreground rounded w-3/4 mx-auto" />
        <div className="h-2 bg-foreground rounded w-1/2 mx-auto" />
        <div className="border-t border-foreground mt-4 pt-4 space-y-2">
          <div className="flex gap-3">
            <div className="h-8 bg-foreground rounded flex-1" />
            <div className="h-8 bg-foreground rounded flex-1" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 bg-foreground rounded flex-1" />
            <div className="h-8 bg-foreground rounded flex-1" />
          </div>
          <div className="h-12 bg-foreground rounded w-full" />
        </div>
      </div>
    </motion.div>
  );
}