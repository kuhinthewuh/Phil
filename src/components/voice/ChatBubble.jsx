import React from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

export default function ChatBubble({ message, isLatest }) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      {isAssistant && (
        <div
          className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 bg-primary"
        >
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isAssistant
            ? "bg-primary text-primary-foreground rounded-tl-sm"
            : "bg-[#737373] text-white rounded-tr-sm"
          }`}
      >
        {message.content}

        {isLatest && isAssistant && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-block w-1 h-3.5 bg-primary/40 rounded-full ml-1 align-middle"
            style={{ display: "none" }} // only show when "thinking" — handled by parent
          />
        )}
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 bg-muted border border-border">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}