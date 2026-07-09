import { useEffect, useState } from "react";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../../services/admin/adminCourseService";


const useAdminCourses = () => {

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);


  const fetchCourses = async () => {

    try {

      setLoading(true);

      const data = await getCourses();

      setCourses(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };


  const addCourse = async (courseData) => {

    try {

      const newCourse =
        await createCourse(courseData);


      setCourses((prev) => [
        ...prev,
        newCourse
      ]);


    } catch (err) {

      setError(err.message);

    }

  };


  const editCourse = async (
    id,
    courseData
  ) => {

    try {

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


    } catch (err) {

      setError(err.message);

    }

  };


  const removeCourse = async (id) => {

    try {

      await deleteCourse(id);


      setCourses((prev) =>
        prev.filter(
          (course) =>
            course.id !== id
        )
      );


    } catch (err) {

      setError(err.message);

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

    removeCourse

  };

};


export default useAdminCourses;