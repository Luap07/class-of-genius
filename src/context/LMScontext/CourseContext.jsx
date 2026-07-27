// src/context/LMSContext/CourseContext.jsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";

const CourseContext = createContext();


export const CourseProvider = ({ children }) => {

  /* =====================================================
      STATE
  ===================================================== */

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);

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


      const {
        data,
        error,
      } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "Published")
        .order("created_at", {
          ascending:false,
        });


      if(error) throw error;



      const formatted =
        (data || []).map((course)=>({

          id: course.id,

          title:
            course.title || "",

          slug:
            course.slug || "",

          description:
            course.description || "",


          thumbnail:
            course.thumbnail_url ||
            course.thumbnail ||
            "",


          category_id:
            course.category_id,


          subject_id:
            course.subject_id,


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
        formatted.filter(
          (course)=>course.featured
        )
      );


      setRecentCourses(
        formatted.slice(0,12)
      );


    } catch(err){

      console.error(
        "Fetch Courses Error:",
        err
      );


      setError(err.message);
      setCourses([]);


    } finally {

      setLoading(false);

    }


  },[]);





  /* =====================================================
      FETCH CATEGORIES
  ===================================================== */

  const fetchCategories = useCallback(async()=>{

    try{


      const {
        data,
        error,
      } = await supabase
        .from("course_categories")
        .select("*")
        .order("name");


      if(error) throw error;


      setCategories(
        data || []
      );

      console.log(
  "FETCHED CATEGORIES:",
  data
);

    }catch(err){


      console.error(
        "Fetch Categories Error:",
        err
      );


      setCategories([]);


    }


  },[]);





  /* =====================================================
      FETCH DOCUMENTS
  ===================================================== */


  const fetchDocuments = useCallback(async()=>{


    try{


      const {
        data,
        error,
      } = await supabase
        .from("documents")
        .select(`
          *,
          course_categories(
            id,
            name
          )
        `)
        .order(
          "created_at",
          {
            ascending:false,
          }
        );


      if(error) throw error;


      setDocuments(
        data || []
      );


    }catch(err){


      console.error(
        "Fetch Documents Error:",
        err
      );


      setDocuments([]);


    }


  },[]);





  /* =====================================================
      CREATE CATEGORIES FROM DOCUMENT ADMIN
  ===================================================== */


  const documentCategories = useMemo(()=>{


    const map = {};



    documents.forEach((doc)=>{


      const category =
        doc.course_categories;



      if(!category) return;



      if(!map[category.id]){


        map[category.id] = {

          id:
            category.id,


          name:
            category.name,


          count:
            0,


        };


      }



      map[category.id].count++;



    });



    return Object.values(map);



  },[
    documents
  ]);






  /* =====================================================
      REFRESH
  ===================================================== */


  const refreshCourses = async()=>{


    try{


      setRefreshing(true);


      await Promise.all([

        fetchCourses(),

        fetchCategories(),

        fetchDocuments(),

      ]);


    }finally{


      setRefreshing(false);


    }


  };





  /* =====================================================
      HELPERS
  ===================================================== */


  const getCourse = (id)=>

    courses.find(
      (course)=>
        String(course.id) === String(id)
    );





  const getCoursesByCategory =
    (categoryId)=>

      courses.filter(
        (course)=>

          String(
            course.category_id
          ) === String(categoryId)

      );





  const getDocumentsByCategory =
    (categoryId)=>

      documents.filter(
        (doc)=>

          String(
            doc.category_id ||
            doc.course_categories?.id
          )
          ===
          String(categoryId)

      );







  const searchCourses =
    (keyword="")=>{


      const text =
        keyword
        .toLowerCase()
        .trim();



      return courses.filter(
        (course)=>

          course.title
          ?.toLowerCase()
          .includes(text)

          ||

          course.description
          ?.toLowerCase()
          .includes(text)

      );


    };







  const searchDocuments =
    (keyword="")=>{


      const text =
        keyword
        .toLowerCase()
        .trim();



      return documents.filter(
        (doc)=>

          doc.title
          ?.toLowerCase()
          .includes(text)

          ||

          doc.description
          ?.toLowerCase()
          .includes(text)

          ||

          doc.course_categories?.name
          ?.toLowerCase()
          .includes(text)

      );


    };







  /* =====================================================
      LOAD DATA
  ===================================================== */


  useEffect(()=>{

    refreshCourses();

  },[]);







  return (

    <CourseContext.Provider

      value={{

        /* DATA */

        courses,

        categories:
          documentCategories.length
          ? documentCategories
          : categories,


        documents,


        featuredCourses,

        recentCourses,



        /* STATUS */

        loading,

        refreshing,

        error,



        /* COUNTS */

        totalCourses:
          courses.length,


        totalCategories:
          (
            documentCategories.length
            ? documentCategories
            : categories
          ).length,


        totalDocuments:
          documents.length,



        /* FETCH */

        fetchCourses,

        fetchCategories,

        fetchDocuments,

        refreshCourses,



        /* HELPERS */

        getCourse,

        getCoursesByCategory,

        getDocumentsByCategory,


        searchCourses,

        searchDocuments,


      }}

    >

      {children}


    </CourseContext.Provider>

  );


};





export const useCourses = ()=>{


  const context =
    useContext(
      CourseContext
    );


  if(!context){

    throw new Error(
      "useCourses must be used inside CourseProvider"
    );

  }


  return context;


};

export default CourseContext;