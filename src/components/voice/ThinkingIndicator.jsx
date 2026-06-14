import React from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-3 justify-start"
    >
      <div
        className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-background border border-foreground shadow-sm"
      >
        <Bot className="w-4 h-4 text-foreground" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}