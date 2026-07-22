import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useCourses } from "../../context/LMSContext/CourseContext";

import SubjectHero from "../../components/subjectCourses/SubjectHero";
import SubjectStats from "../../components/subjectCourses/SubjectStats";
import SubjectCourseGrid from "../../components/subjectCourses/SubjectCourseGrid";
import SubjectBottomCTA from "../../components/subjectCourses/SubjectBottomCTA";

export default function SubjectCourses() {
  const navigate = useNavigate();

  const {
    category,
    subject,
  } = useParams();

  const {
    courses,
    loading,
  } = useCourses();

  const decodedCategory = decodeURIComponent(category || "")
    .toLowerCase()
    .trim();

  const decodedSubject = decodeURIComponent(subject || "")
    .toLowerCase()
    .trim();

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const categoryMatch =
        String(course.category || "")
          .toLowerCase()
          .trim() === decodedCategory;

      const subjectMatch =
        String(course.subject || "")
          .toLowerCase()
          .trim() === decodedSubject;

      return categoryMatch && subjectMatch;
    });
  }, [
    courses,
    decodedCategory,
    decodedSubject,
  ]);

  const totalStudents = filteredCourses.reduce(
    (sum, course) => sum + (course.students || 0),
    0
  );

  const totalLessons = filteredCourses.reduce(
    (sum, course) => sum + (course.lessons || 0),
    0
  );

  const averageRating =
    filteredCourses.length > 0
      ? (
          filteredCourses.reduce(
            (sum, course) =>
              sum + (course.rating || 0),
            0
          ) / filteredCourses.length
        ).toFixed(1)
      : "0.0";
        return (
    <div className="min-h-screen overflow-hidden bg-[#050B14] text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#102845_0%,#050B14_60%)]" />

        <div className="absolute left-0 top-20 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[160px]" />

        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[170px]" />

        <div
          className="absolute inset-0 opacity-[0.04]
          [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)]
          [background-size:45px_45px]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <SubjectHero
            navigate={navigate}
            category={decodedCategory}
            subject={decodedSubject}
            totalCourses={filteredCourses.length}
          />
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.5,
          }}
        >
          <SubjectStats
            courses={filteredCourses.length}
            students={totalStudents}
            lessons={totalLessons}
            rating={averageRating}
          />
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 35,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
          className="mt-14"
        >
          <SubjectCourseGrid
            loading={loading}
            courses={filteredCourses}
          />
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <SubjectBottomCTA />
        </motion.div>
      </div>
    </div>
  );
}