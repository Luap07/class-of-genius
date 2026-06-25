export default function ApparatusPanel({
  force,
  setForce,
  mass,
  setMass,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-6 text-xl font-bold">Apparatus Controls</h2>

      <div className="space-y-6">
        <div>
          <label>Force: {force}N</label>
          <input
            type="range"
            min="0"
            max="50"
            value={force}
            onChange={(e) => setForce(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label>Mass: {mass}kg</label>
          <input
            type="range"
            min="1"
            max="10"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}