import React, { useMemo, useState } from "react";

import { useCourses } from "../../context/LMSContext/CourseContext";

import CourseHero from "../../components/courses/CourseHero";
import CourseSearch from "../../components/courses/CourseSearch";
import CourseFilters from "../../components/courses/CourseFilters";
import FeaturedCourses from "../../components/courses/FeaturedCourses";
import CourseGrid from "../../components/courses/CourseGrid";
import EmptyCourses from "../../components/courses/EmptyCourses";

// New Sections
import LearningStats from "../../components/courses/LearningStats";
import WhyWonder from "../../components/courses/WhyWonder";
import LearningPaths from "../../components/courses/LearningPaths";
import Testimonials from "../../components/courses/Testimonials";
import BecomeInstructor from "../../components/courses/BecomeInstructor";
import FAQ from "../../components/courses/FAQ";
import Newsletter from "../../components/courses/Newsletter";

const defaultCategories = [
  "Science",
  "Technology",
  "Engineering",
  "Medicine",
  "Business",
  "Arts",
  "Law",
  "Programming",
  "Languages",
  "Artificial Intelligence",
  "Cybersecurity",
  "Cloud Computing",
  "Data Science",
  "Finance",
  "Marketing",
  "Architecture",
];

const Courses = () => {
  const {
    courses = [],
    categories = [],
  } = useCourses();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const availableCategories =
    categories.length
      ? categories
      : defaultCategories;

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !keyword ||
        course.title?.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword) ||
        course.instructor?.toLowerCase().includes(keyword) ||
        course.category?.toLowerCase().includes(keyword);

      const matchesCategory =
        category === "All" ||
        course.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  const featuredCourses = filteredCourses.filter(
    (course) => course.featured
  );

  const resetFilters = () => {
    setSearch("");
    setCategory("All");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-14 pb-20">

      {/* Hero */}

      <CourseHero />

      {/* Search */}

      <CourseSearch
        value={search}
        onChange={setSearch}
      />

      {/* Categories */}

      <CourseFilters
        categories={["All", ...availableCategories]}
        selected={category}
        onSelect={setCategory}
      />

      {/* Featured Courses */}

      {featuredCourses.length > 0 && (
        <FeaturedCourses
          courses={featuredCourses}
        />
      )}

      {/* All Courses */}

      {filteredCourses.length === 0 ? (
        <EmptyCourses
          onReset={resetFilters}
        />
      ) : (
        <CourseGrid
          courses={filteredCourses}
        />
      )}

      {/* ===============================
          PREMIUM SECTIONS
      =============================== */}

      <LearningStats />

      <WhyWonder />

      <LearningPaths />

      <Testimonials />

      <BecomeInstructor />

      <FAQ />

      <Newsletter />

    </div>
  );
};

export default Courses;