import React, { useEffect, useState } from "react";

const Result = () => {
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const answers = JSON.parse(localStorage.getItem("cbt_answers")) || {};
    const questions = JSON.parse(localStorage.getItem("cbt_questions")) || [];

    let correctCount = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correctCount++;
      }
    });

    const totalQ = questions.length;
    const percentage = totalQ ? Math.round((correctCount / totalQ) * 100) : 0;

    setScore(correctCount);
    setTotal(totalQ);
    setPercent(percentage);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6 flex items-center justify-center">

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-md">

        <h1 className="text-3xl font-bold mb-4">Exam Result</h1>

        {/* SCORE */}
        <div className="text-2xl font-semibold text-blue-400">
          {score} / {total}
        </div>

        {/* PERCENTAGE */}
        <p className="mt-3 text-lg text-gray-300">
          {percent}% Score
        </p>

        {/* STATUS */}
        <div className="mt-4">
          {percent >= 50 ? (
            <p className="text-green-400 font-semibold">PASS 🎉</p>
          ) : (
            <p className="text-red-400 font-semibold">FAIL ❌</p>
          )}
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-6 w-full bg-gray-800 rounded-full h-3">
          <div
            className="h-3 bg-blue-500 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* INFO */}
        <p className="text-xs text-gray-500 mt-4">
          Scholiqen CBT Performance Report
        </p>
      </div>
    </div>
  );
};

export default Result;