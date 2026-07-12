import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";


const faqs = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Open any course, click the Enroll button, and you will immediately gain access to the course materials.",
  },

  {
    question: "Will I receive a certificate after completing a course?",
    answer:
      "Yes. Eligible courses provide digital certificates after completing required lessons, quizzes, tasks, and assessments.",
  },

  {
    question: "Can I learn on my phone or tablet?",
    answer:
      "Yes. Scholiqen works across desktop, tablet, and mobile devices.",
  },

  {
    question: "How can I become an instructor?",
    answer:
      "Visit the Become Instructor page and submit your instructor application for review.",
  },

  {
    question: "Does Scholiqen have AI learning tools?",
    answer:
      "Yes. Students can use AI Tutor, smart explanations, quiz generation, and personalized learning assistance.",
  },

  {
    question: "How do I contact support?",
    answer:
      "You can contact support through the Contact Support page, tickets, or live assistance.",
  },
];



const FAQItem = ({
  item,
  open,
  onClick,
}) => {


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

      <button
        onClick={onClick}
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

        <div className="flex items-center gap-4">


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



          <h3 className="font-bold text-white">
            {item.question}
          </h3>


        </div>



        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
        >

          <ChevronDown />

        </motion.div>


      </button>




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
          >

            <p
              className="
                px-6
                pb-6
                pl-[80px]
                leading-7
                text-slate-400
              "
            >

              {item.answer}

            </p>


          </motion.div>

        )}

      </AnimatePresence>


    </motion.div>

  );

};




const FAQ = () => {


  const [active,setActive] = useState(0);



  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        px-5
        py-16
        text-white
      "
    >

      <div className="mx-auto max-w-5xl">


        <div className="mb-12 text-center">


          <span
            className="
              rounded-full
              border
              border-blue-500/20
              bg-blue-500/10
              px-5
              py-2
              text-sm
              font-bold
              text-blue-400
            "
          >
            Help Center
          </span>



          <h1 className="
            mt-6
            text-5xl
            font-black
          ">
            Frequently Asked Questions
          </h1>



          <p className="
            mt-4
            text-lg
            text-slate-400
          ">
            Find answers about courses, instructors, AI tools, and your account.
          </p>


        </div>





        <div className="space-y-5">


          {faqs.map((item,index)=>(

            <FAQItem

              key={item.question}

              item={item}

              open={active === index}

              onClick={() =>
                setActive(
                  active === index ? -1 : index
                )
              }

            />

          ))}


        </div>





        <div
          className="
            mt-16
            rounded-[35px]
            bg-gradient-to-r
            from-blue-600
            via-cyan-500
            to-indigo-600
            p-10
            text-center
          "
        >

          <h2 className="
            text-3xl
            font-black
          ">
            Still need help?
          </h2>


          <p className="
            mt-3
            text-blue-100
          ">
            Our support team is ready to assist you.
          </p>



          <a
            href="/support/contact"
            className="
              mt-8
              inline-block
              rounded-2xl
              bg-white
              px-8
              py-4
              font-bold
              text-slate-900
            "
          >
            Contact Support
          </a>


        </div>



      </div>


    </div>

  );

};


export default FAQ;