// src/components/courses/CategoriesStats.jsx

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FolderOpen,
  Users,
  Award,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

export default function CategoriesStats() {
  const {
    courses = [],
    categories = [],
  } = useCourses();

  const totalStudents = useMemo(() => {
    return courses.reduce(
      (total, course) => total + Number(course.students || 0),
      0
    );
  }, [courses]);

  const totalCertificates = useMemo(() => {
    return courses.filter((course) => course.certificate).length;
  }, [courses]);

  const stats = [
    {
      icon: BookOpen,
      value: courses.length,
      label: "Courses",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      icon: FolderOpen,
      value: categories.length,
      label: "Categories",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Users,
      value: totalStudents.toLocaleString(),
      label: "Students",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Award,
      value: totalCertificates,
      label: "Certificates",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="mt-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl"
            >
              <div className="flex justify-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg}`}
                >
                  <Icon
                    size={30}
                    className={item.color}
                  />
                </div>
              </div>

              <h2 className="mt-6 text-center text-4xl font-black">
                {item.value}
              </h2>

              <p className="mt-3 text-center text-slate-400">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}