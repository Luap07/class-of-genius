import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  cbt,
  lms,
  novel,
  multilingual,
  virtual,
} from "../assets";

import {
  Sparkles,
  BookOpen,
  GraduationCap,
  School,
  Wrench,
  ArrowRight,
  Calendar,
} from "lucide-react";

import MyCalendar from "../components/MyCalendar";

/* =========================================================
   PREMIUM DASHBOARD CARD
========================================================= */

const Card = ({
  title,
  description,
  fullDescription,
  bgImage,
  onClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative h-[300px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
    >
      {/* =================================================
          SHARP BACKGROUND IMAGE
      ================================================= */}

      {bgImage && (
        <img
          src={bgImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
        />
      )}

      {/* =================================================
          IMAGE OVERLAY
      ================================================= */}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/10" />

      <div className="absolute inset-0 bg-black/10" />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="absolute inset-x-0 bottom-0 z-10 p-6">
        <h3 className="text-2xl font-black tracking-tight text-white">
          {title}
        </h3>

        {!expanded ? (
          <>
            <p className="mt-2 truncate text-sm font-medium text-slate-300">
              {description}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Read More
              <ArrowRight size={15} />
            </button>
          </>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 10,
              }}
            >
              <p className="mt-3 text-sm leading-6 text-slate-200">
                {fullDescription}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Show Less
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

/* =========================================================
   AI TUTOR CARD
========================================================= */

const AITutorCard = ({ onClick }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative flex h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-cyan-300/10 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-8 text-center text-white shadow-2xl"
      onClick={onClick}
    >
      {/* Decorative Circle */}

      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
        className="absolute -right-20 -top-20 h-52 w-52 rounded-full border border-white/10"
      />

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
        }}
        className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md"
      >
        <Sparkles size={30} />
      </motion.div>

      <h3 className="relative z-10 text-2xl font-black">
        Scholiqen AI
      </h3>

      {!expanded ? (
        <>
          <p className="relative z-10 mt-3 line-clamp-1 max-w-md text-sm text-blue-50">
            AI tutoring, explanations, translation, quizzes and personalized learning.
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md transition hover:bg-white/20"
          >
            Read More
            <ArrowRight size={14} />
          </button>
        </>
      ) : (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative z-10"
        >
          <p className="mt-3 max-w-md text-sm leading-6 text-blue-50">
            Learn faster with AI explanations, multilingual translation,
            homework help, quizzes, summaries, grammar correction and
            personalized tutoring.
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            className="mt-5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md transition hover:bg-white/20"
          >
            Show Less
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

/* =========================================================
   SCHOOL TYPE CARD
========================================================= */

const SchoolTypeCard = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 text-left shadow-2xl transition"
    >
      {/* Decorative background */}

      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/20" />

      <div className="relative z-10">
        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400 transition duration-300 group-hover:bg-cyan-500/10">
          <Icon size={32} />
        </div>

        <h3 className="text-2xl font-black tracking-tight text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {description}
        </p>

        <div className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
          Explore
          <ArrowRight
            size={16}
            className="transition group-hover:translate-x-1"
          />
        </div>
      </div>
    </motion.button>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  return (
    <section className="min-h-screen bg-slate-950 px-4 pb-20 pt-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            PREMIUM WELCOME HERO
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 p-8 shadow-2xl sm:p-10"
        >
          {/* Background glow */}

          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles size={14} />
              Scholiqen Learning Hub
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Welcome Back 👋
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
              Your complete learning environment for courses, languages,
              laboratories, examinations, books, AI tutoring and higher
              education discovery.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/lms")}
                className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                Continue Learning
              </button>

              <button
                onClick={() => navigate("/cbt")}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Practice CBT
              </button>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            SIX MAIN MODULES
        ================================================= */}

        <div className="mb-14">
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Learning Modules
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              Everything You Need to Learn
            </h2>

            <p className="mt-2 text-slate-400">
              Access every major learning tool from one place.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

            <Card
              title="LMS Portal"
              description="Courses, materials, quizzes and certificates."
              fullDescription="Access structured courses, study materials, quizzes, assignments and certificates designed to help you learn at your own pace."
              bgImage={lms}
              onClick={() => navigate("/lms")}
            />

            <Card
              title="Multilingual Hub"
              description="Learn languages, grammar and pronunciation."
              fullDescription="Explore languages from around the world, study vocabulary and grammar, practice pronunciation and build real communication skills."
              bgImage={multilingual}
              onClick={() => navigate("/languages")}
            />

            <Card
              title="Virtual Laboratory"
              description="Explore interactive science experiments."
              fullDescription="Perform interactive simulations and experiments while exploring scientific concepts through a visual and practical learning environment."
              bgImage={virtual}
              onClick={() => navigate("/lab")}
            />

            <Card
              title="Novel Library"
              description="Read books, stories and literature."
              fullDescription="Discover inspiring novels, stories and literature from different cultures and genres in the Scholiqen digital library."
              bgImage={novel}
              onClick={() => navigate("/novels")}
            />

            <Card
              title="CBT Practice"
              description="Prepare for examinations with realistic tests."
              fullDescription="Practice with computer-based examination questions and build your confidence through realistic examination sessions."
              bgImage={cbt}
              onClick={() => navigate("/cbt")}
            />

            <AITutorCard
              onClick={() => navigate("/ai-tutor")}
            />

          </div>
        </div>

        {/* =================================================
            EXPLORE SCHOOLS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mb-14"
        >
          <div className="mb-7 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Higher Education
            </p>

            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Explore Schools
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Discover universities, colleges and polytechnics and explore
              their programs.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3">

            {/* UNIVERSITIES */}

            <SchoolTypeCard
              title="Universities"
              description="Explore universities and discover their programs, courses and opportunities."
              icon={GraduationCap}
              onClick={() =>
                navigate("/schools/universities")
              }
            />

            {/* COLLEGES */}

            <SchoolTypeCard
              title="Colleges"
              description="Explore colleges and discover available programs and academic opportunities."
              icon={School}
              onClick={() =>
                navigate("/schools/colleges")
              }
            />

            {/* POLYTECHNICS */}

            <SchoolTypeCard
              title="Polytechnics"
              description="Explore polytechnics and discover practical and technology-focused programs."
              icon={Wrench}
              onClick={() =>
                navigate("/schools/polytechnics")
              }
            />

          </div>
        </motion.div>

        {/* =================================================
            PERSONAL CALENDAR
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mb-16 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10">
              <Calendar
                size={24}
                className="text-violet-400"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                My Calendar
              </h2>

              <p className="text-slate-400">
                Organize your personal learning schedule.
              </p>
            </div>
          </div>

          <MyCalendar
            events={events}
            setEvents={setEvents}
          />
        </motion.div>

        {/* =================================================
            PREMIUM FOOTER
        ================================================= */}

        <footer className="border-t border-white/10 pt-12 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
              <BookOpen
                size={26}
                className="text-cyan-400"
              />
            </div>

            <h2 className="mt-5 text-3xl font-black text-white">
              Learn Beyond Limits
            </h2>

            <p className="mt-4 leading-8 text-slate-400">
              Scholiqen brings courses, AI tutoring, multilingual learning,
              virtual laboratories, CBT preparation, digital libraries and
              higher education discovery into one intelligent learning
              platform.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm font-semibold text-slate-500">
            <button className="transition hover:text-white">
              Help
            </button>

            <button className="transition hover:text-white">
              Contact
            </button>

            <button className="transition hover:text-white">
              Privacy
            </button>

            <button className="transition hover:text-white">
              Terms
            </button>
          </div>

          <p className="mt-10 text-sm text-slate-600">
            © 2026 Scholiqen. Empowering learners worldwide.
          </p>
        </footer>

      </div>
    </section>
  );
};

export default Dashboard;