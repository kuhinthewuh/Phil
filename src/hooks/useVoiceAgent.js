import { useState, useCallback, useRef, useEffect } from "react";

// ─── Default Field definitions ───────────────────────────
export const DEFAULT_FIELDS = [
  { key: "first_name",       label: "first name" },
  { key: "last_name",        label: "last name" },
  { key: "phone_number",     label: "phone number" },
  { key: "monthly_income",   label: "monthly income" },
  { key: "dependents",       label: "number of dependents" },
  { key: "housing_status",   label: "current housing situation" },
];

const isFieldComplete = (val) => val !== undefined && val !== null && val !== "" && val !== "Unknown";
const allFieldsComplete = (data, fields) => fields.every(f => isFieldComplete(data[f.key]));

const buildSystemPrompt = (language, collectedData, conversationHistory, activeFields) => {
  const missing = activeFields.filter(f => !isFieldComplete(collectedData[f.key])).map(f => f.key);
  const complete = allFieldsComplete(collectedData, activeFields);
  const collectedKeys = Object.keys(collectedData).filter(k => isFieldComplete(collectedData[k]));

  return `
You are a warm, empathetic housing assistance intake specialist named "Phil".
You MUST respond entirely in ${language}.

=== ALREADY CONFIRMED FIELDS — DO NOT ASK FOR THESE AGAIN UNDER ANY CIRCUMSTANCES ===
${collectedKeys.length === 0 ? "None yet." : collectedKeys.map(k => `• ${k}: ${collectedData[k]}`).join("\n")}

=== FIELDS STILL NEEDED (ask for these one at a time) ===
${missing.length === 0 ? "NONE — ALL FIELDS ARE COMPLETE. Stop asking questions immediately." : missing.map(k => `• ${k}`).join("\n")}

=== LAST FEW MESSAGES ===
${conversationHistory.slice(-6).map(m => `${m.role === "user" ? "User" : "Phil"}: ${m.content}`).join("\n")}

=== STRICT RULES ===
1. If FIELDS STILL NEEDED is "NONE", do NOT ask any more questions. Say exactly "That is all, the form will now be automatically filled." (Translate this phrase to ${language}).
2. NEVER ask for a field listed in ALREADY CONFIRMED FIELDS.
3. If the user's latest message provides the answer to a NEEDED field, acknowledge it naturally and ask the NEXT missing field instead of asking for it again!
4. Do NOT narrate your actions. NEVER say things like "Now I am going to ask you about...". Just ask the question directly and conversationally.
5. Ask only ONE question at a time.
6. Keep responses under 2 sentences. This is voice.

=== OUTPUT: JSON ONLY, no markdown ===
{
  "message": "your spoken response in ${language}",
  "phase": "${complete ? "confirming" : "collecting"}",
  "complete": ${complete ? "true" : "false"},
  "language_detected": "${language}"
}
`.trim();
};

const LANGUAGE_OPTIONS = [
  { code: "en-US", label: "English",    flag: "🇺🇸", name: "English" },
  { code: "es-ES", label: "Español",    flag: "🇪🇸", name: "Spanish" },
  { code: "fr-FR", label: "Français",   flag: "🇫🇷", name: "French"  },
  { code: "zh-CN", label: "中文",        flag: "🇨🇳", name: "Chinese" },
  { code: "ar-SA", label: "العربية",    flag: "🇸🇦", name: "Arabic"  },
  { code: "pt-BR", label: "Português",  flag: "🇧🇷", name: "Portuguese" },
  { code: "hi-IN", label: "हिन्दी",     flag: "🇮🇳", name: "Hindi"   },
  { code: "ru-RU", label: "Русский",    flag: "🇷🇺", name: "Russian" },
];

export { LANGUAGE_OPTIONS };

export function useVoiceAgent({ onComplete, dynamicFields }) {
  const [phase, setPhase]                   = useState("language"); // language | collecting | confirming | complete
  const [language, setLanguage]             = useState({ code: "en-US", name: "English", flag: "🇺🇸" });
  const [messages, setMessages]             = useState([]);
  const [collectedData, setCollectedData]   = useState({});
  const [isThinking, setIsThinking]         = useState(false);
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [isListening, setIsListening]       = useState(false);
  const [transcript, setTranscript]         = useState("");
  const [error, setError]                   = useState(null);

  const recognitionRef  = useRef(null);
  const synthRef        = useRef(window.speechSynthesis);
  const conversationRef = useRef([]); // mirror of messages for prompt building
  const silenceTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef("");

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = useCallback((text, langCode) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      synthRef.current.cancel();
      
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode || language.code;
      utter.rate = 0.92;
      utter.pitch = 1.05;

      const done = () => { setIsSpeaking(false); resolve(); };
      const timeout = setTimeout(done, Math.min(Math.max(text.length * 70, 3000), 20000));

      utter.onstart  = () => setIsSpeaking(true);
      utter.onend    = () => { clearTimeout(timeout); done(); };
      utter.onerror  = () => { clearTimeout(timeout); done(); };

      const setVoiceAndSpeak = () => {
        const targetLang = (langCode || language.code).slice(0, 2);
        const voices = window.speechSynthesis.getVoices();
        
        let preferred = voices.find(v => v.lang.startsWith(targetLang) && v.name.includes("Google"));
        if (!preferred) preferred = voices.find(v => v.lang.startsWith(targetLang) && !v.localService);
        if (!preferred) preferred = voices.find(v => v.lang.startsWith(targetLang));
        
        if (preferred) utter.voice = preferred;
        synthRef.current.speak(utter);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => setVoiceAndSpeak();
        setTimeout(setVoiceAndSpeak, 1000);
      } else {
        setVoiceAndSpeak();
      }
    });
  }, [language.code]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // ── STT ──────────────────────────────────────────────────────────────────
  const startListening = useCallback((onResult) => {
    const SR = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (!SR) { setError("Speech recognition not supported in this browser."); return; }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = language.code;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    accumulatedTranscriptRef.current = "";
    const interimTranscriptRef = { current: "" };

    const finalizeSpeech = () => {
      const finalResult = (accumulatedTranscriptRef.current + " " + interimTranscriptRef.current).trim();
      if (finalResult) {
        onResult(finalResult);
      }
      stopListening();
    };

    rec.onstart = () => setIsListening(true);
    rec.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
    };

    rec.onerror = (e) => {
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
      if (e.error !== "aborted" && e.error !== "no-speech") {
        setError("Could not hear you clearly. Please try again.");
      }
    };

    rec.onresult = (e) => {
      clearTimeout(silenceTimerRef.current);

      let interim = "";
      let final = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }

      interimTranscriptRef.current = interim;

      if (final) {
        accumulatedTranscriptRef.current += " " + final;
      }

      const displayTranscript = (accumulatedTranscriptRef.current + " " + interim).trim();
      setTranscript(displayTranscript);

      silenceTimerRef.current = setTimeout(finalizeSpeech, 2000);
    };

    try { rec.start(); } catch (_) {}

    return () => { 
      clearTimeout(silenceTimerRef.current);
      try { rec.stop(); } catch (_) {} 
    };
  }, [language.code]);

  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsListening(false);
  }, []);

  const addMessage = useCallback((role, content, meta = {}) => {
    const msg = { id: Date.now() + Math.random(), role, content, ...meta };
    setMessages(prev => [...prev, msg]);
    conversationRef.current = [...conversationRef.current, { role, content }];
    return msg;
  }, []);

  const confirmedRef = useRef(new Set());
  const processingRef = useRef(false);

  // ── Dedicated extraction pass ─────────────────────────────────────────────
  const extractFields = useCallback(async (userText, currentData, activeFields) => {
    const stillNeeded = activeFields.filter(f => !isFieldComplete(currentData[f.key])).map(f => f.key);
    if (stillNeeded.length === 0) return {};

    const isDynamic = dynamicFields && dynamicFields.length > 0;
    let rulesText = `
- first_name: Extract the first name. If the user provides their full name (e.g. "John Smith"), extract "John" as first_name and "Smith" as last_name.
- last_name: Extract the last name.
- phone_number: ONLY extract valid phone numbers.
- monthly_income: number only (e.g. "1,400" → 1400).
- dependents: number only (e.g. "two dependents" → 2).
- housing_status: short phrase about their living situation (e.g. "homeless", "renting").
    `.trim();

    if (isDynamic) {
      rulesText = activeFields.map(f => `- ${f.key}: Extract the user's answer for "${f.label}".`).join("\n");
    }

    const extractionPrompt = `
Extract housing assistance application fields from the user's latest message ONLY.
Only extract fields listed in NEEDED. Return ONLY a JSON object with extracted key-value pairs.
If a field cannot be confidently extracted, omit it entirely — do NOT include nulls or "Unknown".
CRITICAL RULE 1: NEVER hallucinate or infer fields. If the user only says "My name is John", ONLY extract first_name. Do NOT attempt to extract hardship or housing status from that.
CRITICAL RULE 2: If the user provides a phone number, ONLY extract it into phone_number. NEVER extract it into primary_language or housing_status.
CRITICAL RULE 3: housing_status and hardship_summary are DIFFERENT. housing_status is a short phrase (e.g. "homeless", "renting"). hardship_summary is a LONGER story. If the user gives a short answer like "I'm homeless", map it ONLY to housing_status and DO NOT map it to hardship_summary.

IMPORTANT: TRANSLATE ALL EXTRACTED VALUES TO ENGLISH.

NEEDED FIELDS: ${stillNeeded.join(", ")}

CONVERSATION CONTEXT (last few messages for reference):
${conversationRef.current.slice(-6).map(m => `${m.role === "user" ? "User" : "Phil"}: ${m.content}`).join("\n")}

USER'S LATEST MESSAGE (EXTRACT ONLY FROM THIS MESSAGE): "${userText}"

RULES:
${rulesText}

OUTPUT: JSON only, no markdown, no explanation.
`.trim();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: extractionPrompt })
      });
      if (!res.ok) return {};
      const data = await res.json();
      const raw = data.text || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return {};
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {};
    }
  }, [dynamicFields]);

  // ── AI turn ──────────────────────────────────────────────────────────────
  const aiTurn = useCallback(async (userMessage, currentData, currentLang, activeFields) => {
    setIsThinking(true);
    setError(null);

    const history = conversationRef.current.slice(-12);

    console.log("=== Frontend: Voice Agent Turn ===");
    
    let raw = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: buildSystemPrompt(currentLang.name, currentData, history, activeFields) + `\n\nUser says: ${userMessage}`,
      })
    })
    .then(async res => {
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.text || "";
    })
    .catch(err => "");

    setIsThinking(false);

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { message: "I'm sorry, could you repeat that?", phase: "collecting", language_detected: currentLang.name };
    }
  }, []);

  // ── Process user input ───────────────────────────────────────────────────
  const processUserInput = useCallback(async (userText, currentData, currentLang) => {
    if (processingRef.current) return;
    processingRef.current = true;

    addMessage("user", userText);
    setTranscript("");

    const activeFields = dynamicFields && dynamicFields.length > 0 ? dynamicFields : DEFAULT_FIELDS;

    // 1. Extract fields first from the user's input
    const extracted = await extractFields(userText, currentData, activeFields);

    // 2. Merge extracted fields into the updated data
    let newData = { ...currentData };
    for (const [k, v] of Object.entries(extracted)) {
      if (!confirmedRef.current.has(k) && isFieldComplete(v)) {
        newData[k] = v;
        confirmedRef.current.add(k);
      }
    }
    setCollectedData(newData);

    const nowComplete = allFieldsComplete(newData, activeFields);
    let result;

    if (nowComplete) {
      const finishMessages = {
        English:    "Thank you. That is all the information we need. Your application will now be finalized.",
        Spanish:    "Gracias. Esa es toda la información que necesitamos. Su solicitud será finalizada ahora.",
        French:     "Merci. C'est toutes les informations dont nous avons besoin. Votre demande va maintenant être finalisée.",
        Chinese:    "谢谢。这就是我们需要的所有信息。您的申请现在将完成。",
        Arabic:     "شكرًا لك. هذا كل ما نحتاجه من معلومات. سيتم الآن الانتهاء من طلبك.",
        Portuguese: "Obrigado. Essas são todas as informações que precisamos. Sua solicitação será finalizada agora.",
        Hindi:      "धन्यवाद। हमें बस इतनी ही जानकारी चाहिए थी। आपका आवेदन अब पूरा हो जाएगा।",
        Russian:    "Спасибо. Это вся необходимая нам информация. Ваша заявка сейчас будет оформлена."
      };
      result = {
        message: finishMessages[currentLang.name] || finishMessages.English,
        phase: "complete",
        language_detected: currentLang.name
      };

      // Generate hardship summary based on context
      try {
        const genRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: `Generate a brief 3-sentence hardship summary in English from the first-person perspective for a housing assistance form.
Details:
Dependents: ${newData.dependents}
Monthly Income: $${newData.monthly_income}
Housing Status: ${newData.housing_status}
Return ONLY a valid JSON object with a single key "hardship_summary".` })
        });
        if (genRes.ok) {
          const genData = await genRes.json();
          const jsonMatch = (genData.text || "").match(/\{[\s\S]*\}/);
          if (jsonMatch) {
             newData.hardship_summary = JSON.parse(jsonMatch[0]).hardship_summary;
          }
        }
      } catch (e) {
         console.error("Failed to generate hardship summary", e);
         newData.hardship_summary = "Applicant is currently seeking housing assistance. Please review details provided.";
      }
    } else {
      // 3. Now run the AI turn using the updated data!
      result = await aiTurn(userText, newData, currentLang, activeFields);
    }

    processingRef.current = false;

    if (!result?.message) {
      setError("Something went wrong.");
      return;
    }

    let activeLang = currentLang;
    if (result.language_detected && result.language_detected !== currentLang.name) {
      const matched = LANGUAGE_OPTIONS.find(l => l.name.toLowerCase() === result.language_detected.toLowerCase());
      if (matched) {
        activeLang = { code: matched.code, name: matched.name, flag: matched.flag };
        setLanguage(activeLang);
      }
    }

    addMessage("assistant", result.message);
    await speak(result.message, activeLang.code);

    // ONLY close the form if the fields are actually complete
    if (nowComplete) {
      setPhase("complete");
      setTimeout(() => onComplete(newData), 800);
    } else if (result.phase === "confirming") {
      setPhase("confirming");
    }

    return { newData, activeLang };
  }, [addMessage, aiTurn, speak, onComplete, extractFields, dynamicFields]);

  // ── Start the session ────────────────────────────────────────────────────
  const startSession = useCallback(async (chosenLang) => {
    const lang = chosenLang || language;
    setLanguage(lang);
    setPhase("collecting");
    conversationRef.current = [];
    
    // Auto-fill primary language so the AI never asks for it
    setCollectedData({ primary_language: lang.name });
    
    const newConfirmed = new Set();
    newConfirmed.add("primary_language");
    confirmedRef.current = newConfirmed;
    
    processingRef.current = false;

    const openingPrompts = {
      English:    "Hi there, I'm Phil, your housing assistance specialist. I'll help you complete your application through a quick conversation — no forms to fill out. First, could you tell me your full name?",
      Spanish:    "Hola, soy Phil, tu especialista en asistencia de vivienda. Te ayudaré a completar tu solicitud mediante una breve conversación, sin formularios. ¿Podrías decirme tu nombre completo?",
      French:     "Bonjour, je suis Phil, votre spécialiste en aide au logement. Je vais vous aider à compléter votre demande par une courte conversation, sans formulaires. Pourriez-vous me donner votre nom complet?",
      Chinese:    "您好，我是Phil，您的住房援助专员。我将通过简短的对话帮助您完成申请，无需填写表格。请问您的全名是什么？",
      Arabic:     "مرحباً، أنا Phil، أخصائي مساعدة الإسكان. سأساعدك في إكمال طلبك من خلال محادثة قصيرة دون أي نماذج. هل يمكنك إخباري باسمك الكامل؟",
      Portuguese: "Olá, sou Phil, seu especialista em assistência habitacional. Vou ajudá-lo a concluir sua solicitação por meio de uma conversa rápida, sem formulários. Poderia me dizer seu nome completo?",
      Hindi:      "नमस्ते, मैं Phil हूँ, आपका आवास सहायता विशेषज्ञ। मैं एक छोटी बातचीत के माध्यम से आपको आवेदन पूरा करने में मदद करूँगा। क्या आप मुझे अपना पूरा नाम बता सकते हैं?",
      Russian:    "Здравствуйте, я Фил, ваш специалист по жилищной помощи. Я помогу вам заполнить заявку через короткий разговор — без бланков. Скажите, пожалуйста, ваше полное имя?",
    };

    const greeting = openingPrompts[lang.name] || openingPrompts.English;
    addMessage("assistant", greeting);
    await speak(greeting, lang.code);
  }, [language, addMessage, speak]);

  // ── Handle a mic result ──────────────────────────────────────────────────
  const handleSpeechResult = useCallback(async (text) => {
    stopSpeaking();
    await processUserInput(text, collectedData, language);
  }, [processUserInput, collectedData, language, stopSpeaking]);

  // ── Handle typed input ───────────────────────────────────────────────────
  const handleTextInput = useCallback(async (text) => {
    stopSpeaking();
    await processUserInput(text, collectedData, language);
  }, [processUserInput, collectedData, language, stopSpeaking]);

  const reset = useCallback(() => {
    stopSpeaking();
    stopListening();
    setPhase("language");
    setMessages([]);
    setCollectedData({});
    setTranscript("");
    setError(null);
    conversationRef.current = [];
    confirmedRef.current = new Set();
    processingRef.current = false;
  }, [stopSpeaking, stopListening]);

  return {
    phase,
    language,
    messages,
    collectedData,
    isThinking,
    isSpeaking,
    isListening,
    transcript,
    error,
    startSession,
    startListening,
    stopListening,
    stopSpeaking,
    handleSpeechResult,
    handleTextInput,
    reset,
    speak,
  };
}