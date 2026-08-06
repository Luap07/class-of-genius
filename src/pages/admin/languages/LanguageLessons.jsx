import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Loader2,
  Search,
  Plus,
  BookOpen,
  Star,
  Video,
  Headphones,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


export default function LanguageLessons({
  language,
  refresh,
}) {


  const [loading, setLoading] = useState(true);


  const [lessons, setLessons] = useState([]);


  const [search, setSearch] = useState("");


  const [showModal, setShowModal] = useState(false);


  const [editingLesson, setEditingLesson] = useState(null);




  const fetchLessons = useCallback(async()=>{


    if(!language?.id) return;



    try{


      setLoading(true);



      const {data,error}=await supabase

        .from("language_lessons")

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



      if(error) throw error;



      setLessons(data || []);



    }catch(error){


      console.error(
        "Lessons Fetch Error:",
        error
      );



    }finally{


      setLoading(false);


    }


  },[language]);





  useEffect(()=>{


    fetchLessons();


  },[fetchLessons]);







  const filteredLessons = useMemo(()=>{


    const keyword =
      search.toLowerCase();




    return lessons.filter((lesson)=>{


      return (

        lesson.title
          ?.toLowerCase()
          .includes(keyword)


        ||


        lesson.module
          ?.toLowerCase()
          .includes(keyword)



        ||


        lesson.level
          ?.toLowerCase()
          .includes(keyword)



        ||


        lesson.description
          ?.toLowerCase()
          .includes(keyword)


      );


    });



  },[
    lessons,
    search
  ]);







  const stats = useMemo(()=>{


    return {


      total:
        lessons.length,



      featured:
        lessons.filter(
          item=>item.featured
        ).length,



      videos:
        lessons.filter(
          item=>item.video_url
        ).length,



      audio:
        lessons.filter(
          item=>item.audio_url
        ).length,


    };



  },[
    lessons
  ]);







  if(loading){


    return (

      <div className="flex min-h-[600px] items-center justify-center">

        <Loader2
          className="h-12 w-12 animate-spin text-indigo-400"
        />

      </div>

    );


  }






  return (

    <div className="space-y-8">





      <motion.div

        initial={{
          opacity:0,
          y:25
        }}

        animate={{
          opacity:1,
          y:0
        }}

        className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10 p-8"

      >



        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">



          <div>


            <div className="mb-4 flex items-center gap-3">


              <BookOpen
                className="h-6 w-6 text-indigo-400"
              />



              <span className="rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">

                Lessons Manager

              </span>


            </div>




            <h2 className="text-4xl font-black text-white">

              {language?.name} Lessons

            </h2>




            <p className="mt-3 max-w-3xl text-slate-400">

              Create structured language lessons
              with objectives, content, exercises,
              audio and video resources.

            </p>


          </div>






          <button

            onClick={()=>{

              setEditingLesson(null);

              setShowModal(true);

            }}

            className="flex items-center gap-3 rounded-2xl bg-indigo-500 px-6 py-4 font-bold text-black transition hover:bg-indigo-400"

          >


            <Plus size={20}/>


            New Lesson


          </button>




        </div>



      </motion.div>
            {/* Statistics Cards */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">


        <motion.div
          initial={{
            opacity:0,
            y:15
          }}
          animate={{
            opacity:1,
            y:0
          }}
          className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6"
        >

          <div className="flex items-center justify-between">


            <div>

              <p className="text-sm text-slate-400">
                Total Lessons
              </p>


              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.total}
              </h3>


            </div>



            <BookOpen
              className="h-10 w-10 text-indigo-400"
            />


          </div>


        </motion.div>






        <motion.div
          initial={{
            opacity:0,
            y:15
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            delay:0.05
          }}
          className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6"
        >

          <div className="flex items-center justify-between">


            <div>

              <p className="text-sm text-slate-400">
                Featured
              </p>


              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.featured}
              </h3>


            </div>



            <Star
              className="h-10 w-10 text-yellow-400"
            />


          </div>


        </motion.div>






        <motion.div
          initial={{
            opacity:0,
            y:15
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            delay:0.1
          }}
          className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6"
        >

          <div className="flex items-center justify-between">


            <div>

              <p className="text-sm text-slate-400">
                Video Lessons
              </p>


              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.videos}
              </h3>


            </div>



            <Video
              className="h-10 w-10 text-red-400"
            />


          </div>


        </motion.div>








        <motion.div
          initial={{
            opacity:0,
            y:15
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            delay:0.15
          }}
          className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6"
        >

          <div className="flex items-center justify-between">


            <div>

              <p className="text-sm text-slate-400">
                Audio Lessons hhhh
              </p>


              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.audio}
              </h3>


            </div>



            <Headphones
              className="h-10 w-10 text-cyan-400"
            />


          </div>


        </motion.div>



      </div>







      {/* Search Toolbar */}



      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">


        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


          <div className="relative w-full lg:max-w-xl">


            <Search

              size={20}

              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"

            />



            <input


              value={search}


              onChange={(e)=>setSearch(e.target.value)}


              placeholder="Search lessons..."


              className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-14 pr-5 text-white outline-none transition focus:border-indigo-500"


            />



          </div>






          <div className="flex gap-3">


            <button

              onClick={fetchLessons}

              className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-6 py-3 font-semibold transition hover:bg-indigo-500/20"

            >

              Refresh

            </button>

            <button

              onClick={()=>{

                setEditingLesson(null);

                setShowModal(true);

              }}

              className="rounded-2xl bg-indigo-500 px-6 py-3 font-bold text-black transition hover:bg-indigo-400"

            >

              + New Lesson

            </button>


          </div>

        </div>

      </div>
            {/* Lessons Grid */}


      {filteredLessons.length === 0 ? (


        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-24 text-center">


          <BookOpen

            className="mx-auto mb-6 h-16 w-16 text-slate-600"

          />



          <h3 className="text-2xl font-black text-white">

            No Lessons Found

          </h3>




          <p className="mt-3 text-slate-400">

            Create your first lesson for this language.

          </p>





          <button

            onClick={()=>{

              setEditingLesson(null);

              setShowModal(true);

            }}

            className="mt-8 rounded-2xl bg-indigo-500 px-8 py-4 font-bold text-black hover:bg-indigo-400"

          >

            Create Lesson

          </button>


        </div>



      ) : (



        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">


          {filteredLessons.map((lesson,index)=>(


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
                delay:index * 0.04
              }}


              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:border-indigo-500/40 hover:bg-white/[0.07]"

            >





              {lesson.thumbnail_url && (


                <img

                  src={lesson.thumbnail_url}

                  alt={lesson.title}

                  className="h-52 w-full object-cover"

                />


              )}






              <div className="p-7">



                <div className="flex items-start justify-between gap-4">


                  <div>


                    <h3 className="text-2xl font-black text-white">

                      {lesson.title}

                    </h3>




                    <p className="mt-2 text-indigo-300">

                      {lesson.module || "General Lesson"}

                    </p>


                  </div>






                  {lesson.featured && (


                    <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">

                      Featured

                    </span>


                  )}



                </div>







                <div className="mt-5 flex flex-wrap gap-2">



                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">

                    {lesson.level}

                  </span>






                  {lesson.duration && (

                    <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">

                      {lesson.duration}

                    </span>

                  )}






                  {lesson.video_url && (

                    <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">

                      <Video size={13}/>

                      Video

                    </span>

                  )}






                  {lesson.audio_url && (

                    <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">

                      <Headphones size={13}/>

                      Audio

                    </span>

                  )}



                </div>







                <div className="mt-6 space-y-5">



                  <div>


                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                      Description

                    </p>



                    <p className="line-clamp-3 text-sm leading-7 text-slate-300">

                      {lesson.description ||
                        "No description provided."}

                    </p>


                  </div>







                  {lesson.objectives && (


                    <div>


                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                        Objectives

                      </p>



                      <p className="line-clamp-3 text-sm text-slate-400">

                        {lesson.objectives}

                      </p>


                    </div>


                  )}








                  {lesson.grammar_points && (


                    <div>


                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                        Grammar Points

                      </p>



                      <p className="line-clamp-3 text-sm text-slate-400">

                        {lesson.grammar_points}

                      </p>


                    </div>


                  )}






                  {lesson.vocabulary && (


                    <div>


                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                        Vocabulary

                      </p>



                      <p className="line-clamp-3 text-sm text-slate-400">

                        {lesson.vocabulary}

                      </p>


                    </div>


                  )}





                </div>
                                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">


                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">

                    Order #{lesson.sort_order}

                  </span>





                  <button

                    onClick={()=>{

                      setEditingLesson(lesson);

                      setShowModal(true);

                    }}

                    className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-indigo-400"

                  >

                    Edit

                  </button>



                </div>


              </div>


            </motion.div>


          ))}


        </div>


      )}








      {/* Lesson Modal */}


      {showModal && (



        <LessonModal

          lesson={editingLesson}

          language={language}

          close={()=>{


            setShowModal(false);


            setEditingLesson(null);


          }}


          refresh={fetchLessons}


        />


      )}


    </div>

  );

}








function LessonModal({

  lesson,

  language,

  close,

  refresh,

}) {



  const [saving,setSaving]=useState(false);



  const [title,setTitle]=useState(
    lesson?.title || ""
  );


  const [module,setModule]=useState(
    lesson?.module || ""
  );


  const [level,setLevel]=useState(
    lesson?.level || "Beginner"
  );


  const [description,setDescription]=useState(
    lesson?.description || ""
  );


  const [objectives,setObjectives]=useState(
    lesson?.objectives || ""
  );


  const [content,setContent]=useState(
    lesson?.lesson_content || ""
  );


  const [vocabulary,setVocabulary]=useState(
    lesson?.vocabulary || ""
  );


  const [grammar,setGrammar]=useState(
    lesson?.grammar_points || ""
  );


  const [exercises,setExercises]=useState(
    lesson?.exercises || ""
  );



  const [video,setVideo]=useState(
    lesson?.video_url || ""
  );


  const [audio,setAudio]=useState(
    lesson?.audio_url || ""
  );


  const [thumbnail,setThumbnail]=useState(
    lesson?.thumbnail_url || ""
  );


  const [duration,setDuration]=useState(
    lesson?.duration || ""
  );


  const [featured,setFeatured]=useState(
    lesson?.featured || false
  );


  const [sortOrder,setSortOrder]=useState(
    lesson?.sort_order || 0
  );







  const saveLesson=async()=>{


    try{


      setSaving(true);




      const payload={



        language_id:
          language.id,



        title,



        module,



        level,



        description,



        objectives,



        lesson_content:
          content,



        vocabulary,



        grammar_points:
          grammar,



        exercises,



        video_url:
          video,



        audio_url:
          audio,



        thumbnail_url:
          thumbnail,



        duration,



        featured,



        sort_order:
          sortOrder,



        updated_at:
          new Date()
            .toISOString(),


      };






      let error;






      if(lesson){



        ({error}=await supabase

          .from("language_lessons")

          .update(payload)

          .eq(
            "id",
            lesson.id
          )

        );



      }else{



        ({error}=await supabase

          .from("language_lessons")

          .insert({

            ...payload,

            created_at:
              new Date()
              .toISOString(),

          })

        );


      }





      if(error)
        throw error;





      await refresh();



      close();





    }catch(error){



      console.error(
        "Save Lesson Error:",
        error
      );



      alert(
        "Unable to save lesson."
      );



    }finally{


      setSaving(false);


    }



  };







  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">


      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[#08111f] p-8">


        <div className="mb-8 flex items-center justify-between">


          <h2 className="text-3xl font-black text-white">

            {lesson
              ? "Edit Lesson"
              : "Create Lesson"}

          </h2>



          <button

            onClick={close}

            className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20"

          >

            Close

          </button>
        </div>
                <div className="space-y-6">


          <div className="grid gap-6 md:grid-cols-2">


            <input

              value={title}

              onChange={(e)=>setTitle(e.target.value)}

              placeholder="Lesson Title"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />




            <input

              value={module}

              onChange={(e)=>setModule(e.target.value)}

              placeholder="Module Name"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />





            <select

              value={level}

              onChange={(e)=>setLevel(e.target.value)}

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            >

              <option>
                Beginner
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Advanced
              </option>

            </select>
            <input

              value={duration}

              onChange={(e)=>setDuration(e.target.value)}

              placeholder="Duration"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />
          </div>
         <textarea

            rows={4}

            value={description}

            onChange={(e)=>setDescription(e.target.value)}

            placeholder="Lesson Description"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />
          <textarea

            rows={7}

            value={content}

            onChange={(e)=>setContent(e.target.value)}

            placeholder="Lesson Content"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />
         <textarea

            rows={5}

            value={objectives}

            onChange={(e)=>setObjectives(e.target.value)}

            placeholder="Learning Objectives"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />
          <textarea

            rows={5}

            value={vocabulary}

            onChange={(e)=>setVocabulary(e.target.value)}

            placeholder="Vocabulary"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />
      <textarea
            rows={5}

            value={grammar}

            onChange={(e)=>setGrammar(e.target.value)}

            placeholder="Grammar Points"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />
          <textarea

            rows={5}

            value={exercises}

            onChange={(e)=>setExercises(e.target.value)}

            placeholder="Exercises"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

         />
          <div className="grid gap-6 md:grid-cols-2">
            <input

              value={thumbnail}

              onChange={(e)=>setThumbnail(e.target.value)}

              placeholder="Thumbnail URL"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />
         <input

              value={video}

              onChange={(e)=>setVideo(e.target.value)}

              placeholder="Video URL"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />
          <input

              value={audio}

              onChange={(e)=>setAudio(e.target.value)}

              placeholder="Audio URL"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />
           <input

              type="number"

              value={sortOrder}

              onChange={(e)=>setSortOrder(Number(e.target.value))}

              placeholder="Sort Order"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-white">
            <input

              type="checkbox"

              checked={featured}

              onChange={(e)=>setFeatured(e.target.checked)}

            />
            Featured Lesson
          </label>
          <div className="flex justify-end gap-4 pt-5">

            <button

              onClick={close}

              className="rounded-2xl border border-white/10 px-7 py-3 font-semibold hover:bg-white/10"

            >

              Cancel

            </button>
            <button

              disabled={saving}

              onClick={saveLesson}

              className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-3 font-bold text-black transition hover:bg-indigo-400 disabled:opacity-50"

            >
              {saving ? (

                <Loader2 className="h-5 w-5 animate-spin"/>

              ) : (

                lesson
                ? "Update Lesson"
                : "Create Lesson"

              )}
            </button>
          </div>
        </div>
      </div>
      </div>
  );

}