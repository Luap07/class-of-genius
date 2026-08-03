// src/pages/languages/Grammar.jsx

import React, {
  useMemo,
  useState,
} from "react";
import { supabase } from "../../lib/supabaseClient";
import { useEffect } from "react";
import { motion } from "framer-motion";

import {
  BookOpen,
  Search,
  Brain,
  CheckCircle2,
  Circle,
  Sparkles,
  Filter,
  GraduationCap,
  Languages,
  ArrowRight,
  Bot,
} from "lucide-react";

const [grammarLessons,setGrammarLessons] = useState([]);
const [loading,setLoading] = useState(true);
const grammarRules = [
  {
    id: 1,
    title: "Present Simple",
    explanation:
      "Use the present simple to talk about habits, routines, and facts.",
    example:
      "I study English every day.",
  },
  {
    id: 2,
    title: "Past Simple",
    explanation:
      "Use the past simple for actions that started and finished in the past.",
    example:
      "She visited London last year.",
  },
  {
    id: 3,
    title: "Future Tense",
    explanation:
      "Use future tense to talk about plans, predictions, and upcoming events.",
    example:
      "I will learn Spanish tomorrow.",
  },
  {
    id: 4,
    title: "Articles",
    explanation:
      "Articles help identify nouns using a, an, and the.",
    example:
      "I bought a book.",
  },
  {
    id: 5,
    title: "Subject Verb Agreement",
    explanation:
      "The subject and verb must match in number.",
    example:
      "She plays football.",
  },
];

const mistakes = [
  {
    id: 1,
    wrong: "She go to school every day.",
    correct: "She goes to school every day.",
  },
  {
    id: 2,
    wrong: "I am agree with you.",
    correct: "I agree with you.",
  },
  {
    id: 3,
    wrong: "He doesn't knows the answer.",
    correct: "He doesn't know the answer.",
  },
];

const Grammar = () => {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");

  const filteredLessons = useMemo(() => {
    return grammarLessons.filter((lesson) => {
      const matchSearch =
        lesson.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        lesson.language
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchLevel =
        level === "All"
          ? true
          : lesson.level === level;

      return matchSearch && matchLevel;
    });
  }, [search, level]);

  const completed =
    grammarLessons.filter(
      lesson => lesson.completed
    ).length;

  const progress =
    Math.round(
      (completed / grammarLessons.length) * 100
    );

  return (
    <section className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* HERO */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            rounded-3xl
            border
            border-slate-800
            bg-gradient-to-r
            from-cyan-600/20
            via-blue-600/20
            to-indigo-600/20
            p-10
          "
        >
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3">
                <GraduationCap
                  className="text-cyan-400"
                  size={38}
                />
                <h1 className="text-5xl font-black">
                  Grammar Academy
                </h1>
              </div>
              <p className="mt-6 max-w-3xl text-slate-300 leading-8">
                Learn grammar with AI explanations,
                interactive lessons,
                real-world examples,
                quizzes,
                pronunciation
                and personalized practice.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-8">
              <p className="text-slate-400">
                Overall Progress
              </p>
              <h2 className="mt-3 text-5xl font-black">
                {progress}%
              </h2>
            </div>
          </div>
        </motion.div>

        {/* SEARCH & FILTERS */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="
            mt-10
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div
            className="
              flex
              flex-1
              items-center
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              px-5
              py-4
            "
          >
            <Search
              size={20}
              className="text-slate-400"
            />
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search grammar lessons..."
              className="
                ml-4
                w-full
                bg-transparent
                outline-none
                placeholder:text-slate-500
              "
            />
          </div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Filter
              className="text-cyan-400"
              size={18}
            />
            <select
              value={level}
              onChange={(e) =>
                setLevel(e.target.value)
              }
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                px-4
                py-3
                outline-none
              "
            >
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </motion.div>

        {/* AI GRAMMAR TIP */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="
            mt-10
            rounded-3xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            p-8
          "
        >
          <div className="flex items-center gap-4">
            <Brain
              className="text-cyan-400"
              size={36}
            />
            <div>
              <h2 className="text-2xl font-black">
                AI Grammar Coach
              </h2>
              <p className="mt-2 text-slate-300">
                Learn why a sentence is correct,
                discover grammar rules,
                fix mistakes instantly,
                and receive detailed AI explanations.
              </p>
            </div>
          </div>
        </motion.div>

        {/* LESSONS */}
        <div
          className="
            mt-10
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filteredLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              whileHover={{
                y: -6,
              }}
              className="
                rounded-3xl
                border
                border-slate-800
                bg-slate-900
                p-6
              "
            >
              <div className="flex items-center justify-between">
                <BookOpen
                  className="text-cyan-400"
                />
                <span
                  className="
                    rounded-full
                    bg-blue-500/20
                    px-3
                    py-1
                    text-xs
                    text-blue-300
                  "
                >
                  {lesson.level}
                </span>
              </div>
              <h2
                className="
                  mt-5
                  text-2xl
                  font-black
                "
              >
                {lesson.title}
              </h2>
              <p
                className="
                  mt-2
                  text-cyan-300
                "
              >
                {lesson.language}
              </p>
              <p
                className="
                  mt-4
                  leading-7
                  text-slate-400
                "
              >
                {lesson.description}
              </p>
              <div
                className="
                  mt-8
                  flex
                  items-center
                  justify-between
                "
              >
                <button
                  className="
                    rounded-xl
                    bg-cyan-600
                    px-5
                    py-3
                    font-bold
                  "
                >
                  Start Lesson
                </button>
                {lesson.completed ? (
                  <CheckCircle2
                    className="text-green-400"
                  />
                ) : (
                  <Circle
                    className="text-slate-500"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* GRAMMAR RULES SECTION */}
        <section
          className="
            mt-16
          "
        >
          <div
            className="
              mb-8
            "
          >
            <h2
              className="
                text-3xl
                font-black
              "
            >
              Grammar Rules
            </h2>
            <p
              className="
                mt-3
                text-slate-400
              "
            >
              Understand the rules behind every sentence.
            </p>
          </div>

          <div
            className="
              grid
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {
              grammarRules.map((rule)=>(
                <motion.div
                  key={rule.id}
                  whileHover={{
                    scale:1.03
                  }}
                  className="
                    rounded-3xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-6
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <Languages
                      size={24}
                      className="text-purple-400"
                    />
                    <h3
                      className="
                        text-xl
                        font-black
                      "
                    >
                      {rule.title}
                    </h3>
                  </div>

                  <p
                    className="
                      mt-4
                      leading-7
                      text-slate-400
                    "
                  >
                    {rule.explanation}
                  </p>

                  <div
                    className="
                      mt-5
                      rounded-xl
                      bg-black/30
                      p-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        text-cyan-300
                      "
                    >
                      Example
                    </p>

                    <p
                      className="
                        mt-2
                        italic
                        text-white
                      "
                    >
                      "{rule.example}"
                    </p>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </section>

        {/* COMMON MISTAKES */}
        <section
          className="
            mt-20
          "
        >
          <div
            className="
              mb-8
            "
          >
            <h2
              className="
                text-3xl
                font-black
              "
            >
              Common Grammar Mistakes
            </h2>
            <p
              className="
                mt-3
                text-slate-400
              "
            >
              Learn mistakes learners usually make and how to fix them.
            </p>
          </div>

          <div
            className="
              space-y-5
            "
          >
            {
              mistakes.map((item)=>(
                <motion.div
                  key={item.id}
                  whileHover={{
                    x:8
                  }}
                  className="
                    rounded-2xl
                    border
                    border-red-500/20
                    bg-red-500/10
                    p-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      md:flex-row
                      md:items-center
                      md:justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-red-300
                          font-bold
                        "
                      >
                        Wrong:
                      </p>
                      <p
                        className="
                          mt-2
                          text-white
                        "
                      >
                        {item.wrong}
                      </p>
                    </div>

                    <ArrowRight
                      className="
                        hidden
                        text-cyan-400
                        md:block
                      "
                    />

                    <div>
                      <p
                        className="
                          text-green-300
                          font-bold
                        "
                      >
                        Correct:
                      </p>
                      <p
                        className="
                          mt-2
                          text-white
                        "
                      >
                        {item.correct}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </section>

        {/* SENTENCE BUILDER */}
        <section
          className="
            mt-20
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-blue-500/20
              bg-gradient-to-br
              from-blue-500/10
              to-indigo-500/10
              p-8
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <Sparkles
                size={35}
                className="text-blue-400"
              />
              <div>
                <h2
                  className="
                    text-3xl
                    font-black
                  "
                >
                  Sentence Builder
                </h2>
                <p
                  className="
                    mt-2
                    text-slate-300
                  "
                >
                  Practice creating correct sentences with AI guidance.
                </p>
              </div>
            </div>

            <div
              className="
                mt-8
                grid
                gap-5
                md:grid-cols-3
              "
            >
              <div
                className="
                  rounded-2xl
                  bg-slate-950/50
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Subject
                </p>
                <p
                  className="
                    mt-2
                    font-bold
                  "
                >
                  The student
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-slate-950/50
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Verb
                </p>
                <p
                  className="
                    mt-2
                    font-bold
                  "
                >
                  studies
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  bg-slate-950/50
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  Object
                </p>
                <p
                  className="
                    mt-2
                    font-bold
                  "
                >
                  English grammar
                </p>
              </div>
            </div>

            <button
              className="
                mt-8
                rounded-xl
                bg-blue-600
                px-7
                py-3
                font-black
                transition
                hover:bg-blue-500
              "
            >
              Generate Sentence
            </button>
          </div>
        </section>

        {/* AI PRACTICE AREA */}
        <section
          className="
            mt-20
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
              mb-8
            "
          >
            <Bot
              size={35}
              className="
                text-cyan-400
              "
            />
            <div>
              <h2
                className="
                  text-3xl
                  font-black
                "
              >
                AI Grammar Practice
              </h2>
              <p
                className="
                  mt-2
                  text-slate-400
                "
              >
                Chat with AI and improve your grammar mistakes instantly.
              </p>
            </div>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-8
            "
          >
            <div
              className="
                space-y-5
              "
            >
              <div
                className="
                  rounded-2xl
                  bg-slate-800
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    text-cyan-300
                  "
                >
                  AI
                </p>
                <p
                  className="
                    mt-2
                    text-slate-200
                  "
                >
                  Write a sentence and I will explain the grammar,
                  vocabulary and corrections.
                </p>
              </div>

              <textarea
                placeholder="Type your sentence here..."
                className="
                  min-h-32
                  w-full
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-950
                  p-5
                  outline-none
                "
              />

              <button
                className="
                  rounded-xl
                  bg-cyan-600
                  px-8
                  py-3
                  font-black
                "
              >
                Check Grammar
              </button>
            </div>
          </div>
        </section>

        {/* GRAMMAR QUIZ */}
        <section
          className="
            mt-20
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-purple-500/20
              bg-purple-500/10
              p-8
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <Brain
                size={36}
                className="
                  text-purple-400
                "
              />
              <div>
                <h2
                  className="
                    text-3xl
                    font-black
                  "
                >
                  Grammar Quiz Generator
                </h2>
                <p
                  className="
                    mt-2
                    text-slate-300
                  "
                >
                  Test your grammar knowledge with interactive questions.
                </p>
              </div>
            </div>

            <div
              className="
                mt-8
                grid
                gap-6
                md:grid-cols-3
              "
            >
              {
                [
                  {
                    title:"Beginner",
                    level:"A1 - A2",
                    color:"bg-green-500/20"
                  },
                  {
                    title:"Intermediate",
                    level:"B1 - B2",
                    color:"bg-blue-500/20"
                  },
                  {
                    title:"Advanced",
                    level:"C1 - C2",
                    color:"bg-purple-500/20"
                  }
                ].map((item)=>(
                  <div
                    key={item.title}
                    className={`
                      rounded-2xl
                      ${item.color}
                      p-6
                    `}
                  >
                    <h3
                      className="
                        text-xl
                        font-black
                      "
                    >
                      {item.title}
                    </h3>
                    <p className="mt-2 text-slate-300">Level: {item.level}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Grammar;