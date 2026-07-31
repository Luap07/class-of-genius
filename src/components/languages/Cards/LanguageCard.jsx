import React from "react";
import { motion } from "framer-motion";

import {
  Globe2,
  ArrowRight,
  Star,
  Users,
  BookOpen,
} from "lucide-react";


const LanguageCard = ({
  language,
  onClick,
}) => {

  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
      }}

      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-slate-900
      "
    >


      {/* Cover */}

      <div className="relative h-56 overflow-hidden">


        {language?.cover_url ? (

          <img
            src={language.cover_url}
            alt={language.name}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-700
              group-hover:scale-110
            "
          />

        ) : (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              bg-gradient-to-br
              from-cyan-600
              to-indigo-700
            "
          >
            <Globe2
              size={90}
              className="text-white/90"
            />
          </div>

        )}


        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black
            via-black/20
            to-transparent
          "
        />


        <div
          className="
            absolute
            left-5
            top-5
            rounded-full
            bg-black/40
            px-4
            py-2
            text-sm
            font-bold
            backdrop-blur-xl
          "
        >
          {language?.native_name || "Language"}
        </div>


        {language?.flag_url && (

          <img
            src={language.flag_url}
            alt="flag"
            className="
              absolute
              bottom-5
              left-5
              h-12
              w-12
              rounded-full
              border-2
              border-white/30
              object-cover
            "
          />

        )}

      </div>



      {/* Body */}

      <div className="p-6">


        <h2
          className="
            text-2xl
            font-black
            text-white
          "
        >
          {language?.name}
        </h2>


        <p
          className="
            mt-4
            line-clamp-3
            leading-7
            text-slate-400
          "
        >
          {language?.description ||
            "Start learning this language today."
          }
        </p>



        <div
          className="
            mt-6
            grid
            grid-cols-3
            gap-4
          "
        >


          <div className="rounded-2xl bg-white/5 p-4 text-center">

            <BookOpen
              size={22}
              className="mx-auto text-cyan-400"
            />

            <p className="mt-2 text-lg font-black">
              {language?.materials_count ?? 0}
            </p>

            <p className="text-xs text-slate-500">
              Materials
            </p>

          </div>



          <div className="rounded-2xl bg-white/5 p-4 text-center">

            <Users
              size={22}
              className="mx-auto text-green-400"
            />

            <p className="mt-2 text-lg font-black">
              {language?.students_count ?? 0}
            </p>

            <p className="text-xs text-slate-500">
              Students
            </p>

          </div>




          <div className="rounded-2xl bg-white/5 p-4 text-center">

            <Star
              size={22}
              className="mx-auto text-yellow-400"
            />

            <p className="mt-2 text-lg font-black">
              {language?.rating ?? "5.0"}
            </p>

            <p className="text-xs text-slate-500">
              Rating
            </p>

          </div>


        </div>



        <button
          onClick={onClick}
          className="
            mt-8
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-cyan-600
            py-4
            font-black
            transition
            hover:bg-cyan-500
          "
        >

          Explore Language


          <ArrowRight size={18}/>


        </button>


      </div>


    </motion.div>
  );
};


export default LanguageCard;