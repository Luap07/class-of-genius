import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { shuffleArray, CBT_DURATION, formatTime } from "./cbtUtils";

const mockQuestions = [
  {
    question: "2 + 2 = ?",
    options: ["1", "2", "3", "4"],
    answer: "4",
  },
  {
    question: "Capital of Nigeria?",
    options: ["Lagos", "Abuja", "Kano", "Ibadan"],
    answer: "Abuja",
  },
  {
    question: "HTML stands for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hot Mail",
      "None",
    ],
    answer: "Hyper Text Markup Language",
  },
];

const CBTSession = () => {
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(CBT_DURATION);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  /* ================= LOAD QUESTIONS ================= */
  useEffect(() => {
    const shuffled = shuffleArray(mockQuestions);
    setQuestions(shuffled);
  }, []);

  /* ================= TIMER ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= SELECT ANSWER ================= */
  const selectAnswer = (option) => {
    setAnswers({
      ...answers,
      [currentQ]: option,
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    localStorage.setItem("cbt_answers", JSON.stringify(answers));
    localStorage.setItem("cbt_questions", JSON.stringify(questions));

    navigate("/cbt/result");
  };

  if (!questions.length) {
    return (
      <div className="text-white flex justify-center items-center h-screen">
        Loading exam...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* TIMER */}
      <div className="text-red-400 text-xl mb-6">
        ⏱ Time Left: {formatTime(timeLeft)}
      </div>

      {/* QUESTION */}
      <div className="p-5 bg-white/10 rounded-xl">
        <h2 className="text-lg font-bold mb-4">
          {currentQ + 1}. {questions[currentQ].question}
        </h2>

        <div className="space-y-3">
          {questions[currentQ].options.map((opt) => (
            <div
              key={opt}
              onClick={() => selectAnswer(opt)}
              className={`p-3 rounded cursor-pointer transition ${
                answers[currentQ] === opt
                  ? "bg-blue-600"
                  : "bg-white/5 hover:bg-white/20"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between mt-6">
        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((q) => q - 1)}
          className="px-4 py-2 bg-white/10 rounded disabled:opacity-40"
        >
          Prev
        </button>

        {currentQ === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 rounded"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={() => setCurrentQ((q) => q + 1)}
            className="px-4 py-2 bg-white/10 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default CBTSession;