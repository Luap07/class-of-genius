import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  CalendarDays,
  Volume2,
  Sparkles,
  BookOpen,
  Globe,
  Heart,
  Languages,
  BadgeCheck,
  Bookmark,
} from "lucide-react";

import wordOfTheDay from "../../data/language/wordOfTheDay";


export default function WordOfTheDay() {

  const [saved, setSaved] = useState(false);


  const today = new Date();


  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) /
      (1000 * 60 * 60 * 24)
  );


  const word = useMemo(() => {

    if (!wordOfTheDay || wordOfTheDay.length === 0) {
      return null;
    }

    return wordOfTheDay[
      (dayOfYear - 1) % wordOfTheDay.length
    ];

  }, [dayOfYear]);


  if (!word) {

    return (
      <section className="min-h-screen bg-[#020617] flex items-center justify-center text-white">

        <h1 className="text-3xl font-black">
          No word available
        </h1>

      </section>
    );

  }



  const level =
    word.level ||
    word.difficulty ||
    "General";


  const partOfSpeech =
    word.partOfSpeech ||
    word.category ||
    "Word";


  const pronunciation =
    word.pronunciation ||
    word.transcription ||
    word.ipa ||
    "";



  const relatedWords =
    word.relatedWords ||
    word.related ||
    [];



  return (

    <section className="
      min-h-screen
      bg-[#020617]
      px-6
      py-12
      text-white
      lg:px-8
    ">


      <div className="
        mx-auto
        max-w-7xl
      ">



        {/* HERO */}


        <motion.div

          initial={{
            opacity:0,
            y:30
          }}

          animate={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:.5
          }}

          className="
            overflow-hidden
            rounded-[32px]
            border
            border-yellow-500/20
            bg-gradient-to-br
            from-yellow-500/20
            via-orange-500/10
            to-red-500/10
            p-10
          "

        >


          <div className="
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:items-center
            lg:justify-between
          ">



            <div className="
              flex
              items-center
              gap-5
            ">


              <div className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-yellow-500/20
              ">

                <CalendarDays
                  size={42}
                  className="text-yellow-400"
                />

              </div>



              <div>


                <span className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-yellow-500/20
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-yellow-300
                ">

                  <Sparkles size={15}/>

                  Today's Featured Word

                </span>



                <h1 className="
                  mt-5
                  text-5xl
                  font-black
                  lg:text-6xl
                ">

                  Word Of The Day

                </h1>



                <p className="
                  mt-4
                  max-w-3xl
                  leading-8
                  text-slate-300
                ">

                  Expand your vocabulary every day with carefully
                  selected words, pronunciation, meanings,
                  examples, synonyms and more.

                </p>


              </div>


            </div>





            <div className="
              rounded-3xl
              border
              border-white/10
              bg-black/20
              px-8
              py-6
              backdrop-blur-xl
            ">


              <p className="
                text-sm
                text-slate-400
              ">

                Today's Date

              </p>


              <h2 className="
                mt-2
                text-2xl
                font-black
              ">

                {today.toLocaleDateString(
                  "en-US",
                  {
                    weekday:"long",
                    month:"long",
                    day:"numeric"
                  }
                )}

              </h2>


            </div>


          </div>


        </motion.div>





        {/* WORD CARD */}



        <section className="mt-12">


          <motion.div

            whileHover={{
              y:-6
            }}

            className="
              rounded-[32px]
              border
              border-white/10
              bg-slate-900
              p-10
            "

          >



            <div className="
              flex
              flex-wrap
              items-start
              justify-between
              gap-8
            ">



              <div>



                <div className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                ">



                  <span className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-cyan-500/15
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-cyan-300
                  ">


                    <Globe size={16}/>

                    {word.language || "English"}


                  </span>





                  <span className="
                    rounded-full
                    bg-blue-500/15
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-blue-300
                  ">


                    <Languages
                      size={15}
                      className="inline mr-2"
                    />


                    {level}


                  </span>





                  <span className="
                    rounded-full
                    bg-purple-500/15
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-purple-300
                  ">


                    <BadgeCheck
                      size={15}
                      className="inline mr-2"
                    />


                    {partOfSpeech}


                  </span>


                </div>





                <h2 className="
                  mt-8
                  text-6xl
                  font-black
                ">


                  {word.word}


                </h2>



                <p className="
                  mt-4
                  text-2xl
                  font-medium
                  text-cyan-300
                ">


                  {word.ipa || word.transcription}


                </p>



                <p className="
                  mt-3
                  text-lg
                  text-purple-300
                ">


                  {pronunciation}


                </p>



              </div>





              <button

                onClick={() =>
                  setSaved(!saved)
                }

                className="
                  rounded-3xl
                  bg-white/10
                  p-5
                  transition
                  hover:bg-white/20
                "

              >

                <Heart

                  size={30}

                  className={
                    saved
                    ? "fill-red-500 text-red-500"
                    : "text-white"
                  }

                />

              </button>



            </div>
                        {/* ================= DETAILS ================= */}


            <div className="
              mt-10
              grid
              gap-6
              lg:grid-cols-2
            ">



              {/* MEANING */}


              <div className="
                rounded-3xl
                border
                border-white/10
                bg-black/30
                p-7
              ">


                <h3 className="
                  text-2xl
                  font-black
                ">

                  Meaning

                </h3>


                <p className="
                  mt-4
                  leading-8
                  text-slate-300
                ">

                  {word.meaning || "No meaning available."}

                </p>


              </div>





              {/* EXAMPLE */}


              <div className="
                rounded-3xl
                border
                border-white/10
                bg-black/30
                p-7
              ">


                <h3 className="
                  text-2xl
                  font-black
                ">

                  Example

                </h3>


                <p className="
                  mt-4
                  italic
                  leading-8
                  text-slate-300
                ">


                  "{word.example || "No example available."}"


                </p>


              </div>





              {/* PRONUNCIATION */}



              <div className="
                rounded-3xl
                border
                border-white/10
                bg-black/30
                p-7
              ">


                <h3 className="
                  text-2xl
                  font-black
                ">

                  Pronunciation

                </h3>



                <p className="
                  mt-4
                  text-xl
                  text-cyan-300
                ">

                  {pronunciation}

                </p>




                <button

                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-blue-600
                    px-6
                    py-3
                    font-bold
                    transition
                    hover:bg-blue-500
                  "

                >


                  <Volume2 size={20}/>


                  Listen Pronunciation


                </button>



              </div>







              {/* WORD INFORMATION */}



              <div className="
                rounded-3xl
                border
                border-white/10
                bg-black/30
                p-7
              ">



                <h3 className="
                  text-2xl
                  font-black
                ">

                  Word Information

                </h3>




                <div className="
                  mt-5
                  space-y-4
                ">




                  <div className="
                    flex
                    items-center
                    justify-between
                  ">


                    <span className="text-slate-400">

                      Language

                    </span>


                    <span className="font-semibold">

                      {word.language || "English"}

                    </span>


                  </div>





                  <div className="
                    flex
                    items-center
                    justify-between
                  ">


                    <span className="text-slate-400">

                      Level

                    </span>


                    <span className="font-semibold">

                      {level}

                    </span>


                  </div>





                  <div className="
                    flex
                    items-center
                    justify-between
                  ">


                    <span className="text-slate-400">

                      Part of Speech

                    </span>


                    <span className="font-semibold">

                      {partOfSpeech}

                    </span>


                  </div>




                  <div className="
                    flex
                    items-center
                    justify-between
                  ">


                    <span className="text-slate-400">

                      Category

                    </span>


                    <span className="font-semibold">

                      {word.category || "Vocabulary"}

                    </span>


                  </div>




                </div>



              </div>



            </div>
                        {/* ================= SYNONYMS ================= */}


            <div className="mt-10">


              <h3 className="
                text-2xl
                font-black
              ">

                Synonyms

              </h3>



              <div className="
                mt-5
                flex
                flex-wrap
                gap-3
              ">


                {(word.synonyms || []).map((item, index) => (

                  <span

                    key={index}

                    className="
                      rounded-full
                      border
                      border-cyan-500/20
                      bg-cyan-500/10
                      px-5
                      py-2
                      text-cyan-300
                    "

                  >

                    {item}

                  </span>


                ))}



                {(word.synonyms || []).length === 0 && (

                  <p className="text-slate-400">

                    No synonyms available.

                  </p>

                )}



              </div>


            </div>







            {/* ================= ANTONYMS ================= */}



            <div className="mt-10">



              <h3 className="
                text-2xl
                font-black
              ">

                Antonyms

              </h3>





              <div className="
                mt-5
                flex
                flex-wrap
                gap-3
              ">



                {(word.antonyms || []).map((item, index) => (


                  <span

                    key={index}

                    className="
                      rounded-full
                      border
                      border-rose-500/20
                      bg-rose-500/10
                      px-5
                      py-2
                      text-rose-300
                    "

                  >

                    {item}

                  </span>



                ))}





                {(word.antonyms || []).length === 0 && (

                  <p className="text-slate-400">

                    No antonyms available.

                  </p>

                )}



              </div>



            </div>





          </motion.div>


        </section>







        {/* ================= RELATED WORDS ================= */}



        <section className="mt-14">



          <h2 className="
            mb-8
            text-3xl
            font-black
          ">

            Related Words

          </h2>





          <div className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-4
          ">



            {relatedWords.map((item, index) => (



              <motion.div


                key={index}


                whileHover={{
                  y:-8
                }}


                className="
                  rounded-3xl
                  border
                  border-white/10
                  bg-slate-900
                  p-6
                "


              >




                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-500/10
                ">



                  <Bookmark

                    size={24}

                    className="text-cyan-400"

                  />


                </div>





                <h3 className="
                  mt-5
                  text-2xl
                  font-black
                ">


                  {item}


                </h3>





                <p className="
                  mt-2
                  text-slate-400
                ">


                  Related vocabulary


                </p>



              </motion.div>



            ))}




            {relatedWords.length === 0 && (

              <p className="text-slate-400">

                No related words available.

              </p>

            )}
          </div>
        </section>
                {/* ================= ETYMOLOGY ================= */}


        <section className="mt-14">


          <motion.div

            whileHover={{
              y:-5
            }}

            className="
              rounded-3xl
              border
              border-amber-500/20
              bg-gradient-to-br
              from-amber-500/10
              to-orange-500/10
              p-8
            "

          >



            <div className="
              flex
              items-center
              gap-4
            ">



              <div className="
                rounded-2xl
                bg-amber-500/20
                p-4
              ">


                <Sparkles

                  size={30}

                  className="text-amber-400"

                />


              </div>




              <div>


                <h2 className="
                  text-2xl
                  font-black
                ">

                  Etymology

                </h2>




                <p className="
                  mt-3
                  leading-8
                  text-slate-300
                ">


                  {word.etymology ||
                   word.origin ||
                   "No etymology information available."}


                </p>



              </div>



            </div>



          </motion.div>



        </section>







        {/* ================= DAILY GOAL ================= */}



        <section className="
          mt-14
          grid
          gap-6
          lg:grid-cols-2
        ">




          <motion.div


            whileHover={{
              y:-6
            }}


            className="
              rounded-3xl
              border
              border-white/10
              bg-gradient-to-br
              from-green-600/20
              to-cyan-600/20
              p-8
            "


          >




            <div className="
              flex
              items-center
              gap-4
            ">



              <div className="
                rounded-2xl
                bg-green-500/20
                p-4
              ">



                <BookOpen

                  size={30}

                  className="text-green-400"

                />


              </div>





              <div>


                <h3 className="
                  text-2xl
                  font-black
                ">


                  Daily Vocabulary Goal


                </h3>



                <p className="
                  mt-2
                  text-slate-300
                ">


                  Learn five new words every day to build your vocabulary.


                </p>


              </div>



            </div>





            <div className="
              mt-8
              h-3
              overflow-hidden
              rounded-full
              bg-black/40
            ">


              <div className="
                h-full
                w-[60%]
                rounded-full
                bg-green-500
              "/>


            </div>




            <p className="
              mt-4
              text-green-300
            ">


              3 / 5 words completed today


            </p>




          </motion.div>









          <motion.div


            whileHover={{
              y:-6
            }}


            className="
              rounded-3xl
              border
              border-white/10
              bg-gradient-to-br
              from-purple-600/20
              to-blue-600/20
              p-8
            "


          >




            <div className="
              flex
              items-center
              gap-4
            ">




              <div className="
                rounded-2xl
                bg-purple-500/20
                p-4
              ">



                <Sparkles

                  size={30}

                  className="text-purple-400"

                />


              </div>





              <div>


                <h3 className="
                  text-2xl
                  font-black
                ">


                  Word Challenge


                </h3>





                <p className="
                  mt-2
                  text-slate-300
                ">


                  Create your own sentence using today's word and improve retention.


                </p>


              </div>



            </div>





            <button

              className="
                mt-8
                rounded-2xl
                bg-purple-600
                px-6
                py-3
                font-bold
                transition
                hover:bg-purple-500
              "

            >


              Start Challenge


            </button>




          </motion.div>





        </section>
                {/* ================= FOOTER ================= */}


        <motion.div

          initial={{
            opacity:0,
            y:20
          }}

          whileInView={{
            opacity:1,
            y:0
          }}

          viewport={{
            once:true
          }}

          transition={{
            duration:.5
          }}

          className="
            mt-20
            overflow-hidden
            rounded-[32px]
            border
            border-white/10
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-slate-800
            p-10
            text-center
          "

        >




          <div className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
          ">


            <BookOpen

              size={38}

              className="text-white"

            />


          </div>





          <h2 className="
            mt-8
            text-4xl
            font-black
          ">


            One Word Every Day.


          </h2>





          <h3 className="
            mt-2
            bg-gradient-to-r
            from-cyan-400
            to-blue-500
            bg-clip-text
            text-4xl
            font-black
            text-transparent
          ">


            A Better Vocabulary Every Year.


          </h3>





          <p className="
            mx-auto
            mt-6
            max-w-3xl
            leading-8
            text-slate-400
          ">


            Consistency beats intensity. Learning just one carefully
            selected word every day strengthens your vocabulary,
            improves communication, enhances reading comprehension,
            and helps you speak with greater confidence over time.


          </p>





          <div className="
            mt-10
            flex
            flex-wrap
            justify-center
            gap-4
          ">




            <div className="
              rounded-full
              border
              border-cyan-500/20
              bg-cyan-500/10
              px-5
              py-3
              text-cyan-300
            ">


              📚 Learn Daily


            </div>





            <div className="
              rounded-full
              border
              border-green-500/20
              bg-green-500/10
              px-5
              py-3
              text-green-300
            ">


              🌍 Expand Vocabulary


            </div>





            <div className="
              rounded-full
              border
              border-purple-500/20
              bg-purple-500/10
              px-5
              py-3
              text-purple-300
            ">


              🚀 Speak Confidently


            </div>





          </div>





        </motion.div>





      </div>


    </section>


  );


}