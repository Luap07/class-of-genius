import React from "react";

const TypingAnimation = () => {
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300" />
      <span className="ml-2">AI is thinking...</span>
    </div>
  );
};

export default TypingAnimation;