import React from "react";
import {
  TrendingUp,
  BookOpen,
  Clock3,
  Target,
  Flame,
  Award,
} from "lucide-react";

import ProgressCard from "../../components/lms/ProgressCard";

const progressData = [
  {
    id: 1,
    title: "Physics",
    instructor: "ClassOfGenius",
    progress: 82,
    lessonsCompleted: 41,
    totalLessons: 50,
    hoursSpent: 18,
    certificate: false,
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: 2,
    title: "Chemistry",
    instructor: "ClassOfGenius",
    progress: 65,
    lessonsCompleted: 31,
    totalLessons: 48,
    hoursSpent: 15,
    certificate: false,
    color: "from-emerald-600 to-green-500",
  },
  {
    id: 3,
    title: "Mathematics",
    instructor: "ClassOfGenius",
    progress: 100,
    lessonsCompleted: 62,
    totalLessons: 62,
    hoursSpent: 26,
    certificate: true,
    color: "from-purple-600 to-pink-600",
  },
];

const stats = [
  {
    title: "Courses",
    value: "6",
    icon: BookOpen,
    color: "text-blue-400",
  },
  {
    title: "Study Hours",
    value: "59",
    icon: Clock3,
    color: "text-cyan-400",
  },
  {
    title: "Weekly Goal",
    value: "82%",
    icon: Target,
    color: "text-orange-400",
  },
  {
    title: "Study Streak",
    value: "18 Days",
    icon: Flame,
    color: "text-red-400",
  },
];

const achievements = [
  "Completed Mathematics",
  "10-Day Study Streak",
  "100 Lessons Finished",
  "Top Performer",
];

const Progress = () => {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Learning Progress
        </h1>

        <p className="text-slate-400 mt-2">
          Track your study performance and achievements.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"
            >
              <Icon
                size={36}
                className={item.color}
              />

              <h2 className="text-3xl font-bold mt-5">
                {item.value}
              </h2>

              <p className="text-slate-400 mt-2">
                {item.title}
              </p>
            </div>
          );
        })}

      </div>

      {/* Overall Progress */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex justify-between mb-5">

          <h2 className="text-2xl font-bold">
            Overall Completion
          </h2>

          <span className="text-3xl font-bold">
            82%
          </span>

        </div>

        <div className="h-5 rounded-full bg-slate-800 overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{
              width: "82%",
            }}
          />

        </div>

      </div>

      {/* Course Progress */}
      <div>

        <h2 className="text-3xl font-bold mb-6">
          Course Progress
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">

          {progressData.map((course) => (
            <ProgressCard
              key={course.id}
              {...course}
            />
          ))}

        </div>

      </div>

      {/* Achievements */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <div className="flex items-center gap-3 mb-8">

          <Award className="text-yellow-400" />

          <h2 className="text-2xl font-bold">
            Achievements
          </h2>

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          {achievements.map((achievement) => (

            <div
              key={achievement}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex items-center gap-3"
            >

              <TrendingUp className="text-green-400" />

              {achievement}

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Progress;