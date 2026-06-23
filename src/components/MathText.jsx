import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const MathText = ({ text }) => {
  return (
    <ReactMarkdown
      children={text}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    />
  );
};

export default MathText;