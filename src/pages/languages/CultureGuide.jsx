import React from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  MapPin,
  Utensils,
  Music,
  Sparkles,
  Users,
} from "lucide-react";

import SectionHeader from "../../components/languages/Common/SectionHeader";



const cultures = [

  {
    id: 1,

    country: "Japan",

    flag: "🇯🇵",

    language: "Japanese",

    description:
      "Explore Japanese traditions, food, greetings, and social customs.",


    icon: "🎎",

    facts: [

      "Respect and politeness are important in communication.",

      "Japanese cuisine includes sushi, ramen, and tempura.",

      "Seasonal festivals are an important part of culture.",

    ],

  },



  {
    id: 2,

    country: "France",

    flag: "🇫🇷",

    language: "French",

    description:
      "Discover French art, food, history, and everyday expressions.",


    icon: "🥐",

    facts: [

      "French cuisine is famous worldwide.",

      "Greetings often include polite expressions.",

      "France has a rich history of art and literature.",

    ],

  },



  {
    id: 3,

    country: "Spain",

    flag: "🇪🇸",

    language: "Spanish",

    description:
      "Learn about Spanish celebrations, music, and lifestyle.",


    icon: "💃",

    facts: [

      "Spain is known for flamenco music and dance.",

      "Family gatherings are culturally important.",

      "Spanish cuisine includes tapas and paella.",

    ],

  },

];





const CultureGuide = () => {


  return (

    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">


      <div className="mx-auto max-w-6xl">



        <SectionHeader

          title="Culture Guide"

          description="Explore traditions, history, food, and lifestyles behind different languages."

        />





        {/* Hero */}

        <motion.div

          initial={{
            opacity:0,
            y:20,
          }}

          animate={{
            opacity:1,
            y:0,
          }}

          className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 p-8"

        >

          <div className="flex flex-col gap-6 md:flex-row md:items-center">


            <div className="rounded-3xl bg-white/10 p-5">

              <Globe2
                size={50}
                className="text-cyan-400"
              />

            </div>


            <div>

              <h1 className="text-4xl font-black">

                Language Through Culture 🌍

              </h1>


              <p className="mt-3 text-slate-300">

                Understanding culture helps you communicate naturally.

              </p>

            </div>


          </div>


        </motion.div>







        {/* Culture Cards */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">


          {cultures.map((culture,index)=>(


            <motion.div

              key={
                culture.id
              }

              initial={{
                opacity:0,
                y:20,
              }}

              animate={{
                opacity:1,
                y:0,
              }}

              transition={{
                delay:index * 0.1,
              }}

              className="rounded-3xl border border-white/10 bg-slate-900 p-6"

            >


              <div className="flex items-center justify-between">


                <span className="text-5xl">

                  {culture.flag}

                </span>


                <span className="text-4xl">

                  {culture.icon}

                </span>


              </div>




              <h2 className="mt-6 text-2xl font-black">

                {culture.country}

              </h2>


              <p className="text-cyan-400">

                {culture.language}

              </p>



              <p className="mt-3 text-sm text-slate-400">

                {culture.description}

              </p>






              <div className="mt-6 space-y-3">


                {culture.facts.map(
                  (fact)=>(

                    <div

                      key={fact}

                      className="flex gap-3 rounded-xl bg-black/20 p-3"

                    >

                      <Sparkles

                        size={18}

                        className="mt-1 text-yellow-400"

                      />


                      <p className="text-sm text-slate-300">

                        {fact}

                      </p>


                    </div>

                  )

                )}


              </div>



            </motion.div>


          ))}



        </div>







        {/* Features */}

        <div className="mt-12 grid gap-5 md:grid-cols-4">


          {[
            {
              icon: Utensils,
              title:"Food",
              text:"Discover traditional meals.",
            },

            {
              icon: Music,
              title:"Music",
              text:"Learn cultural sounds.",
            },

            {
              icon: Users,
              title:"People",
              text:"Understand communication styles.",
            },

            {
              icon: MapPin,
              title:"Places",
              text:"Explore countries.",
            },

          ].map(
            (item)=>{


              const Icon =
                item.icon;


              return (

                <div

                  key={
                    item.title
                  }

                  className="rounded-2xl border border-white/10 bg-slate-900 p-5"

                >

                  <Icon
                    className="text-cyan-400"
                  />


                  <h3 className="mt-3 font-black">

                    {item.title}

                  </h3>


                  <p className="text-sm text-slate-400">

                    {item.text}

                  </p>


                </div>

              );


            }

          )}


        </div>



      </div>


    </div>

  );

};


export default CultureGuide;