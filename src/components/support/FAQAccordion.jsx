import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";


const FAQAccordion = ({
  question,
  answer,
  defaultOpen = false,
}) => {


  const [open, setOpen] = useState(defaultOpen);



  return (

    <motion.div
      layout
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
      "
    >


      {/* QUESTION */}

      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          w-full
          items-center
          justify-between
          gap-5
          p-6
          text-left
        "
      >


        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-blue-500/10
            "
          >

            <HelpCircle
              size={22}
              className="text-blue-400"
            />

          </div>



          <h3
            className="
              text-lg
              font-bold
              text-white
            "
          >
            {question}
          </h3>


        </div>





        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
          transition={{
            duration:0.2,
          }}
        >

          <ChevronDown
            className="text-slate-400"
          />

        </motion.div>



      </button>







      {/* ANSWER */}

      <AnimatePresence>


        {open && (

          <motion.div

            initial={{
              height:0,
              opacity:0,
            }}

            animate={{
              height:"auto",
              opacity:1,
            }}

            exit={{
              height:0,
              opacity:0,
            }}

            transition={{
              duration:0.25,
            }}

          >

            <div
              className="
                border-t
                border-slate-800
                px-6
                pb-6
                pt-5
                pl-[80px]
                leading-7
                text-slate-400
              "
            >

              {answer}

            </div>


          </motion.div>

        )}


      </AnimatePresence>


    </motion.div>

  );

};



export default FAQAccordion;