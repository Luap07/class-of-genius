import { useState } from "react";

export default function ProcedurePanel({ steps }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-xl font-bold">Procedure</h2>

      <div className="rounded-xl bg-slate-900 p-4">
        <p>{steps[currentStep]}</p>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() =>
            setCurrentStep((prev) => Math.max(prev - 1, 0))
          }
          className="rounded-lg bg-slate-700 px-4 py-2"
        >
          Previous
        </button>

        <button
          onClick={() =>
            setCurrentStep((prev) =>
              Math.min(prev + 1, steps.length - 1)
            )
          }
          className="rounded-lg bg-blue-600 px-4 py-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}