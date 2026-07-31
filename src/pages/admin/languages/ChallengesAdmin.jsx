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

import ChallengeStats from "../../components/admin/languages/ChallengeStats";
import ChallengeFilters from "../../components/admin/languages/ChallengeFilters";
import ChallengesGrid from "../../components/admin/languages/ChallengesGrid";
import ChallengeForm from "../../components/admin/languages/ChallengeForm";
import DeleteChallengeModal from "../../components/admin/languages/DeleteChallengeModal";
import LoadingChallenges from "../../components/admin/languages/LoadingChallenges";
import EmptyChallenges from "../../components/admin/languages/EmptyChallenges";

export default function ChallengesAdmin() {
  const [challenges, setChallenges] =
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

  const [difficulty, setDifficulty] =
    useState("All");

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingChallenge,
    setEditingChallenge,
  ] = useState(null);

  const [
    deletingChallenge,
    setDeletingChallenge,
  ] = useState(null);

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);

  const fetchChallenges =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          challengeResult,
          languageResult,
        ] = await Promise.all([
          supabase
            .from("language_challenges")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("languages")
            .select("id,name")
            .order("name"),
        ]);

        if (challengeResult.error)
          throw challengeResult.error;

        if (languageResult.error)
          throw languageResult.error;

        setChallenges(
          challengeResult.data || []
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
    fetchChallenges();
  }, [fetchChallenges]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchChallenges();

      setRefreshing(false);
    };

  const filteredChallenges =
    useMemo(() => {
      return challenges.filter(
        (challenge) => {
          const matchesSearch =
            challenge.title
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesLanguage =
            language === "All"
              ? true
              : challenge.language_id ===
                language;

          const matchesDifficulty =
            difficulty === "All"
              ? true
              : challenge.difficulty ===
                difficulty;

          return (
            matchesSearch &&
            matchesLanguage &&
            matchesDifficulty
          );
        }
      );
    }, [
      challenges,
      search,
      language,
      difficulty,
    ]);

  const stats = useMemo(
    () => ({
      total: challenges.length,

      easy:
        challenges.filter(
          (item) =>
            item.difficulty ===
            "Easy"
        ).length,

      medium:
        challenges.filter(
          (item) =>
            item.difficulty ===
            "Medium"
        ).length,

      hard:
        challenges.filter(
          (item) =>
            item.difficulty ===
            "Hard"
        ).length,
    }),
    [challenges]
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
            Language Challenges
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Create and manage daily, weekly and special
            language learning challenges.
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
              setEditingChallenge(null);
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

            New Challenge

          </button>

        </div>

      </motion.div>

      {/* ================= STATS ================= */}

      <ChallengeStats
        stats={stats}
      />

      {/* ================= FILTERS ================= */}

      <ChallengeFilters
        search={search}
        setSearch={setSearch}
        language={language}
        setLanguage={setLanguage}
        languages={languages}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />

      {/* ================= GRID ================= */}

      {loading ? (

        <LoadingChallenges />

      ) : filteredChallenges.length === 0 ? (

        <EmptyChallenges />

      ) : (

        <ChallengesGrid
          challenges={filteredChallenges}
          onEdit={(challenge) => {
            setEditingChallenge(challenge);
            setShowForm(true);
          }}
          onDelete={(challenge) => {
            setDeletingChallenge(challenge);
            setShowDelete(true);
          }}
        />

      )}

      {/* ================= FORM ================= */}

      <ChallengeForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingChallenge(null);
        }}
        challenge={editingChallenge}
        languages={languages}
        saving={saving}
        setSaving={setSaving}
        refreshChallenges={fetchChallenges}
      />

      {/* ================= DELETE ================= */}

      <DeleteChallengeModal
        open={showDelete}
        challenge={deletingChallenge}
        onClose={() => {
          setShowDelete(false);
          setDeletingChallenge(null);
        }}
        refreshChallenges={fetchChallenges}
      />

    </section>
  );
}