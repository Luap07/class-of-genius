// src/components/courses/CourseCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  Star,
  Users,
  Award,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const CourseCard = ({
  course = {},
  onOpen = () => {},
}) => {

  const {
    title = "Untitled Course",
    category = "General",
    level = "Beginner",
    provider = "Scholiqen",
    thumbnail = "",
    duration = "0 hrs",
    lessons = 0,
    students = 0,
    rating = 0,
    certificate = false,
    progress = null,
  } = course;

const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 hover:border-blue-500 transition-all"
    >

      {/* Thumbnail */}
      <div className="relative h-52 bg-slate-800 overflow-hidden">

        {thumbnail ? (

          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />

        ) : (

          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900">
            <BookOpen size={60} className="text-white/70" />
          </div>

        )}


        <span className="absolute top-4 left-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">
          {category}
        </span>


        <span className="absolute top-4 right-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs">
          {level}
        </span>

      </div>



      {/* Body */}
      <div className="p-6">

        <p className="text-sm text-blue-400 font-medium">
          {provider}
        </p>


        <h2 className="mt-2 text-xl font-bold line-clamp-2">
          {title}
        </h2>



        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-400">


          <div className="flex items-center gap-2">
            <Clock3 size={16}/>
            {duration}
          </div>


          <div className="flex items-center gap-2">
            <BookOpen size={16}/>
            {lessons} Lessons
          </div>


          <div className="flex items-center gap-2">
            <Users size={16}/>
            {students.toLocaleString()}
          </div>


          <div className="flex items-center gap-2">
            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />
            {rating}
          </div>


        </div>




        {/* Certificate */}
        {certificate && (

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-emerald-400">

            <Award size={18}/>

            Certificate Included

          </div>

        )}






        {/* Progress */}
        {progress !== null && (

          <>

            <div className="mt-6 flex justify-between text-sm">

              <span className="text-slate-400">
                Progress
              </span>

              <span className="font-semibold">
                {progress}%
              </span>

            </div>



            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

              <motion.div

                initial={{width:0}}

                animate={{
                  width:`${progress}%`
                }}

                transition={{
                  duration:0.7
                }}

                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"

              />

            </div>

          </>

        )}







        {/* Open Course Button */}
        <button

onClick={() => {
  if (onOpen) {
    onOpen(course);
  } else {
    navigate(`/lms/course/${course.id}`);
  }
}}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"

        >

          {progress !== null ? (

            <>

              <PlayCircle size={18}/>

              Continue Learning

            </>

          ) : (

            <>

              View Course

              <ArrowRight size={18}/>

            </>

          )}


        </button>



      </div>


    </motion.div>
  );
};


export default CourseCard;