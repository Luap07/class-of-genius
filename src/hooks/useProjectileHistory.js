import { useState, useCallback } from "react";

export default function useProjectileHistory() {
  const [history, setHistory] = useState([]);

  const addPoint = useCallback((t, x, y, vx = 0, vy = 0) => {
    setHistory((prev) => [
      ...prev,
      { t, x, y, vx, vy }
    ]);
  }, []);

  const resetHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addPoint, resetHistory };
}