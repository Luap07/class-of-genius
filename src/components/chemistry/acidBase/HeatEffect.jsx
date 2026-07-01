import React from "react";
import { Flame } from "lucide-react";

export default function HeatEffect({
  active = false,
  intensity = 1, // 1 - 5
}) {
  if (!active) return null;

  const flames = Array.from({
    length: Math.max(3, intensity * 3),
  });

  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">

      {/* Glow */}
      <div className="absolute bottom-0 w-40 h-12 rounded-full bg-orange-500/20 blur-2xl animate-pulse" />

      {/* Flames */}
      <div className="relative flex items-end gap-1">

        {flames.map((_, index) => (
          <div
            key={index}
            className="relative flex items-end justify-center"
            style={{
              animation: `heatWave ${
                0.8 + Math.random() * 0.6
              }s ease-in-out infinite`,
              animationDelay: `${index * 0.08}s`,
            }}
          >
            <div
              className="rounded-full bg-gradient-to-t from-red-600 via-orange-400 to-yellow-300 opacity-90"
              style={{
                width: `${8 + Math.random() * 6}px`,
                height: `${20 + Math.random() * 30}px`,
                borderRadius: "50% 50% 45% 45%",
              }}
            />
          </div>
        ))}

      </div>

      {/* Center Icon */}
      <div className="absolute -top-8 text-orange-400 animate-pulse">
        <Flame size={24} />
      </div>

      <style>{`
        @keyframes heatWave {
          0% {
            transform: translateY(0px) scaleY(1);
            opacity: .8;
          }
          50% {
            transform: translateY(-6px) scaleY(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scaleY(1);
            opacity: .8;
          }
        }
      `}</style>

    </div>
  );
}