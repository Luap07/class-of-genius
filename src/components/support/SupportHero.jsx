import React from "react";
import { motion } from "framer-motion";
import {
  Headphones,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";


const SupportHero = () => {


  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-[40px]
        border
        border-slate-800
        bg-slate-900
        px-8
        py-16
        lg:px-16
      "
    >


      {/* BACKGROUND EFFECT */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-blue-600/10
          via-transparent
          to-cyan-500/10
        "
      />




      <div
        className="
          relative
          grid
          items-center
          gap-12
          lg:grid-cols-2
        "
      >



        {/* LEFT CONTENT */}

        <motion.div

          initial={{
            opacity:0,
            x:-40,
          }}

          animate={{
            opacity:1,
            x:0,
          }}

          transition={{
            duration:0.6,
          }}

        >


          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-500/20
              bg-blue-500/10
              px-5
              py-2
              text-sm
              font-semibold
              text-blue-400
            "
          >

            <ShieldCheck size={16}/>

            Scholiqen Help Center

          </div>





          <h1
            className="
              mt-6
              text-4xl
              font-black
              leading-tight
              lg:text-6xl
            "
          >

            How can we
            <span className="text-blue-500">
              {" "}help you?
            </span>

          </h1>





          <p
            className="
              mt-6
              max-w-xl
              text-lg
              leading-8
              text-slate-400
            "
          >

            Get support for courses, instructors,
            AI tools, accounts, payments, and
            your complete learning experience.

          </p>





          <div
            className="
              mt-8
              flex
              flex-wrap
              gap-4
            "
          >


            <a
              href="/support/contact"
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-blue-600
                px-7
                py-4
                font-bold
                transition
                hover:bg-blue-700
              "
            >

              Contact Support

              <ArrowRight size={18}/>

            </a>




            <a
              href="/support/faq"
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-slate-700
                bg-slate-950
                px-7
                py-4
                font-bold
                transition
                hover:border-blue-500
              "
            >

              View FAQ

            </a>


          </div>


        </motion.div>







        {/* RIGHT CARD */}

        <motion.div

          initial={{
            opacity:0,
            scale:0.8,
          }}

          animate={{
            opacity:1,
            scale:1,
          }}

          transition={{
            duration:0.6,
          }}

          className="
            flex
            justify-center
          "

        >


          <div
            className="
              relative
              flex
              h-72
              w-72
              items-center
              justify-center
              rounded-full
              border
              border-blue-500/20
              bg-blue-500/10
            "
          >


            <div
              className="
                flex
                h-44
                w-44
                items-center
                justify-center
                rounded-full
                bg-blue-600
                shadow-2xl
                shadow-blue-600/30
              "
            >

              <Headphones
                size={80}
                className="text-white"
              />

            </div>





            <motion.div

              animate={{
                y:[0,-12,0],
              }}

              transition={{
                duration:3,
                repeat:Infinity,
              }}

              className="
                absolute
                right-0
                top-10
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-700
                bg-slate-900
              "

            >

              <MessageCircle
                size={28}
                className="text-cyan-400"
              />

            </motion.div>



          </div>


        </motion.div>




      </div>


    </section>

  );

};


export default SupportHero;