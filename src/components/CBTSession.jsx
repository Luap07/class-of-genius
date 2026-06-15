import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, CheckCircle2 } from "lucide-react";

const CBTSession = ({ examType, onExit }) => {
  // Logic remains the same, but it's now a component
  const [questions] = useState([
    { id: 1, text: "Which component manages state in React?", options: ["useState", "useEffect", "useContext", "useReducer"], correct: "useState" },
    { id: 2, text: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "Joint Syntax"], correct: "JavaScript XML" },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) setIsFinished(true);
  }, [timeLeft, isFinished]);

  const calculateScore = () => questions.reduce((acc, q) => selectedAnswers[q.id] === q.correct ? acc + 1 : acc, 0);

  if (isFinished) {
    return (
      <div className="bg-[#090d18] p-8 rounded-3xl border border-white/10 w-full text-center">
        <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">{examType} Completed</h2>
        <p className="text-lg mt-2">Score: {calculateScore()} / {questions.length}</p>
        <button onClick={onExit} className="mt-6 w-full py-3 bg-blue-600 rounded-xl">Back to Dashboard</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="bg-[#090d18] p-6 rounded-2xl border border-white/10 text-white w-full max-w-2xl mx-auto">
      <div className="flex justify-between mb-6">
        <h2 className="font-bold text-lg">{examType} Session</h2>
        <div className="flex items-center gap-2 font-mono text-red-400">
          <Timer size={18} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      <h3 className="text-xl mb-6">{currentQ.text}</h3>
      <div className="space-y-3">
        {currentQ.options.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: opt })}
            className={`w-full p-4 text-left rounded-xl border transition ${selectedAnswers[currentQ.id] === opt ? "bg-blue-600 border-blue-400" : "bg-white/5 border-white/10"}`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(p => p - 1)} className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-30">Prev</button>
        {currentIndex < questions.length - 1 ? (
          <button onClick={() => setCurrentIndex(p => p + 1)} className="px-4 py-2 bg-blue-600 rounded-lg">Next</button>
        ) : (
          <button onClick={() => setIsFinished(true)} className="px-4 py-2 bg-green-600 rounded-lg">Submit</button>
        )}
      </div>
    </div>
  );
};

export default CBTSession;