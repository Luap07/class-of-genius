// src/context/LMSContext/CourseContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { supabase } from "../../lib/supabaseClient";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  /* ======================================================
      STATE
  ====================================================== */

  const [courses, setCourses] = useState([]);

  const [categories, setCategories] = useState([]);

  const [featuredCourses, setFeaturedCourses] = useState([]);

  const [recentCourses, setRecentCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  /* ======================================================
      FETCH COURSES
  ====================================================== */

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "Published")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      const formattedCourses = (data || []).map((course) => ({
        id: course.id,

        title: course.title || "",

        slug: course.slug || "",

        description: course.description || "",

        shortDescription:
          course.short_description || "",

        thumbnail:
          course.thumbnail_url || "",

        banner:
          course.banner || "",

        instructor:
          course.instructor ||
          "Class Of Genius",

        category:
          course.category || "General",

        category_id:
          course.category_id || null,

        categoryId:
          course.category_id || null,

        featured:
          course.featured || false,

        price:
          Number(course.price) || 0,

        lessons:
          course.lessons_count ||
          course.total_lessons ||
          0,

        duration:
          course.duration || "",

        level:
          course.level || "Beginner",

        language:
          course.language || "English",

        certificate:
          course.certificate || false,

        rating:
          Number(course.rating) || 0,

        students:
          Number(course.students) || 0,

        status:
          course.status,

        createdAt:
          course.created_at,
      }));

      setCourses(formattedCourses);

      console.log("Formatted Courses:", formattedCourses);

      setFeaturedCourses(
        formattedCourses.filter(
          (course) => course.featured
        )
      );

      setRecentCourses(
        [...formattedCourses]
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )
          .slice(0, 12)
      );
    } catch (err) {
      console.error(
        "Fetch Courses Error:",
        err
      );

      setError(err.message);

      setCourses([]);

      setFeaturedCourses([]);

      setRecentCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ======================================================
      FETCH CATEGORIES
  ====================================================== */

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } =
        await supabase
          .from("course_categories")
          .select("*")
          .order("name", {
            ascending: true,
          });

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error(
        "Fetch Categories Error:",
        err
      );

      setCategories([]);
    }
  }, []);

  /* ======================================================
      REFRESH
  ====================================================== */

  const refreshCourses = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchCourses(),
      fetchCategories(),
    ]);

    setRefreshing(false);
  };

  /* ======================================================
      HELPERS
  ====================================================== */

  const getCourse = (courseId) =>
    courses.find(
      (course) =>
        String(course.id) ===
        String(courseId)
    ) || null;

  const getCoursesByCategory = (
    category
  ) => {
    if (
      !category ||
      category === "All"
    ) {
      return courses;
    }

    return courses.filter(
      (course) =>
        String(course.category_id) ===
          String(category) ||
        course.category === category
    );
  };

  const searchCourses = (
    keyword = ""
  ) => {
    const search =
      keyword.toLowerCase();

    return courses.filter((course) =>
      [
        course.title,
        course.description,
        course.shortDescription,
        course.instructor,
        course.category,
      ].some((field) =>
        field
          ?.toLowerCase()
          .includes(search)
      )
    );
  };

  const getFeaturedCourses = () =>
    featuredCourses;

  /* ======================================================
      RANDOM COURSE FROM EACH CATEGORY
  ====================================================== */

  const getRandomCategoryCourses =
    () => {
      const grouped = {};

      courses.forEach((course) => {
        if (
          !grouped[
            course.category_id
          ]
        ) {
          grouped[
            course.category_id
          ] = [];
        }

        grouped[
          course.category_id
        ].push(course);
      });

      return Object.values(
        grouped
      ).map((list) => {
        return list[
          Math.floor(
            Math.random() *
              list.length
          )
        ];
      });
    };

  /* ======================================================
      INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    refreshCourses();
  }, []);

  /* ======================================================
      PROVIDER
  ====================================================== */

  const value = {
    courses,

    featuredCourses,

    recentCourses,

    categories,

    loading,

    refreshing,

    error,

    totalCourses:
      courses.length,

    totalCategories:
      categories.length,

    fetchCourses,

    fetchCategories,

    refreshCourses,

    getCourse,

    getCoursesByCategory,

    getFeaturedCourses,

    getRandomCategoryCourses,

    searchCourses,
  };

  return (
    <CourseContext.Provider
      value={value}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context =
    useContext(CourseContext);

  if (!context) {
    throw new Error(
      "useCourses must be used inside CourseProvider"
    );
  }

  return context;
};

export default CourseContext;