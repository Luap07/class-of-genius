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

import WordOfDayStats from "../../components/admin/languages/WordOfDayStats";
import WordOfDayFilters from "../../components/admin/languages/WordOfDayFilters";
import WordsGrid from "../../components/admin/languages/WordsGrid";
import WordForm from "../../components/admin/languages/WordForm";
import DeleteWordModal from "../../components/admin/languages/DeleteWordModal";
import LoadingWords from "../../components/admin/languages/LoadingWords";
import EmptyWords from "../../components/admin/languages/EmptyWords";

export default function WordOfDayAdmin() {
  const [words, setWords] =
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

  const [featuredOnly, setFeaturedOnly] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingWord, setEditingWord] =
    useState(null);

  const [showDelete, setShowDelete] =
    useState(false);

  const [deletingWord, setDeletingWord] =
    useState(null);

  const fetchWords =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          wordsResult,
          languagesResult,
        ] = await Promise.all([
          supabase
            .from("word_of_day")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("languages")
            .select("id,name")
            .order("name"),
        ]);

        if (wordsResult.error)
          throw wordsResult.error;

        if (languagesResult.error)
          throw languagesResult.error;

        setWords(
          wordsResult.data || []
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
    fetchWords();
  }, [fetchWords]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchWords();

      setRefreshing(false);
    };

  const filteredWords =
    useMemo(() => {
      return words.filter((word) => {

        const matchesSearch =
          word.word
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          word.meaning
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesLanguage =
          language === "All"
            ? true
            : word.language_id ===
              language;

        const matchesFeatured =
          featuredOnly
            ? word.featured
            : true;

        return (
          matchesSearch &&
          matchesLanguage &&
          matchesFeatured
        );
      });
    }, [
      words,
      search,
      language,
      featuredOnly,
    ]);

  const stats = useMemo(
    () => ({
      total: words.length,

      featured:
        words.filter(
          (word) =>
            word.featured
        ).length,

      active:
        words.filter(
          (word) =>
            word.active
        ).length,

      languages:
        new Set(
          words.map(
            (word) =>
              word.language_id
          )
        ).size,
    }),
    [words]
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
            Word Of The Day
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Manage daily vocabulary across every supported language.
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
              setEditingWord(null);
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

            Add Word

          </button>

        </div>

      </motion.div>

      {/* ================= STATS ================= */}

      <WordOfDayStats
        stats={stats}
      />

      {/* ================= FILTERS ================= */}

      <WordOfDayFilters
        search={search}
        setSearch={setSearch}
        language={language}
        setLanguage={setLanguage}
        languages={languages}
        featuredOnly={featuredOnly}
        setFeaturedOnly={setFeaturedOnly}
      />

      {/* ================= CONTENT ================= */}

      {loading ? (
        <LoadingWords />
      ) : filteredWords.length === 0 ? (
        <EmptyWords />
      ) : (
        <WordsGrid
          words={filteredWords}
          onEdit={(word) => {
            setEditingWord(word);
            setShowForm(true);
          }}
          onDelete={(word) => {
            setDeletingWord(word);
            setShowDelete(true);
          }}
        />
      )}

      {/* ================= FORM ================= */}

      <WordForm
        open={showForm}
        word={editingWord}
        languages={languages}
        saving={saving}
        setSaving={setSaving}
        refreshWords={fetchWords}
        onClose={() => {
          setShowForm(false);
          setEditingWord(null);
        }}
      />

      {/* ================= DELETE ================= */}

      <DeleteWordModal
        open={showDelete}
        word={deletingWord}
        refreshWords={fetchWords}
        onClose={() => {
          setShowDelete(false);
          setDeletingWord(null);
        }}
      />

    </section>
  );
}