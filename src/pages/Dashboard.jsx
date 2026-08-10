import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MyCalendar from "../components/MyCalendar";

import {
  cbt,
  lms,
  novel,
  multilingual,
  virtual,
} from "../assets";

import {
  Calendar,
  Sparkles,
  BookOpen,
  GraduationCap,
  School,
  Wrench,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   PREMIUM DASHBOARD CARD
========================================================= */

const Card = ({
  title,
  description,
  bgImage,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      onClick={onClick}
      className="group relative h-72 cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
    >
      {/* =================================================
          SHARP BACKGROUND IMAGE
      ================================================= */}

      {bgImage && (
        <img
          src={bgImage}
          alt={title}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          style={{
            imageRendering: "auto",
          }}
        />
      )}

      {/* Image Contrast */}
      <div className="absolute inset-0 bg-slate-950/20" />

      {/* Premium Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/5" />

      {/* Subtle Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-transparent to-blue-500/0 transition duration-500 group-hover:from-cyan-400/10 group-hover:to-blue-500/10" />

      {/* =================================================
          CARD CONTENT
      ================================================= */}

      <div className="absolute inset-x-0 bottom-0 z-10 p-7">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-black tracking-tight text-white">
              {title}
            </h3>

            <p className="mt-2 truncate text-sm font-medium text-slate-300">
              {description}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:bg-cyan-400 group-hover:text-slate-950">
            <ArrowUpRight size={19} />
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="mt-5 h-px w-full bg-white/10">
          <div className="h-full w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   AI TUTOR CARD
========================================================= */

const AITutorCard = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      onClick={onClick}
      className="group relative flex h-72 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-7 text-white shadow-2xl"
    >
      {/* Decorative Shapes */}

      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10"
      />

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }}
        className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-white/5 blur-3xl"
      />

      {/* Top */}

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
          <Sparkles size={28} />
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition duration-300 group-hover:bg-white group-hover:text-blue-600">
          <ArrowUpRight size={18} />
        </div>
      </div>

      {/* Content */}

      <div className="relative z-10">
        <h3 className="text-2xl font-black tracking-tight">
          Scholiqen AI
        </h3>

        <p className="mt-2 truncate text-sm font-medium text-blue-50">
          Intelligent tutoring, explanations, translation and personalized learning.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md">
          Powered by AI
          <ChevronRight size={13} />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   EXPLORE SCHOOLS CARD
========================================================= */

const SchoolTypeCard = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-2xl"
    >
      {/* Background Glow */}

      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/20" />

      <div className="absolute bottom-0 left-0 h-1 w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />

      <div className="relative z-10">
        {/* Icon + Arrow */}

        <div className="flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400 backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-cyan-400/10">
            <Icon size={31} strokeWidth={1.8} />
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition duration-300 group-hover:bg-cyan-400 group-hover:text-slate-950">
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* Title */}

        <h3 className="mt-7 text-2xl font-black tracking-tight text-white">
          {title}
        </h3>

        {/* ONE LINE DESCRIPTION */}

        <p className="mt-2 truncate text-sm font-medium text-slate-400">
          {description}
        </p>

        {/* Action */}

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
          Explore
          <ChevronRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      {/* =================================================
          PREMIUM WELCOME HERO
      ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 p-7 shadow-2xl sm:p-10"
      >
        {/* Decorative Background */}

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_35%)]" />

        <div className="relative z-10">
          {/* Small Label */}

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Your Learning Space
          </div>

          {/* Welcome */}

          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Welcome Back
            <span className="ml-2 text-cyan-400">👋</span>
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
            Everything you need to learn, practice, explore and grow is right here.
          </p>

          {/* Quick Actions */}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/lms")}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Start Learning
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={() => navigate("/cbt")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/10"
            >
              Practice CBT
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* =================================================
          SIX MAIN LEARNING MODULES
      ================================================= */}

      <div className="mb-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">

        {/* 1. LMS */}

        <Card
          title="LMS Portal"
          description="Courses, materials, quizzes and certificates."
          bgImage={lms}
          onClick={() => navigate("/lms")}
        />

        {/* 2. Languages */}

        <Card
          title="Multilingual Hub"
          description="Learn languages, pronunciation, grammar and vocabulary."
          bgImage={multilingual}
          onClick={() => navigate("/languages")}
        />

        {/* 3. Virtual Lab */}

        <Card
          title="Virtual Laboratory"
          description="Explore interactive experiments and science simulations."
          bgImage={virtual}
          onClick={() => navigate("/lab")}
        />

        {/* 4. Novels */}

        <Card
          title="Novel Library"
          description="Read stories, novels and inspiring literature worldwide."
          bgImage={novel}
          onClick={() => navigate("/novels")}
        />

        {/* 5. CBT */}

        <Card
          title="CBT Practice"
          description="Prepare for examinations with realistic CBT practice."
          bgImage={cbt}
          onClick={() => navigate("/cbt")}
        />

        {/* 6. AI */}

        <AITutorCard
          onClick={() => navigate("/ai-tutor")}
        />
      </div>

      {/* =================================================
          EXPLORE SCHOOLS
      ================================================= */}

      <motion.div
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
        }}
        transition={{
          duration: 0.6,
        }}
        className="mb-14 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
      >
        {/* Header */}

        <div className="mb-9 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
            <GraduationCap
              size={29}
              className="text-cyan-400"
              strokeWidth={1.8}
            />
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Explore Schools
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Discover universities, colleges and polytechnics and explore what they offer.
          </p>
        </div>

        {/* School Categories */}

        <div className="grid gap-6 md:grid-cols-3">

          {/* Universities */}

          <SchoolTypeCard
            title="Universities"
            description="Explore universities, programs, faculties and admission opportunities."
            icon={GraduationCap}
            onClick={() => navigate("/universities")}
          />

          {/* Colleges */}

          <SchoolTypeCard
            title="Colleges"
            description="Discover colleges, courses, programs and admission opportunities."
            icon={School}
            onClick={() => navigate("/colleges")}
          />

          {/* Polytechnics */}

          <SchoolTypeCard
            title="Polytechnics"
            description="Explore technical programs, courses and admission opportunities."
            icon={Wrench}
            onClick={() => navigate("/polytechnics")}
          />
        </div>
      </motion.div>

      {/* =================================================
          PERSONAL CALENDAR
      ================================================= */}

      <motion.div
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
        }}
        transition={{
          duration: 0.6,
        }}
        className="mb-16 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
      >
        <div className="mb-7 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-400/10">
            <Calendar
              size={23}
              className="text-violet-400"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              My Calendar
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Organize your personal learning schedule.
            </p>
          </div>
        </div>

        <MyCalendar
          events={events}
          setEvents={setEvents}
        />
      </motion.div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-white/10 pt-12 text-center">
        <h2 className="text-3xl font-black text-white">
          Learn Beyond Limits
        </h2>

        <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-400">
          Scholiqen brings learning, AI tutoring,
          multilingual education, virtual laboratories,
          CBT practice and digital libraries together
          in one intelligent platform.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-8 text-slate-400">
  <button
    onClick={() => navigate("/help")}
    className="transition hover:text-white"
  >
    Help
  </button>

  <button
    onClick={() => navigate("/contact")}
    className="transition hover:text-white"
  >
    Contact
  </button>

  <button
    onClick={() => navigate("/privacy")}
    className="transition hover:text-white"
  >
    Privacy
  </button>

  <button
    onClick={() => navigate("/terms")}
    className="transition hover:text-white"
  >
    Terms
  </button>
</div>
        <p className="mt-12 text-sm text-slate-500">
          © 2026 Scholiqen. Empowering learners worldwide.
        </p>
      </footer>
    </section>
  );
};

export default Dashboard;

