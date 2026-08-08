import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  GraduationCap,
  Search,
  Loader2,
  ChevronRight,
} from "lucide-react";

import ProgramManager from "./ProgramManager";

/* =========================================================
   FACULTY MANAGER
   Manages faculties belonging to a school
========================================================= */

const FacultyManager = ({ schoolId, schoolType }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [selectedFaculty, setSelectedFaculty] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    dean: "",
    active: true,
  });

  /* =========================================================
     FETCH FACULTIES
  ========================================================= */

  const fetchFaculties = async () => {
    if (!schoolId) {
      setFaculties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("school_faculties")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Fetch Faculties Error:",
          error
        );

        setFaculties([]);
        return;
      }

      setFaculties(data || []);
    } catch (error) {
      console.error(
        "Faculty Fetch Error:",
        error
      );

      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, [schoolId]);

  /* =========================================================
     CREATE FORM
  ========================================================= */

  const openCreate = () => {
    setEditingFaculty(null);

    setForm({
      name: "",
      code: "",
      description: "",
      dean: "",
      active: true,
    });

    setShowForm(true);
  };

  /* =========================================================
     EDIT FORM
  ========================================================= */

  const openEdit = (faculty) => {
    setEditingFaculty(faculty);

    setForm({
      name: faculty.name || "",
      code: faculty.code || "",
      description:
        faculty.description || "",
      dean: faculty.dean || "",
      active: faculty.active ?? true,
    });

    setShowForm(true);
  };

  /* =========================================================
     INPUT
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Faculty name is required.");
      return;
    }

    if (!schoolId) {
      alert("School ID is missing.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        school_id: schoolId,
        name: form.name.trim(),
        code:
          form.code.trim() || null,
        description:
          form.description.trim() || null,
        dean:
          form.dean.trim() || null,
        active: form.active,
      };

      let error;

      if (editingFaculty) {
        ({ error } = await supabase
          .from("school_faculties")
          .update(payload)
          .eq("id", editingFaculty.id));
      } else {
        ({ error } = await supabase
          .from("school_faculties")
          .insert([payload]));
      }

      if (error) {
        console.error(
          "Save Faculty Error:",
          error
        );

        alert(
          error.message ||
            "Failed to save faculty."
        );

        return;
      }

      setShowForm(false);
      setEditingFaculty(null);

      await fetchFaculties();
    } catch (error) {
      console.error(
        "Faculty Save Error:",
        error
      );

      alert(
        "Something went wrong while saving the faculty."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (faculty) => {
    const confirmed = window.confirm(
      `Delete "${faculty.name}"?\n\nAll programs belonging to this faculty may also be affected.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("school_faculties")
        .delete()
        .eq("id", faculty.id);

      if (error) {
        console.error(
          "Delete Faculty Error:",
          error
        );

        alert(
          error.message ||
            "Failed to delete faculty."
        );

        return;
      }

      if (
        selectedFaculty?.id ===
        faculty.id
      ) {
        setSelectedFaculty(null);
      }

      await fetchFaculties();
    } catch (error) {
      console.error(
        "Faculty Delete Error:",
        error
      );

      alert(
        "Failed to delete faculty."
      );
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredFaculties =
    faculties.filter((faculty) => {
      const query =
        search.toLowerCase();

      return (
        faculty.name
          ?.toLowerCase()
          .includes(query) ||
        faculty.code
          ?.toLowerCase()
          .includes(query) ||
        faculty.dean
          ?.toLowerCase()
          .includes(query)
      );
    });

  /* =========================================================
     SELECT FACULTY
  ========================================================= */

  const openPrograms = (faculty) => {
    setSelectedFaculty(faculty);
  };

  /* =========================================================
     PROGRAM VIEW
  ========================================================= */

  if (selectedFaculty) {
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() =>
                setSelectedFaculty(null)
              }
              className="mb-3 text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              ← Back to Faculties
            </button>

            <h2 className="text-2xl font-black text-white">
              {selectedFaculty.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage programs under this faculty.
            </p>
          </div>
        </div>

        <ProgramManager
          facultyId={selectedFaculty.id}
          schoolId={schoolId}
        />
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
            <GraduationCap
              size={23}
              className="text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Faculties
            </h2>

            <p className="text-sm text-slate-400">
              Manage faculties and their academic programs.
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          Add Faculty
        </button>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search faculties..."
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pl-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
        />
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2
            size={30}
            className="animate-spin text-cyan-400"
          />
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        filteredFaculties.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-12 text-center">
            <GraduationCap
              size={40}
              className="mx-auto text-slate-700"
            />

            <h3 className="mt-4 text-lg font-black text-white">
              No faculties found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Add a faculty to start organizing academic programs.
            </p>
          </div>
        )}

      {/* =====================================================
          FACULTY GRID
      ===================================================== */}

      {!loading &&
        filteredFaculties.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredFaculties.map(
              (faculty) => (
                <div
                  key={faculty.id}
                  className="group rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-cyan-400/20 hover:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() =>
                        openPrograms(
                          faculty
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                          <GraduationCap
                            size={20}
                            className="text-blue-400"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black text-white">
                            {faculty.name}
                          </h3>

                          {faculty.code && (
                            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                              {faculty.code}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        faculty.active
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {faculty.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {faculty.description && (
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                      {faculty.description}
                    </p>
                  )}

                  {faculty.dean && (
                    <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Dean
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-300">
                        {faculty.dean}
                      </p>
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <button
                      onClick={() =>
                        openPrograms(
                          faculty
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-400 transition hover:bg-cyan-400/20"
                    >
                      Manage Programs
                      <ChevronRight
                        size={15}
                      />
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          openEdit(
                            faculty
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-cyan-400/10 hover:text-cyan-400"
                        title="Edit faculty"
                      >
                        <Pencil
                          size={15}
                        />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            faculty
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-red-400/10 hover:text-red-400"
                        title="Delete faculty"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

      {/* =====================================================
          FACULTY FORM MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {editingFaculty
                    ? "Edit Faculty"
                    : "Add Faculty"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add academic faculty information.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Faculty Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Faculty of Science"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              {/* CODE */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Faculty Code
                </label>

                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. FOS"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              {/* DEAN */}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Dean
                </label>

                <input
                  name="dean"
                  value={form.dean}
                  onChange={handleChange}
                  placeholder="e.g. Prof. John Doe"
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
                  rows={5}
                  placeholder="Describe the faculty..."
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
                    Active Faculty
                  </p>

                  <p className="text-xs text-slate-500">
                    Make this faculty available to students.
                  </p>
                </div>
              </label>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
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

                  {editingFaculty
                    ? "Save Changes"
                    : "Create Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManager;