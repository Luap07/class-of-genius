// src/pages/courses/ExploreCategories.jsx

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

import {
  Atom,
  Laptop,
  Briefcase,
  Palette,
  Globe,
  HeartPulse,
  GraduationCap,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

import CategoryStats from "../../components/courses/CategoriesStats";
import CategoryGrid from "../../components/courses/CategoryGrid";
import WhyScholiqen from "../../components/courses/WhyScholiqen";
import CategoryCTA from "../../components/courses/CategoriesCTA";
import CategoriesFooter from "../../components/courses/CategoriesFooter";

const ICON_MAP = {
  Science: Atom,
  Technology: Laptop,
  Business: Briefcase,
  Arts: Palette,
  Geography: Globe,
  Health: HeartPulse,
  University: GraduationCap,
};

export default function ExploreCategories() {
  const categoryGridRef = useRef(null);
  const navigate = useNavigate();

  const { categories, courses } = useCourses();

  const [search, setSearch] = useState("");

  const formattedCategories = useMemo(() => {
    return categories.map((category) => {
      const Icon = ICON_MAP[category.name] || GraduationCap;

      const categoryCourses = courses.filter(
        (course) => String(course.category_id) === String(category.id)
      );

      return {
        id: category.id,
        title: category.name,
        description: category.description || "Explore courses and learning paths.",
        icon: Icon,
        color: category.color || "from-cyan-500 to-blue-600",
        courses: `${categoryCourses.length}+`,
        students: "0+",
        ai: true,
        labs: false,
        subjects: category.subject_area ? [category.subject_area] : [],
      };
    });
  }, [categories, courses]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return formattedCategories;

    return formattedCategories.filter(
      (category) =>
        category.title.toLowerCase().includes(keyword) ||
        category.description.toLowerCase().includes(keyword) ||
        category.subjects.some((subject) =>
          subject.toLowerCase().includes(keyword)
        )
    );
  }, [search, formattedCategories]);

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#030712]
        text-white
      "
    >
      {/* ================= BACKGROUND ================= */}
      <div
        className="
          absolute
          inset-0
          pointer-events-none
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-[#020617]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_0%,rgba(14,116,144,.25),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(37,99,235,.18),transparent_40%)]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.08]
            bg-[radial-gradient(#94a3b8_1px,transparent_1px)]
            [background-size:32px_32px]
          "
        />
      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          py-20
        "
      >
        {/* ================= STATIC CATEGORY HEADER ================= */}
        <motion.section
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mb-14
            text-center
          "
        >
          {/* LOGO */}
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              border
              border-cyan-500/30
              bg-cyan-500/10
              shadow-lg
              shadow-cyan-500/10
            "
          >
            <img
              src={Cog}
              alt="Scholiqen Logo"
              className="
                h-12
                w-12
                object-contain
              "
            />
          </div>

          {/* BRAND */}
          <h2
            className="
              mt-5
              text-2xl
              font-black
              tracking-wide
              text-cyan-400
            "
          >
            SCHOLIQEN
          </h2>

          <h1
            className="
              mt-4
              text-5xl
              font-black
              lg:text-6xl
            "
          >
            Explore Learning Categories
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-3xl
              text-lg
              text-slate-400
            "
          >
            Discover science, technology, business, arts, health and university
            learning paths powered by Scholiqen.
          </p>

          <div
            className="
              mt-8
              flex
              flex-wrap
              justify-center
              gap-3
            "
          >
            {[
              "Science",
              "Technology",
              "Business",
              "Arts",
              "Health",
              "University",
            ].map((item) => (
              <span
                key={item}
                className="
                  rounded-full
                  border
                  border-slate-700
                  bg-slate-900/70
                  px-5
                  py-2
                  text-sm
                  text-slate-300
                "
              >
                {item}
              </span>
            ))}
          </div>
        </motion.section>

        {/* ================= SEARCH ================= */}
        <div
          className="
            mx-auto
            mt-10
            max-w-4xl
            rounded-3xl
            border
            border-slate-700
            bg-slate-900/70
            backdrop-blur-xl
          "
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories, subjects..."
            className="
              w-full
              bg-transparent
              px-6
              py-6
              text-lg
              outline-none
            "
          />
        </div>

        <CategoryStats />

        <div ref={categoryGridRef} id="category-grid">
          <CategoryGrid categories={filteredCategories} navigate={navigate} />
        </div>

        <WhyScholiqen />

        <CategoryCTA
          scrollToCategories={() =>
            categoryGridRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />

        <CategoriesFooter />
      </main>
    </div>
  );
}