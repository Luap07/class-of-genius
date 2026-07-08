import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Star,
  Users,
  BookOpen,
  Globe,
  Award,
  Briefcase,
  Mail,
} from "lucide-react";

const InstructorCard = ({ instructor, course }) => {
  const teacher = {
    name: instructor || "Dr. John Anderson",
    role:
      course?.instructorTitle ||
      "Senior Lecturer & Industry Expert",
    avatar:
      course?.instructorAvatar ||
      "https://ui-avatars.com/api/?name=John+Anderson&background=2563eb&color=fff&size=256",
    rating: course?.instructorRating || "4.9",
    students: course?.instructorStudents || "125,000+",
    courses: course?.instructorCourses || 42,
    experience: course?.experience || "15 Years",
    language: course?.language || "English",
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
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
        lg:p-10
      "
    >
      {/* Header */}

      <div className="flex items-center gap-4">

        <div
          className="
            h-16
            w-16
            rounded-2xl
            bg-blue-600/10
            text-blue-400
            flex
            items-center
            justify-center
          "
        >

          <GraduationCap size={30} />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Meet Your Instructor

          </h2>

          <p className="mt-2 text-slate-400">

            Learn from experienced educators and professionals.

          </p>

        </div>

      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-8">

        {/* Profile */}

        <motion.div
          whileHover={{
            y: -6,
          }}
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-950
            p-8
            text-center
          "
        >

          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="
              mx-auto
              h-36
              w-36
              rounded-full
              border-4
              border-blue-500
              object-cover
            "
          />

          <h3 className="mt-6 text-2xl font-bold">

            {teacher.name}

          </h3>

          <p className="mt-2 text-slate-400">

            {teacher.role}

          </p>

          <div className="mt-6 flex justify-center gap-2">

            <Star
              className="fill-yellow-400 text-yellow-400"
              size={18}
            />

            <span className="font-semibold">

              {teacher.rating}

            </span>

          </div>
                    {/* Instructor Stats */}

          <div className="mt-8 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-slate-900 p-4">

              <Users
                className="mx-auto text-cyan-400"
                size={24}
              />

              <h4 className="mt-3 text-2xl font-bold">

                {teacher.students}

              </h4>

              <p className="text-sm text-slate-400">

                Students

              </p>

            </div>

            <div className="rounded-2xl bg-slate-900 p-4">

              <BookOpen
                className="mx-auto text-blue-400"
                size={24}
              />

              <h4 className="mt-3 text-2xl font-bold">

                {teacher.courses}

              </h4>

              <p className="text-sm text-slate-400">

                Courses

              </p>

            </div>

          </div>

        </motion.div>

        {/* Details */}

        <div className="lg:col-span-2 space-y-8">

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">

            <h3 className="text-2xl font-bold">

              About the Instructor

            </h3>

            <p className="mt-6 text-slate-300 leading-8">

              {course?.instructorBio ||

                "An experienced educator passionate about helping learners succeed through engaging lessons, practical projects, and real-world applications. With years of academic and industry experience, this instructor has guided thousands of students toward achieving their learning and career goals."}

            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">

              <div className="flex items-center gap-3">

                <Briefcase
                  className="text-amber-400"
                  size={24}
                />

                <h4 className="text-xl font-semibold">

                  Experience

                </h4>

              </div>

              <p className="mt-5 text-slate-300">

                {teacher.experience}

              </p>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">

              <div className="flex items-center gap-3">

                <Globe
                  className="text-emerald-400"
                  size={24}
                />

                <h4 className="text-xl font-semibold">

                  Teaching Language

                </h4>

              </div>

              <p className="mt-5 text-slate-300">

                {teacher.language}

              </p>

            </div>

          </div>
                    {/* Qualifications & Achievements */}

          <div className="grid lg:grid-cols-2 gap-6">

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">

              <div className="flex items-center gap-3">

                <Award
                  className="text-yellow-400"
                  size={24}
                />

                <h4 className="text-xl font-semibold">
                  Qualifications
                </h4>

              </div>

              <ul className="mt-6 space-y-4">

                {(course?.qualifications || [
                  "Ph.D. in Computer Science",
                  "Certified Professional Instructor",
                  "Industry Researcher",
                  "International Conference Speaker",
                ]).map((item, index) => (

                  <li
                    key={index}
                    className="flex items-center gap-3"
                  >

                    <Award
                      size={18}
                      className="text-yellow-400"
                    />

                    <span className="text-slate-300">
                      {item}
                    </span>

                  </li>

                ))}

              </ul>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">

              <div className="flex items-center gap-3">

                <Star
                  className="text-blue-400"
                  size={24}
                />

                <h4 className="text-xl font-semibold">
                  Achievements
                </h4>

              </div>

              <ul className="mt-6 space-y-4">

                {(course?.achievements || [
                  "100,000+ learners taught",
                  "Award-winning educator",
                  "Published researcher",
                  "Industry mentor",
                ]).map((item, index) => (

                  <li
                    key={index}
                    className="flex items-center gap-3"
                  >

                    <Star
                      size={18}
                      className="text-blue-400"
                    />

                    <span className="text-slate-300">
                      {item}
                    </span>

                  </li>

                ))}

              </ul>

            </div>

          </div>

          {/* CTA */}

          <div className="rounded-[30px] bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-8">

            <h3 className="text-3xl font-bold">

              Learn From an Expert

            </h3>

            <p className="mt-5 text-blue-100 leading-8">

              Receive expert guidance throughout your learning
              journey. Ask questions, complete projects and
              develop practical skills with structured lessons
              designed for real-world success.

            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                className="
                  rounded-2xl
                  bg-white
                  px-8
                  py-4
                  font-bold
                  text-slate-900
                  hover:scale-105
                  transition
                "
              >

                <div className="flex items-center gap-3">

                  <Mail size={20} />

                  Contact Instructor

                </div>

              </button>

              <button
                className="
                  rounded-2xl
                  border
                  border-white/30
                  px-8
                  py-4
                  font-semibold
                  hover:bg-white/10
                  transition
                "
              >

                Ask Wonder AI

              </button>

            </div>

          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default InstructorCard;