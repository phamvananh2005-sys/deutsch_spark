import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  Upload, User, Volume2, Volume1, Download, Star, Award, MessageSquare,
  RefreshCcw, CheckCircle2, Mic, Square, ChevronRight,
  BookOpen, MessageCircle, Eye, EyeOff, ShieldCheck, Sparkles, BookA,
  Lock, LogOut, Plus, Save, X, Info, Trash2, Activity, Globe
} from 'lucide-react';
import { supabase } from './supabase';

const normalizeDbItem = (item) => ({
  ...item,
  isPublished: item.isPublished ?? item.ispublished
});

const toDbItem = ({ isPublished, ispublished, ...item }) => ({
  ...item,
  ispublished: isPublished ?? ispublished
});

// --- HỆ THỐNG ĐA NGÔN NGỮ (i18n) ---
const dict = {
  vi: {
    welcome: "Chào mừng đến với Deutsch Spark",
    subtitle: "Hệ thống luyện nói và phát âm tiếng Đức thông minh tích hợp AI.",
    step1: "1. Nhập tên của bạn để bắt đầu:",
    namePlaceholder: "Ví dụ: Nguyễn Văn A...",
    received: "Đã nhận",
    step2: "2. Chọn chế độ luyện tập:",
    shadowingTitle: "Shadowing",
    shadowingDesc: "Bắt chước lại theo từ vựng hoặc câu mẫu. AI đánh giá chi tiết độ chính xác âm tiết. Luyện đến khi đạt chuẩn.",
    topicTitle: "Nói theo chủ đề",
    topicDesc: "Thuyết trình theo chủ đề. Đánh giá đa chiều về độ trôi chảy, bám sát nội dung, từ vựng và ngữ pháp bằng AI.",
    freeTitle: "Nói tự do",
    freeDesc: "Thu âm tự do. Hệ thống AI đánh giá dựa trên độ lưu loát, mạch lạc, phát triển ý và tính tự nhiên.",
    adminLink: "Dành cho Quản trị viên",
    adminMode: "QUẢN TRỊ",
    logout: "Đăng xuất",
    changeMode: "Đổi chế độ",
    adminLoginTitle: "Đăng nhập Admin",
    passPlaceholder: "Nhập mật khẩu...",
    loginBtn: "Đăng nhập",
    backBtn: "Quay lại",
    chooseLevel: "1. Chọn cấp độ:",
    chooseType: "2. Chọn loại luyện tập:",
    vocab: "Từ vựng",
    sentence: "Câu văn",
    chooseLesson: "3. Chọn bài học:",
    noLesson: "Chưa có bài học nào cho phần này.",
    lessonItems: "Gồm {0} hạng mục",
    startPractice: "BẮT ĐẦU LUYỆN TẬP",
    completed: "Hoàn thành bài học!",
    completedDesc: "Tuyệt vời, bạn đã luyện xong bài",
    chooseOther: "Chọn bài khác",
    listenSlow: "Chậm",
    listenNormal: "Chuẩn",
    yourTurn: "Sử dụng nút Thu âm trực tiếp và bắt chước lại để AI đánh giá độ chính xác.",
    uploadFile: "Tải file lên",
    uploadWarn: "Hệ thống sẽ không thể nhận diện lỗi phát âm chi tiết bằng cách này.",
    recDirect: "Thu âm trực tiếp",
    recBtn: "Chấm điểm bằng giọng nói",
    stopRec: "DỪNG THU",
    recommended: "Khuyên dùng",
    aiEvaluating: "AI đang thẩm định và viết nhận xét...",
    waitMsg: "Quá trình đánh giá ngôn ngữ mất vài giây nhé!",
    grading: "AI đang phân tích độ chính xác...",
    tryAgain: "Thử lại câu này",
    nextItem: "Chuyển tiếp",
    analysis: "Phân tích chi tiết từ AI:",
    selectTopic: "Chọn chủ đề thuyết trình:",
    selectTopicHolder: "-- Bấm để chọn một chủ đề --",
    reqLevel: "Yêu cầu (Mức độ {0}):",
    hintModel: "Gợi ý bài nói mẫu:",
    uploadOrRec: "Tải lên hoặc thu âm bài nói của bạn:",
    startGrading: "Bắt đầu chấm điểm AI",
    cancel: "✕ Hủy",
    aiRecognized: "AI đã nhận diện được giọng nói của bạn.",
    gradeAnother: "Chấm bài khác",
    exportPDF: "XUẤT PHIẾU PDF",
    reportTitle: "PHIẾU ĐÁNH GIÁ KỸ NĂNG NÓI",
    analyzedBy: "Phân tích bởi Deutsch Spark Generative AI",
    student: "Học Viên",
    originalAudio: "Bản ghi âm gốc:",
    avgScore: "Điểm trung bình / 10",
    rank: "XẾP LOẠI:",
    estimatedLevel: "TRÌNH ĐỘ TƯƠNG ĐƯƠNG:",
    systemAnalysis: "Nhận xét và góp ý từ hệ thống AI:",
    forgotPwd: "Quên mật khẩu?",
    forgotPwdDesc: "Để đảm bảo bảo mật, hệ thống không tự động cấp lại mật khẩu. Vui lòng gửi email yêu cầu khôi phục mật khẩu về:",
    sendEmail: "Gửi email yêu cầu",
    cPronunciation: "Phát âm",
    cFluency: "Độ trôi chảy",
    cClarity: "Độ rõ ràng",
    cContentAccuracy: "Độ chính xác nội dung",
    cPronunRhythm: "Phát âm & Nhịp điệu",
    cTopicRelevance: "Bám sát chủ đề",
    cCompleteness: "Nội dung đủ ý",
    cGrammar: "Ngữ pháp",
    cVocabRichness: "Từ vựng phong phú",
    cNaturalness: "Độ tự nhiên",
    cVocab: "Từ vựng",
    cIdeaDev: "Khả năng phát triển ý"
  },
  en: {
    welcome: "Welcome to Deutsch Spark",
    subtitle: "Smart German speaking and pronunciation training system powered by AI.",
    step1: "1. Enter your name to start:",
    namePlaceholder: "e.g. John Doe...",
    received: "Received",
    step2: "2. Select training mode:",
    shadowingTitle: "Shadowing",
    shadowingDesc: "Imitate vocabulary or sentences. Get detailed AI evaluation of your accuracy.",
    topicTitle: "Topic Speaking",
    topicDesc: "Present on a topic. Multi-dimensional AI evaluation of fluency, relevance, and grammar.",
    freeTitle: "Free Speaking",
    freeDesc: "Record freely. AI scoring based on fluency, coherence, idea development, and naturalness.",
    adminLink: "For Administrators",
    adminMode: "ADMIN",
    logout: "Logout",
    changeMode: "Change Mode",
    adminLoginTitle: "Admin Login",
    passPlaceholder: "Enter password...",
    loginBtn: "Login",
    backBtn: "Go Back",
    chooseLevel: "1. Select Level:",
    chooseType: "2. Select Type:",
    vocab: "Vocabulary",
    sentence: "Sentences",
    chooseLesson: "3. Select Lesson:",
    noLesson: "No lessons available for this section.",
    lessonItems: "Contains {0} items",
    startPractice: "START PRACTICING",
    completed: "Lesson Completed!",
    completedDesc: "Great job, you have finished",
    chooseOther: "Choose another lesson",
    listenSlow: "Slow",
    listenNormal: "Normal",
    yourTurn: "Use Direct Record and imitate the sample for AI accuracy check.",
    uploadFile: "Upload File",
    uploadWarn: "System cannot provide detailed pronunciation errors via file upload.",
    recDirect: "Direct Record",
    recBtn: "Grade my speech",
    stopRec: "STOP REC",
    recommended: "Recommended",
    aiEvaluating: "AI is evaluating and generating feedback...",
    waitMsg: "Linguistic analysis takes a few seconds!",
    grading: "AI is analyzing accuracy...",
    tryAgain: "Try Again",
    nextItem: "Next",
    analysis: "AI Detailed Analysis:",
    selectTopic: "Select Presentation Topic:",
    selectTopicHolder: "-- Click to select a topic --",
    reqLevel: "Requirement (Level {0}):",
    hintModel: "Suggested Model Speech:",
    uploadOrRec: "Upload or record your speech:",
    startGrading: "Start AI Grading",
    cancel: "✕ Cancel",
    aiRecognized: "AI has successfully recognized your voice.",
    gradeAnother: "Grade Another",
    exportPDF: "EXPORT PDF",
    reportTitle: "SPEAKING SKILL ASSESSMENT",
    analyzedBy: "Analyzed by Deutsch Spark Generative AI",
    student: "Student",
    originalAudio: "Original Recording:",
    avgScore: "Average Score / 10",
    rank: "RANK:",
    estimatedLevel: "ESTIMATED LEVEL:",
    systemAnalysis: "Feedback and advice from AI Teacher:",
    forgotPwd: "Forgot password?",
    forgotPwdDesc: "For security reasons, the system does not automatically reset passwords. Please send a password recovery request to:",
    sendEmail: "Send request email",
    cPronunciation: "Pronunciation",
    cFluency: "Fluency",
    cClarity: "Clarity",
    cContentAccuracy: "Content Accuracy",
    cPronunRhythm: "Pronunciation & Rhythm",
    cTopicRelevance: "Topic Relevance",
    cCompleteness: "Completeness",
    cGrammar: "Grammar",
    cVocabRichness: "Lexical Richness",
    cNaturalness: "Naturalness",
    cVocab: "Vocabulary",
    cIdeaDev: "Idea Development"
  }
};

const LanguageContext = createContext();

// --- HELPER: Parse pronunciation guide từ cú pháp [German|IPA/reading] ---
function PronunciationText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\[[^|]+\|[^\]]+\])/g);
  return (
    <span className="leading-loose break-words inline-block max-w-full">
      {parts.map((part, i) => {
        const match = part.match(/\[([^|]+)\|([^\]]+)\]/);
        if (match) {
          return (
            <ruby key={i} className="mx-0.5 whitespace-nowrap">
              {match[1]}<rt className="text-[0.55em] text-[#DD0000] font-medium tracking-tighter">{match[2]}</rt>
            </ruby>
          );
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      })}
    </span>
  );
}

// --- MOCK DATABASE ---
// Removed initialTopics and initialShadowing, now using Supabase

export default function App() {
  const [lang, setLang] = useState('vi'); // 'vi' or 'en'
  const t = (key) => dict[lang][key] || dict['vi'][key] || key;

  const [role, setRole] = useState('user');
  const [activeMode, setActiveMode] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [isForgotPwd, setIsForgotPwd] = useState(false);

  const [dbTopics, setDbTopics] = useState([]);
  const [dbShadowing, setDbShadowing] = useState([]);

  // Lưu trữ và lấy mật khẩu Admin từ localStorage
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('deutsch_admin_pwd') || 'admin123';
  });

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { background: white !important; }
        body * { visibility: hidden; }
        #printable-report, #printable-report * { visibility: visible; }
        #printable-report { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
        .no-print { display: none !important; }
      }
      .deutsch-bg { background-color: #f3f4f6; position: relative; min-height: 100vh; overflow-x: hidden; }
      .app-content { position: relative; z-index: 10; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('*');

        if (topicsError) throw topicsError;
        setDbTopics((topicsData || []).map(item => ({
          ...item,
          isPublished: item.isPublished ?? item.ispublished
        })));

        const { data: shadowingData, error: shadowingError } = await supabase
          .from('shadowing')
          .select('*');

        if (shadowingError) throw shadowingError;
        setDbShadowing((shadowingData || []).map(item => ({
          ...item,
          isPublished: item.isPublished ?? item.ispublished
        })));
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        alert('Lỗi khi tải dữ liệu từ cơ sở dữ liệu. Vui lòng thử lại.');
      }
    };

    fetchData();
  }, []);

  const handleAdminLogin = (password) => {
    if (password === adminPassword) { setRole('admin'); setActiveMode(null); }
    else { alert(lang === 'en' ? 'Wrong admin password!' : 'Sai mật khẩu quản trị!'); }
  };

  const handleModeSelect = (mode) => {
    if (!studentName.trim()) {
      alert(lang === 'en' ? "Please enter your name first!" : "Vui lòng nhập tên học viên trước khi bắt đầu!");
      document.getElementById('student-name-input')?.focus();
      return;
    }
    setActiveMode(mode);
  };

  const renderHome = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto mt-12 px-4 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-4">{t('welcome')}</h2>
        <p className="text-slate-600 font-medium flex items-center justify-center gap-2">
          {t('subtitle')} <Sparkles size={16} className="text-[#DD0000]" />
        </p>
      </div>

      <div className="mb-10 max-w-md mx-auto">
        <label className="block text-center font-bold text-slate-700 mb-3">{t('step1')}</label>
        <div className="bg-white/95 backdrop-blur-sm p-2 pl-5 rounded-2xl shadow-md border border-[#f0e0d8] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#DD0000]/50 transition-all">
          <User className={studentName.trim() ? "text-green-500 transition-colors" : "text-[#DD0000] transition-colors"} />
          <input
            id="student-name-input"
            type="text"
            placeholder={t('namePlaceholder')}
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="flex-1 bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium py-2"
          />
          {studentName.trim() && (
            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold animate-in zoom-in flex items-center gap-1">
              <CheckCircle2 size={14} /> {t('received')}
            </span>
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <label className="block font-bold text-slate-700">{t('step2')}</label>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <button onClick={() => handleModeSelect('shadowing')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#DD0000] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <MessageCircle size={40} className="text-[#DD0000] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('shadowingTitle')}</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">{t('shadowingDesc')}</p>
        </button>

        <button onClick={() => handleModeSelect('topic')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#DD0000] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <BookOpen size={40} className="text-[#DD0000] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('topicTitle')}</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">{t('topicDesc')}</p>
        </button>

        <button onClick={() => handleModeSelect('free')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#DD0000] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <Mic size={40} className="text-[#DD0000] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('freeTitle')}</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">{t('freeDesc')}</p>
        </button>
      </div>

      <div className="mt-16 text-center">
        <button onClick={() => setActiveMode('adminLogin')} className="text-xs text-slate-400 hover:text-[#DD0000] transition-colors underline decoration-dotted">
          {t('adminLink')}
        </button>
      </div>
    </div>
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="deutsch-bg text-slate-800 font-sans selection:bg-[#DD0000] selection:text-white">
        {/* NỀN ĐỨC: PRETZEL + DẢI MÀU CỜ ĐỨC */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-80"></div>
          <div className="absolute top-2 left-0 w-full h-2 bg-[#DD0000] opacity-80"></div>
          <div className="absolute top-4 left-0 w-full h-2 bg-[#FFCE00] opacity-90"></div>

          <div className="absolute top-16 right-[-4rem] md:right-12 w-72 h-72 opacity-20 rotate-12">
            <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-sm">
              <path d="M150 40 C110 40 92 76 106 106 C118 132 143 138 150 106 C157 138 182 132 194 106 C208 76 190 40 150 40 Z" fill="none" stroke="#8B5E34" strokeWidth="22" strokeLinecap="round"/>
              <path d="M98 118 C62 130 50 170 78 200 C108 232 150 194 150 154 C150 194 192 232 222 200 C250 170 238 130 202 118" fill="none" stroke="#8B5E34" strokeWidth="22" strokeLinecap="round"/>
              <path d="M76 206 C116 178 184 178 224 206" fill="none" stroke="#8B5E34" strokeWidth="22" strokeLinecap="round"/>
              <circle cx="92" cy="86" r="5" fill="#fff" opacity="0.9"/>
              <circle cx="205" cy="142" r="5" fill="#fff" opacity="0.9"/>
              <circle cx="129" cy="205" r="5" fill="#fff" opacity="0.9"/>
            </svg>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-36 opacity-25">
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="w-full h-full">
              <path fill="#111827" d="M0,220L1440,220L1440,120L0,160Z"></path>
              <path fill="#DD0000" d="M0,220L1440,220L1440,150L0,185Z"></path>
              <path fill="#FFCE00" d="M0,220L1440,220L1440,185L0,205Z"></path>
            </svg>
          </div>
        </div>

        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-[#f0e0d8] sticky top-0 z-50 app-content no-print">
          <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveMode(null); }}>
              {!logoError ? (
                <img src="171045151_1082518945577423_933278627676106455_n (4).png" alt="MVA Logo" className="h-8 w-auto object-contain" onError={() => setLogoError(true)} />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" fill="none" stroke="#DD0000" strokeWidth="12" strokeLinecap="butt" strokeLinejoin="miter" className="w-full h-full">
                    <path d="M 15 90 L 15 15 L 50 50 L 85 15 L 85 90" />
                    <path d="M 85 90 L 50 50" />
                  </svg>
                </div>
              )}
              <h1 className="font-bold text-xl tracking-tight hidden sm:block"><span className="text-[#DD0000]">DEUTSCH</span><span className="text-slate-800"> SPARK</span></h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switch */}
              <div className="flex bg-slate-100/80 rounded-full p-1 border border-slate-200">
                <button onClick={() => setLang('vi')} className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${lang === 'vi' ? 'bg-white shadow text-[#DD0000]' : 'text-slate-500'}`}>VI</button>
                <button onClick={() => setLang('en')} className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${lang === 'en' ? 'bg-white shadow text-[#DD0000]' : 'text-slate-500'}`}>EN</button>
              </div>

              {role === 'admin' ? (
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md hidden sm:flex">
                    <ShieldCheck size={14} /> {t('adminMode')}
                  </span>
                  <button onClick={() => { setRole('user'); setActiveMode(null); }} className="text-sm font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <LogOut size={16} className="sm:hidden" /><span className="hidden sm:block">{t('logout')}</span>
                  </button>
                </div>
              ) : (
                activeMode && activeMode !== 'adminLogin' && (
                  <button onClick={() => setActiveMode(null)} className="text-sm font-bold text-slate-500 hover:text-[#DD0000] flex items-center gap-1 transition-colors">
                    <RefreshCcw size={14} /> <span className="hidden sm:block">{t('changeMode')}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </header>

        <main className="app-content min-h-[calc(100vh-64px)]">
          {activeMode === 'adminLogin' && (
            <div className="max-w-sm mx-auto mt-20 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 animate-in fade-in zoom-in">
              <Lock className="text-[#DD0000] mx-auto mb-4" size={40} />
              <h2 className="text-xl font-bold text-center text-slate-800 mb-6">{isForgotPwd ? t('forgotPwd') : t('adminLoginTitle')}</h2>

              {isForgotPwd ? (
                <div className="text-center animate-in fade-in">
                  <p className="text-sm text-slate-600 mb-4">{t('forgotPwdDesc')}</p>
                  <p className="font-bold text-[#DD0000] mb-6">vananh.pham@minhvietacademy.org</p>
                  <a href="mailto:vananh.pham@minhvietacademy.org?subject=Yêu cầu khôi phục mật khẩu Admin - Deutsch Spark" className="block w-full bg-[#DD0000] text-white font-bold py-3 rounded-xl shadow hover:bg-[#B00000] mb-3 transition-colors">
                    {t('sendEmail')}
                  </a>
                  <button onClick={() => setIsForgotPwd(false)} className="w-full mt-2 text-sm text-slate-500 hover:text-slate-800">{t('backBtn')}</button>
                </div>
              ) : (
                <div className="animate-in fade-in">
                  <input
                    type="password" id="adminPwd" placeholder={t('passPlaceholder')}
                    className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:outline-none focus:border-[#DD0000]"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(document.getElementById('adminPwd').value) }}
                  />
                  <button onClick={() => handleAdminLogin(document.getElementById('adminPwd').value)} className="w-full bg-[#DD0000] text-white font-bold py-3 rounded-xl shadow hover:bg-[#B00000] mb-3 transition-colors">
                    {t('loginBtn')}
                  </button>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <button onClick={() => { setActiveMode(null); setIsForgotPwd(false); }} className="text-sm text-slate-500 hover:text-slate-800">{t('backBtn')}</button>
                    <button onClick={() => setIsForgotPwd(true)} className="text-sm text-[#DD0000] hover:underline font-medium">{t('forgotPwd')}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {role === 'admin' && !activeMode ? (
            <AdminPanel
              dbTopics={dbTopics} setDbTopics={setDbTopics}
              dbShadowing={dbShadowing} setDbShadowing={setDbShadowing}
              adminPassword={adminPassword} setAdminPassword={setAdminPassword}
            />
          ) : role === 'user' ? (
            <>
              {!activeMode && renderHome()}
              {activeMode === 'free' && <FreeAndTopicMode type="free" studentName={studentName} onRequireName={() => setActiveMode(null)} dbTopics={dbTopics} />}
              {activeMode === 'topic' && <FreeAndTopicMode type="topic" studentName={studentName} onRequireName={() => setActiveMode(null)} dbTopics={dbTopics} />}
              {activeMode === 'shadowing' && <ShadowingMode studentName={studentName} onRequireName={() => setActiveMode(null)} dbShadowing={dbShadowing} />}
            </>
          ) : null}
        </main>
      </div>
    </LanguageContext.Provider>
  );
}

// ---------------------------------------------------------
// COMPONENT: ADMIN PANEL
// ---------------------------------------------------------
function AdminPanel({ dbTopics, setDbTopics, dbShadowing, setDbShadowing, adminPassword, setAdminPassword }) {
  const [tab, setTab] = useState('topics');
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingShadow, setEditingShadow] = useState(null);
  const [shadowItemsText, setShadowItemsText] = useState('');

  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleChangePassword = () => {
    if (!newPwd || !confirmPwd) return alert("Vui lòng nhập đầy đủ mật khẩu mới!");
    if (newPwd !== confirmPwd) return alert("Mật khẩu xác nhận không khớp!");
    setAdminPassword(newPwd);
    localStorage.setItem('deutsch_admin_pwd', newPwd);
    alert("Đổi mật khẩu thành công!");
    setNewPwd('');
    setConfirmPwd('');
  };

  const saveTopic = async (isPublished) => {
    if (!editingTopic.title) { alert("Nhập tên chủ đề!"); return; }
    const newTopic = { ...editingTopic, isPublished };
    if (!newTopic.id) newTopic.id = 't_' + Date.now();

    try {
      const { error } = await supabase
        .from('topics')
        .upsert(toDbItem(newTopic));

      if (error) throw error;

      // Refresh data
      const { data: topicsData, error: fetchError } = await supabase
        .from('topics')
        .select('*');

      if (fetchError) throw fetchError;
      setDbTopics((topicsData || []).map(normalizeDbItem));

      setEditingTopic(null);
      alert("Lưu thành công!");
    } catch (error) {
      console.error('Error saving topic:', error);
      alert("Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    }
  };

  const saveShadow = async (isPublished) => {
    if (!editingShadow.title) { alert("Nhập tên bài học!"); return; }
    const parsedItems = shadowItemsText.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split('/').map(p => p.trim());
      return { jp: parts[0] || '', romaji: parts[1] || '', vi: parts[2] || '', en: parts[3] || '' };
    });
    const newShadow = { ...editingShadow, items: parsedItems, isPublished };
    if (!newShadow.id) newShadow.id = 's_' + Date.now();

    try {
      const { error } = await supabase
        .from('shadowing')
        .upsert(toDbItem(newShadow));

      if (error) throw error;

      // Refresh data
      const { data: shadowingData, error: fetchError } = await supabase
        .from('shadowing')
        .select('*');

      if (fetchError) throw fetchError;
      setDbShadowing((shadowingData || []).map(normalizeDbItem));

      setEditingShadow(null);
      alert("Lưu thành công!");
    } catch (error) {
      console.error('Error saving shadowing:', error);
      alert("Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    }
  };

  const toggleTopicPublish = async (id) => {
    const topic = dbTopics.find(t => t.id === id);
    if (!topic) return;

    try {
      const { error } = await supabase
        .from('topics')
        .update({ ispublished: !topic.isPublished })
        .eq('id', id);

      if (error) throw error;

      // Refresh data
      const { data: topicsData, error: fetchError } = await supabase
        .from('topics')
        .select('*');

      if (fetchError) throw fetchError;
      setDbTopics((topicsData || []).map(normalizeDbItem));
    } catch (error) {
      console.error('Error toggling topic publish:', error);
      alert("Lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const toggleShadowPublish = async (id) => {
    const shadow = dbShadowing.find(s => s.id === id);
    if (!shadow) return;

    try {
      const { error } = await supabase
        .from('shadowing')
        .update({ ispublished: !shadow.isPublished })
        .eq('id', id);

      if (error) throw error;

      // Refresh data
      const { data: shadowingData, error: fetchError } = await supabase
        .from('shadowing')
        .select('*');

      if (fetchError) throw fetchError;
      setDbShadowing((shadowingData || []).map(normalizeDbItem));
    } catch (error) {
      console.error('Error toggling shadowing publish:', error);
      alert("Lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn?")) return;

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh data
      const { data: topicsData, error: fetchError } = await supabase
        .from('topics')
        .select('*');

      if (fetchError) throw fetchError;
      setDbTopics((topicsData || []).map(normalizeDbItem));
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert("Lỗi khi xóa dữ liệu. Vui lòng thử lại.");
    }
  };

  const handleDeleteShadow = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn?")) return;

    try {
      const { error } = await supabase
        .from('shadowing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh data
      const { data: shadowingData, error: fetchError } = await supabase
        .from('shadowing')
        .select('*');

      if (fetchError) throw fetchError;
      setDbShadowing((shadowingData || []).map(normalizeDbItem));
    } catch (error) {
      console.error('Error deleting shadowing:', error);
      alert("Lỗi khi xóa dữ liệu. Vui lòng thử lại.");
    }
  };

  const startEditTopic = (t) => { setEditingTopic({ ...t }); };
  const startEditShadow = (s) => {
    setEditingShadow({ ...s });
    setShadowItemsText(s.items.map(i => `${i.jp} / ${i.romaji} / ${i.vi} ${i.en ? `/ ${i.en}` : ''}`).join('\n'));
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
          <button onClick={() => { setTab('topics'); setEditingTopic(null); }} className={`flex-1 py-4 font-bold text-center border-b-2 ${tab === 'topics' ? 'border-[#DD0000] text-[#DD0000] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Quản lý Chủ đề</button>
          <button onClick={() => { setTab('shadowing'); setEditingShadow(null); }} className={`flex-1 py-4 font-bold text-center border-b-2 ${tab === 'shadowing' ? 'border-[#DD0000] text-[#DD0000] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Quản lý Shadowing</button>
          <button onClick={() => setTab('settings')} className={`flex-1 py-4 font-bold text-center border-b-2 ${tab === 'settings' ? 'border-[#DD0000] text-[#DD0000] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Cài đặt</button>
        </div>
        <div className="p-8">

          {tab === 'settings' && (
            <div className="max-w-md mx-auto py-8 animate-in fade-in">
              <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2"><Lock className="text-[#DD0000]" /> Đổi mật khẩu Admin</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm font-medium mb-4 border border-yellow-200">
                  Mật khẩu sẽ được lưu trên trình duyệt hiện tại.
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                  <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:border-[#DD0000] outline-none" placeholder="Nhập mật khẩu mới..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:border-[#DD0000] outline-none" placeholder="Nhập lại mật khẩu..." />
                </div>
                <button onClick={handleChangePassword} className="w-full bg-[#DD0000] text-white font-bold py-3 rounded-xl hover:bg-[#B00000] shadow-md mt-4 transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {tab === 'topics' && (
            <div>
              {!editingTopic ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Kho Chủ đề</h3>
                    <button onClick={() => setEditingTopic({ id: 't_' + Date.now(), title: '', level: 'A1', req: '', isPublished: false, hint: { jp: '', romaji: '', vi: '', en: '' } })} className="bg-[#DD0000] text-white hover:bg-[#B00000] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md"><Plus size={18} /> Thêm mới</button>
                  </div>
                  <div className="space-y-4">
                    {dbTopics.map(topic => (
                      <div key={topic.id} className={`p-5 rounded-2xl border ${topic.isPublished ? 'border-slate-200 bg-white' : 'border-yellow-200 bg-yellow-50'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                          <div>
                            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded mr-2">{topic.level}</span>
                            <h4 className="font-bold text-lg text-[#DD0000] inline-block">{topic.title}</h4>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => toggleTopicPublish(topic.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${topic.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{topic.isPublished ? <><Eye size={14} /> Công khai</> : <><EyeOff size={14} /> Nháp</>}</button>
                            <button onClick={() => startEditTopic(topic)} className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">Sửa</button>
                            <button onClick={() => handleDeleteTopic(topic.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center gap-1"><Trash2 size={14} /> Xóa</button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 truncate">{topic.req}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-xl text-slate-800">Soạn thảo Chủ đề</h3>
                    <button onClick={() => setEditingTopic(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Tên chủ đề</label><input type="text" value={editingTopic.title} onChange={e => setEditingTopic({ ...editingTopic, title: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Cấp độ</label>
                      <select value={editingTopic.level} onChange={e => setEditingTopic({ ...editingTopic, level: e.target.value })} className="w-full p-3 border rounded-xl">
                        <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option><option value="C1">C1</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4"><label className="block text-sm font-bold text-slate-700 mb-1">Yêu cầu</label><textarea value={editingTopic.req} onChange={e => setEditingTopic({ ...editingTopic, req: e.target.value })} className="w-full p-3 border rounded-xl h-20" /></div>
                  <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
                    <label className="block text-sm font-bold text-slate-800 border-b pb-2">Bài nói mẫu</label>
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs font-medium border border-yellow-200">
                      Có thể nhập trực tiếp tiếng Đức. Nếu cần chú thích phát âm, dùng: <code>[Deutsch|pronunciation]</code>
                    </div>
                    <div><label className="block text-xs font-bold mb-1">Tiếng Đức</label><textarea value={editingTopic.hint.jp} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, jp: e.target.value } })} className="w-full p-2 border rounded-lg h-24" placeholder="VD: Guten Morgen. Ich heiße Anna." /></div>
                    <div><label className="block text-xs font-bold mb-1">Gợi ý đọc</label><input type="text" value={editingTopic.hint.romaji} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, romaji: e.target.value } })} className="w-full p-2 border rounded-lg" /></div>
                    <div><label className="block text-xs font-bold mb-1">Tiếng Việt</label><input type="text" value={editingTopic.hint.vi} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, vi: e.target.value } })} className="w-full p-2 border rounded-lg" /></div>
                    <div><label className="block text-xs font-bold mb-1">Tiếng Anh (Cho giao diện EN)</label><input type="text" value={editingTopic.hint.en || ''} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, en: e.target.value } })} className="w-full p-2 border rounded-lg" /></div>
                  </div>
                  <div className="flex gap-4 mt-8 pt-4 border-t"><button onClick={() => saveTopic(false)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">Lưu Nháp</button><button onClick={() => saveTopic(true)} className="flex-1 bg-[#DD0000] text-white py-3 rounded-xl font-bold">Lưu & Public</button></div>
                </div>
              )}
            </div>
          )}

          {tab === 'shadowing' && (
            <div>
              {!editingShadow ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Kho Shadowing</h3>
                    <button onClick={() => { setEditingShadow({ id: 's_' + Date.now(), title: '', level: 'A1', type: 'sentence', isPublished: false, items: [] }); setShadowItemsText(''); }} className="bg-[#DD0000] text-white px-4 py-2 rounded-lg font-bold text-sm"><Plus size={18} className="inline" /> Thêm mới</button>
                  </div>
                  <div className="space-y-4">
                    {dbShadowing.map(shadow => (
                      <div key={shadow.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${shadow.isPublished ? 'border-slate-200 bg-white' : 'border-yellow-200 bg-yellow-50'}`}>
                        <div>
                          <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded mr-2">{shadow.level}</span>
                          <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded mr-2">{shadow.type === 'vocab' ? 'Từ vựng' : 'Câu'}</span>
                          <h4 className="font-bold text-lg inline">{shadow.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{shadow.items.length} hạng mục</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => toggleShadowPublish(shadow.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${shadow.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{shadow.isPublished ? 'Public' : 'Nháp'}</button>
                          <button onClick={() => startEditShadow(shadow)} className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">Sửa</button>
                          <button onClick={() => handleDeleteShadow(shadow.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-xl text-slate-800">Soạn thảo Bài học Shadowing</h3>
                    <button onClick={() => setEditingShadow(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div><label className="block text-sm font-bold mb-1">Cấp độ</label><select value={editingShadow.level} onChange={e => setEditingShadow({ ...editingShadow, level: e.target.value })} className="w-full p-3 border rounded-xl"><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option><option value="C1">C1</option></select></div>
                    <div><label className="block text-sm font-bold mb-1">Loại</label><select value={editingShadow.type} onChange={e => setEditingShadow({ ...editingShadow, type: e.target.value })} className="w-full p-3 border rounded-xl"><option value="sentence">Câu văn</option><option value="vocab">Từ vựng</option></select></div>
                    <div><label className="block text-sm font-bold mb-1">Tên bài học</label><input type="text" value={editingShadow.title} onChange={e => setEditingShadow({ ...editingShadow, title: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Danh sách Từ vựng / Câu</label>
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm font-medium mb-3 border border-yellow-200 shadow-inner">
                      <p className="mb-2"><strong>Cú pháp bắt buộc:</strong> <code>Tiếng Đức / Gợi ý đọc / Tiếng Việt / Tiếng Anh</code> (Ngăn cách bằng dấu <code>/</code>)</p>
                      <p className="mb-2"><strong>Chú thích Furigana:</strong> <code>[Từ tiếng Đức|phiên âm/gợi ý đọc]</code></p>
                      <ul className="list-disc pl-5 space-y-1 mt-2 text-xs opacity-90">
                        <li>VD Từ vựng: <code>Schule / SHOO-luh / Trường học / School</code></li>
                        <li>VD Câu văn: <code>Guten Morgen. / GOO-ten MOR-gen / Chào buổi sáng. / Good morning.</code></li>
                      </ul>
                    </div>
                    <textarea value={shadowItemsText} onChange={e => setShadowItemsText(e.target.value)} className="w-full p-4 border rounded-xl h-64 font-mono text-sm leading-relaxed" placeholder="Schule / SHOO-luh / Trường học / School" />
                  </div>
                  <div className="flex gap-4 mt-8 pt-4 border-t"><button onClick={() => saveShadow(false)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">Lưu Nháp</button><button onClick={() => saveShadow(true)} className="flex-1 bg-[#DD0000] text-white py-3 rounded-xl font-bold">Lưu & Public</button></div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


function looksMostlyNonGerman(transcript = '') {
  const text = transcript.toLowerCase().trim();
  if (!text) return false;
  const germanSignals = /\b(ich|du|er|sie|wir|ihr|bin|bist|ist|sind|heiße|heisse|habe|hast|hat|guten|morgen|danke|bitte|tschüss|schule|deutsch|lernen|spreche|möchte|moechte|für|fuer|nicht|und|aber|oder|ein|eine|der|die|das|zu|mit)\b|[äöüß]/i;
  const vietnameseSignals = /[ăâêôơưđàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;
  return !germanSignals.test(text) && vietnameseSignals.test(text);
}

// ---------------------------------------------------------
// ENGINE CHẤM ĐIỂM GENERATIVE AI (THÔNG MINH)
// ---------------------------------------------------------

function generateGradingResultFallback(transcript, expectedRawText, level, mode, lang, t) {
  const clamp = (val) => Math.min(10.0, Math.max(0.0, parseFloat(val) || 0)).toFixed(1);

  // CẢI TIẾN FALLBACK: Trích xuất cả Kanji và Hiragana để so khớp (Đề phòng STT trả về Hiragana)
  const cleanExpectedKanji = expectedRawText ? expectedRawText.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1').replace(/[。、！？\s]/g, '') : '';
  const cleanExpectedHiragana = expectedRawText ? expectedRawText.replace(/\[([^|]+)\|([^\]]+)\]/g, '$2').replace(/[。、！？\s]/g, '') : '';
  const cleanTranscript = transcript ? transcript.replace(/[。、！？\s]/g, '') : '';

  let finalScore = 5.0;
  let criteriaObj = {};
  let estimatedLevel = '';

  if (mode === 'vocab' || mode === 'sentence') {
    let matchCount = 0;
    // Gộp Kanji và Hiragana lại để kiểm tra xem STT trả về dạng nào cũng bắt được
    const targetString = cleanExpectedKanji + cleanExpectedHiragana;
    for (let char of cleanTranscript) { if (targetString.includes(char)) matchCount++; }

    const matchRate = Math.min(1.0, matchCount / Math.max(1, cleanExpectedKanji.length));
    finalScore = matchRate * 10;
    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore),
      [t('cFluency')]: clamp(finalScore + 0.5)
    };
  } else if (mode === 'topic') {
    if (cleanTranscript.length < 15) {
      finalScore = 4.0;
    } else {
      finalScore = Math.min(9.5, 6.0 + (cleanTranscript.length / 40));
    }
    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore - 0.5),
      [t('cTopicRelevance')]: clamp(finalScore + 0.2),
      [t('cCompleteness')]: clamp(finalScore),
      [t('cFluency')]: clamp(finalScore + 0.4),
      [t('cGrammar')]: clamp(finalScore - 0.3),
      [t('cVocabRichness')]: clamp(finalScore + 0.3),
      [t('cNaturalness')]: clamp(finalScore - 0.4)
    };
  } else {
    finalScore = Math.min(9.5, 5.0 + (cleanTranscript.length / 50));
    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore - 0.5),
      [t('cFluency')]: clamp(finalScore),
      [t('cGrammar')]: clamp(finalScore - 0.3)
    };
    if (cleanTranscript.length > 100) estimatedLevel = 'B2';
    else if (cleanTranscript.length > 50) estimatedLevel = 'B1';
    else if (cleanTranscript.length > 20) estimatedLevel = 'A2';
    else estimatedLevel = 'A1';
  }

  return {
    score: clamp(finalScore),
    level: lang === 'en' ? (finalScore > 8 ? 'Good' : 'Needs Practice') : (finalScore > 8 ? 'Giỏi' : 'Cần luyện thêm'),
    estimated_cefr: estimatedLevel,
    criteria: criteriaObj,
    feedback: lang === 'en' ? "This is a basic evaluation. Please connect to internet for full AI Analysis." : "Đây là đánh giá cơ bản. Hãy kết nối mạng để AI Phân tích chi tiết lỗi ngữ pháp và phát âm."
  };
}

const evaluateWithGemini = async (transcript, expectedText, level, mode, lang, requirement = '') => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const systemPrompt = `Bạn là một giáo viên tiếng Đức giàu kinh nghiệm chuyên dạy phát âm, speaking và giao tiếp thực tế cho người học ngoại ngữ.
Language for feedback: ${lang === 'en' ? 'English' : 'Vietnamese'}.
Task Mode: ${mode} (vocab = single word, sentence = shadowing, topic = presentation, free = unstructured speech).
Student CEFR Target Level: ${level}.
Topic Requirement: "${requirement || 'None'}"
Model Answer / Expected German Text: "${expectedText || 'None'}"
Student's Voice Transcript: "${transcript}"

CRITICAL LANGUAGE CHECK:
- This app is ONLY for German speaking practice.
- If the transcript is mainly Vietnamese, English, Japanese, Chinese, Spanish, French, or any language unrelated to the German task, do not grade normally.
- In that case, return a low score and clearly tell the learner: ${lang === 'en' ? 'Please speak German for this activity.' : 'Bạn vui lòng nói bằng tiếng Đức đúng theo nội dung luyện tập. Hệ thống chỉ chấm phần nói tiếng Đức.'}
- If the learner uses a tiny amount of Vietnamese/English only as filler, but the main answer is German, continue grading.

German pronunciation calibration:
1. Evaluate like a real German pronunciation teacher, not like a mechanical speech recognition system.
2. German natural speech includes sentence rhythm, reduction, connected speech, stress patterns, and sentence melody.
3. In WORD MODE, check short/long vowels, umlauts ä/ö/ü, final consonants, ch, r, and word stress more carefully.
4. In SENTENCE/TOPIC/FREE MODE, prioritize naturalness, fluency, rhythm, stress pattern, and comprehensibility. Do not punish natural connected speech too harshly.
5. If the learner speaks too slowly, word-by-word, or robotically, lower the naturalness/fluency score even if individual sounds are acceptable.
6. Give concrete error analysis: exact word/sound, what is wrong, severity, and practical correction.
7. When writing Vietnamese feedback, always use "bạn". Do not use "em", "thầy", "cô", "mình", or "tôi".

Return ONLY a JSON object matching this schema:
{
  "score": "Overall score from 0.0 to 10.0, e.g. 8.5",
  "level": "Performance rank. English: Excellent/Good/Fair/Needs Practice. Vietnamese: Xuất sắc/Giỏi/Khá/Cần cố gắng",
  "estimated_cefr": "Estimated CEFR level A1/A2/B1/B2/C1. Mandatory for free mode, otherwise empty.",
  "feedback": "Detailed, personalized feedback with specific German pronunciation/speaking advice.",
  "pronunciation_score": "0.0 to 10.0 string",
  "fluency_score": "0.0 to 10.0 string",
  "accuracy_score": "0.0 to 10.0 string",
  "grammar_score": "0.0 to 10.0 string",
  "vocab_score": "0.0 to 10.0 string",
  "naturalness_score": "0.0 to 10.0 string",
  "severity": "minor/moderate/major",
  "errors": [
    {"word":"ich", "issue":"Âm ch hơi cứng", "severity":"minor", "suggestion":"Để luồng hơi nhẹ hơn giữa lưỡi và vòm miệng."}
  ]
}`;


  if (looksMostlyNonGerman(transcript)) {
    return {
      score: '2.0',
      level: lang === 'en' ? 'Needs Practice' : 'Cần cố gắng',
      estimated_cefr: '',
      feedback: lang === 'en'
        ? 'This activity is for German practice. Please speak German and stay on the assigned topic.'
        : 'Bạn vui lòng nói bằng tiếng Đức và bám sát nội dung luyện tập. Hệ thống chỉ chấm phần nói tiếng Đức.',
      pronunciation_score: '2.0',
      fluency_score: '2.0',
      accuracy_score: '2.0',
      grammar_score: '2.0',
      vocab_score: '2.0'
    };
  }

  const payload = {
    model: "gpt-4.1-nano",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Grade this student's German speech based on the transcript provided." }
    ],
    temperature: 0.2,
    max_tokens: 800
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let attempt = 0; attempt <= 5; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`API Error ${res.status}`);

      const data = await res.json();
      const textRes = data.choices?.[0]?.message?.content;

      if (textRes) {
        const match = textRes.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch (parseErr) {
            console.error("JSON Parse Error", parseErr);
            throw new Error("Invalid JSON format");
          }
        }
        throw new Error("No JSON object found");
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      if (attempt === 5) return null;
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    }
  }
  return null;
};

// ---------------------------------------------------------
// COMPONENT: THU ÂM (TÍCH HỢP SPEECH RECOGNITION + OPENAI )
// ---------------------------------------------------------

export const AudioInput = ({ onAudioReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // 🎧 Recorder ổn định
  const createRecorder = (stream) => {
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return new MediaRecorder(stream, { mimeType: "audio/mp4" });
    }
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      return new MediaRecorder(stream, { mimeType: "audio/webm" });
    }
    return new MediaRecorder(stream);
  };

  // 🧠 OpenAI transcribe
  const transcribe = async (file) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "gpt-4o-mini-transcribe");
    formData.append("language", "de");

    const res = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Transcribe failed");

    const data = await res.json();
    return data.text;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = createRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        });

        const file = new File([blob], "recorded.mp4", {
          type: blob.type,
        });

        let finalTranscript = null;

        try {
          finalTranscript = await transcribe(file);

          // 🔥 CHỈ log sau khi có kết quả
          console.log("✅ AI RESULT:", finalTranscript);
        } catch (err) {
          console.log("❌ OpenAI error:", err);
        }

        onAudioReady(
          file,
          URL.createObjectURL(blob),
          finalTranscript,
          false
        );

        clearInterval(timerRef.current);
        setRecordingTime(0);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Không thể truy cập microphone");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    recorder.stream.getTracks().forEach((t) => t.stop());

    setIsRecording(false);
  };

  const handleFileChange = (e) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    onAudioReady(file, URL.createObjectURL(file), null, true);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Upload */}
      <div
        onClick={() =>
          !isRecording && document.getElementById("file-upload").click()
        }
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group bg-white border-slate-300 hover:border-[#DD0000]/50 ${
          isRecording ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <input
          id="file-upload"
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Upload
          size={28}
          className="text-[#DD0000] mb-3 group-hover:-translate-y-1 transition-transform"
        />
        <h3 className="font-bold text-slate-800">Tải file lên</h3>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống sẽ giả lập chấm điểm
        </p>
      </div>

      {/* Record */}
      <div
        className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 ${
          isRecording
            ? "border-[#DD0000] bg-[#fff0f5] shadow-inner"
            : "border-[#DD0000]/30 bg-yellow-50/30 relative overflow-hidden"
        }`}
      >
        {!isRecording && (
          <div className="absolute top-0 right-0 bg-[#DD0000] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
            Khuyên dùng AI
          </div>
        )}

        {isRecording ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-lg font-bold text-[#DD0000]">
                {Math.floor(recordingTime / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {(recordingTime % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center gap-2 px-6 font-bold text-sm transition-transform active:scale-95"
            >
              <Square size={16} fill="currentColor" /> DỪNG THU
            </button>
          </>
        ) : (
          <>
            <Mic size={28} className="text-[#DD0000] mb-3" />
            <h3 className="font-bold text-slate-800 mb-2">
              Thu âm trực tiếp
            </h3>
            <button
              onClick={startRecording}
              className="bg-[#DD0000] hover:bg-[#B00000] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
            >
              Chấm điểm bằng giọng nói
            </button>
          </>
        )}
      </div>
    </div>
  );
};


// ---------------------------------------------------------
// COMPONENT: NÓI TỰ DO & NÓI THEO CHỦ ĐỀ
// ---------------------------------------------------------
function FreeAndTopicMode({ type, studentName, onRequireName, dbTopics }) {
  const { lang, t } = useContext(LanguageContext);
  const [step, setStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const [isPlayingModel, setIsPlayingModel] = useState(false);

  const publishedTopics = dbTopics.filter(t => {
    if (t.isPublished === undefined || t.isPublished === null) return true;
    return t.isPublished === true || t.isPublished === 'true' || t.isPublished === 1 || t.isPublished === '1';
  });
  const currentTopic = publishedTopics.find(t => t.id === selectedTopicId);

  useEffect(() => { if (!studentName) onRequireName(); }, []);

  const playModelAudio = (textRaw, speedMode = 'normal') => {
    if (!('speechSynthesis' in window)) { alert("TTS not supported in your browser."); return; }

    // Đổi $1 (Kanji) thành $2 (Hiragana) để máy đọc chuẩn xác 100% cách phát âm đã quy định
    const cleanText = textRaw.replace(/\[([^|]+)\|([^\]]+)\]/g, '$2');
    setIsPlayingModel(speedMode);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';

    if (speedMode === 'slow') {
      utterance.rate = 0.35;
    } else {
      const rateMap = { 'A1': 0.8, 'A2': 0.9, 'B1': 1.0, 'B2': 1.05, 'C1': 1.1 };
      utterance.rate = currentTopic ? (rateMap[currentTopic.level] || 1.0) : 1.0;
    }

    utterance.onend = () => setIsPlayingModel(false);
    utterance.onerror = () => setIsPlayingModel(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAudioReady = (file, url, text, isFile) => {
    setSelectedFile(file);
    setFileUrl(url);
    setTranscript(text);
    setIsFileUpload(isFile);
  };

  const startGrading = async () => {
    if (type === 'topic' && !selectedTopicId) { alert(lang === 'en' ? "Please select a topic!" : "Vui lòng chọn một chủ đề!"); return; }
    if (!selectedFile) { alert(lang === 'en' ? "Please provide audio!" : "Vui lòng tải lên hoặc thu âm bài nói!"); return; }

    setStep(1); // Cập nhật state để hiển thị màn hình loading

    try {
      // Đợi 0.5s để React ưu tiên hiển thị UI màn hình Đang Tải trước khi khối lệnh chấm điểm chạy
      await new Promise(r => setTimeout(r, 500));

      let finalResult;
      if (isFileUpload) {
        const baseScore = 6.0 + Math.random() * 3.0;
        const clamp = (val) => Math.min(10.0, Math.max(0.0, parseFloat(val) || 0)).toFixed(1);
        finalResult = {
          score: clamp(baseScore),
          level: lang === 'en' ? (baseScore >= 8 ? 'Good' : 'Fair') : (baseScore >= 8 ? 'Giỏi' : 'Khá'),
          criteria: {
            [t('cPronunciation')]: clamp(baseScore - 0.2),
            [t('cFluency')]: clamp(baseScore)
          },
          feedback: lang === 'en'
            ? `[AUDIO FILE UPLOAD MODE]\nDue to browser limits, detailed pronunciation errors cannot be extracted from uploaded files. Use "Direct Record" for full AI capabilities.`
            : `[CHÚ Ý: BẠN ĐANG TẢI FILE ÂM THANH]\nDo hạn chế của trình duyệt, hệ thống không thể bóc tách từng lỗi ngữ âm chính xác từ file có sẵn. Hãy dùng nút "Thu âm trực tiếp" để AI đọc chính xác từng từ bạn nói nhé!`
        };
      } else {
        const expectedText = type === 'topic' ? currentTopic?.hint?.jp || '' : '';
        const topicRequirement = type === 'topic' ? currentTopic?.req || '' : '';
        const levelTarget = type === 'topic' ? currentTopic?.level || 'B1' : 'B1';

        // SỬA LỖI: Cho phép nhận diện cả những từ có 1 ký tự (độ dài === 0 mới báo lỗi)
        if (!transcript || transcript.trim().length === 0) {
          finalResult = {
            score: '2.0', level: lang === 'en' ? 'Needs Practice' : 'Cần luyện tập thêm',
            criteria: { [t('cPronunciation')]: '2.0', [t('cFluency')]: '2.0' },
            feedback: lang === 'en' ? 'The system could not clearly recognize what you said. Please check your microphone and speak louder.' : 'Hệ thống không nhận diện rõ bạn nói gì. Vui lòng kiểm tra Micro và thử nói lớn hơn nhé.'
          };
        } else {
          const apiRes = await evaluateWithGemini(transcript, expectedText, levelTarget, type, lang, topicRequirement);
          if (apiRes) {
            finalResult = {
              score: apiRes.score,
              level: apiRes.level,
              estimated_cefr: apiRes.estimated_cefr || '',
              criteria: {
                [t('cPronunciation')]: apiRes.pronunciation_score || "0.0",
                [t('cFluency')]: apiRes.fluency_score || "0.0",
              },
              feedback: apiRes.feedback
            };
            if (type === 'topic') {
              finalResult.criteria[t('cGrammar')] = apiRes.grammar_score || "0.0";
              finalResult.criteria[t('cVocabRichness')] = apiRes.vocab_score || "0.0";
              finalResult.criteria[t('cTopicRelevance')] = apiRes.accuracy_score || "0.0";
            } else {
              finalResult.criteria[t('cGrammar')] = apiRes.grammar_score || "0.0";
              finalResult.criteria[t('cIdeaDev')] = apiRes.vocab_score || "0.0";
            }
          } else {
            // Fallback an toàn nếu API quá tải
            finalResult = generateGradingResultFallback(transcript, expectedText, levelTarget, type, lang, t);
          }
        }
      }

      setResult(finalResult);
      setStep(2);
    } catch (error) {
      console.error("Lỗi khi đánh giá:", error);
      const expectedText = type === 'topic' ? currentTopic?.hint?.jp || '' : '';
      const levelTarget = type === 'topic' ? currentTopic?.level || 'B1' : 'B1';
      setResult(generateGradingResultFallback(transcript, expectedText, levelTarget, type, lang, t));
      setStep(2);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      {step === 0 && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-[#f0e0d8]">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            {type === 'topic' ? <BookOpen className="text-[#DD0000]" /> : <Mic className="text-[#DD0000]" />}
            {type === 'topic' ? t('topicTitle') : t('freeTitle')}
          </h2>

          {type === 'topic' && (
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('selectTopic')}</label>
              <select value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} className="w-full p-4 rounded-xl border border-slate-300 bg-white focus:border-[#DD0000] focus:ring-2 focus:ring-[#DD0000]/20 outline-none font-medium text-slate-800 transition-all cursor-pointer shadow-sm">
                <option value="">{t('selectTopicHolder')}</option>
                {publishedTopics.map(tData => <option key={tData.id} value={tData.id}>[{tData.level}] {tData.title}</option>)}
              </select>

              {publishedTopics.length === 0 && (
                <div className="mt-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                  Hiện chưa có chủ đề nào được công khai. Vui lòng kiểm tra dữ liệu topic trong Supabase hoặc bật trường <strong>isPublished</strong>.
                </div>
              )}

              {currentTopic && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-slate-700">
                    <span className="font-bold text-[#DD0000] flex items-center gap-1 mb-1"><Star size={14} /> {t('reqLevel').replace('{0}', currentTopic.level)}</span>
                    <p className="leading-relaxed">{currentTopic.req}</p>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm relative">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 border-b pb-3">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <BookA size={16} className="text-blue-500" /> {t('hintModel')}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => playModelAudio(currentTopic.hint.jp, 'slow')} disabled={isPlayingModel !== false} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1 ${isPlayingModel === 'slow' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-300 hover:border-[#DD0000] hover:text-[#DD0000] text-slate-600'}`}>
                          <Volume1 size={14} /> {t('listenSlow')}
                        </button>
                        <button onClick={() => playModelAudio(currentTopic.hint.jp, 'normal')} disabled={isPlayingModel !== false} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1 ${isPlayingModel === 'normal' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-300 hover:border-[#DD0000] hover:text-[#DD0000] text-slate-600'}`}>
                          <Volume2 size={14} /> {t('listenNormal')}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-slate-900 tracking-wide break-words">
                        <PronunciationText text={currentTopic.hint.jp} />
                      </div>
                      <p className="text-sm font-mono text-[#DD0000] leading-relaxed mt-2 pt-2 border-t border-slate-100">{currentTopic.hint.romaji}</p>
                      <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3 leading-relaxed mt-2">{currentTopic.hint[lang] || currentTopic.hint.vi}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-6 mt-8 pt-6 border-t border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-3">{t('uploadOrRec')}</label>
            {!selectedFile ? (
              <AudioInput onAudioReady={handleAudioReady} />
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center relative shadow-sm">
                <button onClick={() => { setSelectedFile(null); setFileUrl(null); setTranscript(null) }} className="absolute top-3 right-4 text-sm text-slate-500 hover:text-red-500 font-bold transition-colors">{t('cancel')}</button>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm"><CheckCircle2 size={24} /></div>
                <p className="font-medium text-slate-800 text-center mb-1 px-8 truncate w-full">{selectedFile.name}</p>
                {!isFileUpload && transcript && <p className="text-xs text-green-700 italic mb-3">{t('aiRecognized')}</p>}
                <audio controls src={fileUrl} className="w-full max-w-sm rounded-lg" />
              </div>
            )}
          </div>

          <button onClick={startGrading} className="w-full mt-6 bg-[#DD0000] hover:bg-[#B00000] text-white font-black tracking-wide py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all flex justify-center items-center gap-2">
            <Sparkles size={18} /> {t('startGrading')}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white/90 backdrop-blur-md rounded-3xl border border-[#f0e0d8] shadow-xl">
          <Activity size={64} className="text-[#DD0000] animate-bounce mb-4" />
          <h2 className="font-bold text-xl text-slate-800">{t('aiEvaluating')}</h2>
          <p className="text-slate-500 text-sm mt-2">{t('waitMsg')}</p>
        </div>
      )}

      {step === 2 && result && (
        <ReportCard result={result} studentName={studentName} fileUrl={fileUrl} onReset={() => { setStep(0); setSelectedFile(null); }} />
      )}
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: SHADOWING 
// ---------------------------------------------------------
function ShadowingMode({ studentName, onRequireName, dbShadowing }) {
  const { lang, t } = useContext(LanguageContext);
  const [setupStep, setSetupStep] = useState(true);
  const [level, setLevel] = useState('A1');
  const [type, setType] = useState('sentence');

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [recordedFile, setRecordedFile] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [sentenceResult, setSentenceResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPlayingModel, setIsPlayingModel] = useState(false);

  useEffect(() => { if (!studentName) onRequireName(); }, []);

  useEffect(() => {
    const normalizedLevel = String(level || '').trim().toUpperCase();
    const levelLessons = dbShadowing.filter(item => {
      const published = item.isPublished ?? item.ispublished;
      const itemLevel = String(item.level || '').trim().toUpperCase();
      const isPublished = published === true || published === 'true' || published === 1 || published === '1';
      return isPublished && itemLevel === normalizedLevel;
    });

    const selectedTypeExists = levelLessons.some(item => String(item.type || '').trim().toLowerCase() === type);
    if (!selectedTypeExists && levelLessons.length > 0) {
      setType(String(levelLessons[0].type || '').trim().toLowerCase() || 'vocab');
    }
  }, [level, dbShadowing, type]);

  const lessons = dbShadowing.filter(item => {
    const published = item.isPublished ?? item.ispublished;
    const itemLevel = String(item.level || '').trim().toUpperCase();
    const itemType = String(item.type || '').trim().toLowerCase();
    const isPublished = published === true || published === 'true' || published === 1 || published === '1';
    return isPublished && itemLevel === level && itemType === type;
  });

  const startPractice = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentIndex(0);
    setSetupStep(false);
  };

  const playModelAudio = (textRaw, speedMode = 'normal') => {
    if (!('speechSynthesis' in window)) { return; }

    // Đổi $1 (Kanji) thành $2 (Hiragana) để máy đọc chuẩn xác 100% cách phát âm đã quy định
    const cleanText = textRaw.replace(/\[([^|]+)\|([^\]]+)\]/g, '$2');
    setIsPlayingModel(speedMode);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';

    if (speedMode === 'slow') {
      utterance.rate = 0.35;
    } else {
      const rateMap = { 'A1': 0.8, 'A2': 0.9, 'B1': 1.0, 'B2': 1.05, 'C1': 1.1 };
      utterance.rate = rateMap[level] || 1.0;
    }

    utterance.onend = () => setIsPlayingModel(false);
    utterance.onerror = () => setIsPlayingModel(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAudioReady = async (file, url, transcriptStr, isFile) => {
    setRecordedFile(file);
    setRecordedUrl(url);
    setIsEvaluating(true);

    try {
      // Đợi 0.5s để UI "Đang phân tích" kịp hiển thị trước khi gọi AI
      await new Promise(r => setTimeout(r, 500));

      let res;
      if (isFile) {
        res = {
          score: '7.5', level: lang === 'en' ? 'Fair' : 'Khá',
          criteria: { [t('cPronunciation')]: '7.5', [t('cFluency')]: '7.5' },
          feedback: lang === 'en' ? "Use Direct Record for accurate evaluation." : "[CHẾ ĐỘ TẢI FILE]\nHệ thống không thể bóc tách lỗi chi tiết từ file ghi âm tải lên. Hãy dùng Thu âm trực tiếp."
        };
      } else {
        const currentItem = selectedLesson.items[currentIndex];

        // SỬA LỖI: Cho phép nhận diện cả những từ vựng có 1 chữ Hán (length === 0 mới báo lỗi)
        if (!transcriptStr || transcriptStr.trim().length === 0) {
          res = {
            score: '2.0', level: lang === 'en' ? 'Needs Practice' : 'Cần luyện tập thêm',
            criteria: { [t('cPronunciation')]: '2.0', [t('cFluency')]: '2.0' },
            feedback: lang === 'en' ? 'The system could not clearly recognize what you said. Please check your microphone and speak louder.' : 'Hệ thống không nhận diện rõ bạn nói gì. Vui lòng kiểm tra Micro và thử nói lớn hơn nhé.'
          };
        } else {
          const apiRes = await evaluateWithGemini(transcriptStr, currentItem.jp, level, type, lang);
          if (apiRes) {
            res = {
              score: apiRes.score,
              level: apiRes.level,
              criteria: {
                [t('cPronunciation')]: apiRes.pronunciation_score || "0.0",
                [t('cFluency')]: apiRes.fluency_score || "0.0",
                [t('cContentAccuracy')]: apiRes.accuracy_score || "0.0"
              },
              feedback: apiRes.feedback
            };
          } else {
            // Fallback an toàn nếu API quá tải
            res = generateGradingResultFallback(transcriptStr, currentItem.jp, level, type, lang, t);
          }
        }
      }
      setSentenceResult(res);
    } catch (error) {
      console.error("Shadowing Error:", error);
      const currentItem = selectedLesson.items[currentIndex];
      setSentenceResult(generateGradingResultFallback(transcriptStr, currentItem.jp, level, type, lang, t));
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextItem = () => {
    setRecordedFile(null); setRecordedUrl(null); setSentenceResult(null);
    setCurrentIndex(prev => prev + 1);
  };

  if (setupStep) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-[#f0e0d8] animate-in fade-in pb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MessageCircle className="text-[#DD0000]" /> {t('shadowingTitle')}
        </h2>

        <div className="mb-6">
          <label className="block font-bold text-slate-700 mb-2">{t('chooseLevel')}</label>
          <div className="flex gap-2 flex-wrap">
            {['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
              <button key={lvl} onClick={() => setLevel(lvl)} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${level === lvl ? 'bg-[#DD0000] text-white border-[#DD0000] shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:border-[#DD0000]'}`}>
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block font-bold text-slate-700 mb-2">{t('chooseType')}</label>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setType('vocab')} className={`py-4 rounded-xl font-bold border flex flex-col items-center justify-center gap-2 transition-all ${type === 'vocab' ? 'bg-yellow-50 border-[#DD0000] text-[#DD0000]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#DD0000]'}`}>
              <span className="text-2xl">WORT</span>{t('vocab')}
            </button>
            <button onClick={() => setType('sentence')} className={`py-4 rounded-xl font-bold border flex flex-col items-center justify-center gap-2 transition-all ${type === 'sentence' ? 'bg-yellow-50 border-[#DD0000] text-[#DD0000]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#DD0000]'}`}>
              <span className="text-2xl">SATZ</span>{t('sentence')}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="block font-bold text-slate-700 mb-2">{t('chooseLesson')}</label>
          {lessons.length === 0 ? (
            <p className="text-sm text-red-500 italic">{t('noLesson')}</p>
          ) : (
            <div className="space-y-3">
              {lessons.map(lesson => (
                <button key={lesson.id} onClick={() => startPractice(lesson)} className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-[#DD0000] hover:shadow-md transition-all flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-slate-800">{lesson.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{t('lessonItems').replace('{0}', lesson.items.length)}</p>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-[#DD0000]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentIndex >= selectedLesson.items.length) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white/95 rounded-3xl p-10 text-center shadow-xl border border-[#f0e0d8]">
        <Award size={64} className="text-[#DD0000] mx-auto mb-4" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">{t('completed')}</h2>
        <p className="text-slate-600 mb-8">{t('completedDesc')} "{selectedLesson.title}".</p>
        <button onClick={() => setSetupStep(true)} className="bg-[#DD0000] text-white px-8 py-3 rounded-xl font-bold shadow-lg">{t('chooseOther')}</button>
      </div>
    );
  }

  const currentItem = selectedLesson.items[currentIndex];

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageCircle className="text-[#DD0000]" /> {selectedLesson.title} ({level})
        </h2>
        <span className="bg-white px-4 py-1.5 rounded-full font-bold text-[#DD0000] shadow-sm text-sm border border-[#f0e0d8]">
          {currentIndex + 1} / {selectedLesson.items.length}
        </span>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-[#f0e0d8]">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#DD0000] rounded-l-2xl"></div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="w-full min-w-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-medium text-slate-900 mb-4 font-serif tracking-wide leading-relaxed break-words">
                <PronunciationText text={currentItem.jp} />
              </div>
              <p className="text-base font-mono text-[#DD0000] mb-1 break-words">{currentItem.romaji}</p>
              <p className="text-sm text-slate-500 italic break-words">{currentItem[lang] || currentItem.vi}</p>
            </div>

            <div className="flex gap-2 shrink-0 self-start mt-2 sm:mt-0">
              <button onClick={() => playModelAudio(currentItem.jp, 'slow')} disabled={isPlayingModel !== false} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-md transition-all border-2 ${isPlayingModel === 'slow' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-200 hover:border-[#DD0000] hover:text-[#DD0000] text-slate-700'}`} title="Nghe đọc chậm">
                <Volume1 size={20} className={isPlayingModel === 'slow' ? "opacity-50" : ""} />
                <span className="text-[9px] font-bold mt-0.5 uppercase">{t('listenSlow')}</span>
              </button>
              <button onClick={() => playModelAudio(currentItem.jp, 'normal')} disabled={isPlayingModel !== false} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-md transition-all border-2 ${isPlayingModel === 'normal' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-200 hover:border-[#DD0000] hover:text-[#DD0000] text-slate-700'}`} title="Nghe đọc chuẩn">
                <Volume2 size={20} className={isPlayingModel === 'normal' ? "opacity-50" : ""} />
                <span className="text-[9px] font-bold mt-0.5 uppercase">{t('listenNormal')}</span>
              </button>
            </div>
          </div>
        </div>

        {!recordedFile && !isEvaluating && (
          <div className="animate-in fade-in">
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4 text-sm font-medium border border-yellow-200">
              <Info size={16} className="inline mr-1" />
              {t('yourTurn')}
            </div>
            <AudioInput onAudioReady={handleAudioReady} />
          </div>
        )}

        {isEvaluating && (
          <div className="py-8 flex flex-col items-center">
            <Activity size={48} className="text-[#DD0000] animate-bounce mb-4" />
            <p className="font-medium text-slate-600">{t('grading')}</p>
          </div>
        )}

        {sentenceResult && !isEvaluating && (
          <div className="animate-in slide-in-from-bottom-4">
            <div className={`p-6 rounded-2xl border shadow-sm ${parseFloat(sentenceResult.score) >= 8.0 ? 'bg-green-50 border-green-200' : parseFloat(sentenceResult.score) >= 6.0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start`}>

              <div className={`w-24 h-24 rounded-full flex items-center justify-center flex-col shadow-inner shrink-0 ${parseFloat(sentenceResult.score) >= 8.0 ? 'bg-green-500 text-white' : parseFloat(sentenceResult.score) >= 6.0 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                <span className="font-black text-3xl">{sentenceResult.score}</span>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">{t('analysis')}</h4>
                <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">{sentenceResult.feedback}</p>
                <div className="bg-white/50 p-2 rounded-lg inline-block w-full">
                  <audio controls src={recordedUrl} className="h-10 w-full rounded" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
              <button onClick={() => { setRecordedFile(null); setSentenceResult(null); }} className="flex-1 py-4 bg-white border border-slate-300 hover:border-[#DD0000] hover:text-[#DD0000] text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <RefreshCcw size={18} /> {t('tryAgain')}
              </button>
              <button onClick={nextItem} className="flex-1 py-4 bg-[#DD0000] hover:bg-[#B00000] text-white font-black tracking-wide rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
                {t('nextItem')} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: PHIẾU BÁO CÁO (CHUNG)
// ---------------------------------------------------------
function ReportCard({ result, studentName, fileUrl, onReset }) {
  const { t } = useContext(LanguageContext);
  const criteriaKeys = Object.keys(result.criteria);

  return (
    <>
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={onReset} className="flex items-center gap-2 text-slate-600 hover:text-[#DD0000] font-bold bg-white/80 px-5 py-2.5 rounded-xl shadow-sm border border-slate-200">
          <RefreshCcw size={18} /> {t('gradeAnother')}
        </button>
        <button onClick={() => window.print()} className="bg-[#DD0000] hover:bg-[#B00000] text-white px-5 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95">
          <Download size={18} /> {t('exportPDF')}
        </button>
      </div>

      <div id="printable-report" className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-[#f0e0d8]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] bg-[#fffcf9]">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-[#DD0000] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Star size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-black text-2xl text-slate-800 leading-tight">{t('reportTitle')}</h2>
              <p className="text-xs text-[#DD0000] font-bold tracking-widest mt-2 uppercase">{t('analyzedBy')}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <div className="bg-[#fff0f5] border border-[#ffe4e1] rounded-2xl p-3 text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-[#DD0000] tracking-widest uppercase mb-1">{t('student')}</p>
            <p className="font-bold text-slate-800 text-lg">{studentName}</p>
          </div>
        </div>

        <div className="p-8">
          {fileUrl && (
            <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 no-print flex items-center gap-4">
              <Volume2 size={24} className="text-[#DD0000] shrink-0" />
              <div className="flex-1 w-full">
                <p className="text-sm font-bold text-slate-700 mb-2">{t('originalAudio')}</p>
                <audio controls src={fileUrl} className="w-full h-10" />
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-[#fff0f5] flex items-center justify-center bg-white shadow-inner relative z-10">
                <span className="text-5xl font-black text-[#DD0000]">{result.score}</span>
              </div>
              <div className="absolute inset-[-4px] rounded-full border border-[#ffe4e1] z-0"></div>
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20">
                <Award size={20} />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mt-4">{t('avgScore')}</p>

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <div className="px-6 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-black tracking-wide uppercase border border-green-200 shadow-sm">
                {t('rank')} {result.level}
              </div>
              {result.estimated_cefr && result.estimated_cefr.trim() !== '' && (
                <div className="px-6 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-black tracking-wide uppercase border border-blue-200 shadow-sm animate-in zoom-in">
                  {t('estimatedLevel')} {result.estimated_cefr}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {criteriaKeys.map(key => (
              <CriteriaBar key={key} label={key} score={result.criteria[key]} />
            ))}
          </div>

          <div className="bg-yellow-50/50 rounded-2xl p-6 md:p-8 relative border border-yellow-100 shadow-sm mt-8">
            <div className="absolute -top-4 left-6 bg-white p-1.5 rounded-lg shadow-sm text-[#DD0000] border border-yellow-100">
              <MessageSquare size={20} fill="currentColor" />
            </div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-yellow-200/50 pb-3">{t('systemAnalysis')}</h3>
            <p className="text-slate-800 leading-relaxed text-sm whitespace-pre-line font-medium">
              {result.feedback}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function CriteriaBar({ label, score }) {
  const percentage = (parseFloat(score) / 10) * 100;
  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm text-slate-600">{label}</span>
        <span className="font-black text-[#DD0000] text-base">{score}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-[#DD0000]" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

