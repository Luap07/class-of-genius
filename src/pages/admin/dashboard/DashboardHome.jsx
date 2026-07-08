import React from "react";
import {
  GraduationCap,
  FlaskConical,
  BookOpen,
  FileText,
  Users,
  Trophy,
  TrendingUp,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Courses",
    value: "248",
    icon: GraduationCap,
    color: "bg-blue-500",
  },
  {
    title: "Virtual Labs",
    value: "36",
    icon: FlaskConical,
    color: "bg-emerald-500",
  },
  {
    title: "Novels",
    value: "514",
    icon: BookOpen,
    color: "bg-purple-500",
  },
  {
    title: "CBT Questions",
    value: "12,485",
    icon: FileText,
    color: "bg-orange-500",
  },
  {
    title: "Students",
    value: "58,421",
    icon: Users,
    color: "bg-cyan-500",
  },
  {
    title: "Certificates",
    value: "8,732",
    icon: Trophy,
    color: "bg-pink-500",
  },
];

const recentActivities = [
  {
    title: "New Physics Course Published",
    time: "5 mins ago",
  },
  {
    title: "120 students registered",
    time: "20 mins ago",
  },
  {
    title: "Chemistry Lab Updated",
    time: "1 hour ago",
  },
  {
    title: "45 CBT Questions Added",
    time: "Today",
  },
  {
    title: "New Novel Uploaded",
    time: "Today",
  },
];

const quickActions = [
  "Create Course",
  "Upload Novel",
  "Add CBT Question",
  "Create Lab",
  "Manage Users",
  "View Analytics",
];

const DashboardHome = () => {
  return (
    <div className="space-y-8">

      {/* Welcome */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 p-8">

        <h1 className="text-4xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="mt-3 text-blue-100 text-lg">
          Manage every part of Scholiqen from one place.
        </p>

      </div>

      {/* Stats */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

        {stats.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-slate-400">
                    {item.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {item.value}
                  </h2>

                </div>

                <div
                  className={`${item.color} rounded-2xl p-4`}
                >
                  <Icon size={30} />
                </div>

              </div>

            </div>
          );

        })}

      </div>

      {/* Middle */}

      <div className="grid gap-8 lg:grid-cols-3">

        {/* Analytics */}

        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Platform Growth
            </h2>

            <TrendingUp className="text-green-400" />

          </div>

          <div className="mt-8 h-72 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center">

            <p className="text-slate-500">
              Analytics Chart Coming Soon
            </p>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-6 space-y-4">

            {quickActions.map((action) => (

              <button
                key={action}
                className="flex w-full items-center justify-between rounded-2xl bg-slate-800 p-4 transition hover:bg-blue-600"
              >

                <span>{action}</span>

                <ArrowUpRight size={18} />

              </button>

            ))}

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="grid gap-8 lg:grid-cols-2">

        {/* Activities */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold">
            Recent Activities
          </h2>

          <div className="mt-6 space-y-5">

            {recentActivities.map((activity) => (

              <div
                key={activity.title}
                className="flex items-center justify-between border-b border-slate-800 pb-4"
              >

                <div>

                  <p>{activity.title}</p>

                  <p className="mt-1 text-sm text-slate-400">

                    <Clock3
                      size={14}
                      className="inline mr-2"
                    />

                    {activity.time}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* System Status */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold">
            System Status
          </h2>

          <div className="mt-6 space-y-5">

            <Status
              name="LMS"
              color="bg-green-500"
            />

            <Status
              name="Virtual Labs"
              color="bg-green-500"
            />

            <Status
              name="CBT Engine"
              color="bg-green-500"
            />

            <Status
              name="Novel Library"
              color="bg-green-500"
            />

            <Status
              name="Authentication"
              color="bg-green-500"
            />

            <Status
              name="Storage"
              color="bg-yellow-500"
            />

          </div>

        </div>

      </div>

    </div>
  );
};

const Status = ({ name, color }) => (
  <div className="flex items-center justify-between">

    <span>{name}</span>

    <div className="flex items-center gap-2">

      <div className={`h-3 w-3 rounded-full ${color}`} />

      <span className="text-sm text-slate-400">
        Operational
      </span>

    </div>

  </div>
);

export default DashboardHome;