import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Award, 
  Database
} from 'lucide-react';

export const Analytics = () => {
  const { selectedLanguage, syncQueueCount, teacherT, teacherUiLang } = useApp();

  const competencyStats = [
    { code: "FLN-L1", name: teacherUiLang === 'en' ? "Oral Language & Picture Naming" : "मौखिक भाषा व चित्र वर्णन", score: 92, status: "Excellent" },
    { code: "FLN-L2", name: teacherUiLang === 'en' ? "Ol Chiki / Devanagari Script Recognition" : "ओल चिकी / देवनागरी वर्ण पहचान", score: 84, status: "Good" },
    { code: "FLN-L3", name: teacherUiLang === 'en' ? "Simple Word & Sentence Reading" : "सरल शब्द पठन एवं वाक्य बोध", score: 71, status: "Needs Support" },
    { code: "FLN-N1", name: teacherUiLang === 'en' ? "Numeracy 1 to 10" : "संख्या ज्ञान 1 से 10", score: 95, status: "Excellent" },
    { code: "FLN-N2", name: teacherUiLang === 'en' ? "Native Object Addition & Subtraction" : "स्थानीय वस्तुओं से जोड़-घटाव", score: 78, status: "Good" }
  ];

  const studentProfiles = [
    { name: "ᱵᱤᱨᱥᱟ ᱢᱩᱨᱢᱩ (Birsa Murmu)", roll: "01", attendance: "98%", flnLevel: "Grade 1 Pro", stars: 120, needHelp: false },
    { name: "ᱥᱩᱱᱤᱛᱟ ᱦᱟᱸᱥᱫᱟ (Sunita Hansda)", roll: "02", attendance: "94%", flnLevel: "Grade 1 Intermediate", stars: 95, needHelp: false },
    { name: "ᱨᱚᱦᱤᱛ ᱥᱚᱨᱮᱱ (Rohit Soren)", roll: "03", attendance: "82%", flnLevel: "Balvatika Ready", stars: 50, needHelp: true },
    { name: "ᱟᱱᱤᱛᱟ ᱠᱤᱥᱠᱩ (Anita Kisku)", roll: "04", attendance: "96%", flnLevel: "Grade 1 Pro", stars: 110, needHelp: false }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-cyan-950/80 border border-teal-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-2xl font-black text-white">
              {teacherUiLang === 'en' ? 'FLN Competency Mastery & Student Analytics' : 'FLN अधिगम प्रतिफल व विद्यार्थी विश्लेषिकी'}
            </h2>
          </div>
          <p className="text-sm text-teal-300 font-medium mt-1">
            {teacherUiLang === 'en' ? 'NIPUN Bharat Dashboard • Jharkhand PALASH MTB-MLE Learning Outcomes' : 'NIPUN भारत डैशबोर्ड • झारखंड पलाश मातृभाषा शिक्षण परिणाम'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500 text-slate-950 font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-teal-500/30 no-print"
        >
          <Download className="w-4 h-4" />
          <span>{teacherUiLang === 'en' ? 'Export Report (PDF)' : 'रिपोर्ट डाउनलोड (Export PDF)'}</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-card border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">{teacherUiLang === 'en' ? 'Total Enrolled' : 'कुल नामांकित बच्चे'}</span>
            <Users className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white">32</div>
          <p className="text-xs text-emerald-400 font-medium mt-1">100% Santhali/Ho/Mundari</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">{teacherUiLang === 'en' ? 'FLN Mastery Rate' : 'FLN औसत अधिगम दर'}</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">84.2%</div>
          <p className="text-xs text-emerald-400 font-medium mt-1">+18% {teacherUiLang === 'en' ? 'Growth (MTB-MLE)' : 'वृद्धि (मातृभाषा सेतु)'}</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">{teacherUiLang === 'en' ? 'Oral Reading Fluency' : 'मातृभाषा शब्द प्रवाह'}</span>
            <Award className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-orange-300">38 wpm</div>
          <p className="text-xs text-slate-400 mt-1">{teacherUiLang === 'en' ? 'Above NIPUN Benchmark' : 'NIPUN मानक से अधिक'}</p>
        </div>

        <div className="p-5 rounded-3xl glass-card border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">{teacherUiLang === 'en' ? 'Offline Data Sync' : 'ऑफलाइन डेटा स्थिति'}</span>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-300">100% OK</div>
          <p className="text-xs text-slate-400 mt-1">{syncQueueCount} {teacherUiLang === 'en' ? 'Records Queued' : 'रिकॉर्ड सुरक्षित'}</p>
        </div>
      </div>

      {/* FLN Competency Progress Bars */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800">
        <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>{teacherUiLang === 'en' ? 'NIPUN Bharat FLN Competency Mastery' : 'NIPUN Bharat FLN अधिगम प्रतिफल प्रगति'}</span>
        </h3>

        <div className="space-y-5">
          {competencyStats.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-xs">
                    {item.code}
                  </span>
                  <span className="text-slate-200">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${item.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.score}%
                  </span>
                  <span className="text-slate-500 text-xs">({item.status})</span>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.score >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student List & Diagnostic Alerts */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-800">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          <span>{teacherUiLang === 'en' ? 'Classroom Student Diagnostic Radar' : 'कक्षा विद्यार्थी सूची एवं उपचारात्मक मार्गदर्शन'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">{teacherUiLang === 'en' ? 'Roll No' : 'क्रमांक (Roll)'}</th>
                <th className="p-3">{teacherUiLang === 'en' ? 'Student Name' : 'विद्यार्थी का नाम'}</th>
                <th className="p-3">{teacherUiLang === 'en' ? 'Attendance' : 'उपस्थिति'}</th>
                <th className="p-3">{teacherUiLang === 'en' ? 'FLN Level' : 'FLN दक्षता स्तर'}</th>
                <th className="p-3">{teacherUiLang === 'en' ? 'Stars' : 'स्टार अंक'}</th>
                <th className="p-3">{teacherUiLang === 'en' ? 'Action Guidance' : 'सुझाव (Action)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {studentProfiles.map((st, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-400">{st.roll}</td>
                  <td className="p-3 font-bold text-white flex items-center gap-2 font-olchiki">
                    <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                      {st.name.charAt(0)}
                    </span>
                    <span>{st.name}</span>
                  </td>
                  <td className="p-3 text-emerald-400 font-semibold">{st.attendance}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 text-xs font-semibold">
                      {st.flnLevel}
                    </span>
                  </td>
                  <td className="p-3 font-black text-amber-400">⭐ {st.stars}</td>
                  <td className="p-3">
                    {st.needHelp ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {teacherUiLang === 'en' ? 'Assign Flashcard Practice' : 'मातृभाषा फ्लैशकार्ड अभ्यास दें'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {teacherUiLang === 'en' ? 'Excellent Progress' : 'उत्कृष्ट प्रगति'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
