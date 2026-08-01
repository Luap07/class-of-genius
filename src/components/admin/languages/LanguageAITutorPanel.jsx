import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  Brain,
  Bot,
  User,
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
  Languages,
  BookOpen,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export default function LanguageAITutorPanel({
  language,
  lesson = "",
  section = "AI Tutor",
}) {
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const languageName =
    language?.name ||
    language?.language_name ||
    "Language";

  const nativeName =
    language?.native_name ||
    "";

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
`👋 Welcome to the ${languageName} AI Tutor.

I can help you with:

• Grammar

• Vocabulary

• Pronunciation

• Speaking Practice

• Listening Practice

• Writing

• Translation

• Conversation Practice

• Homework

• Exam Preparation

Ask me anything 😊`,
      },
    ]);
  }, [languageName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const clearConversation = () => {
    setMessages([
      {
        role: "assistant",
        content:
`New ${languageName} session started.

How can I help you today?`,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);

    const prompt = message;

    setMessage("");

    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/tutor",
        {
          mode: "language",

          language: languageName,

          nativeName,

          lesson,

          section,

          message: prompt,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "No response received.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Unable to contact the AI server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
    return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0f172a] overflow-hidden">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-6 py-5">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20">

            <Brain className="h-7 w-7 text-indigo-400" />

          </div>

          <div>

            <h2 className="text-xl font-black text-white">
              {languageName} AI Tutor
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Learn with your personal AI language teacher
            </p>

          </div>

        </div>

        <button
          onClick={clearConversation}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
        >
          <RotateCcw size={16} />
          New Chat
        </button>

      </div>

      {/* ================= CHAT ================= */}

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

        <AnimatePresence>

          {messages.map((item, index) => (

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: .25,
              }}
              className={`flex ${
                item.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[80%] rounded-3xl px-5 py-4 shadow-lg ${
                  item.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "border border-white/10 bg-[#1f2937] text-gray-200"
                }`}
              >

                <div className="mb-3 flex items-center gap-2">

                  {item.role === "assistant" ? (
                    <Bot
                      size={18}
                      className="text-indigo-400"
                    />
                  ) : (
                    <User
                      size={18}
                      className="text-white"
                    />
                  )}

                  <span className="text-xs font-bold uppercase tracking-wider">

                    {item.role === "assistant"
                      ? "AI Tutor"
                      : "You"}

                  </span>

                </div>

                <div className="whitespace-pre-wrap leading-8 text-[15px]">

                  {item.content}

                </div>

              </div>

            </motion.div>

          ))}

        </AnimatePresence>

        {loading && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="flex justify-start"
          >

            <div className="rounded-3xl border border-white/10 bg-[#1f2937] px-5 py-4">

              <div className="flex items-center gap-3">

                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />

                <span className="text-sm text-gray-300">
                  AI is thinking...
                </span>

              </div>

            </div>

          </motion.div>

        )}

        <div ref={messagesEndRef} />

      </div>
            {/* ================= QUICK PROMPTS ================= */}

      <div className="border-t border-white/10 bg-[#111827] px-6 py-4">

        <div className="mb-4 flex flex-wrap gap-2">

          {[
            "Teach me greetings",
            "Explain grammar",
            "Pronunciation practice",
            "Translate a sentence",
            "Vocabulary quiz",
            "Let's have a conversation",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setMessage(item)}
              className="
                rounded-full
                border
                border-indigo-500/20
                bg-indigo-500/10
                px-4
                py-2
                text-xs
                font-semibold
                text-indigo-300
                transition
                hover:bg-indigo-500/20
              "
            >
              {item}
            </button>
          ))}

        </div>

        {/* INPUT */}

        <div className="flex items-end gap-4">

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask anything about ${languageName}...`}
            rows={2}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                if (!loading) {
                  sendMessage();
                }
              }
            }}
            className="
              flex-1
              resize-none
              rounded-2xl
              border
              border-white/10
              bg-[#1f2937]
              px-5
              py-4
              text-white
              outline-none
              focus:border-indigo-500
            "
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-indigo-600
              transition
              hover:bg-indigo-500
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Send className="h-6 w-6 text-white" />
            )}
          </button>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <div className="flex items-center gap-2 text-xs text-gray-500">

            <Languages className="h-4 w-4" />

            <span>
              Current Language:
              <strong className="ml-1 text-white">
                {languageName}
              </strong>
            </span>

          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">

            <BookOpen className="h-4 w-4" />

            <span>
              Section:
              <strong className="ml-1 text-white">
                {section}
              </strong>
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}