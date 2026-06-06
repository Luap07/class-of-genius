import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import MyCalendar from "../components/MyCalendar";
import { cbt, adventure, lms, novel, curriculum, live } from "../assets";
import { Newspaper, Calendar } from "lucide-react";

/* ================= CARD ================= */
const CardDropdown = ({ title, bgImage, actionText, isInsight = false }) => {
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

  /* ================= NEWS ================= */
  const newsList = [
    {
      title: "National Education Update",
      body: "Schools across the country are adopting improved digital learning systems to enhance student performance.",
      source: "Ministry of Education",
    },
    {
      title: "CBT System Upgrade",
      body: "The CBT platform has been upgraded with faster loading speed and better exam stability.",
      source: "Exams Board",
    },
    {
      title: "Reading Culture Boost",
      body: "Students are encouraged to spend at least 2 hours daily on structured reading programs.",
      source: "Education Council",
    },
    {
      title: "Tech in Learning",
      body: "AI-powered tools are now being introduced into classrooms for smarter learning experiences.",
      source: "EdTech Board",
    },
    {
      title: "National Performance Report",
      body: "Recent reports show improved academic performance due to consistent study habits.",
      source: "Research Unit",
    },
  ];

  const [newsIndex, setNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsList.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      <Sidebar />

      <main className="flex-1 overflow-y-auto">

        {/* HEADER */}
        <DashboardHeader />

        {/* ================= BODY ================= */}
        <section className="p-8">

          {/* STATUS */}
          <div className="bg-white p-6 rounded-xl border mb-8">
            <h2 className="text-xl font-bold">
              Learning Status
            </h2>
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

          {/* ================= CREAM DETAILED NEWS ================= */}
          <div className="relative overflow-hidden rounded-2xl mb-10 p-6 h-64 border shadow-sm bg-[#f7f1e3]">

            {/* soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fffaf0] via-[#f7f1e3] to-white opacity-90" />

            <div className="relative z-10">

              <div className="flex items-center gap-2 mb-3 text-gray-800">
                <Newspaper size={20} />
                <h2 className="font-bold text-lg">
                  National School News
                </h2>
              </div>

              {/* MAIN NEWS */}
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {newsList[newsIndex].title}
              </h3>

              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                {newsList[newsIndex].body}
              </p>

              <p className="text-xs text-gray-500 mb-4">
                Source: {newsList[newsIndex].source}
              </p>

              {/* DOT INDICATOR */}
              <div className="flex gap-2">
                {newsList.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === newsIndex
                        ? "bg-gray-800 scale-125"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* CALENDAR */}
          <div className="bg-white p-4 rounded-xl border h-[420px] mb-10">
            <Calendar />
            <MyCalendar events={events} setEvents={setEvents} />
          </div>

          {/* FAQ */}
          <div id="faq-section" className="mt-10 border-t pt-6">
            <h2 className="font-bold">FAQs</h2>

            <p>Why study daily?</p>
            <p className="text-sm text-gray-500">
              Because consistency builds mastery in learning.
            </p>

            <p>How to improve fast?</p>
            <p className="text-sm text-gray-500">
              Practice daily and revise consistently.
            </p>
          </div>

          {/* FOOTER */}
          <footer className="mt-16 border-t pt-10 text-center text-sm text-gray-600 space-y-4">

            <div className="flex justify-center gap-8">
              <a href="#help" className="hover:underline">Help</a>
              <a href="#privacy" className="hover:underline">Privacy</a>
              <a href="#contact" className="hover:underline">Contact Us</a>
            </div>

            <p className="italic text-gray-700 max-w-xl mx-auto">
              Mastering these concepts today is the foundation for the software you’ll build tomorrow.
            </p>

            <p className="text-xs text-gray-500">
              © 2026 ClassOfGenius Prime. All rights reserved.
            </p>

          </footer>

        </section>

      </main>
    </div>
  );
};

export default Dashboard;