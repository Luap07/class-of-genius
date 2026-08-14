import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import {
  biology,
  chemistry,
  physics,
  maths,
  art,
  geography,
  science,
  accounting,
} from "../assets/index.js";
import { ArrowUpRight, Sparkles } from "lucide-react";

const subjectData = [
  { name: "Biology", img: biology, desc: "Life Science", tag: "Explore" },
  { name: "Mathematics", img: maths, desc: "Core Logic", tag: "Explore" },
  { name: "Physics", img: physics, desc: "Matter & Energy", tag: "Explore" },
  { name: "Chemistry", img: chemistry, desc: "Molecular Study", tag: "Explore" },
  { name: "Art", img: art, desc: "Creative Vision", tag: "Explore" },
  { name: "Geography", img: geography, desc: "World Systems", tag: "Explore" },
  { name: "Science", img: science, desc: "Exploration", tag: "Explore" },
  { name: "Accounting", img: accounting, desc: "Financial Data", tag: "Explore" },
];

const SubjectCarousel = () => {
  const { darkMode } = useContext(ConnectContext);

  return (
    <section
      className={`relative overflow-hidden px-6 py-28 md:px-12 ${
        darkMode ? "bg-[#050914]" : "bg-[#070b14]"
      }`}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0a1220] to-[#050811]" />

        {/* Blue glow */}
        <div className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[130px]" />

        {/* Cyan glow */}
        <div className="absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[130px]" />

        {/* Indigo glow */}
        <div className="absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />

        {/* Dots */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
        />
      </div>

      {/* ================= HEADER ================= */}
      <div className="relative mx-auto mb-14 max-w-3xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300 backdrop-blur-xl">
          <Sparkles className="h-4 w-4" />
          <span>Learn • Explore • Master</span>
        </div>

        <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Explore Our{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            Subjects
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Discover powerful learning experiences across science, mathematics,
          creative arts, and more.
        </p>
      </div>

      {/* ================= CAROUSEL ================= */}
      <div className="relative w-full overflow-hidden">
        {/* Edge fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-24 bg-gradient-to-r from-[#070b14] to-transparent" />

        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-24 bg-gradient-to-l from-[#070b14] to-transparent" />

        <div className="flex w-max gap-7 animate-scroll hover:[animation-play-state:paused]">
          {[...subjectData, ...subjectData].map((sub, index) => (
            <div
              key={`${sub.name}-${index}`}
              className="group relative h-[360px] w-[270px] flex-shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 transition-all duration-500 hover:-translate-y-2 hover:border-blue-400/30 hover:shadow-blue-950/30"
            >
              {/* Image */}
              <img
                src={sub.img}
                alt={sub.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Image overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/5" />

              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Top badge */}
              <div className="absolute left-5 top-5">
                <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-xl">
                  {sub.tag}
                </span>
              </div>

              {/* Arrow */}
              <div className="absolute right-5 top-5 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white opacity-0 backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5" />
              </div>

              {/* Bottom information */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl transition-all duration-300 group-hover:bg-black/45">
                  <h3 className="text-xl font-extrabold tracking-tight text-white">
                    {sub.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-300">
                      {sub.desc}
                    </p>

                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BOTTOM LABEL ================= */}
      <div className="relative mt-12 flex justify-center">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-medium text-slate-400 backdrop-blur-xl">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          <span>Explore subjects and discover your next area of mastery</span>
        </div>
      </div>

      {/* ================= ANIMATION ================= */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 32s linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
};

export default SubjectCarousel;