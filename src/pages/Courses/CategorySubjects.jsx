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
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

/* ============================================
   ADVANCED SPRING ANIMATION VARIANTS
============================================ */

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  show: {
    opacity: 1,

    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardAnimationVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
  },

  show: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      type: "spring",
      stiffness: 320,
      damping: 24,
    },
  },
};

/* ============================================
   MAIN COMPONENT
============================================ */

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

  /* ============================================
     SELECTED CATEGORY
  ============================================ */

  const selectedCategory = useMemo(() => {
    return categories.find(
      (cat) =>
        String(cat.id) === String(categoryId)
    );
  }, [
    categories,
    categoryId,
  ]);

  /* ============================================
     CATEGORY DOCUMENTS
  ============================================ */

  const categoryDocuments = useMemo(() => {
    let list = documents.filter(
      (doc) =>
        String(doc.category_id) ===
        String(categoryId)
    );

    /* PDF FILTER */

    if (activeFilter === "pdf") {
      list = list.filter(
        (doc) =>
          doc.file_type?.toLowerCase() === "pdf"
      );
    }

    /* OTHER FILES */

    else if (activeFilter === "other") {
      list = list.filter(
        (doc) =>
          doc.file_type?.toLowerCase() !== "pdf"
      );
    }

    /* SEARCH */

    if (!search.trim()) {
      return list;
    }

    const keyword =
      search.toLowerCase().trim();

    return list.filter(
      (item) =>
        item.title
          ?.toLowerCase()
          .includes(keyword) ||

        item.description
          ?.toLowerCase()
          .includes(keyword)
    );
  }, [
    documents,
    categoryId,
    search,
    activeFilter,
  ]);

  /* ============================================
     TOTAL FILES
  ============================================ */

  const totalFiles = useMemo(() => {
    return documents.filter(
      (doc) =>
        String(doc.category_id) ===
        String(categoryId)
    ).length;
  }, [
    documents,
    categoryId,
  ]);

  /* ============================================
     PDF COUNT
  ============================================ */

  const pdfCount = useMemo(() => {
    return documents.filter(
      (doc) =>
        String(doc.category_id) ===
          String(categoryId) &&
        doc.file_type?.toLowerCase() === "pdf"
    ).length;
  }, [
    documents,
    categoryId,
  ]);

  /* ============================================
     RENDER
  ============================================ */

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#02040a]
        font-sans
        antialiased
        text-slate-100
        selection:bg-cyan-500
        selection:text-slate-950
      "
    >

      {/* ============================================
          IMMERSIVE BACKGROUND
      ============================================ */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
        "
      >

        {/* BASE */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
            from-slate-900
            via-[#02040a]
            to-[#010205]
          "
        />

        {/* GLOW 1 */}

        <div
          className="
            absolute
            -left-[10%]
            -top-[20%]
            h-[700px]
            w-[700px]
            animate-pulse
            rounded-full
            bg-cyan-600/10
            blur-[160px]
          "
        />

        {/* GLOW 2 */}

        <div
          className="
            absolute
            -right-[15%]
            top-[30%]
            h-[800px]
            w-[800px]
            rounded-full
            bg-blue-600/10
            blur-[180px]
          "
        />

        {/* GLOW 3 */}

        <div
          className="
            absolute
            -bottom-[10%]
            left-[20%]
            h-[600px]
            w-[600px]
            rounded-full
            bg-indigo-600/10
            blur-[150px]
          "
        />

        {/* GRID */}

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(to_right,#38bdf80d_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80d_1px,transparent_1px)]
            [background-size:4rem_4rem]
            opacity-60
            [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]
          "
        />

        {/* DOTS */}

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(#fff_1px,transparent_1px)]
            opacity-[0.015]
            [background-size:16px_16px]
          "
        />

      </div>

      {/* ============================================
          MAIN
      ============================================ */}

      <main
        className="
          mx-auto
          max-w-7xl
          px-6
          py-12
          md:px-12
          md:py-16
        "
      >

        {/* ============================================
            HEADER
        ============================================ */}

        <motion.section
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-12"
        >

          {/* BACK */}

          <button
            onClick={() =>
              navigate("/subjects")
            }
            className="
              group
              inline-flex
              items-center
              gap-2.5
              rounded-full
              border
              border-slate-800/80
              bg-slate-900/40
              px-4
              py-2
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
              shadow-sm
              backdrop-blur-2xl
              transition
              hover:border-cyan-500/50
              hover:bg-slate-800/60
              hover:text-cyan-400
            "
          >
            <ArrowLeft
              size={14}
              className="
                transition-transform
                group-hover:-translate-x-1
              "
            />

            Back to Categories
          </button>

          {/* CATEGORY HEADER */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            {/* CATEGORY */}

            <div className="flex items-start gap-5">

              <div
                className="
                  relative
                  flex
                  h-20
                  w-20
                  shrink-0
                  items-center
                  justify-center
                  rounded-3xl
                  bg-gradient-to-br
                  from-cyan-500
                  via-blue-600
                  to-indigo-600
                  shadow-2xl
                  shadow-cyan-500/25
                  ring-1
                  ring-white/20
                "
              >

                <BookOpen
                  size={36}
                  className="
                    text-white
                    drop-shadow-md
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-1
                    -right-1
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-950
                    text-xs
                    font-bold
                    text-cyan-400
                    shadow-lg
                  "
                >
                  {totalFiles}
                </div>

              </div>

              <div>

                <div className="flex items-center gap-3">

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-cyan-500/20
                      bg-cyan-500/10
                      px-3
                      py-1
                      text-xs
                      font-bold
                      text-cyan-400
                      backdrop-blur-md
                    "
                  >
                    <Sparkles size={12} />

                    Active Workspace
                  </span>

                </div>

                <h1
                  className="
                    mt-2
                    text-4xl
                    font-black
                    tracking-tight
                    text-white
                    drop-shadow-sm
                    md:text-5xl
                  "
                >
                  {selectedCategory?.name ||
                    "Category Hub"}
                </h1>

                <p
                  className="
                    mt-2
                    max-w-xl
                    text-base
                    text-slate-400
                  "
                >
                  Curated learning modules,
                  professional blueprints, and
                  technical notes engineered for
                  maximum retention.
                </p>

              </div>

            </div>

            {/* STATS */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
              "
            >

              <div
                className="
                  flex
                  flex-col
                  justify-center
                  rounded-2xl
                  border
                  border-slate-800/60
                  bg-slate-900/40
                  p-4
                  shadow-lg
                  backdrop-blur-2xl
                "
              >
                <span className="text-xs font-medium text-slate-500">
                  Total Assets
                </span>

                <span className="mt-1 text-2xl font-black text-white">
                  {totalFiles}
                </span>
              </div>

              <div
                className="
                  flex
                  flex-col
                  justify-center
                  rounded-2xl
                  border
                  border-slate-800/60
                  bg-slate-900/40
                  p-4
                  shadow-lg
                  backdrop-blur-2xl
                "
              >
                <span className="text-xs font-medium text-slate-500">
                  PDF Files
                </span>

                <span className="mt-1 text-2xl font-black text-cyan-400">
                  {pdfCount}
                </span>
              </div>

              <div
                className="
                  col-span-2
                  flex
                  flex-col
                  justify-center
                  rounded-2xl
                  border
                  border-slate-800/60
                  bg-slate-900/40
                  p-4
                  shadow-lg
                  backdrop-blur-2xl
                  sm:col-span-1
                "
              >
                <span className="text-xs font-medium text-slate-500">
                  Access Status
                </span>

                <span
                  className="
                    mt-1
                    flex
                    items-center
                    gap-1.5
                    text-sm
                    font-bold
                    text-emerald-400
                  "
                >
                  <CheckCircle2 size={16} />

                  Verified
                </span>
              </div>

            </div>

          </div>

          {/* SEARCH + FILTER */}

          <div
            className="
              mt-10
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            {/* SEARCH */}

            <div
              className="
                relative
                max-w-2xl
                flex-1
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  left-0
                  flex
                  items-center
                  pl-5
                  text-slate-500
                "
              >
                <Search size={18} />
              </div>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="
                  Search resources by title,
                  concept, or keywords...
                "
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-800/80
                  bg-slate-900/50
                  py-4
                  pl-12
                  pr-6
                  text-sm
                  text-white
                  placeholder:text-slate-500
                  shadow-inner
                  backdrop-blur-2xl
                  transition
                  focus:border-cyan-500/50
                  focus:bg-slate-900/80
                  focus:outline-none
                  focus:ring-4
                  focus:ring-cyan-500/10
                "
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    absolute
                    inset-y-0
                    right-0
                    flex
                    items-center
                    pr-4
                    text-xs
                    font-bold
                    text-slate-500
                    hover:text-white
                  "
                >
                  Clear
                </button>
              )}

            </div>

            {/* FILTER */}

            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-900/50
                p-1.5
                shadow-lg
                backdrop-blur-2xl
              "
            >

              <button
                onClick={() =>
                  setActiveFilter("all")
                }
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeFilter === "all"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                All Assets
              </button>

              <button
                onClick={() =>
                  setActiveFilter("pdf")
                }
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeFilter === "pdf"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                PDF Docs
              </button>

              <button
                onClick={() =>
                  setActiveFilter("other")
                }
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeFilter === "other"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                Others
              </button>

            </div>

          </div>

        </motion.section>

        {/* ============================================
            DOCUMENT GRID
        ============================================ */}

        {loading ? (
          <div
            className="
              flex
              h-72
              items-center
              justify-center
            "
          >
            <div className="relative flex items-center justify-center">

              <div
                className="
                  absolute
                  h-16
                  w-16
                  animate-ping
                  rounded-full
                  bg-cyan-500/20
                "
              />

              <div
                className="
                  h-12
                  w-12
                  animate-spin
                  rounded-full
                  border-4
                  border-cyan-500
                  border-t-transparent
                  shadow-lg
                  shadow-cyan-500/50
                "
              />

            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >

            {categoryDocuments.length > 0 ? (
              categoryDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  navigate={navigate}
                />
              ))
            ) : (
              <EmptyState
                searchQuery={search}
              />
            )}

          </motion.div>
        )}

        {/* ============================================
            CTA
        ============================================ */}

        <motion.section
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            relative
            mt-24
            overflow-hidden
            rounded-[32px]
            border
            border-cyan-500/30
            bg-gradient-to-br
            from-slate-900/80
            via-slate-900/40
            to-cyan-950/20
            p-8
            shadow-2xl
            shadow-cyan-950/50
            backdrop-blur-3xl
            md:p-12
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-16
              -top-16
              h-64
              w-64
              rounded-full
              bg-cyan-500/15
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

            <div className="max-w-xl">

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-cyan-500/20
                  bg-cyan-500/10
                  px-3.5
                  py-1
                  text-xs
                  font-bold
                  text-cyan-400
                "
              >
                <Flame size={14} />

                Continuous Excellence
              </div>

              <h2
                className="
                  mt-4
                  text-3xl
                  font-black
                  tracking-tight
                  text-white
                  md:text-4xl
                "
              >
                Master Your Skillset Today
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-slate-400
                  md:text-base
                "
              >
                Explore adjacent engineering
                categories, cross-reference
                documentation files, and level up
                your mastery with Scholiqen's
                structured archive.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/subjects")
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-cyan-500
                px-8
                py-4
                text-sm
                font-bold
                text-slate-950
                transition
                hover:bg-cyan-400
                hover:shadow-lg
                hover:shadow-cyan-500/30
                active:scale-95
              "
            >
              <Compass size={18} />

              Browse All Categories
            </button>

          </div>

        </motion.section>

      </main>

    </div>
  );
}

/* ============================================
   DOCUMENT CARD
============================================ */

const DocumentCard = ({
  doc,
  navigate,
}) => {

  /* ============================================
     DOWNLOAD
  ============================================ */

  const handleDownload = (e) => {
    e.stopPropagation();

    if (!doc.file_url) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = doc.file_url;

    link.download =
      doc.title || "document";

    link.target = "_blank";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /* ============================================
     FILE SIZE
  ============================================ */

  const formatFileSize = (
    sizeInBytes
  ) => {
    if (!sizeInBytes) {
      return null;
    }

    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    }

    if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(
        sizeInBytes / 1024
      )} KB`;
    }

    return `${(
      sizeInBytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  /* ============================================
     OPEN PREMIUM PDF READER
  ============================================ */

  const openPDFReader = () => {
    if (!doc?.id) {
      return;
    }

    navigate(`/pdf/${doc.id}`);
  };

  /* ============================================
     RENDER
  ============================================ */

  return (
    <motion.div
      variants={cardAnimationVariants}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.2,
        },
      }}
      className="
        group
        relative
        flex
        flex-col
        overflow-hidden
        rounded-[28px]
        border
        border-slate-800/80
        bg-slate-900/50
        p-5
        backdrop-blur-2xl
        transition-all
        hover:border-cyan-500/40
        hover:bg-slate-900/80
        hover:shadow-2xl
        hover:shadow-cyan-500/10
      "
    >

      {/* HOVER GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-44
          w-44
          rounded-full
          bg-cyan-500/10
          blur-[80px]
          transition-all
          group-hover:bg-cyan-500/20
        "
      />

      <div
        className="
          relative
          z-10
          flex
          h-full
          flex-col
        "
      >

        {/* ============================================
            THUMBNAIL
        ============================================ */}

        <div
          className="
            relative
            flex
            h-44
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border
            border-slate-800/80
            bg-slate-950/80
            transition-colors
            group-hover:border-slate-700
          "
        >

          {doc.thumbnail_url ||
          doc.thumbnail ? (

            <img
              src={
                doc.thumbnail_url ||
                doc.thumbnail
              }
              alt={doc.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />

          ) : (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-2
                text-slate-600
              "
            >

              <FileText
                size={36}
                className="
                  text-slate-500
                  transition-colors
                  group-hover:text-cyan-400
                "
              />

              <span
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                {doc.file_type ||
                  "Document"} Preview
              </span>

            </div>

          )}

          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-slate-950/70
              via-transparent
              to-transparent
              opacity-80
            "
          />

          {/* FILE BADGE */}

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
              border-slate-800
              bg-slate-950/80
              px-3
              py-1
              text-[11px]
              font-bold
              text-cyan-400
              backdrop-blur-md
            "
          >
            {doc.file_type?.toUpperCase() ||
              "FILE"}
          </div>

        </div>

        {/* ============================================
            META
        ============================================ */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            text-xs
            font-medium
            text-slate-500
          "
        >

          <span className="flex items-center gap-1">
            <Clock size={13} />

            {doc.created_at
              ? new Date(
                  doc.created_at
                ).toLocaleDateString()
              : "Standard Asset"}
          </span>

          {doc.file_size && (
            <span
              className="
                rounded-md
                border
                border-slate-700/50
                bg-slate-800/60
                px-2
                py-0.5
                text-slate-400
              "
            >
              {formatFileSize(
                doc.file_size
              )}
            </span>
          )}

        </div>

        {/* ============================================
            TITLE
        ============================================ */}

        <h3
          className="
            mt-3
            line-clamp-2
            text-xl
            font-bold
            tracking-tight
            text-white
            transition-colors
            group-hover:text-cyan-300
          "
        >
          {doc.title}
        </h3>

        {/* ============================================
            DESCRIPTION
        ============================================ */}

        <p
          className="
            mt-2
            line-clamp-2
            flex-grow
            text-sm
            leading-relaxed
            text-slate-400
          "
        >
          {doc.description ||
            "No description provided for this resource entry."}
        </p>

        {/* ============================================
            ACTIONS
        ============================================ */}

        <div
          className="
            mt-6
            flex
            items-center
            gap-2.5
            border-t
            border-slate-800/80
            pt-4
          "
        >

          {/* ========================================
              READ ASSET
          ======================================== */}

          <button
            type="button"
            onClick={openPDFReader}
            className="
              flex-1
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-4
              py-3
              text-xs
              font-bold
              text-slate-950
              shadow-md
              shadow-cyan-500/20
              transition
              hover:bg-cyan-400
              hover:shadow-cyan-500/30
              active:scale-95
            "
          >
            <BookOpen size={14} />

            Read Asset

            <ExternalLink size={14} />
          </button>

          {/* ========================================
              DOWNLOAD
          ======================================== */}

          {doc.file_url && (
            <button
              type="button"
              onClick={handleDownload}
              title="Download file"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                border
                border-slate-700
                bg-slate-900/80
                p-3
                text-slate-300
                transition
                hover:border-cyan-500
                hover:bg-cyan-500/10
                hover:text-cyan-400
                active:scale-95
              "
            >
              <Download size={18} />
            </button>
          )}

        </div>

      </div>

    </motion.div>
  );
};

/* ============================================
   EMPTY STATE
============================================ */

const EmptyState = ({
  searchQuery,
}) => (
  <div
    className="
      col-span-full
      flex
      flex-col
      items-center
      justify-center
      rounded-[32px]
      border
      border-dashed
      border-slate-800
      bg-slate-900/30
      p-16
      text-center
      backdrop-blur-2xl
    "
  >

    <div
      className="
        flex
        h-20
        w-20
        items-center
        justify-center
        rounded-3xl
        border
        border-slate-700/60
        bg-slate-800/60
        text-slate-500
      "
    >
      <BookOpen size={36} />
    </div>

    <h2
      className="
        mt-6
        text-2xl
        font-black
        text-white
      "
    >
      No Learning Materials Found
    </h2>

    <p
      className="
        mt-2
        max-w-md
        text-sm
        leading-relaxed
        text-slate-400
      "
    >
      {searchQuery
        ? `We couldn't find any resources matching "${searchQuery}". Try modifying your query.`
        : "There are currently no documents assigned to this category workspace. Please check back later."}
    </p>

  </div>
);