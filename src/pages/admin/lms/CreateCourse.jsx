import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  "Programming",
  "Business",
  "Science",
  "Engineering",
  "Medicine",
  "Arts",
  "Law",
  "Mathematics",
];

const levels = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const CreateCourse = () => {
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "",
    instructor: "",
    duration: "",
    language: "English",
    price: "",
    certificate: true,
    thumbnail: "",
  });

  const [modules, setModules] = useState([
    {
      title: "",
      lessons: [],
    },
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCourse((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        lessons: [],
      },
    ]);
  };

  const updateModule = (index, value) => {
    const copy = [...modules];
    copy[index].title = value;
    setModules(copy);
  };

  const deleteModule = (index) => {
    setModules(
      modules.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />

            Back
          </button>

          <h1 className="text-4xl font-extrabold">
            Create Course
          </h1>

          <p className="mt-2 text-slate-400">
            Build a new professional course.
          </p>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-700"
        >
          <Save size={18} />

          Save Course
        </button>

      </div>

      {/* Basic Information */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-slate-800 bg-slate-900 p-8"
      >

        <h2 className="mb-6 text-2xl font-bold">
          Basic Information
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm">
              Course Title
            </label>

            <input
              name="title"
              value={course.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Instructor
            </label>

            <input
              name="instructor"
              value={course.instructor}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Subtitle
            </label>

            <input
              name="subtitle"
              value={course.subtitle}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Duration
            </label>

            <input
              name="duration"
              value={course.duration}
              onChange={handleChange}
              placeholder="8 Weeks"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Category
            </label>

            <select
              name="category"
              value={course.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            >
              <option value="">
                Select Category
              </option>

              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Level
            </label>

            <select
              name="level"
              value={course.level}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            >
              <option value="">
                Select Level
              </option>

              {levels.map((lvl) => (
                <option
                  key={lvl}
                  value={lvl}
                >
                  {lvl}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Price
            </label>

            <input
              name="price"
              value={course.price}
              onChange={handleChange}
              placeholder="$99"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm">
              Language
            </label>

            <input
              name="language"
              value={course.language}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

        </div>

        <div className="mt-6">

          <label className="mb-2 block text-sm">
            Description
          </label>

          <textarea
            rows={6}
            name="description"
            value={course.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
          />

        </div>

      </motion.div>

      {/* Thumbnail */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <h2 className="mb-6 text-2xl font-bold">
          Course Thumbnail
        </h2>

        <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500">

          <Upload size={40} />

          <p className="mt-3">
            Upload Thumbnail
          </p>

          <input
            type="file"
            hidden
          />

        </label>

      </div>

      {/* Modules */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Course Modules
          </h2>

          <button
            onClick={addModule}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2"
          >
            <Plus size={18} />

            Add Module
          </button>

        </div>

        <div className="space-y-5">

          {modules.map((module, index) => (

            <div
              key={index}
              className="rounded-2xl bg-slate-950 p-5"
            >

              <div className="flex gap-3">

                <input
                  value={module.title}
                  onChange={(e) =>
                    updateModule(
                      index,
                      e.target.value
                    )
                  }
                  placeholder={`Module ${index + 1}`}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 p-4"
                />

                <button
                  onClick={() =>
                    deleteModule(index)
                  }
                  className="rounded-xl bg-red-600 px-4"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Certificate */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={course.certificate}
            name="certificate"
            onChange={handleChange}
          />

          <span>
            Award Certificate After Completion
          </span>

        </label>

      </div>

    </div>
  );
};

export default CreateCourse;