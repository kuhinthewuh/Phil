import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="text-base font-heading font-semibold text-foreground mb-2">
        Processing Error
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
        {message || "We couldn't fully parse this narrative. Please try again or refine the transcript."}
      </p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RotateCcw className="w-3.5 h-3.5" />
        Try Again
      </Button>
    </motion.div>
  );
}