import { supabase } from "../supabaseClient"; // Adjust this path if your supabaseClient is elsewhere

export const getCategories = async () => {
  const { data, error } = await supabase
    .from("course_categories")
    .select(`id, name, color, created_at, courses(id)`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((cat) => ({
    ...cat,
    courses: cat.courses?.length || 0
  }));
};

export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from("course_categories")
    .delete()
    .eq("id", id);
    
  if (error) throw error;
  return true;
};