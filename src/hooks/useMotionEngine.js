import { useEffect, useRef, useState } from "react";

export default function useMotionEngine(
  force,
  mass,
  friction,
  playing,
  resetKey
) {
  const [velocityData, setVelocityData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [accelData, setAccelData] = useState([]);

  const animationRef = useRef(null);

  const state = useRef({
    t: 0,
    v: 0,
    x: 0,
  });

  // RESET
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    state.current = {
      t: 0,
      v: 0,
      x: 0,
    };

    setVelocityData([]);
    setPositionData([]);
    setAccelData([]);
  }, [resetKey]);

  // SIMULATION LOOP
  useEffect(() => {
    if (!playing) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let last = performance.now();

    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      const s = state.current;

      // Physics
      const frictionForce = friction * s.v;
      const netForce = force - frictionForce;
      const acceleration = netForce / mass;

      // Update velocity
      s.v += acceleration * dt;

      // Prevent moving backward
      if (s.v < 0) {
        s.v = 0;
      }

      // Update position
      s.x += s.v * dt;

      // Prevent negative position
      if (s.x < 0) {
        s.x = 0;
      }

      s.t += dt;

      const point = (value) => ({
        time: Number(s.t.toFixed(2)),
        value: Number(value.toFixed(4)),
      });

      setVelocityData((prev) => [
        ...prev.slice(-100),
        point(s.v),
      ]);

      setPositionData((prev) => [
        ...prev.slice(-100),
        point(s.x),
      ]);

      setAccelData((prev) => [
        ...prev.slice(-100),
        point(acceleration),
      ]);

      animationRef.current =
        requestAnimationFrame(loop);
    };

    animationRef.current =
      requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    playing,
    force,
    mass,
    friction,
  ]);

  return {
    velocityData,
    positionData,
    accelData,
  };
}