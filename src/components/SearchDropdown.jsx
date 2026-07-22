import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ArrowUpRight,
  SearchX,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";


const SearchDropdown = () => {

  const {
    results,
    searchTerm,
    setSearchTerm,
  } = useSearch();


  const navigate = useNavigate();



  if (!searchTerm) return null;



  return (

    <motion.div

      initial={{
        opacity:0,
        y:-10,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      className="
        absolute
        top-16
        left-0
        right-0
        z-50
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-950/95
        backdrop-blur-xl
        shadow-2xl
      "

    >


      {results.length === 0 ? (


        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            px-6
            py-10
            text-center
          "
        >

          <SearchX
            size={35}
            className="text-slate-600"
          />

          <p className="
            mt-4
            font-semibold
            text-slate-400
          ">
            No results found
          </p>

        </div>


      ) : (


        <div
          className="
            max-h-96
            overflow-y-auto
            p-3
          "
        >

          {results.map((item,index)=>(


            <motion.button

              key={index}

              whileHover={{
                x:5,
              }}

              onClick={()=>{

                navigate(item.path);

                setSearchTerm("");

              }}

              className="
                flex
                w-full
                items-center
                justify-between
                rounded-xl
                px-4
                py-4
                text-left
                transition
                hover:bg-slate-800
              "

            >

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >


                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-500/10
                    text-cyan-400
                  "
                >

                  {item.type === "course" ? (

                    <BookOpen size={20}/>

                  ) : (

                    <CheckCircle2 size={20}/>

                  )}

                </div>


                <div>

                  <h4 className="
                    font-bold
                    text-white
                  ">
                    {item.title}
                  </h4>


                  <p className="
                    text-xs
                    capitalize
                    text-slate-500
                  ">
                    {item.type}
                  </p>


                </div>


              </div>



              <ArrowUpRight
                size={18}
                className="text-slate-500"
              />


            </motion.button>


          ))}


        </div>


      )}


    </motion.div>

  );

};


export default SearchDropdown;