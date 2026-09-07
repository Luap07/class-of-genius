import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MyCalendar from "../components/MyCalendar";

import {
  cbt,
  lms,
  novel,
  virtual,
  school,
} from "../assets";

import {
  Calendar,
  BookOpen,
  GraduationCap,
  School as SchoolIcon,
  Wrench,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Brain,
  Sparkles,
  Users,
  PlayCircle,
} from "lucide-react";

/* =========================================================
   MAIN DASHBOARD CARD
========================================================= */

const Card = ({
  title,
  description,
  bgImage,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      onClick={onClick}
      className="group relative h-[380px] cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
    >
      {/* Image */}

      {bgImage && (
        <img
          src={bgImage}
          alt={title}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      )}

      {/* Image overlay */}

      <div className="absolute inset-0 bg-slate-950/15" />

      {/* Bottom gradient */}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      {/* Content */}

      <div className="absolute inset-x-0 bottom-0 z-10 p-7">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">
              {title}
            </h3>

            <p className="mt-3 max-w-[230px] text-sm font-medium leading-6 text-slate-200 drop-shadow-md">
              {description}
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-cyan-400 group-hover:text-slate-950">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-white/15">
          <div className="h-full w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
        </div>
      </div>
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
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
      }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-2xl"
    >
      {/* Glow */}

      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/20" />

      {/* Bottom accent */}

      <div className="absolute bottom-0 left-0 h-1 w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400 backdrop-blur-md transition duration-300 group-hover:scale-110">
            <Icon
              size={31}
              strokeWidth={1.8}
            />
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition duration-300 group-hover:bg-cyan-400 group-hover:text-slate-950">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <h3 className="mt-7 text-2xl font-black tracking-tight text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
          {description}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
          Explore

          <ChevronRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   FAQ DATA
========================================================= */

const faqItems = [
  {
    question: "What can I do here?",
    answer:
      "You can learn courses, practice examinations, explore virtual experiments, read novels, discover schools and use the different learning resources available to you.",
  },
  {
    question: "Can I use the LMS to learn courses?",
    answer:
      "Yes. The LMS Portal gives you access to learning materials, courses, quizzes and other academic resources available for your learning.",
  },
  {
    question: "Can I practice CBT examinations?",
    answer:
      "Yes. The CBT section is designed for examination practice. You can explore available examinations and practice questions directly from the CBT area.",
  },
  {
    question: "What is the Virtual Laboratory?",
    answer:
      "The Virtual Laboratory provides interactive learning experiences that allow you to explore scientific concepts and experiments digitally.",
  },
  {
    question: "Can I find universities and other schools?",
    answer:
      "Yes. The Explore Schools section lets you browse universities, colleges and polytechnics and explore information about their programs and opportunities.",
  },
  {
    question: "What is the AI Tutor?",
    answer:
      "The AI Tutor provides intelligent learning support such as explanations, tutoring, translation and personalized assistance when you need help.",
  },
  {
    question: "Can I read novels here?",
    answer:
      "Yes. The Novel Library provides a dedicated reading space where available stories, novels and other literary materials can be explored.",
  },
  {
    question: "Do I need to complete everything at once?",
    answer:
      "No. You can move through the learning resources at your own pace. Explore the tools that are useful to you and return whenever you are ready to continue.",
  },
];

/* =========================================================
   FAQ ITEM
========================================================= */

const FAQItem = ({
  item,
  isOpen,
  onClick,
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        isOpen
          ? "border-cyan-400/20 bg-cyan-400/[0.035]"
          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.035]"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              isOpen
                ? "bg-cyan-400/10 text-cyan-400"
                : "bg-white/5 text-slate-500"
            }`}
          >
            <HelpCircle size={18} />
          </div>

          <span className="text-sm font-bold leading-6 text-white sm:text-base">
            {item.question}
          </span>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            isOpen
              ? "rotate-180 bg-cyan-400 text-slate-950"
              : "bg-white/5 text-slate-400"
          }`}
        >
          <ChevronDown size={18} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            <div className="border-t border-white/5 px-5 pb-6 pt-4 sm:px-6">
              <div className="pl-14">
                <p className="max-w-3xl text-sm leading-7 text-slate-400">
                  {item.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ((previous) =>
      previous === index ? null : index
    );
  };

  /*
   * =======================================================
   * ACADEMY NAVIGATION
   * =======================================================
   *
   * This is intentionally separated so the Academy CTA
   * always enters the Academy environment.
   */

  const enterAcademy = () => {
    navigate("/academy");
  };

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HERO
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
          className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 p-7 shadow-2xl sm:p-10"
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_35%)]" />

          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

              Your Learning Space
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Welcome Back

              <span className="ml-2 text-cyan-400">
                👋
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
              Everything you need to learn, practice, explore and grow is right here.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/lms")}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Start Learning

                <ArrowUpRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/cbt")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Practice CBT

                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            FOUR MAIN CARDS
        ================================================= */}

        <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="LMS Portal"
            description="Courses, materials, quizzes and certificates."
            bgImage={lms}
            onClick={() => navigate("/lms")}
          />

          <Card
            title="Virtual Laboratory"
            description="Explore interactive experiments and science simulations."
            bgImage={virtual}
            onClick={() => navigate("/lab")}
          />

          <Card
            title="Novel Library"
            description="Read stories, novels and inspiring literature worldwide."
            bgImage={novel}
            onClick={() => navigate("/novels")}
          />

          <Card
            title="CBT Practice"
            description="Prepare for examinations with realistic CBT practice."
            bgImage={cbt}
            onClick={() => navigate("/cbt")}
          />
        </div>

        {/* =================================================
            SCHOLIQEN ACADEMY
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.7,
          }}
          className="group relative mb-16 h-[560px] overflow-hidden rounded-[2.25rem] border border-cyan-400/15 bg-slate-900 shadow-2xl sm:h-[620px] lg:h-[680px]"
        >
          {/* SCHOOL IMAGE */}

          {school && (
            <img
              src={school}
              alt="Scholiqen Academy"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.68] saturate-[0.88] transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025]"
            />
          )}

          {/* Cinematic overlay */}

          <div className="absolute inset-0 bg-slate-950/25" />

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/35 to-slate-950/80" />

          {/* Center glow */}

          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />

          {/* =================================================
              TEXT ON IMAGE
          ================================================= */}

          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 py-12 text-center sm:px-10">
            <div className="mx-auto max-w-4xl">

              {/* Badge */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-slate-950/45 px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 shadow-xl backdrop-blur-md"
              >
                <Sparkles size={15} />

                Scholiqen Online School
              </motion.div>

              {/* Heading */}

              <motion.h2
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
                  delay: 0.1,
                  duration: 0.6,
                }}
                className="mt-7 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl"
              >
                Welcome to{" "}

                <span className="text-cyan-300">
                  Scholiqen Academy
                </span>
              </motion.h2>

              {/* Description */}

              <motion.p
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.18,
                  duration: 0.6,
                }}
                className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-100 drop-shadow-xl sm:text-lg"
              >
                A complete online learning environment designed
                to help you learn, develop your skills and move
                closer to your academic goals — wherever you are.
              </motion.p>

              {/* Features */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.25,
                  duration: 0.5,
                }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
                  <BookOpen
                    size={16}
                    className="text-cyan-300"
                  />

                  Structured Courses
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
                  <PlayCircle
                    size={16}
                    className="text-blue-300"
                  />

                  Learn Online
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
                  <Users
                    size={16}
                    className="text-violet-300"
                  />

                  Learning Community
                </div>
              </motion.div>

              {/* =================================================
                  ENTER ACADEMY
              ================================================= */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 0.32,
                  duration: 0.5,
                }}
                className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >

                {/* MAIN ACADEMY BUTTON */}

                <button
                  type="button"
                  onClick={enterAcademy}
                  className="group/academy inline-flex min-h-[58px] items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black text-slate-950 shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-cyan-400/50"
                >
                  Access Scholiqen Academy

                  <ArrowUpRight
                    size={20}
                    className="transition-transform duration-300 group-hover/academy:translate-x-1 group-hover/academy:-translate-y-1"
                  />
                </button>

                {/* LMS */}

                <button
                  type="button"
                  onClick={() => navigate("/lms")}
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-slate-950/45 px-7 py-4 text-sm font-bold text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-slate-950/65"
                >
                  Explore Learning

                  <ChevronRight size={18} />
                </button>
              </motion.div>

              {/* Supporting text */}

              <p className="mt-6 text-xs font-semibold text-white/65 drop-shadow-lg">
                Enter your digital school environment and continue your learning journey.
              </p>
            </div>
          </div>

          {/* Bottom image label */}

          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
            <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-slate-950/50 px-5 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
              <GraduationCap
                size={16}
                className="text-cyan-300"
              />

              Your Online School
            </div>
          </div>

          {/* Bottom accent */}

          <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        </motion.section>

        {/* =================================================
            EXPLORE SCHOOLS
        ================================================= */}

        <motion.section
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
          className="mb-14 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
        >
          <div className="mb-9 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
              <GraduationCap
                size={29}
                className="text-cyan-400"
                strokeWidth={1.8}
              />
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Explore Schools
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Discover universities, colleges and polytechnics
              and explore what they offer.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <SchoolTypeCard
              title="Universities"
              description="Explore universities, programs, faculties and admission opportunities."
              icon={GraduationCap}
              onClick={() => navigate("/universities")}
            />

            <SchoolTypeCard
              title="Colleges"
              description="Discover colleges, courses, programs and admission opportunities."
              icon={SchoolIcon}
              onClick={() => navigate("/colleges")}
            />

            <SchoolTypeCard
              title="Polytechnics"
              description="Explore technical programs, courses and admission opportunities."
              icon={Wrench}
              onClick={() => navigate("/polytechnics")}
            />
          </div>
        </motion.section>

        {/* =================================================
            MY CALENDAR
        ================================================= */}

        <motion.section
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
          className="mb-16 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
        >
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-400/10">
              <Calendar
                size={23}
                className="text-violet-400"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                My Calendar
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Organize your personal learning schedule.
              </p>
            </div>
          </div>

          <MyCalendar
            events={events}
            setEvents={setEvents}
          />
        </motion.section>

        {/* =================================================
            FAQ
        ================================================= */}

        <motion.section
          id="faq-section"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.6,
          }}
          className="mb-16 scroll-mt-24 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-7 shadow-2xl sm:p-10"
        >
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
              <HelpCircle
                size={28}
                className="text-cyan-400"
              />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Frequently Asked Questions
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Questions? We've Got Answers.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Find quick answers about learning, CBT practice,
              schools, AI and the resources available to you.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
            {faqItems.map((item, index) => (
              <FAQItem
                key={item.question}
                item={item}
                isOpen={openFAQ === index}
                onClick={() => toggleFAQ(index)}
              />
            ))}
          </div>

          {/* Help */}

          <div className="mx-auto mt-8 max-w-6xl rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                  <MessageCircle size={20} />
                </div>

                <div>
                  <h3 className="font-black text-white">
                    Still need help?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Our help and contact areas are available whenever
                    you need assistance.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/help")}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-950"
              >
                Visit Help

                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="border-t border-white/10 pt-12 text-center">
          <div className="mx-auto mb-8 grid max-w-4xl gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <BookOpen
                size={20}
                className="mx-auto text-cyan-400"
              />

              <p className="mt-3 text-sm font-bold text-white">
                Learn
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Build knowledge at your pace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <Brain
                size={20}
                className="mx-auto text-violet-400"
              />

              <p className="mt-3 text-sm font-bold text-white">
                Practice
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Test yourself and improve.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <GraduationCap
                size={20}
                className="mx-auto text-blue-400"
              />

              <p className="mt-3 text-sm font-bold text-white">
                Grow
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Keep moving toward your goals.
              </p>
            </div>

          </div>

          <h2 className="text-3xl font-black text-white">
            Learn Beyond Limits
          </h2>

          <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-400">
            Bring learning, AI tutoring, virtual laboratories,
            CBT practice and digital libraries together in one
            intelligent learning experience.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-slate-400">
            <button
              type="button"
              onClick={() => navigate("/help")}
              className="transition hover:text-white"
            >
              Help
            </button>

            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="transition hover:text-white"
            >
              Contact
            </button>

            <button
              type="button"
              onClick={() => navigate("/privacy")}
              className="transition hover:text-white"
            >
              Privacy
            </button>

            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="transition hover:text-white"
            >
              Terms
            </button>
          </div>

          <p className="mt-10 pb-8 text-xs text-slate-700">
            Your learning. Your journey. Your progress.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default Dashboard;