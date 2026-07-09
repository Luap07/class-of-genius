// src/pages/admin/novels/GenreAdmin.jsx

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";


const GenresAdmin = () => {


  const [genres,setGenres] = useState([]);

  const [newGenre,setNewGenre] = useState("");




  /*
  =========================
  LOAD GENRES FROM NOVELS
  =========================
  */

  useEffect(()=>{

    loadGenres();

  },[]);




  const loadGenres = async()=>{


    const {data,error}=await supabase

      .from("novels")

      .select("genre");



    if(error){

      console.log(error);

      return;

    }



    const map={};



    data.forEach(item=>{


      if(item.genre){


        if(!map[item.genre]){

          map[item.genre]=0;

        }


        map[item.genre]++;

      }


    });




    const formatted=Object.keys(map).map(

      (name,index)=>({

        id:index+1,

        name,

        novels:map[name]

      })

    );



    setGenres(formatted);



  };







  /*
  =========================
  ADD GENRE
  =========================
  */

  const addGenre=()=>{


    if(!newGenre)
      return;



    setGenres([

      ...genres,

      {

        id:Date.now(),

        name:newGenre,

        novels:0

      }

    ]);



    setNewGenre("");

  };







  /*
  =========================
  DELETE
  =========================
  */

  const deleteGenre=(id)=>{


    setGenres(

      genres.filter(

        genre=>genre.id!==id

      )

    );


  };







  return (

    <div className="space-y-6 text-white">



      {/* HEADER */}


      <div className="
      flex
      justify-between
      items-center
      ">


        <div>


          <h1 className="text-3xl font-bold">

            Novel Genres

          </h1>


          <p className="text-slate-400 mt-1">

            Manage novel categories and genres.

          </p>


        </div>



      </div>






      {/* ADD GENRE */}


      <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-5
      flex
      gap-3
      ">


        <input

          value={newGenre}

          onChange={(e)=>
            setNewGenre(e.target.value)
          }

          placeholder="Enter new genre"

          className="
          flex-1
          bg-slate-800
          rounded-xl
          px-4
          py-3
          "

        />



        <AdminButton onClick={addGenre}>


          <span className="flex items-center gap-2">

            <Plus size={18}/>

            Add Genre

          </span>


        </AdminButton>



      </div>







      {/* TABLE */}


      <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      overflow-hidden
      ">



        <table className="w-full text-left">


          <thead className="bg-slate-800 text-slate-300">


            <tr>


              <th className="px-6 py-4">

                Genre

              </th>


              <th className="px-6 py-4">

                Total Novels

              </th>


              <th className="px-6 py-4">

                Actions

              </th>


            </tr>


          </thead>






          <tbody>


          {genres.map((genre)=>(


            <tr

              key={genre.id}

              className="
              border-t
              border-slate-800
              hover:bg-slate-800/50
              "

            >


              <td className="px-6 py-4 font-medium">

                {genre.name}

              </td>



              <td className="px-6 py-4 text-slate-400">

                {genre.novels}

              </td>




              <td className="px-6 py-4">


                <div className="flex gap-3">


                  <button

                    className="text-blue-400"

                  >

                    <Edit size={18}/>

                  </button>





                  <button

                    onClick={()=>
                      deleteGenre(genre.id)
                    }

                    className="text-red-400"

                  >

                    <Trash2 size={18}/>

                  </button>



                </div>


              </td>


            </tr>


          ))}


          </tbody>



        </table>



      </div>




    </div>

  );

};


export default GenresAdmin;