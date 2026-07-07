import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  SearchX,
} from "lucide-react";

const EmptyCourses = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        rounded-3xl
        border
        border-dashed
        border-slate-700
        bg-slate-900
        p-12
        text-center
      "
    >

      <div
        className="
          mx-auto
          w-20
          h-20
          rounded-3xl
          bg-slate-800
          flex
          items-center
          justify-center
        "
      >

        <SearchX
          size={40}
          className="text-slate-500"
        />

      </div>


      <h2 className="
        mt-6
        text-3xl
        font-bold
      ">
        No Courses Found
      </h2>


      <p className="
        mt-3
        text-slate-400
        max-w-md
        mx-auto
      ">
        We couldn't find any courses matching your search.
        Try another keyword or explore different categories.
      </p>


      <button
        className="
          mt-8
          inline-flex
          items-center
          gap-3
          rounded-2xl
          bg-blue-600
          hover:bg-blue-700
          transition
          px-7
          py-3
          font-semibold
        "
      >

        <BookOpen size={20}/>

        Browse All Courses

      </button>


    </motion.div>
  );
};

export default EmptyCourses;