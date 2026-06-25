export default function ExperimentHeader({
  title,
  objective,
  theory,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="mt-4">
        <h2 className="font-semibold text-blue-400">Objective</h2>
        <p className="text-slate-300">{objective}</p>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold text-indigo-400">Theory</h2>
        <p className="text-slate-300">{theory}</p>
      </div>
    </div>
  );
}