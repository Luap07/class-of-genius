import React from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Clock3,
  Award,
  Activity,
  Eye,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "25,846",
    change: "+18%",
    icon: Users,
    color: "bg-blue-600",
  },
  {
    title: "Courses",
    value: "324",
    change: "+12%",
    icon: BookOpen,
    color: "bg-violet-600",
  },
  {
    title: "Certificates",
    value: "18,932",
    change: "+26%",
    icon: Award,
    color: "bg-emerald-600",
  },
  {
    title: "Revenue",
    value: "$486,240",
    change: "+31%",
    icon: DollarSign,
    color: "bg-orange-600",
  },
];

const topCourses = [
  {
    title: "Frontend Development",
    students: 5400,
    completion: 92,
  },
  {
    title: "Artificial Intelligence",
    students: 4302,
    completion: 87,
  },
  {
    title: "Medical Sciences",
    students: 3120,
    completion: 80,
  },
  {
    title: "Business Management",
    students: 2890,
    completion: 78,
  },
  {
    title: "Graphic Design",
    students: 2450,
    completion: 75,
  },
];

const AnalyticsAdmin = () => {
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            LMS Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor the overall performance of your learning platform.
          </p>

        </div>

      </div>

      {/* Overview */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

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
                    {item.change} this month
                  </p>

                </div>

                <div
                  className={`${item.color} flex h-16 w-16 items-center justify-center rounded-2xl`}
                >
                  <Icon size={30} />
                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Performance */}

      <div className="grid gap-8 lg:grid-cols-2">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Platform Performance
          </h2>

          <div className="space-y-6">

            <Metric
              icon={TrendingUp}
              label="Course Completion Rate"
              value="89%"
            />

            <Metric
              icon={GraduationCap}
              label="Graduation Rate"
              value="82%"
            />

            <Metric
              icon={Clock3}
              label="Average Study Time"
              value="4h 35m"
            />

            <Metric
              icon={Eye}
              label="Daily Active Users"
              value="15,480"
            />

            <Metric
              icon={Activity}
              label="Average Quiz Score"
              value="84%"
            />

          </div>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Top Performing Courses
          </h2>

          <div className="space-y-6">

            {topCourses.map((course) => (

              <div key={course.title}>

                <div className="mb-2 flex justify-between">

                  <span>
                    {course.title}
                  </span>

                  <span className="text-blue-400">
                    {course.students.toLocaleString()} Students
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{
                      width: `${course.completion}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-right text-sm text-slate-400">
                  {course.completion}% Completion
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Bottom Stats */}

      <div className="grid gap-6 md:grid-cols-3">

        <Card
          title="Student Satisfaction"
          value="4.9 / 5"
          subtitle="Based on course reviews"
        />

        <Card
          title="Total Lessons"
          value="4,286"
          subtitle="Across all courses"
        />

        <Card
          title="Video Watch Time"
          value="1.8M Hours"
          subtitle="This academic year"
        />

      </div>

    </div>
  );
};

const Metric = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between rounded-2xl bg-slate-800 p-4">

    <div className="flex items-center gap-4">

      <div className="rounded-xl bg-blue-600 p-3">
        <Icon size={20} />
      </div>

      <span>{label}</span>

    </div>

    <span className="text-xl font-bold">
      {value}
    </span>

  </div>
);

const Card = ({ title, value, subtitle }) => (
  <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

    <h3 className="text-slate-400">
      {title}
    </h3>

    <h2 className="mt-3 text-4xl font-bold">
      {value}
    </h2>

    <p className="mt-3 text-slate-500">
      {subtitle}
    </p>

  </div>
);

export default AnalyticsAdmin;