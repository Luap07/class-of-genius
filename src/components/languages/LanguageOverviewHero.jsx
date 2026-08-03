import React from "react";
import Cog from "../../assets/cog.png";


export default function LanguageOverviewHero({
  language,
}) {

  return (

    <section className="
      relative
      overflow-hidden
      border-b
      border-white/10
    ">


      <img
        src={
          language?.image_url ||
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
        }
        alt={language?.name}
        className="
          h-[520px]
          w-full
          object-cover
        "
      />


      {/* dark overlay */}

      <div className="
        absolute
        inset-0
        bg-black/60
      "/>



      <div className="
        absolute
        inset-0
        bg-gradient-to-t
        from-[#020617]
        via-[#020617]/40
        to-transparent
      "/>



      <div className="
        absolute
        inset-0
        flex
        flex-col
        items-center
        justify-center
        px-6
        text-center
      ">


        {/* SCHOLIQEN LOGO */}

        <div className="
          flex
          h-28
          w-28
          items-center
          justify-center
          rounded-3xl
          border
          border-white/20
          bg-white/10
          backdrop-blur-xl
        ">

          <img
            src={Cog}
            alt="Scholiqen"
            className="
              h-20
              w-20
              object-contain
            "
          />

        </div>



        <p className="
          mt-8
          text-sm
          font-bold
          uppercase
          tracking-[0.5em]
          text-cyan-300
        ">
          Scholiqen Language Academy
        </p>



        <h1 className="
          mt-5
          text-5xl
          font-black
          text-white
          lg:text-7xl
        ">
          {language?.name}
        </h1>



        {language?.native_name && (

          <p className="
            mt-4
            text-2xl
            font-semibold
            text-blue-400
          ">
            {language.native_name}
          </p>

        )}



        <p className="
          mt-6
          max-w-3xl
          text-lg
          leading-8
          text-slate-200
        ">
          Learn {language?.name} through interactive lessons,
          vocabulary, grammar, speaking practice and AI learning.
        </p>


      </div>


    </section>

  );

}