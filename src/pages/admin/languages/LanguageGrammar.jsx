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
  CheckCircle,
} from "lucide-react";


import { supabase } from "../../../lib/supabaseClient";





export default function LanguageGrammar({

  language,

  refresh,

}) {



  const [loading,setLoading] = useState(true);


  const [grammar,setGrammar] = useState([]);


  const [search,setSearch] = useState("");



  const [showModal,setShowModal] = useState(false);


  const [editingGrammar,setEditingGrammar] = useState(null);








  const fetchGrammar = useCallback(async()=>{


    if(!language?.id)
      return;




    try{


      setLoading(true);




      const {
        data,
        error

      } = await supabase


        .from("language_grammar")


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




      setGrammar(data || []);




    }catch(error){



      console.error(
        "Grammar Fetch Error:",
        error
      );



    }finally{


      setLoading(false);


    }



  },[language]);







  useEffect(()=>{


    fetchGrammar();


  },[
    fetchGrammar
  ]);








  const filteredGrammar = useMemo(()=>{


    const keyword =
      search.toLowerCase();




    return grammar.filter((item)=>{


      return (


        item.title
          ?.toLowerCase()
          .includes(keyword)



        ||



        item.topic
          ?.toLowerCase()
          .includes(keyword)




        ||



        item.level
          ?.toLowerCase()
          .includes(keyword)




      );


    });



  },[
    grammar,
    search
  ]);








  const stats = useMemo(()=>{


    return {


      total:
        grammar.length,



      featured:
        grammar.filter(
          item=>item.featured
        ).length,



      rules:
        grammar.filter(
          item=>item.rules
        ).length,



      exercises:
        grammar.filter(
          item=>item.exercises
        ).length,


    };


  },[
    grammar
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
          y:20
        }}

        animate={{
          opacity:1,
          y:0
        }}

        className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 p-8"

      >



        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


          <div>


            <div className="mb-4 flex items-center gap-3">


              <BookOpen
                className="h-7 w-7 text-indigo-400"
              />



              <span className="rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">

                Grammar CMS

              </span>


            </div>




            <h1 className="text-4xl font-black text-white">

              {language?.name} Grammar

            </h1>




            <p className="mt-3 max-w-3xl text-slate-400">

              Manage grammar rules,
              explanations,
              examples and practice activities.

            </p>


          </div>






          <button

            onClick={()=>{

              setEditingGrammar(null);

              setShowModal(true);

            }}

            className="flex items-center gap-3 rounded-2xl bg-indigo-500 px-7 py-4 font-bold text-black transition hover:bg-indigo-400"

          >

            <Plus size={20}/>

            New Grammar Topic


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
                Total Topics
              </p>


              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.total}
              </h3>


            </div>



            <BookOpen className="h-10 w-10 text-indigo-400"/>


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



            <Star className="h-10 w-10 text-yellow-400"/>


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

          className="rounded-3xl border border-green-500/20 bg-green-500/10 p-6"

        >


          <div className="flex items-center justify-between">


            <div>

              <p className="text-sm text-slate-400">
                Rules Added
              </p>


              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.rules}
              </h3>


            </div>



            <CheckCircle className="h-10 w-10 text-green-400"/>


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
                Exercises
              </p>


              <h3 className="mt-2 text-4xl font-black text-white">
                {stats.exercises}
              </h3>


            </div>



            <BookOpen className="h-10 w-10 text-cyan-400"/>


          </div>


        </motion.div>



      </div>







      {/* Search Section */}



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


              placeholder="Search grammar topics..."


              className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-14 pr-5 text-white outline-none focus:border-indigo-500"


            />


          </div>






          <button

            onClick={fetchGrammar}

            className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-7 py-3 font-bold text-indigo-300 hover:bg-indigo-500/20"

          >

            Refresh

          </button>
        </div>
      </div>

            {/* Grammar Topics Grid */}


      {filteredGrammar.length === 0 ? (


        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-24 text-center">


          <BookOpen

            className="mx-auto mb-6 h-16 w-16 text-slate-600"

          />



          <h3 className="text-2xl font-black text-white">

            No Grammar Topics

          </h3>




          <p className="mt-3 text-slate-400">

            Add your first grammar topic.

          </p>





          <button

            onClick={()=>{

              setEditingGrammar(null);

              setShowModal(true);

            }}

            className="mt-8 rounded-2xl bg-indigo-500 px-8 py-4 font-bold text-black hover:bg-indigo-400"

          >

            Create Grammar Topic

          </button>


        </div>



      ) : (



        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">


          {filteredGrammar.map((item,index)=>(



            <motion.div


              key={item.id}



              initial={{
                opacity:0,
                y:20
              }}



              animate={{
                opacity:1,
                y:0
              }}



              transition={{
                delay:index * 0.05
              }}



              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-indigo-500/40 hover:bg-white/[0.07]"

            >





              <div className="flex items-start justify-between gap-4">


                <div>


                  <h3 className="text-2xl font-black text-white">

                    {item.title}

                  </h3>




                  <p className="mt-2 text-indigo-300">

                    {item.topic || "Grammar"}

                  </p>


                </div>





                {item.featured && (


                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">

                    Featured

                  </span>


                )}



              </div>








              <div className="mt-5 flex flex-wrap gap-2">


                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">

                  {item.level || "Beginner"}

                </span>





                {item.sort_order !== undefined && (

                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-400">

                    Order {item.sort_order}

                  </span>

                )}



              </div>








              <div className="mt-6 space-y-5">



                {item.explanation && (


                  <div>


                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                      Explanation

                    </p>



                    <p className="line-clamp-4 text-sm leading-7 text-slate-300">

                      {item.explanation}

                    </p>


                  </div>


                )}







                {item.rules && (


                  <div>


                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                      Rules

                    </p>



                    <p className="line-clamp-4 text-sm text-slate-400">

                      {item.rules}

                    </p>


                  </div>


                )}








                {item.examples && (


                  <div>


                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                      Examples

                    </p>



                    <p className="line-clamp-4 text-sm text-slate-400">

                      {item.examples}

                    </p>


                  </div>


                )}






                {item.exercises && (


                  <div>


                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">

                      Exercises

                    </p>



                    <p className="line-clamp-3 text-sm text-slate-400">

                      {item.exercises}

                    </p>
                  </div>

                )}

              </div>
                            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">


                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">

                  Grammar Topic

                </span>





                <button

                  onClick={()=>{

                    setEditingGrammar(item);

                    setShowModal(true);

                  }}

                  className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-bold text-black transition hover:bg-indigo-400"

                >

                  Edit

                </button>


              </div>


            </motion.div>


          ))}


        </div>


      )}








      {/* Grammar Modal */}


      {showModal && (


        <GrammarModal

          grammar={editingGrammar}

          language={language}

          close={()=>{


            setShowModal(false);


            setEditingGrammar(null);


          }}


          refresh={fetchGrammar}


        />


      )}


    </div>

  );

}








function GrammarModal({

  grammar,

  language,

  close,

  refresh,

}) {



  const [saving,setSaving] = useState(false);




  const [title,setTitle] = useState(
    grammar?.title || ""
  );



  const [topic,setTopic] = useState(
    grammar?.topic || ""
  );



  const [level,setLevel] = useState(
    grammar?.level || "Beginner"
  );



  const [explanation,setExplanation] = useState(
    grammar?.explanation || ""
  );



  const [rules,setRules] = useState(
    grammar?.rules || ""
  );



  const [examples,setExamples] = useState(
    grammar?.examples || ""
  );



  const [exercises,setExercises] = useState(
    grammar?.exercises || ""
  );



  const [notes,setNotes] = useState(
    grammar?.notes || ""
  );



  const [featured,setFeatured] = useState(
    grammar?.featured || false
  );



  const [sortOrder,setSortOrder] = useState(
    grammar?.sort_order || 0
  );








  const saveGrammar = async()=>{


    try{


      setSaving(true);




      const payload={



        language_id:
          language.id,



        title,



        topic,



        level,



        explanation,



        rules,



        examples,



        exercises,



        notes,



        featured,



        sort_order:
          sortOrder,



        updated_at:
          new Date()
          .toISOString(),



      };







      let error;






      if(grammar){



        ({error}=await supabase

          .from("language_grammar")

          .update(payload)

          .eq(
            "id",
            grammar.id
          )

        );



      }else{



        ({error}=await supabase

          .from("language_grammar")

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
        "Grammar Save Error:",
        error
      );



      alert(
        "Failed to save grammar topic."
      );



    }finally{


      setSaving(false);


    }



  };








  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">


      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#08111f] p-8">


        <div className="mb-8 flex items-center justify-between">


          <h2 className="text-3xl font-black text-white">

            {grammar
              ? "Edit Grammar Topic"
              : "Create Grammar Topic"}

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

              placeholder="Grammar Title"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />





            <input

              value={topic}

              onChange={(e)=>setTopic(e.target.value)}

              placeholder="Topic Category"

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

              type="number"

              value={sortOrder}

              onChange={(e)=>setSortOrder(Number(e.target.value))}

              placeholder="Sort Order"

              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

            />


          </div>







          <textarea

            rows={5}

            value={explanation}

            onChange={(e)=>setExplanation(e.target.value)}

            placeholder="Grammar Explanation"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />








          <textarea

            rows={6}

            value={rules}

            onChange={(e)=>setRules(e.target.value)}

            placeholder="Grammar Rules"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />








          <textarea

            rows={6}

            value={examples}

            onChange={(e)=>setExamples(e.target.value)}

            placeholder="Examples"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />








          <textarea

            rows={6}

            value={exercises}

            onChange={(e)=>setExercises(e.target.value)}

            placeholder="Exercises"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />








          <textarea

            rows={4}

            value={notes}

            onChange={(e)=>setNotes(e.target.value)}

            placeholder="Extra Notes"

            className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none focus:border-indigo-500"

          />








          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-white">


            <input

              type="checkbox"

              checked={featured}

              onChange={(e)=>setFeatured(e.target.checked)}

            />


            Featured Grammar Topic


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

              onClick={saveGrammar}

              className="flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-3 font-bold text-black transition hover:bg-indigo-400 disabled:opacity-50"

            >



              {saving ? (

                <Loader2 className="h-5 w-5 animate-spin"/>

              ) : grammar ? (

                "Update Topic"

              ) : (

                "Create Topic"

              )}



            </button>



          </div>




        </div>


      </div>


    </div>

  );

}