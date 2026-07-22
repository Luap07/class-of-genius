import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  FolderOpen,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


const CategoriesAdmin = () => {

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);



  // ================= FETCH =================

  const fetchCategories = async () => {

    try {

      setLoading(true);


      const { data, error } = await supabase
        .from("course_categories")
        .select("*")
        .order("created_at", {
          ascending:false,
        });


      if(error) throw error;


      setCategories(data || []);


    } catch(error){

      console.error(
        "Category Fetch Error:",
        error
      );

    }
    finally{

      setLoading(false);

    }

  };



  useEffect(()=>{

    fetchCategories();

  },[]);




  // ================= SAVE =================


  const handleSave = async () => {


    if(!name.trim()) return;


    try{

      setSaving(true);



      if(editingId){

        const { error } =
          await supabase
          .from("course_categories")
          .update({
            name,
            description,
          })
          .eq(
            "id",
            editingId
          );


        if(error) throw error;



      }else{


        const { error } =
          await supabase
          .from("course_categories")
          .insert({

            name,

            description,

          });



        if(error) throw error;

      }



      setName("");

      setDescription("");

      setEditingId(null);


      fetchCategories();



    }catch(error){

      console.error(
        "Save Category Error:",
        error
      );


    }finally{

      setSaving(false);

    }

  };




  // ================= DELETE =================


  const handleDelete = async(id)=>{


    const confirmDelete =
      window.confirm(
        "Delete this category?"
      );


    if(!confirmDelete)
      return;



    const { error } =
      await supabase
      .from("course_categories")
      .delete()
      .eq(
        "id",
        id
      );



    if(error){

      console.error(
        error
      );

      return;

    }



    fetchCategories();


  };





  // ================= EDIT =================


  const handleEdit=(category)=>{


    setEditingId(
      category.id
    );


    setName(
      category.name
    );


    setDescription(
      category.description || ""
    );


  };





  return (

    <div className="space-y-10">


      {/* HEADER */}

      <div>

        <h1 className="text-4xl font-black">
          Course Categories
        </h1>

        <p className="mt-2 text-slate-400">
          Manage learning categories displayed across the LMS.
        </p>

      </div>





      {/* FORM */}


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
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900/70
        p-8
        backdrop-blur-xl
        "

      >


        <div className="grid gap-5">


          <input

            value={name}

            onChange={(e)=>
              setName(e.target.value)
            }

            placeholder="Category name"

            className="
            rounded-2xl
            border
            border-slate-700
            bg-slate-950
            px-5
            py-4
            outline-none
            "

          />



          <textarea

            value={description}

            onChange={(e)=>
              setDescription(
                e.target.value
              )
            }

            placeholder="Category description"

            rows="4"

            className="
            rounded-2xl
            border
            border-slate-700
            bg-slate-950
            px-5
            py-4
            outline-none
            "

          />




          <button

            onClick={handleSave}

            disabled={saving}

            className="
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-cyan-500
            px-6
            py-4
            font-bold
            text-slate-950
            "

          >

            {
              saving ?

              <Loader2
                className="animate-spin"
              />

              :

              <Plus/>
            }


            {
              editingId
              ?
              "Update Category"
              :
              "Create Category"
            }


          </button>



        </div>


      </motion.div>







      {/* LIST */}



      {
        loading ?

        <div className="flex justify-center">

          <Loader2
            className="animate-spin text-cyan-400"
            size={40}
          />

        </div>


        :



        <div className="
        grid
        gap-6
        md:grid-cols-3
        ">


        {
          categories.map((category)=>(


            <motion.div

            key={category.id}

            whileHover={{
              y:-8
            }}

            className="
            rounded-[30px]
            border
            border-slate-800
            bg-slate-900/70
            p-6
            "

            >


              <div className="
              flex
              items-center
              gap-4
              ">

                <div className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-cyan-500/10
                text-cyan-400
                ">

                  <FolderOpen/>

                </div>



                <h2 className="
                text-xl
                font-bold
                ">

                  {category.name}

                </h2>


              </div>




              <p className="
              mt-5
              text-slate-400
              ">

                {category.description ||
                "No description"}

              </p>





              <div className="
              mt-6
              flex
              gap-3
              ">


                <button

                onClick={()=>
                  handleEdit(category)
                }

                className="
                rounded-xl
                bg-blue-500/10
                p-3
                text-blue-400
                "

                >

                  <Edit size={18}/>

                </button>





                <button

                onClick={()=>
                  handleDelete(
                    category.id
                  )
                }

                className="
                rounded-xl
                bg-red-500/10
                p-3
                text-red-400
                "

                >

                  <Trash2 size={18}/>

                </button>


              </div>



            </motion.div>


          ))

        }


        </div>


      }


    </div>

  );

};


export default CategoriesAdmin;