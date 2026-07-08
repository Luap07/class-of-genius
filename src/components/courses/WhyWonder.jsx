import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  BookOpen,
  FlaskConical,
  Award,
  BarChart3,
  Globe2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "24/7 AI Tutor",
    description:
      "Get instant explanations, personalized learning paths, quizzes, and study assistance anytime.",
    details:
      "Scholiqen AI acts like a personal teacher. Ask questions, generate quizzes, receive step-by-step explanations, solve assignments, and get personalized study recommendations based on your strengths and weaknesses.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: FlaskConical,
    title: "Interactive Virtual Labs",
    description:
      "Perform realistic science experiments directly in your browser.",
    details:
      "Carry out Physics, Chemistry, Biology, and Mathematics experiments with real-time simulations, animations, graphs, and instant feedback—without needing a physical laboratory.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-green-500/10",
  },
  {
    icon: BookOpen,
    title: "Global Course Library",
    description:
      "Access thousands of structured learning materials.",
    details:
      "Explore secondary school subjects, university courses, professional certifications, coding tutorials, business training, downloadable PDFs, videos, and interactive lessons.",
    color: "text-blue-400",
    bg: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: Award,
    title: "Professional Certificates",
    description:
      "Earn certificates after completing your learning.",
    details:
      "Complete courses, quizzes, and assignments to unlock certificates that showcase your achievements and learning progress.",
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Monitor your learning journey in real time.",
    details:
      "Track completed lessons, study streaks, quiz scores, assignments, certificates, and recommendations with a personalized learning dashboard.",
    color: "text-violet-400",
    bg: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: Globe2,
    title: "Learn Anywhere",
    description:
      "Access scholiqen from any device, anywhere.",
    details:
      "Whether you're using a phone, tablet, or computer, scholiqen keeps your learning synchronized so you can continue exactly where you stopped.",
    color: "text-pink-400",
    bg: "from-pink-500/20 to-rose-500/10",
  },
];

const  WhyWonder = () => {
  const [openCard, setOpenCard] = useState(null);

  return (
    <section className="space-y-12">

      {/* Heading */}

      <div className="text-center max-w-3xl mx-auto">

        <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
          Why Choose Scholiqen?
        </span>

        <h2 className="mt-5 text-4xl font-extrabold">
          A Complete Learning Ecosystem
        </h2>

        <p className="mt-4 text-lg text-slate-400">
          More than just courses. Scholiqen combines AI,
          virtual laboratories, assessments, certifications,
          and intelligent learning tools into one platform.
        </p>

      </div>

      {/* Feature Cards */}

      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

        {features.map((feature, index) => {

          const Icon = feature.icon;
          const expanded = openCard === index;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
                duration: 0.4,
              }}
              whileHover={{
                y: -6,
              }}
              className={`rounded-3xl border border-slate-800 bg-gradient-to-br ${feature.bg} p-8`}
            >

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 ${feature.color}`}
              >
                <Icon size={30} />
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                {feature.description}
              </p>

              <AnimatePresence>

                {expanded && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="overflow-hidden"
                  >

                    <p className="mt-5 leading-7 text-slate-300">
                      {feature.details}
                    </p>

                  </motion.div>

                )}

              </AnimatePresence>

              <button
                onClick={() =>
                  setOpenCard(
                    expanded ? null : index
                  )
                }
                className="mt-6 flex items-center gap-2 font-semibold text-blue-400 transition hover:text-blue-300"
              >

                {expanded ? "Show Less" : "Read More"}

                {expanded ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}

              </button>

            </motion.div>
          );

        })}

      </div>

      {/* Bottom Banner */}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 p-10 lg:p-14"
      >

        <div className="grid items-center gap-10 lg:grid-cols-2">

          <div>

            <h2 className="text-4xl font-extrabold">
              One Platform.
              <br />
              Unlimited Learning.
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-blue-100">
              Learn from school subjects, university courses,
              professional certifications, AI-powered tutoring,
              virtual laboratories, and career-focused learning
              paths—all in one place.
            </p>

            <button className="mt-8 rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 transition hover:scale-105">
              Start Learning Today
            </button>

          </div>

          <div className="grid grid-cols-2 gap-5">

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <h3 className="text-3xl font-bold">100+</h3>
              <p className="mt-2 text-blue-100">
                Learning Categories
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <h3 className="text-3xl font-bold">AI</h3>
              <p className="mt-2 text-blue-100">
                Personalized Learning
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <h3 className="text-3xl font-bold">Live</h3>
              <p className="mt-2 text-blue-100">
                Interactive Simulations
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
              <h3 className="text-3xl font-bold">Global</h3>
              <p className="mt-2 text-blue-100">
                Accessible Anywhere
              </p>
            </div>

          </div>

        </div>

      </motion.div>

    </section>
  );
};

export default WhyWonder;