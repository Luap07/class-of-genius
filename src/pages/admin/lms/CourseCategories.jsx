// src/pages/admin/lms/CourseCategories.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  FolderOpen,
  BookOpen,
  Loader2,
  X,
  Star,
  CheckCircle2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Save,
} from "lucide-react";

/* ==========================================================
   API
========================================================== */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_URL = `${API_BASE_URL}/api`;

/* ==========================================================
   CONSTANTS
========================================================== */

const CATEGORY_TYPES = [
  "Academic",
  "Technology",
  "Professional",
  "Creative",
  "Language",
];

const ACADEMIC_LEVELS = [
  "Primary Education",
  "Junior Secondary School (JSS)",
  "Senior Secondary School (SSS)",
  "University",
  "Postgraduate",
];

const EDUCATION_STAGES = [
  "School",
  "Exam Preparation",
  "University Preparation",
  "Undergraduate",
  "Professional",
];

const SUBJECT_AREAS = [
  "Mathematics",
  "Further Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Language",
  "Literature",
  "Economics",
  "Government",
  "Geography",
  "Computer Science",
  "Programming",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Engineering",
  "Medicine",
  "Business",
  "Finance",
  "Accounting",
  "Law",
];

const COURSE_TYPES = [
  "Academic",
  "Professional",
  "Certification",
  "Bootcamp",
];

const DEFAULT_COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
];

/* ==========================================================
   HELPERS
========================================================== */

const generateSlug = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const getAuthHeaders = () => {
  const token = localStorage.getItem("scholiqen_auth_token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

/* ==========================================================
   DEFAULT FORM
========================================================== */

const DEFAULT_FORM = {
  name: "",
  description: "",
  image: "",
  color: DEFAULT_COLORS[0],
  type: "Academic",
  academic_level: "",
  education_stage: "",
  subject_area: "",
  course_type: "Academic",
  featured: false,
  active: true,
  sort_order: 1,
};

/* ==========================================================
   COMPONENT
========================================================== */

const CourseCategories = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [error, setError] = useState("");

  const [form, setForm] = useState(DEFAULT_FORM);

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoryResponse, courseResponse] = await Promise.all([
        apiRequest("/course-categories"),
        apiRequest("/courses"),
      ]);

      const categoryData =
        categoryResponse?.categories ||
        categoryResponse?.data ||
        categoryResponse ||
        [];

      const courseData =
        courseResponse?.courses ||
        courseResponse?.data ||
        courseResponse ||
        [];

      const normalizedCategories = Array.isArray(categoryData)
        ? categoryData
        : [];

      const normalizedCourses = Array.isArray(courseData)
        ? courseData
        : [];

      const formattedCategories = normalizedCategories.map((category) => ({
        ...category,

        courses: normalizedCourses.filter(
          (course) =>
            String(course.category_id || "") ===
            String(category.id || "")
        ).length,
      }));

      setCategories(formattedCategories);
      setCourses(normalizedCourses);
    } catch (err) {
      console.error("Course Categories Load Error:", err);

      setError(
        err?.message || "Unable to load course categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((item) => {
      return (
        item.name?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.subject_area?.toLowerCase().includes(query) ||
        item.education_stage?.toLowerCase().includes(query) ||
        item.academic_level?.toLowerCase().includes(query)
      );
    });
  }, [categories, search]);

  /* ==========================================================
     STATS
  ========================================================== */

  const stats = useMemo(
    () => ({
      total: categories.length,

      featured: categories.filter(
        (category) => category.featured === true
      ).length,

      active: categories.filter(
        (category) => category.active !== false
      ).length,

      courses: categories.reduce(
        (sum, category) =>
          sum + Number(category.courses || 0),
        0
      ),
    }),
    [categories]
  );

  /* ==========================================================
     FORM HELPERS
  ========================================================== */

  const resetForm = () => {
    setForm({
      ...DEFAULT_FORM,
      sort_order: categories.length + 1,
    });
  };

  const openCreateModal = () => {
    setEditing(null);

    setForm({
      ...DEFAULT_FORM,
      sort_order: categories.length + 1,
    });

    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditing(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      color:
        category.color ||
        DEFAULT_COLORS[0],

      type:
        category.type ||
        "Academic",

      academic_level:
        category.academic_level || "",

      education_stage:
        category.education_stage || "",

      subject_area:
        category.subject_area || "",

      course_type:
        category.course_type ||
        "Academic",

      featured:
        Boolean(category.featured),

      active:
        category.active !== false,

      sort_order:
        Number(category.sort_order || 1),
    });

    setShowModal(true);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* ==========================================================
     SAVE CATEGORY
  ========================================================== */

  const saveCategory = async () => {
    if (!form.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),

        slug: generateSlug(form.name),

        description:
          form.description?.trim() || "",

        image:
          form.image?.trim() || "",

        color:
          form.color || DEFAULT_COLORS[0],

        type:
          form.type || "Academic",

        academic_level:
          form.academic_level || "",

        education_stage:
          form.education_stage || "",

        subject_area:
          form.subject_area || "",

        course_type:
          form.course_type || "Academic",

        featured:
          Boolean(form.featured),

        active:
          Boolean(form.active),

        sort_order:
          Number(form.sort_order) || 1,
      };

      if (editing?.id) {
        await apiRequest(
          `/course-categories/${editing.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiRequest(
          "/course-categories",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      setShowModal(false);
      setEditing(null);

      resetForm();

      await loadCategories();
    } catch (err) {
      console.error("Save Category Error:", err);

      setError(
        err?.message ||
          "Unable to save category."
      );

      alert(
        err?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     DELETE CATEGORY
  ========================================================== */

  const deleteCategory = async (id) => {
    if (!id) return;

    const category = categories.find(
      (item) => String(item.id) === String(id)
    );

    const categoryName =
      category?.name || "this category";

    const courseCount = Number(
      category?.courses || 0
    );

    if (courseCount > 0) {
      alert(
        `You cannot delete "${categoryName}" because it contains ${courseCount} course${
          courseCount === 1 ? "" : "s"
        }. Move or delete those courses first.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Delete "${categoryName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      setError("");

      await apiRequest(
        `/course-categories/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadCategories();
    } catch (err) {
      console.error(
        "Delete Category Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete category."
      );

      alert(
        err?.message ||
          "Unable to delete category."
      );
    } finally {
      setDeleting(null);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2
          size={46}
          className="animate-spin text-cyan-400"
        />
      </div>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-full space-y-8 bg-slate-950 text-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
            LMS Administration
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Course Categories
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Manage Academic, Technology, Professional,
            Creative and Language learning paths.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-500"
        >
          <Plus size={20} />
          Create Category
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-2 transition hover:bg-red-500/10"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Categories",
            value: stats.total,
            icon: FolderOpen,
            color: "text-cyan-400",
            background:
              "bg-cyan-500/10 border-cyan-500/20",
          },
          {
            label: "Featured",
            value: stats.featured,
            icon: Star,
            color: "text-yellow-400",
            background:
              "bg-yellow-500/10 border-yellow-500/20",
          },
          {
            label: "Active",
            value: stats.active,
            icon: CheckCircle2,
            color: "text-emerald-400",
            background:
              "bg-emerald-500/10 border-emerald-500/20",
          },
          {
            label: "Courses",
            value: stats.courses,
            icon: BookOpen,
            color: "text-blue-400",
            background:
              "bg-blue-500/10 border-blue-500/20",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              whileHover={{
                y: -3,
              }}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {item.label}
                  </p>

                  <h2 className="mt-2 text-4xl font-black text-white">
                    {item.value}
                  </h2>
                </div>

                <div
                  className={`rounded-2xl border p-4 ${item.background}`}
                >
                  <Icon
                    size={30}
                    className={item.color}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-xl">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search categories..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
          />
        </div>

        <div className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-300">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-300">
            {categories.length}
          </span>{" "}
          categories
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-white">
            <thead className="bg-slate-950">
              <tr>
                <th className="p-5 text-sm font-bold text-slate-400">
                  Category
                </th>

                <th className="p-5 text-sm font-bold text-slate-400">
                  Type
                </th>

                <th className="p-5 text-sm font-bold text-slate-400">
                  Subject
                </th>

                <th className="p-5 text-sm font-bold text-slate-400">
                  Courses
                </th>

                <th className="p-5 text-sm font-bold text-slate-400">
                  Status
                </th>

                <th className="p-5 text-right text-sm font-bold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-16 text-center"
                  >
                    <FolderOpen
                      size={46}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-4 text-lg font-bold text-slate-300">
                      No categories found
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Try a different search or create
                      a new category.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((category) => (
                  <motion.tr
                    key={category.id}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    className="border-t border-slate-800 transition hover:bg-slate-800/30"
                  >
                    {/* CATEGORY */}

                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-700"
                          />
                        ) : (
                          <div
                            className="h-4 w-4 shrink-0 rounded-full"
                            style={{
                              background:
                                category.color ||
                                DEFAULT_COLORS[0],
                            }}
                          />
                        )}

                        <div>
                          <p className="font-bold text-white">
                            {category.name}
                          </p>

                          {category.description && (
                            <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}

                    <td className="p-5">
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
                        {category.type ||
                          "Academic"}
                      </span>
                    </td>

                    {/* SUBJECT */}

                    <td className="p-5 text-sm text-slate-300">
                      {category.subject_area ||
                        "—"}
                    </td>

                    {/* COURSES */}

                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <BookOpen
                          size={16}
                          className="text-blue-400"
                        />

                        <span className="font-bold">
                          {category.courses || 0}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="p-5">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                          category.active !== false
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-slate-700 bg-slate-800 text-slate-500"
                        }`}
                      >
                        {category.active !== false
                          ? "Active"
                          : "Disabled"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(category)
                          }
                          className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            deleting === category.id
                          }
                          onClick={() =>
                            deleteCategory(
                              category.id
                            )
                          }
                          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleting ===
                          category.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}

                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !saving
              ) {
                setShowModal(false);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl"
            >
              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-5 backdrop-blur">
                <div>
                  <p className="text-sm font-semibold text-cyan-400">
                    LMS Administration
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-white">
                    {editing
                      ? "Edit Category"
                      : "Create Category"}
                  </h2>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}

              <div className="space-y-7 p-6">
                {/* BASIC */}

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Category Name *
                    </label>

                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateForm(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Mathematics"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Description
                    </label>

                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(event) =>
                        updateForm(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Describe this course category..."
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* CATEGORY SETTINGS */}

                <div>
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Category Settings
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Category Type
                      </label>

                      <select
                        value={form.type}
                        onChange={(event) =>
                          updateForm(
                            "type",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500"
                      >
                        {CATEGORY_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Academic Level
                      </label>

                      <select
                        value={
                          form.academic_level
                        }
                        onChange={(event) =>
                          updateForm(
                            "academic_level",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500"
                      >
                        <option value="">
                          Select level
                        </option>

                        {ACADEMIC_LEVELS.map(
                          (level) => (
                            <option
                              key={level}
                              value={level}
                            >
                              {level}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Education Stage
                      </label>

                      <select
                        value={
                          form.education_stage
                        }
                        onChange={(event) =>
                          updateForm(
                            "education_stage",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500"
                      >
                        <option value="">
                          Select stage
                        </option>

                        {EDUCATION_STAGES.map(
                          (stage) => (
                            <option
                              key={stage}
                              value={stage}
                            >
                              {stage}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Subject Area
                      </label>

                      <select
                        value={
                          form.subject_area
                        }
                        onChange={(event) =>
                          updateForm(
                            "subject_area",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500"
                      >
                        <option value="">
                          Select subject
                        </option>

                        {SUBJECT_AREAS.map(
                          (subject) => (
                            <option
                              key={subject}
                              value={subject}
                            >
                              {subject}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Course Type
                      </label>

                      <select
                        value={
                          form.course_type
                        }
                        onChange={(event) =>
                          updateForm(
                            "course_type",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500"
                      >
                        {COURSE_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Sort Order
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          form.sort_order
                        }
                        onChange={(event) =>
                          updateForm(
                            "sort_order",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* VISUAL */}

                <div>
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Appearance
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Image URL
                      </label>

                      <div className="relative">
                        <ImageIcon
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          value={form.image}
                          onChange={(event) =>
                            updateForm(
                              "image",
                              event.target.value
                            )
                          }
                          placeholder="https://..."
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-4 text-white outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-300">
                        Category Color
                      </label>

                      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
                        {DEFAULT_COLORS.map(
                          (color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                updateForm(
                                  "color",
                                  color
                                )
                              }
                              className={`h-9 w-9 rounded-full transition ${
                                form.color ===
                                color
                                  ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                                  : "hover:scale-105"
                              }`}
                              style={{
                                backgroundColor:
                                  color,
                              }}
                              aria-label={`Select ${color}`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {form.image && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                      <img
                        src={form.image}
                        alt="Category preview"
                        className="h-40 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* STATUS */}

                <div>
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Visibility
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "featured",
                          !form.featured
                        )
                      }
                      className={`flex items-center justify-between rounded-2xl border p-5 text-left transition ${
                        form.featured
                          ? "border-yellow-500/30 bg-yellow-500/10"
                          : "border-slate-800 bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Star
                          size={22}
                          className={
                            form.featured
                              ? "text-yellow-400"
                              : "text-slate-600"
                          }
                        />

                        <div>
                          <p className="font-bold text-white">
                            Featured Category
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Show this category in
                            featured sections.
                          </p>
                        </div>
                      </div>

                      <div
                        className={`h-6 w-11 rounded-full p-1 transition ${
                          form.featured
                            ? "bg-yellow-500"
                            : "bg-slate-700"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white transition ${
                            form.featured
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "active",
                          !form.active
                        )
                      }
                      className={`flex items-center justify-between rounded-2xl border p-5 text-left transition ${
                        form.active
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-slate-800 bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <CheckCircle2
                          size={22}
                          className={
                            form.active
                              ? "text-emerald-400"
                              : "text-slate-600"
                          }
                        />

                        <div>
                          <p className="font-bold text-white">
                            Active Category
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Allow this category to
                            appear publicly.
                          </p>
                        </div>
                      </div>

                      <div
                        className={`h-6 w-11 rounded-full p-1 transition ${
                          form.active
                            ? "bg-emerald-500"
                            : "bg-slate-700"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white transition ${
                            form.active
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/95 px-6 py-5 backdrop-blur sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-bold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    saving ||
                    !form.name.trim()
                  }
                  onClick={saveCategory}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editing
                        ? "Save Changes"
                        : "Create Category"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseCategories;