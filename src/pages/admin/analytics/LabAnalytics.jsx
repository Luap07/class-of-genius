import React from "react";
import {
  FlaskConical,
  Users,
  Activity,
  TrendingUp
} from "lucide-react";

const LabAnalytics = () => {
  const stats = [
    {
      title: "Total Experiments",
      value: "350",
      icon: FlaskConical
    },
    {
      title: "Lab Users",
      value: "38,000",
      icon: Users
    },
    {
      title: "Experiment Attempts",
      value: "95,400",
      icon: Activity
    },
    {
      title: "Growth",
      value: "+22%",
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Virtual Lab Analytics
        </h1>

        <p className="text-slate-400 mt-1">
          Track virtual laboratory usage and experiment performance.
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

              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-4">
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


      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-semibold mb-4">
            Popular Experiments
          </h2>

          <div className="h-64 flex items-center justify-center text-slate-500">
            Experiment Usage Chart
          </div>

        </div>


        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-semibold mb-4">
            Subject Activity
          </h2>

          <div className="h-64 flex items-center justify-center text-slate-500">
            Subject Analytics Chart
          </div>

        </div>

      </div>

    </div>
  );
};

export default LabAnalytics;