import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Library,
  UserRound,
  X,
  ChevronRight,
  Star,
  ImageOff,
} from "lucide-react";
import Cog from "../assets/cog.png";
import novel from "../assets/novel.jpg"

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const GENRES = [
  "ALL",
  "SCI_FIC",
  "ROMANCE",
  "FANTASY",
  "THRILLER",
  "MYSTERY",
  "ADVENTURE",
  "HISTORICAL",
  "CHRISTIAN",
  "COMEDY",
  "EDUCATIONAL",
  "AFRICAN",
];

const normalize = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/['’"]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const formatGenre = (value) =>
  String(value || "UNCATEGORIZED")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTitle = (n) =>
  n?.title ||
  n?.name ||
  n?.book_title ||
  n?.bookTitle ||
  "Untitled Novel";

const getAuthor = (n) =>
  n?.author ||
  n?.author_name ||
  n?.authorName ||
  n?.writer ||
  "Unknown Author";

const getGenre = (n) =>
  n?.genre ||
  n?.category ||
  n?.type ||
  "";

const getCover = (n) =>
  n?.cover_url ||
  n?.coverUrl ||
  n?.cover ||
  n?.cover_image ||
  n?.coverImage ||
  n?.image_url ||
  n?.imageUrl ||
  n?.image ||
  n?.thumbnail ||
  "";

const resolveCover = (cover) => {
  if (!cover) return "";

  const value = String(cover).trim();

  if (/^(https?:\/\/|data:)/i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const getToken = () => {
  for (const key of [
    "token",
    "authToken",
    "accessToken",
    "scholiqen_token",
    "scholiqenToken",
  ]) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

const fetchNovels = async () => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/novels`,
    {
      headers: {
        Accept: "application/json",
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Unable to load novels."
    );
  }

  return Array.isArray(data?.novels)
    ? data.novels
    : Array.isArray(data)
    ? data
    : [];
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035 },
  },
};

export default function Novels() {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genre, setGenre] = useState("ALL");
  const [search, setSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);

  const loadNovels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchNovels();

      const clean = data
        .filter((n) => n?.id)
        .map((n) => ({
          ...n,
          title: getTitle(n),
          author: getAuthor(n),
          genre: getGenre(n),
          cover_url: resolveCover(getCover(n)),
        }));

      setNovels(
        Array.from(
          new Map(
            clean.map((n) => [String(n.id), n])
          ).values()
        )
      );
    } catch (err) {
      console.error("Novel error:", err);
      setError(err.message || "Unable to load novels.");
      setNovels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNovels();
  }, [loadNovels]);

  const openStory = useCallback(
    (n) => {
      if (n?.id) navigate(`/story/${n.id}`);
    },
    [navigate]
  );

  /* First imported novel = Discover Stories background */
  const heroNovel = novels[0];
  const heroCover = heroNovel?.cover_url || "";

  const filteredNovels = useMemo(() => {
    const q = search.trim().toLowerCase();

    return novels.filter((n) => {
      const matchesGenre =
        genre === "ALL" ||
        normalize(n.genre) === genre;

      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q);

      return matchesGenre && matchesSearch;
    });
  }, [novels, genre, search]);

  const genreCount = useMemo(
    () =>
      new Set(
        novels
          .map((n) => normalize(n.genre))
          .filter(Boolean)
      ).size,
    [novels]
  );

  const trending = useMemo(
    () => novels.slice(0, Math.min(6, novels.length)),
    [novels]
  );

  const hotPicks = useMemo(
    () => novels.slice(1, Math.min(7, novels.length)),
    [novels]
  );

  const reset = () => {
    setGenre("ALL");
    setSearch("");
    setMobileSearch(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#04070e] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#04070e]/80 px-4 backdrop-blur-2xl sm:px-6">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4">

          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
          >
            <img
              src={Cog}
              alt="Scholiqen"
              className="h-10 w-10 object-contain"
            />

            <div className="hidden text-left sm:block">
              <h2 className="text-sm font-black">
                Scholiqen
              </h2>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                Novel Library
              </p>
            </div>
          </button>

          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search stories, authors..."
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-11 pr-10 text-xs outline-none placeholder:text-slate-600 focus:border-blue-500/40"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMobileSearch(!mobileSearch)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 sm:flex"
            >
              Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pb-4 md:hidden"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                <input
                  autoFocus
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search stories..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 text-sm outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[440px] overflow-hidden rounded-[30px] border border-white/10 sm:h-[480px]"
        >
          {heroCover ? (
            <img
              src={novel}
              alt={heroNovel?.title || "Imported Novel"}
              className="absolute inset-0 h-full w-full scale-105 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#101c32] via-[#080f1b] to-[#03050a]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04070e] via-transparent to-transparent" />

          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-7 sm:p-10 md:p-14">

            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Explore & Escape
            </div>

            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Discover Stories
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                Worth Reading.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Immerse yourself in captivating stories,
              handpicked collections, and unforgettable
              worlds across multiple genres.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Stat
                icon={BookOpen}
                value={novels.length}
                label="Stories"
              />

              <Stat
                icon={Library}
                value={genreCount}
                label="Genres"
              />

              <Stat
                icon={Star}
                value="Free"
                label="Reading"
              />
            </div>
          </div>
        </motion.section>

        {/* GENRES */}
        <div className="mt-7 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((item) => (
            <button
              key={item}
              onClick={() => setGenre(item)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider ${
                genre === item
                  ? "border-blue-500/40 bg-blue-600 text-white"
                  : "border-white/10 bg-white/[0.035] text-slate-400 hover:text-white"
              }`}
            >
              {formatGenre(item)}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <section className="mt-10">

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load novels"
              description={error}
              buttonText="Try Again"
              onReset={loadNovels}
            />
          ) : search || genre !== "ALL" ? (
            <>
              <SectionHeader
                icon={Search}
                title="Search Results"
                description={`${filteredNovels.length} stories found`}
              />

              {filteredNovels.length ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {filteredNovels.map((n) => (
                    <GridCard
                      key={n.id}
                      n={n}
                      onOpen={openStory}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No stories found"
                  description="Try another search or genre."
                  onReset={reset}
                />
              )}
            </>
          ) : (
            <div className="space-y-14">

              {/* HOT PICKS */}
              {hotPicks.length > 0 && (
                <section>
                  <SectionHeader
                    icon={Flame}
                    title="Hot Picks"
                    description="Stories from your imported collection."
                  />

                  <div className="flex gap-5 overflow-x-auto pb-5 scrollbar-none">
                    {hotPicks.map((n) => (
                      <ScrollCard
                        key={n.id}
                        n={n}
                        onOpen={openStory}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* TRENDING */}
              {trending.length > 0 && (
                <section>
                  <SectionHeader
                    icon={TrendingUp}
                    title="Trending Now"
                    description="Discover more from your library."
                  />

                  <div className="flex gap-5 overflow-x-auto pb-5 scrollbar-none">
                    {trending.map((n) => (
                      <ScrollCard
                        key={n.id}
                        n={n}
                        onOpen={openStory}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* COMPLETE CATALOG */}
              <section>
                <SectionHeader
                  icon={Library}
                  title="Complete Catalog"
                  description="Every novel you imported into Scholiqen."
                  count={novels.length}
                />

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                >
                  {novels.map((n) => (
                    <GridCard
                      key={n.id}
                      n={n}
                      onOpen={openStory}
                    />
                  ))}
                </motion.div>
              </section>
            </div>
          )}
        </section>

        {/* CTA */}
        {!loading && novels.length > 0 && (
          <section className="relative mt-20 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] px-7 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
              <BookOpen className="h-7 w-7 text-blue-400" />
            </div>

            <h2 className="mt-5 text-2xl font-black sm:text-3xl">
              Your Next Story Is Waiting
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Explore your imported collection and
              discover your next favorite story.
            </p>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs font-extrabold"
            >
              Explore Library
              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 backdrop-blur-xl">
      <Icon className="h-4 w-4 text-blue-400" />
      <div>
        <p className="text-xs font-black">{value}</p>
        <p className="text-[9px] uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

function NovelCover({ n }) {
  const [failed, setFailed] = useState(false);
  const cover = n?.cover_url;

  if (!cover || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0c1424] to-[#03060c]">
        <div className="text-center">
          <ImageOff className="mx-auto h-8 w-8 text-slate-700" />
          <p className="mt-2 text-[9px] font-bold uppercase text-slate-700">
            Cover unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={cover}
      alt={n.title}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

function ScrollCard({ n, onOpen }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={() => onOpen(n)}
      className="group w-[190px] min-w-[190px] cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]">
        <NovelCover n={n} />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

        <span className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-[9px] font-bold uppercase text-blue-300 backdrop-blur-md">
          {formatGenre(n.genre)}
        </span>
      </div>

      <p className="mt-3 truncate text-xs font-bold text-white">
        {n.title}
      </p>

      <p className="mt-1 truncate text-[10px] text-slate-500">
        By {n.author}
      </p>
    </motion.div>
  );
}

function GridCard({ n, onOpen }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      onClick={() => onOpen(n)}
      className="group cursor-pointer"
    >
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035]">
        <div className="relative aspect-[3/4] overflow-hidden">
          <NovelCover n={n} />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

          <span className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-[9px] font-bold uppercase text-blue-300 backdrop-blur-md">
            {formatGenre(n.genre)}
          </span>

          <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-blue-600/90 py-2 text-center text-[10px] font-bold opacity-0 transition group-hover:opacity-100">
            Read Story
          </div>
        </div>

        <div className="p-4">
          <h3 className="truncate text-sm font-extrabold text-white">
            {n.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5">
            <UserRound className="h-3 w-3 text-slate-600" />
            <p className="truncate text-[10px] text-slate-500">
              {n.author}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035]">
      <div className="aspect-[3/4] animate-pulse bg-white/[0.06]" />

      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  count,
}) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
            <Icon className="h-4 w-4 text-blue-400" />
          </div>

          <h2 className="text-xl font-black">
            {title}
          </h2>
        </div>

        {description && (
          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>

      {typeof count === "number" && (
        <span className="hidden text-xs text-slate-600 sm:block">
          {count} books
        </span>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
  onReset,
  buttonText = "Explore All Stories",
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
      <BookOpen className="mx-auto h-10 w-10 text-blue-400/40" />

      <h3 className="mt-5 text-lg font-black">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>

      <button
        onClick={onReset}
        className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-slate-300"
      >
        {buttonText}
      </button>
    </div>
  );
}