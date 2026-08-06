import React,{
useEffect,
useMemo,
useRef,
useState,
} from "react";

import {
useNavigate,
useParams,
} from "react-router-dom";

import {
motion,
AnimatePresence,
} from "framer-motion";

import {
Menu,
X,
BookOpen,
Bookmark,
BookmarkCheck,
ChevronLeft,
ChevronRight,
Moon,
Sun,
Play,
Pause,
Volume2,
VolumeX,
Clock3,
Languages,
PanelsTopLeft,
Settings2,
Type,
Sparkles,
Star,
Search,
Home,
List,
RotateCcw,
Maximize2,
Minimize2,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import ReaderReviews from "../components/ReaderReviews";
import Cog from "../assets/cog.png";

export default function StoryReader(){

const { id }=useParams();

const navigate=useNavigate();

const contentRef=useRef(null);

const speechRef=useRef(null);

/* ===============================
STATE
=============================== */

const [loading,setLoading]=useState(true);

const [novel,setNovel]=useState(null);

const [stepIndex,setStepIndex]=useState(0);

const [sidebarOpen,setSidebarOpen]=useState(false);

const [settingsOpen,setSettingsOpen]=useState(false);

const [coverPage,setCoverPage]=useState(true);

const [fontSize,setFontSize]=useState(18);

const [lineHeight,setLineHeight]=useState(2);

const [readingWidth,setReadingWidth]=useState("4xl");

const [theme,setTheme]=useState(
localStorage.getItem("reader-theme") ||
"dark"
);

const [isSpeaking,setIsSpeaking]=useState(false);

const [voices,setVoices]=useState([]);

const [selectedVoice,setSelectedVoice]=useState("");

const [voiceRate,setVoiceRate]=useState(1);

const [voicePitch,setVoicePitch]=useState(1);

const [progress,setProgress]=useState(0);

const [bookmarks,setBookmarks]=useState([]);

const [lastRead,setLastRead]=useState(null);

const [search,setSearch]=useState("");

/* ===============================
LOAD BOOK
=============================== */

useEffect(()=>{

fetchNovel();

},[id]);

const fetchNovel=async()=>{

setLoading(true);

const {data,error}=await supabase

.from("novels")

.select("*")

.eq("id",id)

.single();

if(error){

console.log(error);

setLoading(false);

return;

}

setNovel(data);

setLoading(false);

const saved=JSON.parse(
localStorage.getItem(
`reader-progress-${id}`
)
);

if(saved){

setLastRead(saved);

}

};

/* ===============================
FLOW
=============================== */

const chapters=novel?.chapters || [];

const flow=useMemo(()=>{

if(!novel) return[];

return[

{
type:"cover",
title:novel.title,
description:novel.description,
image:novel.cover_url,
},

{
type:"intro",
title:"Introduction",
content:novel.introduction,
},

...chapters.map((chapter,index)=>({

type:"chapter",

number:index+1,

title:chapter.title,

content:chapter.content,

}))

];

},[novel]);

const current=flow[stepIndex] || {};

/* ===========================
   THEME COLORS
=========================== */

const themeStyles = useMemo(() => {
  switch (theme) {
    case "light":
      return {
        page: "bg-white text-slate-900",
        card: "bg-white border border-slate-200 shadow-lg",
        sidebar: "bg-white/95 backdrop-blur-xl border-r border-slate-200 text-slate-900",
        nav: "bg-white/90 backdrop-blur-xl border-b border-slate-200",
        input: "bg-slate-100 text-slate-900",
        secondary: "text-slate-600",
        progress: "bg-slate-200",
      };

    case "sepia":
      return {
        page: "bg-[#F7F1E3] text-[#2D2418]",
        card: "bg-[#FFF8EC] border border-[#E5D7B8]",
        sidebar: "bg-[#FFF8EC]/95 backdrop-blur-xl border-r border-[#E5D7B8] text-[#2D2418]",
        nav: "bg-[#FFF8EC]/95 backdrop-blur-xl border-b border-[#E5D7B8]",
        input: "bg-[#F1E6CE] text-[#2D2418]",
        secondary: "text-[#6B5A43]",
        progress: "bg-[#E5D7B8]",
      };

    case "forest":
      return {
        page: "bg-[#0E1B16] text-[#ECFDF5]",
        card: "bg-[#16251F] border border-emerald-800/40",
        sidebar: "bg-[#16251F]/95 backdrop-blur-xl border-r border-emerald-800/40 text-[#ECFDF5]",
        nav: "bg-[#16251F]/95 backdrop-blur-xl border-b border-emerald-800/40",
        input: "bg-[#22352D] text-white",
        secondary: "text-emerald-200/80",
        progress: "bg-[#22352D]",
      };

    default:
      return {
        page: "bg-[#0B1220] text-slate-100",
        card: "bg-[#131D31] border border-slate-700/60",
        sidebar: "bg-[#101827]/95 backdrop-blur-xl border-r border-slate-700/60 text-white",
        nav: "bg-[#101827]/95 backdrop-blur-xl border-b border-slate-700/60",
        input: "bg-slate-800 text-white",
        secondary: "text-slate-400",
        progress: "bg-slate-800",
      };
  }
}, [theme]);

/* ===========================
   COLLAPSIBLE SIDEBAR
=========================== */

const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

/* ===========================
   READER REVIEW DROPDOWN
=========================== */

const [showReviews, setShowReviews] = useState(false);

/* ===========================
   SPEECH SYNTHESIS
=========================== */

useEffect(() => {
  const loadVoices = () => {
    const v = window.speechSynthesis.getVoices();
    setVoices(v);
    if (v.length && !selectedVoice) setSelectedVoice(v[0].name);
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}, []);

const speak = () => {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return;
  }
  const text = current.content || current.description || current.title || "";
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = voices.find(v => v.name === selectedVoice);
  if (voice) utterance.voice = voice;
  utterance.rate = voiceRate;
  utterance.pitch = voicePitch;
  utterance.onend = () => setIsSpeaking(false);
  
  speechRef.current = utterance;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  setIsSpeaking(true);
};

/* ===========================
   AUTO SAVE
=========================== */

useEffect(() => {
  if (!flow.length) return;

  localStorage.setItem(
    `reader-progress-${id}`,
    JSON.stringify({
      stepIndex,
      scroll: contentRef.current?.scrollTop || 0,
      updatedAt: Date.now(),
    })
  );

  setProgress(((stepIndex + 1) / flow.length) * 100);
}, [stepIndex, id, flow.length]);

/* ===========================
   RESTORE SCROLL
=========================== */

useEffect(() => {
  if (!lastRead || !contentRef.current) return;

  requestAnimationFrame(() => {
    contentRef.current.scrollTop = lastRead.scroll || 0;
  });
}, [stepIndex]);

/* ===========================
   STOP SPEECH
=========================== */

useEffect(() => {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
}, [stepIndex]);

/* ===========================
   HELPERS
=========================== */

const continueReading = () => {
  setStepIndex(lastRead ? lastRead.stepIndex : 1);
  setCoverPage(false);
  if (contentRef.current) {
    contentRef.current.scrollTop = 0;
  }
};

const restartBook = () => {
  localStorage.removeItem(`reader-progress-${id}`);
  setLastRead(null);
  setStepIndex(1);
  setCoverPage(false);
  if (contentRef.current) {
    contentRef.current.scrollTop = 0;
  }
};

/* ===========================
   LOADING
=========================== */

if (loading) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="h-16 w-16 rounded-full border-4 border-cyan-500 border-t-transparent"
      />
    </div>
  );
}

/* ===========================
   MAIN LAYOUT
=========================== */

return(
<div className={`flex h-screen overflow-hidden transition-all duration-300 ${themeStyles.page}`}>

{/* ===========================
    CHATGPT STYLE SIDEBAR
=========================== */}

<motion.aside
animate={{
width:sidebarCollapsed?72:300
}}
transition={{
duration:.25
}}
className={`${themeStyles.sidebar} hidden md:flex flex-col`}>

<div className="flex items-center justify-between border-b border-white/10 p-4">

{!sidebarCollapsed&&(
<div className="flex items-center gap-3">

<img
src={Cog}
alt=""
className="h-9 w-9 rounded-xl"
/>

<div>

<h2 className="font-black">
Scholiqen Reader
</h2>

<p className={`text-xs ${themeStyles.secondary}`}>
Premium Reader
</p>

</div>

</div>
)}

<button
onClick={()=>setSidebarCollapsed(!sidebarCollapsed)}
className="rounded-xl p-2 transition hover:bg-cyan-500/10">

<PanelsTopLeft size={20}/>

</button>

</div>

<div className="flex-1 overflow-y-auto py-3">

<button
onClick={()=>{
setCoverPage(true);
setSidebarOpen(false);
if(contentRef.current) contentRef.current.scrollTop = 0;
}}
className={`mx-3 mb-2 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-cyan-500/10`}>

<BookOpen size={18}/>

{!sidebarCollapsed&&(
<span>
Book Cover
</span>
)}

</button>

<button
onClick={()=>{
setStepIndex(1);
setCoverPage(false);
if(contentRef.current) contentRef.current.scrollTop = 0;
}}
className="mx-3 mb-2 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-cyan-500/10">

<Star size={18}/>

{!sidebarCollapsed&&(
<span>
Introduction
</span>
)}

</button>

<div className="mt-4 px-3">

{!sidebarCollapsed&&(

<p className={`mb-3 text-xs font-bold uppercase ${themeStyles.secondary}`}>
Chapters
</p>

)}

{chapters.map((chapter,index)=>(

<button
key={index}
onClick={()=>{
setStepIndex(index+2);
setCoverPage(false);
if(contentRef.current) contentRef.current.scrollTop = 0;
}}
className={`mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-cyan-500/10 ${stepIndex===index+2?"bg-cyan-500/20":""}`}>

<List size={17}/>

{!sidebarCollapsed&&(

<div className="overflow-hidden">

<p className="truncate font-semibold">

{chapter.title||`Chapter ${index+1}`}

</p>

<p className={`truncate text-xs ${themeStyles.secondary}`}>

Chapter {index+1}

</p>

</div>

)}

</button>

))}

</div>

</div>

<div className="border-t border-white/10 p-4">

{!sidebarCollapsed&&(

<>

<div className="mb-2 flex items-center justify-between">

<span className="text-sm font-semibold">

Progress

</span>

<span className="text-sm">

{Math.round(progress)}%

</span>

</div>

<div className={`h-2 overflow-hidden rounded-full ${themeStyles.progress}`}>

<div
className="h-full rounded-full bg-cyan-500 transition-all"
style={{
width:`${progress}%`
}}
/>

</div>

</>

)}

</div>

</motion.aside>

{/* ===========================
    MOBILE SIDEBAR
=========================== */}

<AnimatePresence>

{sidebarOpen&&(

<>

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
onClick={()=>setSidebarOpen(false)}
className="fixed inset-0 z-40 bg-black/40"
/>

<motion.aside
initial={{x:-320}}
animate={{x:0}}
exit={{x:-320}}
transition={{duration:.25}}
className={`fixed left-0 top-0 z-50 flex h-full w-80 flex-col ${themeStyles.sidebar}`}>

<div className="flex items-center justify-between border-b border-white/10 p-5">

<div className="flex items-center gap-3">

<img
src={Cog}
className="h-9 w-9"
/>

<h2 className="font-black">

Scholiqen Reader

</h2>

</div>

<button
onClick={()=>setSidebarOpen(false)}>

<X/>

</button>

</div>

<div className="flex-1 overflow-y-auto p-4">

<button
onClick={()=>{
setCoverPage(true);
setSidebarOpen(false);
if(contentRef.current) contentRef.current.scrollTop = 0;
}}
className="mb-3 w-full rounded-xl p-3 text-left hover:bg-cyan-500/10">

📘 Cover

</button>

<button
onClick={()=>{
setStepIndex(1);
setCoverPage(false);
setSidebarOpen(false);
if(contentRef.current) contentRef.current.scrollTop = 0;
}}
className="mb-3 w-full rounded-xl p-3 text-left hover:bg-cyan-500/10">

📖 Introduction

</button>

{chapters.map((chapter,index)=>(

<button
key={index}
onClick={()=>{
setStepIndex(index+2);
setCoverPage(false);
setSidebarOpen(false);
if(contentRef.current) contentRef.current.scrollTop = 0;
}}
className="mb-2 w-full rounded-xl p-3 text-left hover:bg-cyan-500/10">

{chapter.title||`Chapter ${index+1}`}

</button>

))}

</div>

</motion.aside>

</>

)}

</AnimatePresence>

{/* ===========================
    MAIN READER
=========================== */}

<div className="flex flex-1 flex-col overflow-hidden">

{/* ===========================
    TOP BAR
=========================== */}

<header className={`${themeStyles.nav} sticky top-0 z-30 flex items-center justify-between px-5 py-3`}>

<div className="flex items-center gap-3">

<button
onClick={()=>setSidebarOpen(true)}
className="rounded-xl p-2 transition hover:bg-cyan-500/10 md:hidden">

<Menu size={20}/>

</button>

<div>

<h2 className="text-lg font-black">

{novel?.title}

</h2>

<p className={`text-xs ${themeStyles.secondary}`}>

Premium Story Reader

</p>

</div>

</div>

<div className="flex items-center gap-2">

<button
onClick={speak}
className="rounded-xl p-2 transition hover:bg-cyan-500/10">

{isSpeaking?<VolumeX size={18}/>:<Volume2 size={18}/>}

</button>

<button
onClick={()=>setFontSize(v=>Math.max(14,v-1))}
className="rounded-xl p-2 transition hover:bg-cyan-500/10">

A-

</button>

<button
onClick={()=>setFontSize(v=>Math.min(30,v+1))}
className="rounded-xl p-2 transition hover:bg-cyan-500/10">

A+

</button>

<button
onClick={()=>setSettingsOpen(!settingsOpen)}
className="rounded-xl p-2 transition hover:bg-cyan-500/10">

<Settings2 size={18}/>

</button>

</div>

</header>

{/* ===========================
    SETTINGS PANEL
=========================== */}

<AnimatePresence>

{settingsOpen&&(

<motion.div
initial={{opacity:0,y:-15}}
animate={{opacity:1,y:0}}
exit={{opacity:0,y:-15}}
className={`${themeStyles.card} m-5 rounded-2xl p-6`}>

<h3 className="mb-5 text-xl font-black">

Reader Settings

</h3>

<div className="grid gap-5 md:grid-cols-2">

<div>

<label className="mb-2 block font-semibold">

Theme

</label>

<select
value={theme}
onChange={(e)=>{
setTheme(e.target.value);
localStorage.setItem("reader-theme", e.target.value);
}}
className={`${themeStyles.input} w-full rounded-xl p-3`}>

<option value="dark">Dark</option>

<option value="light">Light</option>

<option value="sepia">Sepia</option>

<option value="forest">Forest</option>

</select>

</div>

<div>

<label className="mb-2 block font-semibold">

Reading Width

</label>

<select
value={readingWidth}
onChange={(e)=>setReadingWidth(e.target.value)}
className={`${themeStyles.input} w-full rounded-xl p-3`}>

<option value="3xl">Compact</option>

<option value="4xl">Comfort</option>

<option value="5xl">Wide</option>

<option value="6xl">Extra Wide</option>

</select>

</div>

<div>

<label className="mb-2 block font-semibold">

Voice Speed

</label>

<input
type="range"
min="0.5"
max="2"
step="0.1"
value={voiceRate}
onChange={(e)=>setVoiceRate(Number(e.target.value))}
className="w-full"
/>

</div>

<div>

<label className="mb-2 block font-semibold">

Voice Pitch

</label>

<input
type="range"
min="0.5"
max="2"
step="0.1"
value={voicePitch}
onChange={(e)=>setVoicePitch(Number(e.target.value))}
className="w-full"
/>

</div>

<div className="md:col-span-2">

<label className="mb-2 block font-semibold">

Voice

</label>

<select
value={selectedVoice}
onChange={(e)=>setSelectedVoice(e.target.value)}
className={`${themeStyles.input} w-full rounded-xl p-3`}>

{voices.map((voice)=>(

<option
key={voice.name}
value={voice.name}>

{voice.name}

</option>

))}

</select>

</div>

</div>

</motion.div>

)}

</AnimatePresence>

{/* ===========================
    PROGRESS BAR
=========================== */}

<div className={`h-1 ${themeStyles.progress}`}>

<div
className="h-full bg-cyan-500 transition-all duration-500"
style={{
width:`${progress}%`
}}
/>

</div>

{/* ===========================
    READING AREA
=========================== */}

<div
ref={contentRef}
className="flex-1 overflow-y-auto px-6 py-8">

<div
className={`mx-auto ${
  readingWidth==="3xl"
    ? "max-w-3xl"
    : readingWidth==="4xl"
    ? "max-w-4xl"
    : readingWidth==="5xl"
    ? "max-w-5xl"
    : "max-w-6xl"
}`}
>
  {/* ===========================
    COVER PAGE
=========================== */}

{coverPage ? (

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
className={`${themeStyles.card} overflow-hidden rounded-3xl`}>

<img
src={novel.cover_url}
alt={novel.title}
className="h-[520px] w-full object-cover"
/>

<div className="p-10">

<div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-cyan-500">

<Sparkles size={18}/>

Premium Reader

</div>

<h1 className="text-5xl font-black">

{novel.title}

</h1>

<p className={`mt-6 text-lg leading-9 ${themeStyles.secondary}`}>

{novel.description}

</p>

<div className="mt-10 flex flex-wrap gap-4">

<button
onClick={continueReading}
className="rounded-2xl bg-cyan-600 px-8 py-4 font-bold text-white transition hover:bg-cyan-500">

<Play className="mr-2 inline"/>

{lastRead?"Continue Reading":"Start Reading"}

</button>

<button
onClick={restartBook}
className="rounded-2xl border border-cyan-500/20 px-8 py-4 font-bold transition hover:bg-cyan-500/10">

<RotateCcw className="mr-2 inline"/>

Restart Book

</button>

</div>

{lastRead&&(

<div className="mt-8 flex items-center gap-2 text-sm text-cyan-400">

<Clock3 size={17}/>

Last opened

{" "}

{new Date(lastRead.updatedAt).toLocaleString()}

</div>

)}

</div>

</motion.div>

):(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
className={`${themeStyles.card} rounded-3xl p-10`}>

{current.type==="chapter"&&(

<p className={`mb-3 ${themeStyles.secondary}`}>

Chapter {current.number}

</p>

)}

<h1 className="mb-8 text-center text-4xl font-black">

{current.title}

</h1>

<div
style={{
fontSize,
lineHeight,
whiteSpace:"pre-wrap"
}}
className="leading-loose">

{current.content}

</div>

<div className="mt-16 flex items-center justify-between">

<button
onClick={()=>{
if(stepIndex>0) {
  setStepIndex(stepIndex-1);
  if(contentRef.current) contentRef.current.scrollTop = 0;
}
}}
className="rounded-xl border border-cyan-500/20 px-6 py-3 transition hover:bg-cyan-500/10">

<ChevronLeft className="mr-2 inline"/>

Previous

</button>

<button
onClick={()=>{
if(stepIndex<flow.length-1){
  setStepIndex(stepIndex+1);
}else{
  setCoverPage(true);
}
if(contentRef.current) {
  contentRef.current.scrollTop = 0;
}
}}
className="rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white">

Next

<ChevronRight className="ml-2 inline"/>

</button>

</div>

</motion.div>

)}

{/* ===========================
    READER REVIEWS
=========================== */}

<div className="mt-12">

<button
onClick={()=>setShowReviews(!showReviews)}
className={`${themeStyles.card} flex w-full items-center justify-between rounded-2xl p-5 transition hover:border-cyan-500`}>

<div>

<h2 className="text-xl font-black">

Reader Reviews

</h2>

<p className={`text-sm ${themeStyles.secondary}`}>

Read what other readers think

</p>

</div>

<motion.div
animate={{
rotate:showReviews?180:0
}}>

<ChevronRight/>

</motion.div>

</button>

<AnimatePresence>

{showReviews&&(

<motion.div
initial={{
height:0,
opacity:0
}}
animate={{
height:"auto",
opacity:1
}}
exit={{
height:0,
opacity:0
}}
className="overflow-hidden">

<div className="mt-5">

<ReaderReviews novelId={id}/>

</div>

</motion.div>

)}

</AnimatePresence>

</div>

</div>

</div>

</div>

</div>

);
}