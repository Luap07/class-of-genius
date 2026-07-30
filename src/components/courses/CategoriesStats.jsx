import React from "react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Brain,
  Rocket,
  Trophy,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BookMarked,
  FlaskConical,
  FileText,
} from "lucide-react";



export default function CategoriesStats() {

const navigate = useNavigate();
  const highlights = [

    {
      icon: Sparkles,

      title: "Learn Faster",

      description:
        "Interactive lessons, smart notes, downloadable resources and engaging quizzes designed for better retention.",

      gradient:
        "from-cyan-500/20 via-sky-500/10 to-transparent",

      iconColor:
        "text-cyan-400",
    },


    {
      icon: Brain,

      title: "AI Learning",

      description:
        "Discover personalized recommendations, adaptive learning paths and intelligent study assistance.",

      gradient:
        "from-violet-500/20 via-fuchsia-500/10 to-transparent",

      iconColor:
        "text-violet-400",
    },


    {
      icon: Trophy,

      title: "Track Progress",

      description:
        "Complete courses, unlock achievements and monitor your academic journey with beautiful analytics.",

      gradient:
        "from-amber-500/20 via-yellow-500/10 to-transparent",

      iconColor:
        "text-amber-400",
    },


    {
      icon: Rocket,

      title: "Career Ready",

      description:
        "Build practical skills through projects, assessments and industry-focused learning experiences.",

      gradient:
        "from-emerald-500/20 via-green-500/10 to-transparent",

      iconColor:
        "text-emerald-400",
    },

  ];



  const quickFeatures = [

    {
      icon: GraduationCap,
      title: "Expert Courses",
    },

    {
      icon: BookMarked,
      title: "Study Notes",
    },

    {
      icon: FlaskConical,
      title: "Virtual Labs",
    },

    {
      icon: FileText,
      title: "Practice CBT",
    },

  ];



  return (

    <section
      className="
        relative
        mt-24
        overflow-hidden
      "
    >


      {/* Animated Background */}

      <div
        className="
          absolute
          inset-0
          overflow-hidden
          pointer-events-none
        "
      >

        <motion.div

          animate={{
            x:[0,120,0],
            y:[0,-80,0],
            scale:[1,1.2,1],
          }}

          transition={{
            duration:18,
            repeat:Infinity,
            ease:"easeInOut",
          }}

          className="
            absolute
            -left-40
            -top-40
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-500/10
            blur-[140px]
          "

        />


        <motion.div

          animate={{
            x:[0,-120,0],
            y:[0,90,0],
            scale:[1.1,0.9,1.1],
          }}

          transition={{
            duration:22,
            repeat:Infinity,
            ease:"easeInOut",
          }}

          className="
            absolute
            -right-40
            top-20
            h-[380px]
            w-[380px]
            rounded-full
            bg-violet-500/10
            blur-[140px]
          "

        />


      </div>
      
      <div
        className="
          relative
          z-10
        "
      >


        {/* Section Header */}

        <motion.div

          initial={{
            opacity:0,
            y:30,
          }}

          whileInView={{
            opacity:1,
            y:0,
          }}

          viewport={{
            once:true,
          }}

          transition={{
            duration:0.6,
          }}

          className="
            mx-auto
            max-w-3xl
            text-center
          "

        >

          <span
            className="
              inline-flex
              rounded-full
              border
              border-cyan-500/30
              bg-cyan-500/10
              px-5
              py-2
              text-sm
              font-bold
              uppercase
              tracking-widest
              text-cyan-300
            "
          >
            Why Choose Scholiqen
          </span>


          <h2
            className="
              mt-8
              text-4xl
              font-black
              leading-tight
              text-white
              md:text-6xl
            "
          >
            A smarter way to learn,
            grow and succeed
          </h2>


          <p
            className="
              mt-6
              text-lg
              leading-8
              text-slate-400
            "
          >
            Everything students need to learn,
            practice and improve in one powerful
            learning ecosystem.
          </p>


        </motion.div>





        {/* Feature Cards */}


        <div
          className="
            mt-16
            grid
            gap-6
            md:grid-cols-2
          "
        >

          {
            highlights.map(
              (item,index)=>{

                const Icon = item.icon;


                return (

                  <motion.div

                    key={item.title}


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
                      duration:0.5,
                      delay:index * 0.1,
                    }}


                    whileHover={{
                      y:-10,
                      scale:1.02,
                    }}


                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-800
                      bg-slate-900/70
                      p-8
                      backdrop-blur-xl
                    "

                  >


                    <div

                      className={`
                        absolute
                        inset-0
                        bg-gradient-to-br
                        ${item.gradient}
                        opacity-0
                        transition
                        duration-500
                        group-hover:opacity-100
                      `}

                    />


                    <div
                      className="
                        relative
                        z-10
                      "
                    >


                      <div
                        className="
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-2xl
                          bg-slate-800
                          border
                          border-slate-700
                          transition
                          duration-500
                          group-hover:rotate-6
                          group-hover:scale-110
                        "
                      >

                        <Icon
                          size={32}
                          className={item.iconColor}
                        />

                      </div>



                      <h3
                        className="
                          mt-8
                          text-2xl
                          font-black
                          text-white
                        "
                      >

                        {item.title}

                      </h3>



                      <p
                        className="
                          mt-4
                          leading-8
                          text-slate-400
                        "
                      >

                        {item.description}

                      </p>



                      <div
                        className="
                          mt-8
                          flex
                          items-center
                          gap-2
                          font-bold
                          text-cyan-400
                          opacity-0
                          transition
                          duration-500
                          group-hover:opacity-100
                        "
                      >

                        Learn More

                        <ArrowRight
                          size={18}
                        />

                      </div>


                    </div>


                  </motion.div>

                );

              }

            )
          }


        </div>
        
        {/* Learning Features */}

        <motion.div

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
            duration:0.6,
          }}

          className="
            mt-20
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-4
          "

        >

          {
            quickFeatures.map(
              (feature)=>{

                const Icon = feature.icon;


                return (

                  <motion.div

                    key={feature.title}

                    whileHover={{
                      y:-8,
                      scale:1.03,
                    }}

                    className="
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-900/70
                      p-5
                      backdrop-blur-xl
                    "

                  >

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-500/10
                      "
                    >

                      <Icon
                        size={24}
                        className="
                          text-cyan-400
                        "
                      />

                    </div>


                    <div>

                      <h4
                        className="
                          font-bold
                          text-white
                        "
                      >
                        {feature.title}
                      </h4>


                      <div
                        className="
                          mt-1
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-emerald-400
                        "
                      >

                        <CheckCircle2
                          size={14}
                        />

                        Available

                      </div>


                    </div>


                  </motion.div>

                );

              }

            )
          }


        </motion.div>





        {/* Main CTA */}


        <motion.div

          initial={{
            opacity:0,
            y:50,
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

          className="
            relative
            mt-24
            overflow-hidden
            rounded-[36px]
            border
            border-cyan-500/20
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-slate-950
            p-10
            lg:p-16
          "

        >


          <div
  className="
    absolute
    -left-24
    -top-24
    h-72
    w-72
    rounded-full
    bg-cyan-500/10
    blur-3xl
  "
/>


<div
  className="
    absolute
    -right-24
    -bottom-24
    h-72
    w-72
    rounded-full
    bg-violet-500/10
    blur-3xl
  "
/>


<div
  className="
    relative
    z-10
  "
>

  <span
    className="
      inline-flex
      rounded-full
      border
      border-cyan-500/30
      bg-cyan-500/10
      px-4
      py-2
      text-sm
      font-bold
      uppercase
      tracking-widest
      text-cyan-300
    "
  >
    Explore Learning Categories
  </span>


  <h2
    className="
      mt-6
      max-w-4xl
      text-4xl
      font-black
      leading-tight
      text-white
      lg:text-6xl
    "
  >
    Discover courses designed
    for every learning journey.
  </h2>


  <p
    className="
      mt-6
      max-w-3xl
      text-lg
      leading-8
      text-slate-400
    "
  >
    Explore different learning fields, discover
    new skills, access quality resources and
    find the right courses to help you grow
    academically and professionally.
  </p>


  <div
    className="
      mt-10
      text-lg
      font-black
      text-white
      drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]
    "
  >
    
  </div>

</div>


</motion.div>
        {/* Bottom Showcase Cards */}

        <motion.div

          initial={{
            opacity:0,
            y:50,
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

          className="
            mt-24
            grid
            gap-8
            lg:grid-cols-3
          "

        >


          <div
            className="
              rounded-[32px]
              border
              border-slate-800
              bg-slate-900/70
              p-10
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-cyan-500/10
              "
            >

              <GraduationCap
                size={34}
                className="text-cyan-400"
              />

            </div>


            <h3
              className="
                mt-8
                text-3xl
                font-black
                text-white
              "
            >

              Learn Anywhere

            </h3>


            <p
              className="
                mt-5
                leading-8
                text-slate-400
              "
            >

              Access lessons, resources and
              learning materials from anywhere
              with a seamless experience.

            </p>


          </div>





          <div
            className="
              rounded-[32px]
              border
              border-slate-800
              bg-slate-900/70
              p-10
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-violet-500/10
              "
            >

              <Brain
                size={34}
                className="text-violet-400"
              />

            </div>


            <h3
              className="
                mt-8
                text-3xl
                font-black
                text-white
              "
            >

              Study Smarter

            </h3>


            <p
              className="
                mt-5
                leading-8
                text-slate-400
              "
            >

              Improve understanding through
              interactive content, practice
              and personalized learning.

            </p>


          </div>





          <div
            className="
              rounded-[32px]
              bg-gradient-to-br
              from-cyan-500
              via-sky-500
              to-blue-600
              p-10
              text-slate-950
            "
          >

            <Rocket
              size={38}
            />


            <h3
              className="
                mt-8
                text-3xl
                font-black
              "
            >

              Ready To Begin?

            </h3>


            <p
              className="
                mt-5
                leading-8
                font-medium
              "
            >

              Start exploring courses, virtual
              labs, CBT practice and study
              materials today.

            </p>
<div
  className="
    mt-10
    inline-flex
    items-center
    rounded-2xl
    px-8
    py-4
    text-lg
    font-black
    text-white
    drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]
  "
>
  Go to Categories to Explore →
</div>
          </div>


        </motion.div>


      </div>


    </section>

  );

}