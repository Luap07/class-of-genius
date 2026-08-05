import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Plus,
  Search,
  Loader2,
  Headphones,
  PlayCircle,
  Star,
  Music4,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


export default function LanguageListening({
  language,
  refresh,
}) {


  const [loading,setLoading] =
    useState(true);


  const [saving,setSaving] =
    useState(false);


  const [uploading,setUploading] =
    useState(false);



  const [lessons,setLessons] =
    useState([]);



  const [search,setSearch] =
    useState("");



  const [showModal,setShowModal] =
    useState(false);



  const [editingLesson,setEditingLesson] =
    useState(null);



  const [title,setTitle] =
    useState("");

  const [level,setLevel] =
    useState("Beginner");


  const [category,setCategory] =
    useState("");


  const [duration,setDuration] =
    useState("");


  const [description,setDescription] =
    useState("");


  const [transcript,setTranscript] =
    useState("");


  const [translation,setTranslation] =
    useState("");


  const [vocabulary,setVocabulary] =
    useState("");


  const [grammarNotes,setGrammarNotes] =
    useState("");



  const [audioUrl,setAudioUrl] =
    useState("");


  const [videoUrl,setVideoUrl] =
    useState("");


  const [thumbnailUrl,setThumbnailUrl] =
    useState("");



  const [audioFile,setAudioFile] =
    useState(null);


  const [videoFile,setVideoFile] =
    useState(null);


  const [thumbnailFile,setThumbnailFile] =
    useState(null);



  const [featured,setFeatured] =
    useState(false);


  const [sortOrder,setSortOrder] =
    useState(0);



  const fetchListening =
    useCallback(async()=>{


      if(!language?.id)
        return;


      try{


        setLoading(true);



        const {
          data,
          error
        } =
        await supabase
        .from("language_listening")
        .select("*")
        .eq(
          "language_id",
          language.id
        )
        .order(
          "sort_order",
          {
            ascending:true
          }
        );



        if(error)
          throw error;



        setLessons(data || []);



      }catch(error){

        console.error(
          "Listening Fetch Error:",
          error
        );


      }finally{

        setLoading(false);

      }


    },[
      language
    ]);




  useEffect(()=>{

    fetchListening();

  },[
    fetchListening
  ]);



  useEffect(()=>{


    if(editingLesson){


      setTitle(
        editingLesson.title || ""
      );


      setLevel(
        editingLesson.level || "Beginner"
      );


      setCategory(
        editingLesson.category || ""
      );


      setDuration(
        editingLesson.duration || ""
      );


      setDescription(
        editingLesson.description || ""
      );


      setTranscript(
        editingLesson.transcript || ""
      );


      setTranslation(
        editingLesson.translation || ""
      );


      setVocabulary(
        editingLesson.vocabulary || ""
      );


      setGrammarNotes(
        editingLesson.grammar_notes || ""
      );


      setAudioUrl(
        editingLesson.audio_url || ""
      );


      setVideoUrl(
        editingLesson.video_url || ""
      );


      setThumbnailUrl(
        editingLesson.thumbnail_url || ""
      );


      setFeatured(
        editingLesson.featured || false
      );


      setSortOrder(
        editingLesson.sort_order || 0
      );


    }else{


      setTitle("");
      setLevel("Beginner");
      setCategory("");
      setDuration("");
      setDescription("");
      setTranscript("");
      setTranslation("");
      setVocabulary("");
      setGrammarNotes("");

      setAudioUrl("");
      setVideoUrl("");
      setThumbnailUrl("");

      setAudioFile(null);
      setVideoFile(null);
      setThumbnailFile(null);

      setFeatured(false);
      setSortOrder(0);

    }


  },[
    editingLesson,
    showModal
  ]);
  const uploadMedia = async (
    file,
    folder
  ) => {

    if(!file)
      return null;


    try{


      setUploading(true);



      const fileExt =
        file.name.split(".").pop();



      const fileName =
        `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}
        .${fileExt}`;



      const filePath =
        `${folder}/${fileName}`;



     const {
  error: uploadError
} = await supabase
  .storage
  .from("language-media")
  .upload(
    filePath,
    file
  );


if (uploadError) {
  throw uploadError;
}
// get public url

const {
  data: publicUrlData
} =
  supabase
    .storage
    .from("language-media")
    .getPublicUrl(
      filePath
    );


return publicUrlData.publicUrl;



      if(uploadError)
        throw uploadError;



      const {
        data
      } =
      supabase
      .storage
      .from("language-media")
      .getPublicUrl(
        filePath
      );



      return data.publicUrl;



    }catch(error){


      console.error(
        "Media Upload Error:",
        error
      );


      return null;



    }finally{


      setUploading(false);


    }


  };





  const filteredLessons =
    useMemo(()=>{


      const keyword =
        search.toLowerCase();



      return lessons.filter(
        (item)=>{


          return (

            item.title
            ?.toLowerCase()
            .includes(keyword)


            ||


            item.category
            ?.toLowerCase()
            .includes(keyword)


            ||


            item.level
            ?.toLowerCase()
            .includes(keyword)


          );


        }
      );



    },[
      lessons,
      search
    ]);






  const stats =
    useMemo(()=>{


      return {


        total:
        lessons.length,



        featured:
        lessons.filter(
          item=>item.featured
        ).length,



        beginner:
        lessons.filter(
          item=>
          item.level==="Beginner"
        ).length,



        audio:
        lessons.filter(
          item=>
          item.audio_url
        ).length,



      };



    },[
      lessons
    ]);







  const resetForm = ()=>{


    setTitle("");

    setLevel(
      "Beginner"
    );

    setCategory("");

    setDuration("");

    setDescription("");

    setTranscript("");

    setTranslation("");

    setVocabulary("");

    setGrammarNotes("");


    setAudioUrl("");

    setVideoUrl("");

    setThumbnailUrl("");


    setAudioFile(null);

    setVideoFile(null);

    setThumbnailFile(null);


    setFeatured(false);

    setSortOrder(0);


  };






  if(loading){


    return (

      <div
        className="
        flex
        min-h-[500px]
        items-center
        justify-center
        "
      >

        <Loader2
          className="
          h-12
          w-12
          animate-spin
          text-cyan-400
          "
        />


      </div>

    );

  }
  return (

    <div
      className="
      space-y-8
      "
    >


      {/* HEADER */}

      <motion.div

        initial={{
          opacity:0,
          y:20
        }}

        animate={{
          opacity:1,
          y:0
        }}

        className="
        rounded-[35px]
        border
        border-cyan-500/20
        bg-gradient-to-br
        from-cyan-500/10
        via-blue-500/5
        to-transparent
        p-8
        "

      >


        <div
          className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
          "
        >


          <div>


            <div
              className="
              mb-4
              flex
              items-center
              gap-3
              "
            >

              <Headphones
                className="
                text-cyan-400
                "
              />


              <span
                className="
                rounded-full
                bg-cyan-500/10
                px-4
                py-2
                text-xs
                font-black
                uppercase
                tracking-widest
                text-cyan-300
                "
              >

                Listening Manager

              </span>


            </div>



            <h1
              className="
              text-4xl
              font-black
              text-white
              "
            >

              {language?.name}
              {" "}
              Listening

            </h1>


            <p
              className="
              mt-3
              max-w-3xl
              text-slate-400
              "
            >

              Manage audio lessons,
              video lessons,
              transcripts,
              translations and
              pronunciation practice.

            </p>


          </div>



          <button

            onClick={()=>{

              setEditingLesson(null);

              setShowModal(true);

            }}

            className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-cyan-500
            px-7
            py-4
            font-black
            text-black
            hover:bg-cyan-400
            "

          >

            <Plus size={20}/>

            New Lesson

          </button>



        </div>


      </motion.div>





      {/* STATS */}


      <div
        className="
        grid
        gap-6
        sm:grid-cols-2
        xl:grid-cols-4
        "
      >


        {[
          {
            label:"Total Lessons",
            value:stats.total,
            icon:Headphones,
            color:"cyan"
          },

          {
            label:"Featured",
            value:stats.featured,
            icon:Star,
            color:"yellow"
          },

          {
            label:"Beginner",
            value:stats.beginner,
            icon:PlayCircle,
            color:"emerald"
          },

          {
            label:"Audio Files",
            value:stats.audio,
            icon:Music4,
            color:"purple"
          }

        ].map((item,index)=>{


          const Icon =
          item.icon;


          return (

            <motion.div

              key={index}

              initial={{
                opacity:0,
                y:20
              }}

              animate={{
                opacity:1,
                y:0
              }}

              transition={{
                delay:index*0.05
              }}

              className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-6
              "

            >

              <div
                className="
                flex
                items-center
                justify-between
                "
              >

                <div>

                  <p
                    className="
                    text-sm
                    text-slate-400
                    "
                  >

                    {item.label}

                  </p>


                  <h3
                    className="
                    mt-2
                    text-4xl
                    font-black
                    text-white
                    "
                  >

                    {item.value}

                  </h3>


                </div>


                <Icon
                  size={40}
                  className="
                  text-cyan-400
                  "
                />


              </div>


            </motion.div>

          );


        })}


      </div>





      {/* SEARCH */}


      <div
        className="
        flex
        flex-col
        gap-4
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        p-6
        md:flex-row
        "
      >


        <div
          className="
          relative
          flex-1
          "
        >

          <Search
            className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-slate-500
            "
          />


          <input

            value={search}

            onChange={(e)=>
              setSearch(
                e.target.value
              )
            }

            placeholder="
            Search listening lessons...
            "

            className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-black/20
            py-4
            pl-14
            pr-5
            text-white
            outline-none
            focus:border-cyan-500
            "

          />


        </div>



        <button

          onClick={fetchListening}

          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          border
          border-white/10
          bg-white/5
          px-6
          font-bold
          text-white
          "

        >

          <RefreshCw size={18}/>

          Refresh

        </button>


      </div>
      {/* LESSON GRID */}

      {
        filteredLessons.length === 0 ? (

          <div
            className="
            rounded-3xl
            border
            border-dashed
            border-white/10
            bg-white/[0.03]
            py-24
            text-center
            "
          >

            <Headphones
              className="
              mx-auto
              mb-5
              h-16
              w-16
              text-slate-600
              "
            />


            <h3
              className="
              text-2xl
              font-black
              text-white
              "
            >

              No Listening Lessons

            </h3>


            <p
              className="
              mt-3
              text-slate-400
              "
            >

              Create your first listening lesson.

            </p>


          </div>


        ) : (


          <div
            className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
            "
          >


            {
              filteredLessons.map(
                (lesson,index)=>(


                <motion.div

                  key={lesson.id}

                  initial={{
                    opacity:0,
                    y:20
                  }}

                  animate={{
                    opacity:1,
                    y:0
                  }}

                  transition={{
                    delay:index*0.05
                  }}

                  className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  "

                >


                  {
                    lesson.thumbnail_url && (

                      <img

                        src={
                          lesson.thumbnail_url
                        }

                        alt={
                          lesson.title
                        }

                        className="
                        h-52
                        w-full
                        object-cover
                        "

                      />

                    )
                  }



                  <div
                    className="
                    p-6
                    "
                  >


                    <div
                      className="
                      flex
                      justify-between
                      "
                    >


                      <div>

                        <h3
                          className="
                          text-2xl
                          font-black
                          text-white
                          "
                        >

                          {
                            lesson.title
                          }

                        </h3>


                        <p
                          className="
                          mt-2
                          text-cyan-300
                          "
                        >

                          {
                            lesson.category ||
                            "Listening"
                          }

                        </p>


                      </div>



                      {
                        lesson.featured && (

                          <span
                            className="
                            rounded-full
                            bg-yellow-500/20
                            px-3
                            py-1
                            text-xs
                            font-bold
                            text-yellow-300
                            "
                          >

                            Featured

                          </span>

                        )
                      }


                    </div>





                    <div
                      className="
                      mt-5
                      flex
                      flex-wrap
                      gap-2
                      "
                    >


                      <span
                        className="
                        rounded-full
                        bg-cyan-500/10
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-cyan-300
                        "
                      >

                        {lesson.level}

                      </span>



                      {
                        lesson.audio_url && (

                          <span
                            className="
                            rounded-full
                            bg-emerald-500/10
                            px-3
                            py-1
                            text-xs
                            font-bold
                            text-emerald-300
                            "
                          >

                            Audio

                          </span>

                        )
                      }




                      {
                        lesson.video_url && (

                          <span
                            className="
                            rounded-full
                            bg-rose-500/10
                            px-3
                            py-1
                            text-xs
                            font-bold
                            text-rose-300
                            "
                          >

                            Video

                          </span>

                        )
                      }


                    </div>





                    <p
                      className="
                      mt-5
                      line-clamp-3
                      text-sm
                      leading-7
                      text-slate-400
                      "
                    >

                      {
                        lesson.description ||
                        "No description"
                      }

                    </p>




                    <button

                      onClick={()=>{

                        setEditingLesson(
                          lesson
                        );

                        setShowModal(
                          true
                        );

                      }}

                      className="
                      mt-6
                      w-full
                      rounded-xl
                      bg-cyan-500
                      py-3
                      font-black
                      text-black
                      hover:bg-cyan-400
                      "

                    >

                      Edit Lesson

                    </button>


                  </div>


                </motion.div>


              ))
            }


          </div>


        )
      }






      {/* MODAL */}

      {
        showModal && (

        <div
          className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/70
          p-6
          backdrop-blur-sm
          "
        >


          <div
            className="
            max-h-[90vh]
            w-full
            max-w-5xl
            overflow-y-auto
            rounded-[35px]
            border
            border-white/10
            bg-[#08111f]
            p-8
            "
          >


            <div
              className="
              mb-8
              flex
              justify-between
              "
            >

              <h2
                className="
                text-3xl
                font-black
                text-white
                "
              >

                {
                  editingLesson
                  ?
                  "Edit Listening Lesson"
                  :
                  "Create Listening Lesson"
                }

              </h2>


              <button

                onClick={()=>{

                  setShowModal(false);

                  setEditingLesson(null);

                }}

                className="
                rounded-xl
                bg-white/10
                px-5
                py-2
                text-white
                "

              >

                Close

              </button>


            </div>
            <div className="grid gap-6 md:grid-cols-2">


              <input
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                placeholder="Lesson Title"
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                text-white
                "
              />



              <input
                value={category}
                onChange={(e)=>setCategory(e.target.value)}
                placeholder="Category"
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                text-white
                "
              />



              <select
                value={level}
                onChange={(e)=>setLevel(e.target.value)}
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                text-white
                "
              >

                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>

              </select>



              <input
                value={duration}
                onChange={(e)=>setDuration(e.target.value)}
                placeholder="Duration"
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                text-white
                "
              />


            </div>



            <textarea
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              placeholder="Description..."
              className="
              mt-6
              h-32
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-4
              text-white
              "
            />



            <textarea
              value={transcript}
              onChange={(e)=>setTranscript(e.target.value)}
              placeholder="Transcript..."
              className="
              mt-6
              h-40
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-4
              text-white
              "
            />



            <textarea
              value={translation}
              onChange={(e)=>setTranslation(e.target.value)}
              placeholder="Translation..."
              className="
              mt-6
              h-32
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-4
              text-white
              "
            />



            <textarea
              value={vocabulary}
              onChange={(e)=>setVocabulary(e.target.value)}
              placeholder="Vocabulary..."
              className="
              mt-6
              h-32
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-4
              text-white
              "
            />



            <textarea
              value={grammarNotes}
              onChange={(e)=>setGrammarNotes(e.target.value)}
              placeholder="Grammar Notes..."
              className="
              mt-6
              h-32
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-4
              text-white
              "
            />



            {/* AUDIO */}

            <div className="mt-8 space-y-4">


              <h3 className="font-black text-white">
                Audio (Upload File or Paste Link)
              </h3>


              <input
                value={audioUrl}
                onChange={(e)=>setAudioUrl(e.target.value)}
                placeholder="Paste Audio URL..."
                className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                text-white
                "
              />


              <input
                type="file"
                accept="audio/*"
                onChange={(e)=>
                  setAudioFile(
                    e.target.files[0]
                  )
                }
                className="
                w-full
                rounded-xl
                border
                border-white/10
                p-3
                text-white
                "
              />


            </div>





            {/* VIDEO */}

            <div className="mt-8 space-y-4">


              <h3 className="font-black text-white">
                Video (Upload File or Link)
              </h3>



              <input
                value={videoUrl}
                onChange={(e)=>setVideoUrl(e.target.value)}
                placeholder="Paste YouTube / Video URL..."
                className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                text-white
                "
              />



              <input
                type="file"
                accept="video/*"
                onChange={(e)=>
                  setVideoFile(
                    e.target.files[0]
                  )
                }
                className="
                w-full
                rounded-xl
                border
                border-white/10
                p-3
                text-white
                "
              />


            </div>






            {/* THUMBNAIL */}

            <div className="mt-8 space-y-4">


              <h3 className="font-black text-white">
                Thumbnail
              </h3>


              <input
                value={thumbnailUrl}
                onChange={(e)=>setThumbnailUrl(e.target.value)}
                placeholder="Paste Thumbnail URL..."
                className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                text-white
                "
              />


              <input
                type="file"
                accept="image/*"
                onChange={(e)=>
                  setThumbnailFile(
                    e.target.files[0]
                  )
                }
                className="
                w-full
                rounded-xl
                border
                border-white/10
                p-3
                text-white
                "
              />

            </div>






            <label className="
              mt-8
              flex
              items-center
              gap-3
              text-white
            ">

              <input
                type="checkbox"
                checked={featured}
                onChange={(e)=>
                  setFeatured(
                    e.target.checked
                  )
                }
              />

              Featured Lesson

            </label>





            <button

              disabled={saving || uploading}

              onClick={async()=>{


                try{


                  setSaving(true);



                  let finalAudio =
                  audioUrl;


                  let finalVideo =
                  videoUrl;


                  let finalThumbnail =
                  thumbnailUrl;



                  if(audioFile){

                    finalAudio =
                    await uploadMedia(
                      audioFile,
                      "audio"
                    );

                  }
                  if(videoFile){

                    finalVideo =
                    await uploadMedia(
                      videoFile,
                      "video"
                    );

                  }



                  if(thumbnailFile){

                    finalThumbnail =
                    await uploadMedia(
                      thumbnailFile,
                      "thumbnails"
                    );

                  }
                  const payload = {language_id:
      language.id,title,level,category,duration,
                    description,

                    transcript,

                    translation,

                    vocabulary,

                    grammar_notes:
                    grammarNotes,
                    audio_url:
                    finalAudio,
                    video_url:
                    finalVideo,
                    thumbnail_url:
                    finalThumbnail,
                    featured,

                    sort_order:
                    sortOrder,
                   updated_at:
                    new Date()
                    .toISOString()
                  };
                  let error;
                  if(editingLesson){
                    ({
                      error
                    } =
                    await supabase
                    .from(
                      "language_listening"
                    )
                    .update(payload)
                    .eq(
                      "id",
                      editingLesson.id
                    ));


                  }else{


                    ({
                      error
                    } =
                    await supabase
                    .from(
                      "language_listening"
                    )
                    .insert(payload));
                  }
                  if(error)
                    throw error;
                  await fetchListening();
                  if(refresh)
                    await refresh();
                  setShowModal(false);

                  setEditingLesson(null);

                  resetForm();
                }catch(error){

                  console.error(
                    "Save Error:",
                    error
                  );

                  alert(
                    "Failed to save lesson"
                  );

                }finally{
                  setSaving(false);
                }
              }}
              className="
              mt-10
              w-full
              rounded-2xl
              bg-cyan-500
              py-4
              font-black
              text-black
              "
            >
              {
                uploading
                ?
                "Uploading Media..."
                :
                saving
                ?
                "Saving..."
                :
                "Save Listening Lesson"
              }
            </button>
          </div>
        </div>

        )
      }
    </div>
  );
}
