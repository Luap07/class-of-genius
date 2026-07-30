import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Copy,
  Check,
  Clock,
  Languages,
} from "lucide-react";

const ReadingViewer = ({
  title = "Reading Exercise",
  language = "",
  level = "Beginner",
  readingTime = "5 min",
  content = "",
  translation = "",
  showTranslation = false,
  onCopy,
}) => {
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const filteredContent = useMemo(() => {
    if (!search.trim()) return content;

    const regex = new RegExp(search, "gi");

    return content.replace(
      regex,
      (match) =>
        `<mark class="bg-cyan-500 text-black rounded px-1">${match}</mark>`
    );
  }, [content, search]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.();

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-3xl font-black text-white">
              {title}
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100">
                <Languages className="mr-2 inline" size={14} />
                {language}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100">
                <BookOpen className="mr-2 inline" size={14} />
                {level}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100">
                <Clock className="mr-2 inline" size={14} />
                {readingTime}
              </span>

            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                setFontSize((prev) =>
                  Math.min(prev + 2, 30)
                )
              }
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              <ZoomIn size={18} />
            </button>

            <button
              onClick={() =>
                setFontSize((prev) =>
                  Math.max(prev - 2, 14)
                )
              }
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              <ZoomOut size={18} />
            </button>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              onClick={handleCopy}
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              {copied ? (
                <Check size={18} />
              ) : (
                <Copy size={18} />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Search */}

      <div className="border-b border-white/10 p-6">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search inside text..."
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white outline-none focus:border-cyan-500"
          />

        </div>

      </div>

      {/* Reading Content */}

      <div
        className={`p-8 ${
          darkMode
            ? "bg-slate-900"
            : "bg-white"
        }`}
      >
        <article
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 2,
          }}
          className={`prose max-w-none ${
            darkMode
              ? "text-slate-300"
              : "text-slate-800"
          }`}
          dangerouslySetInnerHTML={{
            __html: filteredContent,
          }}
        />

        {showTranslation && translation && (
          <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

            <h3 className="mb-4 text-xl font-black text-cyan-300">
              Translation
            </h3>

            <p
              className="leading-9 text-slate-300"
              style={{
                fontSize: `${fontSize - 2}px`,
              }}
            >
              {translation}
            </p>

          </div>
        )}

      </div>
    </motion.section>
  );
};

export default ReadingViewer;