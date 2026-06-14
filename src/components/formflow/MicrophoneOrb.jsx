import React from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";

export default function MicrophoneOrb({ isProcessing }) {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="relative">
        {/* Outer pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{
            scale: isProcessing ? [1, 1.8, 1] : [1, 1.3, 1],
            opacity: isProcessing ? [0.3, 0, 0.3] : [0.15, 0, 0.15],
          }}
          transition={{ duration: isProcessing ? 1 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 80, height: 80, top: -12, left: -12 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-accent/10"
          animate={{
            scale: isProcessing ? [1, 2.2, 1] : [1, 1.5, 1],
            opacity: isProcessing ? [0.2, 0, 0.2] : [0.1, 0, 0.1],
          }}
          transition={{ duration: isProcessing ? 1.3 : 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          style={{ width: 80, height: 80, top: -12, left: -12 }}
        />

        {/* Core orb */}
        <motion.div
          className="relative w-14 h-14 rounded-full flex items-center justify-center bg-primary shadow-lg shadow-primary/20"
          animate={{
            scale: isProcessing ? [1, 1.08, 1] : [1, 1.03, 1],
          }}
          transition={{ duration: isProcessing ? 0.6 : 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mic className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </div>
  );
}