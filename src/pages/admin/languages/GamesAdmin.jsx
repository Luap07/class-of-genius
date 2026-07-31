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

import GamesStats from "../../components/admin/languages/GamesStats";
import GamesFilters from "../../components/admin/languages/GamesFilters";
import GamesGrid from "../../components/admin/languages/GamesGrid";
import GameForm from "../../components/admin/languages/GameForm";
import DeleteGameModal from "../../components/admin/languages/DeleteGameModal";
import LoadingGames from "../../components/admin/languages/LoadingGames";
import EmptyGames from "../../components/admin/languages/EmptyGames";

export default function GamesAdmin() {
  const [games, setGames] =
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

  const [gameType, setGameType] =
    useState("All");

  const [showForm, setShowForm] =
    useState(false);

  const [editingGame, setEditingGame] =
    useState(null);

  const [showDelete, setShowDelete] =
    useState(false);

  const [deletingGame, setDeletingGame] =
    useState(null);

  const fetchGames =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          gamesResult,
          languageResult,
        ] = await Promise.all([
          supabase
            .from("language_games")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("languages")
            .select("id,name")
            .order("name"),
        ]);

        if (gamesResult.error)
          throw gamesResult.error;

        if (languageResult.error)
          throw languageResult.error;

        setGames(
          gamesResult.data || []
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
    fetchGames();
  }, [fetchGames]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await fetchGames();

      setRefreshing(false);
    };

  const filteredGames =
    useMemo(() => {
      return games.filter((game) => {
        const matchesSearch =
          game.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesLanguage =
          language === "All"
            ? true
            : game.language_id ===
              language;

        const matchesType =
          gameType === "All"
            ? true
            : game.type === gameType;

        return (
          matchesSearch &&
          matchesLanguage &&
          matchesType
        );
      });
    }, [
      games,
      search,
      language,
      gameType,
    ]);

  const stats = useMemo(
    () => ({
      total: games.length,

      wordGames:
        games.filter(
          (game) =>
            game.type ===
            "Word Game"
        ).length,

      quizGames:
        games.filter(
          (game) =>
            game.type ===
            "Quiz"
        ).length,

      puzzleGames:
        games.filter(
          (game) =>
            game.type ===
            "Puzzle"
        ).length,
    }),
    [games]
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
            Language Games
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Manage educational games for every language.
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
              setEditingGame(null);
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

            New Game

          </button>

        </div>

      </motion.div>

      {/* ================= STATS ================= */}

      <GamesStats
        stats={stats}
      />

      {/* ================= FILTERS ================= */}

      <GamesFilters
        search={search}
        setSearch={setSearch}
        language={language}
        setLanguage={setLanguage}
        languages={languages}
        gameType={gameType}
        setGameType={setGameType}
      />

      {/* ================= GRID ================= */}

      {loading ? (

        <LoadingGames />

      ) : filteredGames.length === 0 ? (

        <EmptyGames />

      ) : (

        <GamesGrid
          games={filteredGames}
          onEdit={(game) => {
            setEditingGame(game);
            setShowForm(true);
          }}
          onDelete={(game) => {
            setDeletingGame(game);
            setShowDelete(true);
          }}
        />

      )}

      {/* ================= FORM ================= */}

      <GameForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingGame(null);
        }}
        game={editingGame}
        languages={languages}
        saving={saving}
        setSaving={setSaving}
        refreshGames={fetchGames}
      />

      {/* ================= DELETE ================= */}

      <DeleteGameModal
        open={showDelete}
        game={deletingGame}
        onClose={() => {
          setShowDelete(false);
          setDeletingGame(null);
        }}
        refreshGames={fetchGames}
      />

    </section>
  );
}