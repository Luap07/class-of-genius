import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Plus,
  Search,
  RefreshCw,
  BookOpen,
  Layers,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";

import {
  supabase,
} from "../../../lib/supabaseClient";


/*
================================================
GRAMMAR ADMIN
================================================

Manages:
- Grammar topics
- Explanations
- Examples
- Difficulty levels
- Language connection

Expected table:

grammar_lessons

id
title
language_id
language_name
level
category
description
rules
examples
status
created_at
updated_at

================================================
*/


const levels = [
  "Beginner",
  "Intermediate",
  "Advanced",
];


const categories = [
  "Grammar Rules",
  "Sentence Structure",
  "Verb Tenses",
  "Pronunciation",
  "Writing",
];


const statusOptions = [
  "Published",
  "Draft",
];



export default function GrammarAdmin() {


  /*
  ================================================
  STATES
  ================================================
  */


  const [grammar, setGrammar] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [refreshing, setRefreshing] =
    useState(false);


  const [search, setSearch] =
    useState("");


  const [filterLevel, setFilterLevel] =
    useState("All");


  const [filterStatus, setFilterStatus] =
    useState("All");


  const [showModal, setShowModal] =
    useState(false);


  const [editingGrammar, setEditingGrammar] =
    useState(null);



  const [form, setForm] =
    useState({

      title: "",

      language_name: "",

      level: "Beginner",

      category: "Grammar Rules",

      description: "",

      rules: "",

      examples: "",

      status: "Draft",

    });



  /*
  ================================================
  FETCH GRAMMAR
  ================================================
  */


  const fetchGrammar = async () => {


    try {


      setLoading(true);


      const {
        data,
        error,
      } =
        await supabase
          .from("grammar_lessons")
          .select("*")
          .order(
            "created_at",
            {
              ascending:false,
            }
          );



      if(error)
        throw error;



      setGrammar(
        data || []
      );


    }
    catch(error){

      console.error(
        "Grammar Fetch Error:",
        error
      );

    }
    finally{

      setLoading(false);

    }

  };



  useEffect(()=>{

    fetchGrammar();

  },[]);



  /*
  ================================================
  REFRESH
  ================================================
  */


  const handleRefresh = async()=>{


    setRefreshing(true);


    await fetchGrammar();


    setRefreshing(false);


  };



  /*
  ================================================
  STATS
  ================================================
  */


  const stats =
    useMemo(()=>{


      return [

        {
          title:
          "Total Grammar",

          value:
          grammar.length,

          icon:
          BookOpen,
        },


        {
          title:
          "Beginner",

          value:
          grammar.filter(
            item =>
            item.level === "Beginner"
          ).length,

          icon:
          Layers,
        },


        {
          title:
          "Published",

          value:
          grammar.filter(
            item =>
            item.status === "Published"
          ).length,

          icon:
          CheckCircle,
        },


        {
          title:
          "Drafts",

          value:
          grammar.filter(
            item =>
            item.status === "Draft"
          ).length,

          icon:
          Clock,
        },

      ];


    },[
      grammar
    ]);



  /*
  ================================================
  FILTER DATA
  ================================================
  */


  const filteredGrammar =
    useMemo(()=>{


      return grammar.filter(
        item=>{


          const matchesSearch =

            item.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )

            ||

            item.language_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );



          const matchesLevel =

            filterLevel === "All"

            ||

            item.level === filterLevel;



          const matchesStatus =

            filterStatus === "All"

            ||

            item.status === filterStatus;



          return (

            matchesSearch &&

            matchesLevel &&

            matchesStatus

          );


        }
      );


    },[
      grammar,
      search,
      filterLevel,
      filterStatus,
    ]);



  /*
  ================================================
  FORM HANDLER
  ================================================
  */


  const handleChange = (
    e
  )=>{


    setForm({

      ...form,

      [e.target.name]:
      e.target.value,

    });


  };



  /*
  ================================================
  RESET FORM
  ================================================
  */


  const resetForm = ()=>{


    setForm({

      title:"",

      language_name:"",

      level:"Beginner",

      category:"Grammar Rules",

      description:"",

      rules:"",

      examples:"",

      status:"Draft",

    });


    setEditingGrammar(null);


  };



  /*
  UI CONTINUES IN PART 2
  */


    return (

    <section
      className="
      min-h-screen
      bg-slate-950
      p-6
      text-white
      "
    >

      {/* ======================================
          HEADER
      ====================================== */}


      <div
        className="
        mb-10
        flex
        flex-col
        justify-between
        gap-6
        lg:flex-row
        lg:items-center
        "
      >

        <div>

          <h1
            className="
            text-4xl
            font-black
            "
          >
            Grammar Management
          </h1>


          <p
            className="
            mt-2
            text-slate-400
            "
          >
            Create and manage grammar lessons,
            rules, examples and explanations.
          </p>

        </div>



        <div
          className="
          flex
          gap-3
          "
        >

          <button
            onClick={handleRefresh}
            className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-slate-700
            bg-slate-900
            px-5
            py-3
            font-bold
            transition
            hover:border-cyan-500
            "
          >

            <RefreshCw
              size={18}
              className={
                refreshing
                ? "animate-spin"
                : ""
              }
            />

            Refresh

          </button>



          <button
            onClick={()=>{
              resetForm();
              setShowModal(true);
            }}
            className="
            flex
            items-center
            gap-2
            rounded-2xl
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            px-5
            py-3
            font-bold
            shadow-lg
            shadow-cyan-500/20
            "
          >

            <Plus
              size={18}
            />

            Add Grammar

          </button>


        </div>


      </div>



      {/* ======================================
          STATS
      ====================================== */}


      <div
        className="
        mb-10
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-4
        "
      >

        {
          stats.map(
            (item,index)=>{


              const Icon =
              item.icon;


              return (

                <motion.div

                  key={item.title}

                  initial={{
                    opacity:0,
                    y:20
                  }}

                  animate={{
                    opacity:1,
                    y:0
                  }}

                  transition={{
                    delay:index*0.1
                  }}

                  className="
                  rounded-3xl
                  border
                  border-slate-800
                  bg-slate-900/80
                  p-6
                  backdrop-blur-xl
                  "
                >

                  <div
                    className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-cyan-500/10
                    text-cyan-400
                    "
                  >

                    <Icon
                      size={28}
                    />

                  </div>


                  <h2
                    className="
                    mt-5
                    text-3xl
                    font-black
                    "
                  >

                    {item.value}

                  </h2>


                  <p
                    className="
                    mt-2
                    text-slate-400
                    "
                  >

                    {item.title}

                  </p>


                </motion.div>

              );


            }
          )
        }

      </div>





      {/* ======================================
          FILTER BAR
      ====================================== */}


      <div
        className="
        mb-8
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/80
        p-6
        "
      >


        <div
          className="
          grid
          gap-5
          lg:grid-cols-4
          "
        >



          {/* SEARCH */}


          <div
            className="
            lg:col-span-2
            "
          >

            <label
              className="
              mb-2
              block
              text-sm
              font-bold
              text-slate-300
              "
            >

              Search Grammar

            </label>


            <div
              className="
              flex
              items-center
              rounded-2xl
              border
              border-slate-700
              bg-slate-800
              px-4
              "
            >

              <Search
                size={18}
                className="text-slate-400"
              />


              <input

                value={search}

                onChange={
                  e=>setSearch(
                    e.target.value
                  )
                }

                placeholder="
                Search title or language...
                "

                className="
                w-full
                bg-transparent
                px-4
                py-4
                outline-none
                "
              />


            </div>


          </div>





          {/* LEVEL */}


          <div>

            <label
              className="
              mb-2
              block
              text-sm
              font-bold
              text-slate-300
              "
            >

              Level

            </label>


            <select

              value={filterLevel}

              onChange={
                e=>setFilterLevel(
                  e.target.value
                )
              }

              className="
              w-full
              rounded-2xl
              border
              border-slate-700
              bg-slate-800
              px-4
              py-4
              outline-none
              "
            >

              <option>
                All
              </option>


              {
                levels.map(
                  level=>(
                    <option
                      key={level}
                    >
                      {level}
                    </option>
                  )
                )
              }


            </select>


          </div>





          {/* STATUS */}


          <div>

            <label
              className="
              mb-2
              block
              text-sm
              font-bold
              text-slate-300
              "
            >

              Status

            </label>


            <select

              value={filterStatus}

              onChange={
                e=>setFilterStatus(
                  e.target.value
                )
              }

              className="
              w-full
              rounded-2xl
              border
              border-slate-700
              bg-slate-800
              px-4
              py-4
              outline-none
              "
            >

              <option>
                All
              </option>


              {
                statusOptions.map(
                  status=>(
                    <option
                      key={status}
                    >
                      {status}
                    </option>
                  )
                )
              }


            </select>


          </div>



        </div>


      </div>



      {/* ======================================
          GRAMMAR TABLE
      ====================================== */}


      <div
        className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/80
        "
      >


        <div
          className="
          overflow-x-auto
          "
        >

          <table
            className="
            w-full
            text-left
            "
          >

            <thead
              className="
              border-b
              border-slate-800
              bg-slate-900
              "
            >

              <tr>

                <th
                  className="
                  px-6
                  py-5
                  text-sm
                  text-slate-400
                  "
                >
                  Title
                </th>


                <th
                  className="
                  px-6
                  py-5
                  text-sm
                  text-slate-400
                  "
                >
                  Language
                </th>


                <th
                  className="
                  px-6
                  py-5
                  text-sm
                  text-slate-400
                  "
                >
                  Level
                </th>


                <th
                  className="
                  px-6
                  py-5
                  text-sm
                  text-slate-400
                  "
                >
                  Status
                </th>


                <th
                  className="
                  px-6
                  py-5
                  text-sm
                  text-slate-400
                  "
                >
                  Actions
                </th>


              </tr>


            </thead>



            <tbody>


            {
              loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="
                    px-6
                    py-20
                    text-center
                    text-slate-400
                    "
                  >

                    Loading grammar lessons...

                  </td>


                </tr>


              ) : filteredGrammar.length === 0 ? (


                <tr>

                  <td
                    colSpan="5"
                    className="
                    px-6
                    py-20
                    text-center
                    text-slate-400
                    "
                  >

                    No grammar lessons found.

                  </td>


                </tr>


              ) : (


                filteredGrammar.map(
                  (item)=>(


                    <tr

                      key={item.id}

                      className="
                      border-b
                      border-slate-800
                      transition
                      hover:bg-slate-800/50
                      "
                    >


                      <td
                        className="
                        px-6
                        py-5
                        "
                      >

                        <p
                          className="
                          font-bold
                          text-white
                          "
                        >

                          {item.title}

                        </p>


                        <p
                          className="
                          mt-1
                          text-sm
                          text-slate-500
                          "
                        >

                          {item.category}

                        </p>


                      </td>



                      <td
                        className="
                        px-6
                        py-5
                        text-slate-300
                        "
                      >

                        {item.language_name}


                      </td>



                      <td
                        className="
                        px-6
                        py-5
                        "
                      >

                        <span
                          className="
                          rounded-full
                          bg-cyan-500/10
                          px-4
                          py-2
                          text-sm
                          text-cyan-300
                          "
                        >

                          {item.level}

                        </span>


                      </td>




                      <td
                        className="
                        px-6
                        py-5
                        "
                      >

                        <span
                          className={`
                          rounded-full
                          px-4
                          py-2
                          text-sm
                          ${
                            item.status === "Published"
                            ?
                            "bg-green-500/10 text-green-400"
                            :
                            "bg-yellow-500/10 text-yellow-400"
                          }
                          `}
                        >

                          {item.status}

                        </span>


                      </td>




                      <td
                        className="
                        px-6
                        py-5
                        "
                      >

                        <div
                          className="
                          flex
                          gap-3
                          "
                        >


                          <button

                            onClick={()=>{

                              setEditingGrammar(item);

                              setForm(item);

                              setShowModal(true);

                            }}

                            className="
                            rounded-xl
                            bg-blue-500/10
                            p-3
                            text-blue-400
                            transition
                            hover:bg-blue-500/20
                            "
                          >

                            <Edit
                              size={18}
                            />


                          </button>



                          <button

                            className="
                            rounded-xl
                            bg-red-500/10
                            p-3
                            text-red-400
                            transition
                            hover:bg-red-500/20
                            "

                          >

                            <Trash2
                              size={18}
                            />

                          </button>


                        </div>


                      </td>


                    </tr>


                  )

                )


              )

            }



            </tbody>


          </table>


        </div>


      </div>






      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}


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
            "
          >


            <div
              className="
              max-h-[90vh]
              w-full
              max-w-3xl
              overflow-y-auto
              rounded-3xl
              border
              border-slate-800
              bg-slate-950
              p-8
              "
            >


              <div
                className="
                mb-6
                flex
                items-center
                justify-between
                "
              >

                <h2
                  className="
                  text-2xl
                  font-black
                  "
                >

                  {
                    editingGrammar
                    ?
                    "Edit Grammar"
                    :
                    "Add Grammar"
                  }


                </h2>


                <button

                  onClick={()=>{

                    setShowModal(false);

                    resetForm();

                  }}

                  className="
                  text-slate-400
                  hover:text-white
                  "
                >

                  ✕


                </button>


              </div>





              <div
                className="
                grid
                gap-5
                md:grid-cols-2
                "
              >


                <input

                  name="title"

                  value={form.title}

                  onChange={handleChange}

                  placeholder="Grammar title"

                  className="
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  py-3
                  "
                />



                <input

                  name="language_name"

                  value={form.language_name}

                  onChange={handleChange}

                  placeholder="Language"

                  className="
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  py-3
                  "
                />


              </div>



                <div
                  className="
                  mt-5
                  grid
                  gap-5
                  md:grid-cols-2
                  "
                >


                  <select

                    name="level"

                    value={form.level}

                    onChange={handleChange}

                    className="
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-900
                    px-4
                    py-3
                    "
                  >

                    {
                      levels.map(
                        level=>(
                          <option
                            key={level}
                          >
                            {level}
                          </option>
                        )
                      )
                    }

                  </select>




                  <select

                    name="category"

                    value={form.category}

                    onChange={handleChange}

                    className="
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-900
                    px-4
                    py-3
                    "
                  >

                    {
                      categories.map(
                        category=>(
                          <option
                            key={category}
                          >
                            {category}
                          </option>
                        )
                      )
                    }

                  </select>



                </div>





                <textarea

                  name="description"

                  value={form.description}

                  onChange={handleChange}

                  placeholder="Grammar description"

                  rows="3"

                  className="
                  mt-5
                  w-full
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  py-3
                  "
                />





                <textarea

                  name="rules"

                  value={form.rules}

                  onChange={handleChange}

                  placeholder="Grammar rules"

                  rows="5"

                  className="
                  mt-5
                  w-full
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  py-3
                  "
                />





                <textarea

                  name="examples"

                  value={form.examples}

                  onChange={handleChange}

                  placeholder="Examples"

                  rows="5"

                  className="
                  mt-5
                  w-full
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  py-3
                  "
                />





                <select

                  name="status"

                  value={form.status}

                  onChange={handleChange}

                  className="
                  mt-5
                  w-full
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  py-3
                  "
                >

                  {
                    statusOptions.map(
                      status=>(
                        <option
                          key={status}
                        >
                          {status}
                        </option>
                      )
                    )
                  }


                </select>





                <button

                  onClick={async()=>{


                    try{


                      const payload = {

                        ...form,

                        updated_at:
                        new Date()
                        .toISOString(),

                      };



                      if(editingGrammar){


                        const {
                          error
                        } =
                        await supabase
                        .from(
                          "grammar_lessons"
                        )
                        .update(payload)
                        .eq(
                          "id",
                          editingGrammar.id
                        );



                        if(error)
                          throw error;



                      }
                      else{


                        const {
                          error
                        } =
                        await supabase
                        .from(
                          "grammar_lessons"
                        )
                        .insert({

                          ...payload,

                          created_at:
                          new Date()
                          .toISOString(),

                        });



                        if(error)
                          throw error;


                      }




                      setShowModal(false);

                      resetForm();

                      fetchGrammar();



                    }
                    catch(error){

                      console.error(
                        "Save Grammar Error:",
                        error
                      );

                    }


                  }}

                  className="
                  mt-8
                  w-full
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  py-4
                  font-black
                  text-white
                  "
                >


                  {
                    editingGrammar
                    ?
                    "Update Grammar"
                    :
                    "Create Grammar"
                  }

                </button>

              </div>

            </div>        

        )

      }

    </section>

  );


}
