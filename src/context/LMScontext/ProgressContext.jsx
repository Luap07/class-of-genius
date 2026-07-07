// src/context/ProgressContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";


// Create Context
const ProgressContext = createContext();


// Storage Key
const PROGRESS_STORAGE_KEY = "lms_progress";


// Default Data
const defaultProgress = {
  progress: {},

  currentLearning: null
};




// Provider
export const ProgressProvider = ({ children }) => {


  const [progress, setProgress] = useState(
    defaultProgress.progress
  );


  const [currentLearning, setCurrentLearning] = useState(
    defaultProgress.currentLearning
  );





  // Load saved progress
  useEffect(() => {


    const savedProgress = localStorage.getItem(
      PROGRESS_STORAGE_KEY
    );


    if(savedProgress){

      const data = JSON.parse(savedProgress);


      setProgress(
        data.progress || {}
      );


      setCurrentLearning(
        data.currentLearning || null
      );

    }


  }, []);






  // Save progress
  useEffect(() => {


    localStorage.setItem(

      PROGRESS_STORAGE_KEY,

      JSON.stringify({

        progress,

        currentLearning

      })

    );


  }, [

    progress,

    currentLearning

  ]);









  // Complete lesson
  const completeLesson = (
    courseId,
    lessonId,
    totalLessons
  ) => {


    setProgress(prev => {


      const courseProgress =
        prev[courseId] || {

          completedLessons: [],

          percentage: 0

        };



      const alreadyCompleted =
        courseProgress.completedLessons.includes(
          lessonId
        );



      if(alreadyCompleted){

        return prev;

      }





      const completedLessons = [

        ...courseProgress.completedLessons,

        lessonId

      ];





      const percentage = Math.round(

        (completedLessons.length / totalLessons) * 100

      );





      return {


        ...prev,


        [courseId]:{


          completedLessons,


          percentage


        }


      };


    });




    setCurrentLearning({

      courseId,

      lessonId

    });


  };









  // Continue Learning
  const continueLearning = () => {


    return currentLearning;


  };









  // Get course progress
  const getCourseProgress = (courseId)=>{


    return (

      progress[courseId]

      ||

      {

        completedLessons: [],

        percentage:0

      }

    );


  };








  // Check lesson completion
  const isLessonCompleted = (
    courseId,
    lessonId
  )=>{


    const course = progress[courseId];


    if(!course) return false;



    return course.completedLessons.includes(
      lessonId
    );


  };









  // Total completed lessons
  const totalCompletedLessons = Object.values(
    progress
  )
  .reduce(

    (total, course)=>


      total + course.completedLessons.length,


    0

  );









  return (

    <ProgressContext.Provider

      value={{

        progress,

        currentLearning,

        completeLesson,

        continueLearning,

        getCourseProgress,

        isLessonCompleted,

        totalCompletedLessons

      }}

    >

      {children}

    </ProgressContext.Provider>

  );


};









// Custom Hook
export const useProgress = ()=>{


  const context = useContext(
    ProgressContext
  );


  if(!context){


    throw new Error(
      "useProgress must be used inside ProgressProvider"
    );


  }


  return context;


};





export default ProgressContext;