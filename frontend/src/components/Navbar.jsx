import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { speechService } from '../services/speechService';
import { 
  Sparkles, 
  GraduationCap, 
  Gamepad2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Star, 
  Globe, 
  LogOut,
  Languages
} from 'lucide-react';

export const Navbar = () => {
  const {
    currentUser,
    logoutUser,
    activeRole,
    setActiveRole,
    teacherUiLang,
    setTeacherUiLang,
    teacherT,
    studentT,
    forceOfflineMode,
    setForceOfflineMode,
    studentStats,
    syncQueueCount,
    setSyncQueueCount
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSync = async () => {
    speechService.playChime('click');
    setIsSyncing(true);
    setSyncMessage(activeRole === 'student' ? 'ᱰᱮᱴᱟ ᱥᱤᱝᱠᱚᱜ ᱠᱟᱱᱟ...' : (teacherUiLang === 'en' ? 'Syncing data...' : 'डेटा सिंक हो रहा है...'));
    const result = await apiService.syncPendingQueue();
    setIsSyncing(false);
    if (result.status === 'success') {
      setSyncMessage(activeRole === 'student' ? `ᱥᱤᱝᱠ ᱦᱩᱭᱮᱱᱟ: ${result.count} ᱟᱯᱰᱮᱴ!` : (teacherUiLang === 'en' ? `Synced ${result.count} items!` : `सिंक पूर्ण: ${result.count} आइटम अपडेट हुए!`));
      setSyncQueueCount(0);
      speechService.playChime('reward');
    } else {
      setSyncMessage(activeRole === 'student' ? 'ᱚᱯᱷᱞᱟᱭᱤᱱ ᱨᱮ ᱢᱮᱱᱟᱜᱼᱟ' : (teacherUiLang === 'en' ? 'Offline Mode' : 'ऑफलाइन मोड'));
    }
    setTimeout(() => setSyncMessage(''), 3500);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-2xl no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-600/30 border border-amber-400/40 transform hover:scale-105 transition-transform">
              <span className="text-2xl">🌺</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  TechSetu
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeRole === 'student' ? 'ᱥᱟᱱᱛᱟᱲᱤ' : 'MTB-MLE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {activeRole === 'student' 
                  ? 'ᱥᱟᱱᱛᱟᱲᱤ ᱥᱮᱪᱮᱫ ᱯᱟᱞᱟᱥ (Santhali Learning Suite)' 
                  : (teacherUiLang === 'en' ? 'Mother Tongue Vernacular Classroom Suite' : 'झारखंड बहुभाषी शिक्षण सेतु')}
              </p>
            </div>
          </div>

          {/* Role Navigation Tabs (Only shown for teachers/admins; completely hidden for students) */}
          {currentUser?.role !== 'student' && (
            <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
              <button
                onClick={() => {
                  speechService.playChime('click');
                  setActiveRole('teacher');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeRole === 'teacher'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{teacherT.role_teacher}</span>
              </button>

              <button
                onClick={() => {
                  speechService.playChime('reward');
                  setActiveRole('student');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeRole === 'student'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gamepad2 className="w-4 h-4 text-amber-300" />
                <span>{studentT.role_badge}</span>
              </button>
            </nav>
          )}

          {/* Student Badges Info (Shown when student is logged in) */}
          {currentUser?.role === 'student' && (
            <div className="hidden sm:flex items-center gap-2 font-olchiki">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{studentStats?.stars || 30} ᱤᱯᱤᱞ</span>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                <span>{currentUser?.grade || "Class 3"} • {currentUser?.division || "A"}</span>
              </div>
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* TEACHER MODE: English / Hindi UI Language Switcher */}
            {activeRole === 'teacher' && (
              <div className="flex items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-700">
                <button
                  onClick={() => { speechService.playChime('click'); setTeacherUiLang('en'); }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    teacherUiLang === 'en'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch Teacher Interface to English"
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => { speechService.playChime('click'); setTeacherUiLang('hindi'); }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                    teacherUiLang === 'hindi'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch Teacher Interface to Hindi (हिन्दी)"
                >
                  🇮🇳 हिन्दी
                </button>
              </div>
            )}

            {/* STUDENT MODE: Santhali Badge */}
            {activeRole === 'student' && (
              <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-2xl text-xs font-black text-emerald-300">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-olchiki">ᱥᱟᱱᱛᱟᱲᱤ (Santhali)</span>
              </div>
            )}

            {/* Offline Simulation Toggle */}
            <button
              onClick={() => {
                speechService.playChime('click');
                setForceOfflineMode(!forceOfflineMode);
              }}
              title={forceOfflineMode ? "Switch to Online Mode" : "Simulate Offline Mode"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                forceOfflineMode
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              {forceOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{activeRole === 'student' ? 'ᱚᱯᱷᱞᱟᱭᱤᱱ' : teacherT.offline_mode}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">{activeRole === 'student' ? 'ᱚᱱᱞᱟᱭᱤᱱ' : teacherT.online_mode}</span>
                </>
              )}
            </button>

            {/* Cloud Sync Button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-transform active:scale-95"
              title={teacherT.sync_tooltip}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              {syncQueueCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {syncQueueCount}
                </span>
              )}
            </button>

            {/* User Profile Card & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-800/90 pl-3 pr-1 py-1 rounded-2xl border border-slate-700">
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px] font-olchiki">
                    {currentUser.role === 'student' ? `🧒 ${currentUser.name}` : `👨‍🏫 ${currentUser.name}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {currentUser.role === 'student' 
                      ? `Roll: ${currentUser.rollNo} • ${currentUser.grade}-${currentUser.division}` 
                      : (currentUser.subject || "Teacher")}
                  </div>
                </div>

                {currentUser.role === 'student' && (
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-xl text-amber-400 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{studentStats.stars}</span>
                  </div>
                )}

                <button
                  onClick={() => { 
                    speechService.playChime('click'); 
                    logoutUser(); 
                    if (window.history && window.history.pushState) {
                      window.history.pushState({}, '', '/');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                  title={teacherT.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-center pb-3 gap-2">
          <button
            onClick={() => setActiveRole('teacher')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold ${
              activeRole === 'teacher' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{teacherT.role_teacher}</span>
          </button>
          <button
            onClick={() => setActiveRole('student')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold ${
              activeRole === 'student' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{studentT.role_badge}</span>
          </button>
        </div>

        {syncMessage && (
          <div className="text-center py-1 text-xs font-semibold text-amber-300 bg-amber-500/10 border-t border-amber-500/20">
            {syncMessage}
          </div>
        )}
      </div>
    </header>
  );
};
