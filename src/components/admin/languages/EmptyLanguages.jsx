import React from "react";

import { motion } from "framer-motion";

import {
  Languages,
  Plus,
  Search,
} from "lucide-react";

export default function EmptyLanguages({
  searching = false,
  onCreate,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        border-dashed
        border-white/10
        bg-[#111827]
        px-8
        py-24
        text-center
      "
    >
      <div
        className="
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          bg-indigo-500/10
        "
      >
        {searching ? (
          <Search className="h-12 w-12 text-indigo-400" />
        ) : (
          <Languages className="h-12 w-12 text-indigo-400" />
        )}
      </div>

      <h2 className="mt-8 text-3xl font-black text-white">
        {searching
          ? "No Matching Languages"
          : "No Languages Yet"}
      </h2>

      <p
        className="
          mt-4
          max-w-xl
          text-lg
          leading-8
          text-gray-400
        "
      >
        {searching
          ? "No language matches your current search or filter. Try changing the filters or search keyword."
          : "Start building your language learning platform by adding your first language."}
      </p>

      {!searching && (
        <button
          onClick={onCreate}
          className="
            mt-10
            inline-flex
            items-center
            gap-3
            rounded-2xl
            bg-indigo-600
            px-8
            py-4
            text-lg
            font-bold
            text-white
            transition
            hover:bg-indigo-500
          "
        >
          <Plus className="h-6 w-6" />
          Add First Language
        </button>
      )}
    </motion.div>
  );
}