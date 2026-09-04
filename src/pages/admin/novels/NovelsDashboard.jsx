// src/pages/admin/novels/NovelsDashboard.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Layers,
  MessageSquare,
  Users,
  Plus,
  Eye,
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminButton from "../../../components/admin/ui/AdminButton";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const FALLBACK_COVER =
  "https://via.placeholder.com/100x120?text=Novel";

/* =========================================================
   HELPERS
========================================================= */

const getCoverUrl = (coverUrl) => {
  if (!coverUrl) {
    return FALLBACK_COVER;
  }

  // Already a complete URL
  if (/^https?:\/\//i.test(coverUrl)) {
    return coverUrl;
  }

  // Express local upload path
  return `${API_URL}${
    coverUrl.startsWith("/") ? "" : "/"
  }${coverUrl}`;
};

const getChapterCount = (novel) => {
  if (!novel) return 0;

  // Normal JSON array
  if (Array.isArray(novel.chapters)) {
    return novel.chapters.length;
  }

  // In case backend ever returns JSON as a string
  if (typeof novel.chapters === "string") {
    try {
      const parsed = JSON.parse(novel.chapters);

      return Array.isArray(parsed)
        ? parsed.length
        : 0;
    } catch {
      return 0;
    }
  }

  return 0;
};

/* =========================================================
   COMPONENT
========================================================= */

const NovelsDashboard = () => {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH DASHBOARD DATA
  ========================================================= */

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /* =====================================================
           FETCH NOVELS FROM EXPRESS + NEON
        ===================================================== */

        const response = await fetch(
          `${API_URL}/api/novels`
        );

        let data = null;

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Failed to load novels (${response.status})`
          );
        }

        /* =====================================================
           NORMALIZE RESPONSE
        ===================================================== */

        const fetchedNovels = Array.isArray(data)
          ? data
          : Array.isArray(data?.novels)
          ? data.novels
          : [];

        /* =====================================================
           SORT BY CREATED DATE
        ===================================================== */

        const sortedNovels = [...fetchedNovels].sort(
          (a, b) => {
            const dateA = new Date(
              a?.created_at || 0
            ).getTime();

            const dateB = new Date(
              b?.created_at || 0
            ).getTime();

            return dateB - dateA;
          }
        );

        setNovels(sortedNovels);
      } catch (err) {
        console.error(
          "Novel dashboard error:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while loading the novels dashboard."
        );

        setNovels([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =========================================================
     DASHBOARD STATS
  ========================================================= */

  const stats = useMemo(() => {
    const totalNovels = novels.length;

    const totalChapters = novels.reduce(
      (total, novel) =>
        total + getChapterCount(novel),
      0
    );

    return {
      novels: totalNovels,
      chapters: totalChapters,

      // These require dedicated backend data/routes.
      reviews: 0,
      readers: 0,
    };
  }, [novels]);

  /* =========================================================
     RECENT NOVELS
  ========================================================= */

  const recentNovels = useMemo(() => {
    return novels.slice(0, 5);
  }, [novels]);

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const cards = [
    {
      title: "Total Novels",
      value: stats.novels,
      icon: BookOpen,
      color: "text-blue-400",
      background: "bg-blue-500/10",
    },
    {
      title: "Total Chapters",
      value: stats.chapters,
      icon: Layers,
      color: "text-purple-400",
      background: "bg-purple-500/10",
    },
    {
      title: "Reviews",
      value: stats.reviews,
      icon: MessageSquare,
      color: "text-pink-400",
      background: "bg-pink-500/10",
    },
    {
      title: "Readers",
      value: stats.readers,
      icon: Users,
      color: "text-green-400",
      background: "bg-green-500/10",
    },
  ];

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={40}
            className="animate-spin text-blue-500"
          />

          <p className="text-slate-400">
            Loading novels dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (
    <div className="space-y-8 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Novels Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your stories, chapters and readers.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="
              h-11
              w-11
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              text-slate-300
              flex
              items-center
              justify-center
              hover:bg-slate-800
              hover:text-white
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition
            "
            title="Refresh dashboard"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          {/* ADD NOVEL */}

          <AdminButton
            onClick={() =>
              navigate("/admin/novels/create")
            }
          >
            <span className="flex items-center gap-2">
              <Plus size={18} />
              Add Novel
            </span>
          </AdminButton>

        </div>
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-red-400
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <p className="text-sm">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            className="
              text-sm
              font-medium
              text-red-300
              hover:text-white
              whitespace-nowrap
            "
          >
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-5
                hover:border-slate-700
                transition
              "
            >
              <div
                className={`
                  w-12
                  h-12
                  rounded-xl
                  ${card.background}
                  ${card.color}
                  flex
                  items-center
                  justify-center
                  mb-4
                `}
              >
                <Icon size={24} />
              </div>

              <p className="text-slate-400 text-sm">
                {card.title}
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {card.value.toLocaleString()}
              </h2>
            </div>
          );
        })}

      </div>

      {/* =====================================================
          ALL NOVELS
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          navigate("/admin/novels/list")
        }
        className="
          w-full
          text-left
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
          hover:bg-slate-800
          hover:border-slate-700
          transition
          group
        "
      >
        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-blue-500/10
                text-blue-400
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <BookOpen size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                All Novels
              </h2>

              <p className="text-slate-400 mt-1">
                View and manage every uploaded novel.
              </p>
            </div>

          </div>

          <ArrowRight
            size={20}
            className="
              text-slate-500
              group-hover:text-blue-400
              group-hover:translate-x-1
              transition
            "
          />

        </div>
      </button>

      {/* =====================================================
          RECENT NOVELS
      ===================================================== */}

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
        "
      >

        {/* SECTION HEADER */}

        <div className="flex items-center justify-between gap-4 mb-5">

          <div>
            <h2 className="text-xl font-bold">
              Recent Novels
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your latest uploaded stories.
            </p>
          </div>

          {recentNovels.length > 0 && (
            <button
              type="button"
              onClick={() =>
                navigate("/admin/novels/list")
              }
              className="
                text-sm
                text-blue-400
                hover:text-blue-300
                transition
              "
            >
              View All
            </button>
          )}

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {recentNovels.length === 0 ? (
          <div className="py-10 text-center">

            <BookOpen
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="font-semibold mt-4">
              No novels uploaded yet
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Start by adding your first novel.
            </p>

            <div className="mt-5">

              <AdminButton
                onClick={() =>
                  navigate("/admin/novels/create")
                }
              >
                <span className="flex items-center gap-2">
                  <Plus size={17} />
                  Add Novel
                </span>
              </AdminButton>

            </div>

          </div>
        ) : (

          /* =================================================
             RECENT NOVELS LIST
          ================================================= */

          <div className="space-y-3">

            {recentNovels.map((novel) => {

              const cover = getCoverUrl(
                novel.cover_url
              );

              return (
                <div
                  key={novel.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    bg-slate-800/70
                    border
                    border-slate-700/50
                    rounded-xl
                    p-4
                    hover:bg-slate-800
                    hover:border-slate-700
                    transition
                  "
                >

                  {/* NOVEL INFO */}

                  <div className="flex items-center gap-4 min-w-0">

                    <img
                      src={cover}
                      alt={
                        novel.title ||
                        "Novel cover"
                      }
                      className="
                        w-14
                        h-16
                        object-cover
                        rounded-lg
                        border
                        border-slate-700
                        bg-slate-900
                        shrink-0
                      "
                      onError={(event) => {
                        event.currentTarget.src =
                          FALLBACK_COVER;
                      }}
                    />

                    <div className="min-w-0">

                      <h3 className="font-semibold truncate">
                        {novel.title ||
                          "Untitled Novel"}
                      </h3>

                      <p className="text-sm text-slate-400 truncate">
                        {novel.genre ||
                          "Unknown Genre"}
                      </p>

                      {novel.author && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          by {novel.author}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* VIEW BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/novels/view/${novel.id}`
                      )
                    }
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-blue-500/10
                      text-blue-400
                      flex
                      items-center
                      justify-center
                      hover:bg-blue-500/20
                      hover:text-blue-300
                      transition
                      shrink-0
                    "
                    title="View novel"
                  >
                    <Eye size={19} />
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
};

export default NovelsDashboard;
