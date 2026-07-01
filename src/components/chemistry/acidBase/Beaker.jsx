import React from "react";
import { motion } from "framer-motion";
import { Beaker as BeakerIcon } from "lucide-react";

export default function Beaker({
  acid,
  base,
  reaction,
}) {
  const fill =
    acid && base
      ? 70
      : acid || base
      ? 35
      : 0;

  const color =
    reaction?.color ||
    (acid
      ? acid.color
      : base
      ? base.color
      : "#64748b");

  const bubbles = reaction?.bubbles || false;

  const heating = reaction?.heat || false;

  const reactants = [];

  if (acid) reactants.push(acid);

  if (base) reactants.push(base);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

      {/* Heat Glow */}

      {heating && (
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
          className="absolute w-64 h-64 rounded-full bg-orange-500/20 blur-3xl"
        />
      )}

      {/* Beaker */}

      <div className="relative">

        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-cyan-400">

          <BeakerIcon size={22} />

          <span className="font-semibold">
            Reaction Beaker
          </span>

        </div>

        <div className="relative w-56 h-72 rounded-b-3xl rounded-t-xl border-[5px] border-slate-300/40 bg-white/5 backdrop-blur-sm overflow-hidden">

          {/* Liquid */}

          <motion.div
            initial={{
              height: 0,
            }}
            animate={{
              height: `${fill}%`,
              backgroundColor: color,
            }}
            transition={{
              duration: 0.8,
            }}
            className="absolute bottom-0 left-0 w-full"
          >

            {/* Surface */}

            <motion.div
              animate={{
                x: [-20, 20, -20],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="absolute top-0 left-0 w-[140%] h-3 bg-white/25 rounded-full"
            />

            {/* Bubbles */}

            {bubbles &&
              [...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: 40,
                    opacity: 0,
                  }}
                  animate={{
                    y: -220,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2 + Math.random(),
                    delay: Math.random(),
                  }}
                  className="absolute rounded-full bg-white/70"
                  style={{
                    width:
                      6 + Math.random() * 10,
                    height:
                      6 + Math.random() * 10,
                    left:
                      `${Math.random() * 90}%`,
                    bottom: 0,
                  }}
                />
              ))}

          </motion.div>

          {/* Glass Reflection */}

          <div className="absolute left-4 top-4 bottom-6 w-3 rounded-full bg-white/20" />

        </div>

        {/* Reactants */}

        {reactants.length > 0 && (

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2">

            {reactants.map((item) => (

              <div
                key={item.id}
                className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-white"
              >
                {item.formula}
              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}