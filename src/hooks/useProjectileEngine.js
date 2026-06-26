import { useMemo } from "react";

const GRAVITY = 9.81;

export default function useProjectileEngine(v, angle, t) {
  const rad = (angle * Math.PI) / 180;

  return useMemo(() => {
    const vx = v * Math.cos(rad);
    const vy = v * Math.sin(rad);

    const x = vx * t;
    const yRaw = vy * t - 0.5 * GRAVITY * t * t;

    const grounded = yRaw <= 0;

    return {
      x,
      y: grounded ? 0 : yRaw,
      grounded,
    };
  }, [v, rad, t]);
}