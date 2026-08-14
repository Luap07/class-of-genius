import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import { thomas } from "../assets/index";
import { Quote, Sparkles, Star } from "lucide-react";

const TestimonialSection = () => {
  const { darkMode } = useContext(ConnectContext);

  return (
    <section
      className={`relative overflow-hidden px-6 py-28 ${
        darkMode ? "bg-[#050914]" : "bg-[#070b14]"
      }`}
    >
      {/* ================= PREMIUM BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0a1220] to-[#050811]" />

        <div className="absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute right-[-100px] top-1/3 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[140px]" />

        <div className="absolute bottom-[-150px] left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[140px]" />

        {/* Dotted texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* ================= HEADER ================= */}
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300 backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            <span>Trusted Learning Experience</span>
          </div>

          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            What Our{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Leaders Say
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Hear from learners and education leaders who have experienced the
            impact of Scholiqen on modern education.
          </p>
        </div>

        {/* ================= TESTIMONIAL CARD ================= */}
        <div className="group relative">
          {/* Outer glow */}
          <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-indigo-500/20 opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-14">
            {/* Decorative quote */}
            <div className="pointer-events-none absolute -right-4 -top-8 opacity-[0.035]">
              <Quote className="h-48 w-48 text-blue-400" />
            </div>

            {/* Top accent */}
            <div className="absolute left-1/2 top-0 h-[2px] w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

            {/* Stars */}
            <div className="mb-8 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-4 w-4 fill-current text-yellow-400"
                />
              ))}
            </div>

            {/* Avatar */}
            <div className="relative mx-auto mb-8 h-24 w-24">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-indigo-500/30 blur-md" />

              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/20 bg-slate-900 ring-4 ring-blue-500/10">
                <img
                  src={thomas}
                  alt="Thomas Anderson"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-[#0a1220] bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            </div>

            {/* Quote */}
            <div className="mx-auto max-w-3xl text-center">
              <Quote className="mx-auto mb-5 h-8 w-8 rotate-180 text-blue-400/60" />

              <p className="text-lg font-medium italic leading-9 text-slate-200 md:text-2xl md:leading-10">
                “Scholiqen has completely transformed our educational
                approach. The platform's expert tools and intuitive design
                have made it incredibly easy for our students to thrive and
                reach their full potential. It is truly the gold standard for
                modern learning.”
              </p>

              <Quote className="mx-auto mt-5 h-8 w-8 text-blue-400/60" />
            </div>

            {/* Divider */}
            <div className="mx-auto my-9 h-px w-24 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            {/* Author */}
            <div className="text-center">
              <h4 className="text-xl font-extrabold tracking-tight text-white">
                Thomas Anderson
              </h4>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Student
              </p>
            </div>

            {/* Bottom decoration */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              <span className="h-px w-8 bg-white/10" />
              <span>Scholiqen Community</span>
              <span className="h-px w-8 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;