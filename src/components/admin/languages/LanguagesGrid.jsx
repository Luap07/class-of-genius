import React from "react";

import { AnimatePresence } from "framer-motion";

import LanguageCard from "./LanguageCard";

export default function LanguagesGrid({
  languages = [],

  loading = false,

  onEdit,

  onDelete,

  onUpload,
}) {
  if (loading) {
    return (
      <div
        className="
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="
              h-[420px]
              animate-pulse
              rounded-3xl
              border
              border-white/10
              bg-[#111827]
            "
          />
        ))}
      </div>
    );
  }

  if (!languages.length) {
    return null;
  }

  return (
    <div
      className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      <AnimatePresence mode="popLayout">
        {languages.map((language) => (
          <LanguageCard
            key={language.id}
            language={language}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpload={onUpload}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}