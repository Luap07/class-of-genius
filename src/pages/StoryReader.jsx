// src/pages/StoryReader.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Moon, Sun, BookOpen, X, Volume2, VolumeX } from "lucide-react";
import Cog from "../assets/cog.png";

const StoryReader = () => {
  const { id } = useParams();
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchNovel = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("novels").select("*").eq("id", id).single();
      if (error) { setLoading(false); return; }
      setNovel(data);
      setLoading(false);
      const saved = localStorage.getItem(`reader-${id}`);
      if (saved) setStepIndex(Number(saved));
    };
    fetchNovel();
  }, [id]);

  const chapters = novel?.chapters || [];

  /* ================= FLOW ================= */
  const flow = useMemo(() => {
    if (!novel) return [];
    return [
      { type: "cover", title: novel.title, image: novel.cover_url, description: novel.description },
      { type: "intro", content: novel.introduction },
      ...chapters.map((c, i) => ({ type: "chapter", number: i + 1, title: c.title, content: c.content })),
    ];
  }, [novel, chapters]);

  const current = flow[stepIndex] || {};

  /* ================= VOICE READING ================= */
  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = current.content || current.description || current.title;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsSpeaking(false);
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stop speaking when switching pages
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [stepIndex]);

  /* ================= UI/RENDER ================= */
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className={`h-screen flex overflow-hidden ${darkMode ? "bg-[#05070f] text-white" : "bg-white text-black"}`}>
      {/* SIDEBAR */}
      <div className={`fixed md:static w-72 h-full border-r z-50 bg-white/5 backdrop-blur ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 flex justify-between border-b"><b>Contents</b><button onClick={() => setSidebarOpen(false)} className="md:hidden"><X /></button></div>
        <div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-60px)]">
          <div onClick={() => setStepIndex(0)} className="cursor-pointer font-semibold">📘 Cover</div>
          <div onClick={() => setStepIndex(1)} className="cursor-pointer">📖 Introduction</div>
          {chapters.map((c, i) => (
            <div key={i} onClick={() => setStepIndex(i + 2)} className="cursor-pointer">{c.title || `Chapter ${i + 1}`}</div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP BAR */}
        <div className="flex justify-between items-center p-3 border-b">
          <div className="flex items-center gap-2"><img src={Cog} className="w-7 h-7" /><b>Scholiqen Reader</b></div>
          <div className="flex gap-2 items-center">
            <button onClick={toggleSpeech}>{isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            <button onClick={() => setFontSize((p) => Math.max(14, p - 1))}>A-</button>
            <button onClick={() => setFontSize((p) => Math.min(24, p + 1))}>A+</button>
            <button onClick={() => setDarkMode((p) => !p)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={() => setSidebarOpen((p) => !p)} className="md:hidden"><BookOpen /></button>
          </div>
        </div>

        {/* PROGRESS & CONTENT */}
        <div className="h-1 bg-gray-300"><div className="h-1 bg-blue-600 transition-all" style={{ width: `${((stepIndex + 1) / flow.length) * 100}%` }} /></div>
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {current.type === "cover" && (
            <div className="w-full text-left">
              <img src={current.image} className="w-full h-96 object-cover rounded-xl shadow-lg" />
              <h1 className="text-4xl font-bold mt-6">{current.title}</h1>
              {current.description && <p className="mt-4 text-xl text-gray-500 leading-relaxed italic">{current.description}</p>}
            </div>
          )}
          {current.type !== "cover" && (
            <div>
              {current.type === "chapter" && <div className="text-center text-gray-400">Chapter {current.number}</div>}
              <h2 className="text-center font-bold text-blue-500 mb-4">{current.title}</h2>
              <p style={{ fontSize, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{current.content}</p>
            </div>
          )}
        </div>
        
        {/* NAV */}
        <div className="flex justify-between p-4 border-t">
          <button onClick={() => setStepIndex((p) => Math.max(0, p - 1))}>Prev</button>
          <button onClick={() => setStepIndex((p) => Math.min(flow.length - 1, p + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default StoryReader;