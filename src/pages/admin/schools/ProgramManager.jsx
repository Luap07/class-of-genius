import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  BookOpen,
  Search,
  Loader2,
} from "lucide-react";

/* =========================================================
   PROGRAM MANAGER
   Manages programs belonging to a faculty
========================================================= */

const ProgramManager = ({ facultyId, schoolId }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    degree_type: "",
    duration: "",
    description: "",
    requirements: "",
    active: true,
  });

  /* =========================================================
     FETCH PROGRAMS
  ========================================================= */

  const fetchPrograms = async () => {
    if (!facultyId) {
      setPrograms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("school_programs")
        .select("*")
        .eq("faculty_id", facultyId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Fetch Programs Error:", error);
        setPrograms([]);
        return;
      }

      setPrograms(data || []);
    } catch (error) {
      console.error("Program Error:", error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [facultyId]);

  /* =========================================================
     OPEN CREATE FORM
  ========================================================= */

  const openCreate = () => {
    setEditingProgram(null);

    setForm({
      name: "",
      code: "",
      degree_type: "",
      duration: "",
      description: "",
      requirements: "",
      active: true,
    });

    setShowForm(true);
  };

  /* =========================================================
     OPEN EDIT FORM
  ========================================================= */

  const openEdit = (program) => {
    setEditingProgram(program);

    setForm({
      name: program.name || "",
      code: program.code || "",
      degree_type: program.degree_type || "",
      duration: program.duration || "",
      description: program.description || "",
      requirements: program.requirements || "",
      active: program.active ?? true,
    });

    setShowForm(true);
  };

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================================================
     SAVE PROGRAM
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Program name is required.");
      return;
    }

    if (!facultyId) {
      alert("Faculty ID is missing.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        faculty_id: facultyId,
        school_id: schoolId || null,
        name: form.name.trim(),
        code: form.code.trim() || null,
        degree_type: form.degree_type.trim() || null,
        duration: form.duration.trim() || null,
        description: form.description.trim() || null,
        requirements: form.requirements.trim() || null,
        active: form.active,
      };

      let error;

      if (editingProgram) {
        ({ error } = await supabase
          .from("school_programs")
          .update(payload)
          .eq("id", editingProgram.id));
      } else {
        ({ error } = await supabase
          .from("school_programs")
          .insert([payload]));
      }

      if (error) {
        console.error("Save Program Error:", error);
        alert(error.message || "Failed to save program.");
        return;
      }

      setShowForm(false);
      setEditingProgram(null);

      await fetchPrograms();
    } catch (error) {
      console.error("Program Save Error:", error);
      alert("Something went wrong while saving the program.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE PROGRAM
  ========================================================= */

  const handleDelete = async (program) => {
    const confirmed = window.confirm(
      `Delete "${program.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("school_programs")
        .delete()
        .eq("id", program.id);

      if (error) {
        console.error("Delete Program Error:", error);
        alert(error.message || "Failed to delete program.");
        return;
      }

      await fetchPrograms();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete program.");
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredPrograms = programs.filter((program) => {
    const query = search.toLowerCase();

    return (
      program.name?.toLowerCase().includes(query) ||
      program.code?.toLowerCase().includes(query) ||
      program.degree_type?.toLowerCase().includes(query)
    );
  });

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl">
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
            <BookOpen
              size={23}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Programs
            </h2>

            <p className="text-sm text-slate-400">
              Manage programs offered by this faculty.
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          Add Program
        </button>
      </div>

      {/* SEARCH */}

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search programs..."
          className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
        />
      </div>

      {/* LOADING */}

      {loading && (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-cyan-400"
          />
        </div>
      )}

      {/* EMPTY */}

      {!loading && filteredPrograms.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 px-6 py-12 text-center">
          <BookOpen
            size={38}
            className="mx-auto text-slate-700"
          />

          <h3 className="mt-4 font-bold text-white">
            No programs found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Add the first program for this faculty.
          </p>
        </div>
      )}

      {/* PROGRAMS */}

      {!loading && filteredPrograms.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-cyan-400/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black text-white">
                    {program.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {program.code && (
                      <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-400">
                        {program.code}
                      </span>
                    )}

                    {program.degree_type && (
                      <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-400">
                        {program.degree_type}
                      </span>
                    )}

                    {program.duration && (
                      <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-400">
                        {program.duration}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    program.active
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  {program.active ? "Active" : "Inactive"}
                </span>
              </div>

              {program.description && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                  {program.description}
                </p>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
                <button
                  onClick={() => openEdit(program)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-400"
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(program)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-red-400/10 hover:text-red-400"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          PROGRAM FORM MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
          >
            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {editingProgram
                    ? "Edit Program"
                    : "Add Program"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the academic details for this program.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Program Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  required
                />
              </div>

              {/* CODE + DEGREE */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">
                    Program Code
                  </label>

                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. CSC"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">
                    Degree Type
                  </label>

                  <input
                    name="degree_type"
                    value={form.degree_type}
                    onChange={handleChange}
                    placeholder="e.g. B.Sc."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                </div>
              </div>

              {/* DURATION */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Duration
                </label>

                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 4 Years"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the program..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              {/* REQUIREMENTS */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Admission Requirements
                </label>

                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter admission requirements..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-900 p-4">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="h-4 w-4 accent-cyan-400"
                />

                <div>
                  <p className="text-sm font-bold text-white">
                    Active Program
                  </p>

                  <p className="text-xs text-slate-500">
                    Make this program visible to students.
                  </p>
                </div>
              </label>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {editingProgram
                    ? "Save Changes"
                    : "Create Program"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;