import React from "react";
import { motion } from "framer-motion";

export default function FormField({ label, value, onChange, delay = 0, wide = false, multiline = false, disabled = false }) {
  const isUnknown = !value || value === "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={wide ? "col-span-2" : ""}
    >
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
        {label}
      </div>
      {multiline ? (
        <textarea
          value={isUnknown ? "" : value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={isUnknown ? "—" : ""}
          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm font-serif text-foreground min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <input
          type="text"
          value={isUnknown ? "" : value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={isUnknown ? "—" : ""}
          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm font-serif text-foreground min-h-[36px] flex items-center focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-70"
        />
      )}
    </motion.div>
  );
}