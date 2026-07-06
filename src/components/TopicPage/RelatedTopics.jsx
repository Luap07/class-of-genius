// src/components/curriculum/topic/RelatedTopics.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

const RelatedTopics = ({ subject, currentTopic }) => {
  const navigate = useNavigate();

  // fallback topics (later you can replace with real curriculum links)
  const related = subject?.topics?.filter(
    (t) => t.name !== currentTopic.name
  ) || [];

  const handleClick = (topic) => {
    const slug = topic.name.toLowerCase().replace(/\s+/g, "-");

    navigate(
      `../${slug}`
    );
  };

  return (
    <section className="mt-16">

      <div className="flex items-center gap-3 mb-6">

        <BookOpen className="text-cyan-400" />

        <h2 className="text-3xl font-bold">

          Related Topics

        </h2>

      </div>

      {related.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
          No related topics available yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {related.map((topic) => (
            <button
              key={topic.name}
              onClick={() => handleClick(topic)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
            >

              <div className="flex items-center justify-between">

                <BookOpen className="text-slate-400" size={20} />

                <ArrowRight className="text-slate-500" size={18} />

              </div>

              <h3 className="text-xl font-bold mt-5">

                {topic.name}

              </h3>

              <p className="text-slate-400 mt-2 text-sm">

                Continue learning this subject

              </p>

            </button>
          ))}

        </div>
      )}

    </section>
  );
};

export default RelatedTopics;