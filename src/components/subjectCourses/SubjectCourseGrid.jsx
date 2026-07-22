import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

import SubjectCourseCard from "./SubjectCourseCard";

export default function SubjectCourseGrid({
  courses,
  navigate,
}) {
  if (!courses.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-14"
      >
        <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-900/60 p-20 text-center backdrop-blur-xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-800">
            <BookOpen
              size={48}
              className="text-slate-500"
            />
          </div>

          <h2 className="mt-8 text-3xl font-black">
            No Courses Available
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400">
            There are currently no published courses under this
            subject. Once an instructor publishes a course, it
            will automatically appear here.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3"
    >
      {courses.map((course) => (
        <SubjectCourseCard
          key={course.id}
          course={course}
          navigate={navigate}
        />
      ))}
    </motion.div>
  );
}