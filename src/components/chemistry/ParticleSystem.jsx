import React, { useEffect, useState } from "react";

const random = (min, max) =>
  Math.random() * (max - min) + min;

export default function ParticleSystem({
  running = false,
  type = "bubbles", // bubbles | smoke | sparks | fire | gas
  amount = 40,
  width = 700,
  height = 500,
}) {
  const [particles, setParticles] = useState([]);

  /* ===============================
      CREATE PARTICLE
  =============================== */

  const createParticle = () => ({
    id: Math.random(),

    x: random(width * 0.3, width * 0.7),

    y: height - 60,

    size: random(4, 14),

    opacity: 1,

    dx: random(-1.5, 1.5),

    dy: random(-4, -1),

    life: 1,

    rotate: random(0, 360),
  });

  /* ===============================
      SPAWN
  =============================== */

  useEffect(() => {
    if (!running) {
      setParticles([]);
      return;
    }

    const spawn = setInterval(() => {
      setParticles((prev) => [
        ...prev,
        ...Array.from(
          { length: Math.max(1, amount / 8) },
          createParticle
        ),
      ]);
    }, 120);

    return () => clearInterval(spawn);
  }, [running, amount]);

  /* ===============================
      PHYSICS
  =============================== */

  useEffect(() => {
    if (!running) return;

    const physics = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,

            x: p.x + p.dx,

            y: p.y + p.dy,

            dy:
              type === "fire"
                ? p.dy - 0.01
                : p.dy,

            size:
              type === "smoke"
                ? p.size + 0.12
                : p.size,

            opacity: p.opacity - 0.015,

            rotate: p.rotate + 4,

            life: p.life - 0.015,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(physics);
  }, [running, type]);

  /* ===============================
      STYLE
  =============================== */

  const particleStyle = (p) => {
    switch (type) {
      case "smoke":
        return {
          background: "#cbd5e1",
          filter: "blur(4px)",
        };

      case "sparks":
        return {
          background: "#facc15",
          boxShadow:
            "0 0 12px #fde047",
        };

      case "fire":
        return {
          background:
            "linear-gradient(#f97316,#ef4444)",
          boxShadow:
            "0 0 20px orange",
        };

      case "gas":
        return {
          background: "#22d3ee",
          filter: "blur(2px)",
        };

      default:
        return {
          background: "#7dd3fc",
          border: "1px solid white",
        };
    }
  };

  /* ===============================
      RENDER
  =============================== */

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,

            top: p.y,

            width: p.size,

            height: p.size,

            opacity: p.opacity,

            transform: `translate(-50%,-50%) rotate(${p.rotate}deg)`,

            transition: "transform .02s linear",

            ...particleStyle(p),
          }}
        />
      ))}
    </div>
  );
}