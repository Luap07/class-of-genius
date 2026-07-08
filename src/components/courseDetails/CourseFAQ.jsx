// src/components/courseDetails/CourseFAQ.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

const defaultFAQs = [
  {
    question: "Who can enroll in this course?",
    answer:
      "Anyone can enroll. Whether you're a secondary school student, university student, graduate, or professional looking to improve your skills, this course is designed to support learners at different levels.",
  },
  {
    question: "Do I receive a certificate after completing the course?",
    answer:
      "Yes. Once you successfully complete all required lessons, quizzes, assignments, and meet the course completion criteria, you'll receive a digital certificate that can be downloaded and shared.",
  },
  {
    question: "Can I learn at my own pace?",
    answer:
      "Absolutely. Wonder allows you to study whenever it is convenient for you. Your progress is automatically saved so you can continue from where you stopped.",
  },
  {
    question: "How do I track my progress?",
    answer:
      "Your dashboard automatically tracks completed lessons, quizzes, assignments, certificates, study streaks, and overall course completion percentage.",
  },
  {
    question: "Will I have access to the course forever?",
    answer:
      "Yes. After enrolling, you can revisit your learning materials anytime unless otherwise specified by your institution or organization.",
  },
  {
    question: "Can I ask questions while learning?",
    answer:
      "Yes. Wonder includes an AI Tutor that can explain concepts, answer questions, generate practice quizzes, and help you understand difficult topics instantly.",
  },
];

const CourseFAQ = ({ course }) => {
  const faqs =
    course?.faqs?.length > 0
      ? course.faqs
      : defaultFAQs;

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="space-y-8">

      {/* Heading */}

      <div>

        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">

          <HelpCircle size={18} />

          Frequently Asked Questions

        </div>

        <h2 className="mt-5 text-3xl font-bold text-white">
          Everything You Need to Know
        </h2>

        <p className="mt-3 max-w-3xl text-slate-400">
          Here are some common questions learners ask before
          enrolling in this course.
        </p>

      </div>

      {/* FAQ List */}

      <div className="space-y-4">

        {faqs.map((faq, index) => {

          const expanded = openIndex === index;

          return (
            <motion.div
              key={index}
              layout
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
            >

              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between px-7 py-6 text-left"
              >

                <h3 className="text-lg font-semibold text-white">
                  {faq.question}
                </h3>

                {expanded ? (
                  <ChevronUp
                    className="text-blue-400"
                    size={22}
                  />
                ) : (
                  <ChevronDown
                    className="text-slate-400"
                    size={22}
                  />
                )}

              </button>

              <AnimatePresence>

                {expanded && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >

                    <div className="border-t border-slate-800 px-7 pb-6 pt-5">

                      <p className="leading-8 text-slate-400">
                        {faq.answer}
                      </p>

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>

            </motion.div>
          );

        })}

      </div>

      {/* Bottom CTA */}

      <motion.div
        whileHover={{
          scale: 1.01,
        }}
        className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 p-8"
      >

        <h3 className="text-2xl font-bold text-white">
          Still Have Questions?
        </h3>

        <p className="mt-3 max-w-2xl text-slate-400">
          Our AI Tutor is available 24/7 to answer questions,
          explain concepts, recommend study materials, and help
          you succeed throughout your learning journey.
        </p>

        <button
          className="mt-6 rounded-2xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Ask AI Tutor
        </button>

      </motion.div>

    </section>
  );
};

export default CourseFAQ;