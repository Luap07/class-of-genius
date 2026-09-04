// src/pages/admin/novels/NovelsList.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Loader2,
  Eye,
  RefreshCw,
  Search,
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

/* =========================================================
   FALLBACK COVER
========================================================= */

const FALLBACK_COVER =
  "https://via.placeholder.com/80x100?text=Novel";

/* =========================================================
   COVER URL HELPER
========================================================= */

const getCoverUrl = (coverUrl) => {
  if (!coverUrl) {
    return FALLBACK_COVER;
  }

  // Already a complete URL
  if (/^https?:\/\//i.test(coverUrl)) {
    return coverUrl;
  }

  // Express returns paths such as:
  // /uploads/covers/example.jpg
  return `${API_URL}${
    coverUrl.startsWith("/")
      ? ""
      : "/"
  }${coverUrl}`;
};

/* =========================================================
   NOVELS LIST
========================================================= */

const NovelsList = () => {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     FETCH NOVELS
  ========================================================= */

  const fetchNovels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

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

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.error ||
            "Failed to load novels."
        );
      }

      setNovels(
        Array.isArray(data.novels)
          ? data.novels
          : []
      );
    } catch (err) {
      console.error(
        "Error fetching novels:",
        err
      );

      setNovels([]);

      setError(
        err?.message ||
          "Something went wrong while loading novels."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredNovels = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return novels;
    }

    return novels.filter((novel) => {
      const title = String(
        novel.title || ""
      ).toLowerCase();

      const author = String(
        novel.author || ""
      ).toLowerCase();

      const genre = String(
        novel.genre || ""
      ).toLowerCase();

      const status = String(
        novel.status || ""
      ).toLowerCase();

      return (
        title.includes(query) ||
        author.includes(query) ||
        genre.includes(query) ||
        status.includes(query)
      );
    });
  }, [novels, search]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const {
    totalNovels,
    totalChapters,
    genreStats,
  } = useMemo(() => {
    let chapters = 0;

    const genres = novels.reduce(
      (acc, novel) => {
        const genre =
          novel.genre?.trim() ||
          "Unknown";

        acc[genre] =
          (acc[genre] || 0) + 1;

        if (
          Array.isArray(novel.chapters)
        ) {
          chapters +=
            novel.chapters.length;
        }

        return acc;
      },
      {}
    );

    return {
      totalNovels: novels.length,
      totalChapters: chapters,
      genreStats: genres,
    };
  }, [novels]);

  /* =========================================================
     DELETE NOVEL
  ========================================================= */

  const deleteNovel = async (id) => {
    if (!id) {
      return;
    }

    const novel = novels.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Delete "${
        novel?.title ||
        "this novel"
      }"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/novels/${id}`,
        {
          method: "DELETE",
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.error ||
            "Failed to delete novel."
        );
      }

      setNovels((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Error deleting novel:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while deleting the novel."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     LOADING
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
            Loading novels...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            All Novels
          </h1>

          <p className="text-slate-400 mt-2">
            Manage uploaded novels, chapters and details.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchNovels}
            disabled={loading}
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
              transition
            "
            title="Refresh novels"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          {/* ADD */}

          <AdminButton
            onClick={() =>
              navigate(
                "/admin/novels/create"
              )
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
          ERROR
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
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchNovels}
            className="
              text-sm
              text-red-300
              hover:text-white
              underline
            "
          >
            Try again
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        {/* TOTAL NOVELS */}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">
            Total Novels
          </p>

          <h2 className="text-3xl font-bold text-blue-400 mt-2">
            {totalNovels}
          </h2>
        </div>

        {/* TOTAL CHAPTERS */}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">
            Total Chapters
          </p>

          <h2 className="text-3xl font-bold text-purple-400 mt-2">
            {totalChapters}
          </h2>
        </div>

        {/* TOP GENRES */}

        {Object.entries(
          genreStats
        )
          .slice(0, 4)
          .map(
            ([genre, total]) => (
              <div
                key={genre}
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-xl
                  p-5
                "
              >
                <p
                  className="text-slate-400 text-sm truncate"
                  title={genre}
                >
                  {genre}
                </p>

                <h2 className="text-2xl font-bold text-green-400 mt-2">
                  {total}
                </h2>
              </div>
            )
          )}
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
          bg-slate-900
          border
          border-slate-800
          rounded-xl
          px-4
          h-12
        "
      >
        <Search
          size={19}
          className="text-slate-500"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search by title, author, genre or status..."
          className="
            flex-1
            bg-transparent
            outline-none
            text-white
            placeholder:text-slate-500
          "
        />

        {search && (
          <button
            type="button"
            onClick={() =>
              setSearch("")
            }
            className="
              text-slate-500
              hover:text-white
              transition
            "
          >
            Clear
          </button>
        )}
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {novels.length === 0 ? (
        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-12
            text-center
          "
        >
          <BookOpen
            size={50}
            className="mx-auto text-slate-500"
          />

          <h2 className="text-xl font-bold mt-4">
            No Novels Found
          </h2>

          <p className="text-slate-400 mt-2">
            Start by adding your first novel.
          </p>

          <div className="mt-6">
            <AdminButton
              onClick={() =>
                navigate(
                  "/admin/novels/create"
                )
              }
            >
              <span className="flex items-center gap-2">
                <Plus size={18} />
                Add Novel
              </span>
            </AdminButton>
          </div>
        </div>
      ) : filteredNovels.length === 0 ? (
        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-10
            text-center
          "
        >
          <Search
            size={42}
            className="mx-auto text-slate-500"
          />

          <h2 className="text-xl font-bold mt-4">
            No Matching Novels
          </h2>

          <p className="text-slate-400 mt-2">
            Try a different search term.
          </p>
        </div>
      ) : (

        /* ===================================================
           NOVELS TABLE
        =================================================== */

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
          "
        >
          <div className="overflow-x-auto">

            <table className="w-full text-left min-w-[850px]">

              {/* TABLE HEAD */}

              <thead className="bg-slate-800">
                <tr>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Cover
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Title
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Author
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Genre
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Chapters
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold">
                    Actions
                  </th>

                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>

                {filteredNovels.map(
                  (novel) => {

                    const chapterCount =
                      Array.isArray(
                        novel.chapters
                      )
                        ? novel.chapters.length
                        : 0;

                    const isPublished =
                      String(
                        novel.status || ""
                      ).toLowerCase() ===
                      "published";

                    const cover =
                      getCoverUrl(
                        novel.cover_url
                      );

                    return (
                      <tr
                        key={novel.id}
                        className="
                          border-t
                          border-slate-800
                          hover:bg-slate-800/50
                          transition
                        "
                      >

                        {/* COVER */}

                        <td className="px-6 py-4">

                          <img
                            src={cover}
                            alt={
                              novel.title ||
                              "Novel cover"
                            }
                            className="
                              w-16
                              h-20
                              object-cover
                              rounded-lg
                              border
                              border-slate-700
                              bg-slate-800
                            "
                            onError={(
                              e
                            ) => {
                              if (
                                e
                                  .currentTarget
                                  .src !==
                                FALLBACK_COVER
                              ) {
                                e.currentTarget.src =
                                  FALLBACK_COVER;
                              }
                            }}
                          />

                        </td>

                        {/* TITLE */}

                        <td className="px-6 py-4">

                          <div className="max-w-[220px]">

                            <p className="font-semibold truncate">
                              {novel.title ||
                                "Untitled Novel"}
                            </p>

                            {novel.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {
                                  novel.description
                                }
                              </p>
                            )}

                          </div>

                        </td>

                        {/* AUTHOR */}

                        <td className="px-6 py-4 text-slate-300">
                          {novel.author ||
                            "Unknown"}
                        </td>

                        {/* GENRE */}

                        <td className="px-6 py-4 text-slate-400">
                          {novel.genre ||
                            "Unknown"}
                        </td>

                        {/* CHAPTERS */}

                        <td className="px-6 py-4">

                          <span className="inline-flex items-center gap-2">

                            <BookOpen
                              size={16}
                              className="text-slate-500"
                            />

                            {chapterCount}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-medium
                              ${
                                isPublished
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }
                            `}
                          >
                            {novel.status ||
                              "Draft"}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            {/* VIEW */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/novels/view/${novel.id}`
                                )
                              }
                              className="
                                w-9
                                h-9
                                rounded-lg
                                bg-blue-500/10
                                text-blue-400
                                flex
                                items-center
                                justify-center
                                hover:bg-blue-500/20
                                transition
                              "
                              title="View novel"
                            >
                              <Eye
                                size={18}
                              />
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/novels/edit/${novel.id}`
                                )
                              }
                              className="
                                w-9
                                h-9
                                rounded-lg
                                bg-slate-800
                                text-slate-300
                                flex
                                items-center
                                justify-center
                                hover:bg-slate-700
                                hover:text-white
                                transition
                              "
                              title="Edit novel"
                            >
                              <Edit
                                size={18}
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                novel.id
                              }
                              onClick={() =>
                                deleteNovel(
                                  novel.id
                                )
                              }
                              className="
                                w-9
                                h-9
                                rounded-lg
                                bg-red-500/10
                                text-red-400
                                flex
                                items-center
                                justify-center
                                hover:bg-red-500/20
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                transition
                              "
                              title="Delete novel"
                            >
                              {deletingId ===
                              novel.id ? (
                                <Loader2
                                  size={18}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={18}
                                />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              TABLE FOOTER
          ================================================= */}

          <div
            className="
              px-6
              py-4
              border-t
              border-slate-800
              text-sm
              text-slate-500
              flex
              justify-between
              items-center
            "
          >
            <span>
              Showing{" "}
              {filteredNovels.length}{" "}
              of{" "}
              {novels.length}{" "}
              novels
            </span>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  text-blue-400
                  hover:text-blue-300
                "
              >
                Clear search
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default NovelsList;
