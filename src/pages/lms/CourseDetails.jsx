import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useCourses } from "../../context/LMScontext/CourseContext";

// Components
import CourseHero from "../../components/courseDetails/CourseHero";
import CourseNav from "../../components/courseDetails/CourseNav";
import CourseOverview from "../../components/courseDetails/CourseOverview";
import LearningOutcomes from "../../components/courseDetails/LearningOutcomes";
import ModuleAccordion from "../../components/courseDetails/ModuleAccordion";
import InstructorCard from "../../components/courseDetails/InstructorCard";
import CourseReviews from "../../components/courseDetails/CourseReviews";
import RelatedCourses from "../../components/courseDetails/RelatedCourses";
import CourseFAQ from "../../components/courseDetails/CourseFAQ";

const CourseDetails = () => {
  const { id } = useParams();

  const { courses = [] } = useCourses();

  const course =
    courses.find(
      (item) =>
        String(item.id) === String(id) ||
        item.slug === id
    ) || courses[0];

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">

        <div className="text-center">

          <h1 className="text-4xl font-bold">
            Course Not Found
          </h1>

          <p className="mt-4 text-slate-400">
            The requested course could not be found.
          </p>

        </div>

      </div>
    );
  }

  const relatedCourses = courses.filter(
    (item) =>
      item.category === course.category &&
      item.id !== course.id
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        max-w-7xl
        mx-auto
        px-6
        py-10
        space-y-10
      "
    >
      {/* Hero */}

      <CourseHero course={course} />

      {/* Main Layout */}

      <div
        className="
          grid
          lg:grid-cols-12
          gap-8
          items-start
        "
      >
        {/* Left Navigation */}

        <aside
          className="
            lg:col-span-3
            sticky
            top-24
            h-fit
          "
        >
          <CourseNav />
        </aside>

        {/* Right Content */}

        <main
          className="
            lg:col-span-9
            space-y-10
          "
        >
                      {/* =========================
              Overview
          ========================= */}

          <section id="overview">
            <CourseOverview
              course={course}
            />
          </section>

          {/* =========================
              Learning Outcomes
          ========================= */}

          <section id="outcomes">
            <LearningOutcomes
              course={course}
            />
          </section>

          {/* =========================
              Curriculum
          ========================= */}

          <section id="curriculum">
            <ModuleAccordion
              course={course}
            />
          </section>

          {/* =========================
              Instructor
          ========================= */}

          <section id="instructor">
            <InstructorCard
              instructor={
                course.instructor
              }
              course={course}
            />
          </section>

          {/* =========================
              Reviews
          ========================= */}

          <section id="reviews">
            <CourseReviews
              course={course}
            />
          </section>

          {/* =========================
              FAQ
          ========================= */}

          <section id="faq">
            <CourseFAQ
              course={course}
            />
          </section>

          {/* =========================
              Related Courses
          ========================= */}

          <section id="related">
            <RelatedCourses
              courses={relatedCourses}
            />
          </section>

        </main>

      </div>
          </motion.div>
  );
};

export default CourseDetails;