import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Clock3,
  GraduationCap,
  Users,
  Star,
  Trophy,
  PlayCircle,
} from "lucide-react";

import ModuleCard from "../../../components/lms/courses/ModuleCard";
import { useCourses } from "../../../context/LMSContext/CourseContext";

const CourseDetails = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const {
    courses = [],
    openModule,
  } = useCourses();

  const course =
    courses.find(
      (item) => String(item.id) === String(courseId)
    ) || null;

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">

          <BookOpen
            size={70}
            className="mx-auto text-slate-600"
          />

          <h1 className="text-3xl font-bold mt-6">
            Course Not Found
          </h1>

          <p className="text-slate-400 mt-3">
            This course doesn't exist or has been removed.
          </p>

          <button
            onClick={() => navigate("/lms/courses")}
            className="
              mt-8
              px-6
              py-3
              rounded-2xl
              bg-blue-600
              hover:bg-blue-700
              transition
            "
          >
            Back to Courses
          </button>

        </div>
      </div>
    );
  }

  const {
    title,
    category,
    description,
    thumbnail,
    level,
    instructor,
    duration,
    rating,
    students,
    modules = [],
  } = course;
    return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">

      {/* ==========================================
          BACK BUTTON
      ========================================== */}

      <button
        onClick={() => navigate(-1)}
        className="
          flex
          items-center
          gap-2
          text-slate-400
          hover:text-white
          transition
        "
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* ==========================================
          HERO
      ========================================== */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          rounded-3xl
          overflow-hidden
          border
          border-slate-800
          bg-slate-900
        "
      >

        <div className="grid lg:grid-cols-2">

          {/* Thumbnail */}

          <div className="h-[320px] bg-gradient-to-r from-blue-700 to-cyan-600 flex items-center justify-center">

            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen
                size={100}
                className="text-white/70"
              />
            )}

          </div>

          {/* Course Info */}

          <div className="p-8 flex flex-col justify-center">

            <span className="inline-block w-fit px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-sm font-semibold">
              {category}
            </span>

            <h1 className="text-4xl font-bold mt-5">
              {title}
            </h1>

            <p className="text-slate-400 mt-5 leading-7">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-5 mt-8">

              <div className="flex items-center gap-3">
                <GraduationCap className="text-blue-400" />
                <div>
                  <p className="text-slate-500 text-sm">
                    Level
                  </p>
                  <p>{level}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock3 className="text-cyan-400" />
                <div>
                  <p className="text-slate-500 text-sm">
                    Duration
                  </p>
                  <p>{duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="text-purple-400" />
                <div>
                  <p className="text-slate-500 text-sm">
                    Students
                  </p>
                  <p>{students}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Star className="text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="text-slate-500 text-sm">
                    Rating
                  </p>
                  <p>{rating}</p>
                </div>
              </div>

            </div>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                className="
                  flex
                  items-center
                  gap-2
                  bg-blue-600
                  hover:bg-blue-700
                  transition
                  px-6
                  py-3
                  rounded-2xl
                  font-semibold
                "
              >
                <PlayCircle size={20} />
                Start Learning
              </button>

              <button
                className="
                  px-6
                  py-3
                  rounded-2xl
                  border
                  border-slate-700
                  hover:border-slate-500
                  transition
                "
              >
                Save Course
              </button>

            </div>

          </div>

        </div>

      </motion.div>
          {/* ==========================================
          CONTENT
      ========================================== */}

      <div className="grid xl:grid-cols-3 gap-8">

        {/* ======================================
            MODULES
        ====================================== */}

        <div className="xl:col-span-2">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-3xl font-bold">
                Course Modules
              </h2>

              <p className="text-slate-400 mt-2">
                Select a module to start learning.
              </p>

            </div>

            <span
              className="
                px-4
                py-2
                rounded-full
                bg-blue-600/20
                text-blue-400
                font-semibold
              "
            >
              {modules.length} Modules
            </span>

          </div>

          <div className="space-y-6">

            {modules.length === 0 ? (

              <div
                className="
                  rounded-3xl
                  border
                  border-dashed
                  border-slate-700
                  p-12
                  text-center
                "
              >

                <BookOpen
                  size={60}
                  className="mx-auto text-slate-600"
                />

                <h3 className="text-2xl font-bold mt-5">
                  No Modules Yet
                </h3>

                <p className="text-slate-400 mt-3">
                  The administrator hasn't uploaded any PDFs for this course yet.
                </p>

              </div>

            ) : (

              modules.map((module) => (

                <ModuleCard
                  key={module.id}
                  module={module}
                  onOpen={openModule}
                />

              ))

            )}

          </div>

        </div>

        {/* ======================================
            SIDEBAR
        ====================================== */}

        <div className="space-y-6">

          {/* Progress */}

          <div
            className="
              rounded-3xl
              bg-slate-900
              border
              border-slate-800
              p-6
            "
          >

            <h3 className="text-xl font-bold">
              Course Progress
            </h3>

            <div className="mt-6">

              <div className="flex justify-between text-sm">

                <span className="text-slate-400">
                  Completion
                </span>

                <span className="font-semibold">
                  {course.progress ?? 0}%
                </span>

              </div>

              <div className="mt-3 h-3 rounded-full bg-slate-800 overflow-hidden">

                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${course.progress ?? 0}%`,
                  }}
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                />

              </div>

            </div>

          </div>

          {/* Course Stats */}

          <div
            className="
              rounded-3xl
              bg-slate-900
              border
              border-slate-800
              p-6
            "
          >

            <h3 className="text-xl font-bold mb-6">
              Course Information
            </h3>

            <div className="space-y-5">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Instructor
                </span>
                <span>
                  {instructor || "Admin"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Modules
                </span>
                <span>
                  {modules.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Duration
                </span>
                <span>
                  {duration}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Students
                </span>
                <span>
                  {students}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Rating
                </span>
                <span>
                  ⭐ {rating}
                </span>
              </div>

            </div>

          </div>

          {/* Achievement */}

          <div
            className="
              rounded-3xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              p-6
            "
          >

            <Trophy size={40} />

            <h3 className="text-2xl font-bold mt-5">
              Finish This Course
            </h3>

            <p className="mt-3 text-white/90">
              Complete every module to unlock your certificate.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CourseDetails;