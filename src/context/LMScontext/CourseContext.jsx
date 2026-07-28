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


  const [courses,setCourses] = useState([]);

  const [categories,setCategories] = useState([]);

  const [documents,setDocuments] = useState([]);


  const [featuredCourses,setFeaturedCourses] = useState([]);

  const [recentCourses,setRecentCourses] = useState([]);


  const [loading,setLoading] = useState(true);

  const [refreshing,setRefreshing] = useState(false);

  const [error,setError] = useState(null);





  /*
  ==========================================
  FETCH COURSES
  ==========================================
  */


  const fetchCourses = useCallback(async()=>{

    try{


      const {
        data,
        error,
      } = await supabase
        .from("courses")
        .select("*")
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



      const formatted =
        (data || []).map(course=>({

          ...course,


          thumbnail:
            course.thumbnail_url ||
            course.thumbnail ||
            "",


          rating:
            Number(course.rating) || 0,


          students:
            Number(course.students) || 0,


        }));


      setCourses(formatted);



      setFeaturedCourses(
        formatted.filter(
          item=>item.featured
        )
      );



      setRecentCourses(
        formatted.slice(0,12)
      );



    }
    catch(err){

      console.error(
        "COURSES ERROR",
        err
      );


      setCourses([]);

    }


  },[]);







  /*
  ==========================================
  FETCH CATEGORIES
  ==========================================
  */

  const fetchCategories = useCallback(async()=>{

    try{


      const {
        data,
        error,
      } = await supabase
        .from(
          "course_categories"
        )
        .select("*")
        .order(
          "name"
        );



      if(error)
        throw error;



      console.log(
        "CATEGORIES:",
        data
      );



      setCategories(
        data || []
      );



    }
    catch(err){

      console.error(
        "CATEGORY ERROR",
        err
      );


      setCategories([]);

    }


  },[]);









  /*
  ==========================================
  FETCH DOCUMENT ADMIN FILES
  ==========================================
  */


  const fetchDocuments = useCallback(async()=>{


    try{


      const {
        data,
        error,
      } = await supabase
        .from(
          "documents"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:false
          }
        );



      if(error)
        throw error;



      console.log(
        "DOCUMENT ADMIN FILES:",
        data
      );



      setDocuments(
        data || []
      );



    }
    catch(err){


      console.error(
        "DOCUMENT ERROR",
        err
      );


      setDocuments([]);


    }



  },[]);









  /*
  ==========================================
  CREATE CATEGORY COUNTS
  ==========================================
  */


  const documentCategories = useMemo(()=>{


    const map = {};



    documents.forEach(doc=>{


      const category =
        categories.find(
          cat =>
          String(cat.id)
          ===
          String(doc.category_id)
        );



      if(!category)
        return;



      if(!map[category.id]){


        map[category.id]={

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
    documents,
    categories
  ]);









  /*
  ==========================================
  HELPERS
  ==========================================
  */


  const getCourse=(id)=>{


    return courses.find(
      item =>
      String(item.id)
      ===
      String(id)
    );


  };







  const getDocumentsByCategory=(categoryId)=>{


    return documents.filter(
      doc =>

      String(doc.category_id)
      ===
      String(categoryId)

    );


  };







  const searchDocuments=(keyword="")=>{


    const text =
      keyword
      .toLowerCase()
      .trim();



    return documents.filter(
      doc =>


      doc.title
      ?.toLowerCase()
      .includes(text)



      ||

      doc.description
      ?.toLowerCase()
      .includes(text)



    );


  };







  const searchCourses=(keyword="")=>{


    const text =
      keyword
      .toLowerCase()
      .trim();



    return courses.filter(
      course =>


      course.title
      ?.toLowerCase()
      .includes(text)



      ||

      course.description
      ?.toLowerCase()
      .includes(text)



    );


  };








  /*
  ==========================================
  REFRESH
  ==========================================
  */


  const refreshCourses = async()=>{


    try{


      setRefreshing(true);



      await Promise.all([

        fetchCourses(),

        fetchCategories(),

        fetchDocuments(),

      ]);



    }
    finally{


      setRefreshing(false);


    }


  };






useEffect(()=>{

  const loadData = async()=>{

    setLoading(true);

    await Promise.all([
      fetchCourses(),
      fetchCategories(),
      fetchDocuments(),
    ]);

    setLoading(false);

  };


  loadData();

},[
  fetchCourses,
  fetchCategories,
  fetchDocuments
]);

  return (

    <CourseContext.Provider

      value={{

        courses,
categories: categories.map((category) => {
  const docCategory = documentCategories.find(
    (item) => String(item.id) === String(category.id)
  );

  return {
    ...category,
    count: docCategory?.count || 0,
  };
}),
        documents,



        featuredCourses,

        recentCourses,



        loading,

        refreshing,

        error,



        totalCourses:
          courses.length,


        totalDocuments:
          documents.length,


        totalCategories:
          categories.length,



        fetchCourses,

        fetchCategories,

        fetchDocuments,

        refreshCourses,

        getCourse,

        getDocumentsByCategory,


        searchCourses,

        searchDocuments,


      }}

    >

      {children}


    </CourseContext.Provider>

  );

};









export const useCourses=()=>{


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