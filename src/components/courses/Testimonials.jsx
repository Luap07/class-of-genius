import React from "react";
import { motion } from "framer-motion";
import {
  Quote,
  Star,
  GraduationCap,
  Briefcase,
  Globe2,
} from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Computer Science Student",
    country: "United Kingdom",
    avatar:
      "https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563eb&color=fff",
    rating: 5,
    review:
      "Wonder completely transformed the way I study. The AI Tutor explains difficult concepts clearly, and the learning paths keep me focused.",
  },
  {
    name: "David Kim",
    role: "Software Engineer",
    country: "South Korea",
    avatar:
      "https://ui-avatars.com/api/?name=David+Kim&background=059669&color=fff",
    rating: 5,
    review:
      "The virtual labs and practical projects helped me gain real-world experience. It feels like learning in a modern university.",
  },
  {
    name: "Maria Garcia",
    role: "Medical Student",
    country: "Spain",
    avatar:
      "https://ui-avatars.com/api/?name=Maria+Garcia&background=7c3aed&color=fff",
    rating: 5,
    review:
      "Having all my study materials, quizzes, AI assistance, and progress tracking in one place makes learning much easier.",
  },
  {
    name: "Michael Brown",
    role: "Business Analyst",
    country: "Canada",
    avatar:
      "https://ui-avatars.com/api/?name=Michael+Brown&background=ea580c&color=fff",
    rating: 5,
    review:
      "Wonder isn't just another course platform. It feels like an entire digital campus with everything I need to grow professionally.",
  },
];

const Testimonials = () => {
  return (
    <section className="space-y-12">

      {/* Heading */}

      <div className="max-w-3xl mx-auto text-center">

        <span
          className="
            inline-flex
            px-4
            py-2
            rounded-full
            bg-emerald-500/10
            border
            border-emerald-500/20
            text-emerald-400
            text-sm
            font-semibold
          "
        >
          Student Success Stories
        </span>

        <h2 className="mt-5 text-4xl font-extrabold">
          Loved by Learners Worldwide
        </h2>

        <p className="mt-4 text-lg text-slate-400">
          Thousands of learners are building skills,
          earning certificates, and advancing their careers
          with Wonder.
        </p>

      </div>

      {/* Testimonials */}

      <div className="grid gap-8 lg:grid-cols-2">

        {testimonials.map((item, index) => (

          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: index * 0.08,
            }}
            whileHover={{
              y: -6,
            }}
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-8
            "
          >

            {/* Quote */}

            <div className="flex justify-between items-center">

              <Quote
                size={36}
                className="text-blue-400"
              />

              <div className="flex gap-1">

                {Array.from({ length: item.rating }).map((_, i) => (

                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />

                ))}

              </div>

            </div>

            <p className="mt-8 text-slate-300 leading-8">
              "{item.review}"
            </p>

            {/* User */}

            <div className="mt-8 flex items-center gap-4">

              <img
                src={item.avatar}
                alt={item.name}
                className="
                  w-16
                  h-16
                  rounded-full
                  object-cover
                  border
                  border-slate-700
                "
              />

              <div>

                <h3 className="font-bold text-lg">
                  {item.name}
                </h3>

                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">

                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} />
                    {item.role}
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe2 size={16} />
                    {item.country}
                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        ))}

      </div>

      {/* Bottom Banner */}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="
          rounded-[32px]
          border
          border-slate-800
          bg-gradient-to-r
          from-slate-900
          via-slate-800
          to-slate-900
          p-10
        "
      >

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          <div>

            <h2 className="text-4xl font-extrabold">
              Join Millions of Learners
            </h2>

            <p className="mt-5 text-slate-400 text-lg">
              Whether you're preparing for school,
              university, certifications, or your next career,
              Wonder helps you learn faster and smarter.
            </p>

          </div>

          <div className="grid grid-cols-3 gap-6">

            <div className="text-center">

              <h3 className="text-4xl font-extrabold text-blue-400">
                5M+
              </h3>

              <p className="mt-2 text-slate-400">
                Students
              </p>

            </div>

            <div className="text-center">

              <h3 className="text-4xl font-extrabold text-emerald-400">
                120K+
              </h3>

              <p className="mt-2 text-slate-400">
                Courses
              </p>

            </div>

            <div className="text-center">

              <h3 className="text-4xl font-extrabold text-violet-400">
                190+
              </h3>

              <p className="mt-2 text-slate-400">
                Countries
              </p>

            </div>

          </div>

        </div>

      </motion.div>

    </section>
  );
};

export default Testimonials;