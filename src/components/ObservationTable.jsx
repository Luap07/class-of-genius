export default function ObservationTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <table className="w-full">
        <thead className="bg-slate-800">
          <tr>
            <th className="p-3">Force</th>
            <th className="p-3">Mass</th>
            <th className="p-3">Acceleration</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/10">
              <td className="p-3">{row.force}</td>
              <td className="p-3">{row.mass}</td>
              <td className="p-3">{row.acceleration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}