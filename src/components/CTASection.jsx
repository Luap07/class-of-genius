import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ConnectContext } from "../context/ConnectContext";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

const CTASection = () => {
  const { darkMode } = useContext(ConnectContext);

  return (
    <section
      className={`relative overflow-hidden px-6 py-28 transition-colors duration-500 ${
        darkMode
          ? "bg-[#050914] text-white"
          : "bg-[#070b14] text-white"
      }`}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px]" />

        {/* Dotted background */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Premium badge */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 backdrop-blur-xl">
          <Sparkles className="h-4 w-4" />
          <span>Unlock Your Full Potential</span>
        </div>

        {/* Heading */}
        <h2 className="mx-auto max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          Elevate Your{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            Educational Journey
          </span>
        </h2>

        {/* Description */}
        <p
          className={`mx-auto mt-7 max-w-2xl text-base leading-8 sm:text-lg ${
            darkMode ? "text-slate-300" : "text-blue-100"
          }`}
        >
          Unlock a smarter way to learn with powerful courses, intelligent
          learning tools, interactive experiences, and everything you need to
          move from curiosity to mastery.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-slate-950 shadow-2xl shadow-blue-950/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-blue-50"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative">Get Started</span>

            <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Built for learners</span>
          </div>

          <div className="hidden h-4 w-px bg-slate-700 sm:block" />

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span>Powerful learning tools</span>
          </div>

          <div className="hidden h-4 w-px bg-slate-700 sm:block" />

          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Learn without limits</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;