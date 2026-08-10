import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Lightbulb,
  Target,
  Trophy,
  TrendingUp,
  Sparkles,
  Play,
  Compass,
  Award,
} from "lucide-react";

const LearningStats = () => {
  const navigate = useNavigate();

  /* =========================================================
     STATIC LEARNING CONTENT
     No Supabase
     No tracking
     No database
  ========================================================= */

  const learningTracks = [
    {
      icon: GraduationCap,
      title: "Build Your Foundation",
      description:
        "Strengthen your understanding of important concepts before moving into more advanced topics.",
      tag: "Foundation",
      iconClass: "bg-cyan-400/10 text-cyan-400",
    },
    {
      icon: Brain,
      title: "Practice & Understand",
      description:
        "Use practice questions and learning materials to turn what you study into real understanding.",
      tag: "Practice",
      iconClass: "bg-violet-400/10 text-violet-400",
    },
    {
      icon: Target,
      title: "Focus on Your Goals",
      description:
        "Choose the subjects and learning materials that matter most to your academic goals.",
      tag: "Focus",
      iconClass: "bg-blue-400/10 text-blue-400",
    },
  ];

  const quickActions = [
    {
      icon: BookOpen,
      title: "Explore Courses",
      description:
        "Discover learning materials and courses available to you.",
      path: "/lms",
      iconClass: "bg-cyan-400/10 text-cyan-400",
    },
    {
      icon: Brain,
      title: "Practice CBT",
      description:
        "Test your knowledge with examination practice questions.",
      path: "/cbt",
      iconClass: "bg-violet-400/10 text-violet-400",
    },
    {
      icon: Compass,
      title: "Explore Learning",
      description:
        "Find another subject, resource, or learning experience.",
      path: "/explore",
      iconClass: "bg-blue-400/10 text-blue-400",
    },
  ];

  const learningTips = [
    "Understand the concept before trying to memorize it.",
    "Short focused study sessions can be more effective than long distracted sessions.",
    "Practice what you learn instead of only reading about it.",
    "When something is difficult, break it into smaller ideas.",
    "Review important concepts regularly to strengthen your understanding.",
  ];

  const todayTip =
    learningTips[
      new Date().getDate() % learningTips.length
    ];

  /* =========================================================
     STAT CARD
  ========================================================= */

  const StatCard = ({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
    delay = 0,
  }) => {
    return (
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
          duration: 0.4,
          delay,
        }}
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          border-white/5
          bg-white/[0.02]
          p-5
          transition
          hover:border-white/10
          hover:bg-white/[0.04]
        "
      >
        <div
          className={`absolute -right-10 -top-10 h-24 w-24 rounded-full blur-3xl ${iconClass}`}
        />

        <div className="relative">
          <div
            className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={20} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-black tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <ArrowLeft size={17} />
            Back to Profile
          </button>

          <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 sm:flex">
            <Sparkles size={14} />
            Scholiqen
          </div>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

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
            duration: 0.45,
          }}
          className="
            relative
            mb-7
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-cyan-950/30
            p-7
            shadow-2xl
            sm:p-9
          "
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
              <TrendingUp
                size={22}
                className="text-cyan-400"
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Learning Track
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Keep Moving Forward
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              A simple learning space to help you stay focused,
              discover useful resources, practice what you know,
              and keep building your academic journey.
            </p>
          </div>
        </motion.div>

        {/* =====================================================
            QUICK OVERVIEW
        ===================================================== */}

        <div className="mb-8">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Your Learning
            </p>

            <h2 className="mt-1 text-xl font-black">
              Learning Overview
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              icon={BookOpen}
              label="Learn"
              value="Courses"
              description="Explore structured learning materials."
              iconClass="bg-cyan-400/10 text-cyan-400"
              delay={0.05}
            />

            <StatCard
              icon={Brain}
              label="Practice"
              value="CBT"
              description="Challenge yourself with questions."
              iconClass="bg-violet-400/10 text-violet-400"
              delay={0.1}
            />

            <StatCard
              icon={Target}
              label="Focus"
              value="Goals"
              description="Keep your learning direction clear."
              iconClass="bg-blue-400/10 text-blue-400"
              delay={0.15}
            />

            <StatCard
              icon={Flame}
              label="Mindset"
              value="Consistency"
              description="Small progress still moves you forward."
              iconClass="bg-orange-400/10 text-orange-400"
              delay={0.2}
            />

          </div>
        </div>

        {/* =====================================================
            CURRENT LEARNING TRACK
        ===================================================== */}

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
            duration: 0.4,
            delay: 0.2,
          }}
          className="mb-8"
        >
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Track
            </p>

            <h2 className="mt-1 text-xl font-black">
              Your Learning Path
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {learningTracks.map((track, index) => {
              const Icon = track.icon;

              return (
                <motion.div
                  key={track.title}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: 0.25 + index * 0.05,
                  }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-white/5
                    bg-white/[0.02]
                    p-6
                    transition
                    hover:border-cyan-400/10
                    hover:bg-white/[0.04]
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${track.iconClass}`}
                    >
                      <Icon size={21} />
                    </div>

                    <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {track.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-black text-white">
                    {track.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {track.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <CheckCircle2 size={14} />
                    Recommended direction
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* =====================================================
            FOCUS CARD
        ===================================================== */}

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
            duration: 0.4,
            delay: 0.25,
          }}
          className="
            relative
            mb-8
            overflow-hidden
            rounded-[2rem]
            border
            border-violet-400/10
            bg-gradient-to-br
            from-violet-500/10
            via-white/[0.02]
            to-white/[0.01]
            p-6
            sm:p-7
          "
        >
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-400">
                <Target size={22} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-400">
                  Recommended Focus
                </p>

                <h2 className="mt-1 text-xl font-black text-white">
                  Learn something today
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Pick one useful topic, give it your attention,
                  and make today's learning session count.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/lms")}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-violet-500
                px-5
                py-3
                text-sm
                font-black
                text-white
                transition
                hover:bg-violet-400
                active:scale-[0.98]
              "
            >
              <Play size={16} />
              Start Learning
            </button>
          </div>
        </motion.div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div className="mb-8">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Explore
            </p>

            <h2 className="mt-1 text-xl font-black">
              Continue Your Journey
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <motion.button
                  key={action.title}
                  type="button"
                  onClick={() => navigate(action.path)}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + index * 0.05,
                  }}
                  className="
                    group
                    rounded-[2rem]
                    border
                    border-white/5
                    bg-white/[0.02]
                    p-6
                    text-left
                    transition
                    hover:border-white/10
                    hover:bg-white/[0.04]
                  "
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.iconClass}`}
                    >
                      <Icon size={20} />
                    </div>

                    <TrendingUp
                      size={17}
                      className="text-slate-700 transition group-hover:text-cyan-400"
                    />
                  </div>

                  <h3 className="mt-5 font-black text-white">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>

                  <div className="mt-5 text-xs font-bold text-cyan-400">
                    Explore →
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            LEARNING TIP
        ===================================================== */}

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
            duration: 0.4,
            delay: 0.35,
          }}
          className="
            mb-8
            rounded-[2rem]
            border
            border-yellow-400/10
            bg-yellow-400/[0.03]
            p-6
            sm:p-7
          "
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Lightbulb size={20} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-400">
                Learning Tip
              </p>

              <p className="mt-2 text-base font-bold leading-7 text-white">
                {todayTip}
              </p>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            ACHIEVEMENT MINDSET
        ===================================================== */}

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
            duration: 0.4,
            delay: 0.4,
          }}
          className="
            mb-10
            rounded-[2rem]
            border
            border-emerald-400/10
            bg-gradient-to-br
            from-emerald-500/[0.08]
            to-white/[0.02]
            p-6
            sm:p-7
          "
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
              <Award size={25} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                Keep Going
              </p>

              <h2 className="mt-1 text-xl font-black text-white">
                Every learning session matters.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                You don't need to track every minute or every
                activity. Focus on understanding, practicing,
                and becoming better one step at a time.
              </p>
            </div>

            <div className="sm:ml-auto">
              <Trophy
                size={34}
                className="text-emerald-400/40"
              />
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="border-t border-white/5 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Sparkles size={14} />

            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
              Scholiqen
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-700">
            Your learning. Your journey. Your progress.
          </p>
        </div>

      </div>
    </section>
  );
};

export default LearningStats;
