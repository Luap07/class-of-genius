// src/components/courses/CourseGrid.jsx

import React from "react";
import { motion } from "framer-motion";

import CourseCard from "./CourseCard";

const CourseGrid = ({
  courses = [],
  loading = false,
  onCourseOpen = () => {},
}) => {

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

        {[1,2,3,4,5,6,7,8].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 animate-pulse"
          >

            <div className="h-52 bg-slate-800" />

            <div className="p-6 space-y-4">

              <div className="h-4 w-24 rounded bg-slate-700" />

              <div className="h-6 w-3/4 rounded bg-slate-700" />

              <div className="grid grid-cols-2 gap-4">

                <div className="h-4 rounded bg-slate-700" />
                <div className="h-4 rounded bg-slate-700" />
                <div className="h-4 rounded bg-slate-700" />
                <div className="h-4 rounded bg-slate-700" />

              </div>

              <div className="h-12 rounded-2xl bg-slate-700" />

            </div>

          </div>
        ))}

      </div>
    );
  }


  if (!courses.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-20 text-center">

        <h2 className="text-3xl font-bold">
          No Courses Found
        </h2>

        <p className="mt-4 text-slate-400">
          Try another search or choose another category.
        </p>

      </div>
    );
  }


  return (
    <motion.div
      layout
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >

      {courses.map((course) => (

        <CourseCard

          key={course.id}

          course={course}

          onOpen={() => onCourseOpen(course)}

        />

      ))}

    </motion.div>
  );
};


export default CourseGrid;