import React from "react";
import {
  ArrowRight,
  Globe2,
  Sparkles,
} from "lucide-react";

const CallToAction = () => {
  return (
    <section className="mt-24 mb-24">

      <div className="relative overflow-hidden rounded-[36px] border border-cyan-500/20 bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900">

        {/* Glow */}

        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 px-10 py-20 text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20">

            <Sparkles size={18} />

            <span>Global Learning Starts Here</span>

          </div>

          <h2 className="mt-8 text-5xl xl:text-6xl font-black text-white leading-tight">

            Discover the World's
            <br />
            Curricula in One Platform

          </h2>

          <p className="mt-8 text-lg text-slate-200 max-w-3xl mx-auto leading-8">

            Explore countries, compare curriculum frameworks,
            browse subjects, access virtual laboratories,
            and learn with AI-powered guidance—all from one place.

          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12">

            <button className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold hover:scale-105 transition flex items-center gap-2">

              <Globe2 size={20} />

              Explore Curriculum

            </button>

            <button className="px-8 py-4 rounded-2xl border border-white/30 text-white hover:bg-white/10 transition flex items-center gap-2">

              Get Started

              <ArrowRight size={20} />

            </button>

          </div>

        </div>

      </div>

    </section>
  );
};

export default CallToAction;