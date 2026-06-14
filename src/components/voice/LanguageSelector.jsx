import React from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/hooks/useVoiceAgent";

export default function LanguageSelector({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full px-6 py-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-background border border-foreground shadow-sm"
      >
        <Globe className="w-8 h-8 text-foreground" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">
          Welcome to Phil. Voice
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          I'll guide you through your housing assistance application by conversation.
          Which language would you prefer?
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {LANGUAGE_OPTIONS.map((lang, i) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            onClick={() => onSelect(lang)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border 
                       bg-card hover:bg-muted hover:border-primary/30 hover:shadow-md
                       transition-all duration-200 text-left group"
          >
            <span className="text-2xl">{lang.flag}</span>
            <div>
              <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {lang.label}
              </div>
              <div className="text-[10px] text-muted-foreground">{lang.name}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => onSelect(LANGUAGE_OPTIONS[0])}
        className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Continue in English <ArrowRight className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}