import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";


export default function CategoryCTA({
  navigate,
}) {

  return (

    <motion.section

      initial={{
        opacity:0,
        y:40,
      }}

      whileInView={{
        opacity:1,
        y:0,
      }}

      viewport={{
        once:true,
      }}

      transition={{
        duration:0.7,
      }}

      className="mt-28"

    >

      <div
        className="
          relative
          overflow-hidden
          rounded-[40px]
          border
          border-cyan-500/20
          bg-gradient-to-r
          from-cyan-500/10
          via-blue-500/10
          to-indigo-500/10
          p-14
        "
      >

        {/* Background Glow */}

        <div
          className="
            absolute
            -left-32
            -top-32
            h-80
            w-80
            rounded-full
            bg-cyan-500/10
            blur-[140px]
          "
        />


        <div
          className="
            absolute
            -right-32
            bottom-0
            h-80
            w-80
            rounded-full
            bg-blue-500/10
            blur-[140px]
          "
        />



        <div
          className="
            relative
            z-10
            flex
            flex-col
            items-center
            text-center
          "
        >


          <Sparkles
            size={48}
            className="text-cyan-400"
          />


          <h2
            className="
              mt-8
              text-5xl
              font-black
            "
          >

            Start Learning Today

          </h2>


          <p
            className="
              mt-6
              max-w-3xl
              text-lg
              leading-9
              text-slate-300
            "
          >

            Discover professional courses,
            AI-powered tutoring, interactive
            virtual laboratories, quizzes,
            projects and certificates.

          </p>



          <div
            className="
              mt-12
              flex
              flex-wrap
              justify-center
              gap-6
            "
          >


            <button

              onClick={() =>
                navigate("/courses")
              }

              className="
                rounded-2xl
                bg-cyan-500
                px-10
                py-5
                font-bold
                text-slate-950
                transition
                hover:bg-cyan-400
              "

            >

              Browse Courses

            </button>



            <button

              onClick={() =>
                navigate("/ai-tutor")
              }

              className="
                rounded-2xl
                border
                border-slate-700
                bg-slate-900/60
                px-10
                py-5
                font-bold
                text-white
                transition
                hover:border-cyan-400
              "

            >

              AI Tutor

            </button>


          </div>


        </div>


      </div>


    </motion.section>

  );

}