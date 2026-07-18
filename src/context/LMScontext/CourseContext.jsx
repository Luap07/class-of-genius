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
      .select(`
        *,

        course_modules(
          id,
          title,
          description,
          order_index,

          lessons(
            id,
            title,
            description,
            video_url,
            duration,
            order_index
          )
        ),


        quizzes(
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
      .eq(
        "status",
        "Published"
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );


    if(error)
      throw error;



    const formattedCourses =
      (data || []).map(course => ({


        id:
          course.id,


        title:
          course.title || "",


        slug:
          course.slug || "",


        description:
          course.description || "",



        thumbnail:
          course.thumbnail_url || "",



        instructor:
          course.instructor ||
          "Class Of Genius",



        category:
          course.category ||
          "General",



        level:
          course.level ||
          "Beginner",



        language:
          course.language ||
          "English",



        rating:
          Number(course.rating) || 0,



        students:
          Number(course.students) || 0,



        lessons:
          course.course_modules
          ?.reduce(
            (total,module)=>
            total +
            (module.lessons?.length || 0),
            0
          )
          || 0,



        modules:
          course.course_modules || [],



        quizzes:
          course.quizzes || [],



        weeklyTasks:
          course.weekly_tasks || [],



        resources:
          course.course_resources || [],



        certificate:
          course.certificate || false,



        createdAt:
          course.created_at,


      }));



    setCourses(formattedCourses);



    setFeaturedCourses(
      formattedCourses.filter(
        course =>
        course.featured
      )
    );



    setRecentCourses(
      formattedCourses.slice(
        0,
        12
      )
    );



  }

  catch(err){


    console.error(
      "Fetch Courses Error:",
      err
    );


    setError(
      err.message
    );


    setCourses([]);

  }


  finally{

    setLoading(false);

  }


},[]);
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