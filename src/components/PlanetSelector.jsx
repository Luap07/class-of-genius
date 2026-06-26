import React, { useEffect, useMemo, useState } from "react";

import earth from "../assets/earth.png";
import moon from "../assets/moon.png";

const PLANETS = {
  Earth: {
    gravity: 9.81,
    image: earthImg,
    color: "#4fa3ff",
    orbitRadius: 120,
    speed: 0.015,
  },
  Moon: {
    gravity: 1.62,
    image: moonImg,
    color: "#cfcfcf",
    orbitRadius: 80,
    speed: 0.03,
  },
 
};

export default function PlanetSelector() {
  const [planetName, setPlanetName] = useState("Earth");
  const [angle, setAngle] = useState(0);

  const planet = PLANETS[planetName];

  // simple animation loop
  useEffect(() => {
    const id = setInterval(() => {
      setAngle((a) => a + planet.speed);
    }, 16);

    return () => clearInterval(id);
  }, [planet.speed]);

  const orbitPosition = useMemo(() => {
    const x = Math.cos(angle) * planet.orbitRadius;
    const y = Math.sin(angle) * planet.orbitRadius;
    return { x, y };
  }, [angle, planet.orbitRadius]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">
        🪐 Planet Selector Simulator
      </h1>

      {/* Planet View */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        
        {/* center sun */}
        <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-lg" />

        {/* orbiting planet */}
        <div
          className="absolute transition-transform duration-75"
          style={{
            transform: `translate(${orbitPosition.x}px, ${orbitPosition.y}px)`,
          }}
        >
          <img
            src={planet.image}
            alt={planetName}
            className="w-12 h-12 rounded-full"
          />
        </div>

        {/* orbit circle */}
        <div
          className="absolute border rounded-full opacity-30"
          style={{
            width: planet.orbitRadius * 2,
            height: planet.orbitRadius * 2,
            borderColor: planet.color,
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-6">
        {Object.keys(PLANETS).map((p) => (
          <button
            key={p}
            onClick={() => setPlanetName(p)}
            className={`px-4 py-2 rounded-lg border transition ${
              planetName === p
                ? "bg-white text-black"
                : "bg-transparent border-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Info Panel */}
      <div className="mt-6 text-center">
        <p className="text-lg">
          Gravity:{" "}
          <span className="font-bold">{planet.gravity} m/s²</span>
        </p>
      </div>
    </div>
  );
}