import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PenSquare,
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  Languages,
  Sparkles,
  BookOpen,
  Clock,
  BarChart3,
} from "lucide-react";

const WritingEditor = ({
  title = "Writing Practice",
  prompt = "",
  placeholder = "Start writing here...",
  language = "English",
  level = "Beginner",
  initialValue = "",
  maxWords = 300,
  onSave,
  onSubmit,
}) => {
  const [text, setText] = useState(initialValue);

  const stats = useMemo(() => {
    const trimmed = text.trim();

    const words = trimmed
      ? trimmed.split(/\s+/).length
      : 0;

    const characters = text.length;

    const readingTime = Math.max(
      1,
      Math.ceil(words / 200)
    );

    return {
      words,
      characters,
      readingTime,
    };
  }, [text]);

  const clearEditor = () => {
    setText("");
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <PenSquare
                size={30}
                className="text-white"
              />

              <h2 className="text-3xl font-black text-white">
                {title}
              </h2>

            </div>

            <div className="mt-4 flex flex-wrap gap-3">

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100">
                <Languages
                  size={14}
                  className="mr-2 inline"
                />
                {language}
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100">
                <BookOpen
                  size={14}
                  className="mr-2 inline"
                />
                {level}
              </span>

            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => onSave?.(text)}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 transition hover:bg-white/20"
            >
              <Save size={18} />
              Save
            </button>

            <button
              onClick={clearEditor}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 transition hover:bg-white/20"
            >
              <RotateCcw size={18} />
              Clear
            </button>

          </div>

        </div>

      </div>

      {/* Prompt */}

      {prompt && (
        <div className="border-b border-white/10 bg-cyan-500/5 p-6">

          <div className="flex items-start gap-3">

            <Sparkles
              className="mt-1 text-cyan-400"
              size={22}
            />

            <div>

              <h3 className="text-lg font-bold text-white">
                Writing Prompt
              </h3>

              <p className="mt-2 leading-8 text-slate-300">
                {prompt}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* Editor */}

      <div className="p-8">

        <textarea
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder={placeholder}
          className="min-h-[420px] w-full resize-none rounded-3xl border border-white/10 bg-black/20 p-6 text-lg leading-9 text-white outline-none transition focus:border-cyan-500"
        />

      </div>

      {/* Stats */}

      <div className="grid gap-5 border-t border-white/10 p-6 md:grid-cols-4">

        <div className="rounded-2xl bg-black/20 p-5">

          <FileText
            size={26}
            className="text-cyan-400"
          />

          <h4 className="mt-3 text-2xl font-black text-white">
            {stats.words}
          </h4>

          <p className="text-slate-400">
            Words
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <BarChart3
            size={26}
            className="text-green-400"
          />

          <h4 className="mt-3 text-2xl font-black text-white">
            {stats.characters}
          </h4>

          <p className="text-slate-400">
            Characters
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Clock
            size={26}
            className="text-yellow-400"
          />

          <h4 className="mt-3 text-2xl font-black text-white">
            {stats.readingTime}
          </h4>

          <p className="text-slate-400">
            Min Read
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <CheckCircle2
            size={26}
            className="text-purple-400"
          />

          <h4 className="mt-3 text-2xl font-black text-white">
            {maxWords}
          </h4>

          <p className="text-slate-400">
            Word Limit
          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-white/10 bg-black/20 p-6">

        <button
          onClick={() => onSubmit?.(text)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-600 px-6 py-4 font-bold transition hover:bg-cyan-500"
        >
          <CheckCircle2 size={20} />
          Submit Writing
        </button>

      </div>

    </motion.section>
  );
};

export default WritingEditor;