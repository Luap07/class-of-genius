import React from "react";

export default function ElectronShells({ electrons }) {
  const shellCapacities = [2, 8, 18, 32, 32, 18, 8];

  let remaining = electrons;

  const shells = shellCapacities.map((capacity) => {
    const count = Math.min(remaining, capacity);
    remaining -= count;
    return count;
  });

  return (
    <>
      {shells.map((count, shellIndex) => {
        if (count === 0) return null;

        const radius = 70 + shellIndex * 35;

        return (
          <div
            key={shellIndex}
            className="absolute rounded-full border border-slate-600"
            style={{
              width: radius * 2,
              height: radius * 2,
            }}
          >
            {Array.from({ length: count }).map((_, electronIndex) => {
              const angle =
                (360 / count) * electronIndex;

              return (
                <div
                  key={electronIndex}
                  className="absolute w-3 h-3 bg-cyan-400 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `
                      rotate(${angle}deg)
                      translate(${radius}px)
                    `,
                    transformOrigin: "0 0",
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}