import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState({
    title: "",
    subtitle: "",
    description: "",
    instructor: "",
    category: "",
    level: "",
    duration: "",
    language: "",
    price: "",
    thumbnail: "",
    certificate: true,
  });

  const [modules, setModules] = useState([]);

  useEffect(() => {
    // Backend Later
    setTimeout(() => {
      setCourse({
        title: "Frontend Development",
        subtitle: "Become a Professional Frontend Developer",
        description:
          "Complete modern frontend development from beginner to advanced.",
        instructor: "John Doe",
        category: "Programming",
        level: "Beginner",
        duration: "6 Months",
        language: "English",
        price: "49",
        thumbnail: "",
        certificate: true,
      });

      setModules([
        {
          title: "HTML & CSS",
        },
        {
          title: "JavaScript",
        },
        {
          title: "React",
        },
      ]);

      setLoading(false);
    }, 500);
  }, [id]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setCourse((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const updateModule = (index, value) => {
    const copy = [...modules];
    copy[index].title = value;
    setModules(copy);
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
      },
    ]);
  };

  const removeModule = (index) => {
    setModules(
      modules.filter((_, i) => i !== index)
    );
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-xl">
        Loading Course...
      </div>
    );
  }

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
            Edit Course
          </h1>

          <p className="mt-2 text-slate-400">
            Update course information.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-700">

          <Save size={18} />

          Save Changes

        </button>

      </div>

      {/* Basic */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-slate-800 bg-slate-900 p-8"
      >

        <h2 className="mb-6 text-2xl font-bold">
          Course Information
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">

          <div>

            <label className="mb-2 block">
              Title
            </label>

            <input
              name="title"
              value={course.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block">
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

            <label className="mb-2 block">
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

            <label className="mb-2 block">
              Duration
            </label>

            <input
              name="duration"
              value={course.duration}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block">
              Category
            </label>

            <select
              name="category"
              value={course.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            >

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

            <label className="mb-2 block">
              Level
            </label>

            <select
              name="level"
              value={course.level}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            >

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

            <label className="mb-2 block">
              Price
            </label>

            <input
              name="price"
              value={course.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block">
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

          <label className="mb-2 block">
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
          Thumbnail
        </h2>

        <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500">

          <Upload size={40} />

          <p className="mt-4">
            Replace Thumbnail
          </p>

          <input
            hidden
            type="file"
          />

        </label>

      </div>

      {/* Modules */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <div className="mb-6 flex justify-between">

          <h2 className="text-2xl font-bold">
            Modules
          </h2>

          <button
            onClick={addModule}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2"
          >

            <Plus size={18} />

            Add Module

          </button>

        </div>

        <div className="space-y-4">

          {modules.map((module, index) => (

            <div
              key={index}
              className="flex gap-3"
            >

              <input
                value={module.title}
                onChange={(e) =>
                  updateModule(
                    index,
                    e.target.value
                  )
                }
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 p-4"
              />

              <button
                onClick={() =>
                  removeModule(index)
                }
                className="rounded-xl bg-red-600 px-4"
              >
                <Trash2 size={18} />
              </button>

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

          Award Certificate

        </label>

      </div>

    </div>
  );
};

export default EditCourse;