import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  FolderTree,
  GraduationCap,
  Users,
  Award,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";

const stats = [
  {
    title: "Courses",
    value: 248,
    icon: BookOpen,
    color: "bg-blue-600",
  },
  {
    title: "Categories",
    value: 18,
    icon: FolderTree,
    color: "bg-violet-600",
  },
  {
    title: "Students",
    value: "12.4K",
    icon: Users,
    color: "bg-emerald-600",
  },
  {
    title: "Certificates",
    value: "5.2K",
    icon: Award,
    color: "bg-orange-600",
  },
];

const recentCourses = [
  {
    id: 1,
    title: "Frontend Development",
    category: "Programming",
    students: 1245,
    status: "Published",
  },
  {
    id: 2,
    title: "Artificial Intelligence",
    category: "AI",
    students: 856,
    status: "Draft",
  },
  {
    id: 3,
    title: "Medical Sciences",
    category: "Medicine",
    students: 432,
    status: "Published",
  },
];

const CoursesAdmin = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            LMS Management
          </h1>

          <p className="mt-2 text-slate-400">
            Manage courses, modules, lessons, instructors and certificates.
          </p>

        </div>

        <button
          onClick={() => navigate("/admin/lms/create")}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Course
        </button>

      </div>

      {/* Stats */}

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

                </div>

                <div
                  className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center`}
                >
                  <Icon size={30} />
                </div>

              </div>

            </div>
          );

        })}

      </div>

      {/* Search */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search courses..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 outline-none focus:border-blue-500"
          />

        </div>

      </div>

      {/* Courses Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 p-6">

          <h2 className="text-2xl font-bold">
            Recent Courses
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr>

              <th className="p-4 text-left">
                Course
              </th>

              <th className="p-4 text-left">
                Category
              </th>

              <th className="p-4 text-left">
                Students
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {recentCourses.map((course) => (

              <tr
                key={course.id}
                className="border-t border-slate-800"
              >

                <td className="p-4 font-medium">
                  {course.title}
                </td>

                <td className="p-4 text-slate-400">
                  {course.category}
                </td>

                <td className="p-4">
                  {course.students}
                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      course.status === "Published"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {course.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() =>
                        navigate(`/admin/lms/edit/${course.id}`)
                      }
                      className="rounded-lg bg-slate-800 p-2 hover:bg-blue-600"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="rounded-lg bg-slate-800 p-2 hover:bg-red-600"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Management Shortcuts */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Shortcut
          title="Categories"
          icon={FolderTree}
          onClick={() => navigate("/admin/lms/categories")}
        />

        <Shortcut
          title="Modules"
          icon={BookOpen}
          onClick={() => navigate("/admin/lms/modules")}
        />

        <Shortcut
          title="Lessons"
          icon={GraduationCap}
          onClick={() => navigate("/admin/lms/lessons")}
        />

        <Shortcut
          title="Certificates"
          icon={Award}
          onClick={() => navigate("/admin/lms/certificates")}
        />

      </div>

    </div>
  );
};

const Shortcut = ({ title, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-left transition hover:border-blue-500 hover:-translate-y-1"
  >
    <Icon size={34} className="text-blue-400" />

    <h3 className="mt-6 text-2xl font-bold">
      {title}
    </h3>

    <p className="mt-2 text-slate-400">
      Manage {title.toLowerCase()}
    </p>
  </button>
);

export default CoursesAdmin;