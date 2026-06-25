import { useState } from "react";

export default function AILabAssistant() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const evaluate = () => {
    if (
      answer.toLowerCase().includes("force") &&
      answer.toLowerCase().includes("acceleration")
    ) {
      setFeedback(
        "Excellent. Force and acceleration are directly proportional."
      );
    } else {
      setFeedback(
        "Try explaining the relationship between force and acceleration."
      );
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-xl font-bold">
        AI Lab Assistant
      </h2>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="h-32 w-full rounded-xl bg-slate-900 p-4"
        placeholder="Write your conclusion..."
      />

      <button
        onClick={evaluate}
        className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3"
      >
        Evaluate
      </button>

      {feedback && (
        <div className="mt-4 rounded-xl bg-slate-900 p-4">
          {feedback}
        </div>
      )}
    </div>
  );
}