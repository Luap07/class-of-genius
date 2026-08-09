// src/admin/pages/schools/universities/ProgramForm.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Building2,
  Clock,
  FileText,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

const ProgramForm = ({
  university,
  faculty,
  program = null,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(program?.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [universityData, setUniversityData] = useState(
    university || null
  );

  const [facultyData, setFacultyData] = useState(
    faculty || null
  );

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [form, setForm] = useState({
    name: "",
    degree: "",
    duration: "",
    description: "",
  });

  /* =========================================================
     LOAD PROGRAM WHEN EDITING
  ========================================================= */

  useEffect(() => {
    if (program) {
      setForm({
        name: program.name || "",
        degree: program.degree || "",
        duration: program.duration || "",
        description: program.description || "",
      });
    } else {
      setForm({
        name: "",
        degree: "",
        duration: "",
        description: "",
      });
    }
  }, [program]);

  /* =========================================================
     LOAD UNIVERSITY
  ========================================================= */

  useEffect(() => {
    const loadUniversity = async () => {
      if (university) {
        setUniversityData(university);
        return;
      }

      if (!program?.university_id) {
        return;
      }

      try {
        setLoadingData(true);

        const { data, error } = await supabase
          .from("universities")
          .select("*")
          .eq("id", program.university_id)
          .single();

        if (error) {
          throw error;
        }

        setUniversityData(data);
      } catch (err) {
        console.error(
          "Load University Error:",
          err
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadUniversity();
  }, [university, program]);

  /* =========================================================
     LOAD FACULTY
  ========================================================= */

  useEffect(() => {
    const loadFaculty = async () => {
      if (faculty) {
        setFacultyData(faculty);
        return;
      }

      if (!program?.faculty_id) {
        return;
      }

      try {
        setLoadingData(true);

        const { data, error } = await supabase
          .from("school_faculties")
          .select("*")
          .eq("id", program.faculty_id)
          .single();

        if (error) {
          throw error;
        }

        setFacultyData(data);
      } catch (err) {
        console.error(
          "Load Faculty Error:",
          err
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadFaculty();
  }, [faculty, program]);

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!universityData?.id) {
      return "University information is missing.";
    }

    if (!facultyData?.id) {
      return "Faculty information is missing.";
    }

    if (!form.name.trim()) {
      return "Program name is required.";
    }

    if (!form.degree.trim()) {
      return "Degree is required.";
    }

    if (!form.duration.trim()) {
      return "Program duration is required.";
    }

    return null;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT
       *
       * Only use columns that exist in school_programs.
       *
       * We intentionally DO NOT send:
       * - code
       * - requirements
       *
       * because those columns do not exist in your current
       * Supabase schema.
       */

      const payload = {
        university_id: universityData.id,
        faculty_id: facultyData.id,

        name: form.name.trim(),

        degree: form.degree.trim(),

        duration: form.duration.trim(),

        description:
          form.description.trim() || null,
      };

      /* =====================================================
         UPDATE
      ===================================================== */

      if (isEditing) {
        const { data, error } = await supabase
          .from("school_programs")
          .update(payload)
          .eq("id", program.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log(
          "Program Updated:",
          data
        );

        setSuccess(
          "Program updated successfully."
        );

        setTimeout(() => {
          if (onSuccess) {
            onSuccess(data);
          }
        }, 500);

        return;
      }

      /* =====================================================
         CREATE
      ===================================================== */

      const { data, error } = await supabase
        .from("school_programs")
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(
        "Program Created:",
        data
      );

      setSuccess(
        "Program created successfully."
      );

      setForm({
        name: "",
        degree: "",
        duration: "",
        description: "",
      });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data);
        }
      }, 500);
    } catch (err) {
      console.error(
        "Save Program Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save program."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    if (loading) {
      return;
    }

    if (onCancel) {
      onCancel();
    }
  };

  /* =========================================================
     LOADING DATA
  ========================================================= */

  if (loadingData) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-slate-950 p-8 text-white">
        <div className="text-center">
          <Loader2
            size={35}
            className="mx-auto animate-spin text-cyan-400"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading program information...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="bg-slate-950 text-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-white/10 bg-slate-900/70 p-6 lg:p-8">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <BookOpen size={27} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-400">
                {isEditing
                  ? "Edit Program"
                  : "Create Program"}
              </p>

              <h1 className="mt-1 text-2xl font-black lg:text-3xl">
                {isEditing
                  ? "Edit Academic Program"
                  : "Add Academic Program"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create a program under the selected
                faculty and university.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      {/* =====================================================
          FLOW
      ===================================================== */}

      <div className="border-b border-white/10 bg-slate-950 p-5 lg:p-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
          <div className="flex flex-col md:flex-row">

            {/* UNIVERSITY */}

            <div className="flex flex-1 items-center gap-3 border-b border-white/10 p-4 md:border-b-0 md:border-r">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                <GraduationCap
                  size={18}
                  className="text-cyan-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  Step 1
                </p>

                <p className="truncate text-sm font-bold text-white">
                  {universityData?.name ||
                    "University"}
                </p>
              </div>
            </div>

            <div className="hidden items-center justify-center px-2 md:flex">
              <ChevronRight
                size={18}
                className="text-slate-700"
              />
            </div>

            {/* FACULTY */}

            <div className="flex flex-1 items-center gap-3 border-b border-white/10 p-4 md:border-b-0 md:border-r">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
                <Building2
                  size={18}
                  className="text-blue-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  Step 2
                </p>

                <p className="truncate text-sm font-bold text-white">
                  {facultyData?.name ||
                    "Faculty"}
                </p>
              </div>
            </div>

            <div className="hidden items-center justify-center px-2 md:flex">
              <ChevronRight
                size={18}
                className="text-slate-700"
              />
            </div>

            {/* PROGRAM */}

            <div className="flex flex-1 items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10">
                <BookOpen
                  size={18}
                  className="text-violet-400"
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-400">
                  Step 3
                </p>

                <p className="text-sm font-bold text-white">
                  Program
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="p-6 lg:p-8"
      >
        {/* ===================================================
            ERROR
        =================================================== */}

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
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-bold text-red-400">
                Unable to save program
              </p>

              <p className="mt-1 text-sm leading-6 text-red-400/70">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {/* ===================================================
            SUCCESS
        =================================================== */}

        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4"
          >
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <div>
              <p className="text-sm font-bold text-emerald-400">
                Success
              </p>

              <p className="mt-1 text-sm text-emerald-400/70">
                {success}
              </p>
            </div>
          </motion.div>
        )}

        {/* ===================================================
            PARENT INFORMATION
        =================================================== */}

        <div className="mb-7">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
              Academic Structure
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Program belongs to
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* UNIVERSITY */}

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <GraduationCap
                    size={19}
                    className="text-cyan-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    University
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-white">
                    {universityData?.name ||
                      "Not selected"}
                  </p>
                </div>
              </div>
            </div>

            {/* FACULTY */}

            <div className="rounded-2xl border border-blue-400/10 bg-blue-400/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                  <Building2
                    size={19}
                    className="text-blue-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                    Faculty
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-white">
                    {facultyData?.name ||
                      "Not selected"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ===================================================
            PROGRAM DETAILS
        =================================================== */}

        <div>
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
              Program Information
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Program Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the academic program offered by
              this faculty.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* PROGRAM NAME */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Program Name
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <div className="relative">
                <BookOpen
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-slate-900"
                />
              </div>
            </div>

            {/* DEGREE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Degree
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <div className="relative">
                <GraduationCap
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  placeholder="e.g. B.Sc."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40"
                />
              </div>

              <p className="mt-2 text-xs text-slate-600">
                Examples: B.Sc., B.A., B.Eng.,
                HND, ND, M.Sc.
              </p>
            </div>

            {/* DURATION */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Duration
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 4 Years"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40"
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Description
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-4 top-4 text-slate-600"
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe what students learn in this program, the academic focus, and career opportunities..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 py-3.5 pl-11 pr-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ===================================================
            INFO
        =================================================== */}

        <div className="mt-7 rounded-2xl border border-violet-400/10 bg-violet-400/5 p-5">
          <div className="flex items-start gap-3">
            <BookOpen
              size={20}
              className="mt-0.5 shrink-0 text-violet-400"
            />

            <div>
              <p className="text-sm font-black text-white">
                Program hierarchy
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                This program will be stored under{" "}
                <span className="font-semibold text-cyan-400">
                  {universityData?.name ||
                    "the selected university"}
                </span>{" "}
                →{" "}
                <span className="font-semibold text-blue-400">
                  {facultyData?.name ||
                    "the selected faculty"}
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-7 py-3 text-sm font-black text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                {isEditing
                  ? "Updating..."
                  : "Creating..."}
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing
                  ? "Update Program"
                  : "Create Program"}
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  );
};

export default ProgramForm;