import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const faqs = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Open any course, click the Enroll button, and you'll immediately gain access to the course materials according to your enrollment type.",
  },

  {
    question: "Will I receive a certificate after completing a course?",
    answer:
      "Yes. Eligible courses award digital certificates after you complete all required lessons, weekly tasks, quizzes, and final assessments.",
  },

  {
    question: "Can I study on my phone, tablet, or computer?",
    answer:
      "Absolutely. Wonder is designed to work across desktop, tablet, and mobile devices so you can continue learning anywhere.",
  },

  {
    question: "Can universities upload their own courses?",
    answer:
      "Yes. Universities, schools, organizations, and verified instructors can publish and manage their own learning content through the instructor portal.",
  },

  {
    question: "Does Wonder include AI learning tools?",
    answer:
      "Yes. Wonder includes an AI Tutor, quiz generation, personalized study recommendations, intelligent explanations, and more AI-powered learning features.",
  },

  {
    question: "Can I download PDFs and learning resources?",
    answer:
      "If the instructor allows downloads, you'll be able to download PDFs, presentations, worksheets, and other learning resources directly from the course.",
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
              font-semibold
              text-white
            "
          >
            {item.question}
          </h3>


        </div>




        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
        >

          <ChevronDown
            className="text-slate-400"
          />

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
                text-slate-400
                leading-8
              "
            >

              {item.answer}

            </div>


          </motion.div>

        )}

      </AnimatePresence>


    </motion.div>

  );

};








const FAQ = () => {


  const [active,setActive] = useState(0);

  const navigate = useNavigate();



  return (

    <section
      className="
        space-y-12
      "
    >



      <div
        className="
          mx-auto
          max-w-3xl
          text-center
        "
      >


        <span
          className="
            inline-flex
            rounded-full
            border
            border-violet-500/20
            bg-violet-500/10
            px-4
            py-2
            text-sm
            font-semibold
            text-violet-400
          "
        >
          Frequently Asked Questions
        </span>




        <h2
          className="
            mt-5
            text-4xl
            font-extrabold
            text-white
          "
        >
          Have Questions?
        </h2>




        <p
          className="
            mt-4
            text-lg
            text-slate-400
          "
        >
          Everything you need to know about learning on Wonder.
        </p>



      </div>








      <div
        className="
          mx-auto
          max-w-5xl
          space-y-5
        "
      >


        {faqs.map((faq,index)=>(


          <FAQItem

            key={faq.question}

            item={faq}

            open={active === index}

            onClick={() =>
              setActive(
                active === index
                ? -1
                : index
              )
            }

          />


        ))}


      </div>








      <div
        className="
          rounded-[32px]
          bg-gradient-to-r
          from-blue-600
          via-cyan-500
          to-indigo-600
          p-10
          text-center
        "
      >



        <h3
          className="
            text-3xl
            font-extrabold
            text-white
          "
        >
          Still have questions?
        </h3>





        <p
          className="
            mt-4
            text-lg
            text-blue-100
          "
        >
          Our support team is ready to help you with your learning journey.
        </p>






        <button

          onClick={() => navigate("/support")}

          className="
            mt-8
            rounded-2xl
            bg-white
            px-8
            py-4
            font-bold
            text-slate-900
            transition
            hover:scale-105
          "

        >

          Contact Support

        </button>




      </div>



    </section>

  );

};



export default FAQ;