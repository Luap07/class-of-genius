import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { STORIES } from "../data/stories";

const StoryReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const story = STORIES.find((s) => s.id === id);

  const [chapterIndex, setChapterIndex] = useState(0);

  /* ================= LOAD PROGRESS ================= */
  useEffect(() => {
    const saved = localStorage.getItem(`story-${id}`);
    if (saved !== null) setChapterIndex(Number(saved));
  }, [id]);

  /* ================= SAVE PROGRESS ================= */
  useEffect(() => {
    localStorage.setItem(`story-${id}`, chapterIndex);
  }, [chapterIndex, id]);

  if (!story) {
    return (
      <div className="text-white p-6">
        Story not found
      </div>
    );
  }

  const chapter = story.chapters[chapterIndex];

  /* ================= NAVIGATION ================= */
  const nextChapter = () => {
    if (chapterIndex < story.chapters.length - 1) {
      setChapterIndex((prev) => prev + 1);
    }
  };

  const prevChapter = () => {
    if (chapterIndex > 0) {
      setChapterIndex((prev) => prev - 1);
    }
  };

  /* ================= DOWNLOAD STORY ================= */
  const downloadStory = () => {
    const content = `
TITLE: ${story.title}

${story.chapters
  .map(
    (ch) =>
      `Chapter ${ch.chapter}: ${ch.title}\n\n${ch.content}\n\n`
  )
  .join("\n")}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${story.title}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-white px-6 py-10">

      {/* HEADER */}
      <div className="mb-6 space-y-2">

        <button
          onClick={() => navigate(-1)}
          className="text-blue-400 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">{story.title}</h1>

        <p className="text-gray-400">
          Chapter {chapterIndex + 1} / {story.chapters.length}
        </p>

        {/* DOWNLOAD BUTTON */}
        <button
          onClick={downloadStory}
          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
        >
          📥 Download Story
        </button>

      </div>

      {/* CHAPTER CONTENT */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-4">
          {chapter.title}
        </h2>

        <p className="leading-7 text-gray-200 whitespace-pre-line">
          {chapter.content}
        </p>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between mt-6">

        <button
          onClick={prevChapter}
          disabled={chapterIndex === 0}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-40"
        >
          ← Prev
        </button>

        <button
          onClick={nextChapter}
          disabled={chapterIndex === story.chapters.length - 1}
          className="px-4 py-2 bg-blue-600 rounded disabled:opacity-40"
        >
          Next →
        </button>

      </div>

    </div>
  );
};

export default StoryReader;