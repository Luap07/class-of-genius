import React from "react";

import Cog from "../../assets/cog.png";

import LanguageHero from "../../components/languages/Hero/LanguageHero";
import HeroSearch from "../../components/languages/Hero/HeroSearch";
import HeroStats from "../../components/languages/Hero/HeroStats";

import LanguageExplore from "./LanguageExplore";
import WordOfTheDay from "./WordOfTheDay";
import Dictionary from "./Dictionary";
import Translator from "./Translator";
import Vocabulary from "./Vocabulary";
import Grammar from "./Grammar";
import Phrasebook from "./Phrasebook";
import Flashcards from "./Flashcards";
import LanguageChallenges from "./LanguageChallenges";
import LanguageGames from "./LanguageGames";
import Listening from "./Listening";
import Reading from "./Reading";
import Writing from "./Writing";
import Pronunciation from "./Pronunciation";


export default function LanguagesHome() {

  return (

    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#020617]
        text-white
      "
    >


      {/* =========================
          BACKGROUND EFFECTS
      ========================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
      >


        {/* Cyan Glow */}

        <div
          className="
            absolute
            -left-40
            top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-500/20
            blur-[150px]
          "
        />


        {/* Purple Glow */}

        <div
          className="
            absolute
            right-[-150px]
            top-20
            h-[500px]
            w-[500px]
            rounded-full
            bg-purple-500/20
            blur-[150px]
          "
        />



        {/* Blue Bottom Glow */}

        <div
          className="
            absolute
            bottom-0
            left-1/3
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue-500/10
            blur-[140px]
          "
        />



        {/* Dotted Background */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.08]
            bg-[radial-gradient(circle,_white_1px,transparent_1px)]
            [background-size:32px_32px]
          "
        />


      </div>





      {/* =========================
          HEADER
      ========================== */}


      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-50
          border-b
          border-white/10
          bg-[#020617]/70
          backdrop-blur-xl
        "
      >


        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-6
            py-4
          "
        >


          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <img
              src={Cog}
              alt="Scholiqen"
              className="
                h-10
                w-10
              "
            />


            <span
              className="
                text-2xl
                font-black
              "
            >
              Scholiqen
            </span>


          </div>





          <nav
            className="
              hidden
              gap-8
              md:flex
            "
          >

            <a
              href="/dashboard"
              className="
                text-slate-300
                transition
                hover:text-cyan-400
              "
            >
              Dashboard
            </a>


            <a
              href="/languages"
              className="
                font-bold
                text-cyan-400
              "
            >
              Languages
            </a>


          </nav>


        </div>


      </header>







      {/* =========================
          PAGE CONTENT
      ========================== */}


      <div
        className="
          pt-24
        "
      >



        {/* Learning Hero */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-6
            pt-8
          "
        >

          <LanguageHero />

        </section>







        {/* Language Sections */}

        <div
          className="
            mx-auto
            max-w-7xl
            space-y-24
            px-6
            py-20
          "
        >


          <HeroSearch />


          <HeroStats />


          <LanguageExplore />


          <WordOfTheDay />


          <Dictionary />


          <Translator />


          <Vocabulary />


          <Grammar />


          <Phrasebook />


          <Flashcards />


          <Listening />


          <Reading />


          <Writing />


          <Pronunciation />


          <LanguageChallenges />


          <LanguageGames />



        </div>


      </div>








      {/* =========================
          FOOTER
      ========================== */}


      <footer
        className="
          border-t
          border-white/10
          bg-black/20
          py-10
        "
      >


        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            items-center
            justify-between
            gap-6
            px-6
            md:flex-row
          "
        >



          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <img
              src={Cog}
              alt="Scholiqen"
              className="
                h-8
                w-8
              "
            />


            <span
              className="
                font-black
              "
            >
              Scholiqen
            </span>


          </div>





          <p
            className="
              text-sm
              text-slate-400
            "
          >
            Learn smarter. Build your future.
          </p>



        </div>


      </footer>



    </main>

  );

}