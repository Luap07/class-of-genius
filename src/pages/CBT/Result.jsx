import React, { useEffect, useState } from "react";

const Result = () => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const answers = JSON.parse(localStorage.getItem("cbt_answers")) || {};

    // dummy correct answers (replace later with DB)
    const correct = {
      0: "4",
      1: "Abuja"
    };

    let s = 0;
    Object.keys(correct).forEach((key) => {
      if (answers[key] === correct[key]) {
        s++;
      }
    });

    setScore(s);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold">Exam Result</h1>

      <p className="mt-4 text-xl">
        Score: {score} / 2
      </p>
    </div>
  );
};

export default Result;