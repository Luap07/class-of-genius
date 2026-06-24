import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import AITutorDisplay from "../components/AITutorDisplay";
import AITutorHeader from "../components/AITutorHeader";
import AITutorSidebar from "../components/AITutorSidebar";
import SubjectsPanel from "../panels/SubjectsPanel";
import ProgressPanel from "../panels/ProgressPanel";
import SettingsPanel from "../panels/SettingsPanel";
import MathText from "../components/MathText";

const AITutorSession = () => {
  const [params] = useSearchParams();
  const classType = params.get("class") || "WAEC";
  const [sessionMode, setSessionMode] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activePanel, setActivePanel] = useState("home");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const isActiveRef = useRef(false);
  const [currentSubject, setCurrentSubject] = useState("General");
  const [currentTopic, setCurrentTopic] = useState("Introduction");

  const updateProgress = async (subject, topic) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const storageKey = `studentProgress_${user.id}`;
    let saved = JSON.parse(localStorage.getItem(storageKey)) || { subjects: {} };
    if (!saved.subjects[subject]) saved.subjects[subject] = { topics: {} };
    if (!saved.subjects[subject].topics[topic]) saved.subjects[subject].topics[topic] = { completed: 0, total: 10 };
    saved.subjects[subject].topics[topic].completed += 1;
    localStorage.setItem(storageKey, JSON.stringify(saved));

    const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const weekStorageKey = `studentWeeklyProgress_${user.id}`;
    let savedWeek = JSON.parse(localStorage.getItem(weekStorageKey)) || { weekData: [0, 0, 0, 0, 0, 0, 0] };
    savedWeek.weekData[dayIndex] = Math.min((savedWeek.weekData[dayIndex] || 0) + 5, 100);
    localStorage.setItem(weekStorageKey, JSON.stringify(savedWeek));
    
    window.dispatchEvent(new Event("storage-update"));
  };

  const startSpeak = () => { setSessionMode("speak"); isActiveRef.current = true; recognitionRef.current?.start(); };
  const stopSpeak = () => { isActiveRef.current = false; recognitionRef.current?.stop(); window.speechSynthesis.cancel(); setIsAISpeaking(false); };
  const startWrite = () => { setSessionMode("write"); stopSpeak(); };

  const sendToAI = async (message) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, subject: currentSubject, classLevel: classType, language: localStorage.getItem("ai_language") || "English" }),
      });
      const data = await res.json();
      return data.reply || "No response";
    } catch (err) { return "AI failed to respond."; } finally { setLoading(false); }
  };

  const detectSubjectAndTopic = (text) => {
    const t = text.toLowerCase();
    if (t.includes("fraction")) { setCurrentSubject("Mathematics"); setCurrentTopic("Fractions"); }
    else if (t.includes("algebra")) { setCurrentSubject("Mathematics"); setCurrentTopic("Algebra"); }
    else if (t.includes("biology")) { setCurrentSubject("Biology"); setCurrentTopic("Cell Biology"); }
    else if (t.includes("physics")) { setCurrentSubject("Physics"); setCurrentTopic("Motion"); }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = event.results[event.resultIndex][0].transcript.trim();
      if (event.results[event.resultIndex].isFinal && !isAISpeaking) handleUserSpeak(text);
    };
    recognitionRef.current = recognition;
    return () => { isActiveRef.current = false; recognition.stop(); };
  }, [isAISpeaking]);

  const handleUserSpeak = async (text) => {
    detectSubjectAndTopic(text);
    const aiText = await sendToAI(text);
    setMessages((p) => [...p, { role: "user", text }, { role: "ai", text: aiText }]);
    await updateProgress(currentSubject, currentTopic);
    speakAI(aiText);
  };

  const handleWriteMessage = async () => {
    if (!input.trim()) return;
    const userText = input; setInput("");
    detectSubjectAndTopic(userText);
    const aiText = await sendToAI(userText);
    setMessages((p) => [...p, { role: "user", text: userText }, { role: "ai", text: aiText }]);
    await updateProgress(currentSubject, currentTopic);
    speakAI(aiText);
  };

  const speakAI = (text) => {
    window.speechSynthesis.cancel();
    
    // Convert LaTeX math to spoken language
    let spokenText = text
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 divided by $2")
      .replace(/\^\{?([^}]+)\}?/g, " to the power of $1")
      .replace(/\\sqrt\{([^}]+)\}/g, "the square root of $1")
      .replace(/=/g, " equals ")
      .replace(/\+/g, " plus ")
      .replace(/-/g, " minus ")
      .replace(/\*/g, " times ")
      .replace(/\//g, " divided by ")
      .replace(/[\$\{\}\\]/g, ""); 

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white overflow-hidden">
      <AITutorHeader />
      <div className="flex flex-1 overflow-hidden">
        <AITutorSidebar setActivePanel={setActivePanel} />
        <div className="flex flex-1 gap-6 p-6 overflow-hidden">
          <div className="w-1/3 min-w-[280px]">
            <AITutorDisplay onStartSpeak={startSpeak} onStartWrite={startWrite} onStop={stopSpeak} sessionMode={sessionMode} />
          </div>
          <div className="flex-1 bg-slate-900/80 rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="mb-4 border-b border-slate-700 pb-3">
              <h2 className="text-2xl font-bold text-blue-300">AI Tutor</h2>
              <p className="text-sm text-slate-400">Subject: {currentSubject} | Topic: {currentTopic}</p>
            </div>
            {activePanel !== "home" ? (
              <div className="flex-1 overflow-y-auto">
                {activePanel === "subjects" && <SubjectsPanel />}
                {activePanel === "progress" && <ProgressPanel />}
                {activePanel === "settings" && <SettingsPanel />}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className={`p-3 rounded-xl ${m.role === "ai" ? "bg-blue-900/30" : "bg-slate-700 ml-auto"}`}>
                      <MathText text={m.text} />
                    </div>
                  ))}
                  {loading && <p className="text-gray-400 text-sm italic">AI is thinking...</p>}
                </div>
                {sessionMode === "write" && (
                  <div className="mt-4 flex gap-2">
                    <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-800" onKeyDown={(e) => e.key === "Enter" && handleWriteMessage()} />
                    <button onClick={handleWriteMessage} className="p-3 bg-blue-600 rounded-xl"><Send size={18} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutorSession;