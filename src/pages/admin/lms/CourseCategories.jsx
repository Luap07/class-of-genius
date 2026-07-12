import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  BookOpen,
  Loader2,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

const CourseCategories = () => {

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
  });

  const loadCategories = async () => {

    try {

      setLoading(true);

      const { data, error } = await supabase
        .from("course_categories")
        .select("*")
        .order("name");

      if (error) throw error;

      const list = [];

      for (const category of data || []) {

        const { count } = await supabase
          .from("courses")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("category_id", category.id);

        list.push({
          ...category,
          courses: count || 0,
        });

      }

      setCategories(list);

    } catch (err) {

      console.error(err);

      alert(err.message);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadCategories();

  }, []);

  const filtered = useMemo(() => {

    return categories.filter((item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [categories, search]);

  const openCreate = () => {

    setEditing(null);

    setForm({
      name: "",
    });

    setShowModal(true);

  };

  const openEdit = (category) => {

    setEditing(category);

    setForm({
      name: category.name,
    });

    setShowModal(true);

  };
    const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const saveCategory = async () => {

    if (!form.name.trim()) {

      alert("Category name is required.");

      return;

    }

    try {

      setSaving(true);

      const payload = {

        name: form.name.trim(),

        slug: generateSlug(form.name),

      };

      if (editing) {

        const { error } = await supabase
          .from("course_categories")
          .update(payload)
          .eq("id", editing.id);

        if (error) throw error;

      } else {

        const { error } = await supabase
          .from("course_categories")
          .insert(payload);

        if (error) throw error;

      }

      setShowModal(false);

      setEditing(null);

      setForm({
        name: "",
      });

      await loadCategories();

    } catch (err) {

      console.error(err);

      alert(err.message);

    } finally {

      setSaving(false);

    }

  };

  const deleteCategory = async (id) => {

    const confirmed = window.confirm(
      "Delete this category?"
    );

    if (!confirmed) return;

    try {

      const { count } = await supabase
        .from("courses")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("category_id", id);

      if ((count || 0) > 0) {

        alert(
          "This category still contains courses. Remove or move the courses before deleting it."
        );

        return;

      }

      const { error } = await supabase
        .from("course_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadCategories();

    } catch (err) {

      console.error(err);

      alert(err.message);

    }

  };

  if (loading) {

    return (

      <div className="flex h-[70vh] items-center justify-center">

        <Loader2
          size={45}
          className="animate-spin text-cyan-400"
        />

      </div>

    );

  }
    return (

    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-black">

            Course Categories

          </h1>

          <p className="mt-2 text-slate-400">

            Manage all learning categories across Scholiqen.

          </p>

        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-700"
        >

          <Plus size={20} />

          New Category

        </button>

      </div>

      {/* Search */}

      <div className="relative max-w-xl">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search categories..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-4 pl-12 pr-5 outline-none transition focus:border-cyan-500"
        />

      </div>

      {/* Create / Edit Modal */}

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
          >

            <motion.div
              initial={{
                scale: .9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: .9,
                opacity: 0,
              }}
              className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8"
            >

              <div className="mb-8 flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold">

                    {editing
                      ? "Edit Category"
                      : "Create Category"}

                  </h2>

                  <p className="mt-1 text-slate-400">

                    Enter the category details.

                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
                >

                  <X size={18} />

                </button>

              </div>

              <div className="space-y-6">

                <div>

                  <label className="mb-3 block font-medium">

                    Category Name

                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Programming"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-cyan-500"
                  />

                </div>

                <div className="flex justify-end gap-3">

                  <button
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="rounded-2xl bg-slate-800 px-6 py-3 hover:bg-slate-700"
                  >

                    Cancel

                  </button>

                  <button
                    disabled={saving}
                    onClick={saveCategory}
                    className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >

                    {saving && (

                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                    )}

                    {editing
                      ? "Update"
                      : "Create"}

                  </button>

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

      {/* Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {filtered.map((category) => (

          <motion.div
            key={category.id}
            whileHover={{
              y: -6,
            }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >
                        <div className="flex items-start justify-between">

              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600"
              >

                <FolderOpen
                  size={28}
                  className="text-white"
                />

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    openEdit(category)
                  }
                  className="rounded-xl bg-slate-800 p-3 transition hover:bg-blue-600"
                >

                  <Edit size={18} />

                </button>

                <button
                  onClick={() =>
                    deleteCategory(category.id)
                  }
                  className="rounded-xl bg-red-600 p-3 transition hover:bg-red-700"
                >

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

            <div className="mt-6 rounded-2xl bg-slate-950 p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <BookOpen
                    size={18}
                    className="text-cyan-400"
                  />

                  <span>

                    Courses

                  </span>

                </div>

                <span className="text-2xl font-bold text-cyan-400">

                  {category.courses}

                </span>

              </div>

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

                    <button
                      onClick={() =>
                        openEdit(category)
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
                    >

                      Edit

                    </button>

                    <button
                      onClick={() =>
                        deleteCategory(category.id)
                      }
                      className="rounded-xl bg-red-600 px-4 py-2 transition hover:bg-red-700"
                    >

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