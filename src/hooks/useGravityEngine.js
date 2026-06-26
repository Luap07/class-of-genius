import { useEffect, useRef, useState } from "react";

export default function useGravityEngine(
  gravity,
  startHeight,
  playing,
  resetKey
) {
  const [height, setHeight] = useState(startHeight);
  const [velocity, setVelocity] = useState(0);
  const [time, setTime] = useState(0);

  const animationRef = useRef(null);

  const state = useRef({
    height: startHeight,
    velocity: 0,
    time: 0,
  });

  useEffect(() => {
    state.current = {
      height: startHeight,
      velocity: 0,
      time: 0,
    };

    setHeight(startHeight);
    setVelocity(0);
    setTime(0);

    cancelAnimationFrame(animationRef.current);
  }, [resetKey, startHeight]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      state.current.velocity += gravity * dt;
      state.current.height -= state.current.velocity * dt;
      state.current.time += dt;

      if (state.current.height <= 0) {
        state.current.height = 0;

        setHeight(0);
        setVelocity(state.current.velocity);
        setTime(state.current.time);

        cancelAnimationFrame(animationRef.current);
        return;
      }

      setHeight(state.current.height);
      setVelocity(state.current.velocity);
      setTime(state.current.time);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [playing, gravity]);

  return {
    height,
    velocity,
    time,
    impactSpeed: velocity,
  };
}