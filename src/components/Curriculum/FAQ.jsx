import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const faqs = [
  {
    question: "What is the Global Curriculum Platform?",
    answer:
      "It is an education platform that brings together curricula from different countries, allowing students, teachers, and schools to access structured learning resources in one place.",
  },
  {
    question: "Which countries are supported?",
    answer:
      "The platform is designed to support multiple national and international curricula. Additional curricula can be added over time.",
  },
  {
    question: "Can I compare different curricula?",
    answer:
      "Yes. You can explore different curriculum frameworks, compare subjects, learning outcomes, and educational levels.",
  },
  {
    question: "Does the platform include AI learning tools?",
    answer:
      "Yes. AI-powered features can help explain concepts, answer questions, generate quizzes, and recommend study materials.",
  },
  {
    question: "Are virtual laboratories available?",
    answer:
      "Yes. Interactive virtual labs allow learners to perform science experiments in a safe digital environment.",
  },
  {
    question: "Can teachers use this platform?",
    answer:
      "Yes. Teachers can explore curriculum frameworks, access lesson resources, and support students with structured learning materials.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="mt-24">

      <div className="text-center mb-14">

        <span className="uppercase tracking-[5px] text-cyan-400 font-semibold">

          FAQ

        </span>

        <h2 className="mt-4 text-5xl font-black text-white">

          Frequently Asked Questions

        </h2>

        <p className="text-slate-400 mt-5 max-w-3xl mx-auto">

          Everything you need to know about the Global Curriculum Platform.

        </p>

      </div>

      <div className="max-w-5xl mx-auto space-y-5">

        {faqs.map((item, index) => {

          const active = open === index;

          return (

            <div
              key={item.question}
              className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden"
            >

              <button
                onClick={() =>
                  setOpen(active ? -1 : index)
                }
                className="w-full flex items-center justify-between px-8 py-6 text-left"
              >

                <h3 className="text-lg font-semibold text-white">

                  {item.question}

                </h3>

                {active ? (
                  <ChevronUp className="text-cyan-400" />
                ) : (
                  <ChevronDown className="text-slate-400" />
                )}

              </button>

              {active && (

                <div className="px-8 pb-6">

                  <p className="text-slate-400 leading-8">

                    {item.answer}

                  </p>

                </div>

              )}

            </div>

          );

        })}

      </div>

    </section>
  );
};

export default FAQ;