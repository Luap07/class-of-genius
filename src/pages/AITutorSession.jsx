import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";

const AITutorSession = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("ai_chat_history");
    return saved
      ? JSON.parse(saved)
      : [
          {
            role: "ai",
            text: "I am your AI Tutor 🤖 — I’m here to help you learn!",
            time: new Date().toLocaleTimeString(),
          },
        ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* ================= SAVE HISTORY ================= */
  useEffect(() => {
    localStorage.setItem("ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    const question = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      const aiMsg = {
        role: "ai",
        text: data.answer || "I couldn't process that.",
        time: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Error connecting to AI server.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }

    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div className="h-screen flex flex-col bg-[#05070f] text-white">

      {/* HEADER */}
      <div className="p-4 border-b border-white/10 text-center font-bold text-blue-400">
        🧠 AI Tutor Session
      </div>

      {/* CHAT AREA */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >

            {/* AI ICON */}
            {msg.role === "ai" && (
              <div className="p-2 rounded-full bg-blue-600/20">
                <Bot size={18} className="text-blue-400" />
              </div>
            )}

            {/* MESSAGE BOX */}
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {msg.text}

              <div className="text-[10px] opacity-60 mt-1">
                {msg.time}
              </div>
            </div>

            {/* USER ICON */}
            {msg.role === "user" && (
              <div className="p-2 rounded-full bg-white/10">
                <User size={18} className="text-white/70" />
              </div>
            )}
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="text-gray-400 text-sm animate-pulse">
            AI is thinking...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-4 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AITutorSession;