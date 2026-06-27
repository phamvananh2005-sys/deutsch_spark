import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  Upload, User, Volume2, Volume1, Download, Star, Award, MessageSquare,
  RefreshCcw, CheckCircle2, Mic, Square, ChevronRight,
  BookOpen, MessageCircle, Eye, EyeOff, ShieldCheck, Sparkles, BookA,
  Lock, LogOut, Plus, Save, X, Info, Trash2, Activity, Globe
} from 'lucide-react';
import { supabase } from './supabase';

// Đổi ảnh nền tại đây.
// Cách dùng đơn giản nhất: đặt file ảnh trong thư mục public với tên berlin-background.jpg.
// Sau này muốn thay background, bạn chỉ cần đổi file ảnh hoặc đổi đường dẫn bên dưới.
const APP_BACKGROUND_SRC = '/berlin-background.jpg';

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
    shadowingDesc: "Bắt chước lại theo từ vựng hoặc câu mẫu. Nghe mẫu, thu âm, nghe lại bản thu của mình và luyện đến khi tự tin hơn.",
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
    yourTurn: "Hãy nghe mẫu, thu âm lại, rồi nghe lại bản thu của mình để tự so sánh và luyện tập.",
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
    hintModel: "Bài nói mẫu:",
    uploadOrRec: "Tải lên hoặc thu âm bài nói của bạn:",
    startGrading: "Bắt đầu chấm điểm AI",
    cancel: "✕ Hủy",
    aiRecognized: "AI đã nhận diện được giọng nói của bạn.",
    gradeAnother: "Chấm bài khác",
    exportPDF: "XUẤT PHIẾU PDF",
    reportTitle: "PHIẾU ĐÁNH GIÁ KỸ NĂNG NÓI",
    analyzedBy: "Phân tích bởi Deutsch Spark GPT AI",
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
    shadowingDesc: "Imitate vocabulary or sentences. Listen to the sample, record yourself, replay your recording, and practise until you feel more confident.",
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
    yourTurn: "Listen to the sample, record yourself, then replay your recording to compare and practise.",
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
    hintModel: "Model Speech:",
    uploadOrRec: "Upload or record your speech:",
    startGrading: "Start AI Grading",
    cancel: "✕ Cancel",
    aiRecognized: "AI has successfully recognized your voice.",
    gradeAnother: "Grade Another",
    exportPDF: "EXPORT PDF",
    reportTitle: "SPEAKING SKILL ASSESSMENT",
    analyzedBy: "Analyzed by Deutsch Spark GPT AI",
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


// --- HELPER: German model audio FREE-only, tốc độ gần Google Dịch hơn ---
// Nguyên tắc:
// 1) Không dùng Google Cloud/Azure/backend trả phí.
// 2) Ưu tiên voice German chất lượng tốt có sẵn trong trình duyệt/máy học sinh.
// 3) Tốc độ Chuẩn/Chậm được hạ xuống gần cảm giác Google Dịch hơn.
// 4) Câu dài được chia cụm và nghỉ nhẹ giữa cụm để nghe điềm đạm, không chạy một mạch.
let cachedGermanVoices = [];
let activeGermanUtteranceTimeouts = [];

const GERMAN_NORMAL_RATE_BY_LEVEL = {
  A1: 0.62,
  A2: 0.65,
  B1: 0.68,
  B2: 0.72,
  C1: 0.76,
  C2: 0.80
};

const GERMAN_FEMALE_VOICE_PRIORITY_KEYWORDS = [
  // Các giọng nữ tiếng Đức phổ biến trên Microsoft/Apple/Google nếu máy có.
  'katja', 'anna', 'vicki', 'hedda', 'marlene', 'petra', 'seraphina',
  'female', 'woman', 'frau', 'weiblich', 'feminin'
];

const GERMAN_GOOGLE_VOICE_PRIORITY_KEYWORDS = [
  'google deutsch', 'google german', 'google de-de', 'google'
];

const GERMAN_QUALITY_VOICE_PRIORITY_KEYWORDS = [
  'microsoft', 'natural', 'premium', 'enhanced'
];

const GERMAN_MALE_VOICE_PENALTY_KEYWORDS = [
  // Tránh giọng nam khi có giọng nữ/chất lượng tốt phù hợp.
  'markus', 'conrad', 'hans', 'klaus', 'stefan', 'male', 'man', 'mann', 'männlich', 'junge'
];

const refreshGermanVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length) cachedGermanVoices = voices;
  return voices.length ? voices : cachedGermanVoices;
};

const preloadGermanVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return () => {};
  refreshGermanVoices();

  const handleVoicesChanged = () => refreshGermanVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged);
  const previousHandler = window.speechSynthesis.onvoiceschanged;
  window.speechSynthesis.onvoiceschanged = (event) => {
    handleVoicesChanged();
    if (typeof previousHandler === 'function') previousHandler.call(window.speechSynthesis, event);
  };

  return () => {
    window.speechSynthesis.removeEventListener?.('voiceschanged', handleVoicesChanged);
    if (window.speechSynthesis.onvoiceschanged !== previousHandler) {
      window.speechSynthesis.onvoiceschanged = previousHandler || null;
    }
  };
};

const cleanGermanTextForTTS = (textRaw = '') => {
  let text = String(textRaw || '')
    // Nếu admin nhập [Deutsch|gợi ý đọc], máy chỉ đọc phần tiếng Đức thật.
    .replace(/\[([^|]+)\|([^\]]+)\]/g, '$1')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  // Nếu giáo viên lỡ paste kiểu "Guten Morgen / Chào buổi sáng / Good morning",
  // TTS chỉ đọc phần tiếng Đức trước dấu /.
  if (text.includes(' / ')) text = text.split(' / ')[0].trim();

  return text;
};

const scoreGermanVoice = (voice) => {
  const lang = String(voice?.lang || '').toLowerCase();
  const name = String(voice?.name || '').toLowerCase();
  let score = 0;

  if (lang === 'de-de') score += 120;
  else if (lang.startsWith('de-de')) score += 112;
  else if (lang === 'de-at') score += 84;
  else if (lang === 'de-ch') score += 78;
  else if (lang.startsWith('de')) score += 58;

  GERMAN_FEMALE_VOICE_PRIORITY_KEYWORDS.forEach((keyword, index) => {
    if (name.includes(keyword.toLowerCase())) score += Math.max(24, 118 - index * 5);
  });

  GERMAN_GOOGLE_VOICE_PRIORITY_KEYWORDS.forEach((keyword, index) => {
    if (name.includes(keyword.toLowerCase())) score += Math.max(18, 56 - index * 7);
  });

  GERMAN_QUALITY_VOICE_PRIORITY_KEYWORDS.forEach((keyword, index) => {
    if (name.includes(keyword.toLowerCase())) score += Math.max(10, 36 - index * 5);
  });

  GERMAN_MALE_VOICE_PENALTY_KEYWORDS.forEach(keyword => {
    if (name.includes(keyword.toLowerCase())) score -= 90;
  });

  if (voice?.localService) score += 2;
  return score;
};

const getBestGermanVoice = () => {
  const voices = refreshGermanVoices();
  if (!voices.length) return null;

  const germanVoices = voices.filter(voice => String(voice?.lang || '').toLowerCase().startsWith('de'));
  const ranked = germanVoices
    .map(voice => ({ voice, score: scoreGermanVoice(voice) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.voice || null;
};

const splitGermanIntoGoogleSpeedChunks = (text) => {
  const cleanText = cleanGermanTextForTTS(text);
  if (!cleanText) return [];

  const sentenceChunks = cleanText
    .split(/(?<=[.!?])\s+/)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  const chunks = [];
  sentenceChunks.forEach(sentence => {
    if (sentence.length <= 68) {
      chunks.push(sentence);
      return;
    }

    const softParts = sentence
      .split(/(?<=[,;:])\s+/)
      .map(part => part.trim())
      .filter(Boolean);

    softParts.forEach(part => {
      if (part.length <= 68) {
        chunks.push(part);
        return;
      }

      const words = part.split(/\s+/);
      let current = '';
      words.forEach(word => {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > 54 && current) {
          chunks.push(current);
          current = word;
        } else {
          current = candidate;
        }
      });
      if (current) chunks.push(current);
    });
  });

  return chunks.length ? chunks : [cleanText];
};

const getGermanSpeechRate = (speedMode = 'normal', level = 'A1') => {
  if (speedMode === 'slow') return 0.50;
  const normalizedLevel = String(level || 'A1').trim().toUpperCase();
  return GERMAN_NORMAL_RATE_BY_LEVEL[normalizedLevel] || 0.64;
};

const stopGermanSampleAudio = () => {
  activeGermanUtteranceTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  activeGermanUtteranceTimeouts = [];

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

const speakGermanSample = ({ textRaw, speedMode = 'normal', level = 'A1', onStart, onEnd }) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ đọc mẫu.');
    return;
  }

  const chunks = splitGermanIntoGoogleSpeedChunks(textRaw);
  if (!chunks.length) return;

  stopGermanSampleAudio();

  const speakNow = () => {
    const germanVoice = getBestGermanVoice();
    const rate = getGermanSpeechRate(speedMode, level);
    const pitch = 0.94; // hạ nhẹ để giọng đằm hơn, bớt gắt.
    let index = 0;
    let finished = false;

    const finishAll = () => {
      if (finished) return;
      finished = true;
      activeGermanUtteranceTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      activeGermanUtteranceTimeouts = [];
      if (typeof onEnd === 'function') onEnd();
    };

    const speakNext = () => {
      if (index >= chunks.length) {
        finishAll();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = germanVoice?.lang || 'de-DE';
      if (germanVoice) utterance.voice = germanVoice;

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;

      utterance.onend = () => {
        index += 1;
        if (index >= chunks.length) {
          finishAll();
        } else {
          // Pause rõ hơn giữa cụm để gần cảm giác Google Dịch, không đọc một mạch.
          const pauseMs = speedMode === 'slow' ? 720 : 460;
          const timeoutId = setTimeout(speakNext, pauseMs);
          activeGermanUtteranceTimeouts.push(timeoutId);
        }
      };

      utterance.onerror = () => {
        finishAll();
        alert('Không đọc được âm mẫu. Hãy kiểm tra German voice / tiếng Đức trên trình duyệt hoặc máy tính.');
      };

      window.speechSynthesis.speak(utterance);
    };

    if (typeof onStart === 'function') onStart(speedMode);
    speakNext();
  };

  const voices = refreshGermanVoices();
  if (!voices || voices.length === 0) {
    const oldHandler = window.speechSynthesis.onvoiceschanged;
    window.speechSynthesis.onvoiceschanged = (event) => {
      refreshGermanVoices();
      if (typeof oldHandler === 'function') oldHandler.call(window.speechSynthesis, event);
      speakNow();
    };
  } else {
    speakNow();
  }
};

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
    return preloadGermanVoices();
  }, []);

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
      .deutsch-bg {
        position: relative;
        min-height: 100vh;
        overflow-x: hidden;
        background-color: #111827;
      }
      .app-background-img {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        z-index: 0;
        pointer-events: none;
      }
      .app-background-overlay {
        position: fixed;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background: linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 45%, rgba(0,0,0,0.10));
      }
      .app-content { position: relative; z-index: 20; }
      .home-glass-panel {
        background: rgba(255, 255, 255, 0.24);
        border: 1px solid rgba(255, 255, 255, 0.42);
        box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255,255,255,0.45);
        backdrop-filter: blur(10px) saturate(130%);
        -webkit-backdrop-filter: blur(10px) saturate(130%);
        border-radius: 2rem;
        padding: 3rem 2rem;
      }
      .glass-readable-title {
        text-shadow: 0 2px 14px rgba(255,255,255,0.75), 0 3px 18px rgba(15,23,42,0.22);
      }
      .glass-readable-text {
        text-shadow: 0 1px 10px rgba(255,255,255,0.85);
      }
      @media (max-width: 640px) {
        .home-glass-panel { padding: 2rem 1rem; border-radius: 1.5rem; }
      }
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
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto mt-10 px-4 pb-20">
      <div className="home-glass-panel">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 mb-4 glass-readable-title">{t('welcome')}</h2>
        <p className="text-slate-800 font-semibold flex items-center justify-center gap-2 glass-readable-text">
          {t('subtitle')} <Sparkles size={16} className="text-[#DD0000]" />
        </p>
      </div>

      <div className="mb-10 max-w-md mx-auto">
        <label className="block text-center font-black text-slate-900 mb-3 glass-readable-text">{t('step1')}</label>
        <div className="bg-white/45 backdrop-blur-md p-2 pl-5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#DD0000]/50 transition-all">
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
        <label className="block font-black text-slate-900 glass-readable-text">{t('step2')}</label>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <button onClick={() => handleModeSelect('shadowing')} className="bg-white/38 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl hover:border-[#DD0000] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <MessageCircle size={40} className="text-[#DD0000] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('shadowingTitle')}</h3>
          <p className="text-slate-700 text-sm font-medium relative z-10 leading-relaxed">{t('shadowingDesc')}</p>
        </button>

        <button onClick={() => handleModeSelect('topic')} className="bg-white/38 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl hover:border-[#DD0000] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-100/50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <BookOpen size={40} className="text-[#DD0000] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('topicTitle')}</h3>
          <p className="text-slate-700 text-sm font-medium relative z-10 leading-relaxed">{t('topicDesc')}</p>
        </button>

        <button onClick={() => handleModeSelect('free')} className="bg-white/38 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl hover:border-[#DD0000] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-100/50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <Mic size={40} className="text-[#DD0000] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('freeTitle')}</h3>
          <p className="text-slate-700 text-sm font-medium relative z-10 leading-relaxed">{t('freeDesc')}</p>
        </button>
      </div>

      <div className="mt-16 text-center">
        <button onClick={() => setActiveMode('adminLogin')} className="text-xs text-slate-500 hover:text-[#DD0000] transition-colors underline decoration-dotted">
          {t('adminLink')}
        </button>
      </div>
      </div>
    </div>
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="deutsch-bg text-slate-800 font-sans selection:bg-[#DD0000] selection:text-white">
        {/* BACKGROUND: chỉ dùng 1 thẻ img để bạn có thể thay ảnh tùy ý */}
        <img
          src={APP_BACKGROUND_SRC}
          alt="Berlin background"
          className="app-background-img"
        />
        <div className="app-background-overlay" />

        <header className="bg-white/55 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-50 app-content no-print">
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
            <div className="max-w-sm mx-auto mt-20 bg-white/68 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/45 animate-in fade-in zoom-in">
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
  const [shadowRows, setShadowRows] = useState([{ jp: '', vi: '', en: '' }]);

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

    const parsedItems = shadowRows
      .map(row => ({
        jp: (row.jp || '').trim(),
        vi: (row.vi || '').trim(),
        en: (row.en || '').trim()
      }))
      .filter(row => row.jp || row.vi || row.en);

    if (parsedItems.length === 0) {
      alert("Vui lòng nhập ít nhất 1 dòng nội dung shadowing!");
      return;
    }

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
    setShadowRows(
      (s.items && s.items.length > 0)
        ? s.items.map(i => ({ jp: i.jp || '', vi: i.vi || '', en: i.en || '' }))
        : [{ jp: '', vi: '', en: '' }]
    );
  };

  const updateShadowRow = (index, field, value) => {
    setShadowRows(rows => rows.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const addShadowRow = () => {
    setShadowRows(rows => [...rows, { jp: '', vi: '', en: '' }]);
  };

  const removeShadowRow = (index) => {
    setShadowRows(rows => rows.length > 1 ? rows.filter((_, i) => i !== index) : [{ jp: '', vi: '', en: '' }]);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      <div className="bg-white/72 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/45">
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
                    <button onClick={() => setEditingTopic({ id: 't_' + Date.now(), title: '', level: 'A1', req: '', isPublished: false, hint: { jp: '', vi: '', en: '' } })} className="bg-[#DD0000] text-white hover:bg-[#B00000] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md"><Plus size={18} /> Thêm mới</button>
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
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-medium border border-blue-200">
                      Chỉ nhập nội dung theo 3 phần: Tiếng Đức, Tiếng Việt và Tiếng Anh
                    </div>
                    <div><label className="block text-xs font-bold mb-1">Tiếng Đức</label><textarea value={editingTopic.hint.jp} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, jp: e.target.value } })} className="w-full p-2 border rounded-lg h-24" placeholder="VD: Guten Morgen. Ich heiße Anna." /></div>
                    <div><label className="block text-xs font-bold mb-1">Tiếng Việt</label><textarea value={editingTopic.hint.vi} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, vi: e.target.value } })} className="w-full p-2 border rounded-lg h-20" placeholder="VD: Chào buổi sáng. Tôi tên là Anna." /></div>
                    <div><label className="block text-xs font-bold mb-1">Tiếng Anh</label><textarea value={editingTopic.hint.en || ''} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, en: e.target.value } })} className="w-full p-2 border rounded-lg h-20" placeholder="VD: Good morning. My name is Anna." /></div>
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
                    <button onClick={() => { setEditingShadow({ id: 's_' + Date.now(), title: '', level: 'A1', type: 'sentence', isPublished: false, items: [] }); setShadowRows([{ jp: '', vi: '', en: '' }]); }} className="bg-[#DD0000] text-white px-4 py-2 rounded-lg font-bold text-sm"><Plus size={18} className="inline" /> Thêm mới</button>
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
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <label className="block text-sm font-bold">Danh sách Từ vựng / Câu</label>
                      <button onClick={addShadowRow} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-700">
                        <Plus size={14} /> Thêm dòng
                      </button>
                    </div>

                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium mb-3 border border-blue-200 shadow-inner">
                      Mỗi dòng được chia thành 3 ô riêng: <strong>Tiếng Đức</strong>, <strong>Tiếng Việt</strong>, <strong>Tiếng Anh</strong>
                    </div>

                    <div className="space-y-3">
                      {shadowRows.map((row, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-start bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                          <div>
                            <label className="block text-[11px] font-black text-[#DD0000] mb-1 uppercase">Tiếng Đức</label>
                            <textarea value={row.jp} onChange={e => updateShadowRow(index, 'jp', e.target.value)} className="w-full p-3 border rounded-xl h-24 text-sm focus:outline-none focus:border-[#DD0000]" placeholder="Schule" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-600 mb-1 uppercase">Tiếng Việt</label>
                            <textarea value={row.vi} onChange={e => updateShadowRow(index, 'vi', e.target.value)} className="w-full p-3 border rounded-xl h-24 text-sm focus:outline-none focus:border-[#DD0000]" placeholder="Trường học" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-600 mb-1 uppercase">Tiếng Anh</label>
                            <textarea value={row.en} onChange={e => updateShadowRow(index, 'en', e.target.value)} className="w-full p-3 border rounded-xl h-24 text-sm focus:outline-none focus:border-[#DD0000]" placeholder="School" />
                          </div>
                          <button onClick={() => removeShadowRow(index)} className="mt-6 md:mt-7 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100" title="Xóa dòng">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
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



function cleanGermanTargetText(textRaw = '') {
  return String(textRaw)
    .replace(/\[([^|]+)\|([^\]]+)\]/g, '$1')
    .replace(/[“”"'.,!?;:()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isShortGermanVocabTarget(expectedText = '', mode = '') {
  if (mode !== 'vocab') return false;
  const clean = cleanGermanTargetText(expectedText);
  if (!clean) return false;
  return clean.split(/\s+/).length <= 2 && clean.length <= 24;
}

function transcriptLooksLikeWrongLanguageForGerman(transcript = '') {
  const text = String(transcript || '').trim();
  if (!text) return false;
  const hasGermanLettersOrWords = /[a-zäöüß]/i.test(text) || /\b(hallo|danke|bitte|guten|morgen|tschüss|tschuss|ja|nein|ich|du|deutsch)\b/i.test(text);
  const hasNonLatinScript = /[\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF\u0400-\u04FF]/.test(text);
  return hasNonLatinScript && !hasGermanLettersOrWords;
}

function buildGermanTranscriptionPrompt(expectedText = '', mode = '') {
  const cleanExpected = cleanGermanTargetText(expectedText);
  const shortVocabNote = isShortGermanVocabTarget(expectedText, mode)
    ? `\nThis is a very short German vocabulary item. The learner is expected to say: "${cleanExpected}". For short words like Hallo, Danke, Bitte, Ja, Nein, Schule, do not identify the audio as Thai or another language just because there is little context.`
    : '';

  return `This is a German speaking practice recording for a language learning app.${shortVocabNote}\nTranscribe in German only. Keep German umlauts if you hear them. If the audio sounds like the expected German word or sentence, return the German transcript, not another language.`;
}

function looksMostlyNonGerman(transcript = '') {
  const text = transcript.toLowerCase().trim();
  if (!text) return false;
  const germanSignals = /\b(ich|du|er|sie|wir|ihr|bin|bist|ist|sind|heiße|heisse|habe|hast|hat|guten|morgen|danke|bitte|tschüss|schule|deutsch|lernen|spreche|möchte|moechte|für|fuer|nicht|und|aber|oder|ein|eine|der|die|das|zu|mit)\b|[äöüß]/i;
  const vietnameseSignals = /[ăâêôơưđàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;
  return !germanSignals.test(text) && vietnameseSignals.test(text);
}

// ---------------------------------------------------------
// ENGINE CHẤM ĐIỂM GPT AI (THÔNG MINH)
// ---------------------------------------------------------

function generateGradingResultFallback(transcript, expectedRawText, level, mode, lang, t) {
  const clamp = (val) => Math.min(10.0, Math.max(0.0, parseFloat(val) || 0)).toFixed(1);
  const cleanTranscript = cleanGermanTargetText(transcript);
  const wordCount = cleanTranscript ? cleanTranscript.split(/\s+/).length : 0;

  let finalScore = 5.0;
  let criteriaObj = {};
  let estimatedLevel = '';

  if (mode === 'topic') {
    if (wordCount < 5) finalScore = 4.0;
    else if (wordCount < 15) finalScore = 6.0;
    else if (wordCount < 35) finalScore = 7.2;
    else finalScore = 8.0;

    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore - 0.3),
      [t('cGrammar')]: clamp(finalScore - 0.4),
      [t('cVocab')]: clamp(finalScore - 0.2),
      [t('cCompleteness')]: clamp(wordCount >= 25 ? finalScore : finalScore - 0.8),
      [t('cFluency')]: clamp(finalScore),
      [t('cTopicRelevance')]: clamp(finalScore + 0.2)
    };
  } else if (mode === 'free') {
    if (wordCount < 5) finalScore = 4.0;
    else if (wordCount < 15) finalScore = 6.0;
    else if (wordCount < 35) finalScore = 7.0;
    else finalScore = 8.0;

    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore - 0.3),
      [t('cFluency')]: clamp(finalScore),
      [t('cGrammar')]: clamp(finalScore - 0.4),
      [t('cVocab')]: clamp(finalScore - 0.2),
      [t('cIdeaDev')]: clamp(wordCount >= 25 ? finalScore : finalScore - 0.7)
    };

    if (wordCount > 70) estimatedLevel = 'B2';
    else if (wordCount > 35) estimatedLevel = 'B1';
    else if (wordCount > 15) estimatedLevel = 'A2';
    else estimatedLevel = 'A1';
  } else {
    finalScore = 0.0;
    criteriaObj = {};
  }

  return {
    score: clamp(finalScore),
    level: lang === 'en' ? (finalScore >= 8 ? 'Good' : finalScore >= 6 ? 'Fair' : 'Needs Practice') : (finalScore >= 8 ? 'Giỏi' : finalScore >= 6 ? 'Khá' : 'Cần cố gắng'),
    estimated_cefr: estimatedLevel,
    criteria: criteriaObj,
    feedback: lang === 'en'
      ? "Điểm mạnh\n✓ The system received your recording.\n\nLỗi cần sửa\n△ Full AI analysis is temporarily unavailable, so detailed German error locations could not be extracted.\n\nGợi ý luyện tập\n→ Please try again when the AI connection is stable."
      : "Điểm mạnh\n✓ Hệ thống đã nhận được bản ghi âm của bạn.\n\nLỗi cần sửa\n△ Hiện chưa thể phân tích AI đầy đủ, nên hệ thống chưa chỉ ra được chính xác từng lỗi tiếng Đức trong bài nói.\n\nGợi ý luyện tập\n→ Bạn hãy thử chấm lại khi kết nối AI ổn định hơn."
  };
}

const evaluateWithGPT = async (transcript, expectedText, level, mode, lang, requirement = '') => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const systemPrompt = `Bạn là giáo viên tiếng Đức chuyên chấm nói cho học sinh Việt Nam. Bạn phải chấm theo RUBRIC TIẾNG ĐỨC bên dưới và phản hồi đúng ngôn ngữ yêu cầu.

Language for feedback: ${lang === 'en' ? 'English' : 'Vietnamese'}.
Task Mode: ${mode} (topic = Guided Speaking / nói theo chủ đề có hướng dẫn, free = Free Speaking / nói tự do).
Student CEFR Target Level: ${level}.
Topic Requirement / danh sách ý cần đề cập: "${requirement || 'None'}"
Model Answer / bài mẫu tham khảo: "${expectedText || 'None'}"
Student Voice Transcript: "${transcript}"

QUY TẮC QUAN TRỌNG:
- App này chỉ chấm tiếng Đức.
- Nếu học sinh nói chủ yếu bằng tiếng Việt, tiếng Anh, tiếng Pháp, tiếng Tây Ban Nha, tiếng Nhật, tiếng Trung hoặc ngôn ngữ khác không phải tiếng Đức, trả điểm thấp và nhắc học sinh nói bằng tiếng Đức.
- Phản hồi tiếng Việt phải dùng "bạn". Không dùng "em", "thầy", "cô", "mình", "tôi".
- Không nhận xét chung chung. Khi có lỗi, phải chỉ ra đúng cụm sai của học sinh và đưa dạng đúng, ví dụ: "Meine Mutter arbeiten → Meine Mutter arbeitet".
- Không bịa lỗi nếu transcript không thể hiện lỗi đó. Nếu không đủ dữ liệu âm thanh để chắc chắn một lỗi phát âm, hãy nói nhẹ là "có thể" hoặc tập trung vào lỗi thể hiện qua transcript.
- Shadowing từ và Shadowing câu KHÔNG gọi AI trong app này. Nếu mode là vocab hoặc sentence, vẫn trả lời an toàn nhưng không cần dùng rubric shadowing.

RUBRIC 3 — GUIDED SPEAKING / NÓI THEO CHỦ ĐỀ CÓ HƯỚNG DẪN:
Mục tiêu: Khả năng tái tạo ngôn ngữ. Học sinh có chủ đề, bài mẫu và danh sách ý cần nói, nhưng KHÔNG bắt buộc lặp lại bài mẫu. Khuyến khích dùng từ ngữ riêng, thêm trải nghiệm cá nhân và mở rộng nội dung.
Tổng điểm 10 theo trọng số:
1. Phát âm — 2.0 điểm: nguyên âm dài-ngắn, Umlaut, âm ch, độ dễ hiểu.
2. Ngữ pháp — 2.0 điểm: sein, haben, động từ thường, chia động từ, trật tự từ cơ bản, giống danh từ.
3. Từ vựng đúng chủ đề — 1.5 điểm: đúng chủ đề, có đa dạng từ vựng, tránh lặp quá nhiều.
4. Nội dung đủ ý — 2.0 điểm: đề cập đủ các ý trong yêu cầu. Ví dụ chủ đề gia đình: số người, nghề nghiệp, anh/chị/em, hoạt động chung.
5. Trôi chảy — 1.5 điểm: ít ngập ngừng, nói thành cụm câu, có kết nối ý.
6. Liên quan đề bài — 1.0 điểm: bám chủ đề và yêu cầu, nhưng vẫn cho phép diễn đạt sáng tạo.

Thang phản hồi Guided Speaking:
- 10 điểm: đủ tất cả yêu cầu, có thông tin cá nhân, tiếng Đức tự nhiên, phát âm rõ, trật tự từ chính xác, nói trôi chảy.
- 8–9 điểm: hoàn thành hầu hết yêu cầu, có diễn đạt riêng, phát âm khá tốt; còn lỗi nhỏ về chia động từ hoặc từ vựng chưa đa dạng.
- 6–7 điểm: đúng chủ đề và truyền đạt ý chính; còn thiếu ý bắt buộc, câu đơn giản, ngập ngừng.
- 4–5 điểm: có liên quan nhưng thiếu nhiều ý, sai cấu trúc cơ bản, bài quá ngắn.

RUBRIC 4 — FREE SPEAKING / NÓI TỰ DO:
Mục tiêu: Năng lực giao tiếp thực sự. Học sinh được nói về bất kỳ chủ đề nào. KHÔNG đánh giá đúng/sai chủ đề, KHÔNG chấm giống bài mẫu, KHÔNG chấm bám đề. Chỉ đánh giá khả năng sử dụng tiếng Đức.
Tổng điểm 10 theo trọng số:
1. Phát âm — 2.5 điểm: độ rõ ràng, nguyên âm dài-ngắn, Umlaut, âm đặc trưng tiếng Đức.
2. Trôi chảy — 2.5 điểm: nói liên tục, ít ngập ngừng, tốc độ phù hợp.
3. Ngữ pháp — 2.0 điểm: chia động từ, trật tự từ, giống danh từ, cấu trúc câu.
4. Từ vựng — 1.5 điểm: độ đa dạng và phù hợp.
5. Phát triển ý — 1.5 điểm: có giải thích, ví dụ, liên kết ý.

Thang phản hồi Free Speaking:
- 10 điểm: ý tưởng rõ, có ví dụ, ngôn ngữ tự nhiên, phát âm tốt, dùng từ nối hợp lý.
- 8–9 điểm: có quan điểm cá nhân rõ, trình bày khá mạch lạc; cần giải thích sâu hơn hoặc giảm lặp từ.
- 6–7 điểm: diễn đạt được ý cơ bản; còn đơn giản, nhiều khoảng dừng, từ vựng hạn chế.
- 4–5 điểm: nội dung quá ngắn, nhiều lỗi ngữ pháp cơ bản, AI khó hiểu một số đoạn.

FORMAT PHẢN HỒI BẮT BUỘC trong trường feedback:
Điểm mạnh
✓ ...
✓ ...

Lỗi cần sửa
△ Cụm sai của học sinh → đúng: ...
△ ...

Gợi ý luyện tập
→ ...
→ ...

Với Free Speaking, nên gợi ý công thức: Meinung → Grund → Beispiel → Schluss khi phù hợp.
Ví dụ tiếng Đức có thể dùng: Ich reise gern, weil ich neue Kulturen kennenlernen kann. Zum Beispiel war ich letztes Jahr in Berlin. Deshalb möchte ich in Zukunft mehr reisen.

Return ONLY a JSON object matching this schema:
{
  "score": "Overall weighted score from 0.0 to 10.0, e.g. 8.5",
  "level": "Performance rank. English: Excellent/Good/Fair/Needs Practice. Vietnamese: Xuất sắc/Giỏi/Khá/Cần cố gắng",
  "estimated_cefr": "Estimated CEFR level A1/A2/B1/B2/C1. Mandatory for free mode, otherwise empty.",
  "feedback": "Feedback in the exact required format above.",
  "pronunciation_score": "0.0 to 10.0 string",
  "fluency_score": "0.0 to 10.0 string",
  "grammar_score": "0.0 to 10.0 string",
  "vocab_score": "0.0 to 10.0 string",
  "content_score": "0.0 to 10.0 string, only meaningful for topic mode",
  "topic_relevance_score": "0.0 to 10.0 string, only meaningful for topic mode",
  "idea_score": "0.0 to 10.0 string, only meaningful for free mode",
  "naturalness_score": "0.0 to 10.0 string",
  "severity": "minor/moderate/major",
  "errors": [
    {"word":"Meine Mutter arbeiten", "issue":"Sai chia động từ", "severity":"moderate", "suggestion":"Dùng ngôi thứ ba số ít: Meine Mutter arbeitet."}
  ]
}`;


  if (looksMostlyNonGerman(transcript) && !(isShortGermanVocabTarget(expectedText, mode) && transcriptLooksLikeWrongLanguageForGerman(transcript))) {
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
// COMPONENT: THU ÂM (TÍCH HỢP SPEECH RECOGNITION + OPENAI/GPT)
// ---------------------------------------------------------

export const AudioInput = ({ onAudioReady, expectedText = '', practiceMode = '', shadowingOnly = false }) => {
  const { lang } = useContext(LanguageContext);
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

  // 🧠 OpenAI/GPT transcribe
  const transcribe = async (file) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "gpt-4o-mini-transcribe");
    formData.append("language", "de");
    formData.append("temperature", "0");
    formData.append("prompt", buildGermanTranscriptionPrompt(expectedText, practiceMode));

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

        if (!shadowingOnly) {
          try {
            finalTranscript = await transcribe(file);

            // Với từ vựng tiếng Đức rất ngắn, nếu STT trả về chữ Thái/Nhật/Trung..., giữ mục tiêu tiếng Đức để GPT không chấm sai do nhận diện nhầm ngôn ngữ.
            if (isShortGermanVocabTarget(expectedText, practiceMode) && transcriptLooksLikeWrongLanguageForGerman(finalTranscript)) {
              console.warn("⚠️ STT language confusion detected. Raw transcript:", finalTranscript);
              finalTranscript = cleanGermanTargetText(expectedText);
            }

            // 🔥 CHỈ log sau khi có kết quả
            console.log("✅ GPT TRANSCRIPT RESULT:", finalTranscript);
          } catch (err) {
            console.log("❌ OpenAI error:", err);
          }
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

  const handleFileChange = async (e) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    let finalTranscript = null;
    // Topic Speaking và Free Speaking vẫn cần transcript để chấm theo rubric.
    // Shadowing cố ý KHÔNG gọi AI: chỉ lưu file để học sinh nghe lại và tự so sánh với mẫu.
    if (!shadowingOnly) {
      try {
        finalTranscript = await transcribe(file);
        console.log("✅ GPT TRANSCRIPT RESULT FROM UPLOAD:", finalTranscript);
      } catch (err) {
        console.log("❌ OpenAI file transcribe error:", err);
      }
    }

    onAudioReady(file, URL.createObjectURL(file), finalTranscript, true);
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
          Khuyên dùng: thu âm trực tiếp
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
            {shadowingOnly ? (lang === 'en' ? 'Recommended' : 'Khuyên dùng') : 'Khuyên dùng AI'}
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
              {shadowingOnly ? (lang === 'en' ? 'Start recording' : 'Bắt đầu thu âm') : 'Chấm điểm bằng giọng nói'}
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
    speakGermanSample({
      textRaw,
      speedMode,
      level: currentTopic?.level || 'A1',
      onStart: setIsPlayingModel,
      onEnd: () => setIsPlayingModel(false)
    });
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

    setStep(1);

    try {
      await new Promise(r => setTimeout(r, 500));

      const expectedText = type === 'topic' ? currentTopic?.hint?.jp || '' : '';
      const topicRequirement = type === 'topic' ? currentTopic?.req || '' : '';
      const levelTarget = type === 'topic' ? currentTopic?.level || 'A1' : 'A1';

      let finalResult;

      if (!transcript || transcript.trim().length === 0) {
        finalResult = {
          score: '2.0',
          level: lang === 'en' ? 'Needs Practice' : 'Cần cố gắng',
          estimated_cefr: type === 'free' ? 'A1' : '',
          criteria: type === 'topic'
            ? {
                [t('cPronunciation')]: '2.0',
                [t('cGrammar')]: '2.0',
                [t('cVocab')]: '2.0',
                [t('cCompleteness')]: '2.0',
                [t('cFluency')]: '2.0',
                [t('cTopicRelevance')]: '2.0'
              }
            : {
                [t('cPronunciation')]: '2.0',
                [t('cFluency')]: '2.0',
                [t('cGrammar')]: '2.0',
                [t('cVocab')]: '2.0',
                [t('cIdeaDev')]: '2.0'
              },
          feedback: lang === 'en'
            ? `Điểm mạnh
✓ The recording was received.

Lỗi cần sửa
△ The system could not clearly transcribe the German speech.

Gợi ý luyện tập
→ Please check the microphone/file quality and speak clearly in German.`
            : `Điểm mạnh
✓ Hệ thống đã nhận được bản ghi âm.

Lỗi cần sửa
△ Hệ thống chưa nhận diện rõ phần tiếng Đức trong bản ghi âm.

Gợi ý luyện tập
→ Bạn hãy kiểm tra micro/file âm thanh và nói rõ hơn bằng tiếng Đức.`
        };
      } else {
        const apiRes = await evaluateWithGPT(transcript, expectedText, levelTarget, type, lang, topicRequirement);

        if (apiRes) {
          if (type === 'topic') {
            finalResult = {
              score: apiRes.score,
              level: apiRes.level,
              estimated_cefr: apiRes.estimated_cefr || '',
              criteria: {
                [t('cPronunciation')]: apiRes.pronunciation_score || '0.0',
                [t('cGrammar')]: apiRes.grammar_score || '0.0',
                [t('cVocab')]: apiRes.vocab_score || '0.0',
                [t('cCompleteness')]: apiRes.content_score || apiRes.accuracy_score || '0.0',
                [t('cFluency')]: apiRes.fluency_score || '0.0',
                [t('cTopicRelevance')]: apiRes.topic_relevance_score || apiRes.accuracy_score || '0.0'
              },
              feedback: apiRes.feedback
            };
          } else {
            finalResult = {
              score: apiRes.score,
              level: apiRes.level,
              estimated_cefr: apiRes.estimated_cefr || '',
              criteria: {
                [t('cPronunciation')]: apiRes.pronunciation_score || '0.0',
                [t('cFluency')]: apiRes.fluency_score || '0.0',
                [t('cGrammar')]: apiRes.grammar_score || '0.0',
                [t('cVocab')]: apiRes.vocab_score || '0.0',
                [t('cIdeaDev')]: apiRes.idea_score || apiRes.naturalness_score || '0.0'
              },
              feedback: apiRes.feedback
            };
          }
        } else {
          finalResult = generateGradingResultFallback(transcript, expectedText, levelTarget, type, lang, t);
        }
      }

      setResult(finalResult);
      setStep(2);
    } catch (error) {
      console.error("Lỗi khi đánh giá:", error);
      const expectedText = type === 'topic' ? currentTopic?.hint?.jp || '' : '';
      const levelTarget = type === 'topic' ? currentTopic?.level || 'A1' : 'A1';
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
                        {currentTopic.hint.jp}
                      </div>
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
              <AudioInput onAudioReady={handleAudioReady} expectedText={type === 'topic' ? currentTopic?.hint?.jp || '' : ''} practiceMode={type} />
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
    speakGermanSample({
      textRaw,
      speedMode,
      level,
      onStart: setIsPlayingModel,
      onEnd: () => setIsPlayingModel(false)
    });
  };

  const handleAudioReady = async (file, url) => {
    setRecordedFile(file);
    setRecordedUrl(url);
    setIsEvaluating(false);
    setSentenceResult({
      isShadowingPractice: true,
      feedback: lang === 'en'
        ? 'Listen to your recording again, compare it with the sample, then practice it again or move on to the next item.'
        : 'Hãy nghe lại bản thu của mình, so sánh với mẫu, rồi luyện lại hoặc chuyển sang mục tiếp theo.'
    });
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-[#DD0000] uppercase mb-2">Tiếng Đức</p>
                  <div className="text-2xl sm:text-3xl font-medium text-slate-900 font-serif tracking-wide leading-relaxed break-words">{currentItem.jp}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-500 uppercase mb-2">Tiếng Việt</p>
                  <p className="text-sm text-slate-700 italic break-words">{currentItem.vi}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-500 uppercase mb-2">Tiếng Anh</p>
                  <p className="text-sm text-slate-700 italic break-words">{currentItem.en}</p>
                </div>
              </div>
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
            <AudioInput onAudioReady={handleAudioReady} expectedText={currentItem.jp} practiceMode={type} shadowingOnly />
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
            <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <CheckCircle2 size={32} className="text-blue-600 shrink-0 mt-1" />
                <div className="flex-1 w-full">
                  <h4 className="font-bold text-slate-800 mb-2 text-lg">{lang === 'en' ? 'Recording saved' : 'Đã lưu bản thu'}</h4>
                  <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">{sentenceResult.feedback}</p>
                  <div className="bg-white/70 p-2 rounded-lg inline-block w-full border border-blue-100">
                    <audio controls src={recordedUrl} className="h-10 w-full rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
              <button onClick={() => { setRecordedFile(null); setRecordedUrl(null); setSentenceResult(null); }} className="flex-1 py-4 bg-white border border-slate-300 hover:border-[#DD0000] hover:text-[#DD0000] text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
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

