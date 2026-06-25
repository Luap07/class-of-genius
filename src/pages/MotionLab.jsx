import React, { useState } from "react";

const MotionLab = () => {
  const [distance, setDistance] = useState(100);
  const [time, setTime] = useState(10);

  const speed = (distance / time).toFixed(2);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Motion Lab
      </h1>

      <div className="bg-slate-900 p-6 rounded-xl">
        <div className="mb-4">
          <label className="block mb-2">
            Distance (m): {distance}
          </label>

          <input
            type="range"
            min="10"
            max="500"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            Time (s): {time}
          </label>

          <input
            type="range"
            min="1"
            max="60"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="bg-slate-800 p-4 rounded-lg mt-6">
          <p className="text-lg">
            Speed:
          </p>

          <p className="text-4xl font-bold text-green-400">
            {speed} m/s
          </p>
        </div>
      </div>
    </div>
  );
};

export default MotionLab;