import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const QuizSession = () => {
  const navigate = useNavigate();

  const [time, setTime] = useState(7200);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      q: "What is 2 + 2?",
      options: ["1", "2", "4", "5"],
      answer: "4"
    },
    {
      q: "Capital of Nigeria?",
      options: ["Lagos", "Abuja", "Kano", "Ibadan"],
      answer: "Abuja"
    }
  ];

  /* TIMER */
  useEffect(() => {
    const t = setInterval(() => {
      setTime((p) => {
        if (p <= 1) {
          clearInterval(t);
          finishExam();
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, []);

  const format = (s) =>
    `${Math.floor(s / 3600)}:${Math.floor((s % 3600) / 60)}:${s % 60}`;

  const select = (opt) => {
    setAnswers({ ...answers, [index]: opt });
  };

  const finishExam = () => {
    localStorage.setItem("cbt_answers", JSON.stringify(answers));
    navigate("/cbt/result");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="text-red-400 mb-4">
        ⏱ {format(time)}
      </div>

      <div className="p-4 bg-white/10 rounded-xl">
        <h2 className="text-lg mb-3">
          {questions[index].q}
        </h2>

        {questions[index].options.map((opt) => (
          <div
            key={opt}
            onClick={() => select(opt)}
            className="p-2 bg-white/5 my-2 rounded cursor-pointer"
          >
            {opt}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Prev
        </button>

        <button
          onClick={() => setIndex(index + 1)}
        >
          Next
        </button>

        <button
          onClick={finishExam}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default QuizSession;