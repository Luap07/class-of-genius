import React, { useState } from "react";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";

const initialCategories = [
  {
    id: 1,
    name: "Programming",
    courses: 42,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Artificial Intelligence",
    courses: 18,
    color: "bg-violet-500",
  },
  {
    id: 3,
    name: "Medicine",
    courses: 26,
    color: "bg-emerald-500",
  },
  {
    id: 4,
    name: "Business",
    courses: 31,
    color: "bg-orange-500",
  },
];

const CategoriesAdmin = () => {
  const [categories] = useState(initialCategories);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Course Categories
          </h1>

          <p className="mt-2 text-slate-400">
            Organize all courses into categories.
          </p>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Category

        </button>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search categories..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />

      </div>

      {/* Grid */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {categories.map((category) => (

          <div
            key={category.id}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >

            <div className="flex justify-between">

              <div
                className={`${category.color} rounded-2xl p-4`}
              >

                <FolderTree size={28} />

              </div>

              <div className="flex gap-2">

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-blue-600">

                  <Pencil size={18} />

                </button>

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-red-600">

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

            <h2 className="mt-6 text-2xl font-bold">
              {category.name}
            </h2>

            <p className="mt-2 text-slate-400">
              {category.courses} Courses
            </p>

          </div>

        ))}

      </div>

    </div>
  );
};

export default CategoriesAdmin;