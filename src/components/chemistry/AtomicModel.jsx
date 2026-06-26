import React from "react";

export default function AtomicModel({ element }) {
  if (!element) return null;

  const shells = element.shells || [2, 8, 1];

  return (
    <div className="flex justify-center items-center py-6">
      <div className="relative w-64 h-64">

        {/* Nucleus */}
        <div
          className="
            absolute
            top-1/2
            left-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-14
            h-14
            rounded-full
            bg-cyan-500
            flex
            items-center
            justify-center
            text-black
            font-bold
            shadow-lg
          "
        >
          {element.symbol}
        </div>

        {shells.map((count, index) => {
          const size = 80 + index * 45;

          return (
            <div
              key={index}
              className="
                absolute
                border
                border-cyan-500/30
                rounded-full
              "
              style={{
                width: size,
                height: size,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {[...Array(count)].map((_, electronIndex) => {
                const angle =
                  (360 / count) * electronIndex;

                const radius = size / 2;

                const x =
                  radius +
                  Math.cos((angle * Math.PI) / 180) *
                    (radius - 8);

                const y =
                  radius +
                  Math.sin((angle * Math.PI) / 180) *
                    (radius - 8);

                return (
                  <div
                    key={electronIndex}
                    className="
                      absolute
                      w-3
                      h-3
                      rounded-full
                      bg-cyan-400
                    "
                    style={{
                      left: x - 6,
                      top: y - 6,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}