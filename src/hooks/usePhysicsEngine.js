import { useEffect, useRef, useState } from "react";

export default function usePhysicsEngine(force, mass, friction, playing, resetKey) {
  const [forceData, setForceData] = useState([]);
  const [accelData, setAccelData] = useState([]);
  const [velocityData, setVelocityData] = useState([]);

  const state = useRef({
    time: 0,
    velocity: 0,
    position: 0,
  });

  const frameRef = useRef(null);

  // RESET ENGINE
  useEffect(() => {
    state.current = { time: 0, velocity: 0, position: 0 };
    setForceData([]);
    setAccelData([]);
    setVelocityData([]);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const s = state.current;

      const netForce = force - friction * mass;
      const acceleration = netForce / mass;

      s.velocity += acceleration * dt;
      s.position += s.velocity * dt;
      s.time += dt;

      const point = (value) => ({
        time: s.time,
        value,
      });

      setForceData((p) => [...p.slice(-80), point(force)]);
      setAccelData((p) => [...p.slice(-80), point(acceleration)]);
      setVelocityData((p) => [...p.slice(-80), point(s.velocity)]);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameRef.current);
  }, [playing, force, mass, friction]);

  return {
    forceData,
    accelData,
    velocityData,
    position: state.current.position,
  };
}