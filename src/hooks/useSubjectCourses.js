// src/hooks/useSubjectCourses.js

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function useSubjectCourses() {
  const { category, subject } = useParams();

  const [courses, setCourses] = useState([]);
  const [subjectInfo, setSubjectInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, [category, subject]);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      /* ---------------------------------------------
         Resolve Subject
      ----------------------------------------------*/

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          category_id,
          course_categories(
            id,
            name
          )
        `)
        .eq("id", subject)
        .single();

      if (subjectError) throw subjectError;

      setSubjectInfo(subjectData);

      /* ---------------------------------------------
         Load Courses
      ----------------------------------------------*/

      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          course_categories!courses_category_id_fkey(
            id,
            name
          ),
          subjects(
            id,
            name
          )
        `)
        .eq("status", "Published")
        .eq("category_id", subjectData.category_id)
        .eq("subject_id", subjectData.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      const formatted = (data || []).map((course) => ({
        id: course.id,

        title: course.title,

        slug: course.slug,

        description: course.description,

        thumbnail:
          course.thumbnail_url ||
          course.thumbnail,

        instructor:
          course.instructor,

        duration:
          course.duration,

        students:
          Number(course.students || 0),

        rating:
          Number(course.rating || 0),

        level:
          course.level,

        language:
          course.language,

        category:
          course.course_categories?.name,

        category_id:
          course.category_id,

        subject:
          course.subjects?.name,

        subject_id:
          course.subject_id,

        featured:
          course.featured,

        certificate:
          course.certificate,
      }));

      setCourses(formatted);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    courses,
    subjectInfo,
  };
}