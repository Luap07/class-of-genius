import { useEffect, useRef, useState } from "react";

export default function usePhysicsClock(isRunning, speed = 1) {
  const [time, setTime] = useState(0);
  const frameRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    const loop = (t) => {
      if (lastRef.current == null) lastRef.current = t;

      const delta = (t - lastRef.current) / 1000;
      lastRef.current = t;

      setTime((prev) => prev + delta * speed);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      lastRef.current = null;
    };
  }, [isRunning, speed]);

  const reset = () => setTime(0);

  return { time, reset };
}