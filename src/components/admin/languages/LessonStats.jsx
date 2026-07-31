import React from "react";
import { motion } from "framer-motion";

import {
  BookOpen,
  CheckCircle,
  Globe,
  Clock,
} from "lucide-react";

export default function LessonStats({
  totalLessons,
  activeLessons,
  totalLanguages,
  totalHours,
}) {
  const stats = [
    {
      title: "Total Lessons",
      value: totalLessons,
      icon: BookOpen,
      color: "from-indigo-500 to-violet-500",
    },
    {
      title: "Active Lessons",
      value: activeLessons,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Languages",
      value: totalLanguages,
      icon: Globe,
      color: "from-cyan-500 to-sky-500",
    },
    {
      title: "Total Duration",
      value: `${totalHours} mins`,
      icon: Clock,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.title}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.08,
            }}
            whileHover={{
              y: -6,
            }}
            className="
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-[#111827]
              p-6
            "
          >
            <div
              className={`
                absolute
                inset-x-0
                top-0
                h-1
                bg-gradient-to-r
                ${stat.color}
              `}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {stat.title}
                </p>

                <h2 className="mt-3 text-4xl font-black text-white">
                  {stat.value}
                </h2>
              </div>

              <div
                className={`
                  rounded-2xl
                  bg-gradient-to-br
                  ${stat.color}
                  p-4
                `}
              >
                <Icon
                  className="text-white"
                  size={28}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}