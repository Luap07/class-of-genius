import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ExamSelect = () => {
  const navigate = useNavigate();

  const exam = localStorage.getItem("cbt_exam");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const subjectMap = {
    WAEC: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Economics",
      "Government",
      "Literature",
    ],
    NECO: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Economics",
      "Commerce",
    ],
    GCE: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Economics",
    ],
    JAMB: [
      "Use of English",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Economics",
    ],
    IJMB: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    JUPEB: ["Mathematics", "Physics", "Chemistry", "Biology", "Economics"],
    IGCSE: [
      "Mathematics",
      "English",
      "Biology",
      "Chemistry",
      "Physics",
      "Computer Science",
    ],
    "A-LEVEL": ["Mathematics", "Physics", "Chemistry", "Biology", "Economics"],
    ACT: ["English", "Mathematics", "Reading", "Science"],
    IB: ["Mathematics", "Sciences", "Language", "Individuals & Societies"],
    GCSE: ["Mathematics", "English", "Biology", "Chemistry", "Physics"],
    IELTS: ["Listening", "Reading", "Writing", "Speaking"],
  };

  const subjects = useMemo(() => subjectMap[exam] || [], [exam]);

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) => {
      const exists = prev.includes(subject);

      if (exists) return prev.filter((s) => s !== subject);
      if (prev.length >= 4) return prev;

      return [...prev, subject];
    });
  };

  const startQuiz = () => {
    localStorage.setItem("cbt_subjects", JSON.stringify(selectedSubjects));
    navigate(`/cbt/session/${exam}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white px-6 py-10">

      {/* ================= CRAZY ANIMATED BACKGROUND ================= */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* glowing floating blobs */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse top-[-120px] left-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-bounce bottom-[-120px] right-[-100px]" />
      <div className="absolute w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-3xl animate-spin-slow top-[40%] left-[45%]" />

      {/* grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* content layer */}
      <div className="relative z-10">

        {/* HEADER */}
        <div className="max-w-5xl mx-auto mb-6">
          <h1 className="text-3xl font-bold">Select Subjects</h1>

          <p className="text-gray-400 mt-2">
            Exam: <span className="text-blue-400">{exam}</span>
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Select up to 4 subjects to continue CBT
          </p>
        </div>

        {/* STATUS + BUTTON */}
        <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            Selected: {selectedSubjects.length}/4
          </p>

          <button
            disabled={selectedSubjects.length === 0}
            onClick={startQuiz}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              selectedSubjects.length === 0
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            Start CBT Exam →
          </button>
        </div>

        {/* SUBJECT GRID */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">

          {subjects.map((subject, index) => {
            const isSelected = selectedSubjects.includes(subject);
            const limitReached =
              selectedSubjects.length >= 4 && !isSelected;

            return (
              <div
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={`
                  relative cursor-pointer p-5 rounded-xl border
                  transition-all duration-300
                  bg-white/5 hover:bg-white/10
                  ${isSelected ? "border-blue-500 bg-blue-500/10" : "border-white/10"}
                  ${limitReached ? "opacity-40 pointer-events-none" : ""}
                `}
              >
                {/* selection circle */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`
                      w-5 h-5 rounded-full border
                      flex items-center justify-center
                      ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-500"}
                    `}
                  >
                    {isSelected && (
                      <span className="text-xs text-white">✓</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  Subject {index + 1}
                </div>

                <h2 className="text-lg font-semibold">{subject}</h2>

                <p className="text-xs text-gray-500 mt-2">
                  Click to {isSelected ? "remove" : "select"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* animation */}
      <style>
        {`
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animate-spin-slow {
            animation: spinSlow 18s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default ExamSelect;