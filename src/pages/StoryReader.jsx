import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Moon, Sun, BookOpen } from "lucide-react";

const StoryReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= FETCH NOVEL ================= */
  useEffect(() => {
    const fetchNovel = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("novels")
        .select("*")
        .eq("id", id)
        .single();

      setNovel(data || null);
      setLoading(false);

      // restore last read chapter
      const saved = localStorage.getItem(`novel-${id}-chapter`);
      if (saved) setChapterIndex(Number(saved));
    };

    fetchNovel();
  }, [id]);

  /* ================= SAVE PROGRESS ================= */
  useEffect(() => {
    localStorage.setItem(`novel-${id}-chapter`, chapterIndex);
  }, [chapterIndex, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Novel not found
      </div>
    );
  }

  const chapters = novel.chapters || [];
  const chapter = chapters[chapterIndex];

  return (
    <div
      className={`min-h-screen flex transition-all duration-300 ${
        darkMode ? "bg-[#05070f] text-white" : "bg-gray-100 text-black"
      }`}
    >

      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed md:static z-50 w-72 h-full border-r transition-transform duration-300
        ${darkMode ? "border-white/10 bg-black/40" : "bg-white"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 font-bold flex items-center justify-between border-b border-white/10">
          Chapters

          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto h-full">
          {chapters.map((c, i) => (
            <div
              key={i}
              onClick={() => {
                setChapterIndex(i);
                setSidebarOpen(false);
              }}
              className={`p-2 rounded cursor-pointer text-sm transition
                ${chapterIndex === i ? "bg-blue-600 text-white" : "hover:bg-white/10"}`}
            >
              {c.title || `Chapter ${i + 1}`}
            </div>
          ))}
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1">

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">

          <button
            onClick={() => navigate(-1)}
            className="text-sm opacity-80 hover:opacity-100"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">

            {/* FONT CONTROL */}
            <button
              onClick={() => setFontSize((p) => Math.max(14, p - 1))}
              className="px-2"
            >
              A-
            </button>

            <button
              onClick={() => setFontSize((p) => Math.min(22, p + 1))}
              className="px-2"
            >
              A+
            </button>

            {/* THEME */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* MOBILE CHAPTERS */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden px-2"
            >
              <BookOpen size={18} />
            </button>

          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-1 bg-white/10">
          <div
            className="h-1 bg-blue-500 transition-all"
            style={{
              width: `${((chapterIndex + 1) / chapters.length) * 100}%`,
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto px-4 py-10">

          {/* COVER */}
          {novel.cover_url && (
            <img
              src={novel.cover_url}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
          )}

          <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>

          <p className="text-sm opacity-70 mb-8">
            {novel.description}
          </p>

          {/* CHAPTER */}
          <div
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            className="transition-all"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              {chapter?.title}
            </h2>

            <p className="whitespace-pre-line opacity-90">
              {chapter?.content}
            </p>
          </div>

          {/* NAV */}
          <div className="flex justify-between mt-10">
            <button
              disabled={chapterIndex === 0}
              onClick={() => setChapterIndex((p) => p - 1)}
              className="px-4 py-2 bg-white/10 rounded disabled:opacity-30"
            >
              Previous
            </button>

            <button
              disabled={chapterIndex === chapters.length - 1}
              onClick={() => setChapterIndex((p) => p + 1)}
              className="px-4 py-2 bg-blue-600 rounded disabled:opacity-30"
            >
              Next
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StoryReader;