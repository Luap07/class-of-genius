import React from "react";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Clock,
} from "lucide-react";

const AIMessage = ({
  message,
  isUser = false,
  copied = false,
  timestamp,
  onCopy,
  onSpeak,
  onLike,
  onDislike,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        x: isUser ? 20 : -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`flex gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600">
          <Bot size={24} className="text-white" />
        </div>
      )}

      <div
        className={`max-w-3xl overflow-hidden rounded-3xl border ${
          isUser
            ? "border-cyan-500/30 bg-cyan-600/10"
            : "border-white/10 bg-slate-900"
        }`}
      >
        {/* Header */}

        <div
          className={`flex items-center justify-between border-b px-5 py-3 ${
            isUser
              ? "border-cyan-500/20 bg-cyan-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">

            {isUser ? (
              <User size={18} className="text-cyan-300" />
            ) : (
              <Sparkles size={18} className="text-cyan-300" />
            )}

            <span className="font-bold text-white">
              {isUser ? "You" : "AI Language Tutor"}
            </span>

          </div>

          {timestamp && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} />
              {timestamp}
            </div>
          )}
        </div>

        {/* Content */}

        <div className="p-6">
          <p className="whitespace-pre-wrap leading-8 text-slate-200">
            {message}
          </p>
        </div>

        {/* Footer */}

        {!isUser && (
          <div className="flex flex-wrap gap-3 border-t border-white/10 bg-black/20 px-5 py-4">

            <button
              onClick={onSpeak}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              <Volume2 size={16} />
              Listen
            </button>

            <button
              onClick={onCopy}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>

            <button
              onClick={onLike}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 transition hover:bg-green-500/20"
            >
              <ThumbsUp size={16} />
              Helpful
            </button>

            <button
              onClick={onDislike}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 transition hover:bg-red-500/20"
            >
              <ThumbsDown size={16} />
              Improve
            </button>

          </div>
        )}

      </div>

      {isUser && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600">
          <User size={22} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default AIMessage;