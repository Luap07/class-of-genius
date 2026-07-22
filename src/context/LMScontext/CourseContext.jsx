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
        .select(`
          *,
  course_categories!courses_category_id_fkey(
  id,
  name,
 description
),
          subjects(
            id,
            name
          ),
          course_modules(
            id,
            title,
            description,
            order_index,
           course_lessons(
  id,
  title,
  description,
  video_url,
  duration
)
          ),
          course_quizzes(
            id,
            title,
            description
          ),
          weekly_tasks(
            id,
            title,
            description,
            due_date
          ),
          course_resources(
            id,
            title,
            file_url,
            type
          )
        `)
        .eq("status", "Published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCourses = (data || []).map((course) => ({
        id: course.id,
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        thumbnail: course.thumbnail_url || course.thumbnail || "",
        
        /* CATEGORY */
        category_id: course.category_id,
        category: course.course_categories?.name || "General",
        
        /* SUBJECT */
        subject_id: course.subject_id,
        subject: course.subjects?.name || "",
        
        instructor: course.instructor || "Class Of Genius",
        level: course.level || "Beginner",
        language: course.language || "English",
        duration: course.duration || "",
        price: Number(course.price) || 0,
        rating: Number(course.rating) || 0,
        students: Number(course.students) || 0,
        featured: course.featured || false,
        certificate: course.certificate || false,
        
        /* MODULES */
        modules: (course.course_modules || []).map((module) => ({
          ...module,
          lessons: module.course_lessons || [],
        })),
        
        lessons: (course.course_modules || []).reduce(
          (total, module) => total + (module.course_lessons?.length || 0),
          0
        ),
        
        quizzes: course.course_quizzes || [],
        weeklyTasks: course.weekly_tasks || [],
        resources: course.course_resources || [],
        requirements: course.requirements || "",
        learning_outcomes: course.learning_outcomes || "",
        createdAt: course.created_at,
      }));

      setCourses(formattedCourses);
      setFeaturedCourses(formattedCourses.filter((course) => course.featured));
      setRecentCourses(formattedCourses.slice(0, 12));
    } catch (err) {
      console.error("Fetch Courses Error MESSAGE:", err.message);
      console.error("FULL ERROR:", JSON.stringify(err, null, 2));
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ======================================================
     FETCH CATEGORIES
  ====================================================== */
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("course_categories")
        .select(`
          id,
          name,
          description,
          image,
          created_at
        `)
        .order("name", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
      setCategories([]);
    }
  }, []);

  /* ======================================================
     REFRESH
  ====================================================== */
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

  const getCoursesByCategory = (categoryId) => {
    if (!categoryId || categoryId === "All") return courses;
    return courses.filter(
      (course) => String(course.category_id) === String(categoryId)
    );
  };

  const searchCourses = (keyword = "") => {
    const search = keyword.toLowerCase();
    return courses.filter((course) =>
      [
        course.title,
        course.description,
        course.instructor,
        course.category,
        course.subject,
      ].some((value) => value?.toLowerCase().includes(search))
    );
  };

  const getFeaturedCourses = () => featuredCourses;

  const getRandomCategoryCourses = () => {
    const grouped = {};
    courses.forEach((course) => {
      if (!grouped[course.category_id]) {
        grouped[course.category_id] = [];
      }
      grouped[course.category_id].push(course);
    });

    return Object.values(grouped).map(
      (list) => list[Math.floor(Math.random() * list.length)]
    );
  };

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const value = {
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
    getFeaturedCourses,
    getRandomCategoryCourses,
    searchCourses,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error("useCourses must be used inside CourseProvider");
  }

  return context;
};

export default CourseContext;