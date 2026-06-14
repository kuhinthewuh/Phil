import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";

export default function VoiceAgentButton({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 260 }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-right"
          >
            <div className="text-xs font-semibold text-foreground whitespace-nowrap">
              Talk to Phil
            </div>
            <div className="text-[10px] text-muted-foreground whitespace-nowrap">
              Voice-guided application
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={onClick}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary opacity-50"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center relative shadow-lg">
          <Mic className="w-6 h-6 text-primary-foreground relative z-10" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-white" />
        </div>
      </motion.button>
    </motion.div>
  );
}