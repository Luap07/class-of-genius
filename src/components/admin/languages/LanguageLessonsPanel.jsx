import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Search,
  BookOpen,
  PlayCircle,
  FileText,
  Loader2,
  Video,
  FolderOpen,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

export default function LanguageLessonsPanel({
  language,
}) {
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);

  useEffect(() => {
    if (language?.id) {
      fetchLessons();
    }
  }, [language]);

  const fetchLessons = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_materials")
        .select("*")
        .eq("language_id", language.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) throw error;

      setMaterials(data || []);

      if (data?.length) {
        setSelectedMaterial(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = useMemo(() => {
    return materials.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.title
          ?.toLowerCase()
          .includes(keyword) ||

        item.description
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [materials, search]);

  const lessonStats = useMemo(() => {
    return {
      total: materials.length,

      videos: materials.filter(
        (m) => m.type === "video"
      ).length,

      youtube: materials.filter(
        (m) => m.type === "youtube"
      ).length,

      pdfs: materials.filter(
        (m) => m.type === "pdf"
      ).length,
    };
  }, [materials]);
    if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">

      {/* ================= LEFT PANEL ================= */}

      <div className="rounded-3xl border border-white/10 bg-[#111827]">

        {/* Search */}

        <div className="border-b border-white/10 p-5">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons..."
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-[#1f2937]
                py-3
                pl-11
                pr-4
                text-white
                outline-none
                focus:border-indigo-500
              "
            />

          </div>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 gap-3 p-5">

          <div className="rounded-2xl bg-[#1f2937] p-4">

            <BookOpen className="mb-2 text-indigo-400" />

            <p className="text-2xl font-black text-white">
              {lessonStats.total}
            </p>

            <p className="text-xs text-gray-400">
              Lessons
            </p>

          </div>

          <div className="rounded-2xl bg-[#1f2937] p-4">

            <Video className="mb-2 text-pink-400" />

            <p className="text-2xl font-black text-white">
              {lessonStats.videos + lessonStats.youtube}
            </p>

            <p className="text-xs text-gray-400">
              Videos
            </p>

          </div>

          <div className="rounded-2xl bg-[#1f2937] p-4">

            <FileText className="mb-2 text-cyan-400" />

            <p className="text-2xl font-black text-white">
              {lessonStats.pdfs}
            </p>

            <p className="text-xs text-gray-400">
              PDFs
            </p>

          </div>

          <div className="rounded-2xl bg-[#1f2937] p-4">

            <FolderOpen className="mb-2 text-green-400" />

            <p className="text-2xl font-black text-white">
              {filteredLessons.length}
            </p>

            <p className="text-xs text-gray-400">
              Showing
            </p>

          </div>

        </div>

        {/* Lesson List */}

        <div className="max-h-[600px] overflow-y-auto px-4 pb-4">

          {filteredLessons.map((lesson) => (

            <motion.button
              key={lesson.id}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: .98,
              }}
              onClick={() =>
                setSelectedMaterial(lesson)
              }
              className={`mb-3 w-full rounded-2xl border p-4 text-left transition ${
                selectedMaterial?.id === lesson.id
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 bg-[#1f2937] hover:border-indigo-400/50"
              }`}
            >

              <div className="flex items-center gap-3">

                {lesson.type === "pdf" ? (

                  <FileText
                    size={22}
                    className="text-cyan-400"
                  />

                ) : (

                  <PlayCircle
                    size={22}
                    className="text-pink-400"
                  />

                )}

                <div className="min-w-0">

                  <h3 className="truncate font-bold text-white">

                    {lesson.title}

                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs text-gray-400">

                    {lesson.description}

                  </p>

                </div>

              </div>

            </motion.button>

          ))}

        </div>

      </div>
            {/* ================= RIGHT PANEL ================= */}

      <div className="rounded-3xl border border-white/10 bg-[#111827] overflow-hidden">

        {!selectedMaterial ? (

          <div className="flex h-full min-h-[650px] items-center justify-center">

            <div className="text-center">

              <BookOpen
                size={70}
                className="mx-auto mb-6 text-indigo-500"
              />

              <h2 className="text-3xl font-black text-white">
                No Lesson Selected
              </h2>

              <p className="mt-3 text-gray-400">
                Select a lesson from the left panel.
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* HEADER */}

            <div className="border-b border-white/10 p-8">

              <div className="flex items-center gap-3">

                {selectedMaterial.type === "pdf" ? (

                  <FileText
                    size={28}
                    className="text-cyan-400"
                  />

                ) : (

                  <PlayCircle
                    size={28}
                    className="text-pink-400"
                  />

                )}

                <div>

                  <h1 className="text-3xl font-black text-white">

                    {selectedMaterial.title}

                  </h1>

                  <p className="mt-2 text-gray-400">

                    {selectedMaterial.description}

                  </p>

                </div>

              </div>

            </div>

            {/* CONTENT */}

            <div className="p-8">

              {/* LOCAL VIDEO */}

              {selectedMaterial.type === "video" && (

                <video
                  controls
                  className="
                    aspect-video
                    w-full
                    rounded-3xl
                    border
                    border-white/10
                    bg-black
                  "
                >

                  <source
                    src={selectedMaterial.file_url}
                    type="video/mp4"
                  />

                </video>

              )}

              {/* YOUTUBE */}

              {selectedMaterial.type === "youtube" && (

                <div className="aspect-video overflow-hidden rounded-3xl border border-white/10">

                  <iframe
                    title={selectedMaterial.title}
                    src={selectedMaterial.file_url.includes("embed")
                      ? selectedMaterial.file_url
                      : selectedMaterial.file_url
                          .replace("watch?v=", "embed/")}
                    className="h-full w-full"
                    allowFullScreen
                  />

                </div>

              )}

              {/* PDF */}

              {selectedMaterial.type === "pdf" && (

                <iframe
                  src={selectedMaterial.file_url}
                  title={selectedMaterial.title}
                  className="
                    h-[850px]
                    w-full
                    rounded-3xl
                    border
                    border-white/10
                    bg-white
                  "
                />

              )}

              {/* LESSON INFO */}

              <div className="mt-10 grid gap-6 md:grid-cols-3">

                <div className="rounded-2xl bg-[#1f2937] p-5">

                  <h4 className="mb-2 font-bold text-white">
                    Lesson Type
                  </h4>

                  <p className="capitalize text-gray-400">
                    {selectedMaterial.type}
                  </p>

                </div>

                <div className="rounded-2xl bg-[#1f2937] p-5">

                  <h4 className="mb-2 font-bold text-white">
                    Language
                  </h4>

                  <p className="text-gray-400">
                    {language?.name}
                  </p>

                </div>

                <div className="rounded-2xl bg-[#1f2937] p-5">

                  <h4 className="mb-2 font-bold text-white">
                    Uploaded
                  </h4>

                  <p className="text-gray-400">
                    {new Date(
                      selectedMaterial.created_at
                    ).toLocaleDateString()}
                  </p>

                </div>

              </div>

              {/* DOWNLOAD PDF */}

              {selectedMaterial.type === "pdf" && (

                <a
                  href={selectedMaterial.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    mt-8
                    inline-flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-indigo-600
                    px-6
                    py-4
                    font-bold
                    text-white
                    transition
                    hover:bg-indigo-500
                  "
                >

                  <FileText size={20} />

                  Download PDF

                </a>

              )}

            </div>

          </>

        )}

      </div>

    </div>

  );

}