import { useState } from "react";

export default function TaskPanel({ tasks }) {
  const [completed, setCompleted] = useState([]);

  const toggleTask = (index) => {
    if (completed.includes(index)) {
      setCompleted(completed.filter((i) => i !== index));
    } else {
      setCompleted([...completed, index]);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-xl font-bold">Tasks</h2>

      {tasks.map((task, index) => (
        <div
          key={index}
          className="mb-3 flex items-center gap-3"
        >
          <input
            type="checkbox"
            checked={completed.includes(index)}
            onChange={() => toggleTask(index)}
          />
          <span>{task}</span>
        </div>
      ))}
    </div>
  );
}