// src/components/courses/CategoryCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FolderOpen,
} from "lucide-react";


export default function CategoryCard({
  category,
  onClick,
}) {


  return (

    <motion.div

      whileHover={{
        y:-12,
        scale:1.02,
      }}

      whileTap={{
        scale:0.98
      }}

      onClick={onClick}

      className="
      group
      relative
      cursor-pointer
      overflow-hidden
      rounded-[34px]
      border
      border-slate-800
      bg-slate-900/70
      backdrop-blur-xl
      transition-all
      duration-300
      "

    >


      <div
        className="
        absolute
        inset-0
        bg-gradient-to-br
        from-cyan-500
        to-blue-600
        opacity-0
        group-hover:opacity-20
        transition
        duration-700
        "
      />



      <div className="
      relative
      z-10
      p-8
      ">


        {/* ICON */}

        <div
          className="
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          bg-gradient-to-br
          from-cyan-500
          to-blue-600
          "
        >

          <FolderOpen
            size={38}
            className="text-white"
          />

        </div>




        {/* CATEGORY NAME */}

        <h2
          className="
          mt-8
          text-3xl
          font-black
          text-white
          "
        >

          {category.name}

        </h2>



        <p
          className="
          mt-4
          text-slate-300
          "
        >

          Explore courses in {category.name}

        </p>




        {/* COURSE COUNT */}

        <div
          className="
          mt-8
          rounded-2xl
          border
          border-slate-700
          bg-slate-800/60
          p-4
          "
        >

          <p className="
          text-sm
          text-slate-400
          "
          >
            Available Courses
          </p>


          <h3
            className="
            mt-2
            text-2xl
            font-black
            text-cyan-400
            "
          >

            {category.count || 0}

          </h3>


        </div>




        {/* BUTTON */}

        <motion.button

          whileHover={{
            x:5
          }}

          className="
          mt-8
          flex
          w-full
          items-center
          justify-between
          rounded-2xl
          border
          border-cyan-500/20
          bg-cyan-500/10
          px-6
          py-4
          font-semibold
          text-cyan-300
          "

        >

          <span>
            Browse Courses
          </span>


          <ArrowRight size={20}/>


        </motion.button>


      </div>


    </motion.div>

  );

}