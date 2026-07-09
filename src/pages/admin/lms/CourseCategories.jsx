import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  BookOpen,
} from "lucide-react";

const initialCategories = [
  {
    id: 1,
    name: "Programming",
    slug: "programming",
    courses: 48,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Business",
    slug: "business",
    courses: 24,
    color: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Medicine",
    slug: "medicine",
    courses: 32,
    color: "bg-red-500",
  },
  {
    id: 4,
    name: "Engineering",
    slug: "engineering",
    courses: 19,
    color: "bg-purple-500",
  },
  {
    id: 5,
    name: "Mathematics",
    slug: "mathematics",
    courses: 16,
    color: "bg-yellow-500",
  },
];

const CourseCategories = () => {
  const [categories, setCategories] = useState(initialCategories);

  const [search, setSearch] = useState("");

  const filtered = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-extrabold">
            Course Categories
          </h1>

          <p className="mt-2 text-slate-400">
            Organize courses into different learning categories.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-700">

          <Plus size={20} />

          New Category

        </button>

      </div>

      {/* Search */}

      <div className="relative max-w-lg">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-5"
        />

      </div>

      {/* Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {filtered.map((category) => (

          <motion.div
            key={category.id}
            whileHover={{
              y: -5,
            }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >

            <div className="flex items-center justify-between">

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${category.color}`}
              >
                <FolderOpen size={28} />
              </div>

              <div className="flex gap-2">

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700">

                  <Edit size={18} />

                </button>

                <button className="rounded-xl bg-red-600 p-3 hover:bg-red-700">

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

            <h2 className="mt-6 text-2xl font-bold">
              {category.name}
            </h2>

            <p className="mt-2 text-slate-500">
              {category.slug}
            </p>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-950 p-4">

              <div className="flex items-center gap-3">

                <BookOpen
                  size={18}
                  className="text-blue-400"
                />

                <span>Courses</span>

              </div>

              <span className="text-xl font-bold text-blue-400">
                {category.courses}
              </span>

            </div>

          </motion.div>

        ))}

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <table className="w-full">

          <thead className="bg-slate-950">

            <tr>

              <th className="p-5 text-left">
                Category
              </th>

              <th className="p-5 text-left">
                Slug
              </th>

              <th className="p-5 text-left">
                Courses
              </th>

              <th className="p-5 text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((category) => (

              <tr
                key={category.id}
                className="border-t border-slate-800"
              >

                <td className="p-5 font-semibold">
                  {category.name}
                </td>

                <td className="p-5 text-slate-400">
                  {category.slug}
                </td>

                <td className="p-5">
                  {category.courses}
                </td>

                <td className="p-5">

                  <div className="flex justify-end gap-3">

                    <button className="rounded-lg bg-blue-600 px-4 py-2">

                      Edit

                    </button>

                    <button className="rounded-lg bg-red-600 px-4 py-2">

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default CourseCategories;