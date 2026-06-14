import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Languages, ChevronDown, Send, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceAgent, LANGUAGE_OPTIONS } from "@/hooks/useVoiceAgent";
import LanguageSelector from "./LanguageSelector";
import ChatBubble from "./ChatBubble";
import ThinkingIndicator from "./ThinkingIndicator";
import MicButton from "./MicButton";
import CollectedDataPanel from "./CollectedDataPanel";

export default function VoiceAgentModal({ isOpen, onClose, onComplete, dynamicFields, onDataUpdate }) {
  const chatEndRef = useRef(null);
  const [textInput, setTextInput] = useState("");
  const [muteVoice, setMuteVoice] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const agent = useVoiceAgent({
    dynamicFields,
    onComplete: (data) => {
      setTimeout(() => {
        onComplete(data);
        onClose();
      }, 1200);
    },
  });

  // Expose live data upwards
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(agent.collectedData);
    }
  }, [agent.collectedData, onDataUpdate]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.messages, agent.isThinking]);

  // Mute toggle
  useEffect(() => {
    if (muteVoice) agent.stopSpeaking();
  }, [muteVoice]);

  const handleSelectLanguage = (lang) => {
    agent.startSession({ code: lang.code, name: lang.name, flag: lang.flag });
  };

  const handleMicStart = () => {
    agent.stopSpeaking();
    agent.startListening(agent.handleSpeechResult);
  };

  // Stop mic when bot starts speaking
  useEffect(() => {
    if (agent.isSpeaking) {
      agent.stopListening();
    }
  }, [agent.isSpeaking]);

  const autoStartedMsgIdRef = useRef(null);

  // Auto-start mic only after Alex finishes speaking (isSpeaking just went false)
  useEffect(() => {
    if (agent.isSpeaking || agent.isThinking || agent.isListening) return;
    if (agent.phase !== "collecting" && agent.phase !== "confirming") return;
    if (agent.messages.length === 0) return;

    const lastMsg = agent.messages[agent.messages.length - 1];

    // Only auto-start ONCE per assistant message. 
    // This prevents infinite muting/unmuting loops if the user manually stops the mic.
    if (lastMsg?.role === "assistant" && autoStartedMsgIdRef.current !== lastMsg.id) {
      autoStartedMsgIdRef.current = lastMsg.id;
      // Small delay to avoid picking up echo
      const t = setTimeout(() => agent.startListening(agent.handleSpeechResult), 400);
      return () => clearTimeout(t);
    }
  }, [agent.isSpeaking, agent.isThinking, agent.isListening, agent.phase, agent.messages]);

  const handleSendText = () => {
    const text = textInput.trim();
    if (!text || agent.isThinking) return;
    setTextInput("");
    agent.handleTextInput(text);
  };

  const handleClose = () => {
    agent.reset();
    onClose();
  };

  const handleLanguageSwitch = (lang) => {
    setShowLangMenu(false);
    agent.reset();
    agent.startSession({ code: lang.code, name: lang.name, flag: lang.flag });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: "hsla(215, 28%, 7%, 0.6)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full sm:max-w-lg bg-background border border-border rounded-t-3xl sm:rounded-2xl 
                       shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "92vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-background border border-foreground shadow-sm"
                >
                  <span className="text-foreground text-base font-bold">P</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Phil — Voice Assistant</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Phil. AI
                    {agent.phase !== "language" && (
                      <span className="ml-1">· {agent.language.flag} {agent.language.name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Language switcher */}
                {agent.phase !== "language" && (
                  <div className="relative">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setShowLangMenu(p => !p)}
                      className="h-8 gap-1.5 text-xs text-muted-foreground"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    <AnimatePresence>
                      {showLangMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-44 bg-card border border-border 
                                     rounded-xl shadow-xl z-10 overflow-hidden"
                        >
                          {LANGUAGE_OPTIONS.map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageSwitch(lang)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                            >
                              <span className="text-base">{lang.flag}</span>
                              <span className="text-foreground">{lang.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Mute */}
                {agent.phase !== "language" && (
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setMuteVoice(p => !p)}
                    className="h-8 w-8 p-0 text-muted-foreground"
                  >
                    {muteVoice ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <AnimatePresence mode="wait">
                {agent.phase === "language" ? (
                  <LanguageSelector key="lang" onSelect={handleSelectLanguage} />
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col h-full"
                  >
                    {/* Chat messages */}
                    <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                      {agent.messages.map((msg, i) => (
                        <ChatBubble
                          key={msg.id}
                          message={msg}
                          isLatest={i === agent.messages.length - 1}
                        />
                      ))}

                      <AnimatePresence>
                        {agent.isThinking && <ThinkingIndicator key="thinking" />}
                      </AnimatePresence>

                      {/* Live transcript */}
                      <AnimatePresence>
                        {agent.isListening && agent.transcript && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-end"
                          >
                            <div className="max-w-[78%] bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-primary/80 italic">
                              {agent.transcript}…
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Complete state */}
                      <AnimatePresence>
                        {agent.phase === "complete" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-center py-4"
                          >
                            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-center max-w-xs">
                              <div className="text-2xl mb-2">✅</div>
                              <div className="text-sm font-semibold text-green-800 mb-1">Application Complete</div>
                              <div className="text-xs text-green-600">Handing off to Phil.…</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div ref={chatEndRef} />
                    </div>

                    {Object.keys(agent.collectedData).length > 0 && (
                      <div className="px-4 pb-3 flex-shrink-0">
                        <CollectedDataPanel data={agent.collectedData} dynamicFields={dynamicFields} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input bar (only during conversation) */}
            {agent.phase !== "language" && agent.phase !== "complete" && (
              <div className="px-4 py-4 border-t border-border flex-shrink-0">
                {/* Mic */}
                <div className="flex justify-center mb-4">
                  <MicButton
                    isListening={agent.isListening}
                    isSpeaking={agent.isSpeaking}
                    isThinking={agent.isThinking}
                    onStart={handleMicStart}
                    onStop={agent.stopListening}
                  />
                </div>

                {/* Text fallback */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendText()}
                    placeholder="Or type your response…"
                    disabled={agent.isThinking || agent.isListening}
                    className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-border bg-card
                               focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                               disabled:opacity-40 transition-all placeholder:text-muted-foreground/40"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendText}
                    disabled={!textInput.trim() || agent.isThinking}
                    className="w-10 h-10 p-0 rounded-xl flex-shrink-0 bg-background text-foreground border border-foreground hover:bg-muted transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4 text-foreground" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}