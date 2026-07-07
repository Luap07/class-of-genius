import React from "react";
import { motion } from "framer-motion";

import {
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock3,
} from "lucide-react";


const LessonCard = ({
  lesson = {},
  onOpen,
}) => {


  const {
    title = "Untitled Lesson",
    description = "No description available",
    duration = "0 min",
    completed = false,
    locked = false,
  } = lesson;



  return (

    <motion.div

      whileHover={{
        y:-5,
      }}

      transition={{
        duration:0.25,
      }}

      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "

    >


      <div
        className="
          flex
          justify-between
          items-start
          gap-4
        "
      >

        <div>


          <h3
            className="
              text-xl
              font-bold
            "
          >
            {title}
          </h3>


          <p
            className="
              mt-2
              text-slate-400
            "
          >
            {description}
          </p>


          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              text-sm
              text-slate-500
            "
          >

            <Clock3 size={16}/>

            {duration}

          </div>


        </div>



        {
          locked ? (

            <Lock
              className="text-slate-500"
              size={26}
            />

          ) : completed ? (

            <CheckCircle2
              className="text-emerald-400"
              size={26}
            />

          ) : (

            <PlayCircle
              className="text-blue-400"
              size={26}
            />

          )

        }


      </div>



      <button

        disabled={locked}

        onClick={() => onOpen?.(lesson)}

        className={`
          mt-6
          w-full
          rounded-2xl
          px-5
          py-3
          font-semibold
          transition

          ${
            locked
            ?
            "bg-slate-800 text-slate-500 cursor-not-allowed"
            :
            "bg-blue-600 hover:bg-blue-700"
          }

        `}

      >

        {
          locked
          ?
          "Locked"
          :
          completed
          ?
          "Review Lesson"
          :
          "Start Lesson"
        }


      </button>


    </motion.div>

  );

};


export default LessonCard;