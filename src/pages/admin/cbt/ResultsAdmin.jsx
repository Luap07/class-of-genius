import React, { useState } from "react";
import { Eye } from "lucide-react";

import AdminSearch from "../../../components/admin/ui/AdminSearch";

const ResultsAdmin = () => {
  const [search, setSearch] = useState("");

  const [results] = useState([
    {
      id: 1,
      student: "David Johnson",
      exam: "WAEC Physics Mock Exam",
      score: "85%",
      grade: "A",
      date: "July 2026"
    },
    {
      id: 2,
      student: "Sarah Williams",
      exam: "JAMB Mathematics Practice",
      score: "72%",
      grade: "B",
      date: "July 2026"
    }
  ]);

  const filteredResults = results.filter((result) =>
    result.student.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          CBT Results
        </h1>

        <p className="text-slate-400 mt-1">
          Monitor student examination performance.
        </p>
      </div>


      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search students..."
      />


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4">
                Student
              </th>

              <th className="px-6 py-4">
                Exam
              </th>

              <th className="px-6 py-4">
                Score
              </th>

              <th className="px-6 py-4">
                Grade
              </th>

              <th className="px-6 py-4">
                Date
              </th>

              <th className="px-6 py-4">
                Action
              </th>
            </tr>
          </thead>


          <tbody>
            {filteredResults.map((result) => (
              <tr
                key={result.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {result.student}
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {result.exam}
                </td>

                <td className="px-6 py-4">
                  {result.score}
                </td>

                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400">
                    {result.grade}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {result.date}
                </td>

                <td className="px-6 py-4">
                  <button className="text-blue-400 hover:text-blue-300">
                    <Eye size={18}/>
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ResultsAdmin;
