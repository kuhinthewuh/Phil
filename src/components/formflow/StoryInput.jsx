import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MicrophoneOrb from "./MicrophoneOrb";

const DEFAULT_TRANSCRIPT = "";

export default function StoryInput({ t, transcript, setTranscript, onProcess, isProcessing, onVoiceClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-6 rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t?.story_header || "Narrative Input"}
          </span>
        </div>
        <h2 className="text-xl font-heading font-semibold text-foreground mt-2">
          {t?.story_title || "Share Your Story"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t?.story_desc || "Paste or type a personal narrative. Our AI will extract the relevant information and structure it into a complete housing assistance application."}
        </p>
      </div>

      <div onClick={onVoiceClick} className="cursor-pointer">
        <MicrophoneOrb isProcessing={isProcessing} />
      </div>

      {/* Textarea */}
      <div className="flex-1 min-h-0 mb-4">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Share your story here..."
          className="w-full h-full min-h-[280px] p-5 rounded-xl border border-border bg-card text-foreground 
                     text-sm leading-relaxed resize-none font-body
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     transition-all duration-300 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onProcess}
          disabled={isProcessing || !transcript.trim()}
          size="lg"
          className="flex-1 h-12 text-sm font-semibold tracking-wide rounded-xl
                     bg-background text-foreground border border-foreground hover:bg-muted 
                     transition-all duration-300 shadow-sm
                     disabled:opacity-40 disabled:shadow-none"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Process Application
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {transcript !== DEFAULT_TRANSCRIPT && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTranscript(DEFAULT_TRANSCRIPT)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export { DEFAULT_TRANSCRIPT };