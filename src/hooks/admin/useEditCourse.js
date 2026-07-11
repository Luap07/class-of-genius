import { useEffect, useState } from "react";

import {
  getCourseById,
  updateCourse,
} from "../../services/admin/adminCourseService";

import { supabase } from "../../lib/supabaseClient";



const initialCourse = {

  title: "",
  slug: "",
  subtitle: "",
  description: "",

  instructor: "",

  category: "",
  category_id: "",

  level: "Beginner",

  language: "English",

  duration: "",

  lessons_count: 0,

  learning_outcomes: "",

  requirements: "",

  price: 0,

  status: "Draft",

  featured: false,

  certificate: true,

  thumbnail_url: "",

  video_url: "",

};





const useEditCourse = (id) => {


  const [course,setCourse] =
    useState(initialCourse);


  const [categories,setCategories] =
    useState([]);


  const [thumbnail,setThumbnail] =
    useState(null);


  const [preview,setPreview] =
    useState("");



  const [loading,setLoading] =
    useState(true);


  const [saving,setSaving] =
    useState(false);


  const [uploading,setUploading] =
    useState(false);



  const [success,setSuccess] =
    useState("");


  const [error,setError] =
    useState("");





  // ============================
  // LOAD DATA
  // ============================

  const loadData = async()=>{


    try{


      setLoading(true);


      const {
        data,
        error
      } = await supabase

        .from("course_categories")

        .select("*")

        .order("name");



      if(error)
        throw error;



      setCategories(data || []);




      const courseData =
        await getCourseById(id);



      setCourse({

        ...initialCourse,

        ...courseData,

      });



      setPreview(
        courseData.thumbnail_url || ""
      );



    }

    catch(err){

      setError(err.message);

    }

    finally{

      setLoading(false);

    }


  };






  useEffect(()=>{


    if(id){

      loadData();

    }


  },[id]);








  // ============================
  // FORM CHANGE
  // ============================


  const handleChange = (e)=>{


    const {
      name,
      value,
      checked,
      type
    } = e.target;



    setCourse(prev=>{


      const updated = {

        ...prev,

        [name]:

          type === "checkbox"

          ? checked

          : value

      };



      if(name==="title"){

        updated.slug = value

          .toLowerCase()

          .trim()

          .replace(/[^\w\s-]/g,"")

          .replace(/\s+/g,"-");

      }




      if(name==="category_id"){


        const category =
          categories.find(
            cat=>cat.id===value
          );


        updated.category =
          category?.name || "";

      }



      return updated;


    });


  };









  // ============================
  // THUMBNAIL
  // ============================


  const handleThumbnail = (e)=>{


    const file =
      e.target.files[0];


    if(!file)
      return;



    setThumbnail(file);


    setPreview(
      URL.createObjectURL(file)
    );


  };








  // ============================
  // UPLOAD IMAGE
  // ============================


  const uploadThumbnail = async()=>{


    if(!thumbnail)

      return course.thumbnail_url;



    try{


      setUploading(true);



      const fileName =

        `${Date.now()}-${thumbnail.name}`;




      const {
        error
      } = await supabase.storage

        .from("course-covers")

        .upload(
          fileName,
          thumbnail
        );



      if(error)

        throw error;



      const {
        data
      } = supabase.storage

        .from("course-covers")

        .getPublicUrl(fileName);



      return data.publicUrl;


    }

    finally{

      setUploading(false);

    }


  };









  // ============================
  // SAVE
  // ============================


  const handleSave = async()=>{


    try{


      setSaving(true);

      setError("");



      let imageUrl =
        course.thumbnail_url;



      if(thumbnail){

        imageUrl =
          await uploadThumbnail();

      }



      await updateCourse(

        id,

        {

          ...course,

          thumbnail_url:imageUrl,

          lessons_count:
            Number(course.lessons_count),

          price:
            Number(course.price)

        }

      );



      setSuccess(
        "Course updated successfully."
      );


      setCourse(prev=>({

        ...prev,

        thumbnail_url:imageUrl

      }));


    }


    catch(err){

      setError(err.message);

    }


    finally{

      setSaving(false);

    }


  };








  return {

    course,

    setCourse,

    categories,


    thumbnail,

    setThumbnail,


    preview,

    setPreview,


    loading,

    saving,

    uploading,


    success,

    error,


    handleChange,

    handleThumbnail,

    handleSave,

  };


};



export default useEditCourse;