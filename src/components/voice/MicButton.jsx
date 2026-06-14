import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";

export default function MicButton({ isListening, isSpeaking, isThinking, onStart, onStop }) {
  const isDisabled = isThinking;

  const getState = () => {
    if (isListening)  return "listening";
    if (isSpeaking)   return "speaking";
    if (isThinking)   return "thinking";
    return "idle";
  };
  const state = getState();

  const colors = {
    idle:      "bg-primary",
    listening: "bg-primary",
    speaking:  "bg-primary",
    thinking:  "bg-secondary",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Status label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground"
        >
          {state === "idle"      && "Tap to speak"}
          {state === "listening" && "Listening…"}
          {state === "speaking"  && "Speaking…"}
          {state === "thinking"  && "Processing…"}
        </motion.span>
      </AnimatePresence>

      {/* Pulse rings */}
      <div className="relative flex items-center justify-center">
        {(isListening || isSpeaking) && (
          <>
            <motion.div
              className={`absolute rounded-full ${colors[state]} opacity-20`}
              animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 80, height: 80 }}
            />
            <motion.div
              className={`absolute rounded-full ${colors[state]} opacity-10`}
              animate={{ scale: [1, 2.2, 1], opacity: [0.1, 0, 0.1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              style={{ width: 80, height: 80 }}
            />
          </>
        )}

        {/* Core button */}
        <motion.button
          onClick={isListening ? onStop : onStart}
          disabled={isDisabled}
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: isDisabled ? 1 : 1.05 }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center 
                     ${colors[state]} shadow-xl
                     transition-shadow duration-300
                     ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                     shadow-primary/25`}
        >
          {isListening ? (
            <Square className="w-5 h-5 text-white fill-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
}