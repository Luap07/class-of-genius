import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  Clock3,
  Users,
  Star,
  ArrowRight,
  Play,
  GraduationCap,
  Code2,
  FlaskConical,
  Calculator,
  Languages,
  BriefcaseBusiness,
  Palette,
  Brain,
  X,
  ChevronDown,
  Zap,
  Trophy,
  ShieldCheck,
} from "lucide-react";

import CourseHero from "../../components/courses/CourseHero";

/* =========================================================
   LOCAL NEON COURSE DATA
   NO SUPABASE
   NO API
   NO REMOTE FETCH
========================================================= */

const COURSES = [
  {
    id: "web-development",
    title: "Full-Stack Web Development",
    description:
      "Master modern frontend and backend development and build production-ready web applications.",
    category: "Technology",
    level: "Intermediate",
    duration: "12 weeks",
    students: 2840,
    rating: 4.9,
    lessons: 64,
    icon: Code2,
    accent: "cyan",
    featured: true,
    progress: 0,
  },
  {
    id: "advanced-mathematics",
    title: "Advanced Mathematics",
    description:
      "Build strong mathematical reasoning through algebra, calculus, geometry and advanced problem solving.",
    category: "Mathematics",
    level: "Advanced",
    duration: "10 weeks",
    students: 1960,
    rating: 4.8,
    lessons: 52,
    icon: Calculator,
    accent: "violet",
    featured: true,
    progress: 0,
  },
  {
    id: "biology",
    title: "Biology Masterclass",
    description:
      "Explore cells, genetics, ecology, evolution and human biology with structured lessons.",
    category: "Science",
    level: "Intermediate",
    duration: "8 weeks",
    students: 1740,
    rating: 4.9,
    lessons: 48,
    icon: FlaskConical,
    accent: "emerald",
    featured: true,
    progress: 0,
  },
  {
    id: "physics",
    title: "Physics Fundamentals",
    description:
      "Understand mechanics, waves, electricity, energy and modern physics through practical examples.",
    category: "Science",
    level: "Intermediate",
    duration: "9 weeks",
    students: 1510,
    rating: 4.8,
    lessons: 45,
    icon: Zap,
    accent: "blue",
    featured: false,
    progress: 0,
  },
  {
    id: "english-language",
    title: "English Language",
    description:
      "Improve grammar, vocabulary, comprehension, writing and communication skills.",
    category: "Languages",
    level: "Beginner",
    duration: "6 weeks",
    students: 3250,
    rating: 4.9,
    lessons: 36,
    icon: Languages,
    accent: "pink",
    featured: false,
    progress: 0,
  },
  {
    id: "french",
    title: "French Language",
    description:
      "Develop practical French vocabulary, grammar, pronunciation and conversational skills.",
    category: "Languages",
    level: "Beginner",
    duration: "7 weeks",
    students: 2180,
    rating: 4.7,
    lessons: 40,
    icon: Languages,
    accent: "indigo",
    featured: false,
    progress: 0,
  },
  {
    id: "business-studies",
    title: "Business Studies",
    description:
      "Learn entrepreneurship, business management, finance, marketing and commercial principles.",
    category: "Business",
    level: "Intermediate",
    duration: "8 weeks",
    students: 1290,
    rating: 4.7,
    lessons: 42,
    icon: BriefcaseBusiness,
    accent: "amber",
    featured: false,
    progress: 0,
  },
  {
    id: "creative-design",
    title: "Creative Design",
    description:
      "Learn design thinking, visual communication, digital creativity and modern design principles.",
    category: "Creative",
    level: "Beginner",
    duration: "6 weeks",
    students: 980,
    rating: 4.8,
    lessons: 34,
    icon: Palette,
    accent: "fuchsia",
    featured: false,
    progress: 0,
  },
  {
    id: "ai-fundamentals",
    title: "Artificial Intelligence Fundamentals",
    description:
      "Understand AI concepts, machine learning, generative AI and how intelligent systems work.",
    category: "Technology",
    level: "Beginner",
    duration: "7 weeks",
    students: 2450,
    rating: 4.9,
    lessons: 39,
    icon: Brain,
    accent: "purple",
    featured: true,
    progress: 0,
  },
  {
    id: "exam-preparation",
    title: "Exam Preparation Mastery",
    description:
      "Build powerful study strategies, revision habits, exam confidence and problem-solving skills.",
    category: "Academic",
    level: "All Levels",
    duration: "5 weeks",
    students: 3670,
    rating: 4.9,
    lessons: 30,
    icon: GraduationCap,
    accent: "cyan",
    featured: false,
    progress: 0,
  },
];

const CATEGORIES = [
  "All",
  "Technology",
  "Mathematics",
  "Science",
  "Languages",
  "Business",
  "Creative",
  "Academic",
];

const accentMap = {
  cyan: {
    border: "border-cyan-400/30",
    glow: "shadow-cyan-500/20",
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    gradient: "from-cyan-400 to-blue-500",
  },
  violet: {
    border: "border-violet-400/30",
    glow: "shadow-violet-500/20",
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    gradient: "from-violet-400 to-fuchsia-500",
  },
  emerald: {
    border: "border-emerald-400/30",
    glow: "shadow-emerald-500/20",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    gradient: "from-emerald-400 to-cyan-500",
  },
  blue: {
    border: "border-blue-400/30",
    glow: "shadow-blue-500/20",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    gradient: "from-blue-400 to-cyan-500",
  },
  pink: {
    border: "border-pink-400/30",
    glow: "shadow-pink-500/20",
    text: "text-pink-300",
    bg: "bg-pink-500/10",
    gradient: "from-pink-400 to-rose-500",
  },
  indigo: {
    border: "border-indigo-400/30",
    glow: "shadow-indigo-500/20",
    text: "text-indigo-300",
    bg: "bg-indigo-500/10",
    gradient: "from-indigo-400 to-violet-500",
  },
  amber: {
    border: "border-amber-400/30",
    glow: "shadow-amber-500/20",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    gradient: "from-amber-400 to-orange-500",
  },
  fuchsia: {
    border: "border-fuchsia-400/30",
    glow: "shadow-fuchsia-500/20",
    text: "text-fuchsia-300",
    bg: "bg-fuchsia-500/10",
    gradient: "from-fuchsia-400 to-pink-500",
  },
  purple: {
    border: "border-purple-400/30",
    glow: "shadow-purple-500/20",
    text: "text-purple-300",
    bg: "bg-purple-500/10",
    gradient: "from-purple-400 to-cyan-500",
  },
};

/* =========================================================
   COURSE CARD
========================================================= */

const CourseCard = ({ course, index, onOpen }) => {
  const Icon = course.icon;
  const accent = accentMap[course.accent] || accentMap.cyan;

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      whileHover={{ y: -7 }}
      className={`group relative overflow-hidden rounded-3xl border ${accent.border}
        bg-slate-900/70 backdrop-blur-xl transition-all duration-300
        hover:${accent.glow} hover:bg-slate-900`}
    >
      {/* neon line */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.gradient} opacity-70`}
      />

      {/* glow */}
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full
          bg-gradient-to-br ${accent.gradient} opacity-[0.08] blur-3xl
          transition-opacity duration-300 group-hover:opacity-20`}
      />

      <div className="relative p-6">
        <div className="mb-6 flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl
              ${accent.bg} ${accent.text} border ${accent.border}`}
          >
            <Icon size={27} />
          </div>

          {course.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <Sparkles size={12} />
              Featured
            </span>
          )}
        </div>

        <div className="mb-3">
          <span className={`text-xs font-semibold ${accent.text}`}>
            {course.category}
          </span>
        </div>

        <h3 className="min-h-[58px] text-xl font-bold tracking-tight text-white">
          {course.title}
        </h3>

        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
          {course.description}
        </p>

        <div className="my-6 h-px bg-white/5" />

        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock3 size={14} className={accent.text} />
            {course.duration}
          </div>

          <div className="flex items-center gap-2">
            <BookOpen size={14} className={accent.text} />
            {course.lessons} lessons
          </div>

          <div className="flex items-center gap-2">
            <Users size={14} className={accent.text} />
            {course.students.toLocaleString()}
          </div>

          <div className="flex items-center gap-2">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            {course.rating}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
            {course.level}
          </span>

          <button
            onClick={() => onOpen(course)}
            className={`group/btn inline-flex items-center gap-2 rounded-xl
              bg-gradient-to-r ${accent.gradient} px-4 py-2.5
              text-xs font-bold text-white shadow-lg transition-all
              hover:scale-105`}
          >
            Explore
            <ArrowRight
              size={14}
              className="transition-transform group-hover/btn:translate-x-1"
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

/* =========================================================
   FEATURED CARD
========================================================= */

const FeaturedCard = ({ course, onOpen }) => {
  const Icon = course.icon;
  const accent = accentMap[course.accent] || accentMap.cyan;

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      className={`group relative overflow-hidden rounded-[2rem] border ${accent.border}
        bg-slate-900/70 backdrop-blur-xl`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-[0.035]`}
      />

      <div className="relative flex flex-col gap-6 p-7 md:flex-row md:items-center">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl
            ${accent.bg} ${accent.text} border ${accent.border}`}
        >
          <Icon size={36} />
        </div>

        <div className="min-w-0 flex-1">
          <div className={`mb-2 text-xs font-bold uppercase tracking-widest ${accent.text}`}>
            {course.category}
          </div>

          <h3 className="text-2xl font-black text-white">
            {course.title}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {course.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Star className="fill-yellow-400 text-yellow-400" size={14} />
              {course.rating}
            </span>

            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {course.students.toLocaleString()} learners
            </span>

            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              {course.lessons} lessons
            </span>
          </div>
        </div>

        <button
          onClick={() => onOpen(course)}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl
            bg-gradient-to-r ${accent.gradient} px-6 py-3
            text-sm font-bold text-white shadow-lg transition hover:scale-105`}
        >
          Start Learning
          <Play size={15} fill="currentColor" />
        </button>
      </div>
    </motion.div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const Courses = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [level, setLevel] = useState("All");

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return COURSES.filter((course) => {
      const matchesCategory =
        category === "All" || course.category === category;

      const matchesLevel =
        level === "All" || course.level === level;

      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query);

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [search, category, level]);

  const featuredCourses = useMemo(
    () => COURSES.filter((course) => course.featured),
    []
  );

  const handleOpenCourse = (course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleBrowseCourses = () => {
    document
      .getElementById("course-catalogue")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExploreCategories = () => {
    document
      .getElementById("course-categories")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute left-[5%] top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute right-[5%] top-[35%] h-96 w-96 rounded-full bg-violet-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-[35%] h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}
      <CourseHero
        onBrowseCourses={handleBrowseCourses}
        onExploreCategories={handleExploreCategories}
      />

      {/* =====================================================
          FEATURED
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles size={14} />
              Curated for you
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Featured learning
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              High-impact courses selected to help you build practical skills
              and move faster.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {featuredCourses.slice(0, 4).map((course) => (
            <FeaturedCard
              key={course.id}
              course={course}
              onOpen={handleOpenCourse}
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          CATALOGUE
      ===================================================== */}
      <section
        id="course-catalogue"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-24 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            <BookOpen size={14} />
            Course catalogue
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Explore your next skill
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Learn at your own pace with structured courses designed for
                students, creators and future professionals.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] px-4 py-3 text-sm text-slate-300">
              <span className="font-bold text-cyan-300">
                {filteredCourses.length}
              </span>{" "}
              courses available
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, subjects or skills..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-cyan-400/[0.03]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((value) => !value)}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              <SlidersHorizontal size={17} />
              Filters
              <ChevronDown
                size={15}
                className={`transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 border-t border-white/5 pt-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  LEVEL
                </span>

                {["All", "Beginner", "Intermediate", "Advanced", "All Levels"].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setLevel(item)}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        level === item
                          ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/30"
                          : "bg-white/[0.03] text-slate-400 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Categories */}
        <div
          id="course-categories"
          className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          {CATEGORIES.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-xs font-bold transition ${
                category === item
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/10"
                  : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onOpen={handleOpenCourse}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Search size={26} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">
              No courses found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Try another search term or remove one of your filters.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setLevel("All");
              }}
              className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          PREMIUM TRUST STRIP
      ===================================================== */}
      <section className="border-y border-white/5 bg-slate-950/70">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Structured learning",
              text: "Clear lessons and focused learning paths.",
            },
            {
              icon: Trophy,
              title: "Skill-focused",
              text: "Designed around practical academic outcomes.",
            },
            {
              icon: Zap,
              title: "Learn faster",
              text: "Everything you need in one focused ecosystem.",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <Icon size={20} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div className="h-20" />
    </main>
  );
};

export default Courses;