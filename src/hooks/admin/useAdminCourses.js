import { useEffect, useState } from "react";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../services/admin/adminCourseService";


const useAdminCourses = () => {


  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);



  // ==============================
  // FETCH COURSES
  // ==============================

  const fetchCourses = async () => {

    try {

      setLoading(true);

      setError(null);


      const data = await getCourses();


      setCourses(data);


      return data;


    } catch (err) {

      setError(err.message);

      throw err;


    } finally {

      setLoading(false);

    }

  };





  // ==============================
  // CREATE COURSE
  // ==============================

  const addCourse = async (
    courseData
  ) => {

    try {

      setError(null);


      const newCourse =
        await createCourse(courseData);



      setCourses((prev) => [

        ...prev,

        newCourse

      ]);



      return newCourse;



    } catch (err) {

      setError(err.message);

      throw err;

    }

  };






  // ==============================
  // UPDATE COURSE
  // ==============================

  const editCourse = async (
    id,
    courseData
  ) => {

    try {

      setError(null);



      const updatedCourse =
        await updateCourse(
          id,
          courseData
        );



      setCourses((prev) =>

        prev.map((course) =>

          course.id === id

            ? updatedCourse

            : course

        )

      );



      return updatedCourse;



    } catch (err) {

      setError(err.message);

      throw err;

    }

  };







  // ==============================
  // DELETE COURSE
  // ==============================

  const removeCourse = async (
    id
  ) => {

    try {

      setError(null);



      await deleteCourse(id);



      setCourses((prev) =>

        prev.filter(

          (course) =>

            course.id !== id

        )

      );



      return true;



    } catch (err) {

      setError(err.message);

      throw err;

    }

  };







  useEffect(() => {

    fetchCourses();

  }, []);






  return {

    courses,

    loading,

    error,


    fetchCourses,

    addCourse,

    editCourse,

    removeCourse,

  };

};


export default useAdminCourses;