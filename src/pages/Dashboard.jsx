// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
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
  Newspaper,
  Calendar,
  Brain,
  Sparkles,
} from "lucide-react";

/* =========================================================
   DASHBOARD CARD
========================================================= */
const Card = ({ title, description, bgImage, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="group relative h-72 cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
    >
      <img
        src={bgImage}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <h2 className="text-2xl font-black text-white">{title}</h2>
        <p className="mt-3 leading-7 text-white/75">{description}</p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   AI CARD
========================================================= */
const AITutorCard = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="group relative flex h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-8 text-white shadow-2xl"
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        className="absolute -right-20 -top-20 h-52 w-52 rounded-full border border-white/10"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <Brain size={52} />
      </motion.div>
      <h2 className="mt-6 text-3xl font-black">Scholiqen AI</h2>
      <p className="mt-4 max-w-xs text-center leading-7 text-white/90">
        Learn faster with AI explanations, multilingual translation, homework help,
        quizzes, summaries, grammar correction and personalized tutoring.
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-bold backdrop-blur-xl">
        <Sparkles size={16} />
        Powered by AI
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
  const [progress] = useState(0);

  const newsList = [
    {
      title: "National Education Update",
      body: "Schools are adopting improved digital learning systems.",
      source: "Ministry of Education",
    },
    {
      title: "CBT System Upgrade",
      body: "Faster loading speed and better exam stability.",
      source: "Exams Board",
    },
    {
      title: "Reading Culture Boost",
      body: "Students should read at least 2 hours daily.",
      source: "Education Council",
    },
  ];

  const [newsIndex, setNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentNews = newsList[newsIndex];

  return (
    <section className="min-h-screen bg-[#070b14] px-8 py-10 text-white">
      {/* =========================================================
          LEARNING PROGRESS
      ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black">Welcome Back 👋</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Continue your learning journey across courses, multilingual lessons,
              virtual laboratories, AI tutoring, novels and CBT practice.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/15 px-6 py-4">
            <p className="text-sm text-cyan-300">Overall Progress</p>
            <h2 className="mt-1 text-4xl font-black">{progress}%</h2>
          </div>
        </div>

        <div className="mt-8 h-4 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2 }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
          />
        </div>
      </motion.div>

      {/* =========================================================
          DASHBOARD MODULES
      ========================================================= */}
      <div className="mb-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        <Card
          title="LMS Portal"
          description="Courses, study materials, quizzes, assignments and certificates."
          bgImage={lms}
          onClick={() => navigate("/lms")}
        />
        <Card
          title="Multilingual Hub"
          description="Learn over 100+ world languages, translate instantly, improve pronunciation and master grammar."
          bgImage={multilingual}
          onClick={() => navigate("/languages")}
        />
        <Card
          title="Virtual Laboratory"
          description="Perform interactive science experiments and simulations."
          bgImage={virtual}
          onClick={() => navigate("/lab")}
        />
        <Card
          title="Novel Library"
          description="Read inspiring books, stories and literature from around the world."
          bgImage={novel}
          onClick={() => navigate("/novels")}
        />
        <Card
          title="CBT Practice"
          description="Prepare for examinations with realistic computer-based tests."
          bgImage={cbt}
          onClick={() => navigate("/cbt")}
        />
        <AITutorCard onClick={() => navigate("/ai-tutor")} />
      </div>

      {/* =========================================================
          SCHOOL NEWS
      ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 rounded-3xl border border-white/10 bg-slate-900/70 p-8 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Newspaper size={24} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black">School News</h2>
            <p className="text-slate-400">Stay updated with the latest announcements.</p>
          </div>
        </div>

        <motion.div
          key={newsIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-xl font-bold text-white">{currentNews.title}</h3>
          <p className="mt-4 leading-8 text-slate-400">{currentNews.body}</p>
          <p className="mt-5 text-sm text-cyan-400">{currentNews.source}</p>
        </motion.div>
      </motion.div>

      {/* =========================================================
          CALENDAR
      ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 rounded-3xl border border-white/10 bg-slate-900/70 p-8 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10">
            <Calendar size={24} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black">My Calendar</h2>
            <p className="text-slate-400">Organize your learning schedule.</p>
          </div>
        </div>

        <MyCalendar events={events} setEvents={setEvents} />
      </motion.div>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-white/10 pt-12 text-center">
        <h2 className="text-3xl font-black text-white">Learn Beyond Limits</h2>
        <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-400">
          Scholiqen combines courses, AI tutoring, multilingual learning, virtual laboratories,
          CBT practice, digital libraries and powerful educational tools into one intelligent platform
          built for learners around the world.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-8 text-slate-400">
          <button className="transition hover:text-white">Help</button>
          <button className="transition hover:text-white">Contact</button>
          <button className="transition hover:text-white">Privacy</button>
          <button className="transition hover:text-white">Terms</button>
        </div>

        <p className="mt-12 text-sm text-slate-500">
          © 2026 Scholiqen. Empowering learners worldwide.
        </p>
      </footer>
    </section>
  );
};

export default Dashboard;