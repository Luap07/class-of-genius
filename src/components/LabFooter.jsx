import React from "react";
import {
  FlaskConical,
  Mail,
  BookOpen,
  Brain,
  Atom,
} from "lucide-react";
import { Link } from "react-router-dom";

const LabFooter = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-10 md:grid-cols-4">

          {/* =================================================
              BRAND
          ================================================= */}

          <div>

            <div className="mb-5 flex items-center gap-3">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-cyan-500/20
                  bg-cyan-500/10
                "
              >
                <FlaskConical
                  size={24}
                  className="text-cyan-400"
                />
              </div>

              <div>

                <h3 className="text-xl font-bold text-white">
                  Virtual Lab
                </h3>

                <p className="text-sm text-slate-400">
                  Scholiqen AI Learning Platform
                </p>

              </div>

            </div>

            <p className="leading-relaxed text-slate-400">
              Explore science through interactive simulations,
              AI tutoring, virtual experiments, and immersive
              learning experiences.
            </p>

          </div>

          {/* =================================================
              SUBJECTS
          ================================================= */}

          <div>

            <h4 className="mb-5 font-semibold text-white">
              Subjects
            </h4>

            <ul className="space-y-3">

              <li className="text-slate-400 transition hover:text-cyan-400">
                Physics
              </li>

              <li className="text-slate-400 transition hover:text-cyan-400">
                Chemistry
              </li>

              <li className="text-slate-400 transition hover:text-cyan-400">
                Biology
              </li>

              <li className="text-slate-400 transition hover:text-cyan-400">
                Mathematics
              </li>

            </ul>

          </div>

          {/* =================================================
              FEATURES
          ================================================= */}

          <div>

            <h4 className="mb-5 font-semibold text-white">
              Features
            </h4>

            <ul className="space-y-4">

              <li className="flex items-center gap-3 text-slate-400">
                <Brain size={18} className="text-purple-400" />
                AI Tutor
              </li>

              <li className="flex items-center gap-3 text-slate-400">
                <Atom size={18} className="text-cyan-400" />
                Virtual Experiments
              </li>

              <li className="flex items-center gap-3 text-slate-400">
                <BookOpen size={18} className="text-blue-400" />
                Interactive Learning
              </li>

            </ul>

          </div>

          {/* =================================================
              CONTACT
          ================================================= */}

          <div>

            <h4 className="mb-5 font-semibold text-white">
              Contact
            </h4>

            <div className="space-y-4">

              <div className="flex items-center gap-3 text-slate-400">
                <Mail
                  size={18}
                  className="shrink-0 text-cyan-400"
                />

                <span>
                  scholiqen@gmail.com
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="mt-12 border-t border-white/10 pt-8">

          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">

            {/* Copyright */}

            <p className="text-center text-sm text-slate-500 md:text-left">
              © {new Date().getFullYear()} Scholiqen Virtual Lab.
              All rights reserved.
            </p>

            {/* =================================================
                NAVIGATION LINKS
            ================================================= */}

            <div className="flex items-center gap-6">

              <Link
                to="/privacy"
                className="
                  text-sm
                  text-slate-500
                  transition-all
                  duration-200
                  hover:text-cyan-400
                "
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="
                  text-sm
                  text-slate-500
                  transition-all
                  duration-200
                  hover:text-cyan-400
                "
              >
                Terms
              </Link>

              <Link
                to="/support"
                className="
                  text-sm
                  text-slate-500
                  transition-all
                  duration-200
                  hover:text-cyan-400
                "
              >
                Support
              </Link>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default LabFooter;
