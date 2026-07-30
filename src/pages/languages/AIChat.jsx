import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  Sparkles,
  Bot,
  Send,
  Globe2,
  Languages,
  Mic,
  Volume2,
  BookOpen,
  GraduationCap,
  MessageSquare,
  History,
  Bookmark,
  Settings,
  Brain,
  Zap,
  Search,
} from "lucide-react";

const supportedLanguages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Arabic",
  "Chinese",
  "Japanese",
  "Korean",
  "Hindi",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Swahili",
];

const suggestions = [
  "Teach me English grammar",
  "Translate this sentence",
  "Explain this word",
  "Correct my grammar",
  "Practice an interview",
  "Teach me business English",
  "Teach me travel phrases",
  "Let's have a conversation",
];

const AIChat = () => {
  const [fromLanguage, setFromLanguage] = useState("English");
  const [toLanguage, setToLanguage] = useState("Spanish");
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "👋 Welcome to Scholiqen AI Language Tutor. I can teach languages, explain grammar, translate text, improve pronunciation, create quizzes, and help you practice conversations.",
    },
  ]);

  const stats = useMemo(
    () => [
      {
        title: "Languages",
        value: "100+",
        icon: Globe2,
      },
      {
        title: "Words",
        value: "2M+",
        icon: BookOpen,
      },
      {
        title: "Lessons",
        value: "5,000+",
        icon: GraduationCap,
      },
      {
        title: "AI",
        value: "24/7",
        icon: Bot,
      },
    ],
    []
  );

  return (
    <section className="min-h-screen bg-[#020617] text-white">

      {/* HERO */}

      <div className="relative overflow-hidden border-b border-slate-800">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-cyan-500 blur-[140px]" />
          <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-indigo-600 blur-[160px]" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-3xl">

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-300">

                <Sparkles size={16} />

                Scholiqen AI

              </div>

              <h1 className="mt-8 text-6xl font-black leading-tight">

                Learn Any Language
                <br />

                With AI

              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-400">

                Ask questions, translate instantly, improve pronunciation,
                learn grammar, build vocabulary and practice conversations
                naturally with your AI language teacher.

              </p>

            </motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-5"
          >

            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl"
                >
                  <Icon
                    className="mb-5 text-cyan-400"
                    size={30}
                  />

                  <h2 className="text-3xl font-black">
                    {item.value}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {item.title}
                  </p>
                </div>
              );
            })}

          </motion.div>

        </div>

      </div>

      {/* MAIN */}

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[320px,1fr]">

        {/* LEFT SIDEBAR */}

        <aside className="space-y-6">

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">

              <Languages />

              Languages

            </h2>

            <label className="mb-2 block text-sm text-slate-400">
              From
            </label>

            <select
              value={fromLanguage}
              onChange={(e) => setFromLanguage(e.target.value)}
              className="mb-5 w-full rounded-2xl border border-slate-700 bg-slate-800 p-3 outline-none"
            >
              {supportedLanguages.map((language) => (
                <option key={language}>
                  {language}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-sm text-slate-400">
              To
            </label>

            <select
              value={toLanguage}
              onChange={(e) => setToLanguage(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-3 outline-none"
            >
              {supportedLanguages.map((language) => (
                <option key={language}>
                  {language}
                </option>
              ))}
            </select>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-xl font-bold">
              AI Tools
            </h2>

            <div className="space-y-3">

              <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 p-4 transition hover:bg-cyan-600">
                <MessageSquare size={18} />
                Conversation Practice
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 p-4 transition hover:bg-cyan-600">
                <BookOpen size={18} />
                Explain Grammar
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 p-4 transition hover:bg-cyan-600">
                <Volume2 size={18} />
                Pronunciation Coach
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 p-4 transition hover:bg-cyan-600">
                <History size={18} />
                History
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 p-4 transition hover:bg-cyan-600">
                <Bookmark size={18} />
                Saved Words
              </button>

              <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 p-4 transition hover:bg-cyan-600">
                <Settings size={18} />
                Settings
              </button>

            </div>

          </div>

        </aside>
                {/* =========================
            CHAT AREA
        ========================== */}

        <main className="flex flex-col gap-6">

          {/* Chat Header */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex flex-wrap items-center justify-between gap-6">

              <div>

                <h2 className="flex items-center gap-3 text-2xl font-black">

                  <Bot className="text-cyan-400" />

                  AI Language Teacher

                </h2>

                <p className="mt-2 text-slate-400">

                  Ask anything about languages, grammar,
                  pronunciation, vocabulary and translation.

                </p>

              </div>

              <div className="flex gap-3">

                <button
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-slate-800
                    px-5
                    py-3
                    hover:bg-slate-700
                  "
                >
                  <Mic size={18} />

                  Voice

                </button>

                <button
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-cyan-600
                    px-5
                    py-3
                    font-semibold
                    hover:bg-cyan-500
                  "
                >
                  <Zap size={18} />

                  AI Mode

                </button>

              </div>

            </div>

          </div>

          {/* Chat Messages */}

          <div
            className="
              flex-1
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
              min-h-[650px]
              overflow-y-auto
            "
          >

            <div className="space-y-6">

              {messages.map((msg) => (

                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className={
                    msg.role === "assistant"
                      ? "flex items-start gap-4"
                      : "flex justify-end"
                  }
                >

                  {msg.role === "assistant" && (

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-cyan-600
                      "
                    >

                      <Bot size={22} />

                    </div>

                  )}

                  <div
                    className={
                      msg.role === "assistant"

                        ? `
                          max-w-3xl
                          rounded-3xl
                          bg-slate-800
                          p-5
                        `

                        : `
                          max-w-3xl
                          rounded-3xl
                          bg-cyan-600
                          p-5
                        `
                    }
                  >

                    <p className="leading-8">

                      {msg.text}

                    </p>

                  </div>

                </motion.div>

              ))}

            </div>

          </div>

          {/* Suggested Prompts */}

          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
            "
          >

            <div className="flex items-center gap-3 mb-5">

              <Search
                size={20}
                className="text-cyan-400"
              />

              <h3 className="font-bold text-xl">

                Suggested Prompts

              </h3>

            </div>

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-4
              "
            >

              {suggestions.map((prompt) => (

                <motion.button
                  key={prompt}
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() => setMessage(prompt)}
                  className="
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-800
                    p-4
                    text-left
                    transition
                    hover:border-cyan-500
                    hover:bg-slate-700
                  "
                >

                  {prompt}

                </motion.button>

              ))}

            </div>

          </div>
                    {/* =========================
              CHAT INPUT
          ========================== */}

          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
            "
          >

            <div
              className="
                flex
                flex-col
                gap-5
              "
            >

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything about any language..."
                rows={4}
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-800
                  p-5
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-500
                "
              />

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div className="flex flex-wrap gap-3">

                  <button
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-slate-800
                      px-5
                      py-3
                      hover:bg-slate-700
                    "
                  >
                    <Mic size={18} />

                    Voice

                  </button>

                  <button
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-slate-800
                      px-5
                      py-3
                      hover:bg-slate-700
                    "
                  >
                    <Languages size={18} />

                    Translate

                  </button>

                  <button
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-slate-800
                      px-5
                      py-3
                      hover:bg-slate-700
                    "
                  >
                    <BookOpen size={18} />

                    Grammar

                  </button>

                </div>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={sendMessage}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-cyan-600
                    px-8
                    py-4
                    font-bold
                    hover:bg-cyan-500
                  "
                >

                  <Send size={18} />

                  Send Message

                </motion.button>

              </div>

            </div>

          </div>

        </main>

      </div>

    </section>

  );

};

export default AIChat;