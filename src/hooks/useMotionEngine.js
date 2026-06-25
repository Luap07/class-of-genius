import { useEffect, useRef, useState } from "react";

export default function useMotionEngine(force, mass, friction, playing, resetKey) {
  const [velocityData, setVelocityData] = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [accelData, setAccelData] = useState([]);

  const state = useRef({
    t: 0,
    v: 0,
    x: 0,
  });

  useEffect(() => {
    state.current = { t: 0, v: 0, x: 0 };
    setVelocityData([]);
    setPositionData([]);
    setAccelData([]);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return;

    let last = performance.now();

    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      const s = state.current;

      // FORCE MODEL
      const netForce = force - friction * s.v;
      const acceleration = netForce / mass;

      // INTEGRATION (motion engine)
      s.v += acceleration * dt;
      s.x += s.v * dt;
      s.t += dt;

      const point = (value) => ({
        time: s.t,
        value,
      });

      setVelocityData((p) => [...p.slice(-80), point(s.v)]);
      setPositionData((p) => [...p.slice(-80), point(s.x)]);
      setAccelData((p) => [...p.slice(-80), point(acceleration)]);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }, [playing, force, mass, friction]);

  return {
    velocityData,
    positionData,
    accelData,
  };
}