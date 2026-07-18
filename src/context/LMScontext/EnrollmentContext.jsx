import React, {
  createContext,
  useContext,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";

import { AuthContext } from "../AuthContext";


const EnrollmentContext =
createContext();



export const EnrollmentProvider = ({
  children
}) => {


  const {
    user
  } = useContext(AuthContext);



  const [loading,setLoading] =
  useState(false);



  // ==========================
  // ENROLL COURSE
  // ==========================

  const enrollCourse = async(courseId)=>{


    if(!user){

      throw new Error(
        "Login required"
      );

    }



    try{


      setLoading(true);



      const {
        data,
        error
      } = await supabase
      .from(
        "course_enrollments"
      )
      .insert({

        course_id:courseId,

        student_id:user.id,

        progress:0,

        completed:false

      })
      .select()
      .single();



      if(error)
      throw error;



      return data;



    }
    finally{

      setLoading(false);

    }


  };







  // ==========================
  // GET MY ENROLLMENTS
  // ==========================


  const getMyEnrollments =
  async()=>{


    if(!user)
    return [];



    const {
      data,
      error
    } =
    await supabase
    .from(
      "course_enrollments"
    )
    .select(`
      *,
      courses(
        title,
        thumbnail_url
      )
    `)
    .eq(
      "student_id",
      user.id
    );



    if(error)
    throw error;



    return data || [];

  };








  return (

    <EnrollmentContext.Provider

      value={{

        enrollCourse,

        getMyEnrollments,

        loading

      }}

    >

      {children}


    </EnrollmentContext.Provider>

  );


};





export const useEnrollment=()=>{


 const context =
 useContext(
   EnrollmentContext
 );


 if(!context){

  throw new Error(
   "useEnrollment must be inside EnrollmentProvider"
  );

 }


 return context;


};