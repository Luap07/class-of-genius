import { useEffect, useRef, useState } from "react";

export default function useEnergyEngine(mass, velocity, height, running) {
  const [state, setState] = useState({
    time: 0,
    kinetic: 0,
    potential: 0,
    total: 0,
    work: 0,
  });

  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const g = 9.81;

  const reset = () => {
    setState({
      time: 0,
      kinetic: 0,
      potential: 0,
      total: 0,
      work: 0,
    });
    lastTimeRef.current = null;
  };

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const step = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;

      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      setState((prev) => {
        const time = prev.time + dt;

        const kinetic = 0.5 * mass * velocity * velocity;
        const potential = mass * g * Math.max(height - time * 2, 0);
        const total = kinetic + potential;
        const work = kinetic; // simplified learning model

        return { time, kinetic, potential, total, work };
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
  }, [running, mass, velocity, height]);

  return { ...state, reset };
}