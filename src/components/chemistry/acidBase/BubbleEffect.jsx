import React from "react";

export default function BubbleEffect({
  active = false,
  count = 20,
  color = "#ffffff",
}) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const size = 4 + Math.random() * 12;
        const left = Math.random() * 100;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 2;

        return (
          <span
            key={i}
            className="absolute rounded-full opacity-70 animate-bounce"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              bottom: "-20px",
              background: color,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}