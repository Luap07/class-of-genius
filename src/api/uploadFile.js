import { supabase } from "../lib/supabaseClient";

export const uploadFile = async (file, userId) => {
  const fileName = `${Date.now()}_${file.name}`;

  // 1. upload to Supabase Storage
  const { error } = await supabase.storage
    .from("downloads")
    .upload(fileName, file);

  if (error) {
    console.log("Upload error:", error.message);
    return;
  }

  // 2. get public URL
  const { data } = supabase.storage
    .from("downloads")
    .getPublicUrl(fileName);

  const fileUrl = data.publicUrl;

  // 3. save to database
  await supabase.from("user_downloads").insert([
    {
      user_id: userId,
      name: file.name,
      url: fileUrl,
    },
  ]);
};