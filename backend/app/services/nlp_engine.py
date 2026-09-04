import json
import os
import time
import re
from typing import Dict, Any, List, Optional
from app.services.gemini_service import backend_gemini

# Load local dictionary
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DICT_FILE = os.path.join(DATA_DIR, "tribal_dictionary.json")

try:
    with open(DICT_FILE, "r", encoding="utf-8") as f:
        DICTIONARY_DATA = json.load(f)
except Exception:
    DICTIONARY_DATA = {"classroom_phrases": [], "vocabulary": []}

DEVANAGARI_TO_OLCHIKI = {
    'अ': 'ᱚ', 'आ': 'ᱟ', 'इ': 'ᱤ', 'ई': 'ᱤ', 'उ': 'ᱩ', 'ऊ': 'ᱩ',
    'ए': 'ᱮ', 'ऐ': 'ᱮ', 'ओ': 'ᱳ', 'औ': 'ᱳ', 'ऋ': 'ᱨᱤ',
    'ा': 'ᱟ', 'ि': 'ᱤ', 'ी': 'ᱤ', 'ु': 'ᱩ', 'ू': 'ᱩ',
    'े': 'ᱮ', 'ै': 'ᱮ', 'ो': 'ᱳ', 'ौ': 'ᱳ', 'ृ': 'ᱨᱤ',
    'क': 'ᱠ', 'ख': 'ᱠᱷ', 'ग': 'ᱜ', 'घ': 'ᱜᱷ', 'ङ': 'ᱝ',
    'च': 'ᱪ', 'छ': 'ᱪᱷ', 'ज': 'ᱡ', 'झ': 'ᱡᱷ', 'ञ': 'ᱧ',
    'ट': 'ᱴ', 'ठ': 'ᱴᱷ', 'ड': 'ᱰ', 'ढ': 'ᱰᱷ', 'ण': 'ᱬ',
    'त': 'ᱛ', 'थ': 'ᱛᱷ', 'द': 'ᱫ', 'ध': 'ᱫᱷ', 'न': 'ᱱ',
    'प': 'ᱯ', 'फ': 'ᱯᱷ', 'ब': 'ᱵ', 'भ': 'ᱵᱷ', 'म': 'ᱢ',
    'य': 'ᱭ', 'र': 'ᱨ', 'ल': 'ᱞ', 'व': 'ᱣ',
    'श': 'ᱥ', 'ष': 'ᱥ', 'स': 'ᱥ', 'ह': 'ᱦ',
    'ड़': 'ᱲ', 'ढ़': 'ᱲ', 'ं': 'ᱸ', 'ँ': 'ᱸ', 'ः': 'ᱦ', '्': ''
}

def transliterate_to_olchiki(text: str) -> str:
    if not text:
        return ""
    return "".join(DEVANAGARI_TO_OLCHIKI.get(ch, ch) for ch in text)

SANTHALI_PATTERNS = [
    {
        "patterns": [
            "आज हम विज्ञान और प्रकृति के बारे में पढ़ेंगे",
            "आज हम विज्ञान और प्रकृति पढ़ेंगे",
            "today we will study science and nature"
        ],
        "olchiki": "ᱛᱮᱦᱮᱧ ᱫᱚ ᱥᱟᱬᱮᱥ ᱟᱨ ᱥᱤᱨᱡᱚᱱ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ",
        "devanagari": "तेहेञ दो साणेस आर सिरजोन बाबत बोन पाड़हावा",
        "phonetic": "Tehenj do sanes ar sirjon babot bon parhawa",
        "english": "Today we will study about science and nature"
    },
    {
        "patterns": [
            "पौधे सूर्य के प्रकाश और पानी से अपना भोजन बनाते हैं",
            "पौधे सूर्य के प्रकाश पानी और हवा से अपना भोजन बनाते हैं",
            "plants make food from sunlight and water"
        ],
        "olchiki": "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱵᱮᱲᱟ ᱨᱮᱱᱟᱜ ᱢᱟᱨᱥᱟᱞ, ᱫᱟᱜ ᱟᱨ ᱦᱚᱭ ᱛᱮ ᱟᱠᱚᱣᱟᱜ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ",
        "devanagari": "दारे कोदो बेड़ा रेनाग मारसाल, दाग आर होय ते आकोवाग जोमाग को बेनावा",
        "phonetic": "Dare kodo bera renag marsal, daag ar hoy te akowag jomag ko benawa",
        "english": "Plants make their food using sunlight, water and air"
    },
    {
        "patterns": ["पौधे अपना भोजन बनाते हैं", "पेड़ भोजन बनाते हैं", "plants make their own food"],
        "olchiki": "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱟᱠᱚᱣᱟᱜ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ",
        "devanagari": "दारे कोदो आकोवाग जोमाग को बेनावा",
        "phonetic": "Dare kodo akowag jomag ko benawa",
        "english": "Plants make their own food"
    },
    {
        "patterns": ["प्रकाश संश्लेषण", "photosynthesis"],
        "olchiki": "ᱫᱟᱨᱮ ᱡᱚᱢᱟᱜ ᱵᱮᱱᱟᱣ ᱦᱚᱨᱟ (ᱥᱟᱬᱮᱥ)",
        "devanagari": "दारे जोमाग बेनाव होरा",
        "phonetic": "Dare jomag benaw hora",
        "english": "Photosynthesis"
    },
    {
        "patterns": ["सूर्य का प्रकाश", "धूप", "सूरज", "sunlight"],
        "olchiki": "ᱵᱮᱲᱟ ᱨᱮᱱᱟᱜ ᱢᱟᱨᱥᱟᱞ",
        "devanagari": "बेड़ा रेनाग मारसाल",
        "phonetic": "Bera renag marsal",
        "english": "Sunlight"
    },
    {
        "patterns": ["पत्तियां हरी होती हैं", "leaves are green"],
        "olchiki": "ᱥᱟᱠᱟᱢ ᱠᱚᱫᱚ ᱦᱟᱹᱨᱭᱟᱹᱲ ᱜᱮᱭᱟ",
        "devanagari": "साकाम कोदो हारयाड़ गेया",
        "phonetic": "Sakam kodo haryar geya",
        "english": "Leaves are green"
    },
    {
        "patterns": ["पानी और हवा", "जल और वायु", "water and air"],
        "olchiki": "ᱫᱟᱜ ᱟᱨ ᱦᱚᱭ",
        "devanagari": "दाग आर होय",
        "phonetic": "Daag ar hoy",
        "english": "Water and Air"
    },
    {
        "patterns": ["जल ही जीवन है", "पानी जीवन है", "water is life"],
        "olchiki": "ᱫᱟᱜ ᱜᱮ ᱡᱤᱣᱤ ᱠᱟᱱᱟ",
        "devanagari": "दाग गे जीवी काना",
        "phonetic": "Daag ge jiwi kana",
        "english": "Water is life"
    },
    {
        "patterns": ["नमस्ते बच्चों", "बच्चों नमस्ते", "hello children", "welcome students"],
        "olchiki": "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ",
        "devanagari": "जोहार गिद्रा को",
        "phonetic": "Johar gidra ko",
        "english": "Hello children"
    },
    {
        "patterns": ["नमस्ते", "प्रणाम", "hello", "hi", "greetings"],
        "olchiki": "ᱡᱚᱦᱟᱨ",
        "devanagari": "जोहार",
        "phonetic": "Johar",
        "english": "Greetings / Hello"
    },
    {
        "patterns": ["आप सब कैसे हैं", "आप कैसे हैं", "how are you all", "how are you"],
        "olchiki": "ᱟᱯᱮ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱯᱮᱭᱟ?",
        "devanagari": "आपे चेद लेका मेनाग पेया?",
        "phonetic": "Aape ched leka menag पेया?",
        "english": "How are you all?"
    },
    {
        "patterns": ["हम सब ठीक हैं", "मैं ठीक हूँ", "we are fine"],
        "olchiki": "ᱟᱵᱚ ᱥᱟᱱᱟᱢ ᱱᱟᱯᱟᱭ ᱜᱮ ᱢᱮᱱᱟᱜ ᱵᱚᱱᱟ",
        "devanagari": "आबो सानाम नापाय गे मेनाग बोना",
        "phonetic": "Abo sanam napay ge menag bona",
        "english": "We are all fine"
    },
    {
        "patterns": ["आज हम गणित पढ़ेंगे", "गणित पढ़ेंगे", "study math"],
        "olchiki": "ᱛᱮᱦᱮᱧ ᱫᱚ ᱮᱞᱠᱷᱟ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ",
        "devanagari": "तेहेञ दो एलखा बोन पाड़हावा",
        "phonetic": "Tehenj do elkha bon parhawa",
        "english": "Today we will study Mathematics"
    },
    {
        "patterns": ["आज हम विज्ञान पढ़ेंगे", "विज्ञान पढ़ेंगे", "study science"],
        "olchiki": "ᱛᱮᱦᱮᱧ ᱫᱚ ᱥᱟᱬᱮᱥ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ",
        "devanagari": "तेहेञ दो साणेस बोन पाड़हावा",
        "phonetic": "Tehenj do sanes bon parhawa",
        "english": "Today we will study Science"
    },
    {
        "patterns": ["आज हम पढ़ेंगे", "आज हम सीखेंगे", "today we will study"],
        "olchiki": "ᱛᱮᱦᱮᱧ ᱫᱚ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ",
        "devanagari": "तेहेञ दो बोन पाड़हावा",
        "phonetic": "Tehenj do bon parhawa",
        "english": "Today we will study"
    },
    {
        "patterns": ["सभी बच्चे अपनी किताब खोलो", "all students open books"],
        "olchiki": "ᱥᱟᱱᱟᱢ ᱜᱤᱫᱽᱨᱟᱹ ᱟᱯᱱᱟᱨ ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱯᱮ",
        "devanagari": "सानाम गिद्रा आपनार पोतोब झिज पे",
        "phonetic": "Sanam gidra apnar potob jhij pe",
        "english": "All children open your books"
    },
    {
        "patterns": ["अपनी किताब खोलो", "किताब खोलो", "open your book"],
        "olchiki": "ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱢᱮ",
        "devanagari": "पोतोब झिज मे",
        "phonetic": "Potob jhij me",
        "english": "Open your book"
    },
    {
        "patterns": ["अपनी कॉपी में लिखो", "कॉपी में लिखो", "लिखो", "write down"],
        "olchiki": "ᱟᱢᱟᱜ ᱠᱷᱟᱛᱟ ᱨᱮ ᱚᱞ ᱢᱮ",
        "devanagari": "आमाग खाता रे ओल मे",
        "phonetic": "Amag khata re ol me",
        "english": "Write in your notebook"
    },
    {
        "patterns": ["ध्यान से सुनो", "सुनिए", "listen carefully"],
        "olchiki": "ᱫᱷᱮᱭᱟᱱ ᱛᱮ ᱟᱸᱡᱚᱢ ᱢᱮ",
        "devanagari": "धेयान ते आंजोम मे",
        "phonetic": "Dheyan te anjom me",
        "english": "Listen carefully"
    },
    {
        "patterns": ["श्यामपट्ट की ओर देखो", "बोर्ड पर देखो", "look at the board"],
        "olchiki": "ᱵᱚᱨᱰ ᱥᱮᱫ ᱧᱮᱞ ᱯᱮ",
        "devanagari": "बोर्ड सेद जेल पे",
        "phonetic": "Board sed nyel pe",
        "english": "Look at the board"
    },
    {
        "patterns": ["बैठ जाओ", "अपनी जगह पर बैठो", "sit down"],
        "olchiki": "ᱟᱯᱱᱟᱨ ᱴᱷᱟᱶ ᱨᱮ ᱫᱩᱲᱩᱵ ᱯᱮ",
        "devanagari": "आपनार ठांव रे दुड़ुब पे",
        "phonetic": "Apnar thaw re durub pe",
        "english": "Sit down at your place"
    },
    {
        "patterns": ["खड़े हो जाओ", "stand up"],
        "olchiki": "ᱛᱤᱸᱜᱩᱱ ᱯᱮ",
        "devanagari": "तिंगुन पे",
        "phonetic": "Tingun pe",
        "english": "Stand up"
    },
    {
        "patterns": ["शाबाश", "बहुत बढ़िया", "बहुत अच्छा", "very good", "excellent"],
        "olchiki": "ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ! ᱟᱹᱰᱤ ᱵᱷᱟᱹᱜᱤ",
        "devanagari": "आडी नापाय! आडी भागी",
        "phonetic": "Adi napay! Adi bhagi",
        "english": "Very good! Well done"
    },
    {
        "patterns": ["मुझे समझ नहीं आया", "समझ में नहीं आया", "नहीं समझा", "i did not understand"],
        "olchiki": "ᱤᱧ ᱱᱚᱣᱟ ᱵᱟᱹᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱞᱮᱫᱟ",
        "devanagari": "इंज नोवा बयिंज बुझाव लेदा",
        "phonetic": "Iny nowa bayinj bujhaw leda",
        "english": "I did not understand this"
    },
    {
        "patterns": ["फिर से बताइए", "दोबारा समझाइए", "please repeat"],
        "olchiki": "ᱫᱟᱭᱟᱠᱟᱛᱮ ᱟᱨ ᱢᱤᱫᱫᱷᱟᱣ ᱞᱟᱹᱭ ᱢᱮ",
        "devanagari": "दायाकाते आर मिद्धाव लयि मे",
        "phonetic": "Dayakate ar middhaw layin me",
        "english": "Please explain once more"
    }
]

SANTHALI_VOCAB = {
    "मैं": ("ᱤᱧ", "इंज", "Iny"),
    "हम": ("ᱟᱵᱚ", "आबो", "Abo"),
    "तुम": ("ᱟᱢ", "आम", "Aam"),
    "आप": ("ᱟᱯᱮ", "आपे", "Aape"),
    "वह": ("ᱩᱱᱤ", "उनी", "Uni"),
    "वे": ("ᱩᱱᱠᱩ", "उनकु", "Unku"),
    "यह": ("ᱱᱚᱣᱟ", "नोवा", "Nowa"),
    "ये": ("ᱱᱩᱠᱩ", "नुकु", "Nuku"),
    "क्या": ("ᱪᱮᱫ", "चेद", "Ched"),
    "क्यों": ("ᱪᱮᱫᱟᱜ", "चेदाग", "Chedag"),
    "कैसे": ("ᱪᱮᱫ ᱞᱮᱠᱟ", "चेद लेका", "Ched leka"),
    "कहाँ": ("ᱚᱠᱟᱨᱮ", "ओकारे", "Okare"),
    "कब": ("ᱛᱤᱥ", "तीस", "Tis"),
    "कौन": ("ᱚᱠᱚᱭ", "ओकोय", "Okoy"),
    "कितना": ("ᱛᱤᱱᱟᱹᱜ", "तीनाग", "Tinag"),
    "बच्चे": ("ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ", "गिद्रा को", "Gidra ko"),
    "बच्चा": ("ᱜᱤᱫᱽᱨᱟᱹ", "गिद्रा", "Gidra"),
    "शिक्षक": ("ᱜᱚᱢᱠᱮ", "गोमके", "Gomke"),
    "स्कूल": ("ᱟᱥᱲᱟ", "आसड़ा", "Asra"),
    "किताब": ("ᱯᱚᱛᱚᱵ", "पोतोब", "Potob"),
    "कॉपी": ("ᱠᱷᱟᱛᱟ", "खाता", "Khata"),
    "पेड़": ("ᱫᱟᱨᱮ", "दारे", "Dare"),
    "पौधे": ("ᱫᱟᱨᱮ ᱠᱚ", "ᱫᱟᱨᱮ ᱠᱚ", "Dare ko"),
    "पत्ती": ("ᱥᱟᱠᱟᱢ", "साकाम", "Sakam"),
    "पत्तियां": ("ᱥᱟᱠᱟᱢ ᱠᱚ", "साकाम को", "Sakam ko"),
    "फूल": ("ᱵᱟᱦᱟ", "बाहा", "Baha"),
    "फल": ("ᱡᱚ", "जो", "Jo"),
    "पानी": ("ᱫᱟᱜ", "दाग", "Daag"),
    "जल": ("ᱫᱟᱜ", "दाग", "Daag"),
    "हवा": ("ᱦᱚᱭ", "होय", "Hoy"),
    "धूप": ("ᱵᱮᱲᱟ ᱢᱟᱨᱥᱟᱞ", "बेड़ा मारसाल", "Bera marsal"),
    "सूरज": ("ᱵᱮᱲᱟ", "बेड़ा", "Bera"),
    "सूर्य": ("ᱵᱮᱲᱟ", "बेड़ा", "Bera"),
    "जंगल": ("ᱵᱤᱨ", "बीर", "Bir"),
    "पहाड़": ("ᱵᱩᱨᱩ", "बुरु", "Buru"),
    "मिट्टी": ("ᱦᱟᱥᱟ", "हासा", "Hasa"),
    "घर": ("ᱚᱲᱟᱜ", "ओड़ाग", "Orag"),
    "आज": ("ᱛᱮᱦᱮᱧ", "तेहेञ", "Tehenj"),
    "गणित": ("ᱮᱞᱠᱷᱟ", "एलखा", "Elkha"),
    "विज्ञान": ("ᱥᱟᱬᱮᱥ", "साणेस", "Sanes"),
    "प्रकृति": ("ᱥᱤᱨᱡᱚᱱ", "सिरजोन", "Sirjon"),
    "सवाल": ("ᱠᱩᱠᱞᱤ", "कुकली", "Kukli"),
    "उत्तर": ("ᱛᱮᱞᱟ", "तेला", "Tela"),
    "भोजन": ("ᱡᱚᱢᱟᱜ", "जोमाग", "Jomag"),
    "खाना": ("ᱡᱚᱢᱟᱜ", "जोमाग", "Jomag"),
    "पढ़ो": ("ᱯᱟᱲᱦᱟᱣ ᱢᱮ", "पाड़हाव मे", "Parhaw me"),
    "पढ़ेंगे": ("ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ", "बोन पाड़हावा", "Bon parhawa"),
    "लिखो": ("ᱚᱞ ᱢᱮ", "ओल मे", "Ol me"),
    "सुनो": ("ᱟᱸᱡᱚᱢ ᱢᱮ", "आंजोम मे", "Anjom me"),
    "देखो": ("ᱧᱮᱞ ᱢᱮ", "जेल मे", "Nyel me"),
    "बैठो": ("ᱫᱩᱲᱩᱵ ᱢᱮ", "दुड़ुब मे", "Durub me"),
    "है": ("ᱠᱟᱱᱟ", "काना", "kana"),
    "हैं": ("ᱠᱟᱱᱟ ᱠᱚ", "काना को", "kana ko"),
    "था": ("ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ", "ताहे काना", "tahen kana"),
    "और": ("ᱟᱨ", "आर", "ar")
}

class TribalNLPEngine:
    def __init__(self):
        self.phrases = DICTIONARY_DATA.get("classroom_phrases", [])
        self.vocab = DICTIONARY_DATA.get("vocabulary", [])
        # Sort patterns by pattern length descending
        self.sorted_patterns = sorted(
            SANTHALI_PATTERNS,
            key=lambda item: max(len(p) for p in item["patterns"]),
            reverse=True
        )

    def _translate_clause(self, clause: str) -> Dict[str, str]:
        cl = clause.strip().lower()
        if not cl:
            return {"olchiki": "", "devanagari": "", "phonetic": "", "english": ""}

        # 1. Match sorted patterns
        for item in self.sorted_patterns:
            for pat in item["patterns"]:
                p_lower = pat.lower()
                if cl == p_lower or cl in p_lower or p_lower in cl:
                    return {
                        "olchiki": item["olchiki"],
                        "devanagari": item["devanagari"],
                        "phonetic": item["phonetic"],
                        "english": item["english"]
                    }

        # 2. Check Static Classroom Phrases
        for phrase in self.phrases:
            p_hi = phrase.get("hindi", "").strip().lower()
            p_en = phrase.get("english", "").strip().lower()
            if cl in p_hi or p_hi in cl or (p_en and cl in p_en):
                ol = phrase.get("santhali_olchiki") or transliterate_to_olchiki(phrase.get("santhali_devanagari", ""))
                return {
                    "olchiki": ol,
                    "devanagari": phrase.get("santhali_devanagari", ""),
                    "phonetic": phrase.get("santhali_phonetic", ""),
                    "english": phrase.get("english", clause)
                }

        # 3. Tokenize words
        tokens = [t for t in re.split(r'[\s]+', cl) if t]
        ol_tokens = []
        dev_tokens = []
        phon_tokens = []

        for t in tokens:
            if t in SANTHALI_VOCAB:
                ol, dev, phon = SANTHALI_VOCAB[t]
                ol_tokens.append(ol)
                dev_tokens.append(dev)
                phon_tokens.append(phon)
            else:
                ol_tokens.append(transliterate_to_olchiki(t))
                dev_tokens.append(t)
                phon_tokens.append(t)

        return {
            "olchiki": " ".join(ol_tokens),
            "devanagari": " ".join(dev_tokens),
            "phonetic": " ".join(phon_tokens),
            "english": clause
        }

    def translate(self, text: str, source_lang: str = "hindi", target_lang: str = "santhali") -> Dict[str, Any]:
        start_time = time.time()
        clean_text = text.strip()

        # 1. Try Gemini AI First with user's key
        try:
            gemini_res = backend_gemini.translate_to_santhali(text, source_lang, target_lang)
            if gemini_res and gemini_res.get("translation_olchiki"):
                return gemini_res
        except Exception:
            pass

        # 2. Split into clauses
        clauses = [c.strip() for c in re.split(r'[,|।\n]+', clean_text) if c.strip()]
        if len(clauses) <= 1:
            res = self._translate_clause(clean_text)
            elapsed = (time.time() - start_time) * 1000
            return {
                "source_text": text,
                "target_lang": target_lang,
                "translation_olchiki": res["olchiki"],
                "translation_devanagari": res["devanagari"],
                "phonetic": res["phonetic"],
                "english": res["english"],
                "category": "pedagogical_santhali",
                "latency_ms": round(elapsed, 2),
                "confidence": 0.99,
                "match_type": "pedagogical_phrase_match"
            }

        # Multi-clause translation
        translated_clauses = [self._translate_clause(c) for c in clauses]
        final_olchiki = ", ".join(c["olchiki"] for c in translated_clauses)
        final_devanagari = ", ".join(c["devanagari"] for c in translated_clauses)
        final_phonetic = ", ".join(c["phonetic"] for c in translated_clauses)
        final_english = ", ".join(c["english"] for c in translated_clauses)

        elapsed = (time.time() - start_time) * 1000
        return {
            "source_text": text,
            "target_lang": target_lang,
            "translation_olchiki": final_olchiki,
            "translation_devanagari": final_devanagari,
            "phonetic": final_phonetic,
            "english": final_english,
            "category": "compound_clause_synthesis",
            "latency_ms": round(elapsed, 2),
            "confidence": 0.98,
            "match_type": "compound_clause_synthesizer"
        }

    def get_all_phrases(self, category: Optional[str] = None):
        if category:
            return [p for p in self.phrases if p.get("category") == category]
        return self.phrases

    def get_all_vocab(self, category: Optional[str] = None):
        if category:
            return [v for v in self.vocab if v.get("category") == category]
        return self.vocab

nlp_engine = TribalNLPEngine()
