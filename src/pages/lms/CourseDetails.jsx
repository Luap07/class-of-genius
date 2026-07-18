// src/pages/lms/CourseDetails.jsx

import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { useCourses } from "../../context/LMSContext/CourseContext";

import CourseHero from "../../components/courseDetails/CourseHero";
import CourseNav from "../../components/courseDetails/CourseNav";
import CourseOverview from "../../components/courseDetails/CourseOverview";
import LearningOutcomes from "../../components/courseDetails/LearningOutcomes";
import ModuleAccordion from "../../components/courseDetails/ModuleAccordion";
import InstructorCard from "../../components/courseDetails/InstructorCard";
import CourseReviews from "../../components/courseDetails/CourseReviews";
import RelatedCourses from "../../components/courseDetails/RelatedCourses";
import CourseFAQ from "../../components/courseDetails/CourseFAQ";


const CourseDetails = () => {


  const { id } = useParams();


  const {
    courses = [],
    getCourse,
    loading,

  } = useCourses();



  const course =
    getCourse(id) ||
    courses.find(
      item =>
      item.slug === id
    );





  if(loading){

    return (

      <div className="
        min-h-[70vh]
        flex
        items-center
        justify-center
      ">

        <div className="
          h-12
          w-12
          rounded-full
          border-4
          border-blue-500
          border-t-transparent
          animate-spin
        "/>

      </div>

    );

  }




  if(!course){

    return (

      <div className="
        min-h-[70vh]
        flex
        items-center
        justify-center
      ">


        <div className="text-center">


          <h1 className="
            text-4xl
            font-bold
          ">

            Course Not Found

          </h1>


          <p className="
            text-slate-400
            mt-3
          ">

            This course does not exist.

          </p>


        </div>


      </div>

    );

  }





  const relatedCourses =
    courses.filter(
      item =>
        item.category === course.category &&
        item.id !== course.id
    );






  return (

    <motion.div

      initial={{
        opacity:0
      }}

      animate={{
        opacity:1
      }}

      transition={{
        duration:.5
      }}

      className="
        max-w-7xl
        mx-auto
        px-6
        py-10
        space-y-10
      "

    >



      {/* HERO */}

      <CourseHero
        course={course}
      />




      <div className="
        grid
        lg:grid-cols-12
        gap-8
      ">



        <aside className="
          lg:col-span-3
          sticky
          top-24
          h-fit
        ">

          <CourseNav />

        </aside>





        <main className="
          lg:col-span-9
          space-y-10
        ">





          <section id="overview">

            <CourseOverview
              course={course}
            />

          </section>






          <section id="outcomes">

            <LearningOutcomes
              course={course}
            />

          </section>






          <section id="curriculum">


            <ModuleAccordion

              modules={
                course.modules || []
              }

              lessons={
                course.modules
              }


            />


          </section>







          <section id="instructor">


            <InstructorCard

              instructor={
                course.instructor
              }

              course={course}

            />


          </section>







          <section id="reviews">


            <CourseReviews

              course={course}

            />


          </section>







          <section id="faq">


            <CourseFAQ

              course={course}

            />


          </section>







          <section id="related">


            <RelatedCourses

              courses={
                relatedCourses
              }

            />


          </section>




        </main>



      </div>



    </motion.div>

  );

};



export default CourseDetails;