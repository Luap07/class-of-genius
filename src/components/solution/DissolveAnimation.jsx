import React, { useEffect, useState } from "react";

const DissolveAnimation = ({
  running = false,
  dissolved = 0,
  color = "#38bdf8",
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setParticles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          left: 42 + Math.random() * 16,
          size: 4 + Math.random() * 8,
          duration: 2 + Math.random() * 2,
        },
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles((prev) => prev.slice(-60));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* Floating Dissolving Particles */}
      {running &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-dissolve"
            style={{
              left: `${p.left}%`,
              bottom: "140px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: color,
              opacity: 0.85,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

      {/* Dissolve Progress */}
      <div className="absolute bottom-5 left-5 w-56">

        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>Dissolving</span>
          <span>{Math.round(dissolved)}%</span>
        </div>

        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(dissolved, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>

      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes dissolve {
          0%{
            transform:translateY(0) scale(1);
            opacity:1;
          }

          100%{
            transform:translateY(-160px) scale(.2);
            opacity:0;
          }
        }

        .animate-dissolve{
          animation-name:dissolve;
          animation-timing-function:linear;
          animation-fill-mode:forwards;
        }
      `}</style>

    </div>
  );
};

export default DissolveAnimation;