// src/pages/labs/chemistry/hooks/useIonMovement.js

import { useEffect, useMemo, useRef, useState } from "react";

/* ==========================================================
    CONFIGURATION
========================================================== */

const DEFAULT_PARTICLE_COUNT = 18;

const LEFT_MIN_X = 10;
const LEFT_MAX_X = 38;

const RIGHT_MIN_X = 62;
const RIGHT_MAX_X = 90;

const MIN_Y = 26;
const MAX_Y = 74;

const random = (min, max) =>
  Math.random() * (max - min) + min;

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

/* ==========================================================
    HOOK
========================================================== */

const useIonMovement = ({
  running = false,
  voltage = 0,

  particleCount = DEFAULT_PARTICLE_COUNT,

  anodeIon = "Zn²⁺",
  cathodeIon = "Cu²⁺",
} = {}) => {

  const frameRef = useRef();

  const [speed, setSpeed] = useState(1);

  const [cations, setCations] = useState([]);

  const [anions, setAnions] = useState([]);

/* ==========================================================
    SPEED
========================================================== */

  useEffect(() => {

    if (!running) {
      setSpeed(0);
      return;
    }

    setSpeed(Math.max(0.5, Math.min(4, voltage)));

  }, [running, voltage]);

/* ==========================================================
    CREATE PARTICLES
========================================================== */

  useEffect(() => {

    const positive = [];

    const negative = [];

    for (let i = 0; i < particleCount; i++) {

      positive.push({

        id: `cat-${i}`,

        x: random(LEFT_MIN_X, LEFT_MAX_X),

        y: random(MIN_Y, MAX_Y),

        dx: random(-0.3, 0.3),

        dy: random(-0.3, 0.3),

        label: anodeIon,

      });

      negative.push({

        id: `ani-${i}`,

        x: random(RIGHT_MIN_X, RIGHT_MAX_X),

        y: random(MIN_Y, MAX_Y),

        dx: random(-0.3, 0.3),

        dy: random(-0.3, 0.3),

        label: cathodeIon,

      });

    }

    setCations(positive);

    setAnions(negative);

  }, [particleCount, anodeIon, cathodeIon]);

/* ==========================================================
    IDLE MOVEMENT

    Before Start:
    - ions gently jiggle
    - remain inside beaker
========================================================== */
/* ==========================================================
    ANIMATION LOOP
========================================================== */

useEffect(() => {
  let frameId;

  const animate = () => {

    /* ==========================
        IDLE MODE
        (Before Start)
    ========================== */

    if (!running) {

      setCations((prev) =>
        prev.map((ion) => ({

          ...ion,

          x: clamp(
            ion.x + random(-0.12, 0.12),
            LEFT_MIN_X,
            LEFT_MAX_X
          ),

          y: clamp(
            ion.y + random(-0.12, 0.12),
            MIN_Y,
            MAX_Y
          ),

        }))
      );

      setAnions((prev) =>
        prev.map((ion) => ({

          ...ion,

          x: clamp(
            ion.x + random(-0.12, 0.12),
            RIGHT_MIN_X,
            RIGHT_MAX_X
          ),

          y: clamp(
            ion.y + random(-0.12, 0.12),
            MIN_Y,
            MAX_Y
          ),

        }))
      );

    }

    /* ==========================
        RUNNING MODE
        (After Start)
    ========================== */

    else {

      setCations((prev) =>
        prev.map((ion) => {

          let x = ion.x + random(-0.15, 0.15);

          let y = ion.y + random(-0.20, 0.20);

          // drift toward salt bridge
          x += speed * 0.04;

          return {

            ...ion,

            x: clamp(
              x,
              LEFT_MIN_X,
              LEFT_MAX_X
            ),

            y: clamp(
              y,
              MIN_Y,
              MAX_Y
            ),

          };

        })
      );

      setAnions((prev) =>
        prev.map((ion) => {

          let x = ion.x + random(-0.15, 0.15);

          let y = ion.y + random(-0.20, 0.20);

          // drift toward salt bridge
          x -= speed * 0.04;

          return {

            ...ion,

            x: clamp(
              x,
              RIGHT_MIN_X,
              RIGHT_MAX_X
            ),

            y: clamp(
              y,
              MIN_Y,
              MAX_Y
            ),

          };

        })
      );

    }

    frameId = requestAnimationFrame(animate);

    frameRef.current = frameId;

  };

  frameId = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(frameId);

}, [running, speed]);
/* ==========================================================
    RESET
========================================================== */

const reset = () => {

  setCations((prev) =>
    prev.map((ion) => ({
      ...ion,
      x: random(LEFT_MIN_X, LEFT_MAX_X),
      y: random(MIN_Y, MAX_Y),
    }))
  );

  setAnions((prev) =>
    prev.map((ion) => ({
      ...ion,
      x: random(RIGHT_MIN_X, RIGHT_MAX_X),
      y: random(MIN_Y, MAX_Y),
    }))
  );

};

/* ==========================================================
    PAUSE
========================================================== */

const pause = () => {

  if (frameRef.current) {
    cancelAnimationFrame(frameRef.current);
  }

};

/* ==========================================================
    RESUME

    Animation automatically resumes when
    running === true.
========================================================== */

const resume = () => {};

/* ==========================================================
    PREPARE OUTPUT
========================================================== */

const cationPositions = useMemo(() => {

  return cations.map((ion) => ({
    ...ion,
    label: anodeIon,
  }));

}, [cations, anodeIon]);

const anionPositions = useMemo(() => {

  return anions.map((ion) => ({
    ...ion,
    label: cathodeIon,
  }));

}, [anions, cathodeIon]);

const totalParticles =
  cationPositions.length +
  anionPositions.length;

/* ==========================================================
    RETURN
========================================================== */

return {

  speed,

  running,

  cations: cationPositions,

  anions: anionPositions,

  totalParticles,

  reset,

  pause,

  resume,

};

};

export default useIonMovement;