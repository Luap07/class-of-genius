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
      "Open any course, click the Enroll button, and you'll immediately gain access to the course materials according to your enrollment type.",
  },
  {
    question: "Will I receive a certificate after completing a course?",
    answer:
      "Yes. Eligible courses award digital certificates after you complete all required lessons, quizzes, weeklytasks, and final assessments.",
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

const FAQItem = ({ item, open, onClick }) => {
  return (
    <motion.div
      layout
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        overflow-hidden
      "
    >
      <button
        onClick={onClick}
        className="
          w-full
          flex
          items-center
          justify-between
          p-6
          text-left
        "
      >
        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-blue-500/10
              flex
              items-center
              justify-center
            "
          >
            <HelpCircle
              className="text-blue-400"
              size={22}
            />
          </div>

          <h3 className="text-lg font-semibold">
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
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="px-6 pb-6 pl-22 text-slate-400 leading-8">
              {item.answer}
            </div>
          </motion.div>

        )}

      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="space-y-12">

      <div className="max-w-3xl mx-auto text-center">

        <span
          className="
            inline-flex
            px-4
            py-2
            rounded-full
            bg-violet-500/10
            border
            border-violet-500/20
            text-violet-400
            text-sm
            font-semibold
          "
        >
          Frequently Asked Questions
        </span>

        <h2 className="mt-5 text-4xl font-extrabold">
          Have Questions?
        </h2>

        <p className="mt-4 text-lg text-slate-400">
          Everything you need to know about learning on Wonder.
        </p>

      </div>

      <div className="max-w-5xl mx-auto space-y-5">

        {faqs.map((faq, index) => (

          <FAQItem
            key={faq.question}
            item={faq}
            open={active === index}
            onClick={() =>
              setActive(active === index ? -1 : index)
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

        <h3 className="text-3xl font-extrabold">
          Still have questions?
        </h3>

        <p className="mt-4 text-blue-100 text-lg">
          Our support team is ready to help you with your learning journey.
        </p>

        <button
          className="
            mt-8
            rounded-2xl
            bg-white
            text-slate-900
            px-8
            py-4
            font-bold
            hover:scale-105
            transition
          "
        >
          Contact Support
        </button>

      </div>

    </section>
  );
};

export default FAQ;