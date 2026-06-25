import React from "react";
import { motion } from "framer-motion";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: Math.random() * 8 + 2,
  left: Math.random() * 100,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 5,
}));

const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            bottom: "-20px",
          }}
          animate={{
            y: [-20, -1200],
            opacity: [0, 1, 1, 0],
            x: [0, 30, -30, 20, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}

      {particles.map((particle) => (
        <motion.div
          key={`purple-${particle.id}`}
          className="absolute rounded-full bg-purple-400/20"
          style={{
            width: particle.size / 1.5,
            height: particle.size / 1.5,
            left: `${(particle.left + 30) % 100}%`,
            bottom: "-20px",
          }}
          animate={{
            y: [-20, -1200],
            opacity: [0, 1, 1, 0],
            x: [0, -25, 25, -15, 0],
          }}
          transition={{
            duration: particle.duration + 5,
            repeat: Infinity,
            delay: particle.delay + 1,
            ease: "linear",
          }}
        />
      ))}

    </div>
  );
};

export default FloatingParticles;