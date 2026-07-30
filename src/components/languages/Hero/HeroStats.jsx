import React from "react";

import { motion } from "framer-motion";

import {
  Globe2,
  Brain,
  Mic2,
  Award,
} from "lucide-react";


const features = [
  {
    id: 1,
    icon: Globe2,
    title: "Worldwide Learning",
    description:
      "Discover languages from different regions of the world with immersive lessons, cultural insights and practical communication.",

    color: "text-cyan-400",

    bg: "from-cyan-500/20 to-blue-500/10",

    border: "border-cyan-500/20",
  },

  {
    id: 2,
    icon: Brain,
    title: "AI Language Coach",

    description:
      "Receive intelligent explanations, instant corrections and personalized learning recommendations while you study.",

    color: "text-violet-400",

    bg: "from-violet-500/20 to-indigo-500/10",

    border: "border-violet-500/20",
  },

  {
    id: 3,
    icon: Mic2,

    title: "Speaking Practice",

    description:
      "Train your pronunciation with interactive speaking activities designed to improve fluency and confidence.",

    color: "text-emerald-400",

    bg: "from-emerald-500/20 to-green-500/10",

    border: "border-emerald-500/20",
  },

  {
    id: 4,
    icon: Award,

    title: "Earn Certificates",

    description:
      "Complete language journeys, unlock achievements and build certificates that showcase your learning progress.",

    color: "text-yellow-400",

    bg: "from-yellow-500/20 to-orange-500/10",

    border: "border-yellow-500/20",
  },
];


export default function HeroStats() {

  return (

    <section
      className="
        relative
        mt-20
      "
    >

      <div
        className="
          absolute
          inset-0
          -z-10
          bg-gradient-to-r
          from-cyan-500/5
          via-transparent
          to-purple-500/5
          blur-3xl
        "
      />


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
          mb-12
          text-center
        "

      >

        <span
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-cyan-500/20
            bg-cyan-500/10
            px-5
            py-2
            text-sm
            font-bold
            text-cyan-300
          "
        >
          Why Learn With Scholiqen?
        </span>


        <h2
          className="
            mt-6
            text-5xl
            font-black
          "
        >

          Everything You Need

          <span
            className="
              block
              bg-gradient-to-r
              from-cyan-400
              to-blue-500
              bg-clip-text
              text-transparent
            "
          >
            To Master Languages
          </span>

        </h2>


        <p
          className="
            mx-auto
            mt-6
            max-w-3xl
            text-lg
            leading-8
            text-slate-400
          "
        >
          Learn with modern tools designed to help you speak,
          understand, read and write confidently through
          interactive experiences powered by AI.
        </p>


      </motion.div>



      <div
        className="
          grid
          gap-8
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        {features.map((feature,index)=>{

          const Icon = feature.icon;


          return (

            <motion.div

              key={feature.id}

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
                duration:0.45,
                delay:index * 0.1,
              }}

              whileHover={{
                y:-10,
              }}


              className={`
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                ${feature.border}
                bg-slate-900/70
                p-7
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-white/20
                hover:shadow-2xl
              `}

            >


              {/* COLOR OVERLAY */}

              <div

                className={`
                  absolute
                  inset-0
                  bg-gradient-to-br
                  ${feature.bg}
                  opacity-0
                  transition-opacity
                  duration-300
                  group-hover:opacity-100
                `}

              />



              <div
                className="
                  absolute
                  -right-10
                  -top-10
                  h-32
                  w-32
                  rounded-full
                  bg-white/5
                  blur-2xl
                "
              />



              <div
                className="
                  relative
                  z-10
                "
              >


                <motion.div

                  whileHover={{
                    rotate:12,
                    scale:1.08,
                  }}

                  transition={{
                    duration:0.25,
                  }}

                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/5
                  "

                >

                  <Icon
                    size={32}
                    className={feature.color}
                  />

                </motion.div>



                <h3
                  className="
                    mt-7
                    text-2xl
                    font-black
                    text-white
                  "
                >
                  {feature.title}
                </h3>



                <p
                  className="
                    mt-4
                    leading-7
                    text-slate-400
                  "
                >
                  {feature.description}
                </p>


              </div>


            </motion.div>

          );

        })}


      </div>


    </section>

  );

}