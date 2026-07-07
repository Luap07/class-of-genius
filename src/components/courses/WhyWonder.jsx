import React from "react";
import { motion } from "framer-motion";
import {
  Bot,
  BookOpen,
  FlaskConical,
  Award,
  BarChart3,
  Globe2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "24/7 AI Tutor",
    description:
      "Get instant explanations, personalized learning paths, quizzes, and study assistance anytime.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: FlaskConical,
    title: "Interactive Virtual Labs",
    description:
      "Perform realistic science experiments directly in your browser with live simulations.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-green-500/10",
  },
  {
    icon: BookOpen,
    title: "Global Course Library",
    description:
      "Access thousands of learning resources, university materials, PDFs, and structured lessons.",
    color: "text-blue-400",
    bg: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: Award,
    title: "Professional Certificates",
    description:
      "Earn certificates after completing courses and showcase your achievements.",
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with analytics, achievements, and personalized recommendations.",
    color: "text-violet-400",
    bg: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: Globe2,
    title: "Learn Anywhere",
    description:
      "Study from any device, anywhere in the world, at your own pace.",
    color: "text-pink-400",
    bg: "from-pink-500/20 to-rose-500/10",
  },
];

const WhyWonder = () => {
  return (
    <section className="space-y-12">

      {/* Heading */}

      <div className="text-center max-w-3xl mx-auto">

        <span
          className="
            inline-flex
            px-4
            py-2
            rounded-full
            border
            border-blue-500/30
            bg-blue-500/10
            text-blue-400
            font-semibold
            text-sm
          "
        >
          Why Choose Wonder?
        </span>

        <h2 className="mt-5 text-4xl font-extrabold">
          A Complete Learning Ecosystem
        </h2>

        <p className="mt-4 text-lg text-slate-400">
          More than just courses. Wonder combines AI,
          virtual laboratories, assessments, certifications,
          and intelligent learning tools into one platform.
        </p>

      </div>

      {/* Cards */}

      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

        {features.map((feature, index) => {
          const Icon = feature.icon;

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
                y: -8,
                scale: 1.02,
              }}
              className={`
                rounded-3xl
                border
                border-slate-800
                bg-gradient-to-br
                ${feature.bg}
                p-8
              `}
            >

              <div
                className={`
                  w-16
                  h-16
                  rounded-2xl
                  bg-slate-900
                  flex
                  items-center
                  justify-center
                  ${feature.color}
                `}
              >
                <Icon size={30} />
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-4 text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              <button
                className="
                  mt-8
                  flex
                  items-center
                  gap-2
                  font-semibold
                  text-blue-400
                  hover:text-blue-300
                  transition
                "
              >
                Learn More

                <ArrowRight size={18} />
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
        className="
          rounded-[32px]
          overflow-hidden
          bg-gradient-to-r
          from-blue-600
          via-cyan-500
          to-indigo-600
          p-10
          lg:p-14
        "
      >

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          <div>

            <h2 className="text-4xl font-extrabold">
              One Platform.
              <br />
              Unlimited Learning.
            </h2>

            <p className="mt-5 text-blue-100 text-lg leading-relaxed">
              Learn from school subjects, university courses,
              professional certifications, AI-powered tutoring,
              virtual laboratories, and career-focused learning
              paths—all in one place.
            </p>

            <button
              className="
                mt-8
                bg-white
                text-slate-900
                rounded-2xl
                px-8
                py-4
                font-bold
                hover:scale-105
                transition
              "
            >
              Start Learning Today
            </button>

          </div>

          <div className="grid grid-cols-2 gap-5">

            <div className="rounded-3xl bg-white/10 backdrop-blur p-6">
              <h3 className="text-3xl font-bold">
                100+
              </h3>
              <p className="mt-2 text-blue-100">
                Learning Categories
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 backdrop-blur p-6">
              <h3 className="text-3xl font-bold">
                AI
              </h3>
              <p className="mt-2 text-blue-100">
                Personalized Learning
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 backdrop-blur p-6">
              <h3 className="text-3xl font-bold">
                Live
              </h3>
              <p className="mt-2 text-blue-100">
                Interactive Simulations
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 backdrop-blur p-6">
              <h3 className="text-3xl font-bold">
                Global
              </h3>
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