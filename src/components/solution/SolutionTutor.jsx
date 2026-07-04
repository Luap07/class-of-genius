import React from "react";

const SolutionTutor = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-slate-800 p-4 rounded text-white">
      <h3 className="font-bold mb-2">AI Tutor</h3>

      <p>
        Current concentration is {data.concentration}.{" "}
        {data.isSaturated
          ? "Solution is saturated — no more solute dissolves."
          : "You can still dissolve more solute."}
      </p>
    </div>
  );
};

export default SolutionTutor;