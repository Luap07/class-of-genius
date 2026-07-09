// src/admin/AdminDashboard.jsx

import React from "react";
import {
  Users,
  GraduationCap,
  FlaskConical,
  BookOpen,
  FileQuestion,
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";

import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Users",
    value: "24,856",
    change: "+12%",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Courses",
    value: "148",
    change: "+6",
    icon: GraduationCap,
    color: "from-indigo-500 to-violet-500",
  },
  {
    title: "Virtual Labs",
    value: "64",
    change: "+4",
    icon: FlaskConical,
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "CBT Questions",
    value: "18,540",
    change: "+540",
    icon: FileQuestion,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Novels",
    value: "620",
    change: "+15",
    icon: BookOpen,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Revenue",
    value: "$18,420",
    change: "+21%",
    icon: DollarSign,
    color: "from-yellow-500 to-amber-500",
  },
];

const quickActions = [
  {
    title: "Create Course",
    link: "/admin/lms/create",
  },
  {
    title: "Upload Novel",
    link: "/admin/novels",
  },
  {
    title: "Add Experiment",
    link: "/admin/labs/add",
  },
  {
    title: "Add CBT Questions",
    link: "/admin/cbt/questions",
  },
];

const activities = [
  {
    title: "New student registered",
    time: "2 minutes ago",
  },
  {
    title: "Physics experiment updated",
    time: "15 minutes ago",
  },
  {
    title: "New novel published",
    time: "40 minutes ago",
  },
  {
    title: "CBT Biology questions imported",
    time: "1 hour ago",
  },
  {
    title: "Course certificate generated",
    time: "Today",
  },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Here's what's happening across Scholiqen today.
          </p>

        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">

          <div className="flex items-center gap-3">

            <TrendingUp />

            <div>

              <p className="text-sm text-blue-100">
                Platform Growth
              </p>

              <h2 className="text-2xl font-bold">
                +18.7%
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* Stats */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-slate-400">
                    {item.title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {item.value}
                  </h2>

                  <p className="mt-3 text-emerald-400">
                    {item.change}
                  </p>

                </div>

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color}`}
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

        {/* Quick Actions */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-6 space-y-4">

            {quickActions.map((action) => (

              <Link
                key={action.title}
                to={action.link}
                className="flex items-center justify-between rounded-2xl bg-slate-800 px-5 py-4 transition hover:bg-slate-700"
              >

                <div className="flex items-center gap-3">

                  <PlusCircle />

                  {action.title}

                </div>

                <ArrowUpRight />

              </Link>

            ))}

          </div>

        </div>

        {/* Activity */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

          <h2 className="text-2xl font-bold">
            Recent Activity
          </h2>

          <div className="mt-6 space-y-5">

            {activities.map((activity, index) => (

              <div
                key={index}
                className="flex items-center justify-between rounded-2xl bg-slate-800 px-5 py-4"
              >

                <div className="flex items-center gap-3">

                  <Clock className="text-blue-400" />

                  <div>

                    <p className="font-medium">
                      {activity.title}
                    </p>

                    <p className="text-sm text-slate-400">
                      {activity.time}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;