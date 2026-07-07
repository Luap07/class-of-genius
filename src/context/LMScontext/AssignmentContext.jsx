// src/context/AssignmentContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";


// Create Context
const AssignmentContext = createContext();


// Storage Key
const ASSIGNMENT_STORAGE_KEY = "lms_assignments";


// Default Data
const defaultAssignments = [

  {
    id: 1,
    title: "Physics Motion Assignment",
    course: "Introduction to Physics",
    description: "Solve questions on motion and forces.",
    dueDate: "2026-07-15",
    status: "pending",
    score: null
  },


  {
    id: 2,
    title: "Organic Chemistry Report",
    course: "Organic Chemistry",
    description: "Write a report on organic compounds.",
    dueDate: "2026-07-20",
    status: "pending",
    score: null
  },


  {
    id: 3,
    title: "Mathematics Problem Set",
    course: "Advanced Mathematics",
    description: "Complete advanced algebra problems.",
    dueDate: "2026-07-25",
    status: "pending",
    score: null
  }

];





// Provider
export const AssignmentProvider = ({ children }) => {


  const [assignments, setAssignments] = useState(
    defaultAssignments
  );






  // Load assignments
  useEffect(() => {


    const savedAssignments =
      localStorage.getItem(
        ASSIGNMENT_STORAGE_KEY
      );



    if(savedAssignments){

      setAssignments(
        JSON.parse(savedAssignments)
      );

    }


  }, []);








  // Save assignments
  useEffect(() => {


    localStorage.setItem(

      ASSIGNMENT_STORAGE_KEY,

      JSON.stringify(assignments)

    );


  }, [

    assignments

  ]);









  // Submit assignment
  const submitAssignment = (
    assignmentId,
    submission
  ) => {


    setAssignments(prev =>


      prev.map(assignment =>


        assignment.id === assignmentId

        ?

        {

          ...assignment,

          submission,

          status:"submitted",

          submittedAt:
            new Date().toISOString()

        }


        :

        assignment


      )


    );


  };









  // Grade assignment
  const gradeAssignment = (
    assignmentId,
    score
  ) => {


    setAssignments(prev =>


      prev.map(assignment =>


        assignment.id === assignmentId

        ?

        {

          ...assignment,

          score,

          status:"graded"


        }


        :

        assignment


      )


    );


  };









  // Add new assignment
  const addAssignment = (
    assignment
  ) => {


    const newAssignment = {


      id:
        Date.now(),


      status:"pending",

      score:null,


      ...assignment


    };



    setAssignments(prev => [

      ...prev,

      newAssignment

    ]);


  };









  // Remove assignment
  const removeAssignment = (
    assignmentId
  ) => {


    setAssignments(prev =>

      prev.filter(

        assignment =>

        assignment.id !== assignmentId

      )

    );


  };









  // Get assignment by ID
  const getAssignment = (
    assignmentId
  ) => {


    return assignments.find(

      assignment =>

      assignment.id === assignmentId

    );


  };









  // Get course assignments
  const getCourseAssignments = (
    courseName
  ) => {


    return assignments.filter(

      assignment =>

      assignment.course === courseName

    );


  };









  // Statistics
  const totalAssignments =
    assignments.length;



  const completedAssignments =
    assignments.filter(

      assignment =>

      assignment.status === "graded"

      ||

      assignment.status === "submitted"

    ).length;



  const pendingAssignments =
    assignments.filter(

      assignment =>

      assignment.status === "pending"

    ).length;









  return (

    <AssignmentContext.Provider

      value={{

        assignments,

        submitAssignment,

        gradeAssignment,

        addAssignment,

        removeAssignment,

        getAssignment,

        getCourseAssignments,

        totalAssignments,

        completedAssignments,

        pendingAssignments

      }}

    >

      {children}

    </AssignmentContext.Provider>

  );


};









// Custom Hook
export const useAssignments = () => {


  const context =
    useContext(
      AssignmentContext
    );



  if(!context){


    throw new Error(
      "useAssignments must be used inside AssignmentProvider"
    );


  }



  return context;


};






export default AssignmentContext;