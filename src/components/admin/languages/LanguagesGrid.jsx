import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import LanguageCard from "./LanguageCard";

export default function LanguagesGrid({
  languages = [],
  loading = false,
  onEdit,
  onDelete,
  onUpload,
  onCardClick, // Added prop for clicking the card/explore button
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
          <motion.div
            key={language.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <LanguageCard
              language={language}
              onClick={() => onCardClick ? onCardClick(language) : onEdit?.(language)}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpload={onUpload}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}