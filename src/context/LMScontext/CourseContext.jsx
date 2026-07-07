// src/context/CourseContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";


// Create Context
const CourseContext = createContext();


// Storage key
const COURSE_STORAGE_KEY = "lms_courses";


// Default Data
const defaultCourses = {
  availableCourses: [
    {
      id: 1,
      title: "Introduction to Physics",
      category: "Physics",
      instructor: "Science Department",
      progress: 0,
      lessons: 12,
      completedLessons: 0,
      enrolled: false
    },
    {
      id: 2,
      title: "Organic Chemistry",
      category: "Chemistry",
      instructor: "Science Department",
      progress: 0,
      lessons: 15,
      completedLessons: 0,
      enrolled: false
    },
    {
      id: 3,
      title: "Advanced Mathematics",
      category: "Mathematics",
      instructor: "Mathematics Department",
      progress: 0,
      lessons: 20,
      completedLessons: 0,
      enrolled: false
    }
  ],

  enrolledCourses: []
};



// Provider
export const CourseProvider = ({ children }) => {


  const [availableCourses, setAvailableCourses] = useState(
    defaultCourses.availableCourses
  );


  const [enrolledCourses, setEnrolledCourses] = useState(
    defaultCourses.enrolledCourses
  );



  // Load saved courses
  useEffect(() => {

    const savedCourses = localStorage.getItem(
      COURSE_STORAGE_KEY
    );


    if(savedCourses){

      const parsed = JSON.parse(savedCourses);

      setAvailableCourses(parsed.availableCourses || []);
      setEnrolledCourses(parsed.enrolledCourses || []);

    }

  }, []);




  // Save courses
  useEffect(() => {

    localStorage.setItem(
      COURSE_STORAGE_KEY,
      JSON.stringify({
        availableCourses,
        enrolledCourses
      })
    );


  }, [
    availableCourses,
    enrolledCourses
  ]);





  // Enroll course
  const enrollCourse = (courseId) => {


    const course = availableCourses.find(
      course => course.id === courseId
    );


    if(!course) return;



    const alreadyEnrolled =
      enrolledCourses.some(
        item => item.id === courseId
      );


    if(alreadyEnrolled) return;



    const updatedCourse = {
      ...course,
      enrolled:true,
      progress:0,
      completedLessons:0
    };



    setEnrolledCourses(prev => [
      ...prev,
      updatedCourse
    ]);



    setAvailableCourses(prev =>
      prev.map(course =>
        course.id === courseId
        ?
        {
          ...course,
          enrolled:true
        }
        :
        course
      )
    );

  };







  // Start Course
  const startCourse = (courseId) => {


    setEnrolledCourses(prev =>

      prev.map(course =>

        course.id === courseId

        ?

        {
          ...course,
          started:true
        }

        :

        course

      )

    );

  };







  // Remove Course
  const removeCourse = (courseId) => {


    setEnrolledCourses(prev =>
      prev.filter(
        course => course.id !== courseId
      )
    );



    setAvailableCourses(prev =>

      prev.map(course =>

        course.id === courseId

        ?

        {
          ...course,
          enrolled:false
        }

        :

        course

      )

    );


  };






  // Get single course
  const getCourse = (courseId)=>{


    return enrolledCourses.find(
      course=>course.id===courseId
    );

  };







  // Total enrolled courses
  const totalCourses = enrolledCourses.length;







  return (

    <CourseContext.Provider

      value={{

        availableCourses,

        enrolledCourses,

        enrollCourse,

        startCourse,

        removeCourse,

        getCourse,

        totalCourses

      }}

    >

      {children}

    </CourseContext.Provider>

  );


};







// Custom hook
export const useCourses = () => {

  const context = useContext(CourseContext);


  if(!context){

    throw new Error(
      "useCourses must be used inside CourseProvider"
    );

  }


  return context;

};




export default CourseContext;