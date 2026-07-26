// src/context/LMSContext/CourseContext.jsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* =====================================================
      FETCH COURSES
  ===================================================== */

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "Published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((course) => ({
        id: course.id,

        title: course.title || "",

        slug: course.slug || "",

        description: course.description || "",

        thumbnail:
          course.thumbnail_url ||
          course.thumbnail ||
          "",

        category_id: course.category_id,

        subject_id: course.subject_id,

        instructor:
          course.instructor ||
          "Class Of Genius",

        level:
          course.level ||
          "Beginner",

        language:
          course.language ||
          "English",

        duration:
          course.duration ||
          "",

        price:
          Number(course.price) || 0,

        rating:
          Number(course.rating) || 0,

        students:
          Number(course.students) || 0,

        featured:
          course.featured || false,

        certificate:
          course.certificate || false,

        requirements:
          course.requirements || "",

        learning_outcomes:
          course.learning_outcomes || "",

        created_at:
          course.created_at,
      }));

      setCourses(formatted);

      setFeaturedCourses(
        formatted.filter((c) => c.featured)
      );

      setRecentCourses(
        formatted.slice(0, 12)
      );
    } catch (err) {
      console.error(err);

      setError(err.message);

      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =====================================================
      FETCH CATEGORIES
  ===================================================== */

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("course_categories")
        .select("*")
        .order("name");

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error(err);

      setCategories([]);
    }
  }, []);

  /* =====================================================
      REFRESH
  ===================================================== */

  const refreshCourses = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchCourses(),
      fetchCategories(),
    ]);

    setRefreshing(false);
  };

  /* =====================================================
      HELPERS
  ===================================================== */

  const getCourse = (id) =>
    courses.find(
      (course) =>
        String(course.id) === String(id)
    );

  const getCoursesByCategory = (categoryId) =>
    courses.filter(
      (course) =>
        String(course.category_id) ===
        String(categoryId)
    );

  const searchCourses = (keyword = "") => {
    const text = keyword.toLowerCase();

    return courses.filter(
      (course) =>
        course.title
          ?.toLowerCase()
          .includes(text) ||
        course.description
          ?.toLowerCase()
          .includes(text)
    );
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        categories,
        featuredCourses,
        recentCourses,

        loading,
        refreshing,
        error,

        totalCourses: courses.length,
        totalCategories: categories.length,

        fetchCourses,
        fetchCategories,
        refreshCourses,

        getCourse,
        getCoursesByCategory,
        searchCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error(
      "useCourses must be used inside CourseProvider"
    );
  }

  return context;
};

export default CourseContext;