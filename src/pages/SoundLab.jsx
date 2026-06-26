import React, { useEffect, useRef, useState } from "react";

const SoundLabV4 = () => {
  const [freq1, setFreq1] = useState(440);
  const [freq2, setFreq2] = useState(550);
  const [volume, setVolume] = useState(50);
  const [waveType, setWaveType] = useState("sine");
  const [isOn, setIsOn] = useState(false);
  const [doppler, setDoppler] = useState(false);

  const audioCtx = useRef(null);
  const osc1 = useRef(null);
  const osc2 = useRef(null);
  const gain = useRef(null);
  const canvasRef = useRef(null);

  const speedOfSound = 340;

  // 📊 Physics
  const wavelength1 = (speedOfSound / freq1).toFixed(2);
  const wavelength2 = (speedOfSound / freq2).toFixed(2);
  const beatFreq = Math.abs(freq1 - freq2);

  // 🎧 START AUDIO
  const startSound = () => {
    if (audioCtx.current) return;

    const ctx = new (window.AudioContext ||
      window.webkitAudioContext)();

    audioCtx.current = ctx;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();

    o1.type = waveType;
    o2.type = waveType;

    o1.frequency.value = freq1;
    o2.frequency.value = freq2;

    g.gain.value = volume / 100;

    o1.connect(g);
    o2.connect(g);
    g.connect(ctx.destination);

    o1.start();
    o2.start();

    osc1.current = o1;
    osc2.current = o2;
    gain.current = g;

    drawWave();
  };

  // 🛑 STOP AUDIO
  const stopSound = () => {
    osc1.current?.stop();
    osc2.current?.stop();
    audioCtx.current?.close();

    audioCtx.current = null;
  };

  // 🔄 LIVE UPDATE SOUND
  useEffect(() => {
    if (!osc1.current) return;

    let f1 = doppler ? freq1 + 20 : freq1;
    let f2 = doppler ? freq2 - 20 : freq2;

    osc1.current.frequency.setValueAtTime(
      f1,
      audioCtx.current.currentTime
    );

    osc2.current.frequency.setValueAtTime(
      f2,
      audioCtx.current.currentTime
    );
  }, [freq1, freq2, doppler]);

  useEffect(() => {
    if (gain.current) {
      gain.current.gain.value = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (osc1.current) osc1.current.type = waveType;
    if (osc2.current) osc2.current.type = waveType;
  }, [waveType]);

  // 📈 OSCILLOSCOPE
  const drawWave = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const render = () => {
      requestAnimationFrame(render);

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() / 200;

      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        let y =
          canvas.height / 2 +
          Math.sin(x * 0.02 + time * freq1 * 0.001) * 30 +
          Math.sin(x * 0.02 + time * freq2 * 0.001) * 30;

        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    render();
  };

  const toggleSound = () => {
    if (!isOn) startSound();
    else stopSound();
    setIsOn(!isOn);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <h1 className="text-4xl font-bold mb-6">
        🔊 SOUND LAB v4 — PHET LEVEL ULTIMATE
      </h1>

      {/* CONTROLS */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="bg-slate-900 p-4 rounded-xl">
          <p>Frequency 1: {freq1} Hz</p>
          <input
            type="range"
            min="100"
            max="1000"
            value={freq1}
            onChange={(e) => setFreq1(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="bg-slate-900 p-4 rounded-xl">
          <p>Frequency 2: {freq2} Hz</p>
          <input
            type="range"
            min="100"
            max="1000"
            value={freq2}
            onChange={(e) => setFreq2(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* WAVE TYPE + CONTROL */}
        <div className="bg-slate-900 p-4 rounded-xl flex flex-col gap-2">

          <select
            value={waveType}
            onChange={(e) => setWaveType(e.target.value)}
            className="bg-slate-800 p-2 rounded"
          >
            <option value="sine">Sine Wave</option>
            <option value="square">Square Wave</option>
            <option value="triangle">Triangle Wave</option>
            <option value="sawtooth">Sawtooth Wave</option>
          </select>

          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded font-bold ${
              isOn ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {isOn ? "Stop" : "Start"}
          </button>

          <button
            onClick={() => setDoppler(!doppler)}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            {doppler ? "Stop Doppler" : "Doppler Effect"}
          </button>
        </div>
      </div>

      {/* WAVE DISPLAY */}
      <div className="bg-slate-900 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-bold mb-4">
          🌊 Wave Interference Oscilloscope
        </h2>

        <canvas
          ref={canvasRef}
          width={900}
          height={300}
          className="w-full bg-slate-950 rounded-xl"
        />
      </div>

      {/* CALCULATIONS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Wavelength 1</h2>
          <p className="text-cyan-400 text-2xl">
            {wavelength1} m
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Wavelength 2</h2>
          <p className="text-green-400 text-2xl">
            {wavelength2} m
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h2>Beat Frequency</h2>
          <p className="text-yellow-400 text-2xl">
            {beatFreq.toFixed(2)} Hz
          </p>
        </div>
      </div>

      {/* FORMULA PANEL */}
      <div className="bg-slate-900 mt-8 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-3">
          Physics Formulas
        </h2>

        <p>v = f × λ</p>
        <p>λ = 340 / f</p>
        <p>Beat Frequency = |f₁ - f₂|</p>
        <p>Wave Types: sine, square, triangle, sawtooth</p>
      </div>

    </div>
  );
};

export default SoundLabV4;