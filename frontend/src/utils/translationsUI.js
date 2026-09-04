// Comprehensive UI Localization Dictionary
// 1. Teacher Interface: English and Hindi
// 2. Student Interface: Full Santhali (Ol Chiki + Phonetics)

const EN_TEXT = {
  brand_subtitle: "Multilingual Vernacular Classroom Suite",
  switch_lang_label: "Interface Language:",
  role_teacher: "Teacher Portal",
  role_student: "Student Portal",
  offline_mode: "Offline Mode",
  online_mode: "Online Cloud",
  sync_tooltip: "Sync data to cloud",
  logout: "Logout / Switch Profile",

  // Tabs
  tab_translator: "Live Classroom & Speech",
  tab_subjects: "Subject Notes Studio",
  tab_lesson: "FLN Curriculum Planner",
  tab_worksheets: "Worksheet PDF Studio",
  tab_flashcards: "Picture Flashcards",
  tab_analytics: "Competency Analytics",

  // Live Translator Page
  translator_title: "Real-Time Voice Classroom Dialoguer",
  translator_desc: "Speak in Hindi/English -> Students receive and hear in Santhali (Ol Chiki)",
  broadcasting_on: "Live Broadcasting ON",
  broadcasting_off: "Broadcast Paused",
  teacher_input_title: "Teacher Voice Input (Hindi / English)",
  speak_or_type: "Speak into mic or type here...",
  listening: "Listening...",
  quick_commands: "Quick Classroom Commands:",
  target_output_title: "Student Target Output (Santhali)",
  play_audio: "Play Audio",
  student_questions_title: "Student Questions Inbox",
  reply_to_student: "Reply to Student",
  send_reply: "Send Reply",
  cancel: "Cancel",
  no_questions_yet: "No student questions yet. Questions asked by students will appear here with Roll No & Class.",

  // Subject Notes Studio Page
  notes_manager_title: "Subject Notes & Lectures Studio",
  notes_manager_desc: "Create and publish bilingual lecture notes with audio narration to students",
  create_new_note: "Create New Lecture Note",
  view_list: "View Published Notes",
  subject_label: "Subject",
  grade_label: "Grade / Class",
  title_label: "Lesson Title (Hindi)",
  title_en_label: "Lesson Title (English)",
  summary_label: "Lesson Summary & Core Concept (Auto-translated to Santhali)",
  practice_q_label: "Practice Review Question",
  practice_ans_label: "Correct Answer",
  publish_btn: "Publish Lecture Note to Students",
  published_notes: "Published Lecture Notes",
  search_placeholder: "Search notes...",

  // Lesson Planner Page
  planner_title: "NIPUN Bharat FLN Lesson & Curriculum Engine",
  planner_desc: "Auto-generated Bilingual Lesson Scripts & Activity Guides",
  save_offline: "Save Plan Offline",
  print_plan: "Print Lesson Plan",
  learning_objectives: "Learning Objectives & Outcomes:",
  step_guide: "4-Step Teacher Instruction Script:"
};

const HI_TEXT = {
  brand_subtitle: "झारखंड बहुभाषी शिक्षण सेतु",
  switch_lang_label: "इंटरफ़ेस भाषा:",
  role_teacher: "शिक्षक मंच",
  role_student: "बाल-मित्र (विद्यार्थी)",
  offline_mode: "ऑफलाइन मोड",
  online_mode: "ऑनलाइन मोड",
  sync_tooltip: "डेटा सिंक करें",
  logout: "लॉगआउट / प्रोफाइल बदलें",

  // Tabs
  tab_translator: "सजीव कक्षा व अनुवादक",
  tab_subjects: "विषय व व्याख्यान नोट्स",
  tab_lesson: "पाठ योजना (Curriculum)",
  tab_worksheets: "द्विभाषी कार्यपत्रक",
  tab_flashcards: "सचित्र फ्लैशकार्ड",
  tab_analytics: "दक्षता विश्लेषण",

  // Live Translator Page
  translator_title: "सजीव कक्षा अनुवादक व प्रसारण",
  translator_desc: "शिक्षक हिंदी में बोलें -> विद्यार्थी संथाली (ओल चिकी) में सुनें व समझें",
  broadcasting_on: "लाइव प्रसारण सक्रिय (Broadcasting ON)",
  broadcasting_off: "प्रसारण बंद",
  teacher_input_title: "शिक्षक हिंदी वाणी (Hindi Voice)",
  speak_or_type: "माइक दबाकर बोलें या यहाँ लिखें...",
  listening: "सुन रहे हैं...",
  quick_commands: "त्वरित कक्षा निर्देश:",
  target_output_title: "विद्यार्थी भाषा (संथाली - ओल चिकी)",
  play_audio: "सुनाएं (Play Audio)",
  student_questions_title: "विद्यार्थियों द्वारा पूछे गए प्रश्न (Inbox)",
  reply_to_student: "उत्तर दें (Reply)",
  send_reply: "उत्तर भेजें",
  cancel: "रद्द करें",
  no_questions_yet: "कक्षा में अभी कोई नया प्रश्न नहीं आया है।",

  // Subject Notes Studio Page
  notes_manager_title: "विषय व व्याख्यान नोट्स प्रबंधन",
  notes_manager_desc: "विभिन्न विषयों के लिए पाठ नोट्स तैयार करें और संथाली अनुवाद सहित विद्यार्थियों को प्रकाशित करें",
  create_new_note: "नया पाठ जोड़ें",
  view_list: "प्रकाशित पाठ सूची",
  subject_label: "विषय",
  grade_label: "कक्षा (Class)",
  title_label: "पाठ का शीर्षक (Hindi Title)",
  title_en_label: "अंग्रेजी शीर्षक (English Title)",
  summary_label: "पाठ का विवरण / मुख्य सार (संथाली में स्वतः अनुवादित)",
  practice_q_label: "अभ्यास प्रश्न",
  practice_ans_label: "सही उत्तर",
  publish_btn: "पाठ प्रकाशित करें (Publish Note)",
  published_notes: "प्रकाशित पाठ नोट्स",
  search_placeholder: "खोजें...",

  // Lesson Planner Page
  planner_title: "NIPUN FLN पाठ योजना व शिक्षण मार्गदर्शिका",
  planner_desc: "स्वतः निर्मित द्विभाषी पाठ योजना व गतिविधि मार्गदर्शिका",
  save_offline: "ऑफलाइन सेव करें",
  print_plan: "प्रिंट पाठ योजना",
  learning_objectives: "अधिगम प्रतिफल एवं शिक्षण उद्देश्य:",
  step_guide: "चरणबद्ध शिक्षण मार्गदर्शिका (4 Steps):"
};

export const TEACHER_UI_TEXT = {
  en: EN_TEXT,
  english: EN_TEXT,
  hi: HI_TEXT,
  hindi: HI_TEXT
};

export const getTeacherTranslations = (lang) => {
  if (!lang) return EN_TEXT;
  const normalized = lang.toLowerCase().trim();
  if (normalized === 'hi' || normalized === 'hindi') {
    return { ...EN_TEXT, ...HI_TEXT };
  }
  return EN_TEXT;
};

export const STUDENT_SANTHALI_UI_TEXT = {
  brand_title: "TechSetu",
  brand_subtitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱥᱮᱪᱮᱫ ᱯᱟᱞᱟᱥ (Santhali Learning Suite)",
  greeting: "ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ ᱫᱩᱞᱟᱹᱲ ᱜᱟᱛᱮ! (Welcome Dear Friend!)",
  welcome_sub: "ᱛᱮᱦᱮᱧ ᱫᱚ ᱱᱟᱣᱟ ᱱᱟᱣᱟ ᱡᱤᱱᱤᱥ ᱵᱚᱱ ᱪᱮᱫᱟ! (Let's learn new things today!)",
  role_badge: "ᱵᱟᱞ-ᱢᱤᱛᱨᱚ (Student)",
  stars_label: "ᱤᱯᱤᱞ (Stars)",
  streak_label: "ᱢᱟᱦᱟᱸ (Days)",
  level_label: "ᱛᱷᱚᱠ (Level)",

  // Navigation Tabs in Santhali (Ol Chiki)
  tabs: {
    classroom: "🎧 ᱥᱟᱡᱤᱵᱽ ᱠᱞᱟᱥ (Live Class)",
    subjects: "📚 ᱥᱟᱛᱟᱢ ᱱᱳᱴ (Subjects)",
    adventure: "🗺️ ᱜᱮᱭᱟᱱ ᱫᱟᱬᱟᱺ (Quest Map)",
    voice_buddy: "🐯 ᱨᱚᱯᱚᱲ ᱜᱟᱛᱮ (Voice Buddy)",
    games: "🎮 ᱠᱷᱮᱞ ᱴᱷᱟᱶ (Games)",
    quiz: "⭐ ᱤᱯᱤᱞ ᱠᱩᱠᱞᱤ (Quiz Arena)"
  },

  // Live Classroom in Santhali
  classroom: {
    badge: "ᱥᱟᱡᱤᱵᱽ ᱠᱞᱟᱥ ᱯᱨᱚᱥᱟᱨᱚᱬ (Live Broadcast)",
    title: "ᱜᱚᱢᱠᱮᱭᱟᱜ ᱟᱲᱟᱝ ᱟᱸᱡᱚᱢ ᱢᱮ (Listen to Teacher in Santhali)",
    subtitle: "ᱜᱚᱢᱠᱮ ᱦᱤᱱᱫᱤ ᱛᱮ ᱨᱚᱲ ᱠᱟᱱᱟᱭ ᱟᱨ ᱟᱢ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮᱢ ᱟᱸᱡᱚᱢ ᱮᱫᱟ",
    auto_audio_on: "ᱟᱲᱟᱝ ᱪᱟᱹᱞᱩ (Audio ON)",
    auto_audio_off: "ᱟᱲᱟᱝ ᱵᱚᱸᱫᱽ (Audio OFF)",
    ask_teacher_btn: "🙋‍♂️ ᱜᱚᱢᱠᱮ ᱠᱩᱞᱤᱭᱮᱢ (Ask Teacher)",
    live_feed_title: "ᱥᱟᱡᱤᱵᱽ ᱯᱟᱲᱦᱟᱣ ᱫᱷᱟᱨᱟ (Live Lectures)",
    play_audio_btn: "ᱟᱸᱡᱚᱢ ᱢᱮ (Play)",
    my_questions_title: "ᱤᱧᱟᱜ ᱠᱩᱠᱞᱤ ᱠᱚ (My Questions)",
    waiting_reply: "ᱛᱮᱞᱟ ᱛᱟᱺᱜᱤ ᱨᱮ... (Waiting for reply)",
    answered: "ᱛᱮᱞᱟ ᱧᱟᱢᱮᱱᱟ ✓ (Answered)",
    teacher_reply_prefix: "👨‍🏫 ᱜᱚᱢᱠᱮᱭᱟᱜ ᱛᱮᱞᱟ (Teacher's Answer):",
    ask_modal_title: "ᱜᱚᱢᱠᱮ ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤᱭᱮᱢ",
    ask_modal_sub: "ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱨᱚᱲ ᱢᱮ ᱥᱮ ᱚᱞ ᱢᱮ (Speak or Type in Santhali)",
    ask_placeholder: "ᱱᱚᱰᱮ ᱟᱢᱟᱜ ᱠᱩᱠᱞᱤ ᱚᱞ ᱢᱮ ᱥᱮ ᱢᱟᱭᱤᱠ ᱛᱮ ᱨᱚᱲ ᱢᱮ...",
    submit_q_btn: "ᱠᱩᱠᱞᱤ ᱵᱷᱮᱡᱟᱭ ᱢᱮ (Send Question)"
  },

  // Subjects in Santhali
  subjects: {
    title: "ᱥᱟᱛᱟᱢ ᱟᱨ ᱯᱟᱲᱦᱟᱣ ᱱᱳᱴ (Subject Notes & Audio)",
    subtitle: "ᱜᱚᱢᱠᱮ ᱛᱟᱠᱚ ᱯᱟᱲᱦᱟᱣ ᱟᱠᱟᱫ ᱥᱟᱛᱟᱢ ᱠᱚ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱟᱸᱡᱚᱢ ᱟᱨ ᱯᱟᱲᱦᱟᱣ ᱢᱮ",
    all_subjects: "ᱥᱟᱱᱟᱢ ᱥᱟᱛᱟᱢ (All)",
    science: "ᱥᱟᱬᱮᱥ (Science)",
    math: "ᱮᱞᱠᱷᱟ (Math)",
    evs: "ᱯᱚᱨᱤᱵᱮᱥ / ᱫᱟᱜ-ᱵᱤᱨ (EVS)",
    social_studies: "ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ ᱟᱨ ᱞᱟᱠᱪᱟᱨ (Heritage)",
    language: "ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱠᱟᱹᱦᱱᱤ (Language)",
    listen_lecture: "ᱯᱟᱲᱦᱟᱣ ᱟᱸᱡᱚᱢ ᱢᱮ (Listen Audio)",
    key_terms: "ᱢᱩᱬᱩᱛ ᱟᱹᱲᱟᱹ ᱠᱚ (Key Vocabulary):",
    practice_q: "ᱠᱩᱠᱞᱤ ᱠᱷᱮᱞ (Practice Question):",
    reveal_answer: "ᱛᱮᱞᱟ ᱧᱮᱞ ᱢᱮ ᱟᱨ ᱑᱐ ᱤᱯᱤᱞ ᱟᱢᱮᱴ ᱢᱮ (Reveal & Win 10 ⭐)"
  },

  // Games in Santhali
  games: {
    title: "ᱥᱟᱱᱛᱟᱲᱤ ᱠᱷᱮᱞ ᱴᱷᱟᱶ (Interactive Language Games)",
    subtitle: "ᱠᱷᱮᱞ ᱠᱷᱮᱞ ᱛᱮ ᱥᱟᱱᱛᱟᱲᱤ ᱟᱹᱲᱟᱹ ᱟᱨ ᱮᱞᱠᱷᱟ ᱥᱮᱪᱮᱫᱚᱜ ᱢᱮ",
    score_label: "ᱠᱷᱮᱞ ᱤᱯᱤᱞ (Score)",
    sound_match_tab: "🔊 ᱥᱟᱰᱮ ᱢᱮᱞᱟᱣ (Sound Match)",
    counting_tab: "🍃 ᱞᱮᱠᱷᱟ ᱠᱷᱮᱞ (Counting)",
    play_sound: "ᱟᱲᱟᱝ ᱟᱸᱡᱚᱢ ᱢᱮ (Listen)",
    correct_praise: "🎉 ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ! ᱥᱟᱹᱨᱤ ᱛᱮᱞᱟ (+10 ⭐ ᱧᱟᱢᱮᱱᱟ!)",
    wrong_try_again: "❌ ᱟᱨ ᱢᱤᱫᱫᱷᱟᱣ ᱪᱮᱥᱴᱟᱭ ᱢᱮ (Try Again)"
  },

  // Quiz in Santhali
  quiz: {
    title: "ᱥᱟᱱᱛᱟᱲᱤ ᱤᱯᱤᱞ ᱠᱩᱠᱞᱤ (Star Quiz Arena)",
    subtitle: "ᱠᱩᱠᱞᱤ ᱨᱮᱱᱟᱜ ᱛᱮᱞᱟ ᱮᱢ ᱠᱟᱛᱮ ᱪᱟᱢᱯᱤᱭᱟᱱ ᱢᱮᱰᱟᱞ ᱟᱢᱮᱴ ᱢᱮ",
    question_prefix: "ᱠᱩᱠᱞᱤ",
    next_btn: "ᱞᱟᱦᱟ ᱥᱮᱫ (Next)",
    finish_btn: "ᱯᱩᱨᱟᱹᱣ (Finish Quiz)",
    won_praise: "🎉 ᱟᱹᱰᱤ ᱢᱟᱨᱟᱝ ᱡᱤᱛᱠᱟᱹᱨ! (Congratulations!)",
    restart: "ᱫᱚᱦᱲᱟ ᱮᱦᱚᱵ (Play Again)"
  }
};
