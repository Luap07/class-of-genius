import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import LessonStats from "../../components/admin/languages/LessonStats";
import LessonFilters from "../../components/admin/languages/LessonFilters";
import LessonsGrid from "../../components/admin/languages/LessonsGrid";
import LessonForm from "../../components/admin/languages/LessonForm";
import DeleteLessonModal from "../../components/admin/languages/DeleteLessonModal";
import LoadingLessons from "../../components/admin/languages/LoadingLessons";
import EmptyLessons from "../../components/admin/languages/EmptyLessons";

export default function LessonsAdmin() {
  const [lessons, setLessons] =
    useState([]);

  const [languages, setLanguages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [language, setLanguage] =
    useState("All");

  const [level, setLevel] =
    useState("All");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingLesson,
    setEditingLesson,
  ] = useState(null);

  const [
    deletingLesson,
    setDeletingLesson,
  ] = useState(null);

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);

  const fetchLessons =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          lessonsResult,
          languagesResult,
        ] = await Promise.all([
          supabase
            .from("language_lessons")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("languages")
            .select("id,name")
            .order("name"),
        ]);

        if (lessonsResult.error)
          throw lessonsResult.error;

        if (languagesResult.error)
          throw languagesResult.error;

        setLessons(
          lessonsResult.data || []
        );

        setLanguages(
          languagesResult.data || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchLessons();

      setRefreshing(false);
    };

  const filteredLessons =
    useMemo(() => {
      return lessons.filter(
        (lesson) => {
          const matchesSearch =
            lesson.title
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesLanguage =
            language === "All"
              ? true
              : lesson.language_id ===
                language;

          const matchesLevel =
            level === "All"
              ? true
              : lesson.level ===
                level;

          return (
            matchesSearch &&
            matchesLanguage &&
            matchesLevel
          );
        }
      );
    }, [
      lessons,
      search,
      language,
      level,
    ]);

  const stats = useMemo(
    () => ({
      total: lessons.length,

      beginner:
        lessons.filter(
          (lesson) =>
            lesson.level ===
            "Beginner"
        ).length,

      intermediate:
        lessons.filter(
          (lesson) =>
            lesson.level ===
            "Intermediate"
        ).length,

      advanced:
        lessons.filter(
          (lesson) =>
            lesson.level ===
            "Advanced"
        ).length,
    }),
    [lessons]
  );
    return (
    <section className="space-y-8">

      {/* ================= HEADER ================= */}

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
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <h1
            className="
              text-4xl
              font-black
              text-white
            "
          >
            Lessons
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Create and manage lessons for every
            language on Scholiqen.
          </p>

        </div>

        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-slate-700
              bg-slate-900
              px-5
              py-3
              font-semibold
              text-white
              transition
              hover:border-cyan-500
            "
          >

            {refreshing ? (

              <Loader2
                size={18}
                className="animate-spin"
              />

            ) : (

              <RefreshCw size={18} />

            )}

            Refresh

          </button>

          <button
            onClick={() => {
              setEditingLesson(null);
              setShowForm(true);
            }}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              px-6
              py-3
              font-bold
              text-white
            "
          >

            <Plus size={18} />

            Add Lesson

          </button>

        </div>

      </motion.div>

      {/* ================= STATS ================= */}

      <LessonStats
        stats={stats}
      />

      {/* ================= FILTERS ================= */}

      <LessonFilters
        search={search}
        setSearch={setSearch}
        language={language}
        setLanguage={setLanguage}
        languages={languages}
        level={level}
        setLevel={setLevel}
      />

      {/* ================= CONTENT ================= */}

      {loading ? (

        <LoadingLessons />

      ) : filteredLessons.length === 0 ? (

        <EmptyLessons />

      ) : (

        <LessonsGrid
          lessons={filteredLessons}
          onEdit={(lesson) => {
            setEditingLesson(lesson);
            setShowForm(true);
          }}
          onDelete={(lesson) => {
            setDeletingLesson(lesson);
            setShowDelete(true);
          }}
        />

      )}

      {/* ================= FORM ================= */}

      <LessonForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingLesson(null);
        }}
        lesson={editingLesson}
        saving={saving}
        setSaving={setSaving}
        languages={languages}
        refreshLessons={fetchLessons}
      />

      {/* ================= DELETE ================= */}

      <DeleteLessonModal
        open={showDelete}
        lesson={deletingLesson}
        onClose={() => {
          setShowDelete(false);
          setDeletingLesson(null);
        }}
        refreshLessons={fetchLessons}
      />

    </section>
  );
}
