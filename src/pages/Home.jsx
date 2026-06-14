import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Lock, Camera, ChevronRight, FileText, LayoutDashboard, Loader2, Maximize2, Mic, Settings, X, Upload } from "lucide-react";
import StoryInput, { DEFAULT_TRANSCRIPT } from "@/components/formflow/StoryInput";
import GovernmentForm from "@/components/formflow/GovernmentForm";
import EmptyFormState from "@/components/formflow/EmptyFormState";
import ErrorMessage from "@/components/formflow/ErrorMessage";
import ProcessingOverlay from "@/components/formflow/ProcessingOverlay";
import VoiceAgentModal from "@/components/voice/VoiceAgentModal";
import DocumentScanner from "@/components/formflow/DocumentScanner";
import DynamicDocumentView from "@/components/formflow/DynamicDocumentView";

const SYSTEM_PROMPT = `You are a senior government legal intake specialist and data extraction engine.

Your job is to convert messy, emotional, unstructured human narratives into precise structured JSON used for housing assistance applications.

Rules:
- Extract only factual information implied or explicitly stated.
- If unknown, return "Unknown".
- Never hallucinate details.
- Output ONLY valid JSON (no markdown, no commentary).

Return this schema exactly:
{
  "first_name": "",
  "last_name": "",
  "monthly_income": number or null,
  "housing_status": "",
  "dependents": number or 0,
  "primary_language": "",
  "phone_number": "",
  "hardship_summary": ""
}

The hardship_summary must be 2 sentences maximum, empathetic but neutral in tone.`;

export default function Home() {
  const [transcript, setTranscript] = useState(DEFAULT_TRANSCRIPT);
  const [formData, setFormData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const [pageLang, setPageLang] = useState("English");

  const TRANSLATIONS = {
    English: { 
      title: "Dignity Through Structure", sub: "Turning lived experience into completed applications in seconds", story: "Story Input", scan: "Scan Document",
      story_header: "Narrative Input", story_title: "Share Your Story", story_desc: "Paste or type a personal narrative. Our AI will extract the relevant information and structure it into a complete housing assistance application.",
      scan_header: "Document Scan", scan_title: "Upload Official Document", scan_desc: "Upload an image of a form. Our AI will scan it, extract the required fields, and generate an editable digital interface."
    },
    Spanish: { 
      title: "Dignidad a través de la Estructura", sub: "Convirtiendo la experiencia vivida en solicitudes completadas en segundos", story: "Entrada de Historia", scan: "Escanear Documento",
      story_header: "Entrada Narrativa", story_title: "Comparte tu Historia", story_desc: "Pega o escribe una narrativa personal. Nuestra IA extraerá la información relevante y la estructurará en una solicitud completa de asistencia de vivienda.",
      scan_header: "Escaneo de Documento", scan_title: "Subir Documento Oficial", scan_desc: "Sube una imagen de un formulario. Nuestra IA la escaneará, extraerá los campos requeridos y generará una interfaz digital editable."
    },
    French: { 
      title: "La Dignité par la Structure", sub: "Transformer l'expérience vécue en demandes complétées en quelques secondes", story: "Entrée d'Histoire", scan: "Scanner le Document",
      story_header: "Entrée Narrative", story_title: "Partagez votre Histoire", story_desc: "Collez ou tapez un récit personnel. Notre IA extraira les informations pertinentes et les structurera en une demande complète d'aide au logement.",
      scan_header: "Scan de Document", scan_title: "Télécharger un Document Officiel", scan_desc: "Téléchargez une image d'un formulaire. Notre IA va la scanner, extraire les champs requis et générer une interface numérique modifiable."
    },
    Chinese: { 
      title: "结构带来的尊严", sub: "在几秒钟内将生活经历转化为完整的申请", story: "故事输入", scan: "扫描文件",
      story_header: "叙述输入", story_title: "分享你的故事", story_desc: "粘贴或输入个人叙述。我们的AI将提取相关信息并将其结构化为完整的住房援助申请。",
      scan_header: "文件扫描", scan_title: "上传官方文件", scan_desc: "上传表格的图像。我们的AI将扫描它，提取所需字段，并生成可编辑的数字界面。"
    },
    Arabic: { 
      title: "الكرامة من خلال الهيكلة", sub: "تحويل التجربة الحياتية إلى طلبات مكتملة في ثوانٍ", story: "إدخال القصة", scan: "مسح المستند",
      story_header: "الإدخال السردي", story_title: "شارك قصتك", story_desc: "انسخ أو اكتب سردًا شخصيًا. سيقوم الذكاء الاصطناعي لدينا باستخراج المعلومات ذات الصلة وهيكلتها في طلب مساعدة سكنية كامل.",
      scan_header: "مسح المستند", scan_title: "تحميل مستند رسمي", scan_desc: "قم بتحميل صورة لنموذج. سيقوم الذكاء الاصطناعي لدينا بمسحها، واستخراج الحقول المطلوبة، وإنشاء واجهة رقمية قابلة للتحرير."
    },
    Portuguese: { 
      title: "Dignidade Através da Estrutura", sub: "Transformando a experiência vivida em inscrições concluídas em segundos", story: "Entrada de História", scan: "Escanear Documento",
      story_header: "Entrada Narrativa", story_title: "Compartilhe sua História", story_desc: "Cole ou digite uma narrativa pessoal. Nossa IA extrairá as informações relevantes e as estruturará em uma inscrição completa de assistência habitacional.",
      scan_header: "Escaneamento de Documento", scan_title: "Fazer Upload de Documento Oficial", scan_desc: "Faça upload de uma imagem de um formulário. Nossa IA a escaneará, extrairá os campos obrigatórios e gerará uma interface digital editável."
    },
    Hindi: { 
      title: "संरचना के माध्यम से गरिमा", sub: "जीवन के अनुभव को सेकंडों में पूर्ण आवेदनों में बदलना", story: "कहानी इनपुट", scan: "दस्तावेज़ स्कैन करें",
      story_header: "कथा इनपुट", story_title: "अपनी कहानी साझा करें", story_desc: "व्यक्तिगत कथा पेस्ट करें या टाइप करें। हमारा AI प्रासंगिक जानकारी निकालेगा और इसे एक पूर्ण आवास सहायता आवेदन में संचरित करेगा।",
      scan_header: "दस्तावेज़ स्कैन", scan_title: "आधिकारिक दस्तावेज़ अपलोड करें", scan_desc: "किसी फ़ॉर्म की छवि अपलोड करें। हमारा AI इसे स्कैन करेगा, आवश्यक फ़ील्ड निकालेगा, और एक संपादन योग्य डिजिटल इंटरफ़ेस उत्पन्न करेगा।"
    },
    Russian: { 
      title: "Достоинство через структуру", sub: "Превращение жизненного опыта в заполненные заявки за секунды", story: "Ввод истории", scan: "Сканировать документ",
      story_header: "Повествовательный ввод", story_title: "Поделитесь своей историей", story_desc: "Вставьте или введите личное повествование. Наш ИИ извлечет соответствующую информацию и структурирует ее в полную заявку на жилищную помощь.",
      scan_header: "Сканирование документа", scan_title: "Загрузить официальный документ", scan_desc: "Загрузите изображение формы. Наш ИИ отсканирует его, извлечет необходимые поля и сгенерирует редактируемый цифровой интерфейс."
    }
  };
  const t = TRANSLATIONS[pageLang] || TRANSLATIONS.English;

  // New OCR State
  const [scannedDocument, setScannedDocument] = useState(null);
  const [scannedMimeType, setScannedMimeType] = useState(null);
  const [dynamicFields, setDynamicFields] = useState(null);
  const [inputMode, setInputMode] = useState("narrative"); // "narrative" | "scan"

  const handleProcess = async () => {
    if (!transcript.trim()) return;

    console.log("=== Frontend: Processing Application ===");
    console.log("Transcript length:", transcript.length);

    setIsProcessing(true);
    setError(null);
    setFormData(null);

    // Minimum visual processing time for dramatic effect
    const minDelay = new Promise((resolve) => setTimeout(resolve, 6000));

    console.log("Sending payload to /api/generate...");

    const apiCall = fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: transcript,
        systemPrompt: SYSTEM_PROMPT,
      })
    })
      .then(async (res) => {
        console.log("Received response from /api/generate, status:", res.status);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Backend error: ${errText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (!data.text) throw new Error("No text returned from backend");

        console.log("Raw Gemini Text Output:", data.text);

        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const parsed = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed JSON payload:", parsed);
        return parsed;
      })
      .catch((err) => {
        console.error("=== Frontend: Error in AI pipeline ===", err);
        return null;
      });

    const [result] = await Promise.all([apiCall, minDelay]);

    if (result && typeof result === "object" && result.first_name) {
      setFormData(result);
    } else {
      setError("We couldn't fully parse this narrative. Please try again or refine the transcript.");
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    setFormData(null);
    setError(null);
    setTranscript(DEFAULT_TRANSCRIPT);
    setScannedDocument(null);
    setScannedMimeType(null);
    setDynamicFields(null);
  };

  const handleDocumentScanned = async (base64Data, mimeType, fileName) => {
    setIsProcessing(true);
    setError(null);
    setScannedDocument(base64Data);
    setScannedMimeType(mimeType);
    setFormData(null);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const apiCall = fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentBase64: base64Data,
          mimeType: mimeType,
          systemPrompt: "Analyze this document. You must ONLY extract and return the following fields: Full Name, Email, Phone, Date of Birth, Gender, Current Street Address, and City, State, Zip. Do NOT extract any other fields under any circumstances. Return a JSON array of objects, where each object has a 'key' (snake_case identifier) and a 'label' (human readable name of the field). Return the array nested inside a root object like so: { \"fields\": [{\"key\": \"full_name\", \"label\": \"Full Name\"}, ...] }."
        })
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then((data) => {
          const jsonMatch = data.text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("No JSON found");
          return JSON.parse(jsonMatch[0]);
        });

      const [res] = await Promise.all([apiCall, minDelay]);

      const fields = res.fields || res; // depending on how groq formats it
      if (Array.isArray(fields) && fields.length > 0) {
        setDynamicFields(fields);
        setVoiceAgentOpen(true);
      } else {
        setError("Could not detect any form fields in the document.");
      }
    } catch (err) {
      console.error("OCR Pipeline Error:", err);
      setError("Failed to process the document. Please ensure it's a valid image or PDF.");
    }

    setIsProcessing(false);
  };

  // Voice agent hands off collected data → run through existing process flow
  const handleVoiceComplete = async (voiceData) => {
    setError(null);
    setFormData(null);
    setIsProcessing(true);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 6000));

    const narrative = Object.entries(voiceData)
      .filter(([, v]) => v && v !== "Unknown")
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join(". ");

    let promptToUse = SYSTEM_PROMPT;
    let expectedKeys = ["first_name", "last_name", "monthly_income", "housing_status", "dependents", "primary_language", "phone_number", "hardship_summary"];

    if (dynamicFields && dynamicFields.length > 0) {
      expectedKeys = dynamicFields.map(f => f.key);
      promptToUse = `You are a data extraction engine.
Convert the provided narrative into precise structured JSON matching the following schema.
IMPORTANT: TRANSLATE ALL EXTRACTED VALUES INTO ENGLISH, regardless of the input language.

Return this schema exactly:
{
${dynamicFields.map(f => `  "${f.key}": ""`).join(",\n")}
}`;
    } else {
      promptToUse = SYSTEM_PROMPT + "\n\nIMPORTANT: TRANSLATE ALL EXTRACTED VALUES INTO ENGLISH, regardless of the input language.";
    }

    const aiCall = fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: narrative,
        systemPrompt: promptToUse
      })
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        return JSON.parse(jsonMatch[0]);
      })
      .catch(() => null);

    const [result] = await Promise.all([aiCall, minDelay]);

    if (result && typeof result === "object" && Object.keys(result).some(k => expectedKeys.includes(k))) {
      setFormData(result);
    } else {
      // Graceful fallback: use voice data directly based on expectedKeys
      const fallbackData = {};
      expectedKeys.forEach(k => {
        fallbackData[k] = voiceData[k] || "Unknown";
      });
      setFormData(fallbackData);
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && <ProcessingOverlay isVisible={isProcessing} mode={inputMode} />}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xl font-display font-bold text-foreground tracking-tight">
                Phil.
              </span>
            </div>
            <select 
              value={pageLang}
              onChange={(e) => setPageLang(e.target.value)}
              className="ml-4 bg-background border border-border text-foreground text-xs rounded px-2 py-1 outline-none"
            >
              {Object.keys(TRANSLATIONS).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em]">
            <span className="hidden sm:flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encrypted
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Zap className="w-3 h-3" /> HUD Compliant
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Hero line */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-lg mx-auto">
            {t.sub}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full min-h-[600px]">
          {/* Left Panel — Input */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit mb-6">
              <button
                onClick={() => setInputMode("narrative")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${inputMode === "narrative" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t.story}
              </button>
              <button
                onClick={() => setInputMode("scan")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${inputMode === "scan" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t.scan}
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {inputMode === "narrative" ? (
                <StoryInput
                  t={t}
                  transcript={transcript}
                  setTranscript={setTranscript}
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                  onVoiceClick={() => {
                    setDynamicFields(null);
                    setVoiceAgentOpen(true);
                  }}
                />
              ) : (
                <DocumentScanner
                  t={t}
                  onFileScanned={handleDocumentScanned}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>

          {/* Right Panel — Output */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {error ? (
                <ErrorMessage key="error" message={error} onRetry={handleReset} />
              ) : dynamicFields ? (
                <DynamicDocumentView
                  key="dynamic-form"
                  base64Image={scannedDocument}
                  mimeType={scannedMimeType}
                  fields={dynamicFields}
                  collectedData={formData || {}}
                  onFieldChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
                  signature={formData?.signature}
                />
              ) : formData ? (
                <GovernmentForm key="form" data={formData} onReset={handleReset} onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))} />
              ) : (
                <EmptyFormState key="empty" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Voice Agent */}
      <VoiceAgentModal
        isOpen={voiceAgentOpen}
        onClose={() => setVoiceAgentOpen(false)}
        onComplete={handleVoiceComplete}
        onDataUpdate={(liveData) => setFormData(liveData)}
        dynamicFields={dynamicFields}
      />

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[10px] text-muted-foreground/50">
          <span>© 2025 Phil. — AI-Assisted Government Intake Platform</span>
          <span>Demo System • Not for official use</span>
        </div>
      </footer>
    </div>
  );
}