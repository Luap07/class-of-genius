// src/pages/lms/Dashboard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Lightbulb,
  PlayCircle,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { useProfile } from "../../context/LMSContext/ProfileContext";

import Footer from "../../components/lms/Footer";

/* =========================================================
   HELPERS
========================================================= */

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const formatDate = () =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

/* =========================================================
   SECTION WRAPPER
========================================================= */

const Section = ({ children, className = "" }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.section>
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
  iconClass,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -6,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border border-white/[0.07]
        bg-[#0b1220]
        p-6
        shadow-[0_20px_70px_rgba(0,0,0,0.16)]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-cyan-500/[0.04]
          blur-3xl
          transition
          duration-500
          group-hover:bg-cyan-500/[0.08]
        "
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              ${iconClass}
            `}
          >
            <Icon size={25} />
          </div>

          <span
            className="
              text-4xl
              font-black
              tracking-tight
              text-white/[0.05]
            "
          >
            {number}
          </span>
        </div>

        <h3
          className="
            mt-7
            text-xl
            font-bold
            tracking-tight
            text-white
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-slate-500
          "
        >
          {description}
        </p>

        <div className="mt-6 space-y-3">
          {topics.map((topic) => (
            <div
              key={topic}
              className="
                flex
                items-start
                gap-3
                text-sm
                text-slate-400
              "
            >
              <CheckCircle2
                size={17}
                className="
                  mt-0.5
                  shrink-0
                  text-cyan-400
                "
              />

              <span>{topic}</span>
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
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        rounded-[24px]
        border border-white/[0.07]
        bg-[#0b1220]
        p-6
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-cyan-500/10
          text-cyan-400
        "
      >
        <Icon size={22} />
      </div>

      <h3
        className="
          mt-5
          text-lg
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-slate-500
        "
      >
        {description}
      </p>
    </motion.div>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const profileContext = useProfile() || {};

  const {
    profile,
  } = profileContext;

  /* =======================================================
     USER
  ======================================================= */

  const displayName =
    profile?.username ||
    profile?.full_name ||
    profile?.fullName ||
    profile?.name ||
    "Student";

  const firstName =
    String(displayName)
      .trim()
      .split(/\s+/)[0] || "Student";

  /* =======================================================
     LEARNING CONTENT
  ======================================================= */

  const learningAreas = [
    {
      number: "01",
      icon: BookOpen,
      title: "Core Knowledge",
      description:
        "Build a strong understanding of the fundamental concepts that form the foundation of your chosen area of study.",
      topics: [
        "Understand important concepts and principles",
        "Build a strong academic foundation",
        "Connect theory with practical examples",
      ],
      iconClass:
        "bg-cyan-500/10 text-cyan-400",
    },
    {
      number: "02",
      icon: Brain,
      title: "Critical Thinking",
      description:
        "Develop the ability to understand problems, analyse information and make informed decisions using what you learn.",
      topics: [
        "Analyse information effectively",
        "Solve academic and practical problems",
        "Develop independent thinking skills",
      ],
      iconClass:
        "bg-violet-500/10 text-violet-400",
    },
    {
      number: "03",
      icon: Layers3,
      title: "Practical Application",
      description:
        "Move beyond memorising information by learning how knowledge can be applied to realistic situations and challenges.",
      topics: [
        "Apply concepts to practical situations",
        "Work through real-world examples",
        "Build useful problem-solving abilities",
      ],
      iconClass:
        "bg-emerald-500/10 text-emerald-400",
    },
    {
      number: "04",
      icon: Lightbulb,
      title: "Skills Development",
      description:
        "Strengthen the skills needed to learn effectively, communicate ideas clearly and approach new challenges with confidence.",
      topics: [
        "Improve learning and study skills",
        "Communicate ideas more effectively",
        "Build confidence through practice",
      ],
      iconClass:
        "bg-amber-500/10 text-amber-400",
    },
    {
      number: "05",
      icon: Target,
      title: "Assessment & Practice",
      description:
        "Use exercises, questions and practical activities to test your understanding and identify areas that need more attention.",
      topics: [
        "Test your understanding",
        "Identify areas for improvement",
        "Strengthen knowledge through repetition",
      ],
      iconClass:
        "bg-blue-500/10 text-blue-400",
    },
    {
      number: "06",
      icon: Rocket,
      title: "Continuous Growth",
      description:
        "Develop a learning mindset that encourages you to keep improving as you progress through your educational journey.",
      topics: [
        "Build consistent learning habits",
        "Track your development",
        "Prepare for more advanced learning",
      ],
      iconClass:
        "bg-orange-500/10 text-orange-400",
    },
  ];

  const outcomes = [
    {
      icon: GraduationCap,
      title: "Stronger Understanding",
      description:
        "You will develop a clearer and deeper understanding of the subjects and concepts you study.",
    },
    {
      icon: Brain,
      title: "Better Thinking",
      description:
        "You will learn to approach questions, problems and unfamiliar situations more logically.",
    },
    {
      icon: Lightbulb,
      title: "Practical Skills",
      description:
        "You will learn how to move from simply knowing something to understanding how to use it.",
    },
    {
      icon: Award,
      title: "Academic Confidence",
      description:
        "Consistent learning and practice will help you become more confident in your academic abilities.",
    },
    {
      icon: Users,
      title: "Communication",
      description:
        "You will develop the ability to understand, organise and communicate what you have learned.",
    },
    {
      icon: Trophy,
      title: "Long-Term Growth",
      description:
        "The knowledge and skills you develop here provide a foundation for continued learning.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050912] text-white">
      <main
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-4
          py-6
          sm:px-6
          lg:px-8
          lg:py-8
        "
      >

        {/* =================================================
            HERO
        ================================================= */}

        <motion.section
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
          className="
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-white/[0.07]
            bg-[#0a1220]
            shadow-[0_30px_100px_rgba(0,0,0,0.25)]
          "
        >
          {/* BACKGROUND */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
            "
          >
            <div
              className="
                absolute
                -left-32
                -top-32
                h-96
                w-96
                rounded-full
                bg-cyan-500/[0.08]
                blur-[100px]
              "
            />

            <div
              className="
                absolute
                -bottom-40
                right-0
                h-[500px]
                w-[500px]
                rounded-full
                bg-blue-600/[0.06]
                blur-[120px]
              "
            />

            <div
              className="
                absolute
                inset-0
                opacity-[0.035]
                [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)]
                [background-size:36px_36px]
              "
            />
          </div>

          <div
            className="
              relative
              z-10
              p-7
              sm:p-9
              lg:p-12
            "
          >
            <div
              className="
                grid
                gap-10
                lg:grid-cols-[1fr_auto]
                lg:items-center
              "
            >

              {/* HERO CONTENT */}

              <div className="max-w-3xl">

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-cyan-400/15
                    bg-cyan-400/[0.07]
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-cyan-300
                  "
                >
                  <Sparkles size={16} />

                  Your Learning Dashboard
                </div>

                <h1
                  className="
                    mt-6
                    text-4xl
                    font-black
                    leading-[1.05]
                    tracking-tight
                    sm:text-5xl
                    lg:text-6xl
                  "
                >
                  {getGreeting()},

                  <span className="text-cyan-400">
                    {" "}
                    {firstName}
                  </span>
                </h1>

                <p
                  className="
                    mt-5
                    max-w-2xl
                    text-base
                    leading-7
                    text-slate-400
                    sm:text-lg
                  "
                >
                  {formatDate()}
                  <br />
                  <span className="mt-2 block">
                    Your learning journey starts here.
                    Explore the knowledge, skills and
                    practical understanding you will
                    develop throughout your learning
                    experience.
                  </span>
                </p>

              </div>

              {/* HERO SUMMARY */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  lg:w-[340px]
                "
              >

                <div
                  className="
                    rounded-[22px]
                    border
                    border-white/[0.07]
                    bg-black/20
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-cyan-500/10
                      text-cyan-400
                    "
                  >
                    <BookOpen size={20} />
                  </div>

                  <p
                    className="
                      mt-5
                      text-3xl
                      font-black
                    "
                  >
                    01
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    Learn
                  </p>
                </div>

                <div
                  className="
                    rounded-[22px]
                    border
                    border-white/[0.07]
                    bg-black/20
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-violet-500/10
                      text-violet-400
                    "
                  >
                    <Brain size={20} />
                  </div>

                  <p
                    className="
                      mt-5
                      text-3xl
                      font-black
                    "
                  >
                    02
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    Understand
                  </p>
                </div>

                <div
                  className="
                    col-span-2
                    rounded-[22px]
                    border
                    border-white/[0.07]
                    bg-black/20
                    p-5
                  "
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-slate-300
                        "
                      >
                        Your learning journey
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
                        Learn • Practise • Apply • Grow
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-500/10
                        text-emerald-400
                      "
                    >
                      <Rocket size={20} />
                    </div>

                  </div>

                  <div className="mt-5 flex gap-1.5">
                    <div className="h-1.5 flex-1 rounded-full bg-cyan-400" />
                    <div className="h-1.5 flex-1 rounded-full bg-blue-400" />
                    <div className="h-1.5 flex-1 rounded-full bg-violet-400" />
                    <div className="h-1.5 flex-1 rounded-full bg-emerald-400" />
                  </div>

                </div>

              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <Section className="mt-16">
          <div className="max-w-3xl">

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-cyan-500/10
                px-4
                py-2
                text-sm
                font-semibold
                text-cyan-400
              "
            >
              <BookOpen size={16} />
              What You'll Learn
            </div>

            <h2
              className="
                mt-5
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              "
            >
              Build knowledge that goes
              <span className="text-cyan-400">
                {" "}
                beyond the classroom.
              </span>
            </h2>

            <p
              className="
                mt-5
                text-base
                leading-8
                text-slate-500
                sm:text-lg
              "
            >
              This learning experience is designed to
              help you understand concepts, develop useful
              skills, practise what you learn and become
              confident applying your knowledge.
            </p>

          </div>
        </Section>

        {/* =================================================
            LEARNING AREAS
        ================================================= */}

        <Section className="mt-10">

          <div
            className="
              grid
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {learningAreas.map((area) => (
              <LearningCard
                key={area.number}
                {...area}
              />
            ))}
          </div>

        </Section>

        {/* =================================================
            LEARNING PROCESS
        ================================================= */}

        <Section className="mt-16">

          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              border
              border-white/[0.07]
              bg-[#0a1220]
              p-7
              sm:p-9
              lg:p-12
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-72
                w-72
                rounded-full
                bg-cyan-500/[0.05]
                blur-[100px]
              "
            />

            <div className="relative z-10">

              <div className="max-w-2xl">

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-violet-500/10
                      text-violet-400
                    "
                  >
                    <PlayCircle size={21} />
                  </div>

                  <span
                    className="
                      text-sm
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-violet-400
                    "
                  >
                    How You'll Learn
                  </span>
                </div>

                <h2
                  className="
                    mt-5
                    text-3xl
                    font-black
                    tracking-tight
                    sm:text-4xl
                  "
                >
                  Learn at your own pace,
                  <span className="text-violet-400">
                    {" "}
                    one concept at a time.
                  </span>
                </h2>

                <p
                  className="
                    mt-4
                    text-base
                    leading-7
                    text-slate-500
                  "
                >
                  Your learning experience combines
                  explanations, examples, practice and
                  continuous reinforcement so that each
                  concept becomes easier to understand
                  and remember.
                </p>

              </div>

              <div
                className="
                  mt-10
                  grid
                  gap-4
                  md:grid-cols-4
                "
              >

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-black/20
                    p-5
                  "
                >
                  <span
                    className="
                      text-xs
                      font-black
                      text-cyan-400
                    "
                  >
                    01
                  </span>

                  <h3
                    className="
                      mt-4
                      font-bold
                    "
                  >
                    Learn
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Understand the concept and its
                    important principles.
                  </p>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-black/20
                    p-5
                  "
                >
                  <span
                    className="
                      text-xs
                      font-black
                      text-blue-400
                    "
                  >
                    02
                  </span>

                  <h3
                    className="
                      mt-4
                      font-bold
                    "
                  >
                    Practise
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Reinforce your understanding through
                    questions and activities.
                  </p>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-black/20
                    p-5
                  "
                >
                  <span
                    className="
                      text-xs
                      font-black
                      text-violet-400
                    "
                  >
                    03
                  </span>

                  <h3
                    className="
                      mt-4
                      font-bold
                    "
                  >
                    Apply
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Use what you know to solve practical
                    problems and situations.
                  </p>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-black/20
                    p-5
                  "
                >
                  <span
                    className="
                      text-xs
                      font-black
                      text-emerald-400
                    "
                  >
                    04
                  </span>

                  <h3
                    className="
                      mt-4
                      font-bold
                    "
                  >
                    Grow
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Build confidence and prepare for
                    more advanced learning.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </Section>

        {/* =================================================
            WHAT YOU WILL GAIN
        ================================================= */}

        <Section className="mt-16">

          <div className="max-w-2xl">

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-400
                "
              >
                <Award size={21} />
              </div>

              <span
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-emerald-400
                "
              >
                Learning Outcomes
              </span>
            </div>

            <h2
              className="
                mt-5
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              "
            >
              What you'll be able to
              <span className="text-emerald-400">
                {" "}
                do.
              </span>
            </h2>

            <p
              className="
                mt-4
                text-base
                leading-7
                text-slate-500
              "
            >
              The goal is not simply to finish lessons.
              It is to leave each learning experience with
              knowledge and skills you can actually use.
            </p>

          </div>

          <div
            className="
              mt-8
              grid
              gap-4
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            {outcomes.map((outcome) => (
              <OutcomeCard
                key={outcome.title}
                {...outcome}
              />
            ))}
          </div>

        </Section>

        {/* =================================================
            FINAL LEARNING MESSAGE
        ================================================= */}

        <Section className="mt-16">

          <div
            className="
              relative
              overflow-hidden
              rounded-[32px]
              border
              border-cyan-400/[0.10]
              bg-gradient-to-br
              from-cyan-500/[0.08]
              via-[#0a1220]
              to-[#0a1220]
              p-8
              text-center
              sm:p-12
              lg:p-16
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-64
                w-64
                -translate-x-1/2
                rounded-full
                bg-cyan-500/[0.07]
                blur-[100px]
              "
            />

            <div className="relative z-10 mx-auto max-w-3xl">

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-500/10
                  text-cyan-400
                "
              >
                <Sparkles size={28} />
              </div>

              <h2
                className="
                  mt-7
                  text-3xl
                  font-black
                  tracking-tight
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Your learning journey is
                <span className="text-cyan-400">
                  {" "}
                  just beginning.
                </span>
              </h2>

              <p
                className="
                  mx-auto
                  mt-5
                  max-w-2xl
                  text-base
                  leading-8
                  text-slate-500
                  sm:text-lg
                "
              >
                Every lesson is an opportunity to
                understand something new, practise a
                valuable skill and become better than you
                were yesterday.
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-3
                  text-sm
                  font-semibold
                  text-slate-400
                "
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-cyan-400"
                  />
                  Learn with purpose
                </span>

                <span className="text-slate-700">
                  •
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-cyan-400"
                  />
                  Practise consistently
                </span>

                <span className="text-slate-700">
                  •
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-cyan-400"
                  />
                  Keep growing
                </span>
              </div>

            </div>
          </div>

        </Section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-12">
          <Footer />
        </div>

      </main>
    </div>
  );
};

export default Dashboard;