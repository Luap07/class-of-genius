import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  CheckCircle2,
  Brain,
  Trophy,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const defaultOutcomes = [
  "Understand the core concepts from beginner to advanced level.",
  "Apply knowledge through real-world projects and case studies.",
  "Develop problem-solving and critical thinking skills.",
  "Build confidence using practical exercises and assessments.",
  "Prepare for academic success and professional careers.",
  "Earn a certificate after successfully completing the course.",
];

const LearningOutcomes = ({ course }) => {
  const outcomes =
    course.learningOutcomes ||
    course.outcomes ||
    defaultOutcomes;

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900
        p-8
        lg:p-10
      "
    >
      {/* Header */}

      <div className="flex items-center gap-4">

        <div
          className="
            h-16
            w-16
            rounded-2xl
            bg-emerald-600/10
            text-emerald-400
            flex
            items-center
            justify-center
          "
        >
          <Target size={30} />
        </div>

        <div>

          <h2 className="text-3xl font-bold">
            Learning Outcomes
          </h2>

          <p className="mt-2 text-slate-400">
            By the end of this course you will confidently master these skills.
          </p>

        </div>

      </div>

      {/* Outcome Cards */}

      <div className="mt-10 grid lg:grid-cols-2 gap-6">

        {outcomes.map((item, index) => (

          <motion.div
            key={index}
            whileHover={{
              x: 8,
            }}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              p-6
            "
          >

            <div className="flex items-start gap-4">

              <div
                className="
                  h-12
                  w-12
                  rounded-xl
                  bg-green-500/15
                  flex
                  items-center
                  justify-center
                  text-green-400
                "
              >
                <CheckCircle2 size={22} />
              </div>

              <div>

                <h4 className="font-semibold">
                  Outcome {index + 1}
                </h4>

                <p className="mt-3 text-slate-400 leading-7">
                  {item}
                </p>

              </div>

            </div>

          </motion.div>

        ))}

      </div>
            {/* =========================
          Skills Mastery
      ========================= */}

      <div className="mt-16">

        <h3 className="text-2xl font-bold">
          Skills You'll Master
        </h3>

        <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          {(course.skills || [
            "Critical Thinking",
            "Problem Solving",
            "Communication",
            "Practical Experience",
          ]).map((skill, index) => (

            <motion.div
              key={index}
              whileHover={{
                y: -8,
              }}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-6
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  h-16
                  w-16
                  rounded-2xl
                  bg-blue-600/15
                  text-blue-400
                  flex
                  items-center
                  justify-center
                "
              >

                <Brain size={30} />

              </div>

              <h4 className="mt-5 font-semibold">
                {skill}
              </h4>

              <p className="mt-3 text-sm text-slate-400">
                Master this skill through lessons,
                quizzes and practical projects.
              </p>

            </motion.div>

          ))}

        </div>

      </div>

      {/* =========================
          Achievement Levels
      ========================= */}

      <div className="mt-16">

        <h3 className="text-2xl font-bold">
          Achievement Milestones
        </h3>

        <div className="mt-8 space-y-6">

          {[
            "Complete all lessons",
            "Pass every quiz",
            "Finish practical weeklytasks",
            "Complete the capstone project",
            "Earn your Wonder Certificate",
          ].map((item, index) => (

            <motion.div
              key={index}
              whileHover={{
                x: 6,
              }}
              className="
                flex
                items-center
                gap-5
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-6
              "
            >

              <div
                className="
                  h-12
                  w-12
                  rounded-xl
                  bg-amber-500/15
                  flex
                  items-center
                  justify-center
                  text-amber-400
                "
              >

                <Trophy size={22} />

              </div>

              <div>

                <h4 className="font-semibold">
                  Milestone {index + 1}
                </h4>

                <p className="mt-2 text-slate-400">
                  {item}
                </p>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

      {/* =========================
          Learning Roadmap
      ========================= */}

      <div className="mt-16">

        <h3 className="text-2xl font-bold">
          Your Learning Journey
        </h3>

        <div className="mt-8 grid lg:grid-cols-4 gap-6">

          {[
            "Learn",
            "Practice",
            "Build",
            "Master",
          ].map((step, index) => (

            <motion.div
              key={step}
              whileHover={{
                scale: 1.03,
              }}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-6
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  h-14
                  w-14
                  rounded-full
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-xl
                "
              >

                {index + 1}

              </div>

              <h4 className="mt-5 font-bold">
                {step}
              </h4>

              <p className="mt-3 text-slate-400 text-sm">

                Progress through this stage to
                unlock the next milestone.

              </p>

            </motion.div>

          ))}

        </div>

      </div>
            {/* =========================
          Wonder AI Recommendations
      ========================= */}

      <div className="mt-16">

        <div
          className="
            rounded-[30px]
            bg-gradient-to-r
            from-violet-700
            via-indigo-700
            to-blue-700
            p-8
          "
        >

          <div className="flex items-start gap-5">

            <div
              className="
                h-16
                w-16
                rounded-2xl
                bg-white/10
                flex
                items-center
                justify-center
              "
            >
              <Sparkles size={32} />
            </div>

            <div>

              <h3 className="text-3xl font-bold">

                Wonder AI Recommendation

              </h3>

              <p className="mt-5 text-indigo-100 leading-8">

                Learn a little every day instead of trying to
                complete everything at once. Complete quizzes
                after each module, ask the AI Tutor whenever
                you're confused, and build every recommended
                project to maximize retention.

              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =========================
          Success Statistics
      ========================= */}

      <div className="mt-16">

        <h3 className="text-2xl font-bold">

          Success Statistics

        </h3>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">

          <motion.div
            whileHover={{ y: -6 }}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              p-6
              text-center
            "
          >

            <TrendingUp
              className="mx-auto text-green-400"
              size={32}
            />

            <h2 className="mt-5 text-4xl font-bold">
              95%
            </h2>

            <p className="mt-2 text-slate-400">
              Completion Rate
            </p>

          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              p-6
              text-center
            "
          >

            <Brain
              className="mx-auto text-blue-400"
              size={32}
            />

            <h2 className="mt-5 text-4xl font-bold">
              24/7
            </h2>

            <p className="mt-2 text-slate-400">
              AI Assistance
            </p>

          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              p-6
              text-center
            "
          >

            <Trophy
              className="mx-auto text-amber-400"
              size={32}
            />

            <h2 className="mt-5 text-4xl font-bold">
              100%
            </h2>

            <p className="mt-2 text-slate-400">
              Practical Learning
            </p>

          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              p-6
              text-center
            "
          >

            <Target
              className="mx-auto text-purple-400"
              size={32}
            />

            <h2 className="mt-5 text-4xl font-bold">
              50+
            </h2>

            <p className="mt-2 text-slate-400">
              Skill Assessments
            </p>

          </motion.div>

        </div>

      </div>

      {/* =========================
          Final Motivation
      ========================= */}

      <div
        className="mt-16 rounded-[30px] border border-blue-700/40 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-10 text-center">

        <h2 className="text-4xl font-bold">

          Your Success Starts Today 🚀

        </h2>

        <p className="mt-6 max-w-3xl mx-auto text-slate-300 leading-8">

          Every lesson you complete brings you one step closer
          to mastering this subject. Stay consistent, complete
          your projects, challenge yourself with quizzes and
          let Wonder AI guide you whenever you need help.

        </p>

        <button
          className="
            mt-8
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            transition
            px-10
            py-4
            font-bold
          "
        >

          Continue Learning

        </button>

      </div>

    </motion.section>
  );
};

export default LearningOutcomes;