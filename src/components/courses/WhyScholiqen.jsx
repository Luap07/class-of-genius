import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  FlaskConical,
  Award,
  Users,
  Sparkles,
} from "lucide-react";


const features = [
  {
    icon: Brain,
    title: "AI Tutor",
    text:
      "Receive instant explanations, study guidance and personalized assistance 24/7.",
  },

  {
    icon: FlaskConical,
    title: "Virtual Labs",
    text:
      "Practice real Physics, Chemistry and Biology experiments online.",
  },

  {
    icon: Award,
    title: "Certificates",
    text:
      "Earn professional certificates after successfully completing courses.",
  },

  {
    icon: Users,
    title: "Community",
    text:
      "Learn together with thousands of students and experienced instructors.",
  },
];


export default function WhyScholiqen() {

  return (

    <motion.section

      initial={{
        opacity: 0,
        y: 40,
      }}

      whileInView={{
        opacity: 1,
        y: 0,
      }}

      viewport={{
        once: true,
      }}

      transition={{
        duration: 0.7,
      }}

      className="mt-28"

    >

      {/* Header */}

      <div className="text-center">


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

          <Sparkles
            size={18}
            className="text-cyan-400"
          />

          <span className="font-semibold text-cyan-300">
            Why Scholiqen?
          </span>

        </div>


        <h2
          className="
            mt-8
            text-4xl
            font-black
            lg:text-5xl
          "
        >

          More Than Just Courses

        </h2>


        <p
          className="
            mx-auto
            mt-6
            max-w-3xl
            text-lg
            leading-9
            text-slate-400
          "
        >

          Learn through AI tutors, immersive virtual
          laboratories, practical projects, quizzes,
          assignments and structured learning paths.

        </p>


      </div>



      {/* Cards */}

      <div
        className="
          mt-16
          grid
          gap-8
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        {features.map((item)=>{

          const Icon = item.icon;


          return (

            <motion.div

              key={item.title}

              whileHover={{
                y:-8,
                scale:1.02,
              }}

              className="
                rounded-3xl
                border
                border-slate-800
                bg-slate-900/70
                p-8
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

                <Icon
                  size={30}
                  className="text-cyan-400"
                />

              </div>


              <h3
                className="
                  mt-6
                  text-2xl
                  font-bold
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

                {item.text}

              </p>


            </motion.div>

          );


        })}


      </div>


    </motion.section>

  );

}