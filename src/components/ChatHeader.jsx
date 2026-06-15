import React from "react";
import {
  Brain,
  Search,
  Trash2,
  MoreVertical,
} from "lucide-react";

const ChatHeader = ({
  title = "New Chat",
  onClear,
  onSearch,
}) => {
  return (
    <div className="h-16 border-b border-white/10 bg-[#05070f]/90 backdrop-blur-xl px-6 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
          <Brain size={24} className="text-blue-400" />
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg">
            {title}
          </h2>

          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-xs text-gray-400">
              AI Tutor Online
            </span>
          </div>
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        <button
          onClick={onSearch}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
        >
          <Search
            size={18}
            className="text-gray-300"
          />
        </button>

        <button
          onClick={onClear}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 flex items-center justify-center transition"
        >
          <Trash2
            size={18}
            className="text-gray-300"
          />
        </button>

        <button
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
        >
          <MoreVertical
            size={18}
            className="text-gray-300"
          />
        </button>

      </div>

    </div>
  );
};

export default ChatHeader;