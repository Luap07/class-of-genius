import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Globe2,
  DollarSign,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const benefits = [
  "Create unlimited courses",
  "Upload videos, PDFs, quizzes and assignments",
  "Reach learners worldwide",
  "Earn from premium courses",
  "AI-powered teaching tools",
  "Real-time analytics and student insights",
];

const stats = [
  {
    icon: Users,
    value: "5M+",
    label: "Active Learners",
  },
  {
    icon: Globe2,
    value: "190+",
    label: "Countries",
  },
  {
    icon: BookOpen,
    value: "120K+",
    label: "Courses",
  },
  {
    icon: DollarSign,
    value: "Unlimited",
    label: "Earning Potential",
  },
];

const BecomeInstructor = () => {
  return (
    <section>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="
          overflow-hidden
          rounded-[36px]
          bg-gradient-to-br
          from-blue-700
          via-indigo-700
          to-slate-900
          p-10
          lg:p-16
        "
      >

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}

          <div>

            <span
              className="
                inline-flex
                items-center
                rounded-full
                bg-white/10
                border
                border-white/20
                px-4
                py-2
                text-sm
                font-semibold
              "
            >
              Teach on Wonder
            </span>

            <h2 className="mt-6 text-5xl font-extrabold leading-tight">

              Inspire
              <br />

              Millions of
              <br />

              Learners

            </h2>

            <p className="mt-6 text-blue-100 text-lg leading-8">

              Share your expertise with students across the
              globe. Build engaging courses, publish learning
              resources, create quizzes, and grow your teaching
              career on Wonder.

            </p>

            <div className="mt-10 space-y-4">

              {benefits.map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3"
                >

                  <CheckCircle2
                    className="text-green-300"
                    size={20}
                  />

                  <span className="text-white">
                    {item}
                  </span>

                </div>

              ))}

            </div>

            <div className="mt-10 flex flex-wrap gap-4">

              <button
                className="
                  rounded-2xl
                  bg-white
                  text-slate-900
                  px-8
                  py-4
                  font-bold
                  hover:scale-105
                  transition
                  flex
                  items-center
                  gap-2
                "
              >

                Become an Instructor

                <ArrowRight size={20} />

              </button>

              <button
                className="
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/10
                  px-8
                  py-4
                  font-semibold
                  hover:bg-white/20
                  transition
                "
              >
                Learn More
              </button>

            </div>

          </div>

          {/* Right */}

          <div>

            <div className="grid grid-cols-2 gap-6">

              {stats.map((item) => {

                const Icon = item.icon;

                return (

                  <motion.div
                    key={item.label}
                    whileHover={{
                      y: -6,
                      scale: 1.03,
                    }}
                    className="
                      rounded-3xl
                      bg-white/10
                      backdrop-blur-xl
                      border
                      border-white/10
                      p-7
                    "
                  >

                    <div
                      className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-white/10
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <Icon size={28} />

                    </div>

                    <h3 className="mt-6 text-4xl font-extrabold">
                      {item.value}
                    </h3>

                    <p className="mt-2 text-blue-100">
                      {item.label}
                    </p>

                  </motion.div>

                );

              })}

            </div>

            <div
              className="
                mt-8
                rounded-3xl
                bg-white/10
                backdrop-blur-xl
                border
                border-white/10
                p-8
              "
            >

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-16
                    h-16
                    rounded-full
                    bg-white/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <GraduationCap size={34} />

                </div>

                <div>

                  <h3 className="text-2xl font-bold">
                    Verified Instructor
                  </h3>

                  <p className="text-blue-100">
                    Teach with confidence.
                  </p>

                </div>

              </div>

              <div className="mt-8 grid grid-cols-2 gap-5">

                <div className="rounded-2xl bg-black/20 p-5">

                  <ShieldCheck
                    className="text-green-300"
                    size={24}
                  />

                  <p className="mt-3 font-semibold">
                    Secure Content
                  </p>

                </div>

                <div className="rounded-2xl bg-black/20 p-5">

                  <Users
                    className="text-cyan-300"
                    size={24}
                  />

                  <p className="mt-3 font-semibold">
                    Student Community
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </motion.div>

    </section>
  );
};

export default BecomeInstructor;