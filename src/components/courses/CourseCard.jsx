// src/components/courses/CourseCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  Star,
  Award,
  ArrowRight,
  PlayCircle,
  Layers3,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course = {}, onOpen = () => {} }) => {
  const navigate = useNavigate();

  const {
    id,
    title = "Untitled Course",
    description = "",
    category = "General",
    level = "Beginner",
    provider = "Scholiqen",
    thumbnail,
    banner,
    duration = "0 hrs",
    lessons = 0,
    rating = 0,
    reviews = 0,
    enrolled = false,
    featured = false,
    certificate = false,
    progress = null,
    updatedAt,
    price = "Free",
    slug,
  } = course;

  const image = thumbnail || banner;

  const difficultyColor = {
    Beginner: "bg-emerald-500/20 text-emerald-300",
    Intermediate: "bg-amber-500/20 text-amber-300",
    Advanced: "bg-red-500/20 text-red-300",
  };

  const levelStyle = difficultyColor[level] || "bg-blue-500/20 text-blue-300";

  const openCourse = () => {
    if (onOpen) {
      onOpen(course);
      return;
    }
    navigate(`/courses/${slug || id}`);
  };

  return (
    <motion.article
      whileHover={{ y: -10 }}
      transition={{ duration: 0.35 }}
      className="group overflow-hidden rounded-[30px] border border-slate-800 bg-[#08131f] shadow-xl transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_25px_60px_rgba(0,0,0,.45)]"
    >
      {/* ===========================
          THUMBNAIL
      =========================== */}
      <div className="relative h-60 overflow-hidden">
        {image ? (
          <motion.img
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6 }}
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-700 via-blue-700 to-slate-900">
            <BookOpen size={70} className="text-white/70" />
          </div>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

        {/* Featured */}
        {featured && (
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900">
            <Sparkles size={14} />
            Featured
          </div>
        )}

        {/* Category */}
        <div className="absolute left-5 bottom-5 rounded-full bg-cyan-500/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
          {category}
        </div>

        {/* Difficulty */}
        <div className={`absolute right-5 top-5 rounded-full px-4 py-2 text-xs font-semibold backdrop-blur-xl ${levelStyle}`}>
          {level}
        </div>
      </div>

      {/* ===========================
          BODY
      =========================== */}
      <div className="p-7">
        {/* Provider & Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            {provider}
          </span>
          {price === "Free" ? (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              FREE
            </span>
          ) : (
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
              {price}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="mt-4 line-clamp-2 text-2xl font-extrabold leading-tight text-white transition group-hover:text-cyan-300">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-slate-400">
          {description || "Master practical skills through structured lessons, projects and assessments designed for real-world success."}
        </p>

        {/* ===========================
            COURSE STATS
        =========================== */}
        <div className="mt-7 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 p-4">
            <Clock3 size={20} className="text-cyan-400" />
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <h4 className="font-semibold text-white">{duration}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 p-4">
            <BookOpen size={20} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-500">Lessons</p>
              <h4 className="font-semibold text-white">{lessons}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 p-4">
            <Star size={20} className="fill-yellow-400 text-yellow-400" />
            <div>
              <p className="text-xs text-slate-500">Rating</p>
              <h4 className="font-semibold text-white">{rating || "5.0"}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 p-4">
            <Layers3 size={20} className="text-violet-400" />
            <div>
              <p className="text-xs text-slate-500">Reviews</p>
              <h4 className="font-semibold text-white">{reviews}</h4>
            </div>
          </div>
        </div>

        {/* Certificate */}
        {certificate && (
          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <ShieldCheck size={22} className="text-emerald-400" />
            <div>
              <h4 className="font-semibold text-emerald-300">Certificate Included</h4>
              <p className="text-sm text-emerald-500/80">Earn a verified Scholiqen certificate.</p>
            </div>
          </div>
        )}

        {/* ===========================
            PROGRESS
        =========================== */}
        {progress !== null && (
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">Course Progress</span>
              <span className="font-bold text-cyan-400">{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
              />
            </div>
          </div>
        )}

        {/* ===========================
            FOOTER
        =========================== */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {updatedAt && <p className="text-xs text-slate-500">Updated {updatedAt}</p>}
            {enrolled && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <TrendingUp size={14} />
                Enrolled
              </div>
            )}
          </div>

          <button
            onClick={openCourse}
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_35px_rgba(34,211,238,.35)]"
          >
            {progress !== null ? (
              <>
                <PlayCircle size={18} />
                Continue
              </>
            ) : (
              <>
                View Course
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default CourseCard;