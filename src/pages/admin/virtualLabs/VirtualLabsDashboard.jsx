import React from "react";
import {
  FlaskConical,
  Atom,
  Dna,
  Calculator
} from "lucide-react";

const VirtualLabsDashboard = () => {
  const labs = [
    {
      title: "Physics Lab",
      icon: Atom,
      experiments: 45,
      path: "/admin/virtual-labs/physics"
    },
    {
      title: "Chemistry Lab",
      icon: FlaskConical,
      experiments: 38,
      path: "/admin/virtual-labs/chemistry"
    },
    {
      title: "Biology Lab",
      icon: Dna,
      experiments: 30,
      path: "/admin/virtual-labs/biology"
    },
    {
      title: "Mathematics Lab",
      icon: Calculator,
      experiments: 25,
      path: "/admin/virtual-labs/mathematics"
    }
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Virtual Labs Dashboard
        </h1>

        <p className="text-slate-400 mt-1">
          Manage simulations and practical experiments.
        </p>
      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        {labs.map((lab) => {
          const Icon = lab.icon;

          return (
            <div
              key={lab.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition"
            >

              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <Icon size={26}/>
              </div>


              <h2 className="text-xl font-semibold">
                {lab.title}
              </h2>


              <p className="text-slate-400 mt-2">
                {lab.experiments} Experiments
              </p>


              <button className="mt-4 text-blue-400 text-sm hover:text-blue-300">
                Manage Lab →
              </button>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default VirtualLabsDashboard;