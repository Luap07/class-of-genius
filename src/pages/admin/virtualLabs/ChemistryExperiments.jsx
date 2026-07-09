import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const ChemistryExperiments = () => {
  const [experiments] = useState([
    {
      id: 1,
      title: "Acid Base Titration",
      level: "Beginner",
      students: 3200,
      status: "Published"
    },
    {
      id: 2,
      title: "Chemical Reaction Simulator",
      level: "Advanced",
      students: 1400,
      status: "Draft"
    }
  ]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Chemistry Experiments
          </h1>

          <p className="text-slate-400 mt-1">
            Manage chemistry simulations and practical experiments.
          </p>
        </div>

        <AdminButton>
          <span className="flex items-center gap-2">
            <Plus size={18}/>
            Add Experiment
          </span>
        </AdminButton>
      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-6 py-4">
                Experiment
              </th>

              <th className="px-6 py-4">
                Level
              </th>

              <th className="px-6 py-4">
                Students
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>


          <tbody>
            {experiments.map((experiment) => (
              <tr
                key={experiment.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {experiment.title}
                </td>

                <td className="px-6 py-4">
                  {experiment.level}
                </td>

                <td className="px-6 py-4">
                  {experiment.students}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      experiment.status === "Published"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {experiment.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-3">

                    <button className="text-blue-400">
                      <Edit size={18}/>
                    </button>

                    <button className="text-red-400">
                      <Trash2 size={18}/>
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ChemistryExperiments;