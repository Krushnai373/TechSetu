import requests
import json
import time
import os
import urllib3
urllib3.disable_warnings()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AQ.Ab8RN6I1uL1PXf0SL4FXfHWoCRnVe1A3u8BDdVAvIvGiKShwrA")

class BackendGeminiService:
    def __init__(self, api_key: str = GEMINI_API_KEY):
        self.api_key = api_key
        self.models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def translate_to_santhali(self, text: str, source_lang: str = "hindi", target_lang: str = "santhali"):
        prompt = f"""You are a certified linguist expert in Santhali (Santali) tribal language and Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ) in Jharkhand, India.
Translate the following classroom text from {source_lang} to {target_lang}.

Input Text: "{text}"

Respond STRICTLY in valid JSON format without markdown ticks:
{{
  "translation_olchiki": "Santhali translation in Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ)",
  "translation_devanagari": "Santhali translation in Devanagari script",
  "phonetic": "Roman English phonetic pronunciation guide",
  "english": "English meaning",
  "category": "classroom",
  "confidence": 0.99
}}"""

        for model in self.models:
            try:
                url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
                headers = {"Content-Type": "application/json", "x-goog-api-key": self.api_key}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 600
                    }
                }
                start_time = time.time()
                res = requests.post(url, headers=headers, json=payload, timeout=3.5, verify=False)
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    clean_json = raw_text.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_json)
                    elapsed = (time.time() - start_time) * 1000
                    return {
                        "source_text": text,
                        "target_lang": target_lang,
                        "translation_olchiki": parsed.get("translation_olchiki", ""),
                        "translation_devanagari": parsed.get("translation_devanagari", ""),
                        "phonetic": parsed.get("phonetic", ""),
                        "english": parsed.get("english", ""),
                        "category": parsed.get("category", "classroom"),
                        "latency_ms": round(elapsed, 2),
                        "confidence": parsed.get("confidence", 0.99),
                        "match_type": f"gemini_ai ({model})"
                    }
            except Exception:
                continue
        return None

backend_gemini = BackendGeminiService()
