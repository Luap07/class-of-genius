// src/components/lms/WeeklyTaskCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Circle,
  Trash2,
  ArrowRight,
} from "lucide-react";


const WeeklyTaskCard = ({
  id,
  title = "Untitled Task",
  course = "General",
  description = "",
  dueDate = "No date",
  status = "pending",
  onOpen = () => {},
  onComplete = () => {},
  onDelete = () => {},
}) => {


  const completed = status === "completed";



  return (

    <motion.div

      whileHover={{
        y: -5,
      }}

      transition={{
        duration: 0.25,
      }}

      className="
      rounded-3xl
      border
      border-slate-800
      bg-slate-900
      p-6
      shadow-lg
      "

    >


      {/* Header */}

      <div className="flex justify-between items-start gap-4">


        <div>


          <div className="
          flex
          items-center
          gap-2
          text-blue-400
          text-sm
          font-medium
          ">

            <BookOpen size={16}/>

            {course}

          </div>



          <h2 className="
          text-xl
          font-bold
          mt-3
          ">

            {title}

          </h2>


        </div>




        <button

          onClick={() =>
            onComplete(id)
          }

          className="
          text-slate-400
          hover:text-green-400
          transition
          "

        >

          {completed ? (

            <CheckCircle2
              size={28}
              className="text-green-400"
            />

          ) : (

            <Circle
              size={28}
            />

          )}

        </button>


      </div>









      {/* Description */}

      {description && (

        <p className="
        text-slate-400
        mt-5
        leading-relaxed
        ">

          {description}

        </p>

      )}









      {/* Footer */}

      <div className="
      mt-6
      flex
      justify-between
      items-center
      "

      >


        <div className="
        flex
        items-center
        gap-2
        text-sm
        text-slate-400
        ">

          <CalendarDays size={16}/>

          {dueDate}

        </div>







        <div className="
        flex
        items-center
        gap-3
        ">



          <button

            onClick={() =>
              onDelete(id)
            }

            className="
            p-2
            rounded-xl
            hover:bg-red-500/10
            text-slate-400
            hover:text-red-400
            transition
            "

          >

            <Trash2 size={18}/>

          </button>






          <button

            onClick={() =>
              onOpen(id)
            }

            className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-4
            py-2
            font-semibold
            hover:bg-blue-700
            transition
            "

          >

            Open

            <ArrowRight size={16}/>

          </button>



        </div>



      </div>






      {/* Status */}

      <div className="mt-5">


        <span

          className={`
          inline-flex
          px-3
          py-1
          rounded-full
          text-xs
          font-semibold

          ${
            completed

            ?

            "bg-green-500/10 text-green-400"

            :

            "bg-yellow-500/10 text-yellow-400"

          }

          `}

        >

          {completed ? "Completed" : "Pending"}


        </span>


      </div>




    </motion.div>

  );

};



export default WeeklyTaskCard;