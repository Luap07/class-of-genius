import React from "react";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Clock3,
  BookOpen,
  ArrowRight,
  Heart,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const RelatedCourses = ({ courses = [] }) => {
  const related =
    courses.length > 0
      ? courses
      : [
          {
            id: 1,
            title: "Introduction to Artificial Intelligence",
            category: "Artificial Intelligence",
            description:
              "Learn AI fundamentals with hands-on projects.",
            students: "28,500",
            rating: 4.9,
            duration: "18 Hours",
            image:
              "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
          },
          {
            id: 2,
            title: "Modern Web Development",
            category: "Programming",
            description:
              "Build modern websites using React and Node.js.",
            students: "41,200",
            rating: 4.8,
            duration: "25 Hours",
            image:
              "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200",
          },
          {
            id: 3,
            title: "Data Science Essentials",
            category: "Data Science",
            description:
              "Master data analysis, visualization and ML basics.",
            students: "36,900",
            rating: 4.9,
            duration: "22 Hours",
            image:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
          },
        ];

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 25,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      className="
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900
        p-8
      "
    >
      <div className="flex items-center justify-between flex-wrap gap-4">

        <div>

          <div className="flex items-center gap-3">

            <Sparkles
              className="text-blue-400"
              size={26}
            />

            <h2 className="text-3xl font-bold">

              Related Courses

            </h2>

          </div>

          <p className="mt-3 text-slate-400">

            Continue learning with courses recommended by Wonder AI.

          </p>

        </div>

        <Link
          to="/courses"
          className="
            rounded-xl
            border
            border-slate-700
            px-5
            py-3
            hover:bg-slate-800
            transition
          "
        >
          Browse All Courses
        </Link>

      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-8">
                {related.map((course) => (

          <motion.div
            key={course.id}
            whileHover={{
              y: -8,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-slate-800
              bg-slate-950
            "
          >

            {/* Course Image */}

            <div className="relative">

              <img
                src={course.image}
                alt={course.title}
                className="
                  h-56
                  w-full
                  object-cover
                "
              />

              <button
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-900/80
                  backdrop-blur
                  transition
                  hover:bg-red-600
                "
              >

                <Heart size={20} />

              </button>

              <span
                className="
                  absolute
                  left-4
                  top-4
                  rounded-full
                  bg-blue-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                "
              >

                {course.category}

              </span>

            </div>

            {/* Body */}

            <div className="p-6">

              <h3 className="text-2xl font-bold leading-snug">

                {course.title}

              </h3>

              <p className="mt-4 text-slate-400 leading-7">

                {course.description}

              </p>

              {/* Stats */}

              <div className="mt-6 flex flex-wrap gap-5 text-sm">

                <div className="flex items-center gap-2">

                  <Star
                    size={17}
                    className="
                      fill-yellow-400
                      text-yellow-400
                    "
                  />

                  <span>

                    {course.rating}

                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <Users
                    size={17}
                    className="text-cyan-400"
                  />

                  <span>

                    {course.students}

                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <Clock3
                    size={17}
                    className="text-emerald-400"
                  />

                  <span>

                    {course.duration}

                  </span>

                </div>

              </div>

              {/* Footer */}

              <div className="mt-8 flex gap-3">

                <Link
                  to={`/courses/${course.id}`}
                  className="
                    flex-1
                    rounded-2xl
                    bg-blue-600
                    py-4
                    text-center
                    font-bold
                    transition
                    hover:bg-blue-700
                  "
                >

                  View Course

                </Link>

                <button
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-700
                    transition
                    hover:bg-slate-800
                  "
                >

                  <ArrowRight size={20} />

                </button>

              </div>

            </div>

          </motion.div>

        ))}
              </div>

      {/* =====================================
          Wonder AI Recommendation
      ===================================== */}

      <motion.div
        whileHover={{
          scale: 1.01,
        }}
        className="
          mt-14
          overflow-hidden
          rounded-[32px]
          bg-gradient-to-r
          from-blue-700
          via-indigo-700
          to-violet-700
          p-10
        "
      >

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          <div>

            <div className="flex items-center gap-3">

              <Sparkles size={30} />

              <h2 className="text-3xl font-bold">

                Wonder AI Recommends

              </h2>

            </div>

            <p className="mt-6 text-blue-100 leading-8">

              Based on your learning history, interests, completed
              courses and skill level, Wonder AI has selected these
              courses to help you continue your learning journey.

            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/courses"
                className="
                  rounded-2xl
                  bg-white
                  px-8
                  py-4
                  font-bold
                  text-slate-900
                  transition
                  hover:scale-105
                "
              >

                Explore More Courses

              </Link>

              <button
                className="
                  rounded-2xl
                  border
                  border-white/30
                  px-8
                  py-4
                  font-semibold
                  transition
                  hover:bg-white/10
                "
              >

                View AI Recommendations

              </button>

            </div>

          </div>

          {/* Stats */}

          <div className="grid grid-cols-2 gap-5">

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <BookOpen size={30} />

              <h3 className="mt-5 text-4xl font-bold">

                120K+

              </h3>

              <p className="mt-2 text-blue-100">

                Learning Resources

              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <Users size={30} />

              <h3 className="mt-5 text-4xl font-bold">

                1M+

              </h3>

              <p className="mt-2 text-blue-100">

                Active Learners

              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <Star
                size={30}
                className="fill-yellow-300"
              />

              <h3 className="mt-5 text-4xl font-bold">

                4.9★

              </h3>

              <p className="mt-2 text-blue-100">

                Average Rating

              </p>

            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <Sparkles size={30} />

              <h3 className="mt-5 text-4xl font-bold">

                AI

              </h3>

              <p className="mt-2 text-blue-100">

                Personalized Learning

              </p>

            </div>

          </div>

        </div>

      </motion.div>

    </motion.section>

  );

};

export default RelatedCourses;