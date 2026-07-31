import React from "react";

import {
  BookOpen,
  Plus,
  Search,
} from "lucide-react";

export default function EmptyLessons({
  searching = false,
  onCreate,
}) {
  return (
    <div
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
          <Search
            size={48}
            className="text-indigo-400"
          />
        ) : (
          <BookOpen
            size={48}
            className="text-indigo-400"
          />
        )}
      </div>

      <h2 className="mt-8 text-3xl font-black">
        {searching
          ? "No Lessons Found"
          : "No Lessons Yet"}
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
          ? "Try changing your search or filters."
          : "Create your first lesson to start building this language course."}
      </p>

      {!searching && (
        <button
          onClick={onCreate}
          className="
            mt-10
            flex
            items-center
            gap-3
            rounded-2xl
            bg-indigo-600
            px-8
            py-4
            font-bold
            transition
            hover:bg-indigo-500
          "
        >
          <Plus size={20} />
          Create First Lesson
        </button>
      )}
    </div>
  );
}