// src/pages/Curriculum.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";

// Layout
import CurriculumSidebar from "../components/curriculum/CurriculumSidebar";
import CurriculumHeader from "../components/curriculum/CurriculumHeader";

// Sections
import FeaturedCurricula from "../components/curriculum/FeaturedCurricula";
import PopularSubjects from "../components/curriculum/PopularSubjects";
import GlobalStatistics from "../components/curriculum/GlobalStatistics";
import WhyChooseUs from "../components/curriculum/WhyChooseUs";
import PartnersSection from "../components/curriculum/PartnersSection";
import Testimonials from "../components/curriculum/Testimonials";
import FAQ from "../components/curriculum/FAQ";
import CallToAction from "../components/curriculum/CallToAction";
import CurriculumFooter from "../components/curriculum/CurriculumFooter";

// Assets
import worldMap from "../assets/world-map.png";

const Curriculum = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [sidebarOpen]);

  const continents = useMemo(
    () => [
      { title: "Africa", countries: 54, color: "from-green-500 to-emerald-600" },
      { title: "Europe", countries: 44, color: "from-blue-500 to-indigo-600" },
      { title: "Asia", countries: 48, color: "from-orange-500 to-red-500" },
      { title: "North America", countries: 23, color: "from-cyan-500 to-blue-600" },
      { title: "South America", countries: 12, color: "from-pink-500 to-rose-600" },
      { title: "Oceania", countries: 14, color: "from-purple-500 to-violet-600" },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* BACKDROP for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Hidden on mobile (default), visible on LG screens and up */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <CurriculumSidebar
          active={active}
          setActive={setActive}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <CurriculumHeader />

        {/* MOBILE MENU TOGGLE: Visible only on smaller screens */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-5 left-4 z-40 lg:hidden bg-slate-900 border border-slate-700 rounded-xl p-2 hover:border-cyan-500 transition"
          >
            <Menu size={24} />
          </button>
        )}

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* HERO SECTION */}
          <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900">
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[length:22px_22px]" />
            <div className="relative grid lg:grid-cols-2 gap-14 items-center p-8 sm:p-12 lg:p-16">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 text-xs font-semibold tracking-widest">
                  🌍 GLOBAL EDUCATION PLATFORM
                </span>
                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
                  One Platform.<br />
                  <span className="text-cyan-400">Every Curriculum.</span>
                </h1>
                <p className="mt-6 text-slate-400 text-lg max-w-xl">
                  Explore global education systems, compare curricula, 
                  simulate labs, and learn with AI-powered tutoring.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <button className="px-7 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-bold">
                    Explore Curriculum
                  </button>
                  <button className="px-7 py-3.5 rounded-2xl border border-slate-700 hover:border-slate-500 transition">
                    Browse Countries
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <img src={worldMap} alt="World Map" className="max-w-3xl" />
              </div>
            </div>
          </section>

          {/* OTHER SECTIONS */}
          <div className="mt-24 grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {continents.map((c) => (
              <div key={c.title} className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color}`} />
                <h3 className="mt-8 text-3xl font-bold">{c.title}</h3>
                <p className="mt-3 text-slate-400">{c.countries} Countries</p>
              </div>
            ))}
          </div>

          <FeaturedCurricula />
          <PopularSubjects />
          <GlobalStatistics />
          <WhyChooseUs />
          <PartnersSection />
          <Testimonials />
          <FAQ />
          <CallToAction />
        </div>

        <CurriculumFooter />
      </main>
    </div>
  );
};

export default Curriculum;