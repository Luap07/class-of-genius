import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import AITutorDisplay from "../components/AITutorDisplay";
import AITutorHeader from "../components/AITutorHeader";
import AITutorSidebar from "../components/AITutorSidebar";

import SubjectsPanel from "../panels/SubjectsPanel";
import ProgressPanel from "../panels/ProgressPanel";
import SettingsPanel from "../panels/SettingsPanel";

import MathText from "../components/MathText";
import { Send } from "lucide-react";

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

  // ================= AI API =================
  const sendToAI = async (message) => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          subject: "General",
          classLevel: classType,
          language:
            localStorage.getItem("ai_language") || "English",
        }),
      });

      const data = await res.json();
      return data.reply || "No response";
    } catch (err) {
      console.log(err);
      return "AI failed to respond.";
    } finally {
      setLoading(false);
    }
  };

  // ================= SPEECH =================
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const i = event.resultIndex;
      const text =
        event.results[i][0].transcript.trim();

      if (event.results[i].isFinal && !isAISpeaking) {
        handleUserSpeak(text);
      }
    };

    recognition.onend = () => {
      if (isActiveRef.current) recognition.start();
    };

    recognitionRef.current = recognition;

    return () => {
      isActiveRef.current = false;
      recognition.stop();
    };
  }, [isAISpeaking]);

  const startSpeak = () => {
    setSessionMode("speak");
    isActiveRef.current = true;
    recognitionRef.current?.start();
  };

  const stopSpeak = () => {
    isActiveRef.current = false;
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setIsAISpeaking(false);
  };

  const startWrite = () => {
    setSessionMode("write");
    stopSpeak();
  };

  // ================= AI =================
  const handleUserSpeak = async (text) => {
    if (!text.trim()) return;

    const aiText = await sendToAI(text);

    setMessages((p) => [
      ...p,
      { role: "user", text },
      { role: "ai", text: aiText },
    ]);

    speakAI(aiText);
  };

  const handleWriteMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    const aiText = await sendToAI(userText);

    setMessages((p) => [
      ...p,
      { role: "user", text: userText },
      { role: "ai", text: aiText },
    ]);

    speakAI(aiText);
  };

  // ================= 🔥 IMPROVED SPEECH CLEANER =================
  const cleanForSpeech = (text) => {
    return text
      // remove LaTeX
      .replace(/\$\$/g, "")
      .replace(/\$/g, "")

      // fractions
      .replace(/\\frac/g, "fraction")
      .replace(/\\dfrac/g, "fraction")

      // square root
      .replace(/\\sqrt/g, "square root")

      // math symbols
      .replace(/\\times/g, "times")
      .replace(/\\div/g, "divided by")
      .replace(/\\cdot/g, "times")

      // integrals / limits noise
      .replace(/\\lim/g, "limit")
      .replace(/\\to/g, "to")

      // braces cleanup
      .replace(/\{|\}/g, "")

      // remove backslashes
      .replace(/\\/g, " ")

      // fix multiple spaces
      .replace(/\s+/g, " ");
  };

  // ================= VOICE =================
  const speakAI = (text) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      cleanForSpeech(text)
    );

    const voiceType =
      localStorage.getItem("ai_voice") || "female";
    const language =
      localStorage.getItem("ai_language") || "English";

    const langMap = {
      English: "en-US",
      French: "fr-FR",
      Spanish: "es-ES",
    };

    utterance.lang = langMap[language] || "en-US";

    const pickVoice = () => {
      const voices =
        window.speechSynthesis.getVoices();

      let selected =
        voiceType === "male"
          ? voices.find((v) =>
              /male|david|mark/i.test(v.name)
            )
          : voices.find((v) =>
              /female|zira|susan/i.test(v.name)
            );

      utterance.voice = selected || voices[0];

      window.speechSynthesis.speak(utterance);
    };

    utterance.onstart = () =>
      setIsAISpeaking(true);

    utterance.onend = () =>
      setIsAISpeaking(false);

    const voices =
      window.speechSynthesis.getVoices();

    if (voices.length) pickVoice();
    else
      window.speechSynthesis.onvoiceschanged =
        pickVoice;
  };

  // ================= PANEL FIX (IMPORTANT) =================
  const renderPanel = () => {
    if (activePanel === "subjects")
      return <SubjectsPanel />;
    if (activePanel === "progress")
      return <ProgressPanel />;
    if (activePanel === "settings")
      return <SettingsPanel />;

    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#020617] via-[#0b1120] to-[#020614] text-white overflow-hidden">

      <AITutorHeader />

      <div className="flex flex-1 overflow-hidden">
        <AITutorSidebar setActivePanel={setActivePanel} />

        <div className="flex flex-1 gap-6 p-6 overflow-x-auto md:overflow-hidden flex-nowrap">

          {/* LEFT */}
          <div className="w-[90%] md:w-1/3 min-w-[280px]">
            <AITutorDisplay
              onStartSpeak={startSpeak}
              onStartWrite={startWrite}
              onStop={stopSpeak}
              sessionMode={sessionMode}
            />
          </div>

          {/* RIGHT */}
          <div className="w-[90%] md:flex-1 min-w-[280px] bg-slate-900/80 rounded-2xl p-4 flex flex-col overflow-hidden">

            <div className="mb-4 border-b border-slate-700 pb-3">
              <h2 className="text-2xl font-bold text-blue-300">
                AI Tutor
              </h2>

              <p className="text-sm text-slate-400">
                {sessionMode === "speak" &&
                  "🎤 Voice Mode"}
                {sessionMode === "write" &&
                  "✍️ Writing Mode"}
                {sessionMode === "idle" &&
                  "Choose Mode"}
              </p>
            </div>

            {/* PANEL SYSTEM */}
            {activePanel !== "home" ? (
              <div className="flex-1 overflow-y-auto">
                {renderPanel()}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl max-w-[85%] ${
                        m.role === "ai"
                          ? "bg-blue-900/30"
                          : "bg-slate-700 ml-auto"
                      }`}
                    >
                      <MathText text={m.text} />
                    </div>
                  ))}

                  {loading && (
                    <p className="text-gray-400 text-sm">
                      AI is thinking...
                    </p>
                  )}
                </div>

                {sessionMode === "write" && (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={input}
                      onChange={(e) =>
                        setInput(e.target.value)
                      }
                      className="flex-1 p-3 rounded-xl bg-slate-800"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleWriteMessage()
                      }
                    />
                    <button
                      onClick={handleWriteMessage}
                      className="p-3 bg-blue-600 rounded-xl"
                    >
                      <Send size={18} />
                    </button>
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