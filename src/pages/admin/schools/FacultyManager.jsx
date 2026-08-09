import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "lucide-react";

const FacultyManager = () => {
  // =========================================================
  // ROUTE PARAMS
  // =========================================================

  const params = useParams();

  const schoolId =
    params.schoolId ||
    params.school_id ||
    params.id ||
    "";

  const schoolType =
    params.type ||
    params.schoolType ||
    params.school_type ||
    "";

  // =========================================================
  // FACULTY STATE
  // =========================================================

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
  });

  // =========================================================
  // FETCH FACULTIES
  // =========================================================

  const fetchFaculties = async () => {
    if (!schoolId) {
      console.error(
        "FacultyManager: School ID is missing."
      );

      setFaculties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
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

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchFaculties();
  }, [schoolId]);

  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreate = () => {
    setEditingFaculty(null);

    setForm({
      name: "",
      description: "",
      active: true,
    });

    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit = (faculty) => {
    if (!faculty) return;

    setEditingFaculty(faculty);

    setForm({
      name: faculty.name || "",
      description: faculty.description || "",
      active: faculty.active ?? true,
    });

    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingFaculty(null);

    setForm({
      name: "",
      description: "",
      active: true,
    });
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // SAVE FACULTY
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const facultyName =
      String(form?.name || "").trim();

    const facultyDescription =
      String(
        form?.description || ""
      ).trim();

    // =======================================================
    // VALIDATION
    // =======================================================

    if (!facultyName) {
      alert("Faculty name is required.");
      return;
    }

    if (!schoolId) {
      console.error(
        "FacultyManager: Missing schoolId.",
        {
          params,
          schoolId,
          schoolType,
        }
      );

      alert(
        "School ID is missing. Please open the faculty manager from a valid school."
      );

      return;
    }

    if (!schoolType) {
      console.error(
        "FacultyManager: Missing schoolType.",
        {
          params,
          schoolId,
          schoolType,
        }
      );

      alert(
        "School type is missing. Please open the faculty manager from a valid school route."
      );

      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // FACULTY PAYLOAD
      // =====================================================

      const facultyPayload = {
        school_id: schoolId,
        school_type: schoolType,
        name: facultyName,
        description:
          facultyDescription || null,
        active:
          form?.active ?? true,
      };

      console.log(
        "Saving faculty:",
        facultyPayload
      );

      // =====================================================
      // CREATE FACULTY
      // =====================================================

      if (!editingFaculty?.id) {
        const {
          data,
          error,
        } = await supabase
          .from("school_faculties")
          .insert([
            facultyPayload,
          ])
          .select()
          .single();

        if (error) {
          console.error(
            "Create Faculty Error:",
            error
          );

          alert(
            error.message ||
              "Failed to create faculty."
          );

          return;
        }

        console.log(
          "Faculty created:",
          data
        );
      }

      // =====================================================
      // UPDATE FACULTY
      // =====================================================

      else {
        const {
          data,
          error,
        } = await supabase
          .from("school_faculties")
          .update(
            facultyPayload
          )
          .eq(
            "id",
            editingFaculty.id
          )
          .eq(
            "school_id",
            schoolId
          )
          .select()
          .single();

        if (error) {
          console.error(
            "Update Faculty Error:",
            error
          );

          alert(
            error.message ||
              "Failed to update faculty."
          );

          return;
        }

        console.log(
          "Faculty updated:",
          data
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      alert(
        editingFaculty
          ? "Faculty updated successfully."
          : "Faculty created successfully."
      );

      closeForm();

      await fetchFaculties();
    } catch (error) {
      console.error(
        "Faculty Save Error:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong while saving the faculty."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE FACULTY
  // =========================================================

  const handleDelete = async (faculty) => {
    if (!faculty?.id) {
      alert(
        "Faculty ID is missing."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${
          faculty.name ||
          "this faculty"
        }"?`
      );

    if (!confirmed) return;

    try {
      setSaving(true);

      const {
        error,
      } = await supabase
        .from("school_faculties")
        .delete()
        .eq(
          "id",
          faculty.id
        )
        .eq(
          "school_id",
          schoolId
        );

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

      await fetchFaculties();
    } catch (error) {
      console.error(
        "Faculty Delete Error:",
        error
      );

      alert(
        error?.message ||
          "Failed to delete faculty."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FILTER FACULTIES
  // =========================================================

  const filteredFaculties = useMemo(() => {
    const query =
      String(search || "")
        .trim()
        .toLowerCase();

    if (!query) {
      return faculties;
    }

    return faculties.filter(
      (faculty) => {
        const searchable = [
          faculty?.name || "",
          faculty?.description || "",
          faculty?.school_type || "",
          faculty?.dean || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(
          query
        );
      }
    );
  }, [faculties, search]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={32}
            className="animate-spin text-cyan-400"
          />

          <p className="text-sm font-bold text-slate-400">
            Loading faculties...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
            <GraduationCap
              size={24}
              className="text-cyan-400"
            />
          </div>

          <div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              Academic Structure
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              Faculties
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage faculties.
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={!schoolId}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Add Faculty
        </button>

      </div>

      {/* =====================================================
          SCHOOL INFORMATION
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">

          <p className="text-xs font-black uppercase tracking-wider text-slate-600">
            School ID
          </p>

          <p className="mt-2 break-all text-sm font-bold text-cyan-400">
            {schoolId ||
              "Not available"}
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">

          <p className="text-xs font-black uppercase tracking-wider text-slate-600">
            School Type
          </p>

          <p className="mt-2 text-sm font-bold text-cyan-400">
            {schoolType ||
              "Not available"}
          </p>

        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search faculties..."
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pl-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
        />

      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredFaculties.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-14 text-center">

          <GraduationCap
            size={42}
            className="mx-auto text-slate-700"
          />

          <h3 className="mt-5 text-xl font-black text-white">
            {faculties.length === 0
              ? "No faculties yet"
              : "No faculties found"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {faculties.length === 0
              ? "Create your first faculty to build the academic structure."
              : "Try another search."}
          </p>

          {faculties.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              disabled={!schoolId}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <Plus size={18} />
              Add Faculty
            </button>
          )}

        </div>
      )}

      {/* =====================================================
          FACULTIES
      ===================================================== */}

      {filteredFaculties.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredFaculties.map(
            (faculty) => (
              <div
                key={faculty.id}
                className="group rounded-3xl border border-white/10 bg-slate-950/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-950"
              >

                {/* FACULTY HEADER */}

                <div className="mb-5 flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
                    <GraduationCap
                      size={27}
                      className="text-cyan-400"
                    />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
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

                {/* FACULTY INFORMATION */}

                <h3 className="text-xl font-black text-white">
                  {faculty.name}
                </h3>

                {faculty.school_type && (
                  <p className="mt-2 text-xs font-black uppercase tracking-wider text-cyan-400/70">
                    {faculty.school_type}
                  </p>
                )}

                {faculty.description && (
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-500">
                    {faculty.description}
                  </p>
                )}

                {/* ACTIONS */}

                <div className="mt-6 flex gap-2 border-t border-white/10 pt-5">

                  <button
                    type="button"
                    onClick={() =>
                      openEdit(
                        faculty
                      )
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-400"
                  >
                    <Pencil
                      size={15}
                    />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      handleDelete(
                        faculty
                      )
                    }
                    className="inline-flex items-center justify-center rounded-xl bg-white/5 px-4 py-2.5 text-slate-300 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">

          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur-xl">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                  Faculty Management
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  {editingFaculty
                    ? "Edit Faculty"
                    : "Create Faculty"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-7 p-6"
            >

              {/* =================================================
                  FACULTY INFORMATION
              ================================================= */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">

                <div className="mb-5">

                  <h3 className="text-lg font-black text-white">
                    Faculty Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Basic information about this faculty.
                  </p>

                </div>

                <div className="space-y-5">

                  {/* NAME */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-300">
                      Faculty Name
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Faculty of Computing"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-300">
                      Faculty Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      rows={6}
                      placeholder="Describe this faculty..."
                      className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                    />

                  </div>

                  {/* SCHOOL TYPE */}

                  <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">

                    <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                      School Type
                    </p>

                    <p className="mt-2 text-sm font-black text-cyan-400">
                      {schoolType ||
                        "Missing"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Automatically attached to this faculty.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  ACTIVE FACULTY
              ================================================= */}

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">

                <input
                  type="checkbox"
                  name="active"
                  checked={
                    form.active
                  }
                  onChange={
                    handleChange
                  }
                  className="h-4 w-4 accent-cyan-400"
                />

                <div>

                  <p className="text-sm font-bold text-white">
                    Active Faculty
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Make this faculty available to students.
                  </p>

                </div>

              </label>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !schoolId
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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
                    ? "Save Faculty"
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
