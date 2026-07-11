import { supabase } from "../../supabaseClient";

// =====================================
// GET ALL CATEGORIES
// =====================================
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("course_categories")
    .select(`
      id,
      name,
      color,
      created_at,
      courses (id)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color || "bg-blue-500",
    courses: category.courses?.length || 0,
    created_at: category.created_at,
  }));
};

// =====================================
// CREATE CATEGORY
// =====================================
export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from("course_categories")
    .insert({
      name: categoryData.name,
      color: categoryData.color || "bg-blue-500",
    })
    .select()
    .single();

  if (error) throw error;

  return { ...data, courses: 0 };
};

// =====================================
// UPDATE CATEGORY
// =====================================
export const updateCategory = async (id, categoryData) => {
  const { data, error } = await supabase
    .from("course_categories")
    .update({
      name: categoryData.name,
      color: categoryData.color || "bg-blue-500",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// =====================================
// DELETE CATEGORY
// =====================================
export const deleteCategory = async (id) => {
  // Check if category has courses first
  const { data: courses, error: checkError } = await supabase
    .from("courses")
    .select("id")
    .eq("category_id", id);

  if (checkError) throw checkError;

  if (courses.length > 0) {
    throw new Error("Cannot delete category because courses are attached to it.");
  }

  const { error } = await supabase
    .from("course_categories")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
};