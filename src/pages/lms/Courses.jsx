// src/pages/courses/Courses.jsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { useCourses } from "../../context/LMSContext/CourseContext";

import CourseHero from "../../components/courses/CourseHero";
import CourseSearch from "../../components/courses/CourseSearch";
import CourseFilters from "../../components/courses/CourseFilters";
import FeaturedCourses from "../../components/courses/FeaturedCourses";
import CourseGrid from "../../components/courses/CourseGrid";
import EmptyCourses from "../../components/courses/EmptyCourses";

// Premium Sections
import LearningStats from "../../components/courses/LearningStats";
import WhyWonder from "../../components/courses/WhyWonder";
import LearningPaths from "../../components/courses/LearningPaths";
import Testimonials from "../../components/courses/Testimonials";
import BecomeInstructor from "../../components/courses/BecomeInstructor";
import FAQ from "../../components/courses/FAQ";
import Newsletter from "../../components/courses/Newsletter";
import ExploreLearningDisciplines from "../../components/courses/ExploreLearningDisciplines";

const Courses = () => {
  // Router
  const navigate = useNavigate();
  const location = useLocation();

  // Course Context
  const {
    courses = [],
    categories = [],
  } = useCourses();

 // Search & Filter
const params = new URLSearchParams(location.search);

const [search, setSearch] = useState("");
const [category, setCategory] = useState(
  params.get("category") || "All"
);

useEffect(() => {
  const params = new URLSearchParams(location.search);

  const selectedCategory =
    params.get("category");

  if (selectedCategory) {
    setCategory(selectedCategory);
  } else {
    setCategory("All");
  }
}, [location.search]);

  // Scroll References
  const coursesRef = useRef(null);
  const disciplinesRef = useRef(null);

  // Scroll to Courses
 const scrollToCourses = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  // Scroll to Disciplines
  const scrollToDisciplines = () => {
    disciplinesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Handle Discipline Selection
  const handleDisciplineSelect = (discipline) => {
    setCategory(discipline);

    coursesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
    // Available Categories
 const availableCategories = useMemo(() => {
  const unique = [];

  const seen = new Set();

  categories.forEach((cat) => {
    if (!cat) return;

    // Handle object categories
    if (typeof cat === "object") {
      const key = String(cat.id ?? cat.name);

      if (!seen.has(key)) {
        seen.add(key);

        unique.push({
          id: String(cat.id ?? cat.name),
          name: cat.name,
        });
      }
    }

    // Handle string categories
    else {
      const key = String(cat);

      if (!seen.has(key)) {
        seen.add(key);

        unique.push({
          id: key,
          name: key,
        });
      }
    }
  });

return [
  {
    id: "All",
    name: "All",
  },
  ...unique,
];
}, [categories]);

  // Filter Courses
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
  String(course.category_id) === String(category);
  
      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    courses,
    search,
    category,
  ]);

  // Featured Courses
  const featuredCourses =
    filteredCourses.filter(
      (course) => course.featured
    );

  // Reset Filters
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

      <CourseHero
        onBrowseCourses={
          scrollToCourses
        }
        onExploreCategories={
          scrollToDisciplines
        }
      />

      {/* Search */}

      <CourseSearch
        value={search}
        onChange={setSearch}
      />

      {/* Categories */}

      <CourseFilters
        categories={
          availableCategories
        }
        selected={category}
        onSelect={setCategory}
      />

      {/* Featured */}

      {featuredCourses.length > 0 && (

        <FeaturedCourses
          courses={featuredCourses}
        />

      )}
            {/* ===============================
          ALL COURSES
      =============================== */}

      <div ref={coursesRef}>

        {filteredCourses.length === 0 ? (

          <EmptyCourses
            onReset={resetFilters}
          />

        ) : (

          <CourseGrid
            courses={filteredCourses}
            onCourseOpen={(course) =>
              navigate(`/courses/${course.id}`)
            }
          />

        )}

      </div>

      {/* ===============================
          PREMIUM SECTIONS
      =============================== */}

      <LearningStats />

      <WhyWonder />

      <LearningPaths />

      <div ref={disciplinesRef}>

        <ExploreLearningDisciplines
          onSelectDiscipline={
            handleDisciplineSelect
          }
        />

      </div>

      <Testimonials />

      <BecomeInstructor />

      <FAQ />

      <Newsletter />
          </div>
  );
};

export default Courses;