// src/components/curriculum/topic/TopicHero.jsx

import React from "react";
import {
  Globe2,
  BookOpen,
  GraduationCap,
  Clock3,
  Signal,
  Target,
} from "lucide-react";

const TopicHero = ({
  country,
  level,
  grade,
  subject,
  topic,
}) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

      <div className="flex flex-col lg:flex-row justify-between gap-10">

        {/* LEFT */}

        <div className="flex-1">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">

            <Globe2 size={18} />

            <span>{country.country}</span>

          </div>

          <h1 className="text-5xl font-black mt-6">

            {topic.name}

          </h1>

          <p className="text-slate-300 text-xl mt-3">

            {subject.name}

          </p>

          <div className="flex flex-wrap gap-3 mt-6">

            <span className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700">

              {grade.name}

            </span>

            <span className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 capitalize">

              {level.replace(/-/g, " ")}

            </span>

          </div>

          <p className="mt-8 text-slate-400 leading-8 max-w-3xl">

            {topic.description ||
              "Study this topic according to the official curriculum. Explore notes, practical activities, AI tutoring, quizzes, past questions and additional learning resources."}

          </p>

        </div>

        {/* RIGHT */}

        <div className="grid grid-cols-2 gap-4 w-full lg:w-96">

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">

            <Clock3 className="text-cyan-400 mb-3" />

            <p className="text-sm text-slate-500">

              Study Time

            </p>

            <h3 className="text-xl font-bold mt-1">

              {topic.duration || "45 mins"}

            </h3>

          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">

            <Signal className="text-cyan-400 mb-3" />

            <p className="text-sm text-slate-500">

              Difficulty

            </p>

            <h3 className="text-xl font-bold mt-1">

              {topic.difficulty || "Medium"}

            </h3>

          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">

            <BookOpen className="text-cyan-400 mb-3" />

            <p className="text-sm text-slate-500">

              Resources

            </p>

            <h3 className="text-xl font-bold mt-1">

              {topic.resources || 8}

            </h3>

          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">

            <GraduationCap className="text-cyan-400 mb-3" />

            <p className="text-sm text-slate-500">

              Curriculum

            </p>

            <h3 className="text-lg font-bold mt-1">

              {country.curriculum}

            </h3>

          </div>

        </div>

      </div>

      {/* LEARNING OBJECTIVES */}

      <div className="mt-12">

        <div className="flex items-center gap-3 mb-6">

          <Target className="text-cyan-400" />

          <h2 className="text-2xl font-bold">

            Learning Objectives

          </h2>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {(topic.objectives || []).map((objective, index) => (

            <div
              key={index}
              className="flex items-start gap-3 bg-slate-950 border border-slate-800 rounded-xl p-5"
            >

              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />

              <p className="text-slate-300">

                {objective}

              </p>

            </div>

          ))}

          {!topic.objectives?.length && (

            <div className="text-slate-500">

              No learning objectives have been added yet.

            </div>

          )}

        </div>

      </div>

    </section>
  );
};

export default TopicHero;