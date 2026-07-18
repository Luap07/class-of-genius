// src/components/courses/CourseHero.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  BookOpen,
  Award,
  TrendingUp,
  Brain,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: "easeOut",
    },
  }),
};

const floating = {
  animate: {
    y: [-6, 6, -6],
    transition: {
      repeat: Infinity,
      duration: 6,
      ease: "easeInOut",
    },
  },
};

const CourseHero = ({ onBrowseCourses, onExploreCategories }) => {
  const navigate = useNavigate();

const location = useLocation();

const handleBrowseCourses = () => {
  if (location.pathname !== "/courses") {
    navigate("/courses");
  } else {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};
  /* ===========================================
     LIVE STATS
  =========================================== */
  const [stats, setStats] = useState({
    courses: 0,
    lessons: 0,
    assessments: 0,
    categories: 0,
  });

  const [featuredCourse, setFeaturedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===========================================
     FETCH HERO DATA
  =========================================== */
  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      setLoading(true);

      const [
        coursesResult,
        topicsResult,
        weeklyTasksResult,
        monthlyQuizResult,
        categoriesResult,
      ] = await Promise.all([
        supabase.from("courses").select("*"),
        supabase.from("topics").select("*"),
        supabase.from("weekly_tasks").select("*"),
        supabase.from("monthly_quizzes").select("*"),
        supabase.from("course_categories").select("*"),
      ]);

      const courses = coursesResult.data || [];
      const topics = topicsResult.data || [];
      const weeklyTasks = weeklyTasksResult.data || [];
      const quizzes = monthlyQuizResult.data || [];
      const categories = categoriesResult.data || [];

      setStats({
        courses: courses.length,
        lessons: topics.length,
        assessments: weeklyTasks.length + quizzes.length,
        categories: categories.length,
      });

      const featured = courses.find((course) => course.featured === true) || courses[0];
      setFeaturedCourse(featured);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-[#07111f]">
      {/* ==========================
          BACKGROUND
      ========================== */}
      <div className="absolute inset-0">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[350px] w-[350px] rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-8 py-24">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          
          {/* ==========================
              LEFT
          ========================== */}
          <div>
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-300"
            >
              <Brain size={18} />
              AI Powered Learning Platform
            </motion.div>

            {/* HERO TITLE */}
            <motion.h1
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 max-w-3xl text-5xl font-black leading-tight tracking-tight text-white lg:text-7xl"
            >
              Learn.
              <span className="text-cyan-400"> Build.</span>
              <br />
              Become
              <span className="text-blue-400"> Extraordinary.</span>
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              custom={0.4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 max-w-2xl text-lg leading-9 text-slate-400"
            >
              Scholiqen brings together professional courses, AI tutoring, virtual laboratories, quizzes, assignments and real-world projects into one intelligent learning ecosystem designed for students, professionals and lifelong learners.
            </motion.p>

            {/* ACTION BUTTONS */}
            <motion.div
              custom={0.6}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-10 flex flex-wrap gap-5"
            >
              <button
  onClick={handleBrowseCourses}
  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"
>
  Explore Courses

  <ArrowRight
    size={18}
    className="transition group-hover:translate-x-1"
  />
</button>

              <button
                onClick={onExploreCategories}
                className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 px-8 py-4 font-semibold text-white backdrop-blur-xl transition hover:border-cyan-500/40 hover:bg-slate-800"
              >
                <PlayCircle size={18} />
                Explore Categories
              </button>
            </motion.div>

            {/* TRUST BADGES */}
            <motion.div
              custom={0.8}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-12 flex flex-wrap gap-8"
            >
              <div className="flex items-center gap-3 text-slate-300">
                <ShieldCheck size={20} className="text-cyan-400" /> Secure Learning
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Award size={20} className="text-yellow-400" /> Industry Certificates
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Brain size={20} className="text-blue-400" /> AI Powered
              </div>
            </motion.div>

            {/* LIVE STATS */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-16 grid grid-cols-2 gap-5 lg:grid-cols-4"
            >
              {[
                { icon: BookOpen, value: stats.courses, label: "Courses", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                { icon: PlayCircle, value: stats.lessons, label: "Lessons", color: "text-blue-400", bg: "bg-blue-500/10" },
                { icon: Award, value: stats.assessments, label: "Assessments", color: "text-violet-400", bg: "bg-violet-500/10" },
                { icon: TrendingUp, value: stats.categories, label: "Categories", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -6, scale: 1.03 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-center text-center rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-slate-900 min-h-[190px]"                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg}`}>
                      <Icon size={24} className={item.color} />
                    </div>
                    <h2 className="mt-6 text-3xl font-black text-white">
                      {loading ? "--" : item.value}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">{item.label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* =====================================
              RIGHT SIDE
          ===================================== */}
          <div className="relative">
            <motion.div variants={floating} animate="animate" className="mx-auto max-w-xl">
              <div className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/70 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,.45)]">
                {/* COURSE IMAGE */}
                <div className="relative h-80 overflow-hidden">
                  {featuredCourse?.thumbnail ? (
                    <img
                      src={featuredCourse.thumbnail}
                      alt={featuredCourse.title}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-[#06101d]">
                      <GraduationCap size={90} className="text-cyan-400/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                  <div className="absolute left-6 bottom-6">
                    <span className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-300">
                      Featured Course
                    </span>
                  </div>
                </div>

                {/* BODY */}
                <div className="space-y-6 p-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {featuredCourse?.title || "Scholiqen Premium"}
                    </h2>
                    <p className="mt-3 leading-7 text-slate-400">
                      {featuredCourse?.description || "Master practical skills through immersive learning, AI tutoring and real-world projects."}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-slate-800/70 p-4 text-center">
                      <BookOpen size={22} className="mx-auto mb-2 text-cyan-400" />
                      <h3 className="font-bold text-white">{featuredCourse?.lessons || 0}</h3>
                      <p className="text-xs text-slate-400">Lessons</p>
                    </div>
                    <div className="rounded-2xl bg-slate-800/70 p-4 text-center">
                      <TrendingUp size={22} className="mx-auto mb-2 text-emerald-400" />
                      <h3 className="font-bold text-white">{featuredCourse?.level || "Beginner"}</h3>
                      <p className="text-xs text-slate-400">Level</p>
                    </div>
                    <div className="rounded-2xl bg-slate-800/70 p-4 text-center">
                      <Award size={22} className="mx-auto mb-2 text-yellow-400" />
                      <h3 className="font-bold text-white">{featuredCourse?.rating || "5.0"}</h3>
                      <p className="text-xs text-slate-400">Rating</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <button onClick={handleBrowseCourses}>
  Explore Courses
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;