import React, { useState, useMemo } from "react";

const LensLabV2 = () => {
  const [objectX, setObjectX] = useState(20);
  const [objectHeight, setObjectHeight] = useState(60);
  const [focalLength, setFocalLength] = useState(15);
  const [lensType, setLensType] = useState("convex");

  const f = lensType === "convex" ? Math.abs(focalLength) : -Math.abs(focalLength);

  // Lens equation: 1/f = 1/do + 1/di
  const imageX = useMemo(() => {
    const doVal = objectX;
    const di = (f * doVal) / (doVal - f);
    return di;
  }, [objectX, f]);

  const magnification = imageX / objectX;
  const imageHeight = objectHeight * magnification;

  const isReal = imageX > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <h1 className="text-4xl font-bold mb-6">
        🔬 Lens Lab V2 — Ray Tracing (PHET Level)
      </h1>

      {/* Controls */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="bg-slate-900 p-4 rounded-xl">
          <p className="font-bold mb-2">Object Position</p>

          <input
            type="range"
            min="10"
            max="80"
            value={objectX}
            onChange={(e) => setObjectX(Number(e.target.value))}
            className="w-full"
          />

          <p className="text-cyan-400">{objectX} cm</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl">
          <p className="font-bold mb-2">Focal Length</p>

          <input
            type="range"
            min="5"
            max="50"
            value={focalLength}
            onChange={(e) => setFocalLength(Number(e.target.value))}
            className="w-full"
          />

          <p className="text-yellow-400">{focalLength} cm</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl flex flex-col justify-center">
          <button
            onClick={() =>
              setLensType(lensType === "convex" ? "concave" : "convex")
            }
            className={`px-4 py-2 rounded-lg font-bold ${
              lensType === "convex"
                ? "bg-green-600"
                : "bg-purple-600"
            }`}
          >
            {lensType.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Optical System */}
      <div className="relative bg-slate-900 rounded-2xl h-80 overflow-hidden">

        {/* Optical axis */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-600"></div>

        {/* Lens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl">
          🔷
        </div>

        {/* Focal points */}
        <div className="absolute left-[40%] top-1/2 text-yellow-400">F</div>
        <div className="absolute left-[60%] top-1/2 text-yellow-400">F</div>

        {/* Object */}
        <div
          className="absolute text-4xl text-red-400"
          style={{
            left: `${objectX}%`,
            top: "35%",
          }}
        >
          📍
        </div>

        {/* Image */}
        <div
          className="absolute text-4xl"
          style={{
            left: `${50 + imageX}%`,
            top: isReal ? "35%" : "20%",
            transform: `scale(${Math.abs(magnification)})`,
            opacity: 0.9,
          }}
        >
          {isReal ? "📍" : "🔁"}
        </div>

        {/* ===== RAY 1: Parallel to axis → through focal point ===== */}
        <div
          className="absolute h-[2px] bg-red-500"
          style={{
            left: `${objectX}%`,
            top: "40%",
            width: "50%",
          }}
        />

        {/* ===== RAY 2: Through center of lens ===== */}
        <div
          className="absolute h-[2px] bg-blue-500 rotate-12"
          style={{
            left: `${objectX}%`,
            top: "45%",
            width: "50%",
          }}
        />

        {/* ===== RAY 3: Through focal point ===== */}
        <div
          className="absolute h-[2px] bg-green-500"
          style={{
            left: `${objectX}%`,
            top: "50%",
            width: "50%",
          }}
        />
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-slate-400">Image Distance</p>
          <p className="text-2xl text-cyan-400 font-bold">
            {imageX.toFixed(2)} cm
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-slate-400">Magnification</p>
          <p className="text-2xl text-green-400 font-bold">
            {magnification.toFixed(2)}x
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-slate-400">Image Type</p>
          <p className="text-2xl text-yellow-400 font-bold">
            {isReal ? "Real Image" : "Virtual Image"}
          </p>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-slate-900 mt-8 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-2">Lens Equation</h2>
        <p className="text-lg">1/f = 1/do + 1/di</p>

        <p className="text-slate-400 mt-2">
          do = {objectX} cm | f = {focalLength} cm | di = {imageX.toFixed(2)} cm
        </p>
      </div>
    </div>
  );
};

export default LensLabV2;