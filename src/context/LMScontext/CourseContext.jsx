import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  /* ======================================================
     STATE
  ====================================================== */
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* ======================================================
     FETCH DATA
  ====================================================== */
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("courses")
        .select(`*, categories(id, name)`)
        .eq("status", "Published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCourses = (data || []).map((course) => ({
        id: course.id,
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        shortDescription: course.short_description || "",
        thumbnail: course.thumbnail || "",
        banner: course.banner || "",
        instructor: course.instructor || "Class Of Genius",
        category: course.categories?.name || course.category || "General",
        categoryId: course.category_id || null,
        featured: course.featured || false,
        price: course.price || 0,
        lessons: course.total_lessons || 0,
        duration: course.duration || "",
        level: course.level || "Beginner",
        language: course.language || "English",
        certificate: course.certificate || false,
        rating: course.rating || 0,
        students: course.students || 0,
        status: course.status,
        createdAt: course.created_at,
      }));

      setCourses(formattedCourses);
      setFeaturedCourses(formattedCourses.filter((course) => course.featured));
    } catch (err) {
      console.error("Fetch Courses Error:", err);
      setError(err.message);
      setCourses([]);
      setFeaturedCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("course_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
      setCategories([]);
    }
  }, []);

  const refreshCourses = async () => {
    setRefreshing(true);
    await Promise.all([fetchCourses(), fetchCategories()]);
    setRefreshing(false);
  };

  /* ======================================================
     HELPERS
  ====================================================== */
  const getCourse = (courseId) => 
    courses.find((course) => String(course.id) === String(courseId)) || null;

  const getCoursesByCategory = (category) => 
    (!category || category === "All") ? courses : courses.filter((c) => c.category === category);

  const searchCourses = (keyword = "") => {
    const search = keyword.toLowerCase();
    return courses.filter((c) => 
      [c.title, c.description, c.shortDescription, c.instructor, c.category]
        .some((field) => field?.toLowerCase().includes(search))
    );
  };

  const getFeaturedCourses = () => featuredCourses;

  useEffect(() => {
    refreshCourses();
  }, []);

  /* ======================================================
     PROVIDER
  ====================================================== */
  const value = {
    courses,
    featuredCourses,
    categories,
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
    getFeaturedCourses,
    searchCourses,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used inside CourseProvider");
  }
  return context;
};

export default CourseContext;