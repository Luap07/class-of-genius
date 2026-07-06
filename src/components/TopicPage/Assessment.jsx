// src/components/curriculum/topic/Assessment.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileQuestion,
  ClipboardCheck,
  Trophy,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const Assessment = ({
  country,
  grade,
  subject,
  topic,
}) => {
  const navigate = useNavigate();

  const assessments = [
    {
      title: "CBT Practice",
      description: "Generate exam-style questions for this topic.",
      icon: ClipboardCheck,
      color: "text-cyan-400",
      action: () => navigate("/cbt"),
    },

    {
      title: "Past Questions",
      description: "View real exam questions from WAEC, JAMB, NECO, etc.",
      icon: FileQuestion,
      color: "text-violet-400",
      action: () =>
        navigate(
          `/curriculum/${country.country
            .toLowerCase()
            .replace(/\s+/g, "-")}/${grade.name
            .toLowerCase()
            .replace(/\s+/g, "-")}/${subject.name
            .toLowerCase()
            .replace(/\s+/g, "-")}/${topic.name
            .toLowerCase()
            .replace(/\s+/g, "-")}/past-questions`
        ),
    },

    {
      title: "Challenge Quiz",
      description: "Test yourself with timed quizzes.",
      icon: Trophy,
      color: "text-yellow-400",
      action: () => navigate("/cbt"),
    },

    {
      title: "Progress Tracking",
      description: "Track your learning performance.",
      icon: BarChart3,
      color: "text-green-400",
      action: () => navigate("/dashboard"),
    },
  ];

  return (
    <section className="mt-16">

      <div className="mb-6">

        <h2 className="text-3xl font-bold">

          Assessment & Practice

        </h2>

        <p className="text-slate-400 mt-2">

          Test your understanding of this topic

        </p>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {assessments.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.title}
              onClick={item.action}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
            >

              <div className="flex items-center justify-between">

                <Icon className={item.color} size={28} />

                <ArrowRight className="text-slate-500" size={18} />

              </div>

              <h3 className="text-xl font-bold mt-6">

                {item.title}

              </h3>

              <p className="text-slate-400 mt-3 leading-7">

                {item.description}

              </p>

            </button>

          );

        })}

      </div>

    </section>
  );
};

export default Assessment;