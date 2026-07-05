// src/pages/labs/chemistry/hooks/useElectronFlow.js

import { useEffect, useMemo, useRef, useState } from "react";

/* ==========================================================
    useElectronFlow
========================================================== */

const useElectronFlow = ({
  running = false,
  voltage = 0,
  direction = "left-to-right",
  particleCount = 12,
}) => {
  const animationRef = useRef(null);

  const [electrons, setElectrons] = useState([]);

  const [speed, setSpeed] = useState(1);

  /* ==========================================================
      Calculate Speed From Voltage
  ========================================================== */

  useEffect(() => {
    if (voltage <= 0) {
      setSpeed(0);
      return;
    }

    const calculatedSpeed = Math.min(
      8,
      Math.max(1, voltage * 2)
    );

    setSpeed(calculatedSpeed);

  }, [voltage]);

  /* ==========================================================
      Generate Electron Particles
  ========================================================== */

  useEffect(() => {
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,

        progress: i / particleCount,

        size: 8,

        opacity: 1,
      });
    }

    setElectrons(particles);

  }, [particleCount]);

  /* ==========================================================
      Animation Loop
  ========================================================== */

  useEffect(() => {
    if (!running || speed === 0) return;

    let frame;

    const animate = () => {
      setElectrons((previous) =>
        previous.map((electron) => {
          let progress =
            electron.progress + speed * 0.0025;

          if (progress > 1)
            progress = 0;

          return {
            ...electron,
            progress,
          };
        })
      );

      frame =
        requestAnimationFrame(animate);
    };

    frame =
      requestAnimationFrame(animate);

    animationRef.current = frame;

    return () => {
      cancelAnimationFrame(frame);
    };

  }, [running, speed]);

  /* ==========================================================
      Reset
  ========================================================== */

  const reset = () => {
    setElectrons((previous) =>
      previous.map((electron, index) => ({
        ...electron,
        progress:
          index / previous.length,
      }))
    );
  };

  /* ==========================================================
      Pause
  ========================================================== */

  const pause = () => {
    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );
    }
  };

  /* ==========================================================
      Resume
  ========================================================== */

  const resume = () => {
    // Animation restarts automatically
    // because running becomes true.
  };

  /* ==========================================================
      Direction
  ========================================================== */

  const reversed =
    direction === "right-to-left";

  /* ==========================================================
      Electron Positions
  ========================================================== */

  const positions = useMemo(() => {
    return electrons.map((electron) => ({
      ...electron,

      x: reversed
        ? (1 - electron.progress) * 100
        : electron.progress * 100,

      y: 50,
    }));
  }, [electrons, reversed]);

  /* ==========================================================
      Return
  ========================================================== */

  return {
    electrons: positions,

    speed,

    running,

    reset,

    pause,

    resume,
  };
};

export default useElectronFlow;