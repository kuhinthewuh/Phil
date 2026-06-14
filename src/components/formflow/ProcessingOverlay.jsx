import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const STEPS = [
  { text: "Listening to narrative…", icon: "🎧" },
  { text: "Extracting legal entities…", icon: "🔍" },
  { text: "Parsing financial eligibility…", icon: "📊" },
  { text: "Structuring HUD compliance format…", icon: "🏛️" },
  { text: "Finalizing application packet…", icon: "📋" },
];

const OCR_STEPS = [
  { text: "Scanning image…", icon: "📸" },
  { text: "Deep-Analyzing your document", icon: "📄" },
  { text: "Mapping structured fields…", icon: "📝" },
];

export default function ProcessingOverlay({ isVisible, mode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const activeSteps = mode === "scan" ? OCR_STEPS : STEPS;

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < activeSteps.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, [isVisible, activeSteps.length]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-2xl border border-border p-10 max-w-md w-full mx-4"
      >
        {/* Spinning loader */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              className="w-16 h-16 rounded-full border-[3px] border-muted"
              style={{ borderTopColor: "hsl(217 71% 45%)", borderRightColor: "hsl(199 89% 48%)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl">{activeSteps[currentStep].icon}</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {activeSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: i <= currentStep ? 1 : 0.25,
                x: 0,
              }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  i < currentStep
                    ? "bg-green-500"
                    : i === currentStep
                    ? "bg-primary animate-pulse"
                    : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={`text-sm transition-colors duration-500 ${
                  i === currentStep
                    ? "text-foreground font-medium"
                    : i < currentStep
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
                }`}
              >
                {step.text}
              </span>
              {i < currentStep && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500 text-xs ml-auto"
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Processing with Phil. AI Engine
        </motion.p>
      </motion.div>
    </motion.div>
  );
}