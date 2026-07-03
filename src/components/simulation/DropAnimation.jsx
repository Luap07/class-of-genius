// src/components/simulation/DropAnimation.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const DropAnimation = ({
  isDropping = false,
  color = "#38bdf8",

  // Position of the burette tip
  x = "50%",
  startY = 80,

  // Position of the flask
  endY = 360,

  // Number of simultaneous droplets
  dropCount = 4,

  // Animation speed
  speed = 0.7,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      <AnimatePresence>

        {isDropping &&
          Array.from({ length: dropCount }).map((_, i) => {

            const size = 8 + Math.random() * 6;
            const delay = i * 0.18;

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: x,
                  top: startY,
                  marginLeft: -size / 2,
                }}
                initial={{
                  y: 0,
                  opacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  y: endY,
                  opacity: [0, 1, 1, 0],
                  scale: [0.7, 1, 1, 0.8],
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: speed,
                  ease: "easeIn",
                  repeat: Infinity,
                  delay,
                }}
              >
                {/* Water Drop */}
                <svg
                  width={size}
                  height={size * 1.5}
                  viewBox="0 0 24 36"
                >
                  <motion.path
                    d="
                      M12 2
                      C12 2 4 14 4 20
                      A8 8 0 0 0 20 20
                      C20 14 12 2 12 2
                      Z
                    "
                    fill={color}
                    animate={{
                      scaleY: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.35,
                      repeat: Infinity,
                    }}
                  />
                </svg>

                {/* Splash */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: endY - startY + 2,
                  }}
                  initial={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: [0, 1.4, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    delay: speed,
                  }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: 12,
                      height: 4,
                      background: color,
                    }}
                  />
                </motion.div>

              </motion.div>
            );
          })}

      </AnimatePresence>

    </div>
  );
};

export default DropAnimation;