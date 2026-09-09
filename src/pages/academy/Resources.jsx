import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Library,
  Lock,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
  Microscope,
  Atom,
  Laptop,
  Languages,
} from "lucide-react";

import Cog from "../../assets/cog.png";
import heroImage from "../../assets/heroImg.jpeg";

/* =========================================================
   RESOURCE FILTERS
========================================================= */

const RESOURCE_TYPES = [
  {
    id: "all",
    label: "All Resources",
  },
  {
    id: "notes",
    label: "Study Notes",
  },
  {
    id: "textbooks",
    label: "Digital Textbooks",
  },
  {
    id: "revision",
    label: "Revision",
  },
];

/* =========================================================
   IMAGE URLS
   These are remote images, so you do not need to download
   them into your project.
========================================================= */

const IMAGES = {
  primaryNotes:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85",

  juniorNotes:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=85",

  seniorNotes:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",

  mathematics:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1400&q=85",

  science:
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=85",

  english:
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85",

  computing:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85",

  revision:
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85",

  scienceRevision:
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1400&q=85",

  fullRevision:
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1800&q=90",

  biology:
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1600&q=90",

  mathematicsPractical:
    "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1600&q=90",

  physics:
    "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1600&q=90",

  chemistry:
    "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1600&q=90",
};

/* =========================================================
   RESOURCE DATA
========================================================= */

const RESOURCES = [
  {
    id: "primary-notes",
    title: "Primary Study Notes",
    subtitle: "Primary School",
    description:
      "Clear and simplified learning notes covering important primary school subjects and concepts.",
    type: "notes",
    category: "Primary",
    subject: "Multiple Subjects",
    image: IMAGES.primaryNotes,
    icon: BookOpen,
    gradient: "from-cyan-400 to-blue-600",
    locked: true,
  },

  {
    id: "junior-notes",
    title: "Junior Secondary Study Notes",
    subtitle: "Junior Secondary",
    description:
      "Structured notes designed to help junior secondary students understand their subjects with confidence.",
    type: "notes",
    category: "Junior Secondary",
    subject: "Multiple Subjects",
    image: IMAGES.juniorNotes,
    icon: GraduationCap,
    gradient: "from-blue-400 to-indigo-600",
    locked: true,
  },

  {
    id: "senior-notes",
    title: "Senior Secondary Study Notes",
    subtitle: "Senior Secondary",
    description:
      "Detailed study notes for senior secondary students preparing for stronger academic performance.",
    type: "notes",
    category: "Senior Secondary",
    subject: "Multiple Subjects",
    image: IMAGES.seniorNotes,
    icon: Library,
    gradient: "from-indigo-400 to-purple-600",
    locked: true,
  },

  {
    id: "math-textbook",
    title: "Mathematics Digital Textbook",
    subtitle: "Mathematics",
    description:
      "Build mathematical understanding with structured explanations, examples and guided learning.",
    type: "textbooks",
    category: "Digital Textbook",
    subject: "Mathematics",
    image: IMAGES.mathematics,
    icon: Calculator,
    gradient: "from-cyan-400 to-blue-600",
    locked: true,
  },

  {
    id: "science-textbook",
    title: "Science Digital Textbook",
    subtitle: "Science",
    description:
      "Explore scientific ideas, natural phenomena, experiments and important science concepts.",
    type: "textbooks",
    category: "Digital Textbook",
    subject: "Science",
    image: IMAGES.science,
    icon: FlaskConical,
    gradient: "from-emerald-400 to-cyan-600",
    locked: true,
  },

  {
    id: "english-textbook",
    title: "English Language Digital Textbook",
    subtitle: "English Language",
    description:
      "Improve grammar, vocabulary, comprehension, writing and communication skills.",
    type: "textbooks",
    category: "Digital Textbook",
    subject: "English Language",
    image: IMAGES.english,
    icon: Languages,
    gradient: "from-violet-400 to-indigo-600",
    locked: true,
  },

  {
    id: "computing-textbook",
    title: "Computer Studies Digital Textbook",
    subtitle: "Computer Studies",
    description:
      "Learn computer systems, digital skills, technology and essential computing concepts.",
    type: "textbooks",
    category: "Digital Textbook",
    subject: "Computer Studies",
    image: IMAGES.computing,
    icon: Laptop,
    gradient: "from-sky-400 to-blue-700",
    locked: true,
  },

  {
    id: "revision-pack",
    title: "Study Revision Pack",
    subtitle: "Revision",
    description:
      "A focused collection of revision materials designed to help you review important topics effectively.",
    type: "revision",
    category: "Revision",
    subject: "Multiple Subjects",
    image: IMAGES.revision,
    icon: Target,
    gradient: "from-orange-400 to-red-600",
    locked: true,
  },

  {
    id: "science-revision",
    title: "Science Revision Guide",
    subtitle: "Revision",
    description:
      "Revise key science concepts with organised explanations and topic-focused learning materials.",
    type: "revision",
    category: "Revision",
    subject: "Science",
    image: IMAGES.scienceRevision,
    icon: Microscope,
    gradient: "from-green-400 to-emerald-700",
    locked: true,
  },
];

/* =========================================================
   PRACTICAL LEARNING
========================================================= */

const PRACTICALS = [
  {
    id: "biology",
    title: "Biology",
    subtitle: "Virtual Biology Laboratory",
    description:
      "Explore cells, organisms, living systems and biological processes through practical learning.",
    image: IMAGES.biology,
    icon: Microscope,
    gradient: "from-emerald-400 to-teal-700",
    route: "/virtual-lab",
  },

  {
    id: "mathematics",
    title: "Mathematics",
    subtitle: "Interactive Mathematics",
    description:
      "Work through mathematical concepts using interactive visual learning and guided practice.",
    image: IMAGES.mathematicsPractical,
    icon: Calculator,
    gradient: "from-cyan-400 to-blue-700",
    route: "/academics",
  },

  {
    id: "physics",
    title: "Physics",
    subtitle: "Virtual Physics Laboratory",
    description:
      "Understand forces, motion, energy and physical systems through interactive simulations.",
    image: IMAGES.physics,
    icon: Atom,
    gradient: "from-blue-400 to-indigo-700",
    route: "/virtual-lab",
  },

  {
    id: "chemistry",
    title: "Chemistry",
    subtitle: "Virtual Chemistry Laboratory",
    description:
      "Explore reactions, matter, compounds and chemistry concepts through practical simulations.",
    image: IMAGES.chemistry,
    icon: FlaskConical,
    gradient: "from-violet-400 to-purple-700",
    route: "/virtual-lab",
  },
];

/* =========================================================
   IMAGE COMPONENT
========================================================= */

function ResourceImage({
  src,
  alt,
  type = "notes",
  className = "",
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`relative overflow-hidden ${className} ${
          type === "revision"
            ? "bg-gradient-to-br from-orange-500/30 via-red-600/20 to-slate-950"
            : "bg-gradient-to-br from-cyan-500/30 via-blue-600/20 to-indigo-950"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.25),transparent_35%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(#67e8f9_1px,transparent_1px)] bg-[size:22px_22px] opacity-10" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <BookOpen className="h-9 w-9 text-cyan-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

/* =========================================================
   PRACTICAL IMAGE
========================================================= */

function PracticalImage({
  src,
  alt,
  icon: Icon,
  gradient,
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        <div className="absolute inset-0 bg-[#020617]/35" />

        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-xl">
            <Icon className="h-11 w-11 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Resources() {
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return RESOURCES.filter((resource) => {
      const matchesType =
        activeType === "all" || resource.type === activeType;

      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.subtitle.toLowerCase().includes(query) ||
        resource.subject.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [activeType, search]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-[#020617]/80 px-4 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:px-6">
            <Link
              to="/academy"
              className="group flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl bg-cyan-400/10 blur-lg transition group-hover:bg-cyan-400/20" />

                <img
                  src={Cog}
                  alt="Scholiqen"
                  className="relative h-10 w-10 rounded-xl object-contain"
                />
              </div>

              <div className="hidden sm:block">
                <div className="text-sm font-black tracking-wide text-white">
                  SCHOLIQEN
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Academy
                </div>
              </div>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              <Link
                to="/academy"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Academy
              </Link>

              <Link
                to="/academics"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Academics
              </Link>

              <Link
                to="/resources"
                className="rounded-xl bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300"
              >
                Resources
              </Link>

              <Link
                to="/community"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Community
              </Link>

              <Link
                to="/our-story"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                OurStory
              </Link>
            </div>

            <Link
              to="/academy/student-enrollment-login"
              className="group hidden items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] md:flex"
            >
              Enroll Now
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </nav>
        </div>
      </header>
{/* =========================================================
    RESOURCES HERO
========================================================= */}
<section className="relative flex min-h-[720px] items-center overflow-hidden pt-24">

  {/* =======================================================
      HERO IMAGE
  ======================================================= */}
  <div className="absolute inset-0">

    <img
      src={heroImage}
      alt="Scholiqen learning resources"
      className="h-full w-full object-cover object-center"
    />

    {/* Soft overall darkening */}
    <div className="absolute inset-0 bg-[#020617]/25" />

    {/* Cinematic left-to-right gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/55 to-[#020617]/30" />

    {/* Bottom fade */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/30" />

    {/* Very subtle dotted texture */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.045]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(103, 232, 249, 0.9) 0.6px, transparent 0.6px)",
        backgroundSize: "30px 30px",
      }}
    />
  </div>

  {/* =======================================================
      SOFT CYAN GLOW
  ======================================================= */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.5 }}
    className="pointer-events-none absolute left-[-180px] top-[15%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]"
  />

  {/* =======================================================
      SOFT BLUE GLOW
  ======================================================= */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.8, delay: 0.2 }}
    className="pointer-events-none absolute bottom-[-150px] right-[-100px] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px]"
  />

  {/* =======================================================
      CONTENT
  ======================================================= */}
  <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

    <div className="max-w-3xl">

      {/* ---------------------------------------------------
          EYEBROW
      --------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 backdrop-blur-md"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
        </span>

        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Scholiqen Resources
        </span>
      </motion.div>

      {/* ---------------------------------------------------
          MAIN HEADING
      --------------------------------------------------- */}
      <motion.h1
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Everything You Need
        <br />

        <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
          To Learn Better.
        </span>
      </motion.h1>

      {/* ---------------------------------------------------
          DESCRIPTION
      --------------------------------------------------- */}
      <motion.p
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
      >
        Explore carefully organised study notes, digital textbooks,
        practical learning materials and revision resources designed
        to help you understand more, practise better and prepare with
        confidence.
      </motion.p>

      {/* ---------------------------------------------------
          ACTIONS
      --------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mt-9 flex flex-col gap-3 sm:flex-row"
      >

        <a
          href="#resources"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/30"
        >
          Explore Resources

          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>

        <a
          href="#study-notes"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.08]"
        >
          <BookOpen size={18} className="text-cyan-300" />
          Browse Study Notes
        </a>

      </motion.div>

      {/* ---------------------------------------------------
          SMALL TRUST / INFO ROW
      --------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.65 }}
        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-cyan-400" />
          Curriculum-focused materials
        </div>

        <div className="hidden h-4 w-px bg-white/10 sm:block" />

        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-cyan-400" />
          Primary to Senior Secondary
        </div>

        <div className="hidden h-4 w-px bg-white/10 sm:block" />

        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-cyan-400" />
          Learn at your own pace
        </div>
      </motion.div>

    </div>
  </div>

  {/* =======================================================
      BOTTOM FADE / TRANSITION
  ======================================================= */}
  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />

  {/* =======================================================
      SUBTLE FLOATING LIGHT
  ======================================================= */}
  <motion.div
    animate={{
      y: [0, -12, 0],
      opacity: [0.15, 0.25, 0.15],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="pointer-events-none absolute right-[15%] top-[25%] hidden h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl lg:block"
  />

</section>
      {/* =====================================================
          ENROLLMENT BANNER
      ====================================================== */}

      <section className="relative border-y border-white/5 bg-[#020617] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.05] to-transparent p-7 sm:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-[90px]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-cyan-300">
                  <CheckCircle2 className="h-5 w-5" />
                  For Enrolled Students
                </div>

                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Learn with resources built around your journey.
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Enrol in Scholiqen Academy to unlock your study
                  materials, digital textbooks, revision resources and
                  practical learning environment.
                </p>
              </div>

              <Link
                to="/academy/student-enrollment-login"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-slate-950 transition hover:-translate-y-0.5"
              >
                Get Student Access
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESOURCE LIBRARY
      ====================================================== */}

      <section
        id="resources"
        className="relative bg-[#020617] py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
                <Library className="h-4 w-4" />
                Resource Library
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                A few good resources to get you started.
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Start with carefully selected learning materials and
                unlock full access when you enrol.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-12 pr-11 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-slate-600 focus:border-cyan-400/30 focus:bg-white/[0.06]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-10 flex flex-wrap gap-2">
            {RESOURCE_TYPES.map((type) => {
              const active = activeType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setActiveType(type.id)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Resource cards */}
          {filteredResources.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource, index) => {
                const Icon = resource.icon;

                return (
                  <motion.article
                    key={resource.id}
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.15,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.05,
                    }}
                    className="group overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.035] shadow-xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <ResourceImage
                        src={resource.image}
                        alt={resource.title}
                        type={resource.type}
                        className="transition duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/15 to-transparent" />

                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xl">
                        <Icon className="h-3.5 w-3.5 text-cyan-300" />
                        {resource.category}
                      </div>

                      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-xl">
                        <Lock className="h-3.5 w-3.5 text-cyan-300" />
                        Enrolled Access
                      </div>

                      <div className="absolute bottom-4 left-5 right-5">
                        <div className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                          {resource.subtitle}
                        </div>

                        <h3 className="text-xl font-black text-white">
                          {resource.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="min-h-[72px] text-sm leading-6 text-slate-400">
                        {resource.description}
                      </p>

                      <Link
                        to="/academy/student-enrollment-login"
                        className="group/btn mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white transition hover:border-cyan-400/20 hover:bg-cyan-400/5"
                      >
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-cyan-300" />
                          Enroll to Access
                        </span>

                        <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover/btn:translate-x-1 group-hover/btn:text-cyan-300" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-[26px] border border-white/10 bg-white/[0.03] p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-600" />

              <h3 className="mt-5 text-xl font-black text-white">
                No resource found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search or resource category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          FULL REVISION ACCESS
      ====================================================== */}

      <section className="relative bg-[#020617] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="group relative min-h-[360px] overflow-hidden rounded-[32px] border border-orange-400/10">
            <ResourceImage
              src={IMAGES.fullRevision}
              alt="Full revision access"
              type="revision"
              className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/80 to-[#020617]/45" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />

            <div className="relative flex min-h-[360px] items-center p-7 sm:p-10 lg:p-14">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-orange-200">
                  <Zap className="h-4 w-4" />
                  Full Revision
                </div>

                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Get access to full revision.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-slate-300">
                  Unlock the complete revision environment with more
                  organised materials to help you prepare, review and
                  strengthen what you have learned.
                </p>

                <Link
                  to="/academy/student-enrollment-login"
                  className="group/cta mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-slate-950 transition hover:-translate-y-0.5"
                >
                  Enroll for Full Access
                  <ArrowRight className="h-5 w-5 transition group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRACTICAL LEARNING
      ====================================================== */}

      <section className="relative bg-[#020617] py-24">
        <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
              <FlaskConical className="h-4 w-4" />
              Practical Learning
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Don't just read it.
              <br />
              <span className="text-cyan-300">
                Experience it.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl leading-7 text-slate-400">
              Turn concepts into understanding with interactive
              practical experiences across Biology, Mathematics,
              Physics and Chemistry.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {PRACTICALS.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.06,
                  }}
                >
                  <Link
                    to={item.route}
                    className="group relative block min-h-[330px] overflow-hidden rounded-[28px] border border-white/10"
                  >
                    <PracticalImage
                      src={item.image}
                      alt={item.title}
                      icon={Icon}
                      gradient={item.gradient}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/55 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl">
                          <Icon className="h-5 w-5 text-cyan-300" />
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-xl transition group-hover:bg-cyan-400 group-hover:text-slate-950">
                          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      <div className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-300">
                        {item.subtitle}
                      </div>

                      <h3 className="mt-1 text-2xl font-black text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-white">
                        Explore Practical
                        <ChevronRight className="h-4 w-4 text-cyan-300 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="border-y border-white/5 bg-[#030712] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-3 flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
              <Brain className="h-4 w-4" />
              Learn Better
            </div>

            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Resources that support your learning.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Find",
                text: "Discover materials that match the subject and topic you are studying.",
              },
              {
                icon: BookOpen,
                title: "Learn",
                text: "Use clear notes and digital textbooks to build stronger understanding.",
              },
              {
                icon: Target,
                title: "Apply",
                text: "Take your learning further through revision and practical experiences.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
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
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="rounded-[24px] border border-white/10 bg-white/[0.025] p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#020617] py-24">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <GraduationCap className="h-8 w-8 text-cyan-300" />
          </div>

          <h2 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-5xl">
            More than resources.
            <br />
            <span className="text-cyan-300">
              A complete learning environment.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Enrol with Scholiqen Academy and get access to a learning
            environment designed to help you understand, practise and
            progress.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/academy/student-enrollment-login"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5"
            >
              Enroll Now
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/academics"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-3.5 font-bold text-white transition hover:bg-white/[0.07]"
            >
              Explore Academics
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-white/5 bg-[#01040b] py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={Cog}
              alt="Scholiqen"
              className="h-10 w-10 rounded-xl object-contain"
            />

            <div>
              <div className="font-black text-white">
                SCHOLIQEN
              </div>

              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Academy
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            <Link
              to="/academy"
              className="transition hover:text-cyan-300"
            >
              Academy
            </Link>

            <Link
              to="/academics"
              className="transition hover:text-cyan-300"
            >
              Academics
            </Link>

            <Link
              to="/resources"
              className="text-cyan-300"
            >
              Resources
            </Link>

            <Link
              to="/community"
              className="transition hover:text-cyan-300"
            >
              Community
            </Link>

            <Link
              to="/OurStory"
              className="transition hover:text-cyan-300"
            >
            OurStory
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/5 px-4 pt-6 text-center text-xs text-slate-600 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Scholiqen Academy. Learn. Practise. Progress.
        </div>
      </footer>
    </div>
  );
}