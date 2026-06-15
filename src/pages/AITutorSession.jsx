import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import AITutorSidebar from "../components/AITutorSidebar";
import ChatHeader from "../components/ChatHeader";
import ChatBubble from "../components/ChatBubble";
import TypingAnimation from "../components/TypingAnimation";

const AITutorSession = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("ai_chat_history");
    return saved ? JSON.parse(saved) : [{
      role: "ai",
      text: "👋 Welcome to Scholiqen AI Tutor. Ask anything and I’ll guide you step-by-step.",
      time: new Date().toLocaleTimeString(),
    }];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    
    // Add user message
    const userMsg = { role: "user", text: userText, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      // Add a placeholder AI message
      setMessages((prev) => [...prev, { role: "ai", text: "", time: new Date().toLocaleTimeString() }]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        aiText += decoder.decode(value, { stream: true });
        
        // Update the last message (the AI's) in real-time
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = aiText;
          return newMsgs;
        });
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Server connection failed.", time: new Date().toLocaleTimeString() }]);
      setLoading(false);
    }
  };

  const newChat = () => {
    const starter = [{ role: "ai", text: "🧠 New session started. How can I help you?", time: new Date().toLocaleTimeString() }];
    setMessages(starter);
  };

  return (
    <div className="h-screen w-full flex bg-[#05070f] text-white overflow-hidden">
      <AITutorSidebar chats={[]} activeChat={null} setActiveChat={() => {}} createNewChat={newChat} />
      
      <div className="flex-1 flex flex-col min-h-0">
        <ChatHeader />
        
        <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
          {loading && <TypingAnimation />}
        </div>

        <div className="border-t border-white/10 p-4 flex gap-2 bg-[#090d18]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-blue-500 transition"
          />
          <button onClick={sendMessage} className="px-5 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutorSession;