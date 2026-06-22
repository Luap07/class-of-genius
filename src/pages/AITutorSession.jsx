import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AITutorDisplay from "../components/AITutorDisplay";
import AITutorHeader from "../components/AITutorHeader";
import AITutorSidebar from "../components/AITutorSidebar";
import { Send } from "lucide-react";

const AITutorSession = () => {
  const [params] = useSearchParams();
  const classType = params.get("class");

  const [sessionMode, setSessionMode] = useState("idle"); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const recognitionRef = useRef(null);
  const isActiveRef = useRef(false);

  // =========================
  // INIT SPEECH RECOGNITION
  // =========================
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      handleUserSpeak(text);
    };

    recognition.onend = () => {
      if (isActiveRef.current) {
        setTimeout(() => recognition.start(), 300);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const startSpeak = () => {
    setSessionMode("speak");
    isActiveRef.current = true;
    setTimeout(() => { recognitionRef.current?.start(); }, 300);
  };

  const stopSpeak = () => {
    isActiveRef.current = false;
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
  };

  const startWrite = () => {
    setSessionMode("write");
    stopSpeak();
  };

  const handleUserSpeak = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text };
    const aiText = generateAI(text);
    const aiMsg = { role: "ai", text: aiText };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    speakAI(aiText);
  };

  const handleWriteMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const aiText = generateAI(input);
    const aiMsg = { role: "ai", text: aiText };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const generateAI = (text) => {
    return `Let me explain clearly: ${text}. Step by step like your tutor.`;
  };

  const speakAI = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      if (isActiveRef.current) { recognitionRef.current?.start(); }
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    // FIX: Changed h-[100px] to h-screen
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#020617] via-[#0b1120] to-[#020614] text-white overflow-hidden">

      <AITutorHeader />

      <div className="flex flex-1 overflow-hidden">
        <AITutorSidebar />

        <div className="flex flex-1 gap-6 p-6 overflow-hidden">
          {/* LEFT */}
          <div className="md:w-1/3">
            <AITutorDisplay
              onStartSpeak={startSpeak}
              onStartWrite={startWrite}
              onStop={stopSpeak}
              sessionMode={sessionMode}
            />
          </div>

          {/* RIGHT */}
          <div className="flex-1 bg-slate-900/80 rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="mb-4 border-b border-slate-700 pb-3">
              <h2 className="text-2xl font-bold text-blue-300">AI Tutor</h2>
              <p className="text-sm text-slate-400">
                {sessionMode === "speak" && "🎤 Live Voice Tutor"}
                {sessionMode === "write" && "✍️ Writing Mode"}
                {sessionMode === "idle" && "Choose Speak or Write"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl max-w-[80%] ${
                    msg.role === "ai" ? "bg-blue-900/30" : "bg-slate-700 ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {sessionMode === "write" && (
              <div className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 p-3 rounded-xl bg-slate-800 text-white placeholder-slate-500"
                  onKeyDown={(e) => e.key === "Enter" && handleWriteMessage()}
                />
                <button
                  onClick={handleWriteMessage}
                  className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutorSession;