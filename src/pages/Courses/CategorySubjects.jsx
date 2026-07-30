import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  Download,
  Layers,
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
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardAnimationVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
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

export default function CategorySubjects() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { categories = [], documents = [], loading } = useCourses();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  /* ============================================
     MEMOIZED COMPUTATIONS & FILTERS
  ============================================ */
  const selectedCategory = useMemo(() => {
    return categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
  }, [categories, categoryId]);

  const categoryDocuments = useMemo(() => {
    let list = documents.filter(
      (doc) => String(doc.category_id) === String(categoryId)
    );

    if (activeFilter === "pdf") {
      list = list.filter((doc) => doc.file_type?.toLowerCase() === "pdf");
    } else if (activeFilter === "other") {
      list = list.filter((doc) => doc.file_type?.toLowerCase() !== "pdf");
    }

    if (!search.trim()) return list;

    const keyword = search.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.title?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
    );
  }, [documents, categoryId, search, activeFilter]);

  const totalFiles = useMemo(() => {
    return documents.filter(
      (doc) => String(doc.category_id) === String(categoryId)
    ).length;
  }, [documents, categoryId]);

  const pdfCount = useMemo(() => {
    return documents.filter(
      (doc) =>
        String(doc.category_id) === String(categoryId) &&
        doc.file_type?.toLowerCase() === "pdf"
    ).length;
  }, [documents, categoryId]);

  return (
    <div className="relative min-h-screen bg-[#02040a] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      
      {/* ============================================
         ULTRA-IMMERSIVE DYNAMIC BACKGROUND AMBIENCE
      ============================================ */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Deep immersive base gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#02040a] to-[#010205]" />

        {/* Dynamic glowing floating mesh orbs */}
        <div className="absolute -top-[20%] -left-[10%] h-[700px] w-[700px] rounded-full bg-cyan-600/10 blur-[160px] animate-pulse" />
        <div className="absolute top-[30%] -right-[15%] h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[180px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />

        {/* High-tech crisp geometric grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf80d_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

        {/* Subtle noise grain simulation layer for high-end depth */}
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
        
        {/* PREMIUM HEADER & NAVIGATION */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate("/subjects")}
            className="group inline-flex items-center gap-2.5 rounded-full border border-slate-800/80 bg-slate-900/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 backdrop-blur-2xl transition hover:border-cyan-500/50 hover:bg-slate-800/60 hover:text-cyan-400 shadow-sm"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Categories
          </button>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-2xl shadow-cyan-500/25 ring-1 ring-white/20">
                <BookOpen size={36} className="text-white drop-shadow-md" />
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 text-xs font-bold shadow-lg">
                  {totalFiles}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20 backdrop-blur-md">
                    <Sparkles size={12} /> Active Workspace
                  </span>
                </div>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-5xl drop-shadow-sm">
                  {selectedCategory?.name || "Category Hub"}
                </h1>
                <p className="mt-2 text-base text-slate-400 max-w-xl">
                  Curated learning modules, professional blueprints, and technical notes engineered for maximum retention.
                </p>
              </div>
            </div>

            {/* QUICK STATS PILLS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex flex-col justify-center rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 backdrop-blur-2xl shadow-lg">
                <span className="text-xs font-medium text-slate-500">Total Assets</span>
                <span className="mt-1 text-2xl font-black text-white">{totalFiles}</span>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 backdrop-blur-2xl shadow-lg">
                <span className="text-xs font-medium text-slate-500">PDF Files</span>
                <span className="mt-1 text-2xl font-black text-cyan-400">{pdfCount}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col justify-center rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 backdrop-blur-2xl shadow-lg">
                <span className="text-xs font-medium text-slate-500">Access Status</span>
                <span className="mt-1 flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                  <CheckCircle2 size={16} /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* CONTROL BAR: SEARCH & FILTERS */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* SEARCH INPUT */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-slate-500">
                <Search size={18} />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources by title, concept, or keywords..."
                className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/50 py-4 pl-12 pr-6 text-sm text-white placeholder:text-slate-500 backdrop-blur-2xl transition focus:border-cyan-500/50 focus:bg-slate-900/80 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* TAB FILTERS */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-1.5 backdrop-blur-2xl shadow-lg">
              <button
                onClick={() => setActiveFilter("all")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeFilter === "all"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                All Assets
              </button>
              <button
                onClick={() => setActiveFilter("pdf")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeFilter === "pdf"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                PDF Docs
              </button>
              <button
                onClick={() => setActiveFilter("other")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeFilter === "other"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                Others
              </button>
            </div>
          </div>
        </motion.section>

        {/* CONTENT GRID CONTAINER */}
        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-16 w-16 animate-ping rounded-full bg-cyan-500/20" />
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-lg shadow-cyan-500/50" />
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categoryDocuments.length > 0 ? (
              categoryDocuments.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} navigate={navigate} />
              ))
            ) : (
              <EmptyState searchQuery={search} />
            )}
          </motion.div>
        )}

        {/* SENIOR DEV BOTTOM BANNER / CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-24 overflow-hidden rounded-[32px] border border-cyan-500/30 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-cyan-950/20 p-8 md:p-12 backdrop-blur-3xl shadow-2xl shadow-cyan-950/50"
        >
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20">
                <Flame size={14} /> Continuous Excellence
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white">
                Master Your Skillset Today
              </h2>
              <p className="mt-2 text-slate-400 text-sm md:text-base leading-relaxed">
                Explore adjacent engineering categories, cross-reference documentation files, and level up your mastery with Scholiqen's structured archive.
              </p>
            </div>

            <button
              onClick={() => navigate("/subjects")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95"
            >
              <Compass size={18} /> Browse All Categories
            </button>
          </div>
        </motion.section>

      </main>
    </div>
  );
}

/* ============================================
   DOCUMENT CARD COMPONENT (SENIOR ARCHITECTURE)
============================================ */
const DocumentCard = ({ doc, navigate }) => {
  const handleDownload = (e) => {
    e.stopPropagation();
    if (!doc.file_url) return;
    const link = document.createElement("a");
    link.href = doc.file_url;
    link.download = doc.title || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return null;
    return `${Math.round(sizeInBytes / 1024)} KB`;
  };

  return (
    <motion.div
      variants={cardAnimationVariants}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-2xl transition-all hover:border-cyan-500/40 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      {/* GLOW EFFECT ON HOVER */}
      <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-500/10 blur-[80px] transition-all group-hover:bg-cyan-500/20 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        
        {/* THUMBNAIL CONTAINER */}
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center group-hover:border-slate-700 transition-colors">
          {doc.thumbnail_url || doc.thumbnail ? (
            <img
              src={doc.thumbnail_url || doc.thumbnail}
              alt={doc.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
              <FileText size={36} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {doc.file_type || "Document"} Preview
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
          
          {/* TOP BADGE OVER THUMBNAIL */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-cyan-400 border border-slate-800">
            {doc.file_type?.toUpperCase() || "FILE"}
          </div>
        </div>

        {/* METADATA TAGS */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={13} /> {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Standard Asset"}
          </span>
          {doc.file_size && (
            <span className="rounded-md bg-slate-800/60 px-2 py-0.5 text-slate-400 border border-slate-700/50">
              {formatFileSize(doc.file_size)}
            </span>
          )}
        </div>

        {/* TITLE */}
        <h3 className="mt-3 line-clamp-2 text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
          {doc.title}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400 flex-grow">
          {doc.description || "No description provided for this resource entry."}
        </p>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex items-center gap-2.5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => navigate(`/pdf/${doc.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 active:scale-95 shadow-md shadow-cyan-500/20"
          >
            Read Asset <ExternalLink size={14} />
          </button>

          {doc.file_url && (
            <button
              onClick={handleDownload}
              title="Download file"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400 active:scale-95"
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
   EMPTY STATE COMPONENT
============================================ */
const EmptyState = ({ searchQuery }) => (
  <div className="col-span-full flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center backdrop-blur-2xl">
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800/60 border border-slate-700/60 text-slate-500">
      <BookOpen size={36} />
    </div>
    <h2 className="mt-6 text-2xl font-black text-white">No Learning Materials Found</h2>
    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
      {searchQuery
        ? `We couldn't find any resources matching "${searchQuery}". Try modifying your query.`
        : "There are currently no documents assigned to this category workspace. Please check back later."}
    </p>
  </div>
);