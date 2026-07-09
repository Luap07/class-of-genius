import React from "react";
import {
  BookOpen,
  Users,
  FlaskConical,
  FileQuestion,
  BookMarked,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Courses",
    value: "248",
    change: "+12%",
    color: "bg-blue-500",
    icon: BookOpen,
  },
  {
    title: "Students",
    value: "52,814",
    change: "+18%",
    color: "bg-emerald-500",
    icon: Users,
  },
  {
    title: "Virtual Labs",
    value: "124",
    change: "+6%",
    color: "bg-violet-500",
    icon: FlaskConical,
  },
  {
    title: "CBT Questions",
    value: "18,560",
    change: "+35%",
    color: "bg-orange-500",
    icon: FileQuestion,
  },
  {
    title: "Novels",
    value: "312",
    change: "+8%",
    color: "bg-pink-500",
    icon: BookMarked,
  },
  {
    title: "Revenue",
    value: "$42,580",
    change: "+15%",
    color: "bg-cyan-500",
    icon: DollarSign,
  },
  {
    title: "Growth",
    value: "92%",
    change: "+5%",
    color: "bg-indigo-500",
    icon: TrendingUp,
  },
  {
    title: "Active Users",
    value: "9,284",
    change: "Online",
    color: "bg-green-500",
    icon: Activity,
  },
];

const AdminStats = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color}`}
              >
                <Icon size={26} />
              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                {stat.change}
              </span>
            </div>

            <h3 className="mt-6 text-4xl font-bold">{stat.value}</h3>

            <p className="mt-2 text-slate-400">
              {stat.title}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;