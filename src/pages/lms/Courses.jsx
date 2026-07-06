import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Grid3X3, List } from "lucide-react";

import CourseCard from "../../components/lms/CourseCard";
import courses from "../../data/lms/courses";

const categories = ["All", "Science", "Mathematics", "Languages", "Technology"];

const Courses = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [gridView, setGridView] = useState(true);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchCategory =
        category === "All" || course.category === category;

      const matchSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="space-y-8 text-white">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold">My Courses</h1>
        <p className="text-slate-400 mt-2">
          Browse and continue learning
        </p>
      </div>

      {/* SEARCH + CONTROLS */}
      <div className="flex flex-col lg:flex-row gap-5 justify-between">

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 lg:w-[450px]">
          <Search size={18} className="text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="bg-transparent outline-none w-full"
          />
        </div>

        <div className="flex gap-3">

          <button className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>

          <button
            onClick={() => setGridView(true)}
            className={`p-3 rounded-xl ${
              gridView ? "bg-blue-600" : "bg-slate-900 border border-slate-800"
            }`}
          >
            <Grid3X3 size={16} />
          </button>

          <button
            onClick={() => setGridView(false)}
            className={`p-3 rounded-xl ${
              !gridView ? "bg-blue-600" : "bg-slate-900 border border-slate-800"
            }`}
          >
            <List size={16} />
          </button>

        </div>
      </div>

      {/* CATEGORIES */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-xl ${
              category === cat
                ? "bg-blue-600"
                : "bg-slate-900 border border-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RESULTS */}
      <div className="text-slate-300">
        {filteredCourses.length} Courses Found
      </div>

      {/* GRID */}
      <div className={gridView ? "grid md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-6"}>
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/lms/course/${course.id}`)}
            className="cursor-pointer"
          >
            <CourseCard {...course} />
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {filteredCourses.length === 0 && (
        <div className="p-10 text-center border border-slate-800 bg-slate-900 rounded-2xl">
          No courses found
        </div>
      )}

    </div>
  );
};

export default Courses;