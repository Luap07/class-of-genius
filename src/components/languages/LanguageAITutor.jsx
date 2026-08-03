import React, { useState } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Languages,
} from "lucide-react";

export default function LanguageAITutor({ language }) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello 👋 I'm your ${
        language?.name || ""
      } AI Tutor.

Ask me anything about grammar, vocabulary, pronunciation, writing or conversation.`,
    },
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setMessage("");

    /*
      AI Integration comes here.

      Example:

      const response = await fetch("/api/language-ai",{
        method:"POST",
        body:JSON.stringify({
          language:language.id,
          message
        })
      });

      const data = await response.json();
    */

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "AI response will appear here after backend integration.",
        },
      ]);
    }, 700);
  };

  return (
    <div className="space-y-8">

      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-8">

        <div className="flex items-center gap-5">

          <div className="rounded-3xl bg-violet-500/20 p-5">

            <Brain className="h-10 w-10 text-violet-300" />

          </div>

          <div>

            <h1 className="text-3xl font-black text-white">
              AI Language Tutor
            </h1>

            <p className="mt-2 text-slate-300">
              Practice {language?.name} with your personal AI teacher.
            </p>

          </div>

        </div>

      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900">

        <div className="flex items-center gap-3 border-b border-white/10 p-6">

          <Sparkles className="text-violet-400" />

          <span className="font-bold">
            Conversation
          </span>

        </div>

        <div className="h-[500px] overflow-y-auto space-y-5 p-6">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-xl rounded-3xl px-5 py-4 ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-slate-800"
                }`}
              >

                {msg.content}

              </div>

            </div>

          ))}

        </div>

        <div className="border-t border-white/10 p-6">

          <div className="flex gap-4">

            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder={`Ask something about ${language?.name}...`}
              className="flex-1 rounded-2xl border border-white/10 bg-slate-800 px-5 py-4 text-white outline-none focus:border-violet-500"
            />

            <button
              onClick={sendMessage}
              className="rounded-2xl bg-violet-600 px-6 hover:bg-violet-500"
            >

              <Send />

            </button>

          </div>

        </div>

      </div>

      <div className="grid gap-5 md:grid-cols-3">

        <button className="rounded-3xl bg-slate-900 p-6 text-left hover:border-violet-500 border border-white/10">

          <Languages className="mb-4 text-blue-400" />

          <h2 className="font-black">
            Explain Grammar
          </h2>

        </button>

        <button className="rounded-3xl bg-slate-900 p-6 text-left hover:border-green-500 border border-white/10">

          <Languages className="mb-4 text-green-400" />

          <h2 className="font-black">
            Practice Conversation
          </h2>

        </button>

        <button className="rounded-3xl bg-slate-900 p-6 text-left hover:border-yellow-500 border border-white/10">

          <Languages className="mb-4 text-yellow-400" />

          <h2 className="font-black">
            Translate Sentence
          </h2>

        </button>

      </div>

    </div>
  );
}