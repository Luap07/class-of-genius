// src/context/LMSContext/WeeklyTaskContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


// Create Context
const WeeklyTaskContext = createContext();


// Storage Key
const WEEKLY_TASK_STORAGE_KEY = "lms_weekly_tasks";


// Default Weekly Tasks
const defaultTasks = [

  {
    id: 1,
    title: "Complete Physics Motion Lesson",
    course: "Introduction to Physics",
    description:
      "Study motion, force and solve practice questions.",
    dueDate: "2026-07-15",
    status: "pending",
  },


  {
    id: 2,
    title: "Finish Chemistry Virtual Lab",
    course: "Organic Chemistry",
    description:
      "Complete the chemistry experiment simulation.",
    dueDate: "2026-07-20",
    status: "pending",
  },


  {
    id: 3,
    title: "Practice Mathematics Problems",
    course: "Advanced Mathematics",
    description:
      "Solve algebra and calculus exercises.",
    dueDate: "2026-07-25",
    status: "pending",
  },

];





// Provider
export const WeeklyTaskProvider = ({
  children
}) => {


  const [tasks, setTasks] = useState(
    defaultTasks
  );






  // Load saved tasks
  useEffect(() => {

    const savedTasks =
      localStorage.getItem(
        WEEKLY_TASK_STORAGE_KEY
      );


    if(savedTasks){

      setTasks(
        JSON.parse(savedTasks)
      );

    }


  }, []);







  // Save tasks
  useEffect(() => {

    localStorage.setItem(

      WEEKLY_TASK_STORAGE_KEY,

      JSON.stringify(tasks)

    );


  }, [tasks]);









  // Add task
  const addTask = (task) => {


    const newTask = {

      id: Date.now(),

      status: "pending",

      ...task,

    };


    setTasks(prev => [

      ...prev,

      newTask

    ]);


  };









  // Complete task
  const completeTask = (
    taskId
  ) => {


    setTasks(prev =>


      prev.map(task =>


        task.id === taskId

        ?

        {

          ...task,

          status:
            "completed",

          completedAt:
            new Date().toISOString(),

        }

        :

        task


      )


    );


  };









  // Update task
  const updateTask = (
    taskId,
    updates
  ) => {


    setTasks(prev =>


      prev.map(task =>


        task.id === taskId

        ?

        {

          ...task,

          ...updates

        }

        :

        task


      )


    );


  };









  // Remove task
  const removeTask = (
    taskId
  ) => {


    setTasks(prev =>


      prev.filter(

        task =>

        task.id !== taskId

      )


    );


  };









  // Get task
  const getTask = (
    taskId
  ) => {


    return tasks.find(

      task =>

      task.id === taskId

    );


  };









  // Get course tasks
  const getCourseTasks = (
    courseName
  ) => {


    return tasks.filter(

      task =>

      task.course === courseName

    );


  };









  // Statistics
  const totalTasks =
    tasks.length;



  const completedTasks =
    tasks.filter(

      task =>

      task.status === "completed"

    ).length;




  const pendingTasks =
    tasks.filter(

      task =>

      task.status === "pending"

    ).length;









  return (

    <WeeklyTaskContext.Provider

      value={{

        tasks,

        addTask,

        completeTask,

        updateTask,

        removeTask,

        getTask,

        getCourseTasks,

        totalTasks,

        completedTasks,

        pendingTasks,

      }}

    >

      {children}

    </WeeklyTaskContext.Provider>

  );

};









// Custom Hook
export const useWeeklyTasks = () => {


  const context =
    useContext(
      WeeklyTaskContext
    );



  if(!context){

    throw new Error(
      "useWeeklyTasks must be used inside WeeklyTaskProvider"
    );

  }



  return context;


};




export default WeeklyTaskContext;