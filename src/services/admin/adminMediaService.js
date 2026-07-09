import { supabase } from "../../supabaseClient";


// Get all media files
export const getMedia = async () => {

  const {
    data,
    error
  } = await supabase
    .from("media")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) throw error;


  return data;

};



// Upload media record
export const createMedia = async (
  mediaData
) => {

  const {
    data,
    error
  } = await supabase
    .from("media")
    .insert(mediaData)
    .select()
    .single();


  if (error) throw error;


  return data;

};



// Update media information
export const updateMedia = async (
  id,
  mediaData
) => {

  const {
    data,
    error
  } = await supabase
    .from("media")
    .update(mediaData)
    .eq("id", id)
    .select()
    .single();


  if (error) throw error;


  return data;

};



// Delete media
export const deleteMedia = async (
  id
) => {

  const {
    error
  } = await supabase
    .from("media")
    .delete()
    .eq("id", id);


  if (error) throw error;


  return true;

};



// Upload file to Supabase Storage
export const uploadMediaFile = async (
  file,
  folder = "media"
) => {

  const fileName =
    `${folder}/${Date.now()}-${file.name}`;


  const {
    data,
    error
  } = await supabase.storage
    .from("uploads")
    .upload(
      fileName,
      file
    );


  if (error) throw error;


  const {
    data: publicUrl
  } = supabase.storage
    .from("uploads")
    .getPublicUrl(
      data.path
    );


  return {
    path: data.path,
    url: publicUrl.publicUrl
  };

};