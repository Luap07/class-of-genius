import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  School,
  Wrench,
  ArrowRight,
  Building2,
  Plus,
  Search,
} from "lucide-react";

/* =========================================================
   SCHOOL TYPE CARD
========================================================= */

const SchoolTypeCard = ({
  title,
  description,
  icon: Icon,
  count,
  path,
  accent,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.985,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
    >
      {/* Decorative glow */}

      <div
        className={`absolute -right-20 -top-20 h-56 w-56 rounded-full ${accent} opacity-10 blur-3xl transition duration-500 group-hover:opacity-20`}
      />

      <div className="relative z-10 p-8">
        {/* Icon */}

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${accent} backdrop-blur-xl`}
        >
          <Icon size={32} />
        </div>

        {/* Content */}

        <div className="mt-7">
          <h2 className="text-2xl font-black text-white">
            {title}
          </h2>

          <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        {/* Count */}

        <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total
            </p>

            <p className="mt-1 text-2xl font-black text-white">
              {count}
            </p>
          </div>

          <button
            onClick={() => navigate(path)}
            className={`flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold ${accent} transition hover:bg-white/10`}
          >
            Manage
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   SCHOOLS ADMIN
========================================================= */

const SchoolsAdmin = () => {
  const navigate = useNavigate();

  /*
    These values can later come from Supabase.

    For now they are placeholders so the admin interface
    works without requiring the database immediately.
  */

  const universityCount = 0;
  const collegeCount = 0;
  const polytechnicCount = 0;

  const totalSchools =
    universityCount +
    collegeCount +
    polytechnicCount;

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">
                  <Building2 size={28} />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Administration
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Schools
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Manage universities, colleges and polytechnics,
                including their details, faculties, departments
                and academic programs.
              </p>
            </div>

            {/* Add School */}

            <button
              onClick={() => navigate("/admin/schools/universities/new")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              Add School
            </button>
          </div>
        </motion.div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
          className="mb-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3"
        >
          <Search
            size={20}
            className="shrink-0 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search universities, colleges or polytechnics..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </motion.div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Schools"
            value={totalSchools}
            icon={Building2}
          />

          <StatCard
            title="Universities"
            value={universityCount}
            icon={GraduationCap}
          />

          <StatCard
            title="Colleges"
            value={collegeCount}
            icon={School}
          />

          <StatCard
            title="Polytechnics"
            value={polytechnicCount}
            icon={Wrench}
          />

        </div>

        {/* =================================================
            SCHOOL TYPES
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white">
              Manage School Types
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a category to manage its institutions.
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-3">

            {/* =================================================
                UNIVERSITIES
            ================================================= */}

            <SchoolTypeCard
              title="Universities"
              description="Manage universities, faculties, departments and academic programs."
              icon={GraduationCap}
              count={universityCount}
              path="/admin/schools/universities"
              accent="text-cyan-400"
            />

            {/* =================================================
                COLLEGES
            ================================================= */}

            <SchoolTypeCard
              title="Colleges"
              description="Manage colleges, their academic structure, programs and institution details."
              icon={School}
              count={collegeCount}
              path="/admin/schools/colleges"
              accent="text-violet-400"
            />

            {/* =================================================
                POLYTECHNICS
            ================================================= */}

            <SchoolTypeCard
              title="Polytechnics"
              description="Manage polytechnics, technical departments, programs and institution details."
              icon={Wrench}
              count={polytechnicCount}
              path="/admin/schools/polytechnics"
              accent="text-amber-400"
            />

          </div>
        </motion.div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.3,
          }}
          className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-7"
        >
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly add a new institution.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <button
              onClick={() =>
                navigate("/admin/schools/universities/new")
              }
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <GraduationCap size={24} />
              </div>

              <div>
                <p className="font-bold text-white">
                  Add University
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Create a university profile
                </p>
              </div>

              <ArrowRight
                size={17}
                className="ml-auto text-slate-600 transition group-hover:text-cyan-400"
              />
            </button>

            <button
              onClick={() =>
                navigate("/admin/schools/colleges/new")
              }
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-left transition hover:border-violet-400/30 hover:bg-violet-400/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <School size={24} />
              </div>

              <div>
                <p className="font-bold text-white">
                  Add College
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Create a college profile
                </p>
              </div>

              <ArrowRight
                size={17}
                className="ml-auto text-slate-600 transition group-hover:text-violet-400"
              />
            </button>

            <button
              onClick={() =>
                navigate("/admin/schools/polytechnics/new")
              }
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-left transition hover:border-amber-400/30 hover:bg-amber-400/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Wrench size={24} />
              </div>

              <div>
                <p className="font-bold text-white">
                  Add Polytechnic
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Create a polytechnic profile
                </p>
              </div>

              <ArrowRight
                size={17}
                className="ml-auto text-slate-600 transition group-hover:text-amber-400"
              />
            </button>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default SchoolsAdmin;