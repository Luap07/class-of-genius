import React from "react";
import {
  FlaskConical,
  Mail,
  BookOpen,
  Brain,
  Atom,
  Calculator,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const LabFooter = () => {
  const subjects = [
    {
      name: "Physics",
      path: "/lab/physics",
      icon: Atom,
      color: "text-blue-400",
    },
    {
      name: "Chemistry",
      path: "/lab/chemistry",
      icon: FlaskConical,
      color: "text-cyan-400",
    },
    {
      name: "Biology",
      path: "/lab/biology",
      icon: Brain,
      color: "text-teal-400",
    },
    {
      name: "Mathematics",
      path: "/lab/mathematics",
      icon: Calculator,
      color: "text-sky-400",
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Subtle grid */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-4">

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
                  border-cyan-400/20
                  bg-cyan-400/[0.08]
                  shadow-[0_0_30px_rgba(34,211,238,0.08)]
                "
              >
                <FlaskConical
                  size={24}
                  className="text-cyan-400"
                />
              </div>

              <div>

                <h3 className="text-xl font-black text-white">
                  Virtual Lab
                </h3>

                <p className="text-sm text-slate-500">
                  Scholiqen Learning Platform
                </p>

              </div>

            </div>

            <p className="max-w-sm leading-relaxed text-slate-400">
              Explore science through interactive simulations,
              virtual experiments, guided learning and practical
              experiences designed to make difficult concepts easier
              to understand.
            </p>

          </div>

          {/* =================================================
              SUBJECTS
          ================================================= */}

          <div>

            <h4 className="mb-5 font-bold text-white">
              Subjects
            </h4>

            <ul className="space-y-2">

              {subjects.map((subject) => {
                const Icon = subject.icon;

                return (
                  <li key={subject.name}>

                    <Link
                      to={subject.path}
                      className="
                        group
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-2.5
                        text-slate-400
                        transition-all
                        duration-200
                        hover:bg-white/[0.04]
                        hover:text-white
                      "
                    >

                      <span className="flex items-center gap-3">

                        <Icon
                          size={17}
                          className={`${subject.color} transition-transform duration-200 group-hover:scale-110`}
                        />

                        <span>
                          {subject.name}
                        </span>

                      </span>

                      <ArrowUpRight
                        size={15}
                        className="
                          text-slate-600
                          opacity-0
                          transition-all
                          duration-200
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                          group-hover:text-cyan-400
                          group-hover:opacity-100
                        "
                      />

                    </Link>

                  </li>
                );
              })}

            </ul>

          </div>

          {/* =================================================
              FEATURES
          ================================================= */}

          <div>

            <h4 className="mb-5 font-bold text-white">
              Features
            </h4>

            <ul className="space-y-2">

              <li>
                <Link
                  to="/ai-tutor"
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-slate-400
                    transition-all
                    hover:bg-white/[0.04]
                    hover:text-white
                  "
                >
                  <Brain
                    size={18}
                    className="text-cyan-400 transition-transform group-hover:scale-110"
                  />

                  AI Tutor
                </Link>
              </li>

              <li>
                <Link
                  to="/lab"
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-slate-400
                    transition-all
                    hover:bg-white/[0.04]
                    hover:text-white
                  "
                >
                  <Atom
                    size={18}
                    className="text-blue-400 transition-transform group-hover:scale-110"
                  />

                  Virtual Experiments
                </Link>
              </li>

              <li>
                <Link
                  to="/lab"
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-slate-400
                    transition-all
                    hover:bg-white/[0.04]
                    hover:text-white
                  "
                >
                  <BookOpen
                    size={18}
                    className="text-teal-400 transition-transform group-hover:scale-110"
                  />

                  Interactive Learning
                </Link>
              </li>

            </ul>

          </div>

          {/* =================================================
              CONTACT
          ================================================= */}

          <div>

            <h4 className="mb-5 font-bold text-white">
              Contact
            </h4>

            <div className="space-y-4">

              <div className="flex items-start gap-3 text-slate-400">

                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05]">
                  <Mail
                    size={17}
                    className="text-cyan-400"
                  />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    scholiqen@gmail.com
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div className="mt-14 border-t border-white/[0.07] pt-8">

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
