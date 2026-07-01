// src/components/chemistry/acidBase/MoleculeAnimation.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MoleculeAnimation({
  acid,
  base,
  reaction,
  playing,
  speed = 1,
}) {
  if (!acid || !base) return null;

  const products = reaction?.products || [];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Acid Particles */}

      <AnimatePresence>
        {playing &&
          [...Array(10)].map((_, i) => (
            <motion.div
              key={`acid-${i}`}
              initial={{
                x: 80,
                y: 60 + i * 28,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                x: 310,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 2 / speed,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.08,
              }}
              className="absolute w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg"
            >
              {acid.formula}
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Base Particles */}

      <AnimatePresence>
        {playing &&
          [...Array(10)].map((_, i) => (
            <motion.div
              key={`base-${i}`}
              initial={{
                x: 620,
                y: 60 + i * 28,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                x: 390,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 2 / speed,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.08,
              }}
              className="absolute w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg"
            >
              {base.formula}
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Collision Flash */}

      <AnimatePresence>
        {playing && reaction?.success && (
          <motion.div
            initial={{
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: 2.5,
              opacity: 0,
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5 / speed,
            }}
            className="absolute left-1/2 top-1/2 w-28 h-28 rounded-full bg-green-400/40"
            style={{
              transform: "translate(-50%,-50%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Products */}

      <AnimatePresence>
        {reaction?.success &&
          products.map((product, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                scale: 0,
                x: 350,
                y: 220,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 220 + Math.random() * 220,
                y: 70 + Math.random() * 180,
              }}
              transition={{
                duration: 1,
                delay: i * 0.25,
              }}
              className="absolute px-3 py-1 rounded-full bg-cyan-400 text-slate-900 font-bold shadow-lg"
            >
              {typeof product === "string"
                ? product
                : product.formula || product.name}
            </motion.div>
          ))}
      </AnimatePresence>

    </div>
  );
}