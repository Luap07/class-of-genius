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

import ListeningStats from "../../components/admin/languages/ListeningStats";
import ListeningFilters from "../../components/admin/languages/ListeningFilters";
import ListeningGrid from "../../components/admin/languages/ListeningGrid";
import ListeningForm from "../../components/admin/languages/ListeningForm";
import DeleteListeningModal from "../../components/admin/languages/DeleteListeningModal";
import LoadingListening from "../../components/admin/languages/LoadingListening";
import EmptyListening from "../../components/admin/languages/EmptyListening";

export default function ListeningAdmin() {
  const [listening, setListening] =
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

  const [editingListening, setEditingListening] =
    useState(null);

  const [showDelete, setShowDelete] =
    useState(false);

  const [deletingListening, setDeletingListening] =
    useState(null);

  const fetchListening =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          listeningResult,
          languageResult,
        ] = await Promise.all([
          supabase
            .from("language_listening")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("languages")
            .select("id,name")
            .order("name"),
        ]);

        if (listeningResult.error)
          throw listeningResult.error;

        if (languageResult.error)
          throw languageResult.error;

        setListening(
          listeningResult.data || []
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
    fetchListening();
  }, [fetchListening]);

  const handleRefresh =
    async () => {
      setRefreshing(true);
      await fetchListening();
      setRefreshing(false);
    };

  const filteredListening =
    useMemo(() => {
      return listening.filter((item) => {
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
      listening,
      search,
      language,
      level,
    ]);

  const stats = useMemo(
    () => ({
      total: listening.length,

      beginner:
        listening.filter(
          (item) =>
            item.level ===
            "Beginner"
        ).length,

      intermediate:
        listening.filter(
          (item) =>
            item.level ===
            "Intermediate"
        ).length,

      advanced:
        listening.filter(
          (item) =>
            item.level ===
            "Advanced"
        ).length,
    }),
    [listening]
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
            Listening Lessons
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Manage audio lessons, conversations,
            pronunciation exercises and listening practice.
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
              setEditingListening(null);
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

            Add Listening

          </button>

        </div>

      </motion.div>

      {/* ================= STATS ================= */}

      <ListeningStats
        stats={stats}
      />

      {/* ================= FILTERS ================= */}

      <ListeningFilters
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

        <LoadingListening />

      ) : filteredListening.length === 0 ? (

        <EmptyListening />

      ) : (

        <ListeningGrid
          listening={filteredListening}
          onEdit={(item) => {
            setEditingListening(item);
            setShowForm(true);
          }}
          onDelete={(item) => {
            setDeletingListening(item);
            setShowDelete(true);
          }}
        />

      )}

      {/* ================= FORM ================= */}

      <ListeningForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingListening(null);
        }}
        listening={editingListening}
        saving={saving}
        setSaving={setSaving}
        languages={languages}
        refreshListening={fetchListening}
      />

      {/* ================= DELETE ================= */}

      <DeleteListeningModal
        open={showDelete}
        listening={deletingListening}
        onClose={() => {
          setShowDelete(false);
          setDeletingListening(null);
        }}
        refreshListening={fetchListening}
      />

    </section>
  );
}