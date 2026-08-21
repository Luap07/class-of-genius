import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  Download,
  Sparkles,
  ExternalLink,
  Compass,
  CheckCircle2,
  Clock,
  Flame,
  Layers3,
  X,
  ChevronRight,
  ShieldCheck,
  Database,
  Grid3X3,
  List,
  SlidersHorizontal,
  TrendingUp,
  Zap,
  FolderOpen,
  Crown,
  Star,
  Eye,
  Rocket,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

/* =========================================================
   ANIMATION SYSTEM
========================================================= */

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const cardAnimationVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.96,
  },

  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 25,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CategorySubjects() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const {
    categories = [],
    documents = [],
    loading,
  } = useCourses();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("latest");

  /* =======================================================
     SELECTED CATEGORY
  ======================================================= */

  const selectedCategory = useMemo(() => {
    return categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
  }, [categories, categoryId]);

  /* =======================================================
     CATEGORY DOCUMENTS
  ======================================================= */

  const categoryDocuments = useMemo(() => {
    let list = documents.filter(
      (doc) =>
        String(doc.category_id) === String(categoryId)
    );

    if (activeFilter === "pdf") {
      list = list.filter(
        (doc) =>
          doc.file_type?.toLowerCase() === "pdf"
      );
    }

    if (activeFilter === "other") {
      list = list.filter(
        (doc) =>
          doc.file_type?.toLowerCase() !== "pdf"
      );
    }

    if (search.trim()) {
      const keyword = search.toLowerCase().trim();

      list = list.filter((item) => {
        return (
          item.title
            ?.toLowerCase()
            .includes(keyword) ||
          item.description
            ?.toLowerCase()
            .includes(keyword) ||
          item.file_type
            ?.toLowerCase()
            .includes(keyword)
        );
      });
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "latest") {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      if (sortBy === "name") {
        return (a.title || "").localeCompare(
          b.title || ""
        );
      }

      return 0;
    });

    return list;
  }, [
    documents,
    categoryId,
    search,
    activeFilter,
    sortBy,
  ]);

  /* =======================================================
     CATEGORY STATS
  ======================================================= */

  const stats = useMemo(() => {
    const categoryDocs = documents.filter(
      (doc) =>
        String(doc.category_id) === String(categoryId)
    );

    const pdfs = categoryDocs.filter(
      (doc) =>
        doc.file_type?.toLowerCase() === "pdf"
    );

    const totalSize = categoryDocs.reduce(
      (total, doc) =>
        total + Number(doc.file_size || 0),
      0
    );

    return {
      total: categoryDocs.length,
      pdfs: pdfs.length,
      others: categoryDocs.length - pdfs.length,
      size: totalSize,
    };
  }, [documents, categoryId]);

  /* =======================================================
     FORMAT SIZE
  ======================================================= */

  const formatTotalSize = (bytes) => {
    if (!bytes) return "0 MB";

    const mb = bytes / (1024 * 1024);

    if (mb < 1) {
      return `${Math.max(
        1,
        Math.round(bytes / 1024)
      )} KB`;
    }

    return `${mb.toFixed(1)} MB`;
  };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const clearSearch = () => {
    setSearch("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#080d1d]
        font-sans
        antialiased
        text-slate-100
        selection:bg-cyan-400
        selection:text-slate-950
      "
    >
      {/* =====================================================
          ANIME PREMIUM BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          overflow-hidden
        "
      >
        {/* Main atmospheric gradient */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_20%_0%,#172b59_0%,transparent_38%),radial-gradient(circle_at_85%_15%,#321b61_0%,transparent_36%),radial-gradient(circle_at_50%_100%,#102e55_0%,transparent_42%)]
          "
        />

        {/* Blue anime aura */}

        <motion.div
          animate={{
            x: [0, 80, 20, 0],
            y: [0, 40, 90, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -left-[18%]
            -top-[18%]
            h-[800px]
            w-[800px]
            rounded-full
            bg-cyan-400/[0.10]
            blur-[150px]
          "
        />

        {/* Purple anime aura */}

        <motion.div
          animate={{
            x: [0, -70, 20, 0],
            y: [0, 70, -20, 0],
            scale: [1, 0.92, 1.12, 1],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -right-[20%]
            top-[5%]
            h-[850px]
            w-[850px]
            rounded-full
            bg-violet-500/[0.09]
            blur-[170px]
          "
        />

        {/* Bottom blue aura */}

        <motion.div
          animate={{
            x: [0, 100, -30, 0],
            scale: [1, 1.1, 0.94, 1],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -bottom-[30%]
            left-[20%]
            h-[750px]
            w-[750px]
            rounded-full
            bg-blue-500/[0.09]
            blur-[160px]
          "
        />

        {/* Anime energy beam */}

        <motion.div
          animate={{
            x: ["-120%", "130%"],
            opacity: [0, 0.35, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
          className="
            absolute
            left-0
            top-[18%]
            h-[1px]
            w-[45%]
            rotate-[-18deg]
            bg-gradient-to-r
            from-transparent
            via-cyan-300
            to-transparent
            blur-[1px]
          "
        />

        <motion.div
          animate={{
            x: ["120%", "-130%"],
            opacity: [0, 0.25, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear",
            delay: 4,
          }}
          className="
            absolute
            right-0
            top-[48%]
            h-[1px]
            w-[40%]
            rotate-[20deg]
            bg-gradient-to-r
            from-transparent
            via-violet-300
            to-transparent
          "
        />

        {/* Grid */}

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(to_right,rgba(56,189,248,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.07)_1px,transparent_1px)]
            [background-size:4rem_4rem]
            opacity-70
            [mask-image:radial-gradient(ellipse_85%_70%_at_50%_10%,#000_45%,transparent_100%)]
          "
        />

        {/* Stars / particles */}

        <AnimeParticles />

        {/* Soft vignette */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.35)_100%)]
          "
        />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/[0.08]
          bg-[#0a1022]/75
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-6
            py-4
            md:px-12
          "
        >
          <button
            onClick={() => navigate("/subjects")}
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.08]
              bg-[#111a34]/70
              px-4
              py-2.5
              text-xs
              font-black
              text-slate-300
              shadow-lg
              shadow-black/10
              backdrop-blur-xl
              transition-all
              hover:-translate-y-0.5
              hover:border-cyan-400/40
              hover:bg-cyan-400/10
              hover:text-cyan-300
            "
          >
            <ArrowLeft
              size={15}
              className="
                transition-transform
                group-hover:-translate-x-1
              "
            />

            Categories
          </button>

          <div
            className="
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/[0.08]
              px-4
              py-2
              text-xs
              font-black
              text-cyan-300
              shadow-lg
              shadow-cyan-500/10
              sm:flex
            "
          >
            <ShieldCheck size={14} />

            Secure Learning Workspace
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          py-10
          md:px-12
          md:py-14
        "
      >
        {/* ===================================================
            HERO
        =================================================== */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[38px]
              border
              border-cyan-400/20
              bg-gradient-to-br
              from-[#142b52]/90
              via-[#101a35]/90
              to-[#1b1539]/90
              p-7
              shadow-2xl
              shadow-blue-950/40
              backdrop-blur-3xl
              md:p-10
            "
          >
            {/* Anime glow */}

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute
                -right-32
                -top-32
                h-96
                w-96
                rounded-full
                bg-cyan-400/10
                blur-[100px]
              "
            />

            <motion.div
              animate={{
                scale: [1, 0.9, 1],
                x: [0, -20, 0],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute
                -bottom-40
                left-1/3
                h-96
                w-96
                rounded-full
                bg-violet-500/10
                blur-[110px]
              "
            />

            {/* Decorative rings */}

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                pointer-events-none
                absolute
                -right-24
                top-10
                h-72
                w-72
                rounded-full
                border
                border-cyan-300/[0.08]
              "
            />

            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                pointer-events-none
                absolute
                -right-10
                top-24
                h-56
                w-56
                rounded-full
                border
                border-violet-300/[0.07]
              "
            />

            <div className="relative z-10">
              {/* Badge */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-cyan-300/20
                  bg-cyan-300/[0.08]
                  px-4
                  py-2
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-cyan-300
                  shadow-lg
                  shadow-cyan-500/10
                "
              >
                <Sparkles size={13} />

                Premium Learning Hub
              </motion.div>

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  gap-10
                  lg:flex-row
                  lg:items-end
                  lg:justify-between
                "
              >
                <div className="max-w-3xl">
                  <div className="flex items-center gap-4">
                    {/* Animated icon */}

                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        rotate: [0, 1, -1, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                        relative
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-cyan-300
                        via-blue-500
                        to-violet-600
                        shadow-xl
                        shadow-cyan-500/25
                      "
                    >
                      <div
                        className="
                          absolute
                          inset-0
                          rounded-2xl
                          bg-cyan-300/20
                          blur-xl
                        "
                      />

                      <BookOpen
                        size={30}
                        className="relative text-white"
                      />
                    </motion.div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.2em]
                          text-cyan-300/60
                        "
                      >
                        Learning Collection
                      </p>

                      <h1
                        className="
                          mt-1
                          text-4xl
                          font-black
                          tracking-tight
                          text-white
                          drop-shadow-lg
                          md:text-5xl
                        "
                      >
                        {selectedCategory?.name ||
                          "Category Hub"}
                      </h1>
                    </div>
                  </div>

                  <p
                    className="
                      mt-6
                      max-w-2xl
                      text-sm
                      leading-7
                      text-slate-300/80
                      md:text-base
                    "
                  >
                    Explore carefully organized learning
                    resources, study documents and premium
                    educational materials built to help you
                    learn faster and retain more.
                  </p>
                </div>

                {/* Status */}

                <motion.div
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-emerald-400/20
                    bg-emerald-400/[0.07]
                    px-5
                    py-4
                    shadow-xl
                    shadow-emerald-950/20
                  "
                >
                  <div
                    className="
                      relative
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-400/10
                    "
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.4, 0.1, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="
                        absolute
                        inset-0
                        rounded-xl
                        bg-emerald-400
                      "
                    />

                    <CheckCircle2
                      size={20}
                      className="relative text-emerald-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Workspace Status
                    </p>

                    <p className="mt-0.5 text-sm font-black text-emerald-400">
                      Verified Access
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Stats */}

              <div
                className="
                  mt-10
                  grid
                  gap-3
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >
                <PremiumStat
                  icon={<Database size={17} />}
                  label="Total Resources"
                  value={stats.total}
                />

                <PremiumStat
                  icon={<FileText size={17} />}
                  label="PDF Documents"
                  value={stats.pdfs}
                  accent
                />

                <PremiumStat
                  icon={<Layers3 size={17} />}
                  label="Other Assets"
                  value={stats.others}
                />

                <PremiumStat
                  icon={<TrendingUp size={17} />}
                  label="Archive Size"
                  value={formatTotalSize(stats.size)}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{
            delay: 0.1,
          }}
          className="mt-8"
        >
          <div
            className="
              rounded-[28px]
              border
              border-white/[0.08]
              bg-[#111a34]/75
              p-3
              shadow-2xl
              shadow-blue-950/20
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                lg:flex-row
                lg:items-center
              "
            >
              {/* Search */}

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-cyan-400/50
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search resources, topics, concepts..."
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-[#080f25]/80
                    py-3.5
                    pl-11
                    pr-11
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-slate-500
                    focus:border-cyan-400/50
                    focus:ring-4
                    focus:ring-cyan-400/10
                  "
                />

                {search && (
                  <button
                    onClick={clearSearch}
                    className="
                      absolute
                      right-3
                      top-1/2
                      flex
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      p-1.5
                      text-slate-500
                      transition
                      hover:bg-white/10
                      hover:text-white
                    "
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Filters */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <FilterButton
                  active={activeFilter === "all"}
                  onClick={() =>
                    setActiveFilter("all")
                  }
                >
                  All
                </FilterButton>

                <FilterButton
                  active={activeFilter === "pdf"}
                  onClick={() =>
                    setActiveFilter("pdf")
                  }
                >
                  PDF
                </FilterButton>

                <FilterButton
                  active={activeFilter === "other"}
                  onClick={() =>
                    setActiveFilter("other")
                  }
                >
                  Others
                </FilterButton>
              </div>

              {/* Sort */}

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-[#080f25]/80
                    px-4
                    py-3
                    pr-9
                    text-xs
                    font-bold
                    text-slate-300
                    outline-none
                    transition
                    focus:border-cyan-400/40
                  "
                >
                  <option value="latest">
                    Latest
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>

                  <option value="name">
                    Name
                  </option>
                </select>
              </div>

              {/* View */}

              <div
                className="
                  flex
                  items-center
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-[#080f25]/70
                  p-1
                "
              >
                <button
                  onClick={() =>
                    setViewMode("grid")
                  }
                  className={`
                    rounded-lg
                    p-2
                    transition
                    ${
                      viewMode === "grid"
                        ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                        : "text-slate-500 hover:text-white"
                    }
                  `}
                >
                  <Grid3X3 size={15} />
                </button>

                <button
                  onClick={() =>
                    setViewMode("list")
                  }
                  className={`
                    rounded-lg
                    p-2
                    transition
                    ${
                      viewMode === "list"
                        ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                        : "text-slate-500 hover:text-white"
                    }
                  `}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              px-1
            "
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={14}
                className="text-cyan-400"
              />

              <span className="text-xs font-semibold text-slate-400">
                Showing
              </span>

              <span className="text-xs font-black text-white">
                {categoryDocuments.length}
              </span>

              <span className="text-xs text-slate-500">
                resources
              </span>
            </div>

            {search && (
              <span className="text-xs text-slate-400">
                Search results for{" "}
                <span className="font-bold text-cyan-400">
                  "{search}"
                </span>
              </span>
            )}
          </div>
        </motion.section>

        {/* ===================================================
            DOCUMENTS
        =================================================== */}

        <section className="mt-8">
          {loading ? (
            <PremiumLoader />
          ) : categoryDocuments.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {categoryDocuments.map(
                (doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    navigate={navigate}
                    index={index}
                    viewMode={viewMode}
                  />
                )
              )}
            </motion.div>
          ) : (
            <EmptyState
              searchQuery={search}
              clearSearch={clearSearch}
            />
          )}
        </section>

        {/* ===================================================
            PREMIUM CTA
        =================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 35,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.65,
          }}
          className="
            relative
            mt-24
            overflow-hidden
            rounded-[38px]
            border
            border-cyan-400/20
            bg-gradient-to-br
            from-[#16345a]/90
            via-[#111b38]/90
            to-[#241747]/90
            p-8
            shadow-2xl
            shadow-blue-950/40
            backdrop-blur-3xl
            md:p-12
          "
        >
          {/* Animated CTA glow */}

          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-80
              w-80
              rounded-full
              bg-cyan-400/10
              blur-[100px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              left-20
              h-72
              w-72
              rounded-full
              bg-violet-500/10
              blur-[100px]
            "
          />

          <div
            className="
              relative
              z-10
              flex
              flex-col
              gap-8
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div className="max-w-2xl">
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-cyan-400/20
                  bg-cyan-400/10
                  px-4
                  py-2
                  text-[11px]
                  font-black
                  uppercase
                  tracking-widest
                  text-cyan-300
                "
              >
                <Flame size={14} />

                Keep Learning
              </div>

              <h2
                className="
                  mt-5
                  text-3xl
                  font-black
                  tracking-tight
                  text-white
                  md:text-4xl
                "
              >
                Build Your Knowledge Library
              </h2>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  leading-7
                  text-slate-300/70
                  md:text-base
                "
              >
                Continue exploring Scholiqen's
                structured learning ecosystem and
                discover more resources across your
                subjects.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/subjects")
              }
              className="
                group
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-cyan-300
                to-blue-400
                px-7
                py-4
                text-sm
                font-black
                text-slate-950
                shadow-xl
                shadow-cyan-500/20
                transition-all
                hover:-translate-y-1
                hover:from-cyan-200
                hover:to-blue-300
                hover:shadow-cyan-500/30
                active:scale-95
              "
            >
              <Compass size={18} />

              Explore Categories

              <ChevronRight
                size={17}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

/* =========================================================
   ANIME PARTICLES
========================================================= */

function AnimeParticles() {
  const particles = Array.from(
    { length: 32 },
    (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      top: `${(index * 61) % 100}%`,
      size: 2 + (index % 3),
      delay: (index % 8) * 0.7,
      duration: 4 + (index % 6),
    })
  );

  return (
    <>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="
            absolute
            rounded-full
            bg-cyan-200
            shadow-[0_0_12px_rgba(103,232,249,0.8)]
          "
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -35, -70],
            x: [0, 8, -5],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* =========================================================
   PREMIUM STAT
========================================================= */

function PremiumStat({
  icon,
  label,
  value,
  accent = false,
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.015,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.08]
        bg-[#0b142b]/75
        p-4
        shadow-lg
        shadow-black/10
        backdrop-blur-xl
        transition
        hover:border-cyan-400/20
      "
    >
      <div
        className="
          absolute
          -right-8
          -top-8
          h-20
          w-20
          rounded-full
          bg-cyan-400/[0.05]
          blur-2xl
          transition
          group-hover:bg-cyan-400/10
        "
      />

      <div className="relative">
        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            ${
              accent
                ? "bg-cyan-400/10 text-cyan-300"
                : "bg-white/[0.05] text-slate-400"
            }
          `}
        >
          {icon}
        </div>

        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p
          className={`
            mt-1
            text-2xl
            font-black
            ${
              accent
                ? "text-cyan-300"
                : "text-white"
            }
          `}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  children,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-xl
        px-4
        py-2.5
        text-xs
        font-black
        transition-all
        ${
          active
            ? "bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-950 shadow-lg shadow-cyan-400/20"
            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   DOCUMENT CARD
========================================================= */

function DocumentCard({
  doc,
  navigate,
  index,
  viewMode,
}) {
  const handleDownload = (e) => {
    e.stopPropagation();

    if (!doc.file_url) return;

    const link =
      document.createElement("a");

    link.href = doc.file_url;
    link.download =
      doc.title || "document";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const openPDFReader = () => {
    if (!doc?.id) return;

    navigate(`/pdf/${doc.id}`);
  };

  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return null;

    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    }

    if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(
        sizeInBytes / 1024
      )} KB`;
    }

    if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(
        sizeInBytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    }

    return `${(
      sizeInBytes /
      (1024 * 1024 * 1024)
    ).toFixed(1)} GB`;
  };

  /* =======================================================
     LIST VIEW
  ======================================================= */

  if (viewMode === "list") {
    return (
      <motion.div
        variants={cardAnimationVariants}
        whileHover={{
          y: -4,
        }}
        className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/[0.08]
          bg-[#101a34]/80
          p-4
          shadow-xl
          shadow-blue-950/20
          backdrop-blur-2xl
          transition-all
          hover:border-cyan-400/30
          hover:bg-[#13203e]/90
        "
      >
        {/* Hover aura */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-48
            w-48
            rounded-full
            bg-cyan-400/[0.06]
            blur-[70px]
            transition
            group-hover:bg-cyan-400/[0.12]
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-center
          "
        >
          <DocumentThumbnail
            doc={doc}
            compact
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  rounded-full
                  border
                  border-cyan-400/20
                  bg-cyan-400/10
                  px-2.5
                  py-1
                  text-[10px]
                  font-black
                  text-cyan-300
                "
              >
                {doc.file_type?.toUpperCase() ||
                  "FILE"}
              </span>

              {doc.created_at && (
                <span className="text-[11px] text-slate-500">
                  {new Date(
                    doc.created_at
                  ).toLocaleDateString()}
                </span>
              )}
            </div>

            <h3
              className="
                mt-2
                truncate
                text-lg
                font-black
                text-white
                transition
                group-hover:text-cyan-300
              "
            >
              {doc.title}
            </h3>

            <p
              className="
                mt-1
                line-clamp-1
                text-sm
                text-slate-400
              "
            >
              {doc.description ||
                "No description provided for this resource."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openPDFReader}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-cyan-300
                to-blue-400
                px-5
                py-3
                text-xs
                font-black
                text-slate-950
                shadow-lg
                shadow-cyan-400/10
                transition
                hover:-translate-y-0.5
                hover:shadow-cyan-400/20
                active:scale-95
              "
            >
              <BookOpen size={15} />

              Read
            </button>

            {doc.file_url && (
              <button
                onClick={handleDownload}
                className="
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-[#0b142b]
                  p-3
                  text-slate-400
                  transition
                  hover:border-cyan-400/40
                  hover:bg-cyan-400/10
                  hover:text-cyan-300
                "
              >
                <Download size={17} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* =======================================================
     GRID VIEW
  ======================================================= */

  return (
    <motion.article
      variants={cardAnimationVariants}
      whileHover={{
        y: -9,
        transition: {
          duration: 0.2,
        },
      }}
      className="
        group
        relative
        flex
        min-h-[485px]
        flex-col
        overflow-hidden
        rounded-[30px]
        border
        border-white/[0.08]
        bg-gradient-to-b
        from-[#12203d]/90
        to-[#0d1730]/90
        p-4
        shadow-2xl
        shadow-blue-950/20
        backdrop-blur-2xl
        transition-all
        hover:border-cyan-400/30
        hover:shadow-cyan-950/30
      "
    >
      {/* ===================================================
          CARD ANIME AURA
      =================================================== */}

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 5 + (index % 3),
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-56
          w-56
          rounded-full
          bg-cyan-400/[0.07]
          blur-[80px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          -left-24
          h-48
          w-48
          rounded-full
          bg-violet-500/[0.06]
          blur-[70px]
        "
      />

      {/* Decorative line */}

      <div
        className="
          pointer-events-none
          absolute
          left-6
          right-6
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-cyan-400/40
          to-transparent
          opacity-0
          transition
          group-hover:opacity-100
        "
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Thumbnail */}

        <DocumentThumbnail doc={doc} />

        {/* Meta */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            gap-3
            text-[11px]
            font-semibold
            text-slate-500
          "
        >
          <span className="flex items-center gap-1.5">
            <Clock size={13} />

            {doc.created_at
              ? new Date(
                  doc.created_at
                ).toLocaleDateString()
              : "Learning Asset"}
          </span>

          {doc.file_size && (
            <span
              className="
                rounded-lg
                border
                border-white/[0.07]
                bg-[#080f25]/80
                px-2
                py-1
                text-slate-400
              "
            >
              {formatFileSize(doc.file_size)}
            </span>
          )}
        </div>

        {/* Title */}

        <h3
          className="
            mt-3
            line-clamp-2
            text-xl
            font-black
            tracking-tight
            text-white
            transition
            group-hover:text-cyan-300
          "
        >
          {doc.title}
        </h3>

        {/* Description */}

        <p
          className="
            mt-2
            line-clamp-3
            flex-grow
            text-sm
            leading-6
            text-slate-400
          "
        >
          {doc.description ||
            "No description provided for this learning resource."}
        </p>

        {/* Divider */}

        <div
          className="
            my-5
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/[0.08]
            to-transparent
          "
        />

        {/* Actions */}

        <div className="flex gap-2">
          <button
            onClick={openPDFReader}
            className="
              group/read
              flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-cyan-300
              via-blue-400
              to-indigo-400
              px-4
              py-3
              text-xs
              font-black
              text-slate-950
              shadow-lg
              shadow-cyan-400/10
              transition-all
              hover:-translate-y-0.5
              hover:shadow-cyan-400/20
              active:scale-95
            "
          >
            <BookOpen size={15} />

            Read Resource

            <ExternalLink
              size={14}
              className="
                transition-transform
                group-hover/read:translate-x-0.5
              "
            />
          </button>

          {doc.file_url && (
            <button
              onClick={handleDownload}
              title="Download resource"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.08]
                bg-[#080f25]/80
                p-3
                text-slate-400
                transition-all
                hover:-translate-y-0.5
                hover:border-cyan-400/40
                hover:bg-cyan-400/10
                hover:text-cyan-300
                active:scale-95
              "
            >
              <Download size={17} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   DOCUMENT THUMBNAIL
========================================================= */

function DocumentThumbnail({
  doc,
  compact = false,
}) {
  return (
    <div
      className={`
        group/thumb
        relative
        flex
        ${
          compact
            ? "h-24 w-32 shrink-0"
            : "h-48 w-full"
        }
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.08]
        bg-gradient-to-br
        from-[#14284b]
        via-[#0d1834]
        to-[#211840]
      `}
    >
      {/* Thumbnail glow */}

      <div
        className="
          pointer-events-none
          absolute
          -left-10
          -top-10
          h-32
          w-32
          rounded-full
          bg-cyan-400/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-10
          -right-10
          h-32
          w-32
          rounded-full
          bg-violet-500/10
          blur-3xl
        "
      />

      {doc.thumbnail_url ||
      doc.thumbnail ? (
        <img
          src={
            doc.thumbnail_url ||
            doc.thumbnail
          }
          alt={doc.title || "Document"}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover/thumb:scale-110
          "
        />
      ) : (
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            relative
            flex
            flex-col
            items-center
            justify-center
            gap-3
          "
        >
          <div
            className="
              absolute
              h-24
              w-24
              rounded-full
              bg-cyan-400/10
              blur-2xl
            "
          />

          <div
            className="
              relative
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-300/10
              bg-gradient-to-br
              from-cyan-400/15
              to-violet-500/15
              text-cyan-300
              shadow-xl
              shadow-cyan-500/10
            "
          >
            <FileText size={27} />
          </div>

          {!compact && (
            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-slate-400
              "
            >
              {doc.file_type ||
                "Document"}
            </span>
          )}
        </motion.div>
      )}

      {/* Image overlay */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-[#071024]/90
          via-transparent
          to-[#071024]/10
        "
      />

      {/* File badge */}

      <div
        className="
          absolute
          left-3
          top-3
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-white/10
          bg-[#071024]/80
          px-2.5
          py-1
          text-[10px]
          font-black
          text-cyan-300
          shadow-lg
          backdrop-blur-xl
        "
      >
        <Zap size={10} />

        {doc.file_type?.toUpperCase() ||
          "FILE"}
      </div>

      {/* Premium badge */}

      {!compact && (
        <div
          className="
            absolute
            bottom-3
            right-3
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-violet-300/20
            bg-[#071024]/80
            px-2.5
            py-1
            text-[10px]
            font-black
            text-violet-200
            shadow-lg
            backdrop-blur-xl
          "
        >
          <Crown size={10} />

          Premium
        </div>
      )}

      {/* Anime shine */}

      <motion.div
        animate={{
          x: ["-130%", "130%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          top-0
          h-full
          w-20
          rotate-[18deg]
          bg-gradient-to-r
          from-transparent
          via-white/[0.10]
          to-transparent
          blur-md
        "
      />
    </div>
  );
}

/* =========================================================
   LOADER
========================================================= */

function PremiumLoader() {
  return (
    <div
      className="
        flex
        min-h-[400px]
        items-center
        justify-center
      "
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="
              absolute
              inset-0
              rounded-full
              bg-cyan-400/30
              blur-xl
            "
          />

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              relative
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-400/30
              bg-[#10203f]
              shadow-xl
              shadow-cyan-500/20
            "
          >
            <BookOpen
              size={25}
              className="text-cyan-300"
            />
          </motion.div>
        </div>

        <p className="mt-5 text-sm font-bold text-slate-300">
          Preparing your learning workspace...
        </p>

        <div
          className="
            mt-3
            h-1
            w-32
            overflow-hidden
            rounded-full
            bg-slate-700/60
          "
        >
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              h-full
              w-1/2
              rounded-full
              bg-gradient-to-r
              from-cyan-300
              to-violet-400
            "
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  searchQuery,
  clearSearch,
}) {
  return (
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
        min-h-[420px]
        flex-col
        items-center
        justify-center
        rounded-[36px]
        border
        border-dashed
        border-white/[0.10]
        bg-[#101a34]/60
        p-10
        text-center
        shadow-xl
        shadow-blue-950/20
        backdrop-blur-2xl
      "
    >
      <motion.div
        animate={{
          y: [0, -7, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          border
          border-cyan-400/10
          bg-gradient-to-br
          from-[#162b4d]
          to-[#211941]
          text-cyan-300/50
          shadow-xl
        "
      >
        {searchQuery ? (
          <Search size={32} />
        ) : (
          <FolderOpen size={32} />
        )}
      </motion.div>

      <h2
        className="
          mt-6
          text-2xl
          font-black
          text-white
        "
      >
        {searchQuery
          ? "No Matching Resources"
          : "No Learning Materials Yet"}
      </h2>

      <p
        className="
          mt-3
          max-w-md
          text-sm
          leading-7
          text-slate-400
        "
      >
        {searchQuery
          ? `Nothing matched "${searchQuery}". Try another keyword or clear your search.`
          : "This category does not have any resources available yet. New learning materials will appear here when they are added."}
      </p>

      {searchQuery && (
        <button
          onClick={clearSearch}
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-cyan-300
            to-blue-400
            px-5
            py-3
            text-xs
            font-black
            text-slate-950
            shadow-lg
            shadow-cyan-400/10
            transition
            hover:-translate-y-0.5
          "
        >
          <X size={15} />

          Clear Search
        </button>
      )}
    </motion.div>
  );
}