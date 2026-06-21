import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AITutorDisplay from "../components/AITutorDisplay";

const AITutorSession = () => {
  const [params] = useSearchParams();
  const classType = params.get("class");

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Welcome 👋 I'm your AI tutor. Let's start ${classType || "your lesson"}.`,
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };

    // fake AI reply (you will later replace with real AI API)
    const aiReply = {
      role: "ai",
      text: `I understand. Let's break this topic down step by step...`,
    };

    setMessages((prev) => [...prev, userMsg, aiReply]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-white flex flex-col md:flex-row gap-6 p-6">

      {/* LEFT: AI ROBOT PANEL */}
      <div className="md:w-1/3">
        <AITutorDisplay />
      </div>

      {/* RIGHT: CHAT AREA */}
      <div className="flex-1 bg-slate-900 rounded-xl p-4 flex flex-col border border-slate-800">

        {/* HEADER */}
        <div className="mb-4 border-b border-slate-700 pb-3">
          <h2 className="text-xl font-bold">
            {classType ? `${classType} AI Tutor` : "AI Tutor"}
          </h2>
          <p className="text-sm text-gray-400">
            Your personal learning assistant is active
          </p>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === "ai"
                  ? "bg-blue-900/40 border border-blue-700"
                  : "bg-slate-700 ml-auto"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your tutor..."
            className="flex-1 p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
          />

          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default AITutorSession;