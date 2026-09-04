// Gemini AI High-Accuracy Multilingual Translation & Classroom Context Engine
// Integrates Google Gemini with Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ), Ho, and Mundari synthesis

const DEFAULT_GEMINI_API_KEY = "AQ.Ab8RN6I1uL1PXf0SL4FXfHWoCRnVe1A3u8BDdVAvIvGiKShwrA";

export class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem("techsetu_gemini_api_key") || DEFAULT_GEMINI_API_KEY;
    this.models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  }

  setApiKey(key) {
    if (key && key.trim()) {
      this.apiKey = key.trim();
      localStorage.setItem("techsetu_gemini_api_key", this.apiKey);
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  // --- 1. Accurate Translation from Hindi / English to Santhali (Ol Chiki) ---
  async translateToSanthali(text, sourceLang = "Hindi", targetLang = "Santhali") {
    if (!text || !text.trim()) return null;

    const prompt = `You are a certified linguist expert in Santhali (Santali) tribal language and Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ) of Jharkhand, India.
Translate the following classroom text from ${sourceLang} to ${targetLang}.

Input Text: "${text}"

Respond STRICTLY in valid JSON format without markdown code blocks, using this exact schema:
{
  "olchiki": "Santhali translation strictly in authentic Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ)",
  "devanagari": "Santhali translation in Devanagari script for bilingual reading",
  "phonetic": "Accurate Roman/English phonetic pronunciation guide for children",
  "english": "English meaning",
  "explanation": "Brief 1-sentence pedagogical explanation for primary school children"
}`;

    for (const model of this.models) {
      try {
        const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.15,
              maxOutputTokens: 600
            }
          }),
          signal: AbortSignal.timeout(3500)
        });

        if (response.ok) {
          const data = await response.json();
          const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleanJson = rawContent
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

          const parsed = JSON.parse(cleanJson);
          if (parsed && (parsed.olchiki || parsed.devanagari)) {
            return {
              sourceText: text,
              olchiki: parsed.olchiki || "",
              devanagari: parsed.devanagari || "",
              phonetic: parsed.phonetic || "",
              english: parsed.english || "",
              displayScript: parsed.olchiki || parsed.devanagari || text,
              explanation: parsed.explanation || "",
              confidence: 0.99,
              engine: `gemini-ai (${model})`
            };
          }
        }
      } catch (e) {
        // Continue to fallback model or offline engine
      }
    }

    return null;
  }

  // --- 2. Contextual Doubt Resolution based on Previous Classroom History ---
  async answerStudentDoubt({ questionText, studentInfo, conversationHistory = [] }) {
    if (!questionText || !questionText.trim()) return null;

    const contextSummary = conversationHistory
      .slice(-8)
      .map((item) => `Teacher taught: "${item.hindiText || item.text}" (Santhali: ${item.santhaliScript || item.santhali || ""})`)
      .join("\n");

    const prompt = `You are an encouraging, friendly primary school teacher in Jharkhand, India who teaches in Santhali (using Ol Chiki script ᱚᱞ ᱪᱤᱠᱤ) and Hindi.

PREVIOUS CLASSROOM LESSON CONTEXT:
${contextSummary || "The teacher taught science, nature, plants, trees, photosynthesis, water, counting, and moral stories."}

STUDENT QUESTION / DOUBT:
Student: ${studentInfo?.name || "Student"} (Roll: ${studentInfo?.rollNo || "1"}, Class: ${studentInfo?.grade || "Class 3"})
Question: "${questionText}"

TASK:
1. Answer the student's question in a warm, child-friendly way, referencing the previous classroom context taught above.
2. Provide the answer in both Santhali (Ol Chiki script ᱚᱞ ᱪᱤᱠᱤ) and simple Hindi.

Respond STRICTLY in valid JSON format:
{
  "replyTribal": "Direct answer in Santhali Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ)",
  "replyDevanagari": "Answer in Santhali Devanagari",
  "replyHindi": "Answer in simple clear Hindi for the teacher",
  "phonetic": "Roman phonetic pronunciation of the Santhali answer",
  "conceptReferenced": "Which previous lesson topic was used"
}`;

    for (const model of this.models) {
      try {
        const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 800
            }
          }),
          signal: AbortSignal.timeout(4000)
        });

        if (response.ok) {
          const data = await response.json();
          const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleanJson = rawContent
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

          const parsed = JSON.parse(cleanJson);
          if (parsed && (parsed.replyTribal || parsed.replyDevanagari || parsed.replyHindi)) {
            return {
              replyTribal: parsed.replyTribal || parsed.replyDevanagari,
              replyDevanagari: parsed.replyDevanagari || "",
              replyHindi: parsed.replyHindi || "",
              phonetic: parsed.phonetic || "",
              conceptReferenced: parsed.conceptReferenced || "Previous Lesson",
              engine: `gemini-ai (${model})`
            };
          }
        }
      } catch (e) {
        // Fall through
      }
    }

    return null;
  }
}

export const geminiService = new GeminiService();
