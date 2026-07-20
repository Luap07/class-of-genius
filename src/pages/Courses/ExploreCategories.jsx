import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  Atom,
  Laptop,
  Briefcase,
  Palette,
  Globe,
  HeartPulse,
  GraduationCap,
} from "lucide-react";


import CategoryStats from "../../components/courses/CategoriesStats";
import CategoryGrid from "../../components/courses/CategoryGrid";
import WhyScholiqen from "../../components/courses/WhyScholiqen";
import CategoryCTA from "../../components/courses/CategoriesCTA";


const categories = [
  {
    id:"science",
    title:"Science",
    description:
    "Master Physics, Chemistry, Biology and Mathematics with interactive learning.",
    icon:Atom,
    color:"from-cyan-500 to-blue-600",
    courses:"120+",
    students:"18K+",
    ai:true,
    labs:true,
    subjects:[
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics"
    ]
  },


  {
    id:"technology",
    title:"Technology",
    description:
    "Programming, Artificial Intelligence, Cyber Security and Cloud Computing.",
    icon:Laptop,
    color:"from-indigo-500 to-blue-600",
    courses:"95+",
    students:"14K+",
    ai:true,
    labs:false,
    subjects:[
      "Programming",
      "Artificial Intelligence",
      "Cyber Security",
      "Cloud Computing"
    ]
  },


  {
    id:"business",
    title:"Business",
    description:
    "Accounting, Finance, Entrepreneurship, Marketing and Business Management.",
    icon:Briefcase,
    color:"from-emerald-500 to-green-600",
    courses:"82+",
    students:"11K+",
    ai:true,
    labs:false,
    subjects:[
      "Accounting",
      "Finance",
      "Marketing",
      "Management"
    ]
  },


  {
    id:"arts",
    title:"Arts",
    description:
    "Creative Arts, Literature, Music, Design and Digital Creativity.",
    icon:Palette,
    color:"from-pink-500 to-rose-600",
    courses:"70+",
    students:"8K+",
    ai:false,
    labs:false,
    subjects:[
      "Design",
      "Literature",
      "Music",
      "Creative Arts"
    ]
  },


  {
    id:"geography",
    title:"Geography",
    description:
    "Earth Science, GIS, Climate Change and Environmental Studies.",
    icon:Globe,
    color:"from-teal-500 to-cyan-600",
    courses:"45+",
    students:"5K+",
    ai:false,
    labs:true,
    subjects:[
      "GIS",
      "Climate",
      "Environment",
      "Earth Science"
    ]
  },


  {
    id:"health",
    title:"Health",
    description:
    "Medicine, Anatomy, Nursing, Pharmacy and Public Health.",
    icon:HeartPulse,
    color:"from-red-500 to-orange-600",
    courses:"88+",
    students:"13K+",
    ai:true,
    labs:true,
    subjects:[
      "Medicine",
      "Anatomy",
      "Nursing",
      "Public Health"
    ]
  },


  {
    id:"university",
    title:"University",
    description:
    "Engineering, Computer Science, Law, Medicine and Degree Programmes.",
    icon:GraduationCap,
    color:"from-yellow-500 to-amber-600",
    courses:"250+",
    students:"32K+",
    ai:true,
    labs:true,
    subjects:[
      "Engineering",
      "Computer Science",
      "Law",
      "Medicine"
    ]
  }

];
export default function ExploreCategories() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");


  const filteredCategories = useMemo(() => {

    const keyword = search
      .trim()
      .toLowerCase();


    if (!keyword) {
      return categories;
    }


    return categories.filter((category) => (

      category.title
        .toLowerCase()
        .includes(keyword)

      ||

      category.description
        .toLowerCase()
        .includes(keyword)

      ||

      category.subjects.some((subject) =>
        subject
          .toLowerCase()
          .includes(keyword)
      )

    ));

  }, [search]);



  return (

    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#030712]
        text-white
      "
    >


      {/* ================= PREMIUM BACKGROUND ================= */}

<div
  className="
    absolute
    inset-0
    overflow-hidden
    pointer-events-none
  "
>

  {/* Base */}

  <div
    className="
      absolute
      inset-0
      bg-[#020617]
    "
  />


  {/* Main Gradient */}

  <div
    className="
      absolute
      inset-0
      bg-[radial-gradient(circle_at_50%_0%,rgba(14,116,144,0.25),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(37,99,235,0.18),transparent_40%)]
    "
  />


  {/* Moving Cyan Atmosphere */}

  <motion.div

    animate={{
      x:[
        -120,
        80,
        -120
      ],

      y:[
        0,
        60,
        0
      ],
    }}

    transition={{
      duration:25,
      repeat:Infinity,
      ease:"linear"
    }}

    className="
      absolute
      -left-48
      top-20
      h-[600px]
      w-[600px]
      rounded-full
      bg-cyan-500/10
      blur-[160px]
    "

  />



  {/* Moving Blue Atmosphere */}

  <motion.div

    animate={{
      x:[
        100,
        -80,
        100
      ],

      y:[
        80,
        -40,
        80
      ],
    }}

    transition={{
      duration:30,
      repeat:Infinity,
      ease:"linear"
    }}

    className="
      absolute
      right-[-200px]
      bottom-[-150px]
      h-[700px]
      w-[700px]
      rounded-full
      bg-blue-600/10
      blur-[180px]
    "

  />



  {/* Dotted Grid */}

  <div
    className="
      absolute
      inset-0
      opacity-[0.08]
      bg-[radial-gradient(#94a3b8_1px,transparent_1px)]
      [background-size:32px_32px]
    "
  />



  {/* Top Fade */}

  <div
    className="
      absolute
      inset-x-0
      top-0
      h-40
      bg-gradient-to-b
      from-cyan-500/10
      to-transparent
    "
  />


</div>



      {/* ================= CONTENT ================= */}


      <main
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          py-20
        "
      >


        {/* ================= HERO ================= */}


        <motion.section

          initial={{
            opacity:0,
            y:35
          }}

          animate={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:.7
          }}

          className="text-center"

        >


          <div
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-cyan-500/30
              bg-cyan-500/10
              px-6
              py-2
            "
          >

            <span
              className="
                font-semibold
                text-cyan-300
              "
            >
              Explore Every Learning Path
            </span>


          </div>



          <h1
            className="
              mt-8
              text-5xl
              font-black
              lg:text-7xl
            "
          >

            Learn Without

            <span className="text-cyan-400">
              {" "}Limits
            </span>


          </h1>



          <p
            className="
              mx-auto
              mt-8
              max-w-3xl
              text-lg
              leading-9
              text-slate-400
            "
          >

            Browse thousands of courses,
            AI tutoring, virtual laboratories,
            projects and certificates.

          </p>


        </motion.section>
                {/* ================= SEARCH ================= */}

        <div
          className="
            mx-auto
            mt-14
            max-w-4xl
            flex
            overflow-hidden
            rounded-3xl
            border
            border-slate-700
            bg-slate-900/70
            backdrop-blur-xl
          "
        >

          <div className="flex items-center px-6">

            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="
                Search categories, subjects or courses...
              "
              className="
                flex-1
                bg-transparent
                py-6
                text-lg
                outline-none
                placeholder:text-slate-500
              "
            />

          </div>


        </div>




        {/* ================= STATS ================= */}


        <CategoryStats />




        {/* ================= CATEGORY GRID ================= */}


        <CategoryGrid
          categories={filteredCategories}
          navigate={navigate}
        />




        {/* ================= WHY SCHOLIQEN ================= */}


        <WhyScholiqen />




        {/* ================= CTA ================= */}


        <CategoryCTA
          navigate={navigate}
        />


      </main>


    </div>

  );

}