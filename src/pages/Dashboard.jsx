import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MyCalendar from "../components/MyCalendar";
import {
  cbt,
  adventure,
  lms,
  novel,
  My_School_Calendar,
  live,
} from "../assets";
import { Newspaper, Calendar, Brain } from "lucide-react";

/* ================= CARD ================= */
const Card = ({ title, bgImage, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-2xl h-72 flex items-end p-6 text-white border border-white/10 shadow-xl"
    >
      <img
        src={bgImage}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10">
        <h3 className="font-bold text-xl">{title}</h3>
        <p className="text-sm text-white/70">Click to open</p>
      </div>
    </motion.div>
  );
};

/* ================= AI TUTOR CARD ================= */
const AITutorCard = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative cursor-pointer rounded-2xl h-72 flex flex-col justify-center items-center text-white bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl"
    >
      <Brain size={40} />
      <h2 className="font-bold text-xl mt-3">AI Tutor</h2>
      <p className="text-sm text-white/80 mt-2 text-center">
        Start studying with AI guidance
      </p>
    </motion.div>
  );
};

/* ================= DASHBOARD ================= */
const Dashboard = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [progress, setProgress] = useState(0); // ✅ RESTORED PROGRESS
  const [newsIndex, setNewsIndex] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((p) => (p + 1) % newsList.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const currentNews = newsList[newsIndex];

  return (
    <section className="min-h-screen px-8 py-10 text-white bg-[#070b14]">

      {/* ================= PROGRESS (RESTORED) ================= */}
      <div className="p-6 rounded-2xl border border-white/10 bg-black/40 mb-8">
        <h2 className="text-xl font-bold">Learning Progress</h2>
        <p className="text-gray-300">
          Your study progress updates as you interact with modules.
        </p>

        <div className="w-full h-3 bg-white/10 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-blue-300 mt-2">
          {progress}% completed
        </p>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <Card title="LMS Portal" bgImage={lms} onClick={() => navigate("/libraries")} />

        <Card title="My School Calendar" bgImage={My_School_Calendar} onClick={() => navigate("/calendar")} />

        <Card title="Live Class" bgImage={live} onClick={() => navigate("/live")} />

        <Card title="Novel Library" bgImage={novel} onClick={() => navigate("/novel")} />

        <Card title="CBT Test" bgImage={cbt} onClick={() => navigate("/cbt")} />

        <AITutorCard onClick={() => navigate("/ai-tutor")} />

      </div>

      {/* ================= NEWS ================= */}
      <div className="p-6 rounded-2xl border border-white/10 bg-black/40 mb-10">

        <div className="flex items-center gap-2 mb-3">
          <Newspaper size={18} />
          <h2 className="font-bold">School News</h2>
        </div>

        <h3 className="font-semibold text-lg">{currentNews.title}</h3>
        <p className="text-gray-300">{currentNews.body}</p>
        <p className="text-xs text-gray-500 mt-2">{currentNews.source}</p>

      </div>

      {/* ================= CALENDAR ================= */}
      <div className="p-6 rounded-2xl border border-white/10 bg-black/40 mb-12">

        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} />
          <h2 className="font-bold">My School Calendar</h2>
        </div>

        <MyCalendar events={events} setEvents={setEvents} />
      </div>

      {/* ================= FAQ (RESTORED EXACT STRUCTURE) ================= */}
      <div className="border-t border-white/10 pt-10 grid md:grid-cols-3 gap-6">

        <div>
          <h2 className="font-bold mb-3">FAQs</h2>

          <p className="font-medium">Why study daily?</p>
          <p className="text-gray-400 text-sm mb-3">
            Consistency builds mastery over time.
          </p>

          <p className="font-medium">How to improve fast?</p>
          <p className="text-gray-400 text-sm">
            Practice and revision daily.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <h3 className="font-semibold mb-2">
            Do I need long hours?
          </h3>
          <p className="text-gray-400 text-sm">
            No — smart consistency beats long hours.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <h3 className="font-semibold mb-2">
            Can I use daily?
          </h3>
          <p className="text-gray-400 text-sm">
            Yes — designed for daily learning.
          </p>
        </div>

      </div>

      {/* ================= FOOTER (FULL RESTORED + YOUR QUOTE BACK) ================= */}
      <footer className="mt-20 border-t border-white/10 pt-10 text-center text-gray-400">

        <div className="flex justify-center gap-8 mb-6">
          <a className="hover:text-white transition">Help</a>
          <a className="hover:text-white transition">Privacy</a>
          <a className="hover:text-white transition">Contact</a>
        </div>

        {/* 🔥 YOUR ORIGINAL QUOTE RESTORED */}
        <p className="italic text-gray-300 mb-4">
          Mastering these concepts today is the foundation for the software you'll build tomorrow.
        </p>

        <p className="text-xs text-gray-500">
          © 2026 ClassOfGenius Prime. All rights reserved.
        </p>

      </footer>

    </section>
  );
};

export default Dashboard;