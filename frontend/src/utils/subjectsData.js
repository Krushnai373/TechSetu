// Multi-Subject Curriculum and Lecture Notes Suite
// Supports Science, Mathematics, Environmental Studies (EVS), Social Studies, and Language

export const GRADE_SUBJECTS_CONFIG = {
  "Class 1": [
    {
      id: "c1_lang",
      name_hi: "संथाली भाषा एवं वर्णमाला",
      name_en: "Santhali Language & Ol Chiki",
      name_tribal: "ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱚᱞ ᱪᱤᱠᱤ",
      icon: "📖",
      color: "from-rose-600 to-red-600",
      timeDefault: "09:00 AM - 09:45 AM",
      desc: "ᱚᱞ ᱪᱤᱠᱤ ᱞᱤᱯᱤ ᱟᱨ ᱵᱩᱱᱤᱭᱟᱹᱫᱤ ᱟᱹᱲᱟᱹ (Ol Chiki Script & Basic Vocabulary)"
    },
    {
      id: "c1_math",
      name_hi: "बुनियादी गणित और गिनती (1-20)",
      name_en: "Basic Math & Numbers (1-20)",
      name_tribal: "ᱮᱞᱠᱷᱟ ᱟᱨ ᱞᱮᱠᱷᱟ (᱑-᱒᱐)",
      icon: "🔢",
      color: "from-amber-500 to-orange-600",
      timeDefault: "10:00 AM - 10:45 AM",
      desc: "ᱞᱮᱠᱷᱟ ᱑ ᱠᱷᱚᱱ ᱒᱐ ᱟᱨ ᱢᱮᱥᱟ (Numbers 1-20 & Simple Counting)"
    },
    {
      id: "c1_evs",
      name_hi: "हमारा परिवेश और प्रकृति",
      name_en: "Our Surroundings & Nature",
      name_tribal: "ᱟᱵᱚᱣᱟᱜ ᱯᱚᱨᱤᱵᱮᱥ ᱟᱨ ᱥᱤᱨᱡᱚᱱ",
      icon: "🌿",
      color: "from-emerald-600 to-teal-600",
      timeDefault: "11:00 AM - 11:45 AM",
      desc: "ᱫᱟᱨᱮ, ᱫᱟᱜ, ᱦᱚᱭ ᱟᱨ ᱟᱹᱛᱩ ᱯᱚᱨᱤᱵᱮᱥ (Plants, Water, Village Surroundings)"
    }
  ],
  "Class 2": [
    {
      id: "c2_lang",
      name_hi: "भाषा एवं जनजातीय लोककथाएं",
      name_en: "Language & Tribal Folktales",
      name_tribal: "ᱥᱟᱱᱛᱟᱲᱤ ᱠᱟᱹᱦᱱᱤ ᱟᱨ ᱯᱟᱹᱨᱥᱤ",
      icon: "📚",
      color: "from-rose-600 to-pink-600",
      timeDefault: "09:00 AM - 09:45 AM",
      desc: "ᱦᱩᱰᱤᱧ ᱠᱟᱹᱦᱱᱤ ᱟᱨ ᱯᱟᱲᱦᱟᱣ (Stories & Basic Reading)"
    },
    {
      id: "c2_math",
      name_hi: "गणित: जोड़ और घटाव",
      name_en: "Mathematics: Addition & Subtraction",
      name_tribal: "ᱮᱞᱠᱷᱟ: ᱢᱮᱥᱟ ᱟᱨ ᱵᱷᱮᱜᱟᱨ",
      icon: "📐",
      color: "from-amber-500 to-orange-600",
      timeDefault: "10:00 AM - 10:45 AM",
      desc: "ᱵᱟᱨ ᱞᱮᱠᱷᱟ ᱢᱮᱥᱟ ᱟᱨ ᱵᱷᱮᱜᱟᱨ (2-digit addition and subtraction)"
    },
    {
      id: "c2_evs",
      name_hi: "पौधे और हमारे आसपास के जीव",
      name_en: "Plants & Animals Around Us",
      name_tribal: "ᱫᱟᱨᱮ-ᱱᱟᱹᱲᱤ ᱟᱨ ᱡᱤᱭᱟᱹᱞᱤ",
      icon: "🐾",
      color: "from-emerald-600 to-teal-600",
      timeDefault: "11:00 AM - 11:45 AM",
      desc: "ᱡᱤᱭᱟᱹᱞᱤ ᱟᱨ ᱩᱱᱠᱩᱣᱟᱜ ᱡᱚᱢᱟᱜ (Animals, Birds & Habitat)"
    }
  ],
  "Class 3": [
    {
      id: "c3_sci",
      name_hi: "सामान्य विज्ञान: पौधे एवं प्रकाश संश्लेषण",
      name_en: "Science: Plants & Photosynthesis",
      name_tribal: "ᱥᱟᱬᱮᱥ: ᱫᱟᱨᱮ ᱟᱨ ᱡᱚᱢᱟᱜ ᱵᱮᱱᱟᱣ",
      icon: "🔬",
      color: "from-blue-600 to-cyan-600",
      timeDefault: "09:00 AM - 09:45 AM",
      desc: "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱵᱮᱲᱟ ᱢᱟᱨᱥᱟᱞ ᱟᱨ ᱫᱟᱜ ᱛᱮ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ (Photosynthesis)"
    },
    {
      id: "c3_math",
      name_hi: "गणित: पहाड़े और गुणन",
      name_en: "Mathematics: Multiplication & Tables",
      name_tribal: "ᱮᱞᱠᱷᱟ: ᱜᱩᱬᱟᱹᱣ ᱟᱨ ᱞᱮᱠᱷᱟ",
      icon: "🧮",
      color: "from-amber-500 to-orange-600",
      timeDefault: "10:00 AM - 10:45 AM",
      desc: "ᱜᱩᱬᱟᱹᱣ ᱟᱨ ᱞᱮᱠᱷᱟ ᱦᱟᱹᱴᱤᱧ (Multiplication tables and word problems)"
    },
    {
      id: "c3_soc",
      name_hi: "झारखंड संस्कृति व हमारा समाज",
      name_en: "Social Studies & Tribal Culture",
      name_tribal: "ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ ᱟᱨ ᱦᱮᱨᱤᱴᱮᱡᱽ",
      icon: "🏛️",
      color: "from-purple-600 to-indigo-600",
      timeDefault: "11:00 AM - 11:45 AM",
      desc: "ᱥᱟᱱᱛᱟᱲ ᱯᱟᱨᱵᱚ, ᱥᱟᱨᱦᱩᱞ, ᱠᱟᱨᱟᱢ ᱟᱨ ᱵᱤᱨᱥᱟ ᱢᱩᱱᱰᱟ (Festivals & Heroes)"
    }
  ],
  "Class 4": [
    {
      id: "c4_evs",
      name_hi: "पर्यावरण विज्ञान: जल व वन संरक्षण",
      name_en: "EVS: Water & Forest Conservation",
      name_tribal: "ᱯᱚᱨᱤᱵᱮᱥ ᱥᱟᱬᱮᱥ: ᱫᱟᱜ ᱟᱨ ᱵᱤᱨ ᱵᱟᱧᱪᱟᱣ",
      icon: "🌍",
      color: "from-emerald-600 to-teal-600",
      timeDefault: "09:00 AM - 09:45 AM",
      desc: "ᱫᱟᱜ ᱜᱮ ᱡᱤᱣᱤ ᱠᱟᱱᱟ, ᱵᱤᱨ ᱵᱟᱧᱪᱟᱣ ᱟᱨ ᱦᱚᱭ-ᱦᱤᱥᱤᱫ (Forest & Water Conservation)"
    },
    {
      id: "c4_math",
      name_hi: "गणित: भाग एवं ज्यामितीय आकृतियाँ",
      name_en: "Mathematics: Division & Shapes",
      name_tribal: "ᱮᱞᱠᱷᱟ: ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱨᱩᱯ",
      icon: "📐",
      color: "from-amber-500 to-orange-600",
      timeDefault: "10:00 AM - 10:45 AM",
      desc: "ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱡᱭᱟᱢᱤᱛᱤ (Division and geometric shapes)"
    },
    {
      id: "c4_lang",
      name_hi: "भाषा एवं जनजातीय साहित्य",
      name_en: "Language & Tribal Literature",
      name_tribal: "ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱥᱟᱶᱦᱮᱫ",
      icon: "📖",
      color: "from-rose-600 to-red-600",
      timeDefault: "11:00 AM - 11:45 AM",
      desc: "ᱯᱚᱸᱰᱮᱛ ᱨᱟᱹᱜᱷᱩᱱᱟᱛᱷ ᱢᱩᱨᱢᱩ ᱟᱨ ᱚᱞ ᱪᱤᱠᱤ ᱱᱟᱜᱟᱢ (Literature & Pandit Murmu)"
    }
  ],
  "Class 5": [
    {
      id: "c5_sci",
      name_hi: "सामान्य विज्ञान: मानव शरीर व स्वास्थ्य",
      name_en: "Science: Human Body & Health",
      name_tribal: "ᱥᱟᱬᱮᱥ: ᱦᱚᱲᱢᱚ ᱟᱨ ᱦᱚᱲᱢᱚ ᱱᱟᱯᱟᱭ",
      icon: "🧬",
      color: "from-blue-600 to-cyan-600",
      timeDefault: "09:00 AM - 09:45 AM",
      desc: "ᱦᱚᱲᱢᱚ ᱨᱮᱱᱟᱜ ᱚᱝᱜᱚ, ᱥᱟᱯᱷᱟ ᱟᱨ ᱱᱤᱨᱚᱜᱽ ᱡᱤᱭᱚᱱ (Human organs and sanitation)"
    },
    {
      id: "c5_math",
      name_hi: "गणित: भिन्न एवं दैनिक जीवन में गणित",
      name_en: "Mathematics: Fractions & Problem Solving",
      name_tribal: "ᱮᱞᱠᱷᱟ: ᱵᱷᱤᱱ ᱟᱨ ᱥᱚᱞᱦᱮ",
      icon: "📊",
      color: "from-amber-500 to-orange-600",
      timeDefault: "10:00 AM - 10:45 AM",
      desc: "ᱵᱷᱤᱱ, ᱫᱚᱥᱚᱢᱤᱠ ᱟᱨ ᱦᱟᱴ-ᱵᱟᱡᱟᱨ ᱦᱤᱥᱟᱹᱵᱽ (Fractions and marketplace math)"
    },
    {
      id: "c5_soc",
      name_hi: "सामाजिक विज्ञान: झारखंड का भूगोल व इतिहास",
      name_en: "Social Science: Geography & History",
      name_tribal: "ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ: ᱚᱛᱱᱚᱜ ᱟᱨ ᱱᱟᱜᱟᱢ",
      icon: "🗺️",
      color: "from-purple-600 to-pink-600",
      timeDefault: "11:00 AM - 11:45 AM",
      desc: "ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ ᱵᱩᱨᱩ, ᱜᱟᱰᱟ ᱟᱨ ᱩᱞᱜᱩᱞᱟᱱ ᱞᱟᱹᱲᱦᱟᱹᱭ (Geography & Tribal Movement)"
    }
  ]
};

export const SUBJECTS_LIST = [
  {
    id: "science",
    name_hi: "विज्ञान",
    name_en: "Science & Nature",
    icon: "🔬",
    color: "from-blue-600 to-cyan-600",
    border: "border-blue-500/30",
    bgLight: "bg-blue-500/10",
    badge: "text-blue-400",
    desc: "सजीव व निर्जीव वस्तुएं, पौधों में पोषण, प्रकाश संश्लेषण व मानव शरीर"
  },
  {
    id: "math",
    name_hi: "गणित",
    name_en: "Mathematics",
    icon: "📐",
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/30",
    bgLight: "bg-amber-500/10",
    badge: "text-amber-400",
    desc: "संख्याएँ, जोड़-घटाव, बुनियादी ज्यामिति, मापन और पहाड़े"
  },
  {
    id: "evs",
    name_hi: "पर्यावरण अध्ययन (EVS)",
    name_en: "Environmental Studies",
    icon: "🌍",
    color: "from-emerald-600 to-teal-600",
    border: "border-emerald-500/30",
    bgLight: "bg-emerald-500/10",
    badge: "text-emerald-400",
    desc: "झारखंड के वन, साल वृक्ष, जल संरक्षण, पशु-पक्षी और ऋतुएँ"
  },
  {
    id: "social_studies",
    name_hi: "सामाजिक अध्ययन व संस्कृति",
    name_en: "Social Studies & Heritage",
    icon: "🏛️",
    color: "from-purple-600 to-pink-600",
    border: "border-purple-500/30",
    bgLight: "bg-purple-500/10",
    badge: "text-purple-400",
    desc: "भगवान बिरसा मुंडा, सरहुल व करमा पर्व, लोक संस्कृति और भूगोल"
  },
  {
    id: "language",
    name_hi: "भाषा और लोककथाएँ",
    name_en: "Language & Folktales",
    icon: "📖",
    color: "from-rose-600 to-red-600",
    border: "border-rose-500/30",
    bgLight: "bg-rose-500/10",
    badge: "text-rose-400",
    desc: "जनजातीय लोककथाएँ, ओल चिकी व वारंग चिति लिपि ज्ञान, कविताएँ"
  }
];

export const INITIAL_LECTURE_NOTES = [
  // Science - Class 3 & 4
  {
    id: "ln_sci_1",
    subjectId: "science",
    grade: "Class 3",
    division: "All",
    title: "पौधे अपना भोजन कैसे बनाते हैं? (प्रकाश संश्लेषण)",
    title_en: "How Plants Make Food (Photosynthesis)",
    teacherName: "डॉ. रमेश सोरेन (Dr. Ramesh Soren)",
    date: "2026-09-02",
    summary_hi: "पौधे सूर्य के प्रकाश (धूप), जल (पानी) और हवा (कार्बन डाइऑक्साइड) का उपयोग करके हरी पत्तियों में भोजन बनाते हैं। इस प्रक्रिया को प्रकाश संश्लेषण कहते हैं।",
    translations: {
      santhali: {
        script: "ᱫᱟᱨᱮ ᱠᱚ ᱥᱤᱧ ᱪᱟᱸᱫᱳ ᱛᱟᱨᱟᱥ, ᱫᱟᱜ ᱟᱨ ᱦᱚᱭ ᱵᱮᱵᱷᱟᱨ ᱠᱟᱛᱮ ᱦᱟᱹᱨᱭᱟᱹᱲ ᱥᱟᱠᱟᱢ ᱨᱮ ᱡᱚᱢᱟᱜ ᱠᱚ ᱛᱮᱭᱟᱨᱟ᱾",
        devanagari: "दारे को सिञ चांदो तारास, दाग आर होय बेभार काते हड़याड़ साकाम रे जोमाग को तेयारा।",
        phonetic: "Dare ko sinj chando taras, daag aar hoy bebhar kate hariyar sakam re jomag ko teyara."
      },
      ho: {
        script: "दारु को सिंगी मारशाल, दाः आर होयो ते साकम रे जोमतेया बाई-या। नेया के प्रकाश संश्लेषण मेना-आ।",
        devanagari: "दारु को सिंगी मारशाल, दाः आर होयो ते साकम रे जोमतेया बाई-या।",
        phonetic: "Daru ko singi marshaal, daah aar hoyo te sakam re jomteya baai-ya."
      },
      mundari: {
        script: "दारु को सिंगी मारशाल, दाः आर होयो ते साकम रे जोमतेया बाई-या। नेया के प्रकाश संश्लेषण कजि-ओ-आ।",
        devanagari: "दारु को सिंगी मारशाल, दाः आर होयो ते साकम रे जोमतेया बाई-या।",
        phonetic: "Daru ko singi marshaal, daah aar hoyo te sakam re jomteya baai-ya."
      }
    },
    keyTerms: [
      { hi: "सूर्य का प्रकाश", santhali: "ᱥᱤᱧ ᱪᱟᱸᱫᱳ ᱛᱟᱨᱟᱥ (Sinj Chando Taras)", ho: "सिंगी मारशाल (Singi Marshaal)", mundari: "सिंगी मारशाल (Singi Marshaal)" },
      { hi: "पत्ती", santhali: "ᱥᱟᱠᱟᱢ (Sakam)", ho: "साकम (Sakam)", mundari: "साकम (Sakam)" },
      { hi: "पानी", santhali: "ᱫᱟᱜ (Daag)", ho: "दाः (Daah)", mundari: "दाः (Daah)" },
      { hi: "जड़", santhali: "ᱨᱮᱦᱮᱫ (Rehed)", ho: "रेहेद (Rehed)", mundari: "रेहेद (Rehed)" }
    ],
    audioDuration: "2:45 min",
    practiceQuestion_hi: "पौधे भोजन बनाने के लिए किस धूप का उपयोग करते हैं?",
    practiceAnswer_hi: "सूर्य के प्रकाश (धूप) का।"
  },
  
  // Science - Class 4
  {
    id: "ln_sci_2",
    subjectId: "science",
    grade: "Class 4",
    division: "All",
    title: "सजीव और निर्जीव वस्तुएं (Living and Non-Living)",
    title_en: "Living vs Non-Living Things",
    teacherName: "श्रीमती सुनीता मरांडी",
    date: "2026-09-01",
    summary_hi: "सजीव वस्तुएं साँस लेती हैं, बढ़ती हैं और भोजन करती हैं (जैसे- मनुष्य, पेड़, पशु)। निर्जीव वस्तुएं साँस नहीं लेतीं (जैसे- पत्थर, कुर्सी, किताब)।",
    translations: {
      santhali: {
        script: "ᱡᱤᱣᱤᱭᱟᱱ ᱡᱤᱱᱤᱥ ᱠᱚᱫᱚ ᱥᱟᱦᱮᱫ ᱠᱚ ᱦᱟᱛᱟᱣᱟ, ᱦᱟᱨᱟᱜᱼᱟ ᱟᱨ ᱡᱚᱢᱟᱜ ᱠᱚ ᱡᱚᱢᱟ᱾ ᱵᱤᱱ ᱡᱤᱣᱤ ᱡᱤᱱᱤᱥ ᱫᱚ ᱵᱟᱝ ᱥᱟᱦᱮᱫᱟ᱾",
        devanagari: "जीवियान जिनिस कोदो साहेद को हाटावा, हाराग-आ आर जोमाग को जोमा। बिन जीवी जिनिस दो बांग साहेदा।",
        phonetic: "Jiwiyan jinis kodo sahed ko hatawa, harag-a aar jomag ko joma."
      },
      ho: {
        script: "जिउ मेना-आ जिनिस को साहेद इदी-या आर हारा-ओ-आ। जिउ बानो जिनिस दो का साहेद-ए।",
        devanagari: "जिउ मेना-आ जिनिस को साहेद इदी-या आर हारा-ओ-आ।",
        phonetic: "Jiu mena-aa jinis ko sahed idi-ya aar hara-o-aa."
      },
      mundari: {
        script: "जिउ मेनाः जिनिस को साहेद इदी-या आर हारा-ओ-आ। बिन जिउ जिनिस दो का साहेद-ए।",
        devanagari: "जिउ मेनाः जिनिस को साहेद इदी-या आर हारा-ओ-आ।",
        phonetic: "Jiu menaah jinis ko sahed idi-ya aar hara-o-aa."
      }
    },
    keyTerms: [
      { hi: "सजीव", santhali: "ᱡᱤᱣᱤᱭᱟᱱ (Jiwiyan)", ho: "जिउ मेना-आ (Jiu Mena)", mundari: "जिउ मेनाः (Jiu Menaah)" },
      { hi: "निर्जीव", santhali: "ᱵᱤᱱ ᱡᱤᱣᱤ (Bin Jiwi)", ho: "जिउ बानो (Jiu Bano)", mundari: "बिन जिउ (Bin Jiu)" },
      { hi: "साँस लेना", santhali: "ᱥᱟᱦᱮᱫ (Sahed)", ho: "साहेद (Sahed)", mundari: "साहेद (Sahed)" }
    ],
    audioDuration: "3:10 min",
    practiceQuestion_hi: "पेड़ सजीव है या निर्जीव?",
    practiceAnswer_hi: "पेड़ सजीव (Living) है क्योंकि यह बढ़ता है और भोजन बनाता है।"
  },

  // Math - Class 2 & 3
  {
    id: "ln_math_1",
    subjectId: "math",
    grade: "Class 2",
    division: "All",
    title: "1 से 10 तक संख्याओं का ज्ञान व गिनती",
    title_en: "Counting Numbers 1 to 10 in Native Language",
    teacherName: "श्री आनंद मुंडा",
    date: "2026-09-03",
    summary_hi: "1 (मिद), 2 (बार), 3 (पे), 4 (पोन), 5 (मोणे), 6 (तुरुय), 7 (एयाय), 8 (इरल), 9 (आरे), 10 (गेल)। वस्तुओं को गिनकर संख्या पहचानें।",
    translations: {
      santhali: {
        script: "᱑ (ᱢᱤᱫ), ᱒ (ᱵᱟᱨ), ᱓ (ᱯᱮ), ᱔ (ᱯᱳᱱ), ᱕ (ᱢᱚᱬᱮ), ᱖ (ᱛᱩᱨᱩᱭ), ᱗ (ᱮᱭᱟᱭ), ᱘ (ᱤᱨᱟᱹᱞ), ᱙ (ᱟᱨᱮ), ᱑᱐ (ᱜᱮᱞ)᱾",
        devanagari: "1 (मिद), 2 (बार), 3 (पे), 4 (पोन), 5 (मोणे), 6 (तुरुय), 7 (एयाय), 8 (इरल), 9 (आरे), 10 (गेल)।",
        phonetic: "Mid, Bar, Pe, Pon, Mone, Turuy, Eyay, Iral, Aare, Gel."
      },
      ho: {
        script: "1 (मियद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया), 6 (तुरिया), 7 (एया), 8 (इरलिया), 9 (आरेया), 10 (गेलेया)।",
        devanagari: "1 (मियद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया), 6 (तुरिया), 7 (एया), 8 (इरलिया), 9 (आरेया), 10 (गेलेया)।",
        phonetic: "Miyad, Bariya, Aapiya, Upuniya, Modeya, Turiya, Eya, Iraliya, Aareya, Geleya."
      },
      mundari: {
        script: "1 (मियाद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया), 6 (तुरिया), 7 (एया), 8 (इरलिया), 9 (आरेया), 10 (गेलेया)।",
        devanagari: "1 (मियाद), 2 (बारिया), 3 (आपिया), 4 (उपूनिया), 5 (मोड़ेया), 6 (तुरिया), 7 (एया), 8 (इरलिया), 9 (आरेया), 10 (गेलेया)।",
        phonetic: "Miyaad, Bariya, Aapiya, Upuniya, Modeya, Turiya, Eya, Iraliya, Aareya, Geleya."
      }
    },
    keyTerms: [
      { hi: "गिनती", santhali: "ᱞᱮᱠᱷᱟ (Lekha)", ho: "लेखा (Lekha)", mundari: "लेखा (Lekha)" },
      { hi: "संख्या / अंक", santhali: "ᱮᱞ (El)", ho: "अंक (Ank)", mundari: "अंक (Ank)" },
      { hi: "जोड़ना", santhali: "ᱢᱮᱥᱟ (Mesa)", ho: "मिसा (Misa)", mundari: "मिसा (Misa)" }
    ],
    audioDuration: "2:15 min",
    practiceQuestion_hi: "संथाली में 5 को क्या कहते हैं?",
    practiceAnswer_hi: "मोणे (Mone / ᱢᱚᱬᱮ) और हो/मुंडारी में मोड़ेया कहते हैं।"
  },

  // EVS - Class 3
  {
    id: "ln_evs_1",
    subjectId: "evs",
    grade: "Class 3",
    division: "All",
    title: "झारखंड के पवित्र वन एवं साल वृक्ष (Sarhul & Sal Tree)",
    title_en: "Sacred Groves and the Sal Tree of Jharkhand",
    teacherName: "डॉ. बिरसा हेंब्रम",
    date: "2026-09-02",
    summary_hi: "साल (सखुआ) झारखंड का राजकीय वृक्ष है। सरहुल पर्व पर साल के फूलों की पूजा की जाती है। जंगल हमें शुद्ध हवा, फल, लकड़ी और औषधियां देते हैं।",
    translations: {
      santhali: {
        script: "ᱥᱟᱨᱡᱚᱢ ᱫᱟᱨᱮ ᱫᱚ ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ ᱢᱟᱨᱟᱝ ᱫᱟᱨᱮ ᱠᱟᱱᱟ᱾ ᱵᱟᱦᱟ ᱯᱚᱨᱚᱵᱽ ᱨᱮ ᱥᱟᱨᱡᱚᱢ ᱵᱟᱦᱟ ᱠᱚ ᱵᱚᱝᱜᱟᱭᱟ᱾",
        devanagari: "सारजोम दारे दो झारखंड रेनाग मारांग दारे काना। बाहा परोब रे सारजोम बाहा को बोंगाया।",
        phonetic: "Sarjom dare do Jharkhand renag marang dare kana. Baha porob re sarjom baha ko bongaya."
      },
      ho: {
        script: "सारजोम दारु झारखंड रेया मारांग दारु ताना। बाहा परोब रे सारजोम बा को बोंगा-ए।",
        devanagari: "सारजोम दारु झारखंड रेया मारांग दारु ताना। बाहा परोब रे सारजोम बा को बोंगा-ए।",
        phonetic: "Sarjom daru Jharkhand reya marang daru tana. Baha porob re sarjom baa ko bonga-e."
      },
      mundari: {
        script: "सारजोम दारु झारखंड रेयाः मारांग दारु तनाः। बाहा परोब रे सारजोम बा को बोंगा-ए।",
        devanagari: "सारजोम दारु झारखंड रेयाः मारांग दारु तनाः।",
        phonetic: "Sarjom daru Jharkhand reyaah marang daru tanaah."
      }
    },
    keyTerms: [
      { hi: "साल वृक्ष", santhali: "ᱥᱟᱨᱡᱚᱢ ᱫᱟᱨᱮ (Sarjom Dare)", ho: "सारजोम दारु (Sarjom Daru)", mundari: "सारजोम दारु (Sarjom Daru)" },
      { hi: "जंगल", santhali: "ᱵᱤᱨ (Bir)", ho: "बुरु / बीर (Bir)", mundari: "बीर (Bir)" },
      { hi: "पर्व / त्योहार", santhali: "ᱯᱚᱨᱚᱵᱽ (Porob)", ho: "परोब (Porob)", mundari: "परोब (Porob)" }
    ],
    audioDuration: "3:30 min",
    practiceQuestion_hi: "झारखंड के राजकीय वृक्ष का नाम क्या है?",
    practiceAnswer_hi: "साल (सखुआ / सारजोम दारे)।"
  },

  // Social Studies - Class 5
  {
    id: "ln_sst_1",
    subjectId: "social_studies",
    grade: "Class 5",
    division: "All",
    title: "धरती आबा भगवान बिरसा मुंडा का जीवन व संदेश",
    title_en: "Life and Teachings of Bhagwan Birsa Munda",
    teacherName: "प्रो. जयपाल सिंह मुंडा",
    date: "2026-08-30",
    summary_hi: "भगवान बिरसा मुंडा का जन्म 15 नवंबर 1875 को उलिहातू (खूंटी) में हुआ था। उन्होंने जल, जंगल और जमीन की रक्षा के लिए 'उलगुलान' (महान आंदोलन) का नेतृत्व किया।",
    translations: {
      santhali: {
        script: "ᱫᱷᱟᱹᱨᱛᱤ ᱟᱵᱟ ᱵᱷᱚᱜᱚᱵᱟᱱ ᱵᱤᱨᱥᱟ ᱢᱩᱱᱰᱟ ᱫᱚ ᱩᱞᱤᱦᱟᱹᱛᱩ ᱨᱮ ᱡᱟᱱᱟᱢ ᱞᱮᱱᱟᱭ᱾ ᱫᱟᱜ, ᱵᱤᱨ ᱟᱨ ᱦᱟᱥᱟ ᱵᱟᱧᱪᱟᱣ ᱞᱟᱹᱜᱤᱫ ᱩᱞᱜᱩᱞᱟᱱ ᱞᱟᱹᱲᱦᱟᱹᱭ ᱠᱮᱫᱟᱭ᱾",
        devanagari: "धर्ती आबा भगवान बिरसा मुंडा दो उलिहातू रे जानाम लेनाय। दाग, बीर आर हासा बांचाव लागिद उलगुलान लाड़हाय केदाय।",
        phonetic: "Dharti Aaba Bhagwan Birsa Munda do Ulihatu re janam lenay. Daag, bir aar hasa banchaw lagid Ulgulan larhay keday."
      },
      ho: {
        script: "धरती आबा बिरसा मुंडा उलिहातू रे जोनोम लेनाय। दाः, बुरु आर हासा बांचाव ते उलगुलान बाई केदाय।",
        devanagari: "धरती आबा बिरसा मुंडा उलिहातू रे जोनोम लेनाय। दाः, बुरु आर हासा बांचाव ते उलगुलान बाई केदाय।",
        phonetic: "Dharti Aaba Birsa Munda Ulihatu re jonom lenay. Daah, buru aar hasa banchaaw te Ulgulan baai keday."
      },
      mundari: {
        script: "धरती आबा बिरसा मुंडा उलिहातू रे जोनोम लेनाय। दाः, बीर आर हासा बांचाव ते उलगुलान बाई केदाय।",
        devanagari: "धरती आबा बिरसा मुंडा उलिहातू रे जोनोम लेनाय।",
        phonetic: "Dharti Aaba Birsa Munda Ulihatu re jonom lenay. Daah, bir aar hasa banchaaw te Ulgulan baai keday."
      }
    },
    keyTerms: [
      { hi: "धरती आबा", santhali: "ᱫᱷᱟᱹᱨᱛᱤ ᱟᱵᱟ (Dharti Aaba)", ho: "धरती आपा (Dharti Aapa)", mundari: "धरती आपु (Dharti Aapu)" },
      { hi: "उलगुलान (आंदोलन)", santhali: "ᱩᱞᱜᱩᱞᱟᱱ (Ulgulan)", ho: "उलगुलान (Ulgulan)", mundari: "उलगुलान (Ulgulan)" },
      { hi: "भूमि / जमीन", santhali: "ᱦᱟᱥᱟ (Hasa)", ho: "हासा (Hasa)", mundari: "हासा (Hasa)" }
    ],
    audioDuration: "4:00 min",
    practiceQuestion_hi: "बिरसा मुंडा जी का जन्म कहाँ हुआ था?",
    practiceAnswer_hi: "उलिहातू, खूंटी (झारखंड)।"
  }
];
