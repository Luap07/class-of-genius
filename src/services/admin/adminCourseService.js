import { supabase } from "../../supabaseClient";


// Get all courses
export const getCourses = async () => {

  const {
    data,
    error
  } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) throw error;


  return data;

};



// Create course
export const createCourse = async (
  courseData
) => {

  const {
    data,
    error
  } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();


  if (error) throw error;


  return data;

};



// Update course
export const updateCourse = async (
  id,
  courseData
) => {

  const {
    data,
    error
  } = await supabase
    .from("courses")
    .update(courseData)
    .eq("id", id)
    .select()
    .single();


  if (error) throw error;


  return data;

};



// Delete course
export const deleteCourse = async (
  id
) => {

  const {
    error
  } = await supabase
    .from("courses")
    .delete()
    .eq("id", id);


  if (error) throw error;


  return true;

};
