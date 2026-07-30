import React, {
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Search,
  Languages,
  BookOpen,
  GraduationCap,
} from "lucide-react";


import SearchBar from "../../components/languages/Common/SearchBar";

import LanguageCard from "../../components/languages/Cards/LanguageCard";

import {
  languages,
} from "../../data/languages";





const LanguageSearch = () => {


  const [query, setQuery] =
    useState("");



  const [category, setCategory] =
    useState("All");





  const categories = [

    "All",

    "Beginner",

    "Intermediate",

    "Advanced",

  ];







  const filteredLanguages =
    useMemo(() => {


      return languages.filter(
        (language) => {


          const matchesSearch =
            language.name
              .toLowerCase()
              .includes(
                query.toLowerCase()
              );



          const matchesCategory =
            category === "All" ||
            language.level === category;



          return (
            matchesSearch &&
            matchesCategory
          );


        }

      );


    }, [
      query,
      category,
    ]);








  return (

    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">


      <div className="mx-auto max-w-6xl">





        {/* Header */}


        <motion.div

          initial={{
            opacity:0,
            y:20,
          }}

          animate={{
            opacity:1,
            y:0,
          }}

          className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 p-8"

        >

          <div className="flex items-center gap-5">


            <div className="rounded-2xl bg-cyan-500/20 p-4">

              <Search

                size={40}

                className="text-cyan-400"

              />

            </div>



            <div>


              <h1 className="text-4xl font-black">

                Explore Languages

              </h1>


              <p className="mt-2 text-slate-400">

                Find your next language to learn.

              </p>


            </div>


          </div>


        </motion.div>







        {/* Search */}


        <SearchBar

          value={query}

          onChange={
            (e)=>
              setQuery(
                e.target.value
              )
          }

          placeholder="Search a language..."

        />








        {/* Filters */}


        <div className="mt-6 flex flex-wrap gap-3">


          {categories.map(
            (item)=>(


              <button


                key={item}


                onClick={()=>
                  setCategory(
                    item
                  )
                }


                className={`rounded-full px-5 py-2 font-bold transition ${
                  
                  category === item

                    ? "bg-cyan-600 text-white"

                    : "bg-slate-900 text-slate-400 border border-white/10"

                }`}


              >

                {item}


              </button>


            )

          )}


        </div>









        {/* Stats */}


        <div className="mt-10 grid gap-5 md:grid-cols-3">


          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <Languages

              className="text-cyan-400"

            />


            <h3 className="mt-3 text-2xl font-black">

              {languages.length}

            </h3>


            <p className="text-slate-400">

              Languages Available

            </p>


          </div>





          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <BookOpen

              className="text-purple-400"

            />


            <h3 className="mt-3 text-2xl font-black">

              1000+

            </h3>


            <p className="text-slate-400">

              Lessons

            </p>


          </div>






          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">


            <GraduationCap

              className="text-green-400"

            />


            <h3 className="mt-3 text-2xl font-black">

              2M+

            </h3>


            <p className="text-slate-400">

              Learners

            </p>


          </div>


        </div>








        {/* Results */}


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">


          {filteredLanguages.map(
            (language)=>(

              <LanguageCard

                key={
                  language.id
                }

                language={
                  language
                }

              />

            )

          )}


        </div>







        {filteredLanguages.length === 0 && (

          <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">


            <h2 className="text-2xl font-black">

              No languages found

            </h2>


            <p className="mt-2 text-slate-400">

              Try another search.

            </p>


          </div>

        )}



      </div>


    </div>

  );

};


export default LanguageSearch;