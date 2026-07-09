import React from "react";
import {
  BookOpen,
  HelpCircle,
  FileText,
  BarChart3
} from "lucide-react";

const CBTDashboard = () => {
  const stats = [
    {
      title: "Subjects",
      value: 24,
      icon: BookOpen
    },
    {
      title: "Questions",
      value: 8500,
      icon: HelpCircle
    },
    {
      title: "Exams",
      value: 120,
      icon: FileText
    },
    {
      title: "Attempts",
      value: 15000,
      icon: BarChart3
    }
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          CBT Dashboard
        </h1>

        <p className="text-slate-400 mt-1">
          Manage computer based tests, questions and exams.
        </p>
      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >

              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Icon size={25}/>
              </div>

              <h2 className="text-slate-400">
                {item.title}
              </h2>

              <p className="text-3xl font-bold mt-2">
                {item.value}
              </p>

            </div>
          );
        })}

      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-4">
          Recent CBT Activity
        </h2>

        <div className="text-slate-400">
          No recent activity available.
        </div>

      </div>

    </div>
  );
};

export default CBTDashboard;