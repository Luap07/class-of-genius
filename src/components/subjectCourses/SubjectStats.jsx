import React from "react";
import {
  BookOpen,
  Users,
  Star,
  PlayCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SubjectStats({
  courses = 0,
  students = 0,
  lessons = 0,
  rating = 0,
}) {
  const stats = [
    {
      title: "Courses",
      value: courses,
      icon: BookOpen,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Students",
      value: students.toLocaleString(),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Lessons",
      value: lessons,
      icon: PlayCircle,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Rating",
      value: rating,
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
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
            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg}`}
            >
              <Icon
                size={26}
                className={item.color}
              />
            </div>

            <h2 className="mt-6 text-4xl font-black">
              {item.value}
            </h2>

            <p className="mt-2 text-slate-400">
              {item.title}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}