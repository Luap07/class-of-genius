import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Layers3,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const ExploreLearningDisciplines = ({
  onSelectDiscipline,
}) => {

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* ==========================================
      LOAD CATEGORIES
  ========================================== */

  useEffect(() => {

    fetchCategories();

  }, []);

  const fetchCategories = async () => {

    try {

      setLoading(true);

      setError("");

      const { data, error } = await supabase

        .from("course_categories")

        .select(`
          id,
          name,
          description,
          image,
          color,
          courses(
            id
          )
        `)

        .order("name");

      if (error) throw error;

      const formatted = (data || []).map((category) => ({

        id: category.id,

        name: category.name,

        description:
          category.description ||
          "Explore premium learning content.",

        image: category.image,

        color:
          category.color ||
          "#06b6d4",

        totalCourses:
          category.courses?.length || 0,

      }));

      setCategories(formatted);

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  /* ==========================================
      LOADING
  ========================================== */

  if (loading) {

    return (

      <section className="py-20">

        <div className="text-center">

          <div
            className="
              mx-auto
              h-14
              w-14
              animate-spin
              rounded-full
              border-4
              border-cyan-500
              border-t-transparent
            "
          />

          <p className="mt-6 text-slate-400">

            Loading disciplines...

          </p>

        </div>

      </section>

    );

  }

  /* ==========================================
      ERROR
  ========================================== */

  if (error) {

    return (

      <section className="py-20 text-center">

        <h2 className="text-red-400 text-xl font-bold">

          Failed to load disciplines

        </h2>

        <p className="mt-3 text-slate-400">

          {error}

        </p>

      </section>

    );

  }

  return (

    <section className="space-y-14">

      {/* Heading */}

      <div className="mx-auto max-w-4xl text-center">

        <span
          className="
            inline-flex
            rounded-full
            border
            border-cyan-500/30
            bg-cyan-500/10
            px-5
            py-2
            text-sm
            font-semibold
            text-cyan-400
          "
        >
          Explore Fields of Study
        </span>

        <h2
          className="
            mt-6
            text-4xl
            font-black
            text-white
            lg:text-5xl
          "
        >
          Discover Your Next
          <span className="text-cyan-400">
            {" "}Learning Journey
          </span>
        </h2>

        <p
          className="
            mt-6
            text-lg
            leading-8
            text-slate-400
          "
        >
          Browse professionally curated learning
          disciplines designed for students,
          professionals and lifelong learners.
        </p>

      </div>

      {/* Grid starts in Part 2 */}
            <div
        className="
          grid
          gap-8
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >

        {categories.map((category, index) => (

          <motion.div
            key={category.id}
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: index * 0.08,
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
            }}
            onClick={() =>
              onSelectDiscipline?.(category.name)
            }
            className="
              group
              relative
              cursor-pointer
              overflow-hidden
              rounded-[32px]
              border
              border-slate-800
              bg-slate-900/70
              backdrop-blur-xl
              transition-all
              duration-500
              hover:border-cyan-500/50
            "
          >

            {/* Gradient */}

            <div
              className="
                absolute
                inset-0
                opacity-0
                transition-all
                duration-500
                group-hover:opacity-100
              "
              style={{
                background: `linear-gradient(135deg, ${category.color}25, transparent)`
              }}
            />

            {/* Image */}

            <div className="relative h-56 overflow-hidden">

              {category.image ? (

                <img
                  src={category.image}
                  alt={category.name}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-110
                  "
                />

              ) : (

                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    bg-gradient-to-br
                    from-slate-800
                    to-slate-900
                  "
                >

                  <Layers3
                    size={70}
                    style={{
                      color: category.color,
                    }}
                  />

                </div>

              )}

              {/* Overlay */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-slate-950
                  via-slate-950/20
                  to-transparent
                "
              />

              {/* Course Count */}

              <div
                className="
                  absolute
                  top-5
                  right-5
                  rounded-full
                  border
                  border-white/10
                  bg-slate-900/80
                  px-4
                  py-2
                  backdrop-blur
                "
              >

                <span
                  className="
                    text-sm
                    font-semibold
                    text-cyan-300
                  "
                >
                  {category.totalCourses} Courses
                </span>

              </div>

            </div>

            {/* Content */}

            <div className="relative p-7">
                            {/* Category Title */}

              <h3
                className="
                  text-2xl
                  font-black
                  text-white
                  transition-colors
                  duration-300
                  group-hover:text-cyan-300
                "
              >
                {category.name}
              </h3>

              {/* Description */}

              <p
                className="
                  mt-4
                  line-clamp-3
                  leading-7
                  text-slate-400
                "
              >
                {category.description}
              </p>

              {/* Bottom Row */}

              <div
                className="
                  mt-8
                  flex
                  items-center
                  justify-between
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-slate-800/70
                    px-4
                    py-3
                  "
                >

                  <BookOpen
                    size={18}
                    className="text-cyan-400"
                  />

                  <div>

                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      Available
                    </p>

                    <p
                      className="
                        font-bold
                        text-white
                      "
                    >
                      {category.totalCourses} Courses
                    </p>

                  </div>

                </div>

                <motion.div
                  whileHover={{
                    x: 6,
                  }}
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-cyan-500
                    text-slate-950
                    shadow-lg
                    shadow-cyan-500/30
                  "
                >

                  <ArrowRight size={22} />

                </motion.div>

              </div>

            </div>

          </motion.div>

        ))}

      </div>
            {/* Bottom CTA */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-cyan-500/20
          bg-gradient-to-br
          from-slate-900
          via-slate-950
          to-slate-900
          p-10
          lg:p-14
        "
      >

        {/* Glow */}

        <div
          className="
            absolute
            -top-24
            -right-24
            h-72
            w-72
            rounded-full
            bg-cyan-500/10
            blur-[120px]
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            items-center
            justify-between
            gap-8
            lg:flex-row
          "
        >

          <div className="max-w-2xl">

            <span
              className="
                rounded-full
                border
                border-cyan-500/20
                bg-cyan-500/10
                px-4
                py-2
                text-sm
                font-semibold
                text-cyan-400
              "
            >
              Start Your Journey
            </span>

            <h2
              className="
                mt-5
                text-4xl
                font-black
                text-white
              "
            >
              Learn Without Limits
            </h2>

            <p
              className="
                mt-5
                text-lg
                leading-8
                text-slate-400
              "
            >
              Choose a field of study, enroll in professionally
              designed courses, complete assessments, earn
              certificates and build real-world skills with
              Scholiqen.
            </p>

          </div>

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              px-8
              py-4
              text-lg
              font-bold
              text-white
              shadow-xl
              shadow-cyan-500/30
            "
          >
            Browse All Courses

            <ArrowRight size={22} />

          </motion.button>

        </div>

      </motion.div>

    </section>

  );

};

export default ExploreLearningDisciplines;