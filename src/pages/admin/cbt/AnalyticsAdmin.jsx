import React from "react";
import {
  TrendingUp,
  Users,
  FileText,
  Award
} from "lucide-react";

const AnalyticsAdmin = () => {
  const stats = [
    {
      title: "Total Attempts",
      value: "15,420",
      icon: FileText
    },
    {
      title: "Active Students",
      value: "8,350",
      icon: Users
    },
    {
      title: "Average Score",
      value: "76%",
      icon: TrendingUp
    },
    {
      title: "Certificates",
      value: "5,200",
      icon: Award
    }
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          CBT Analytics
        </h1>

        <p className="text-slate-400 mt-1">
          Analyze examination performance and statistics.
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
                <Icon size={24}/>
              </div>

              <p className="text-slate-400">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {item.value}
              </h2>

            </div>
          );
        })}

      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-4">
          Performance Overview
        </h2>

        <div className="h-64 flex items-center justify-center text-slate-500">
          Chart Component Goes Here
        </div>

      </div>

    </div>
  );
};

export default AnalyticsAdmin;