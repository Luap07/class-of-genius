import React, { useEffect, useState } from "react";

const ProgressPanel = () => {
  const [progressData, setProgressData] = useState({
    topics: [],
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("studentProgress"));

    if (saved && saved.topics) {
      setProgressData(saved);
    }
  }, []);

  // ================= CALCULATE TOTALS =================
  const totalCompleted = progressData.topics.reduce(
    (sum, topic) => sum + (topic.completed || 0),
    0
  );

  const totalTopics = progressData.topics.reduce(
    (sum, topic) => sum + (topic.total || 0),
    0
  );

  const overallProgress =
    totalTopics > 0
      ? Math.round((totalCompleted / totalTopics) * 100)
      : 0;

  // ================= CIRCLE =================
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (overallProgress / 100) * circumference;

  return (
    <div className="p-6 text-white">

      <h2 className="text-2xl font-bold mb-6">
        📊 Learning Progress
      </h2>

      {/* ================= CIRCULAR PROGRESS ================= */}
      <div className="flex justify-center mb-8">
        <div className="relative w-44 h-44">

          <svg
            className="w-44 h-44 rotate-[-90deg]"
            viewBox="0 0 180 180"
          >
            {/* background circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#1e293b"
              strokeWidth="12"
              fill="none"
            />

            {/* progress circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#38bdf8"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h3 className="text-4xl font-bold">
              {overallProgress}%
            </h3>
            <p className="text-sm text-slate-400">
              Overall Progress
            </p>
          </div>
        </div>
      </div>

      {/* ================= TOPICS ================= */}
      <div className="space-y-4">

        {progressData.topics.length === 0 ? (
          <div className="text-slate-400 text-center">
            No learning data yet. Start a lesson 🎓
          </div>
        ) : (
          progressData.topics.map((topic) => {
            const percent =
              topic.total > 0
                ? Math.round(
                    (topic.completed / topic.total) * 100
                  )
                : 0;

            return (
              <div
                key={topic.name}
                className="bg-slate-900 p-4 rounded-xl"
              >
                <div className="flex justify-between mb-2">
                  <span>{topic.name}</span>

                  <span>
                    {topic.completed}/{topic.total}
                  </span>
                </div>

                {/* progress bar */}
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-slate-400 mt-2">
                  {percent}% completed
                </p>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
};

export default ProgressPanel;