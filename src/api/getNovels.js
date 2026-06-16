import { supabase } from "../supabase";

export const getNovels = async () => {
  const { data, error } = await supabase
    .from("novels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  return data;
};