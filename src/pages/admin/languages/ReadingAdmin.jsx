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

import ReadingStats from "../../components/admin/languages/ReadingStats";
import ReadingFilters from "../../components/admin/languages/ReadingFilters";
import ReadingGrid from "../../components/admin/languages/ReadingGrid";
import ReadingForm from "../../components/admin/languages/ReadingForm";
import DeleteReadingModal from "../../components/admin/languages/DeleteReadingModal";
import LoadingReading from "../../components/admin/languages/LoadingReading";
import EmptyReading from "../../components/admin/languages/EmptyReading";

export default function ReadingAdmin() {
  const [reading, setReading] =
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

  const [showForm, setShowForm] =
    useState(false);

  const [editingReading, setEditingReading] =
    useState(null);

  const [showDelete, setShowDelete] =
    useState(false);

  const [deletingReading, setDeletingReading] =
    useState(null);

  const fetchReading =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          readingResult,
          languageResult,
        ] = await Promise.all([
          supabase
            .from("language_reading")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("languages")
            .select("id,name")
            .order("name"),
        ]);

        if (readingResult.error)
          throw readingResult.error;

        if (languageResult.error)
          throw languageResult.error;

        setReading(
          readingResult.data || []
        );

        setLanguages(
          languageResult.data || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchReading();
  }, [fetchReading]);

  const handleRefresh =
    async () => {
      setRefreshing(true);
      await fetchReading();
      setRefreshing(false);
    };

  const filteredReading =
    useMemo(() => {
      return reading.filter((item) => {
        const matchesSearch =
          item.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesLanguage =
          language === "All"
            ? true
            : item.language_id ===
              language;

        const matchesLevel =
          level === "All"
            ? true
            : item.level === level;

        return (
          matchesSearch &&
          matchesLanguage &&
          matchesLevel
        );
      });
    }, [
      reading,
      search,
      language,
      level,
    ]);

  const stats = useMemo(
    () => ({
      total: reading.length,

      beginner:
        reading.filter(
          (item) =>
            item.level ===
            "Beginner"
        ).length,

      intermediate:
        reading.filter(
          (item) =>
            item.level ===
            "Intermediate"
        ).length,

      advanced:
        reading.filter(
          (item) =>
            item.level ===
            "Advanced"
        ).length,
    }),
    [reading]
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
            Reading Passages
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Manage reading comprehension passages,
            articles and stories for every language.
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
              setEditingReading(null);
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

            Add Reading

          </button>

        </div>

      </motion.div>

      {/* ================= STATS ================= */}

      <ReadingStats
        stats={stats}
      />

      {/* ================= FILTERS ================= */}

      <ReadingFilters
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

        <LoadingReading />

      ) : filteredReading.length === 0 ? (

        <EmptyReading />

      ) : (

        <ReadingGrid
          reading={filteredReading}
          onEdit={(item) => {
            setEditingReading(item);
            setShowForm(true);
          }}
          onDelete={(item) => {
            setDeletingReading(item);
            setShowDelete(true);
          }}
        />

      )}

      {/* ================= FORM ================= */}

      <ReadingForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingReading(null);
        }}
        reading={editingReading}
        saving={saving}
        setSaving={setSaving}
        languages={languages}
        refreshReading={fetchReading}
      />

      {/* ================= DELETE ================= */}

      <DeleteReadingModal
        open={showDelete}
        reading={deletingReading}
        onClose={() => {
          setShowDelete(false);
          setDeletingReading(null);
        }}
        refreshReading={fetchReading}
      />

    </section>
  );
}