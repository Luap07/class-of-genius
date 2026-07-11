import { supabase } from "../../lib/supabaseClient";

// ===============================
// GET ALL COURSES
// ===============================
export const getCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
};

// ===============================
// GET SINGLE COURSE
// ===============================
export const getCourseById = async (id) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};

// ===============================
// CREATE COURSE
// ===============================
export const createCourse = async (courseData) => {
  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// ===============================
// UPDATE COURSE
// ===============================
export const updateCourse = async (id, courseData) => {
  const { data, error } = await supabase
    .from("courses")
    .update(courseData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// ===============================
// DELETE COURSE
// ===============================
export const deleteCourse = async (id) => {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
};