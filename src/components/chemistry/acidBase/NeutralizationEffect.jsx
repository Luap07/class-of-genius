// src/components/chemistry/acidBase/NeutralizationEffect.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NeutralizationEffect({
  playing,
  active = false,
}) {
  return (
    <AnimatePresence>
      {playing && active && (
        <>
          {/* Flash */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0.2, 2.5, 3],
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="absolute left-1/2 top-1/2 w-40 h-40 rounded-full bg-green-400 blur-2xl pointer-events-none"
            style={{
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Sparkles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x:
                  Math.cos((i * 30 * Math.PI) / 180) *
                  140,
                y:
                  Math.sin((i * 30 * Math.PI) / 180) *
                  140,
                opacity: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.9,
              }}
              className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-emerald-300 shadow-lg"
            />
          ))}

          {/* Water Label */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.5,
            }}
            animate={{
              opacity: 1,
              y: -20,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.6,
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 text-cyan-300 font-bold text-xl"
          >
            H₂O + Salt
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}