import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MyCalendar from "../components/MyCalendar";

import {
  cbt,
  lms,
  novel,
  multilingual,
  virtual,
} from "../assets";

import {
  Calendar,
  Sparkles,
  BookOpen,
  GraduationCap,
  School,
  Wrench,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Brain,
  Library,
  Clock3,
} from "lucide-react";

/* =========================================================
   PREMIUM DASHBOARD CARD
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
      className="group relative h-72 cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
    >
      {bgImage && (
        <img
          src={bgImage}
          alt={title}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      )}

      <div className="absolute inset-0 bg-slate-950/20" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/5" />

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-transparent to-blue-500/0 transition duration-500 group-hover:from-cyan-400/10 group-hover:to-blue-500/10" />

      <div className="absolute inset-x-0 bottom-0 z-10 p-7">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-black tracking-tight text-white">
              {title}
            </h3>

            <p className="mt-2 truncate text-sm font-medium text-slate-300">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:bg-cyan-400 group-hover:text-slate-950">
            <ArrowUpRight size={19} />
          </div>
        </div>

        <div className="mt-5 h-px w-full bg-white/10">
          <div className="h-full w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   AI TUTOR CARD
========================================================= */

const AITutorCard = ({ onClick }) => {
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
      className="group relative flex h-72 cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-7 text-white shadow-2xl"
    >
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10"
      />

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }}
        className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
          <Sparkles size={28} />
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition duration-300 group-hover:bg-white group-hover:text-blue-600">
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-black tracking-tight">
          Scholiqen AI
        </h3>

        <p className="mt-2 truncate text-sm font-medium text-blue-50">
          Intelligent tutoring, explanations, translation and personalized learning.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md">
          Powered by AI
          <ChevronRight size={13} />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   EXPLORE SCHOOLS CARD
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
        ease: "easeOut",
      }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-7 shadow-2xl"
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/20" />

      <div className="absolute bottom-0 left-0 h-1 w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400 backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-cyan-400/10">
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

        <p className="mt-2 truncate text-sm font-medium text-slate-400">
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
    question: "What is Scholiqen?",
    answer:
      "Scholiqen is an intelligent learning platform that brings courses, CBT practice, language learning, virtual laboratories, digital reading and school discovery together in one place.",
  },
  {
    question: "Can I use Scholiqen to learn courses?",
    answer:
      "Yes. The LMS Portal gives you access to learning materials, courses, quizzes and other academic resources available on the platform.",
  },
  {
    question: "Can I practice CBT examinations?",
    answer:
      "Yes. The CBT section is designed for examination practice. You can explore available examinations and practice questions directly from the CBT area.",
  },
  {
    question: "Can I learn foreign languages?",
    answer:
      "Yes. The Multilingual Hub provides a dedicated space for language learning, including vocabulary, grammar, pronunciation and other language-learning materials.",
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
    question: "What is Scholiqen AI?",
    answer:
      "Scholiqen AI is the platform's intelligent learning assistant. It is designed to help with explanations, tutoring, translation and personalized learning support.",
  },
  {
    question: "Can I read novels on Scholiqen?",
    answer:
      "Yes. The Novel Library provides a dedicated reading space where available stories, novels and other literary materials can be explored.",
  },
  {
    question: "Do I need to complete everything at once?",
    answer:
      "No. You can move through the platform at your own pace. Explore the learning tools that are useful to you and return whenever you are ready to continue.",
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

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
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
            ease: "easeOut",
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
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/10"
              >
                Practice CBT
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            SIX MAIN LEARNING MODULES
        ================================================= */}

        <div className="mb-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">

          <Card
            title="LMS Portal"
            description="Courses, materials, quizzes and certificates."
            bgImage={lms}
            onClick={() => navigate("/lms")}
          />

          <Card
            title="Multilingual Hub"
            description="Learn languages, pronunciation, grammar and vocabulary."
            bgImage={multilingual}
            onClick={() => navigate("/languages")}
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

          <AITutorCard
            onClick={() => navigate("/ai-tutor")}
          />
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
              Discover universities, colleges and polytechnics and explore what they offer.
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
              icon={School}
              onClick={() => navigate("/colleges")}
            />

            <SchoolTypeCard
              title="Polytechnics"
              description="Explore technical programs, courses and admission opportunities."
              icon={Wrench}
              onClick={() => navigate("/polytechnics")}
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
        </motion.div>

        {/* =================================================
            PREMIUM FAQ
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
          className="scroll-mt-24 mb-16 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-7 shadow-2xl sm:p-10"
        >
          {/* Background decoration */}

          <div className="pointer-events-none absolute" />

          <div className="relative">

            {/* Header */}

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
                schools, languages, AI and everything else
                available on Scholiqen.
              </p>
            </div>

            {/* FAQ LIST */}

            <div className="mx-auto max-w-4xl space-y-3">
              {faqItems.map((item, index) => (
                <FAQItem
                  key={item.question}
                  item={item}
                  isOpen={openFAQ === index}
                  onClick={() => toggleFAQ(index)}
                />
              ))}
            </div>

            {/* Bottom Support Card */}

            <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5 sm:p-6">
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
                      Our help and contact areas are available whenever you need assistance.
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

              <p className="mt-1 text-xs text-slate-600">
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

              <p className="mt-1 text-xs text-slate-600">
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

              <p className="mt-1 text-xs text-slate-600">
                Keep moving toward your goals.
              </p>
            </div>

          </div>

          <h2 className="text-3xl font-black text-white">
            Learn Beyond Limits
          </h2>

          <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-400">
            Scholiqen brings learning, AI tutoring,
            multilingual education, virtual laboratories,
            CBT practice and digital libraries together
            in one intelligent platform.
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

          <div className="mt-10 flex items-center justify-center gap-2 text-slate-700">
            <Sparkles size={14} />

            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
              Scholiqen
            </span>
          </div>

          <p className="mt-2 pb-8 text-xs text-slate-700">
            Your learning. Your journey. Your progress.
          </p>

        </footer>

      </div>
    </section>
  );
};

export default Dashboard;
