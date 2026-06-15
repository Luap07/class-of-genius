import React from "react";
import { Bot, User } from "lucide-react";

const ChatBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`w-full flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-end gap-3 max-w-[75%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* ICON */}
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-blue-600/20"
              : "bg-white/10"
          }`}
        >
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-blue-400" />
          )}
        </div>

        {/* MESSAGE BOX */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md whitespace-pre-wrap ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-[#121826] border border-white/10 text-white rounded-bl-none"
          }`}
        >
          {message.text}

          {/* TIME */}
          <div className="text-[10px] opacity-60 mt-1 text-right">
            {message.time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;