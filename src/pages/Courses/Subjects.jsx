import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Globe,
  Laptop,
  Briefcase,
  Palette,
  BookOpen,
  ArrowRight,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

const ICONS = {
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  mathematics: Calculator,
  math: Calculator,
  geography: Globe,
  "computer science": Laptop,
  computing: Laptop,
  ict: Laptop,
  accounting: Briefcase,
  economics: Briefcase,
  business: Briefcase,
  commerce: Briefcase,
  "fine art": Palette,
  art: Palette,
};

export default function Subjects() {
  const navigate = useNavigate();
  const { category } = useParams();

  const { courses, loading } = useCourses();

  const decodedCategory = decodeURIComponent(category || "")
    .toLowerCase()
    .trim();

  const subjects = useMemo(() => {
    const map = new Map();

    courses.forEach((course) => {
      const courseCategory = String(course.category || "")
        .toLowerCase()
        .trim();

      if (courseCategory !== decodedCategory) return;

      const subject = String(course.subject || "").trim();

      if (!subject) return;

      const key = subject.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          id:
            course.subject_slug ||
            subject.toLowerCase().replace(/\s+/g, "-"),
          name: subject,
          description:
            course.subject_description ||
            `Explore ${subject} courses`,
          totalCourses: 1,
        });
      } else {
        map.get(key).totalCourses++;
      }
    });

    return [...map.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [courses, decodedCategory]);

  if (loading) {
    return (
      <div className="mt-14">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center">
          <BookOpen
            size={42}
            className="mx-auto text-cyan-400 animate-pulse"
          />

          <h2 className="mt-5 text-2xl font-bold">
            Loading Subjects...
          </h2>
        </div>
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="mt-14">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-12 text-center">
          <BookOpen
            size={42}
            className="mx-auto text-cyan-400"
          />

          <h2 className="mt-5 text-2xl font-bold">
            No Subjects Found
          </h2>

          <p className="mt-3 text-slate-400">
            No subjects have been added for this category yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-black">
            Subjects
          </h2>

          <p className="mt-2 text-slate-400">
            Select a subject to continue learning.
          </p>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-300">
          {subjects.length} Subject
          {subjects.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject, index) => {
          const Icon =
            ICONS[subject.name.toLowerCase()] || BookOpen;

          return (
            <motion.div
              key={subject.id}
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
                delay: index * 0.05,
              }}
              whileHover={{
                y: -8,
              }}
              onClick={() =>
                navigate(
                  `/courses/${encodeURIComponent(
                    category
                  )}/${encodeURIComponent(subject.id)}`
                )
              }
              className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#091421] p-8 transition-all duration-300 hover:border-cyan-500"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15">
                <Icon
                  size={30}
                  className="text-cyan-400"
                />
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {subject.name}
              </h3>

              <p className="mt-3 text-slate-400 line-clamp-2">
                {subject.description}
              </p>

              <div className="mt-6 inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                {subject.totalCourses} Course
                {subject.totalCourses !== 1 ? "s" : ""}
              </div>

              <div className="mt-8 flex items-center gap-2 font-semibold text-cyan-400">
                Open Subject

                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-2"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}