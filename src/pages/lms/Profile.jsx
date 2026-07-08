import React from "react";
import {
  Target,
  BookOpen,
  Award,
  Clock3,
  Flame,
  Activity,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import ProfileCard from "../../components/lms/ProfileCard";

const recentActivity = [
  {
    id: 1,
    title: "Completed Lesson",
    description: "Newton's Laws of Motion",
    time: "15 minutes ago",
  },
  {
    id: 2,
    title: "Submitted weeklytasks",
    description: "Organic Chemistry Quiz",
    time: "2 hours ago",
  },
  {
    id: 3,
    title: "Downloaded Resource",
    description: "Calculus Formula Sheet",
    time: "Yesterday",
  },
];

const goals = [
  "Complete Physics this week",
  "Study at least 2 hours daily",
  "Finish 5 weeklytasks",
  "Earn next certificate",
];

const Profile = () => {
  return (
    <div className="space-y-10">

      {/* Profile Card */}
      <ProfileCard
        name="John Doe"
        email="john@example.com"
        phone="+234 800 000 0000"
        location="Lagos, Nigeria"
        level="Senior Secondary Student"
        joined="January 2026"
        avatar="https://i.pravatar.cc/300?img=12"
        courses={8}
        certificates={3}
        streak={18}
        hours={126}
        onEdit={() => console.log("Edit Profile")}
        onUpload={() => console.log("Upload Photo")}
      />

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          icon={<BookOpen className="text-blue-400" />}
          title="Courses"
          value="8"
        />

        <StatCard
          icon={<Award className="text-yellow-400" />}
          title="Certificates"
          value="3"
        />

        <StatCard
          icon={<Flame className="text-red-400" />}
          title="Study Streak"
          value="18 Days"
        />

        <StatCard
          icon={<Clock3 className="text-cyan-400" />}
          title="Study Hours"
          value="126"
        />

      </div>

      {/* Goals & Activity */}
      <div className="grid xl:grid-cols-2 gap-8">

        {/* Goals */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

          <div className="flex items-center gap-3 mb-6">
            <Target className="text-green-400" />
            <h2 className="text-2xl font-bold">
              Current Goals
            </h2>
          </div>

          <div className="space-y-4">

            {goals.map((goal) => (

              <div
                key={goal}
                className="flex items-center justify-between rounded-2xl bg-slate-950 border border-slate-800 p-4"
              >

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="text-green-400" />

                  {goal}

                </div>

                <ArrowRight size={18} />

              </div>

            ))}

          </div>

        </div>

        {/* Recent Activity */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-blue-400" />
            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>
          </div>

          <div className="space-y-5">

            {recentActivity.map((item) => (

              <div
                key={item.id}
                className="rounded-2xl bg-slate-950 border border-slate-800 p-5"
              >

                <h3 className="font-semibold text-lg">
                  {item.title}
                </h3>

                <p className="text-slate-400 mt-2">
                  {item.description}
                </p>

                <p className="text-xs text-slate-500 mt-3">
                  {item.time}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">

    <div className="mb-5">
      {icon}
    </div>

    <h2 className="text-3xl font-bold">
      {value}
    </h2>

    <p className="text-slate-400 mt-2">
      {title}
    </p>

  </div>
);

export default Profile;