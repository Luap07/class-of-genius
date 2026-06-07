import React, { useState, useEffect, useRef } from "react";
import MyCalendar from "../components/MyCalendar";
import {
  cbt,
  adventure,
  lms,
  novel,
  curriculum,
  live,
} from "../assets";
import { Newspaper, Calendar } from "lucide-react";

/* ================= CARD ================= */
const CardDropdown = ({
  title,
  bgImage,
  actionText,
  isInsight = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl h-72 flex flex-col justify-end p-6 text-white">
      <div className="absolute inset-0">
        <img
          src={isInsight ? adventure : bgImage}
          className="w-full h-full object-cover"
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
      </div>

      <div className="relative z-10">
        <h3 className="font-bold text-xl">{title}</h3>

        {isOpen && (
          <p className="text-sm text-gray-200 mt-1">
            {title} details here...
          </p>
        )}

        {isInsight ? (
          <button
            onClick={() =>
              alert("Education is the foundation of every skill you build.")
            }
            className="mt-3 text-sm underline"
          >
            View Insight Comment
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm mt-3"
          >
            {isOpen ? "Close ↑" : actionText + " ↓"}
          </button>
        )}
      </div>
    </div>
  );
};

/* ================= DASHBOARD ================= */
const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [newsIndex, setNewsIndex] = useState(0);

  const faqRef = useRef(null); // ✅ IMPORTANT FIX

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
    {
      title: "Tech in Learning",
      body: "AI tools now introduced in classrooms.",
      source: "EdTech Board",
    },
    {
      title: "National Performance Report",
      body: "Improved academic performance recorded.",
      source: "Research Unit",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsList.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const currentNews = newsList[newsIndex];

  return (
    <section className="p-8">

      {/* STATUS */}
      <div className="bg-white p-6 rounded-xl border mb-8">
        <h2 className="text-xl font-bold">Learning Status</h2>
        <p className="text-gray-600">
          You are building consistency step by step.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <CardDropdown title="LMS Portal" bgImage={lms} actionText="View" />
        <CardDropdown title="Curriculum" bgImage={curriculum} actionText="View" />
        <CardDropdown title="Live Class" bgImage={live} actionText="Join" />
        <CardDropdown title="Novel" bgImage={novel} actionText="Read" />
        <CardDropdown title="CBT Test" bgImage={cbt} actionText="Start" />
        <CardDropdown title="Adventure" isInsight />
      </div>

      {/* NEWS */}
      <div className="relative overflow-hidden rounded-2xl mb-10 p-6 h-64 border shadow-sm bg-[#f7f1e3]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fffaf0] via-[#f7f1e3] to-white opacity-90" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 text-gray-800">
            <Newspaper size={20} />
            <h2 className="font-bold text-lg">
              National School News
            </h2>
          </div>

          <h3 className="font-semibold text-gray-900 text-lg mb-2">
            {currentNews.title}
          </h3>

          <p className="text-gray-700 text-sm mb-3">
            {currentNews.body}
          </p>

          <p className="text-xs text-gray-500">
            Source: {currentNews.source}
          </p>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="bg-white p-4 rounded-xl border h-[420px] mb-10">
        <Calendar />
        <MyCalendar events={events} setEvents={setEvents} />
      </div>

      {/* ================= FAQ (FIXED) ================= */}
      <div
        ref={faqRef}
        id="faq-section"
        className="scroll-mt-24 mt-10 border-t pt-6 grid md:grid-cols-3 gap-6"
      >
        <div>
          <h2 className="font-bold mb-3">FAQs</h2>

          <p className="font-medium">Why study daily?</p>
          <p className="text-sm text-gray-500 mb-3">
            Because consistency builds mastery in learning.
          </p>

          <p className="font-medium">How to improve fast?</p>
          <p className="text-sm text-gray-500">
            Practice daily and revise consistently.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">
            Do I need to study long hours?
          </h3>
          <p className="text-sm text-gray-600">
            No — consistency matters more than long hours.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">
            Can I use this platform daily?
          </h3>
          <p className="text-sm text-gray-600">
            Yes — it is designed for daily learning and tracking.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-16 border-t pt-10 text-center text-sm text-gray-600 space-y-4">
        <div className="flex justify-center gap-8">
          <a href="#help" className="hover:underline">Help</a>
          <a href="#privacy" className="hover:underline">Privacy</a>
          <a href="#contact" className="hover:underline">Contact Us</a>
        </div>

        <p className="italic text-gray-700 max-w-xl mx-auto">
          Mastering these concepts today is the foundation
          for the software you'll build tomorrow.
        </p>

        <p className="text-xs text-gray-500">
          © 2026 ClassOfGenius Prime. All rights reserved.
        </p>
      </footer>

    </section>
  );
};

export default Dashboard;