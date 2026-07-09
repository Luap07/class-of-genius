import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  FlaskConical,
  FileQuestion,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

import AdminStats from "../../../admin/AdminStats";

const quickActions = [
  {
    title: "Create Course",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Add Experiment",
    icon: FlaskConical,
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "Manage CBT",
    icon: FileQuestion,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Manage Users",
    icon: Users,
    color: "from-orange-500 to-red-500",
  },
];

const activities = [
  {
    title: "New course published",
    user: "Frontend Development",
    time: "5 mins ago",
  },
  {
    title: "Physics experiment updated",
    user: "Projectile Motion",
    time: "15 mins ago",
  },
  {
    title: "120 students enrolled",
    user: "Mathematics",
    time: "1 hour ago",
  },
  {
    title: "Novel approved",
    user: "The Silent Hero",
    time: "2 hours ago",
  },
];

const DashboardHome = () => {
  return (
    <div className="space-y-8">

      {/* Welcome */}

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-10"
      >
        <h1 className="text-4xl font-extrabold">
          Welcome Back 👋
        </h1>

        <p className="mt-3 max-w-3xl text-blue-100">
          Monitor every part of Scholiqen from one professional
          dashboard. Manage courses, virtual laboratories,
          CBT examinations, novels, students, analytics,
          and platform settings.
        </p>
      </motion.div>

      {/* Stats */}

      <AdminStats />

      {/* Quick Actions */}

      <section>

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {quickActions.map((item) => {

            const Icon = item.icon;

            return (

              <motion.button
                key={item.title}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
                className={`
                  rounded-3xl
                  bg-gradient-to-r
                  ${item.color}
                  p-8
                  text-left
                `}
              >

                <Icon size={38} />

                <h3 className="mt-6 text-xl font-bold">
                  {item.title}
                </h3>

                <div className="mt-6 flex items-center gap-2">

                  Open

                  <ArrowUpRight size={18} />

                </div>

              </motion.button>

            );

          })}

        </div>

      </section>

      {/* Bottom Grid */}

      <div className="grid gap-8 xl:grid-cols-3">

        {/* Recent Activities */}

        <div className="xl:col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Recent Activities
          </h2>

          <div className="space-y-5">

            {activities.map((activity) => (

              <div
                key={activity.title}
                className="flex items-center justify-between rounded-2xl bg-slate-950 p-5"
              >

                <div>

                  <h3 className="font-semibold">
                    {activity.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {activity.user}
                  </p>

                </div>

                <div className="flex items-center gap-2 text-slate-400">

                  <Clock3 size={16} />

                  {activity.time}

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* Server Status */}

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold">
            Platform Status
          </h2>

          <div className="mt-8 space-y-6">

            {[
              ["API Server", "Operational"],
              ["Database", "Healthy"],
              ["Storage", "98%"],
              ["Authentication", "Online"],
              ["Virtual Labs", "Running"],
            ].map(([title, value]) => (

              <div
                key={title}
                className="flex items-center justify-between border-b border-slate-800 pb-4"
              >

                <span className="text-slate-400">
                  {title}
                </span>

                <span className="font-semibold text-emerald-400">
                  {value}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardHome;