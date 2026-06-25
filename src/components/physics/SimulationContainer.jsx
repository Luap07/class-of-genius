import { useEffect, useRef, useState } from "react";
import usePhysicsEngine from "../hooks/usePhysicsEngine";

export default function usePhysicsEngine() {
  const [forceData, setForceData] = useState([]);
  const [accelData, setAccelData] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [positionData, setPositionData] = useState([]);

  const state = useRef({
    time: 0,
    velocity: 0,
    position: 0,
    mass: 10,
  });

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const s = state.current;

      // 🧲 FORCE (you can later connect sliders/UI here)
      const force = 50 + Math.sin(s.time) * 20;

      // F = ma
      const acceleration = force / s.mass;

      // 🧠 Physics integration
      s.velocity += acceleration * dt;
      s.position += s.velocity * dt;
      s.time += dt;

      const point = (value) => ({
        time: s.time,
        value,
      });

      // 📈 Keep last 60 points (smooth graph)
      setForceData((prev) => [...prev.slice(-60), point(force)]);
      setAccelData((prev) => [...prev.slice(-60), point(acceleration)]);
      setVelocityData((prev) => [...prev.slice(-60), point(s.velocity)]);
      setPositionData((prev) => [...prev.slice(-60), point(s.position)]);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }, []);

  return {
    forceData,
    accelData,
    velocityData,
    positionData,
  };
}