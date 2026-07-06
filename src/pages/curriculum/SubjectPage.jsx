import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

import curricula from "../../data/Curriculum/curricula";

const SubjectPage = () => {
  const navigate = useNavigate();

  const { country, level, grade, subject } = useParams();

  // =========================
  // FIND COUNTRY (SAFE)
  // =========================
  const countryData = curricula.find(
    (c) =>
      c.country.toLowerCase().replace(/\s+/g, "-") === country
  );

  if (!countryData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Country not found.
      </div>
    );
  }

  // =========================
  // FIND LEVEL (ARRAY SAFE)
  // =========================
  const levelData = countryData.levels?.find(
    (l) => l.id === level
  );

  if (!levelData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Level not found.
      </div>
    );
  }

  // =========================
  // GET SUBJECT LIST (SAFE FALLBACK)
  // =========================
  const subjectList =
    levelData.subjects ||
    levelData.years ||
    [];

  if (!subjectList.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        No subjects available for this level.
      </div>
    );
  }

  // =========================
  // NORMALIZE SUBJECT SLUG
  // =========================
  const subjectName = subject?.replace(/-/g, " ");

  // =========================
  // TOPICS LOGIC (FALLBACK SAFE)
  // =========================
  const topics =
    subjectList.includes(subjectName)
      ? [
          "Overview",
          "Key Concepts",
          "Examples",
          "Practice Questions",
          "Assessment"
        ]
      : subjectList;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}
        <h1 className="text-5xl font-black">
          {subjectName || "Subject"}
        </h1>

        <p className="text-slate-400 mt-3">
          Curriculum Topics
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">

          {topics.map((topic) => {
            const slug = topic.toLowerCase().replace(/\s+/g, "-");

            return (
              <button
                key={topic}
                onClick={() =>
                  navigate(
                    `/curriculum/${country}/${level}/${grade}/${subject}/${slug}`
                  )
                }
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-cyan-500 transition duration-300 hover:-translate-y-1"
              >
                <BookOpen className="text-cyan-400 mb-5" />

                <h2 className="text-xl font-bold">
                  {topic}
                </h2>

                <p className="text-slate-400 mt-2">
                  Open lesson
                </p>

                <div className="flex justify-end mt-6">
                  <ArrowRight className="text-cyan-400" />
                </div>
              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
};

export default SubjectPage;