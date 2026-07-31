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

import FlashcardsStats from "../../components/admin/languages/FlashcardsStats";
import FlashcardsFilters from "../../components/admin/languages/FlashcardsFilters";
import FlashcardsGrid from "../../components/admin/languages/FlashcardsGrid";
import FlashcardForm from "../../components/admin/languages/FlashcardForm";
import DeleteFlashcardModal from "../../components/admin/languages/DeleteFlashcardModal";
import LoadingFlashcards from "../../components/admin/languages/LoadingFlashcards";
import EmptyFlashcards from "../../components/admin/languages/EmptyFlashcards";

export default function FlashcardsAdmin() {
  const [flashcards, setFlashcards] =
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

  const [editingFlashcard, setEditingFlashcard] =
    useState(null);

  const [showDelete, setShowDelete] =
    useState(false);

  const [deletingFlashcard, setDeletingFlashcard] =
    useState(null);

  const fetchFlashcards =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          flashcardsResult,
          languageResult,
        ] = await Promise.all([
          supabase
            .from("language_flashcards")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("languages")
            .select("id,name")
            .order("name"),
        ]);

        if (flashcardsResult.error)
          throw flashcardsResult.error;

        if (languageResult.error)
          throw languageResult.error;

        setFlashcards(
          flashcardsResult.data || []
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
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleRefresh =
    async () => {
      setRefreshing(true);
      await fetchFlashcards();
      setRefreshing(false);
    };

  const filteredFlashcards =
    useMemo(() => {
      return flashcards.filter((card) => {
        const matchesSearch =
          card.word
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          card.translation
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesLanguage =
          language === "All"
            ? true
            : card.language_id ===
              language;

        const matchesLevel =
          level === "All"
            ? true
            : card.level === level;

        return (
          matchesSearch &&
          matchesLanguage &&
          matchesLevel
        );
      });
    }, [
      flashcards,
      search,
      language,
      level,
    ]);

  const stats = useMemo(
    () => ({
      total: flashcards.length,

      beginner:
        flashcards.filter(
          (card) =>
            card.level ===
            "Beginner"
        ).length,

      intermediate:
        flashcards.filter(
          (card) =>
            card.level ===
            "Intermediate"
        ).length,

      advanced:
        flashcards.filter(
          (card) =>
            card.level ===
            "Advanced"
        ).length,
    }),
    [flashcards]
  );
    return (
    <div className="space-y-8">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-black text-white">
            Flashcards
          </h1>

          <p className="mt-2 text-slate-400">
            Create and manage vocabulary flashcards.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-white transition hover:border-cyan-500"
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
              setEditingFlashcard(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-500"
          >
            <Plus size={18} />

            New Flashcard
          </button>

        </div>

      </div>

      <FlashcardsStats
        stats={stats}
      />

      <FlashcardsFilters
        search={search}
        setSearch={setSearch}
        language={language}
        setLanguage={setLanguage}
        level={level}
        setLevel={setLevel}
        languages={languages}
      />

      {loading ? (
        <LoadingFlashcards />
      ) : filteredFlashcards.length === 0 ? (
        <EmptyFlashcards />
      ) : (
        <motion.div
          layout
          className="mt-8"
        >
          <FlashcardsGrid
            flashcards={filteredFlashcards}
            onEdit={(card) => {
              setEditingFlashcard(card);
              setShowForm(true);
            }}
            onDelete={(card) => {
              setDeletingFlashcard(card);
              setShowDelete(true);
            }}
          />
        </motion.div>
      )}

      <FlashcardForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingFlashcard(null);
        }}
        flashcard={editingFlashcard}
        languages={languages}
        saving={saving}
        setSaving={setSaving}
        onSaved={fetchFlashcards}
      />

      <DeleteFlashcardModal
        open={showDelete}
        flashcard={deletingFlashcard}
        onClose={() => {
          setShowDelete(false);
          setDeletingFlashcard(null);
        }}
        onDeleted={fetchFlashcards}
      />

    </div>
  );
}