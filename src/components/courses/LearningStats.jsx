import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Award,
  Globe2,
  GraduationCap,
  Building2,
} from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: "120,000+",
    title: "Courses",
    description:
      "High-quality courses across every discipline.",
    color: "text-blue-400",
    bg: "from-blue-500/20 to-cyan-500/10",
  },
  {
    icon: Users,
    value: "5M+",
    title: "Students",
    description:
      "Learners from around the world trust Wonder.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-green-500/10",
  },
  {
    icon: Award,
    value: "250,000+",
    title: "Certificates",
    description:
      "Professional certificates earned by learners.",
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-orange-500/10",
  },
  {
    icon: Globe2,
    value: "190+",
    title: "Countries",
    description:
      "A truly global learning community.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-sky-500/10",
  },
  {
    icon: Building2,
    value: "500+",
    title: "Institutions",
    description:
      "Universities and organizations contributing content.",
    color: "text-violet-400",
    bg: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: GraduationCap,
    value: "98%",
    title: "Completion Rate",
    description:
      "Students consistently achieve their goals.",
    color: "text-pink-400",
    bg: "from-pink-500/20 to-rose-500/10",
  },
];

const LearningStats = () => {
  return (
    <section className="space-y-10">

      <div className="text-center max-w-3xl mx-auto">

        <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-blue-400 text-sm font-semibold">
          Platform Statistics
        </span>

        <h2 className="mt-5 text-4xl font-extrabold">
          Learning Without Limits
        </h2>

        <p className="mt-4 text-slate-400 text-lg">
          Join millions of learners building skills, earning
          certificates, and advancing their careers through
          Wonder Learning.
        </p>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className={`
                rounded-3xl
                border
                border-slate-800
                bg-gradient-to-br
                ${item.bg}
                backdrop-blur
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
                  ${item.color}
                `}
              >
                <Icon size={32} />
              </div>

              <h3 className="mt-6 text-4xl font-extrabold">
                {item.value}
              </h3>

              <p className="mt-2 text-xl font-semibold">
                {item.title}
              </p>

              <p className="mt-4 text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          );
        })}

      </div>
    </section>
  );
};

export default LearningStats;