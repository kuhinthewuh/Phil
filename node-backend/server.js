import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import Tesseract from 'tesseract.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({ dest: 'uploads/' });

// Initialize with a dummy key if env var is missing to prevent server crash on boot
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'DUMMY_KEY' });
const MODEL = "llama-3.1-8b-instant";

app.post('/api/chat', async (req, res) => {
  try {
    const { contents } = req.body;
    
    // We expect contents to be the prompt string
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: contents }],
      model: MODEL,
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    res.json({ text: responseText });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ocr', async (req, res) => {
  try {
    const { documentBase64, systemPrompt, mimeType } = req.body;
    if (!documentBase64) return res.status(400).json({ error: "No document provided" });

    const base64Clean = documentBase64.includes(',') ? documentBase64.split(',')[1] : documentBase64;
    const buffer = Buffer.from(base64Clean, 'base64');
    
    let text = "";
    let extractedSpots = [];
    let isPDF = mimeType === 'application/pdf' || buffer.toString('utf-8', 0, 4) === '%PDF';

    if (isPDF) {
      console.log("PDF upload detected. Running pdf-parse...");
      const data = await pdfParse(buffer);
      text = data.text;
      console.log("Extracted PDF text length:", text.length);
    } else {
      console.log("Running Tesseract OCR...");
      const result = await Tesseract.recognize(buffer, 'eng');
      text = result.data.text;
      const lines = result.data.lines;
      console.log("Extracted text length:", text.length);

      // Heuristic: Find blank spots (underlines, dots) and their preceding text
      let lastContext = "";
      
      if (lines) {
        lines.forEach(line => {
          let currentContext = [];
          line.words.forEach(word => {
            if (/[_]{2,}/.test(word.text) || /[.]{3,}/.test(word.text)) {
               const contextStr = currentContext.length > 0 ? currentContext.join(" ") : lastContext;
               extractedSpots.push({
                 context: contextStr.replace(/[^a-zA-Z0-9 ]/g, '').trim() || "Unknown Field",
                 bbox: word.bbox
               });
               currentContext = []; // Reset context for the next field on the same line
            } else {
               currentContext.push(word.text);
            }
          });
          if (line.text.trim()) {
            lastContext = line.text;
          }
        });
      }
      console.log(`Found ${extractedSpots.length} blank spots.`);
    }

    console.log("Mapping semantics via Groq...");
    let fullPrompt;
    if (isPDF) {
      fullPrompt = `${systemPrompt || "Analyze this document and extract its fields."}

Here is the raw text extracted from the PDF document:
"${text}"

Return ONLY a JSON object containing an array of objects. For each field, figure out a good 'key' (snake_case) and 'label' (human readable).
Schema:
{
  "fields": [
    {
      "key": "first_name",
      "label": "First Name"
    }
  ]
}`;
    } else {
      fullPrompt = `${systemPrompt || "Analyze this document and extract its fields."}

Here are the blank spots found in the document, with the text immediately preceding them (context) and their bounding box coordinates:
${JSON.stringify(extractedSpots, null, 2)}

Return ONLY a JSON object containing an array of objects. For each spot, figure out a good 'key' (snake_case) and 'label' (human readable) based on the context. Include the exact bbox provided.
Schema:
{
  "fields": [
    {
      "key": "first_name",
      "label": "First Name",
      "bbox": { "x0": 100, "y0": 200, "x1": 150, "y1": 220 }
    }
  ]
}`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: fullPrompt }],
      model: MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    res.json({ text: responseText, raw_text: text, spots: extractedSpots });

  } catch (error) {
    console.error("OCR/Groq Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { transcript, systemPrompt } = req.body;
    if (!transcript) return res.status(400).json({ error: "No transcript provided" });

    const fullPrompt = `${systemPrompt}\n\nHere is the applicant's narrative:\n\n"${transcript}"\n\nReturn ONLY a valid JSON object matching the requested schema.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: fullPrompt }],
      model: MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    res.json({ text: responseText });
  } catch (error) {
    console.error("Groq Generate Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Node backend running on port ${PORT}`);
});
