import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useProfile } from "../../context/LMSContext/ProfileContext";
import Footer from "../../components/lms/Footer";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

const stagger = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/* =========================================================
   LEARNING AREAS
========================================================= */

const learningAreas = [
  {
    icon: BookOpen,
    number: "01",
    title: "Core Knowledge",
    description:
      "Build a strong understanding of the concepts and ideas that form the foundation of your subjects.",
    topics: [
      "Clear explanations",
      "Essential concepts",
      "Structured learning",
    ],
  },

  {
    icon: Brain,
    number: "02",
    title: "Critical Thinking",
    description:
      "Develop the ability to analyse information, solve problems and approach difficult questions with confidence.",
    topics: [
      "Problem solving",
      "Logical reasoning",
      "Analytical thinking",
    ],
  },

  {
    icon: FlaskConical,
    number: "03",
    title: "Practical Application",
    description:
      "Move beyond theory by connecting what you learn with practical situations and real-world applications.",
    topics: [
      "Practical examples",
      "Experiments",
      "Real-world learning",
    ],
  },

  {
    icon: Zap,
    number: "04",
    title: "Skills Development",
    description:
      "Strengthen the academic and practical skills you need to become a more capable and independent learner.",
    topics: [
      "Academic skills",
      "Study techniques",
      "Independent learning",
    ],
  },

  {
    icon: Target,
    number: "05",
    title: "Assessment & Practice",
    description:
      "Test your understanding through meaningful practice and assessment that helps reveal areas for improvement.",
    topics: [
      "Practice questions",
      "CBT preparation",
      "Self-assessment",
    ],
  },

  {
    icon: Rocket,
    number: "06",
    title: "Continuous Growth",
    description:
      "Keep developing your knowledge, confidence and learning habits as you progress through your academic journey.",
    topics: [
      "Consistent learning",
      "Personal growth",
      "Long-term improvement",
    ],
  },
];

/* =========================================================
   FEATURES
========================================================= */

const features = [
  {
    icon: GraduationCap,
    title: "Structured Learning",
    description:
      "A focused learning environment designed to make studying clearer and more organised.",
  },

  {
    icon: Brain,
    title: "Think Deeper",
    description:
      "Develop stronger reasoning and problem-solving skills instead of simply memorising information.",
  },

  {
    icon: FlaskConical,
    title: "Learn by Doing",
    description:
      "Connect classroom knowledge with practical activities, experiments and real-world examples.",
  },

  {
    icon: MessageCircle,
    title: "Learning Support",
    description:
      "Get guidance and support when you need help understanding challenging concepts.",
  },

  {
    icon: Target,
    title: "Practice & Prepare",
    description:
      "Reinforce your knowledge with practice activities and assessment opportunities.",
  },

  {
    icon: Trophy,
    title: "Grow With Confidence",
    description:
      "Build the knowledge, skills and confidence needed to take on bigger academic challenges.",
  },
];

/* =========================================================
   OUTCOMES
========================================================= */

const outcomes = [
  {
    icon: CheckCircle2,
    title: "Stronger Understanding",
    description:
      "Understand important concepts instead of relying only on memorisation.",
  },

  {
    icon: Brain,
    title: "Better Thinking",
    description:
      "Approach questions and problems with stronger reasoning and confidence.",
  },

  {
    icon: FlaskConical,
    title: "Practical Skills",
    description:
      "Understand how academic knowledge can be applied beyond the classroom.",
  },

  {
    icon: Trophy,
    title: "Academic Confidence",
    description:
      "Become more comfortable tackling lessons, assignments and examinations.",
  },

  {
    icon: MessageCircle,
    title: "Communication",
    description:
      "Express ideas more clearly through better understanding and organised thinking.",
  },

  {
    icon: Rocket,
    title: "Long-Term Growth",
    description:
      "Develop learning habits that continue to benefit you throughout your education.",
  },
];

/* =========================================================
   SECTION HEADING
========================================================= */

const SectionHeading = ({
  eyebrow,
  title,
  description,
}) => {
  return (
    <motion.div
      variants={fadeUp}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
        <Sparkles className="h-3.5 w-3.5" />

        {eyebrow}
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
        {description}
      </p>
    </motion.div>
  );
};

/* =========================================================
   FEATURE CARD
========================================================= */

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -6,
      }}
      transition={{
        duration: 0.2,
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-cyan-500/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   LEARNING CARD
========================================================= */

const LearningCard = ({
  icon: Icon,
  number,
  title,
  description,
  topics,
}) => {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -6,
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-xl transition-colors duration-300 hover:border-blue-500/30"
    >
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/[0.06] blur-3xl transition-all duration-500 group-hover:bg-blue-500/[0.1]" />

      <div className="relative">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300">
            <Icon className="h-6 w-6" />
          </div>

          <span className="text-xs font-semibold tracking-[0.2em] text-slate-600">
            {number}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-white">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {description}
        </p>

        <div className="mt-6 space-y-2.5">
          {topics.map((topic) => (
            <div
              key={topic}
              className="flex items-center gap-2 text-sm text-slate-500"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

              {topic}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   OUTCOME CARD
========================================================= */

const OutcomeCard = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <motion.div
      variants={fadeUp}
      className="flex gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/35 p-5 backdrop-blur-xl"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const navigate = useNavigate();

  const { profile } = useProfile();

  const displayName =
    profile?.username ||
    profile?.full_name ||
    profile?.fullName ||
    profile?.name ||
    "Student";

  const firstName = displayName.split(" ")[0];

  /* =======================================================
     GO TO COURSES
  ======================================================= */

  const goToCourses = () => {
    navigate("/courses");
  };

  /* =======================================================
     GREETING
  ======================================================= */

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 17) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  /* =======================================================
     SCROLL TO LEARNING EXPERIENCE
  ======================================================= */

  const scrollToLearning = () => {
    document
      .getElementById("learning-experience")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =======================================================
     SCROLL TO LEARNING AREAS
  ======================================================= */

  const scrollToLearningAreas = () => {
    document
      .getElementById("learning-areas")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* =====================================================
          GLOBAL BACKGROUND
      ===================================================== */}

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      <div className="pointer-events-none fixed left-[5%] top-[10%] h-96 w-96 rounded-full bg-blue-600/[0.06] blur-[140px]" />

      <div className="pointer-events-none fixed right-[5%] top-[35%] h-96 w-96 rounded-full bg-cyan-500/[0.045] blur-[150px]" />

      <div className="pointer-events-none fixed bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/[0.035] blur-[150px]" />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative isolate overflow-hidden">

        <div className="mx-auto max-w-[1500px] px-6 pb-24 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pb-32 lg:pt-24">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto max-w-5xl text-center"
          >

            {/* HERO BADGE */}

            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-4 py-2 text-xs font-medium text-blue-300 shadow-lg shadow-blue-950/20">

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>

                Scholiqen Learning Management System

              </div>
            </motion.div>

            {/* GREETING */}

            <motion.p
              variants={fadeUp}
              className="mt-8 text-sm font-medium text-slate-500"
            >
              {getGreeting()}, {firstName}
            </motion.p>

            {/* HERO TITLE */}

            <motion.h1
              variants={fadeUp}
              className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Learn with purpose.

              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Grow with confidence.
              </span>
            </motion.h1>

            {/* HERO DESCRIPTION */}

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8"
            >
              Welcome to a learning environment designed to help you
              understand more, think better, practise what you learn,
              and build the confidence to keep moving forward.
            </motion.p>

            {/* HERO BUTTONS */}

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >

              {/* COURSES */}

              <button
                type="button"
                onClick={goToCourses}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:bg-blue-400 hover:shadow-blue-500/20"
              >
                <BookOpen className="h-4 w-4" />

                Courses

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* EXPLORE LEARNING */}

              <button
                type="button"
                onClick={scrollToLearning}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-800"
              >
                <Brain className="h-4 w-4 text-cyan-300" />

                Explore Learning

                <ArrowRight className="h-4 w-4 opacity-60 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* DISCOVER MORE */}

              <button
                type="button"
                onClick={scrollToLearningAreas}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-6 py-3.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-slate-600 hover:bg-slate-900 hover:text-white"
              >
                <Sparkles className="h-4 w-4 text-blue-300" />

                Discover More

                <ArrowRight className="h-4 w-4 opacity-60 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

            </motion.div>

          </motion.div>

          {/* HERO VISUAL */}

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
              duration: 0.8,
            }}
            className="relative mx-auto mt-20 max-w-5xl"
          >

            <div className="absolute inset-0 rounded-3xl bg-blue-500/[0.08] blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-1 shadow-2xl shadow-black/30 backdrop-blur-xl">

              <div className="rounded-[22px] border border-slate-800/70 bg-slate-950/80 p-5 sm:p-7">

                <div className="grid gap-4 sm:grid-cols-3">

                  {/* LEARN */}

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-white">
                      Learn
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Understand concepts clearly and build strong
                      foundations.
                    </p>

                  </div>

                  {/* PRACTISE */}

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                      <Brain className="h-5 w-5" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-white">
                      Practise
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Apply your knowledge and strengthen your
                      understanding.
                    </p>

                  </div>

                  {/* GROW */}

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300">
                      <Rocket className="h-5 w-5" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-white">
                      Grow
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Turn knowledge into confidence and lasting
                      skills.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      </section>

      {/* =====================================================
          LEARNING EXPERIENCE
      ===================================================== */}

      <section
        id="learning-experience"
        className="relative scroll-mt-20 px-6 py-24 sm:px-8 lg:px-12 lg:py-28"
      >

        <div className="mx-auto max-w-[1400px]">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
          >

            <SectionHeading
              eyebrow="The Learning Experience"
              title="Everything is built around better learning."
              description="Scholiqen brings together the tools, learning experiences and support you need to make your academic journey more effective."
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                />
              ))}

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="relative border-y border-slate-800/60 bg-slate-900/[0.18] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">

        <div className="mx-auto max-w-[1200px]">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={stagger}
          >

            <SectionHeading
              eyebrow="A Better Approach"
              title="Learn. Practise. Master."
              description="Learning becomes more powerful when knowledge is followed by practice and reflection."
            />

            <div className="relative grid gap-8 md:grid-cols-3">

              <div className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-blue-500/10 via-cyan-400/40 to-blue-500/10 md:block" />

              {[
                {
                  number: "01",
                  icon: BookOpen,
                  title: "Learn",
                  description:
                    "Build your knowledge through clear explanations and structured learning experiences.",
                },

                {
                  number: "02",
                  icon: Lightbulb,
                  title: "Practise",
                  description:
                    "Use questions, activities and practical experiences to reinforce what you understand.",
                },

                {
                  number: "03",
                  icon: Rocket,
                  title: "Master",
                  description:
                    "Develop confidence by applying your knowledge and continuously improving your skills.",
                },
              ].map((step) => (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  className="relative text-center"
                >

                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-400/20 bg-slate-950 shadow-xl shadow-blue-950/20">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                      <step.icon className="h-6 w-6" />
                    </div>

                    <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-[10px] font-bold text-cyan-300">
                      {step.number}
                    </span>

                  </div>

                  <h3 className="mt-7 text-xl font-semibold text-white">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>

                </motion.div>
              ))}

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          LEARNING AREAS
      ===================================================== */}

      <section
        id="learning-areas"
        className="relative scroll-mt-20 px-6 py-24 sm:px-8 lg:px-12 lg:py-32"
      >

        <div className="mx-auto max-w-[1400px]">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            variants={stagger}
          >

            <SectionHeading
              eyebrow="What You'll Develop"
              title="Build more than just knowledge."
              description="A strong education is about understanding, thinking, applying, practising and continuing to grow."
            />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {learningAreas.map((area) => (
                <LearningCard
                  key={area.number}
                  {...area}
                />
              ))}

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          LEARNING OUTCOMES
      ===================================================== */}

      <section className="relative border-y border-slate-800/60 bg-slate-900/[0.16] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">

        <div className="mx-auto max-w-[1200px]">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            variants={stagger}
          >

            <SectionHeading
              eyebrow="Learning Outcomes"
              title="Where your learning can take you."
              description="The goal is not simply to complete lessons. It is to become a stronger, more confident and more capable learner."
            />

            <div className="grid gap-4 md:grid-cols-2">

              {outcomes.map((outcome) => (
                <OutcomeCard
                  key={outcome.title}
                  {...outcome}
                />
              ))}

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12 lg:py-32">

        <div className="mx-auto max-w-[1100px]">

          <motion.div
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
            }}
            transition={{
              duration: 0.7,
            }}
            className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.09] via-slate-900/80 to-cyan-500/[0.05] p-8 text-center shadow-2xl shadow-blue-950/20 sm:p-12 lg:p-16"
          >

            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-blue-500/[0.1] blur-[100px]" />

            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                <GraduationCap className="h-7 w-7" />
              </div>

              <h2 className="mt-7 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Keep learning.

                <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Keep growing.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Your learning journey is built one concept, one
                practice session and one breakthrough at a time.
              </p>

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

    </div>
  );
};

export default Dashboard;