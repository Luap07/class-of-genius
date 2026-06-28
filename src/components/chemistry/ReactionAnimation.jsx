import React, { useEffect, useRef, useState } from "react";

const random = (min, max) => Math.random() * (max - min) + min;

export default function ReactionAnimation({
  running = false,
  reactionType = "neutral",
  temperature = 25,
}) {
  const animationRef = useRef();
  const [bubbles, setBubbles] = useState([]);
  const [smoke, setSmoke] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [flash, setFlash] = useState(false);

  const createBubble = () => ({ id: Math.random(), x: random(180, 420), y: 360, size: random(6, 18), speed: random(0.6, 2), opacity: 1 });
  const createSmoke = () => ({ id: Math.random(), x: random(190, 410), y: 220, size: random(20, 45), speed: random(0.4, 1.2), opacity: 0.45 });
  const createSpark = () => ({ id: Math.random(), x: 300, y: 260, dx: random(-4, 4), dy: random(-5, -1), life: 1 });

  // 1. Spawning Loop
  useEffect(() => {
    if (!running) return;
    animationRef.current = setInterval(() => {
      if (Math.random() < 0.55) setBubbles(prev => [...prev, createBubble()]);
      if (temperature > 60 && Math.random() < 0.18) setSmoke(prev => [...prev, createSmoke()]);
      if (reactionType === "combustion" && Math.random() < 0.25) setSparks(prev => [...prev, createSpark()]);
    }, 120);
    return () => clearInterval(animationRef.current);
  }, [running, temperature, reactionType]);

  // 2. Physics Loops
  useEffect(() => {
    if (!running) return;
    const bId = setInterval(() => {
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - b.speed, opacity: b.opacity - 0.008, size: b.size + 0.02 })).filter(b => b.opacity > 0 && b.y > -30));
      setSmoke(prev => prev.map(s => ({ ...s, y: s.y - s.speed, opacity: s.opacity - 0.003, size: s.size + 0.08 })).filter(s => s.opacity > 0));
      setSparks(prev => prev.map(s => ({ ...s, x: s.x + s.dx, y: s.y + s.dy, dy: s.dy + 0.12, life: s.life - 0.03 })).filter(s => s.life > 0));
    }, 16);
    return () => clearInterval(bId);
  }, [running]);

  // 3. Flash Effect
  useEffect(() => {
    if (running && reactionType === "combustion") {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 180);
      return () => clearTimeout(t);
    }
  }, [running, reactionType]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Flash */}
      {flash && <div className="absolute inset-0 bg-yellow-300 opacity-[0.18]" />}

      {/* Bubbles */}
      {bubbles.map(b => (
        <div key={b.id} className="absolute rounded-full border border-cyan-200" style={{ left: b.x, top: b.y, width: b.size, height: b.size, opacity: b.opacity, background: "rgba(180,240,255,.18)", boxShadow: "0 0 8px rgba(150,240,255,.4)" }} />
      ))}

      {/* Smoke */}
      {smoke.map(s => (
        <div key={s.id} className="absolute rounded-full bg-slate-400 blur-xl" style={{ left: s.x, top: s.y, width: s.size, height: s.size, opacity: s.opacity }} />
      ))}

      {/* Sparks */}
      {sparks.map(s => (
        <div key={s.id} className="absolute bg-orange-500 rounded-full" style={{ left: s.x, top: s.y, width: 4, height: 4, opacity: s.life, boxShadow: "0 0 6px #f97316" }} />
      ))}
    </div>
  );
}