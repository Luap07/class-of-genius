import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  BookOpen,
  Users,
  Star,
  PlayCircle,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

export default function SubjectCourses() {

  const navigate = useNavigate();

  const {
    category,
    subject,
  } = useParams();

  const {
    courses = [],
  } = useCourses();

  const filteredCourses = useMemo(() => {

    return courses.filter((course) => {

      const categoryMatch =
        String(course.category).toLowerCase() ===
        decodeURIComponent(category).toLowerCase();

      const subjectMatch =
        String(course.subject).toLowerCase() ===
        decodeURIComponent(subject).toLowerCase();

      return categoryMatch && subjectMatch;

    });

  }, [courses, category, subject]);
    return (
    <div className="min-h-screen bg-[#050B14] text-white overflow-hidden">

      {/* Background */}

      <div className="fixed inset-0 -z-10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#102845_0%,#050B14_60%)]" />

        <div className="absolute left-0 top-20 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[160px]" />

        <div className="absolute right-0 bottom-0 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[170px]" />

        <div
          className="absolute inset-0 opacity-[0.04]
          [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)]
          [background-size:45px_45px]"
        />

      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* Hero */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6 }}
        >

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h1 className="mt-8 text-5xl lg:text-6xl font-black">

            {subject.replace(/-/g, " ")}

          </h1>

          <p className="mt-4 text-slate-400 text-lg">

            Available courses in this subject.

          </p>

        </motion.div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-16">
            {filteredCourses.length === 0 ? (

  <div className="col-span-full">

    <div className="rounded-[30px] border border-dashed border-slate-700 bg-slate-900/60 p-20 text-center">

      <BookOpen
        size={70}
        className="mx-auto text-slate-600"
      />

      <h2 className="mt-8 text-3xl font-bold">

        No Courses Available

      </h2>

      <p className="mt-4 text-slate-400 max-w-xl mx-auto">

        Courses for this subject haven't been published yet.
        Your instructors will add them soon.

      </p>

    </div>

  </div>

) : (

  filteredCourses.map((course) => (

    <motion.div

      key={course.id}

      whileHover={{
        y: -10,
        scale: 1.02,
      }}

      transition={{
        duration: .25,
      }}

      className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/70 backdrop-blur-xl"

    >

      {/* Thumbnail */}

      <div className="relative h-56 overflow-hidden">

        {course.thumbnail ? (

          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-700 hover:scale-110"
          />

        ) : (

          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900">

            <BookOpen
              size={70}
              className="text-white/70"
            />

          </div>

        )}

      </div>

      {/* Content */}

      <div className="p-8">

        <h2 className="text-2xl font-bold">

          {course.title}

        </h2>

        <p className="mt-4 text-slate-400 line-clamp-3">

          {course.description}

        </p>

        {/* Stats */}

        <div className="grid grid-cols-3 gap-4 mt-8">

          <div className="text-center">

            <Clock3
              className="mx-auto text-cyan-400"
              size={22}
            />

            <p className="mt-2 text-sm text-slate-400">

              {course.duration || "6 hrs"}

            </p>

          </div>

          <div className="text-center">

            <Users
              className="mx-auto text-blue-400"
              size={22}
            />

            <p className="mt-2 text-sm text-slate-400">

              {course.students || 0}

            </p>

          </div>

          <div className="text-center">

            <Star
              className="mx-auto text-yellow-400"
              size={22}
            />

            <p className="mt-2 text-sm text-slate-400">

              {course.rating || "5.0"}

            </p>

          </div>

        </div>

        <button

          onClick={() =>
            navigate(`/courses/${course.id}`)
          }

          className="mt-8 w-full rounded-2xl bg-cyan-500 py-4 font-bold text-slate-950 transition hover:bg-cyan-400 flex items-center justify-center gap-3"

        >

          <PlayCircle size={20} />

          View Course

        </button>

      </div>

    </motion.div>

  ))

)}
        </div>

        {/* Bottom CTA */}

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
          className="mt-24 overflow-hidden rounded-[32px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 p-10"
        >

          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

            <div>

              <h2 className="text-4xl font-black">

                Ready to Start Learning?

              </h2>

              <p className="mt-5 max-w-2xl text-slate-300 leading-8">

                Every course contains professional video lessons,
                downloadable materials, quizzes, practical projects,
                AI Tutor support, certificates and progress tracking.

              </p>

            </div>

            <button

              onClick={() => navigate("/courses")}

              className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"

            >

              Explore More Subjects

            </button>

          </div>

        </motion.div>

      </div>

    </div>

  );

}