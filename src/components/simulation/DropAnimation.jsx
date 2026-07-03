// src/components/simulation/DropAnimation.jsx

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const DropAnimation = ({
  isDropping = false,
  dropCount = 1,
  color = "#38bdf8",
  speed = 0.8,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <AnimatePresence>

        {isDropping &&
          Array.from({ length: dropCount }).map((_, index) => (
            <motion.div
              key={`${index}-${Date.now()}`}
              initial={{
                y: -30,
                opacity: 0,
                scale: 0.6,
              }}
              animate={{
                y: 340,
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1, 1, 0.8],
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: speed,
                delay: index * 0.08,
                ease: "easeIn",
              }}
              className="absolute left-1/2 -translate-x-1/2"
            >
              {/* Drop */}
              <svg
                width="18"
                height="28"
                viewBox="0 0 24 36"
              >
                <motion.path
                  d="M12 2
                     C12 2 4 13 4 20
                     A8 8 0 0 0 20 20
                     C20 13 12 2 12 2Z"
                  fill={color}
                  animate={{
                    scaleY: [1, 1.08, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4,
                  }}
                />
              </svg>
            </motion.div>
          ))}

      </AnimatePresence>
    </div>
  );
};

export default DropAnimation;