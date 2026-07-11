import React, { useEffect, useState } from "react";
import {
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  BookOpen,
  GraduationCap,
  Award,
  Globe,
  DollarSign,
  Sparkles,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateCourse = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");

  const [categories, setCategories] = useState([]);

  const [course, setCourse] = useState({
    title: "",
    slug: "",
    description: "",

    category_id: "",

    instructor: "",

    level: "Beginner",

    language: "English",

    duration: "",

    lessons_count: 0,

    price: 0,

    certificate: true,

    featured: false,

    status: "Draft",

    requirements: "",

    learning_outcomes: "",

    video_url: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("course_categories")
      .select("*")
      .order("name");

    if (!error) {
      setCategories(data || []);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setCourse((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "title") {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .replace(/\s+/g, "-");
      }

      return updated;
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setThumbnail(file);

    setPreview(URL.createObjectURL(file));
  };
    const resetForm = () => {
    setCourse({
      title: "",
      slug: "",
      description: "",
      category_id: "",
      instructor: "",
      level: "Beginner",
      language: "English",
      duration: "",
      lessons_count: 0,
      price: 0,
      certificate: true,
      featured: false,
      status: "Draft",
      requirements: "",
      learning_outcomes: "",
      video_url: "",
    });

    setThumbnail(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      if (!course.title.trim()) {
        throw new Error("Course title is required.");
      }

      if (!course.category_id) {
        throw new Error("Please select a category.");
      }

      if (!course.description.trim()) {
        throw new Error("Course description is required.");
      }

      let thumbnailUrl = "";

      if (thumbnail) {
        setUploading(true);

        const extension = thumbnail.name.split(".").pop();

        const fileName = `course-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("course-covers")
          .upload(fileName, thumbnail);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("course-covers")
          .getPublicUrl(fileName);

        thumbnailUrl = data.publicUrl;

        setUploading(false);
      }

      const selectedCategory = categories.find(
        (item) => item.id === course.category_id
      );

      const payload = {
        title: course.title,
        description: course.description,
        instructor: course.instructor,

        category_id: course.category_id,

        category: selectedCategory?.name || "",

        level: course.level,

        price: Number(course.price),

        status: course.status,

        featured: course.featured,

        thumbnail_url: thumbnailUrl,

        video_url: course.video_url,

        students: 0,

        rating: 0,
      };

      const { error } = await supabase
        .from("courses")
        .insert([payload]);

      if (error) throw error;

      setSuccess(true);

      resetForm();

      setTimeout(() => {
        navigate("/admin/lms/courses");
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(err.message);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };
    return (
    <div className="p-8">

      {/* ================= Alerts ================= */}

      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-400">
          ✅ Course created successfully. Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={loading ? "pointer-events-none opacity-70" : ""}
      >

        {/* ================= Header ================= */}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <button
              type="button"
              onClick={() => navigate("/admin/lms/courses")}
              className="mb-5 flex items-center gap-2 text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <h1 className="text-4xl font-black">
              Create Course
            </h1>

            <p className="mt-3 text-slate-400">
              Build a premium learning experience for Scholiqen.
            </p>

          </div>

          <AdminButton
            type="submit"
            disabled={loading || uploading}
            className="min-w-[220px]"
          >

            {loading ? (

              <>

                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Saving...

              </>

            ) : uploading ? (

              <>

                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Uploading...

              </>

            ) : (

              <>

                <Save size={18} />

                Publish Course

              </>

            )}

          </AdminButton>

        </div>

        {/* ================= Layout ================= */}

        <div className="grid gap-8 lg:grid-cols-3">

          {/* ================= Left ================= */}

          <div className="space-y-8 lg:col-span-2">
                        {/* ================= Course Information ================= */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl"
            >

              <div className="mb-8 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">

                  <BookOpen size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">

                    Course Information

                  </h2>

                  <p className="mt-1 text-slate-400">

                    Basic information about your course.

                  </p>

                </div>

              </div>

              <div className="space-y-7">

                {/* Course Title */}

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-300">

                    Course Title

                  </label>

                  <input
                    type="text"
                    name="title"
                    value={course.title}
                    onChange={handleChange}
                    placeholder="Complete React Developer Bootcamp"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none transition focus:border-cyan-400"
                  />

                </div>

                {/* Slug */}

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-300">

                    URL Slug

                  </label>

                  <input
                    readOnly
                    value={course.slug}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4 text-slate-500"
                  />

                </div>

                {/* Description */}

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-300">

                    Description

                  </label>

                  <textarea
                    rows={8}
                    name="description"
                    value={course.description}
                    onChange={handleChange}
                    placeholder="Write a detailed description of your course..."
                    className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none transition focus:border-cyan-400"
                  />

                </div>

              </div>

            </motion.div>

            {/* ================= Course Details ================= */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .15 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl"
            >

              <div className="mb-8 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">

                  <GraduationCap size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">

                    Course Details

                  </h2>

                  <p className="mt-1 text-slate-400">

                    Configure how your course appears.

                  </p>

                </div>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                {/* Category */}

                <div>

                  <label className="mb-3 block text-sm font-semibold">

                    Category

                  </label>

                  <select
                    name="category_id"
                    value={course.category_id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
                  >

                    <option value="">

                      Select Category

                    </option>

                    {categories.map((cat) => (

                      <option
                        key={cat.id}
                        value={cat.id}
                      >

                        {cat.name}

                      </option>

                    ))}

                  </select>

                </div>

                {/* Instructor */}

                <div>

                  <label className="mb-3 block text-sm font-semibold">

                    Instructor

                  </label>

                  <input
                    name="instructor"
                    value={course.instructor}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
                  />

                </div>
                                {/* Level */}

                <div>

                  <label className="mb-3 block text-sm font-semibold">

                    Level

                  </label>

                  <select
                    name="level"
                    value={course.level}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
                  >

                    <option>Beginner</option>

                    <option>Intermediate</option>

                    <option>Advanced</option>

                  </select>

                </div>

                {/* Language */}

                <div>

                  <label className="mb-3 block text-sm font-semibold">

                    Language

                  </label>

                  <input
                    name="language"
                    value={course.language}
                    onChange={handleChange}
                    placeholder="English"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
                  />

                </div>

                {/* Duration */}

                <div>

                  <label className="mb-3 block text-sm font-semibold">

                    Duration

                  </label>

                  <input
                    name="duration"
                    value={course.duration}
                    onChange={handleChange}
                    placeholder="20 Hours"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
                  />

                </div>

                {/* Lessons */}

                <div>

                  <label className="mb-3 block text-sm font-semibold">

                    Lessons

                  </label>

                  <input
                    type="number"
                    min="0"
                    name="lessons_count"
                    value={course.lessons_count}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
                  />

                </div>

                {/* Price */}

                <div className="md:col-span-2">

                  <label className="mb-3 block text-sm font-semibold">

                    Price

                  </label>

                  <div className="relative">

                    <DollarSign
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="number"
                      min="0"
                      name="price"
                      value={course.price}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-4 pl-12 pr-5"
                    />

                  </div>

                  <p className="mt-2 text-sm text-slate-500">

                    Leave as <strong>0</strong> to make this course free.

                  </p>

                </div>

              </div>

            </motion.div>

            {/* ================= Learning Outcomes ================= */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .25 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl"
            >

              <div className="mb-8 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                  <Award size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">

                    Learning Outcomes

                  </h2>

                  <p className="mt-1 text-slate-400">

                    What will students achieve after completing this course?

                  </p>

                </div>

              </div>

              <textarea
                rows={8}
                name="learning_outcomes"
                value={course.learning_outcomes}
                onChange={handleChange}
                placeholder="• Build real-world projects&#10;• Master React fundamentals&#10;• Learn best practices"
                className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
              />

            </motion.div>

            {/* ================= Requirements ================= */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .35 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl"
            >

              <div className="mb-8 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">

                  <Tag size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">

                    Course Requirements

                  </h2>

                  <p className="mt-1 text-slate-400">

                    Tell students what they need before starting.

                  </p>

                </div>

              </div>

              <textarea
                rows={8}
                name="requirements"
                value={course.requirements}
                onChange={handleChange}
                placeholder="• Laptop&#10;• Internet connection&#10;• Basic computer knowledge"
                className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
              />

            </motion.div>

          </div>
                    {/* ================= Right Sidebar ================= */}

          <div className="space-y-8">

            {/* ================= Thumbnail ================= */}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-7 backdrop-blur-xl"
            >

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">

                  <ImageIcon size={22} />

                </div>

                <div>

                  <h3 className="font-bold">

                    Course Thumbnail

                  </h3>

                  <p className="text-sm text-slate-400">

                    1280 × 720 recommended

                  </p>

                </div>

              </div>

              <label className="block cursor-pointer">

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImage}
                />

                {preview ? (

                  <img
                    src={preview}
                    alt=""
                    className="h-60 w-full rounded-3xl border border-slate-700 object-cover"
                  />

                ) : (

                  <div className="flex h-60 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-950 transition hover:border-cyan-400">

                    <Upload
                      size={45}
                      className="text-cyan-400"
                    />

                    <p className="mt-4 font-semibold">

                      Upload Thumbnail

                    </p>

                    <span className="mt-2 text-sm text-slate-500">

                      PNG • JPG • WEBP

                    </span>

                  </div>

                )}

              </label>

            </motion.div>

            {/* ================= Intro Video ================= */}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: .1 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-7"
            >

              <div className="mb-5 flex items-center gap-3">

                <Globe
                  className="text-blue-400"
                  size={22}
                />

                <h3 className="font-bold">

                  Intro Video

                </h3>

              </div>

              <input
                type="url"
                name="video_url"
                value={course.video_url}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
              />

            </motion.div>

            {/* ================= Settings ================= */}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: .2 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-7"
            >

              <div className="mb-6 flex items-center gap-3">

                <Sparkles
                  className="text-violet-400"
                  size={22}
                />

                <h3 className="font-bold">

                  Course Settings

                </h3>

              </div>

              <div className="space-y-6">

                <label className="flex items-center justify-between">

                  <span>

                    Featured Course

                  </span>

                  <input
                    type="checkbox"
                    name="featured"
                    checked={course.featured}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />

                </label>

                <label className="flex items-center justify-between">

                  <span>

                    Certificate Included

                  </span>

                  <input
                    type="checkbox"
                    name="certificate"
                    checked={course.certificate}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />

                </label>

                <div>

                  <label className="mb-2 block text-sm">

                    Status

                  </label>

                  <select
                    name="status"
                    value={course.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4"
                  >

                    <option>

                      Draft

                    </option>

                    <option>

                      Published

                    </option>

                  </select>

                </div>

              </div>

            </motion.div>
                        {/* ================= Live Preview ================= */}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-7 backdrop-blur-xl"
            >

              <h3 className="mb-6 text-xl font-bold">

                Live Preview

              </h3>

              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">

                {preview ? (

                  <img
                    src={preview}
                    alt={course.title}
                    className="h-52 w-full object-cover"
                  />

                ) : (

                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900">

                    <BookOpen
                      size={70}
                      className="text-white/60"
                    />

                  </div>

                )}

                <div className="space-y-4 p-6">

                  <span className="inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">

                    {categories.find(
                      (c) => c.id === course.category_id
                    )?.name || "No Category"}

                  </span>

                  <h2 className="line-clamp-2 text-2xl font-bold">

                    {course.title || "Course Title"}

                  </h2>

                  <p className="line-clamp-3 text-sm leading-7 text-slate-400">

                    {course.description ||
                      "Your course description will appear here as you type."}

                  </p>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-5">

                    <span className="text-sm text-slate-500">

                      {course.level}

                    </span>

                    <span className="text-lg font-bold text-cyan-400">

                      {Number(course.price) === 0
                        ? "FREE"
                        : `$${Number(course.price).toFixed(2)}`}

                    </span>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </form>

    </div>

  );

};

export default CreateCourse;