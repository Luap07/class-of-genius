import React from "react";

const SubjectsPanel = () => {
  const subjects = [
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Government",
    "Geography",
    "Literature",
    "Commerce",
    "Accounting",
    "Computer Studies",
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4">
        📚 Subjects
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {subjects.map((subj, i) => (
          <div
            key={i}
            className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-white hover:bg-slate-800 cursor-pointer transition"
          >
            📘 {subj}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsPanel;