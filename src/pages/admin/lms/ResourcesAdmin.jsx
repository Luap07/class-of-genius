// src/pages/admin/resources/ResourcesAdmin.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Upload,
  Video,
  Trash2,
  ExternalLink,
  Loader2,
  PlayCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


const ResourcesAdmin = () => {


  const [title,setTitle] = useState("");

  const [description,setDescription] = useState("");

  const [video,setVideo] = useState(null);


  const [resources,setResources] = useState([]);

  const [uploading,setUploading] = useState(false);

  const [loading,setLoading] = useState(true);



  // ============================
  // FETCH VIDEOS
  // ============================

  const fetchResources = async()=>{

    try{

      setLoading(true);


      const {
        data,
        error
      } = await supabase

      .from("resources")

      .select("*")

      .eq(
        "resource_type",
        "video"
      )

      .order(
        "created_at",
        {
          ascending:false
        }
      );


      if(error)
        throw error;


      setResources(
        data || []
      );


    }catch(error){

      console.error(
        "RESOURCE FETCH ERROR",
        error
      );

    }
    finally{

      setLoading(false);

    }

  };



  useEffect(()=>{

    fetchResources();

  },[]);





  // ============================
  // UPLOAD VIDEO
  // ============================


  const uploadVideo = async(e)=>{

    e.preventDefault();


    if(!title || !video){

      alert(
        "Title and video required"
      );

      return;

    }


    try{

      setUploading(true);



      const extension =
        video.name
        .split(".")
        .pop();



      const fileName =
        `${Date.now()}.${extension}`;




      // STORAGE UPLOAD

      const {
        error:uploadError
      } = await supabase.storage

      .from("course-videos")

      .upload(
        fileName,
        video
      );



      if(uploadError)
        throw uploadError;




      // GET URL

      const {
        data
      } =
      supabase.storage

      .from("course-videos")

      .getPublicUrl(
        fileName
      );



      const videoUrl =
        data.publicUrl;




      // INSERT RESOURCE


      const {
        error
      } = await supabase

      .from("resources")

      .insert([

        {

          title,

          description,

          resource_type:"video",

          file_url:videoUrl

        }

      ]);



      if(error)
        throw error;




      setTitle("");

      setDescription("");

      setVideo(null);



      await fetchResources();



      alert(
        "Video uploaded successfully"
      );



    }catch(error){


      console.error(
        "UPLOAD ERROR",
        error
      );


      alert(
        error.message
      );


    }finally{


      setUploading(false);


    }


  };






  // ============================
  // DELETE VIDEO
  // ============================


  const deleteVideo = async(resource)=>{


    const confirmDelete =
      window.confirm(
        "Delete this video?"
      );


    if(!confirmDelete)
      return;



    try{


      await supabase

      .from("resources")

      .delete()

      .eq(
        "id",
        resource.id
      );



      fetchResources();



    }catch(error){


      console.error(
        error
      );


    }


  };







  return (

    <div
      className="
        min-h-screen
        bg-[#020617]
        p-8
        text-white
      "
    >


      <div
        className="
          mx-auto
          max-w-7xl
          space-y-10
        "
      >


        <div>

          <h1
            className="
              text-4xl
              font-black
            "
          >

            Video Resources

          </h1>


          <p
            className="
              mt-2
              text-slate-400
            "
          >

            Upload and manage learning videos.

          </p>


        </div>





        {/* UPLOAD FORM */}


        <form

          onSubmit={uploadVideo}

          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            p-8
            space-y-6
          "

        >


          <div>

            <label
              className="
                mb-2
                block
                font-semibold
              "
            >

              Video Title

            </label>


            <input

              value={title}

              onChange={
                e=>setTitle(e.target.value)
              }

              placeholder="Example: Newton Laws Lesson"

              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                px-4
                py-3
                outline-none
              "

            />

          </div>






          <div>

            <label
              className="
                mb-2
                block
                font-semibold
              "
            >

              Description

            </label>


            <textarea

              value={description}

              onChange={
                e=>setDescription(e.target.value)
              }

              placeholder="Video description"

              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                p-4
                outline-none
              "

            />


          </div>







          <label

            className="
              flex
              cursor-pointer
              flex-col
              items-center
              justify-center
              rounded-2xl
              border-2
              border-dashed
              border-slate-700
              p-10
            "

          >


            <Upload
              size={40}
              className="text-blue-400"
            />


            <p className="mt-3">

              Select Video

            </p>



            <input

              hidden

              type="file"

              accept="video/*"

              onChange={
                e=>setVideo(
                  e.target.files[0]
                )
              }

            />


          </label>






          <button

            disabled={uploading}

            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              py-3
              font-bold
            "

          >

            {
              uploading ?

              <Loader2
                className="animate-spin"
              />

              :

              <Upload size={18}/>
            }


            Upload Video


          </button>



        </form>








        {/* VIDEO LIST */}



        <div>


          <h2
            className="
              mb-6
              text-2xl
              font-bold
            "
          >

            Uploaded Videos

          </h2>




          {
            loading ?

            (

              <Loader2
                className="animate-spin"
              />

            )

            :

            (

              <div
                className="
                  grid
                  gap-6
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >


              {
                resources.map(
                  (resource)=>(


                    <div

                      key={resource.id}

                      className="
                        rounded-3xl
                        border
                        border-slate-800
                        bg-slate-900
                        p-6
                      "

                    >



                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <PlayCircle
                          className="
                            text-purple-400
                          "
                        />


                        <h3
                          className="
                            font-bold
                          "
                        >

                          {resource.title}

                        </h3>


                      </div>




                      <p
                        className="
                          mt-3
                          text-sm
                          text-slate-400
                        "
                      >

                        {resource.description}

                      </p>




                      <div
                        className="
                          mt-5
                          flex
                          gap-3
                        "
                      >


                        <a

                          href={
                            resource.file_url
                          }

                          target="_blank"

                          rel="noreferrer"

                          className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-4
                            py-2
                          "

                        >

                          <ExternalLink size={16}/>

                          Watch

                        </a>





                        <button

                          onClick={()=>
                            deleteVideo(resource)
                          }

                          className="
                            rounded-xl
                            bg-red-500/20
                            px-4
                            text-red-400
                          "

                        >

                          <Trash2 size={18}/>

                        </button>


                      </div>



                    </div>


                  )
                )
              }


              </div>

            )
          }



        </div>


      </div>


    </div>

  );

};


export default ResourcesAdmin;