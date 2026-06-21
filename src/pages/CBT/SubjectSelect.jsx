import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cbtSubjects } from "../../data/cbtSubjects";

const SubjectSelect = () => {
  const { exam } = useParams();
  const navigate = useNavigate();

  // Get subjects from cbtSubjects.js
  const subjects = cbtSubjects[exam?.toLowerCase()] || [];

  const [selected, setSelected] = useState([]);

  const toggleSubject = (subject) => {
    const exists = selected.includes(subject);

    if (exists) {
      setSelected(selected.filter((s) => s !== subject));
    } else {
      if (selected.length >= 4) return;
      setSelected([...selected, subject]);
    }
  };

  const startExam = () => {
    if (selected.length === 0) return;

    navigate("/cbt/start", {
      state: {
        exam,
        subjects: selected,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full bottom-[-200px] right-[-200px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center pt-14 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
          {exam?.toUpperCase()} Subject Selection
        </h1>

        <p className="text-gray-400 mt-2 text-sm">
          Select up to 4 subjects to start your CBT exam
        </p>

        <p className="text-blue-400 text-xs mt-1">
          Selected: {selected.length} / 4
        </p>
      </div>

      {/* Start Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={startExam}
          disabled={selected.length === 0}
          className={`
            px-5 py-2 rounded-lg font-semibold transition
            ${
              selected.length > 0
                ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30"
                : "bg-gray-700 cursor-not-allowed opacity-60"
            }
          `}
        >
          Start Exam
        </button>
      </div>

      {/* Subject Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6 mt-10">
        {subjects.length > 0 ? (
          subjects.map((subject, i) => {
            const isSelected = selected.includes(subject);

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSubject(subject)}
                className={`
                  cursor-pointer rounded-xl p-4 text-center
                  border transition-all
                  ${
                    isSelected
                      ? "bg-blue-600/25 border-blue-400 shadow-md shadow-blue-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >
                <h2 className="text-sm font-semibold">{subject}</h2>

                <p className="text-[10px] text-gray-400 mt-1">
                  {isSelected ? "Selected ✓" : "Tap to select"}
                </p>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 mt-10">
            No subjects found for this exam.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelect;