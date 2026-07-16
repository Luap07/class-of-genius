// src/pages/lms/ExploreCourses.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

import { useCourses } from "../../context/LMScontext/CourseContext";

import CourseGrid from "../../components/courses/CourseGrid";

const ExploreCourses = () => {
  const navigate = useNavigate();

  const {
    courses,
    loading,
  } = useCourses();

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}

        <div className="mb-10">

          <h1 className="text-5xl font-black">
            Explore Courses
          </h1>

          <p className="mt-4 text-slate-400">
            Browse all available courses on Scholiqen.
          </p>

          <div className="mt-6 text-sm text-cyan-400">
            {courses.length} Course{courses.length !== 1 ? "s" : ""} Available
          </div>

        </div>

        {/* Courses */}

        <CourseGrid
          courses={courses}
          loading={loading}
          onCourseOpen={(course) =>
            navigate(`/courses/${course.slug || course.id}`)
          }
        />

      </div>
    </div>
  );
};

export default ExploreCourses;