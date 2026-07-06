import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import {
  BookOpen,
  Clock3,
  Users,
  Star,
  CheckCircle2,
} from "lucide-react";

import courses from "../../data/lms/courses";

const Course = () => {
  const { id } = useParams();

  const course = useMemo(() => {
    return courses.find((c) => String(c.id) === String(id));
  }, [id]);

  if (!course) {
    return (
      <div className="p-10 text-white">
        <h1 className="text-2xl font-bold">Course not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">

      {/* HERO */}
      <div className="p-10 rounded-3xl bg-gradient-to-r from-blue-700 to-purple-700">
        <h1 className="text-4xl font-bold">{course.title}</h1>
        <p className="mt-4 text-blue-100">{course.description}</p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">

        <Stat icon={<BookOpen />} label="Lessons" value={course.lessons} />
        <Stat icon={<Clock3 />} label="Duration" value={course.duration} />
        <Stat icon={<Users />} label="Students" value={course.students} />
        <Stat icon={<Star />} label="Rating" value={course.rating} />

      </div>

      {/* MODULES */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 className="text-2xl font-bold mb-5">Modules</h2>

        <div className="space-y-3">
          {course.modules.map((m, i) => (
            <div
              key={i}
              className="p-4 bg-slate-950 border border-slate-800 rounded-xl"
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* COMPLETION */}
      <div className="flex items-center gap-4 p-6 bg-emerald-950 border border-emerald-700 rounded-2xl">
        <CheckCircle2 className="text-emerald-400" />
        <div>
          <h3 className="font-bold">Keep Going</h3>
          <p className="text-slate-400">
            You're making progress in this course
          </p>
        </div>
      </div>

    </div>
  );
};

const Stat = ({ icon, label, value }) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
    <div className="text-blue-400">{icon}</div>
    <h3 className="mt-3 text-slate-400">{label}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Course;