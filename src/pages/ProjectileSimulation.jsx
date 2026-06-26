import React, { useState, useRef, useEffect } from "react";
import usePhysicsClock from "../hooks/usePhysicsClock";
import useProjectileEngine from "../hooks/useProjectileEngine";
import useProjectileHistory from "../hooks/useProjectileHistory";
import ProjectileGraph from "../pages/VirtualLab/physics/ProjectileGraph";

const Panel = ({ title, children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 shadow-xl ${className}`}>
    <h3 className="text-slate-300 text-sm font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

export default function ProjectileSimulation() {
  const [velocity, setVelocity] = useState(25);
  const [angle, setAngle] = useState(45);
  const [playing, setPlaying] = useState(false);

  const { time, reset } = usePhysicsClock(playing);
  const { x, y, grounded } = useProjectileEngine(velocity, angle, time);
  const { history, addPoint, resetHistory } = useProjectileHistory();

  const scale = 5;
  const trailRef = useRef([]);

  useEffect(() => { if (grounded) setPlaying(false); }, [grounded]);
  useEffect(() => {
    if (playing) {
      trailRef.current.push({ x, y });
      addPoint(time, x, y, 0, 0);
      if (trailRef.current.length > 120) trailRef.current.shift();
    }
  }, [x, y, time, playing]);

  const handleReset = () => {
    setPlaying(false); reset(); resetHistory(); trailRef.current = [];
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold">PROJECTILE LAB</h1>

      <div className="grid lg:grid-cols-12 gap-6">
        <Panel title="CONTROLS" className="lg:col-span-3">
          <div className="space-y-4">
            <div><label className="text-xs text-slate-400">Angle: {angle}°</label><input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-slate-400">Velocity: {velocity} m/s</label><input type="range" min="1" max="50" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="w-full" /></div>
            <div className="flex gap-2"><button onClick={() => setPlaying(true)} className="flex-1 bg-green-600 p-2 rounded">▶ Play</button><button onClick={() => setPlaying(false)} className="flex-1 bg-yellow-600 p-2 rounded">⏸ Pause</button></div>
            <button onClick={handleReset} className="w-full bg-red-600 p-2 rounded">🔄 Reset</button>
          </div>
        </Panel>

        <Panel title="SIMULATION" className="lg:col-span-6 h-[400px] relative">
          <div className="relative w-full h-full bg-slate-950/60 rounded-lg border border-slate-800 overflow-hidden">
             {/* Trail rendering */}
             {trailRef.current.map((p, i) => <div key={i} className="absolute w-1 h-1 bg-yellow-300 rounded-full" style={{ left: `${10 + p.x * scale}px`, bottom: `${Math.max(0, p.y * scale)}px` }} />)}
             {/* Projectile */}
             <div className="absolute w-5 h-5 bg-yellow-400 rounded-full" style={{ left: `${10 + x * scale}px`, bottom: `${Math.max(0, y * scale)}px` }} />
             {/* Time label */}
             <div className="absolute text-xs bg-black/40 px-2 py-1 rounded" style={{ left: `${10 + x * scale + 12}px`, bottom: `${Math.max(0, y * scale + 12)}px` }}>t = {time.toFixed(1)}s</div>
          </div>
        </Panel>

        <Panel title="LIVE DATA" className="lg:col-span-3 space-y-4">
           <div><p className="text-xs text-slate-400">X Distance</p><p className="text-xl font-bold text-green-400">{x.toFixed(2)} m</p></div>
           <div><p className="text-xs text-slate-400">Y Height</p><p className="text-xl font-bold text-cyan-400">{y.toFixed(2)} m</p></div>
        </Panel>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-6">📊 Trajectory Graph Analysis</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Trajectory (X vs Y)"><ProjectileGraph data={history} type="trajectory" /></Panel>
        <Panel title="Height vs Time"><ProjectileGraph data={history} type="height" /></Panel>
        <Panel title="Velocity vs Time"><ProjectileGraph data={history} type="velocity" /></Panel>
      </div>
    </div>
  );
}