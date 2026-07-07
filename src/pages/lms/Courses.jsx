import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useCourses } from "../../context/LMSContext/CourseContext";

import CourseHero from "../../components/courses/CourseHero";
import CourseSearch from "../../components/courses/CourseSearch";
import CourseFilters from "../../components/courses/CourseFilters";
import FeaturedCourses from "../../components/courses/FeaturedCourses";
import CourseGrid from "../../components/courses/CourseGrid";
import EmptyCourses from "../../components/courses/EmptyCourses";

const Courses = () => {
  const {
    courses = [],
    categories = [],
  } = useCourses();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        course.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);
    const featuredCourses = filteredCourses.filter(
    (course) => course.featured
  );

  return (
    <div className="space-y-8">

      {/* =========================
          HERO
      ========================== */}

      <CourseHero />

      {/* =========================
          SEARCH
      ========================== */}

      <CourseSearch
        value={search}
        onChange={setSearch}
      />

      {/* =========================
          FILTERS
      ========================== */}

      <CourseFilters
        categories={["All", ...categories]}
        selected={category}
        onSelect={setCategory}
      />

      {/* =========================
          FEATURED COURSES
      ========================== */}

      {featuredCourses.length > 0 && (
        <FeaturedCourses
          courses={featuredCourses}
        />
      )}

      {/* =========================
          ALL COURSES
      ========================== */}

      {filteredCourses.length === 0 ? (

        <EmptyCourses />

      ) : (

        <CourseGrid
          courses={filteredCourses}
        />

      )}
          </div>
  );
};

export default Courses;