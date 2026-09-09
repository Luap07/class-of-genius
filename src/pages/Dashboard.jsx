import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MyCalendar from "../components/MyCalendar";

import {
  cbt,
  lms,
  novel,
  virtual,
  school,
  home_d,
} from "../assets";

import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Library,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";


/* =========================================================
   MAIN CARD
========================================================= */

const Card = ({
  image,
  title,
  description,
  icon: Icon,
  onClick,
  delay = 0,
  badge,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="group relative min-h-[300px] overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-900 text-left shadow-xl transition-all duration-500 hover:border-cyan-400/30 hover:shadow-cyan-500/10"
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-slate-950/65 transition duration-500 group-hover:bg-slate-950/55" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      <div className="relative z-10 flex min-h-[300px] flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-300 backdrop-blur-md">
            <Icon size={23} />
          </div>

          {badge && (
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-2xl font-black text-white">
            {title}
          </h3>

          <p className="max-w-md text-sm leading-6 text-slate-300">
            {description}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">
            Explore

            <ArrowUpRight
              size={17}
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
};


/* =========================================================
   SCHOOL TYPE CARD
========================================================= */

const SchoolTypeCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  delay,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 text-left transition-all duration-500 hover:border-cyan-400/30 hover:bg-white/[0.06]"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 transition duration-500 group-hover:scale-110 group-hover:bg-cyan-400/15">
        <Icon size={23} />
      </div>

      <h3 className="text-xl font-black text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-cyan-300">
        Explore

        <ChevronRight
          size={17}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </motion.button>
  );
};


/* =========================================================
   FAQ DATA
========================================================= */

const faqs = [
  {
    question: "What can I do on Scholiqen?",
    answer:
      "Scholiqen brings your learning experience together in one place. You can access courses, CBT practice, virtual laboratories, novels, school information and other learning resources.",
  },
  {
    question: "Can I practice CBT examinations?",
    answer:
      "Yes. The CBT section allows you to practice examination questions across available subjects and review your performance after completing a practice session.",
  },
  {
    question: "Can I access learning materials?",
    answer:
      "Yes. Depending on your available courses and school resources, you can access lessons, learning materials, activities and other educational resources.",
  },
  {
    question: "Is Scholiqen available on mobile devices?",
    answer:
      "Yes. The dashboard is designed to work across desktop, tablet and mobile screen sizes.",
  },
];


/* =========================================================
   FAQ ITEM
========================================================= */

const FAQItem = ({
  question,
  answer,
  index,
  open,
  setOpen,
}) => {
  const isOpen = open === index;

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(isOpen ? null : index)}
        className="flex w-full items-center justify-between gap-5 py-5 text-left"
      >
        <span className="font-bold text-white">
          {question}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-cyan-300"
        >
          <X size={17} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-7 text-slate-400">
              {answer}
            </p>
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

  const [openFaq, setOpenFaq] = useState(null);

  /* =======================================================
     WELCOME BACK TYPEWRITER
  ======================================================= */

  const welcomeText = "Welcome Back 👋";
  const [typedWelcome, setTypedWelcome] = useState("");

  useEffect(() => {
    let index = 0;
    let deleting = false;
    let timeoutId;

    const animateText = () => {
      if (!deleting) {
        index += 1;

        setTypedWelcome(
          welcomeText.slice(0, index)
        );

        if (index >= welcomeText.length) {
          deleting = true;

          timeoutId = setTimeout(
            animateText,
            1800
          );

          return;
        }

        timeoutId = setTimeout(
          animateText,
          105
        );

        return;
      }

      index -= 1;

      setTypedWelcome(
        welcomeText.slice(0, index)
      );

      if (index <= 0) {
        deleting = false;

        timeoutId = setTimeout(
          animateText,
          500
        );

        return;
      }

      timeoutId = setTimeout(
        animateText,
        65
      );
    };

    animateText();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);


  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* =====================================================
          BACKGROUND AMBIENCE
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.035] blur-[120px]" />

        <div className="absolute right-[-10%] top-[40%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.04] blur-[120px]" />

        <div className="absolute bottom-[-10%] left-[30%] h-[450px] w-[450px] rounded-full bg-indigo-500/[0.03] blur-[120px]" />

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-8 sm:px-6 lg:px-10">


        {/* ===================================================
            WELCOME HERO
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="group relative mb-10 min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl"
        >

          {/* HOME BACKGROUND */}

          {home_d && (
            <img
              src={home_d}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[70%_center] transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025]"
            />
          )}


          {/* GENERAL OVERLAY */}

          <div className="absolute inset-0 bg-slate-950/40" />


          {/* LEFT OVERLAY
              Still dark enough for text,
              but allows the image to show through. */}

          <div className="absolute inset-y-0 left-0 w-[65%] bg-gradient-to-r from-slate-950/80 via-slate-950/48 to-transparent" />


          {/* RIGHT OVERLAY */}

          <div className="absolute inset-y-0 right-0 w-[35%] bg-gradient-to-l from-slate-950/15 to-transparent" />


          {/* BOTTOM DARKNESS */}

          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950/75 to-transparent" />


          {/* TOP FADE */}

          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/25 to-transparent" />


          {/* CYAN LIGHT */}

          <div className="absolute right-[15%] top-[15%] h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-3xl" />


          {/* CONTENT */}

          <div className="relative z-10 flex min-h-[430px] items-center p-7 sm:p-10 lg:p-14">

            <div className="max-w-3xl">

              {/* SMALL LABEL */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.25,
                }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-md"
              >
                <Sparkles size={14} />

                Your Learning Space
              </motion.div>


              {/* =================================================
                  TYPEWRITER
              ================================================= */}

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.15,
                }}
                className="min-h-[1.2em] text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {typedWelcome}

                <span className="ml-1 inline-block font-light text-cyan-400 animate-pulse">
                  |
                </span>
              </motion.h1>


              {/* DESCRIPTION */}

              <motion.p
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.35,
                }}
                className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
              >
                Everything you need to learn, practice, explore and grow is
                right here.
              </motion.p>


              {/* BUTTONS */}

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
                  duration: 0.7,
                  delay: 0.45,
                }}
                className="mt-8 flex flex-wrap gap-3"
              >

                <button
                  type="button"
                  onClick={() => navigate("/lms")}
                  className="group/btn inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition duration-300 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <BookOpen size={17} />

                  Start Learning

                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                  />
                </button>


                <button
                  type="button"
                  onClick={() => navigate("/cbt")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:border-cyan-400/30 hover:bg-white/15"
                >
                  <PlayCircle size={17} />

                  Practice CBT

                  <ChevronRight size={17} />
                </button>

              </motion.div>


              {/* FEATURE PILLS */}

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.7,
                }}
                className="mt-8 flex flex-wrap gap-2"
              >

                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                  Learn
                </span>

                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                  Practice
                </span>

                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                  Grow
                </span>

              </motion.div>

            </div>

          </div>


          {/* BOTTOM LINE */}

          <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        </motion.div>



        {/* ===================================================
            MAIN MODULES
        =================================================== */}

        <section className="mb-20">

          <div className="mb-7 flex items-end justify-between gap-5">

            <div>

              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                Explore
              </p>

              <h2 className="text-3xl font-black tracking-tight text-white">
                Your Learning Hub
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Jump into the tools and resources that power your learning
                journey.
              </p>

            </div>

          </div>


          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <Card
              image={lms}
              title="LMS Portal"
              description="Access your classes, lessons, assignments and learning materials."
              icon={BookOpen}
              badge="Learn"
              delay={0.1}
              onClick={() => navigate("/lms")}
            />

            <Card
              image={virtual}
              title="Virtual Laboratory"
              description="Experiment, simulate and understand difficult concepts through interactive labs."
              icon={Sparkles}
              badge="Explore"
              delay={0.18}
              onClick={() => navigate("/lab")}
            />

            <Card
              image={novel}
              title="Novel Library"
              description="Discover books and stories while building your reading experience."
              icon={Library}
              badge="Read"
              delay={0.26}
              onClick={() => navigate("/novels")}
            />

            <Card
              image={cbt}
              title="CBT Practice"
              description="Practice examination questions, improve your speed and track your performance."
              icon={Trophy}
              badge="Practice"
              delay={0.34}
              onClick={() => navigate("/cbt")}
            />

          </div>

        </section>



     {/* ===================================================
    SCHOLIQEN ACADEMY
========================================================= */}

<section className="mb-20">

  <motion.div
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7 }}
    className="group relative min-h-[400px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900"
  >

    {/* BACKGROUND IMAGE */}
    <img
      src={school}
      alt=""
      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
    />

    {/* EVEN DARK OVERLAY */}
    <div className="absolute inset-0 bg-slate-950/70" />

    {/* CENTERED CONTENT */}
    <div className="relative z-10 flex min-h-[400px] items-center justify-center px-6 py-10 text-center sm:px-10 lg:px-14">

      <div className="mx-auto max-w-3xl">

        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
          <GraduationCap size={14} />
          Scholiqen Academy
        </span>

        <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Discover where your
          <span className="text-cyan-300"> future begins.</span>
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Explore universities, colleges and polytechnics and discover
          programmes that can shape your academic journey.
        </p>

        <button
          type="button"
          onClick={() => navigate("/academy")}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition duration-300 hover:bg-cyan-300"
        >
          Explore Academy
          <ArrowUpRight size={17} />
        </button>

      </div>

    </div>

  </motion.div>

</section>

        {/* ===================================================
            SCHOOLS
        =================================================== */}

        <section className="mb-20">

          <div className="mb-7">

            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              Institutions
            </p>

            <h2 className="text-3xl font-black text-white">
              Explore Schools
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Discover institutions and explore programmes available for your
              academic journey.
            </p>

          </div>


          <div className="grid gap-5 md:grid-cols-3">

            <SchoolTypeCard
              icon={GraduationCap}
              title="Universities"
              description="Explore universities and discover faculties, departments and programmes."
              delay={0.1}
              onClick={() => navigate("/universities")}
            />

            <SchoolTypeCard
              icon={Users}
              title="Colleges"
              description="Explore colleges and available academic opportunities."
              delay={0.18}
              onClick={() => navigate("/colleges")}
            />

            <SchoolTypeCard
              icon={Trophy}
              title="Polytechnics"
              description="Explore polytechnics and practical career-focused programmes."
              delay={0.26}
              onClick={() => navigate("/polytechnics")}
            />

          </div>

        </section>



        {/* ===================================================
            CALENDAR
        =================================================== */}

        <section className="mb-20">

          <div className="mb-7">

            <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              <CalendarDays size={14} />

              Your Schedule
            </p>

            <h2 className="text-3xl font-black text-white">
              My Calendar
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Keep track of your learning activities and important dates.
            </p>

          </div>


          <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.025] p-4 sm:p-6">

            <MyCalendar />

          </div>

        </section>



        {/* ===================================================
            FAQ
        =================================================== */}

        <section className="mb-20">

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <HelpCircle size={23} />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                Help Centre
              </p>

              <h2 className="mt-3 text-3xl font-black text-white">
                Frequently Asked Questions
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                Everything you need to know about using your Scholiqen learning
                space.
              </p>

              <button
                type="button"
                onClick={() => navigate("/help")}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
              >
                Visit Help Centre

                <ArrowUpRight size={16} />
              </button>

            </div>


            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.025] px-6">

              {faqs.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  {...faq}
                  index={index}
                  open={openFaq}
                  setOpen={setOpenFaq}
                />
              ))}

            </div>

          </div>

        </section>



        {/* ===================================================
            FINAL CTA
        =================================================== */}

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
            duration: 0.7,
          }}
          className="relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-blue-500/[0.05] to-transparent p-8 sm:p-10 lg:p-12"
        >

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/[0.08] blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

            <div>

              <div className="mb-3 flex items-center gap-2 text-cyan-300">

                <MessageCircle size={18} />

                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  Need help?
                </span>

              </div>

              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Keep learning. Keep growing.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Your next lesson, practice session or discovery is only a few
                clicks away.
              </p>

            </div>


            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 transition duration-300 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              Get Support

              <ArrowUpRight size={17} />
            </button>

          </div>

        </motion.section>

      </main>



      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/10 bg-slate-950">

        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">

          <div>

            <p className="text-sm font-black text-white">
              Scholiqen
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Learn • Practice • Grow
            </p>

          </div>


          <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500">

            <button
              type="button"
              onClick={() => navigate("/help")}
              className="transition hover:text-cyan-300"
            >
              Help
            </button>

            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="transition hover:text-cyan-300"
            >
              Contact
            </button>

            <button
              type="button"
              onClick={() => navigate("/privacy")}
              className="transition hover:text-cyan-300"
            >
              Privacy
            </button>

            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="transition hover:text-cyan-300"
            >
              Terms
            </button>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default Dashboard;