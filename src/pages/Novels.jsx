import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
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
  Lock,
  Loader2,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import novelImg from "../assets/novel.jpg";
import Cog from "../assets/cog.png";

/* =========================================================
   CONSTANTS
========================================================= */

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

const GENRE_PRICE = 5;
const GENRE_PAYMENT_ROUTE = "/genre-payment";

/*
  Fetch in small chunks.

  This is important because we don't want the browser
  waiting for 1000+ novels before displaying anything.
*/
const FETCH_BATCH_SIZE = 150;

/* =========================================================
   HELPERS
========================================================= */

const normalize = (genre) =>
  genre
    ? genre
        .toUpperCase()
        .replace(/\s+/g, "_")
        .trim()
    : "";

const formatGenre = (genre) =>
  genre
    ? genre.replace(/_/g, " ")
    : "UNCATEGORIZED";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const stagger = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.035,
    },
  },
};

/* =========================================================
   MAIN
========================================================= */

const Novels = () => {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);

  /*
    `loading` means the initial request is still running.
  */
  const [loading, setLoading] = useState(true);

  /*
    `loadingMore` means additional batches are being loaded
    after the first batch is already visible.
  */
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedGenre, setSelectedGenre] =
    useState("ALL");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const [checkingStoryId, setCheckingStoryId] =
    useState(null);

  const [fetchError, setFetchError] =
    useState(null);

  /* =======================================================
     FETCH NOVELS PROGRESSIVELY
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchNovelsProgressively = async () => {
      setLoading(true);
      setLoadingMore(false);
      setFetchError(null);
      setNovels([]);

      try {
        /*
          Only request fields actually used by this page.

          DO NOT use select("*") here.

          This can make a huge difference if your novels table
          contains large fields such as story content,
          descriptions, chapters, metadata, etc.
        */
        const columns =
          "id,title,author,genre,cover_url";

        let from = 0;
        let firstBatch = true;

        while (mounted) {
          if (!firstBatch) {
            setLoadingMore(true);
          }

          const to =
            from + FETCH_BATCH_SIZE - 1;

          const {
            data,
            error,
          } = await supabase
            .from("novels")
            .select(columns)
            .range(from, to);

          if (error) {
            throw error;
          }

          const batch = data || [];

          /*
            SHOW THE FIRST BATCH IMMEDIATELY.

            The old version waited for EVERYTHING before
            removing the skeleton.
          */
          if (mounted && batch.length > 0) {
            setNovels((previous) => {
              const existingIds = new Set(
                previous.map((item) => item.id)
              );

              const uniqueBatch =
                batch.filter(
                  (item) =>
                    !existingIds.has(item.id)
                );

              return [
                ...previous,
                ...uniqueBatch,
              ];
            });

            /*
              First batch is now visible.
            */
            if (firstBatch) {
              setLoading(false);
              firstBatch = false;
            }
          }

          /*
            If fewer records than the batch size were returned,
            we've reached the end.
          */
          if (
            batch.length < FETCH_BATCH_SIZE
          ) {
            break;
          }

          from += FETCH_BATCH_SIZE;

          /*
            Give React/browser a chance to paint the current
            batch before asking Supabase for the next one.
          */
          await new Promise((resolve) =>
            setTimeout(resolve, 0)
          );
        }

        if (mounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      } catch (error) {
        console.error(
          "Error fetching novels:",
          error
        );

        if (mounted) {
          setFetchError(
            error?.message ||
              "Unable to load novels."
          );

          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchNovelsProgressively();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     OPEN STORY
  ======================================================= */

  const openStory = useCallback(
    (novel) => {
      if (!novel?.id) return;

      if (checkingStoryId === novel.id) {
        return;
      }

      const genre = normalize(novel.genre);

      setCheckingStoryId(novel.id);

      if (!genre) {
        navigate(`/story/${novel.id}`);
        setCheckingStoryId(null);
        return;
      }

      navigate(
        `${GENRE_PAYMENT_ROUTE}/${encodeURIComponent(
          genre
        )}`,
        {
          state: {
            genre,
            storyId: novel.id,
            storyTitle: novel.title,
            price: GENRE_PRICE,
          },
        }
      );

      setCheckingStoryId(null);
    },
    [checkingStoryId, navigate]
  );

  /* =======================================================
     TRENDING / HOT PICKS
  ======================================================= */

  const {
    trendingNovels,
    hotPicks,
  } = useMemo(() => {
    if (!novels.length) {
      return {
        trendingNovels: [],
        hotPicks: [],
      };
    }

    const twoWeeksInMs =
      14 * 24 * 60 * 60 * 1000;

    const periodIndex = Math.floor(
      Date.now() / twoWeeksInMs
    );

    const seededShuffle = (
      array,
      seed
    ) => {
      const arr = [...array];

      let m = arr.length;

      const random = (s) => {
        const x =
          Math.sin(s++) * 10000;

        return x - Math.floor(x);
      };

      while (m) {
        const i = Math.floor(
          random(seed + m) * m--
        );

        [arr[m], arr[i]] = [
          arr[i],
          arr[m],
        ];
      }

      return arr;
    };

    const grouped = {};

    novels.forEach((novel) => {
      const genre = normalize(novel.genre);

      if (!grouped[genre]) {
        grouped[genre] = [];
      }

      grouped[genre].push(novel);
    });

    const trending = [];
    const hot = [];

    Object.keys(grouped).forEach(
      (genre) => {
        const shuffled =
          seededShuffle(
            grouped[genre],
            periodIndex
          );

        if (shuffled[0]) {
          trending.push(shuffled[0]);
        }

        if (shuffled[1]) {
          hot.push(shuffled[1]);
        }
      }
    );

    return {
      trendingNovels: trending,
      hotPicks: hot,
    };
  }, [novels]);

  /* =======================================================
     FILTERED NOVELS
  ======================================================= */

  const filteredNovels = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    return novels.filter((novel) => {
      const matchesGenre =
        selectedGenre === "ALL" ||
        normalize(novel.genre) ===
          selectedGenre;

      const title =
        novel.title?.toLowerCase() || "";

      const author =
        novel.author?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        author.includes(query);

      return (
        matchesGenre &&
        matchesSearch
      );
    });
  }, [
    novels,
    selectedGenre,
    searchQuery,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const genreCount = useMemo(() => {
    return new Set(
      novels
        .map((novel) =>
          normalize(novel.genre)
        )
        .filter(Boolean)
    ).size;
  }, [novels]);

  const hasSearch =
    searchQuery.trim().length > 0;

  const isDefaultView =
    selectedGenre === "ALL" &&
    !hasSearch;

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilters = () => {
    setSelectedGenre("ALL");
    setSearchQuery("");
    setMobileSearchOpen(false);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#04070e] text-white selection:bg-blue-500 selection:text-white">

      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#060a13] via-[#080f1b] to-[#03050a]" />

        <div className="absolute -left-60 top-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute right-[-200px] top-[20%] h-[550px] w-[550px] rounded-full bg-indigo-600/10 blur-[150px]" />

        <div className="absolute bottom-[-200px] left-[25%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#04070e]/80 px-4 backdrop-blur-2xl sm:px-6">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4">

          {/* LOGO */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <img
                src={Cog}
                alt="Scholiqen"
                className="relative h-10 w-10 object-contain transition-transform duration-300 group-hover:rotate-6"
              />
            </div>

            <div className="hidden text-left sm:block">
              <h2 className="text-sm font-black tracking-tight text-white">
                Scholiqen
              </h2>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                Novel Library
              </p>
            </div>
          </button>

          {/* DESKTOP SEARCH */}

          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              type="text"
              placeholder="Search stories, authors..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-11 pr-10 text-xs text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/5"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setMobileSearchOpen(
                  (value) => !value
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-blue-400/20 hover:text-white md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.07] hover:text-white sm:flex"
            >
              Dashboard

              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH */}

        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden md:hidden"
            >
              <div className="pb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    autoFocus
                    type="text"
                    placeholder="Search stories or authors..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-10 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery("")
                      }
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-slate-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pt-8">

        {/* HERO */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="relative h-[440px] overflow-hidden rounded-[30px] border border-white/10 shadow-2xl shadow-black/30 sm:h-[480px]"
        >
          <img
            src={novelImg}
            alt="Novel Library"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#04070e] via-transparent to-transparent" />

          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-[110px]" />

          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-7 sm:p-10 md:p-14">

            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300 backdrop-blur-xl">
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
              Immerse yourself in captivating
              stories, handpicked collections,
              and unforgettable worlds across
              multiple genres.
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
                value={`$${GENRE_PRICE}`}
                label="Per Genre"
              />

            </div>
          </div>
        </motion.section>

        {/* GENRES */}

        <section className="mt-7">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {GENRES.map((genre) => {
              const active =
                selectedGenre === genre;

              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() =>
                    setSelectedGenre(
                      genre
                    )
                  }
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    active
                      ? "border-blue-500/40 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border-white/10 bg-white/[0.035] text-slate-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {formatGenre(genre)}
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTENT */}

        <section className="mt-10">

          {/* ONLY SHOW FULL SKELETON WHEN NOTHING HAS ARRIVED */}

          {loading && novels.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({
                length: 12,
              }).map((_, index) => (
                <SkeletonCard
                  key={index}
                />
              ))}
            </div>
          ) : fetchError ? (
            <EmptyState
              title="Unable to load stories"
              description={fetchError}
              onReset={() =>
                window.location.reload()
              }
            />
          ) : isDefaultView ? (
            <div className="space-y-14">

              {/* HOT PICKS */}

              {hotPicks.length > 0 && (
                <section>
                  <SectionHeader
                    icon={Flame}
                    title="Hot Picks"
                    description="Stories getting attention right now."
                    count={
                      hotPicks.length
                    }
                  />

                  <div className="flex gap-5 overflow-x-auto pb-5 scrollbar-none">
                    {hotPicks.map(
                      (novel) => (
                        <ScrollCard
                          key={`hot-${novel.id}`}
                          n={novel}
                          onOpen={openStory}
                          checkingStoryId={
                            checkingStoryId
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              )}

              {/* TRENDING */}

              {trendingNovels.length > 0 && (
                <section>
                  <SectionHeader
                    icon={TrendingUp}
                    title="Trending Now"
                    description="Fresh selections from across the library."
                    count={
                      trendingNovels.length
                    }
                  />

                  <div className="flex gap-5 overflow-x-auto pb-5 scrollbar-none">
                    {trendingNovels.map(
                      (novel) => (
                        <ScrollCard
                          key={`trend-${novel.id}`}
                          n={novel}
                          onOpen={openStory}
                          checkingStoryId={
                            checkingStoryId
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              )}

              {/* COMPLETE CATALOG */}

              <section>
                <SectionHeader
                  icon={Library}
                  title="Complete Catalog"
                  description="Explore the full Scholiqen story collection."
                  count={
                    novels.length
                  }
                />

                {novels.length > 0 ? (
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6"
                  >
                    {novels.map(
                      (novel) => (
                        <GridCard
                          key={`catalog-${novel.id}`}
                          n={novel}
                          onOpen={openStory}
                          checkingStoryId={
                            checkingStoryId
                          }
                        />
                      )
                    )}
                  </motion.div>
                ) : (
                  <EmptyState
                    title="Your library is waiting"
                    description="No novels have been added yet."
                    onReset={
                      resetFilters
                    }
                  />
                )}
              </section>
            </div>
          ) : (
            /* SEARCH / FILTER RESULTS */

            <section>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                      {hasSearch ? (
                        <Search className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Library className="h-4 w-4 text-blue-400" />
                      )}
                    </div>

                    <h2 className="text-xl font-black text-white">
                      {hasSearch
                        ? "Search Results"
                        : formatGenre(
                            selectedGenre
                          )}
                    </h2>
                  </div>

                  {hasSearch && (
                    <p className="mt-2 text-xs text-slate-500">
                      Results for{" "}
                      <span className="font-semibold text-slate-300">
                        "{searchQuery}"
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {
                      filteredNovels.length
                    }{" "}
                    {filteredNovels.length ===
                    1
                      ? "book"
                      : "books"}
                  </span>

                  {(hasSearch ||
                    selectedGenre !==
                      "ALL") && (
                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <X className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {filteredNovels.length >
              0 ? (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6"
                >
                  {filteredNovels.map(
                    (novel) => (
                      <GridCard
                        key={`result-${novel.id}`}
                        n={novel}
                        onOpen={openStory}
                        checkingStoryId={
                          checkingStoryId
                        }
                      />
                    )
                  )}
                </motion.div>
              ) : (
                <EmptyState
                  title="No stories found"
                  description="Try another search term or explore a different genre."
                  onReset={
                    resetFilters
                  }
                />
              )}
            </section>
          )}

          {/* BACKGROUND LOADING INDICATOR */}

          {loadingMore && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs text-slate-500 backdrop-blur-xl">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                Loading more stories...
              </div>
            </div>
          )}

        </section>

        {/* CTA */}

        {!loading &&
          novels.length > 0 && (
            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="relative mt-20 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] px-7 py-12 text-center backdrop-blur-2xl sm:px-12"
            >
              <div className="pointer-events-none absolute left-1/2 top-[-160px] h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

              <div className="relative z-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                  <BookOpen className="h-7 w-7 text-blue-400" />
                </div>

                <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Your Next Story Is Waiting
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                  Unlock a genre for $
                  {GENRE_PRICE} and read
                  every story available
                  in that genre.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior:
                        "smooth",
                    })
                  }
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-xl shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-indigo-500"
                >
                  Explore Library

                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.section>
          )}
      </main>
    </div>
  );
};

/* =========================================================
   STAT
========================================================= */

const Stat = ({
  icon: Icon,
  value,
  label,
}) => (
  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 backdrop-blur-xl">
    <Icon className="h-4 w-4 text-blue-400" />

    <div>
      <p className="text-xs font-black text-white">
        {value}
      </p>

      <p className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  </div>
);

/* =========================================================
   IMAGE
========================================================= */

const NovelCover = ({
  src,
  alt,
  className,
  priority = false,
  onError,
}) => {
  const [imageSrc, setImageSrc] =
    useState(src || novelImg);

  useEffect(() => {
    setImageSrc(src || novelImg);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt || "Novel cover"}
      loading={
        priority ? "eager" : "lazy"
      }
      fetchPriority={
        priority ? "high" : "auto"
      }
      decoding="async"
      onError={() => {
        if (imageSrc !== novelImg) {
          setImageSrc(novelImg);
        }

        onError?.();
      }}
      className={className}
    />
  );
};

/* =========================================================
   SCROLL CARD
========================================================= */

const ScrollCard = ({
  n,
  onOpen,
  checkingStoryId,
}) => {
  const checking =
    checkingStoryId === n.id;

  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      transition={{
        duration: 0.2,
      }}
      onClick={() => {
        if (!checking) {
          onOpen(n);
        }
      }}
      className={`group w-[190px] min-w-[190px] shrink-0 ${
        checking
          ? "cursor-wait"
          : "cursor-pointer"
      }`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">

        <NovelCover
          src={n.cover_url}
          alt={n.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70" />

        <div className="absolute inset-0 bg-blue-500/0 transition-colors duration-300 group-hover:bg-blue-500/10" />

        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/20 bg-blue-950/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-300 backdrop-blur-md">
            <Lock className="h-2.5 w-2.5" />
            {formatGenre(
              n.genre
            )}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-1 text-sm font-bold text-white">
            {n.title}
          </p>

          <p className="mt-1 line-clamp-1 text-[11px] text-slate-300">
            By{" "}
            {n.author ||
              "Unknown Author"}
          </p>
        </div>

        <div className="absolute right-3 top-3 flex h-8 w-8 translate-x-2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          {checking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </div>
      </div>

      <div className="px-1 pt-3">
        <p className="truncate text-[11px] text-slate-500">
          By{" "}
          <span className="font-medium text-slate-300">
            {n.author ||
              "Unknown Author"}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   GRID CARD
========================================================= */

const GridCard = ({
  n,
  onOpen,
  checkingStoryId,
}) => {
  const checking =
    checkingStoryId === n.id;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -5,
      }}
      onClick={() => {
        if (!checking) {
          onOpen(n);
        }
      }}
      className={`group relative ${
        checking
          ? "cursor-wait"
          : "cursor-pointer"
      }`}
    >
      <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.055]">

        <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.03]">

          <NovelCover
            src={n.cover_url}
            alt={n.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-60" />

          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-300 backdrop-blur-md">
              <Lock className="h-2.5 w-2.5" />
              {formatGenre(
                n.genre
              )}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-600/90 py-2.5 text-xs font-bold text-white shadow-xl shadow-blue-900/30 backdrop-blur-md">
              {checking ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Opening Payment...
                </>
              ) : (
                <>
                  Unlock & Read
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-sm font-extrabold text-white transition-colors group-hover:text-blue-300">
            {n.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5">
            <UserRound className="h-3 w-3 text-slate-600" />

            <p className="truncate text-[11px] text-slate-500">
              {n.author ||
                "Unknown Author"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   SKELETON
========================================================= */

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035]">
    <div className="aspect-[3/4] animate-pulse bg-white/[0.06]" />

    <div className="space-y-3 p-4">
      <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-white/10" />

      <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/10" />

      <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-white/10" />
    </div>
  </div>
);

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  count,
}) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>

        <h2 className="text-xl font-black tracking-tight text-white">
          {title}
        </h2>
      </div>

      {description && (
        <p className="mt-2 text-xs text-slate-500">
          {description}
        </p>
      )}
    </div>

    {typeof count ===
      "number" && (
      <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold text-slate-500 sm:block">
        {count}{" "}
        {count === 1
          ? "book"
          : "books"}
      </span>
    )}
  </div>
);

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  title,
  description,
  onReset,
}) => (
  <motion.div
    initial={{
      opacity: 0,
      scale: 0.98,
    }}
    animate={{
      opacity: 1,
      scale: 1,
    }}
    className="rounded-[30px] border border-white/10 bg-white/[0.025] px-6 py-20 text-center"
  >
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
      <BookOpen className="h-7 w-7 text-blue-400" />
    </div>

    <h3 className="mt-6 text-lg font-black text-white">
      {title}
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {description}
    </p>

    <button
      type="button"
      onClick={onReset}
      className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
    >
      Explore All Stories
    </button>
  </motion.div>
);

export default Novels;