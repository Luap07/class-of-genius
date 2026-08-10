
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Building2,
  X,
  Users,
  ArrowRight,
  MapPin,
  Globe,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";
import CollegeForm from "./CollegeForm";

/* =========================================================
   COLLEGE CARD
========================================================= */

const CollegeCard = ({
  college,
  onView,
  onEdit,
  onDelete,
  onFaculties,
}) => {
  const location = [
    college.location,
    college.state,
    college.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -20,
      }}
      whileHover={{
        y: -5,
      }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl"
    >
      {/* =====================================================
          COVER IMAGE
      ===================================================== */}

      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
        {college.image_url ? (
          <img
            src={college.image_url}
            alt={college.name || "College"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2
              size={52}
              className="text-slate-700"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="absolute bottom-4 left-5">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-950 bg-white shadow-2xl">
            {college.logo_url ? (
              <img
                src={college.logo_url}
                alt={`${college.name || "College"} logo`}
                className="h-full w-full object-contain p-2"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <Building2
                size={30}
                className="text-slate-400"
              />
            )}
          </div>
        </div>

        {/* =================================================
            TYPE
        ================================================= */}

        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-950/70 px-3 py-1.5 text-xs font-bold text-cyan-400 backdrop-blur-md">
            <GraduationCap size={13} />
            Institution
          </span>
        </div>

        {/* =================================================
            FACULTY SHORTCUT
        ================================================= */}

        <button
          type="button"
          onClick={() => onFaculties(college)}
          className="absolute right-4 bottom-4 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-cyan-500 hover:text-slate-950"
        >
          <Users size={14} />
          Faculties
        </button>
      </div>

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Small logo fallback/display beside title on
              cards where the cover is missing */}

          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-xl font-black text-white">
              {college.name || "Unnamed Institution"}
            </h2>

            {location && (
              <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>{location}</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
          {college.description ||
            "Institutional information and academic opportunities."}
        </p>

        {/* =================================================
            QUICK INFO
        ================================================= */}

        <div className="mt-5 flex flex-wrap gap-2">
          {college.state && (
            <span className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
              {college.state}
            </span>
          )}

          {college.country && (
            <span className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
              {college.country}
            </span>
          )}
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onView(college)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Eye size={15} />
            Details
          </button>

          <button
            type="button"
            onClick={() => onFaculties(college)}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-black text-slate-950 transition hover:bg-cyan-400"
          >
            <Users size={15} />
            Faculties
            <ArrowRight size={14} />
          </button>
        </div>

        {/* =================================================
            EDIT / DELETE
        ================================================= */}

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEdit(college)}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 py-2.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-400/10"
          >
            <Edit3 size={14} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(college)}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-400/5 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-400/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   COLLEGES ADMIN
========================================================= */

const CollegesAdmin = () => {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);

  const [selectedCollege, setSelectedCollege] = useState(null);

  const [error, setError] = useState("");

  /* =======================================================
     FETCH COLLEGES
  ======================================================= */

  const fetchColleges = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data, error: fetchError } =
        await supabase
          .from("colleges")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (fetchError) {
        throw fetchError;
      }

      setColleges(data || []);
    } catch (err) {
      console.error(
        "Fetch Colleges Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load colleges."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = () => {
    setEditingCollege(null);
    setShowForm(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (college) => {
    if (!college?.id) {
      return;
    }

    setEditingCollege(college);
    setShowForm(true);
  };

  /* =======================================================
     VIEW DETAILS
  ======================================================= */

  const handleView = (college) => {
    if (!college) {
      return;
    }

    setSelectedCollege(college);
  };

  /* =======================================================
     GO TO FACULTIES
  ======================================================= */

  const handleFaculties = (college) => {
    if (!college?.id) {
      return;
    }

    /*
      FLOW:

      Institution
          ↓
      Details
          ↓
      Faculties
          ↓
      Faculty
          ↓
      Programs / Departments
    */

    navigate(
      `/admin/schools/colleges/${college.id}/faculties`
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (college) => {
    if (!college?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${college.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const { error: deleteError } =
        await supabase
          .from("colleges")
          .delete()
          .eq("id", college.id);

      if (deleteError) {
        throw deleteError;
      }

      setColleges((current) =>
        current.filter(
          (item) =>
            item.id !== college.id
        )
      );

      if (
        selectedCollege?.id === college.id
      ) {
        setSelectedCollege(null);
      }
    } catch (err) {
      console.error(
        "Delete College Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete college."
      );
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredColleges = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return colleges;
    }

    return colleges.filter((college) => {
      const searchable = [
        college.name,
        college.location,
        college.state,
        college.country,
        college.description,
        college.website,
        college.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [colleges, search]);

  /* =======================================================
     FORM SUCCESS
  ======================================================= */

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingCollege(null);

    await fetchColleges();
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    setShowForm(false);
    setEditingCollege(null);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-20 animate-pulse rounded-2xl bg-slate-900" />

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-900"
              />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-[500px] animate-pulse rounded-3xl bg-slate-900"
                />
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Building2
                  size={28}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  School Management
                </p>

                <h1 className="mt-1 text-3xl font-black">
                  Colleges & Institutions
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage institutions and continue into their faculties.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  fetchColleges(true)
                }
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus size={18} />
                Add Institution
              </button>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            FLOW INDICATOR
        ================================================= */}

        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
          <div className="flex flex-wrap items-center gap-2 p-4 sm:gap-3 sm:p-5">

            <div className="flex items-center gap-2 rounded-xl bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-400">
              <Building2 size={15} />
              Institution
            </div>

            <ArrowRight
              size={15}
              className="text-slate-700"
            />

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">
              <Eye size={15} />
              Details
            </div>

            <ArrowRight
              size={15}
              className="text-slate-700"
            />

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">
              <Users size={15} />
              Faculties
            </div>

            <ArrowRight
              size={15}
              className="text-slate-700"
            />

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">
              <GraduationCap size={15} />
              Programs
            </div>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-7 flex items-start justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-400">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400/60 transition hover:text-red-300"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-7">
          <div className="relative max-w-2xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search institutions, locations, states..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
            />
          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Institutions
            </p>

            <p className="mt-2 text-3xl font-black text-white">
              {colleges.length}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-500">
              Showing
            </p>

            <p className="mt-2 text-3xl font-black text-cyan-400">
              {filteredColleges.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Directory
            </p>

            <p className="mt-2 text-lg font-black text-emerald-400">
              Active
            </p>
          </div>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredColleges.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Building2
                size={32}
                className="text-cyan-400"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              {colleges.length === 0
                ? "No institutions yet"
                : "No institutions found"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              {colleges.length === 0
                ? "Add your first institution to begin building the academic directory."
                : "Try changing your search term."}
            </p>

            {colleges.length === 0 && (
              <button
                type="button"
                onClick={handleCreate}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus size={18} />
                Add Institution
              </button>
            )}

          </div>
        )}

        {/* =================================================
            GRID
        ================================================= */}

        {filteredColleges.length > 0 && (
          <motion.div
            layout
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredColleges.map(
                (college) => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onFaculties={handleFaculties}
                  />
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =================================================
            FORM MODAL
        ================================================= */}

        <AnimatePresence>
          {showForm && (
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
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            >
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
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: 20,
                }}
                className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={closeForm}
                  className="absolute right-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={20} />
                </button>

                <CollegeForm
                  college={editingCollege}
                  onSuccess={handleFormSuccess}
                  onCancel={closeForm}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            DETAILS MODAL
        ================================================= */}

        <AnimatePresence>
          {selectedCollege && (
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
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            >
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
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: 20,
                }}
                className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
              >

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCollege(null)
                  }
                  className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/90 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={20} />
                </button>

                {/* IMAGE */}

                {selectedCollege.image_url && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        selectedCollege.image_url
                      }
                      alt={
                        selectedCollege.name
                      }
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-7 sm:p-9">

                  <div className="pr-12">

                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                      <Building2 size={13} />
                      Institution
                    </span>

                    <h2 className="mt-4 text-3xl font-black text-white">
                      {selectedCollege.name}
                    </h2>

                    {selectedCollege.description && (
                      <p className="mt-5 leading-8 text-slate-400">
                        {
                          selectedCollege.description
                        }
                      </p>
                    )}

                  </div>

                  {/* =================================================
                      INSTITUTION DETAILS
                  ================================================= */}

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">

                    {[
                      [
                        "Location",
                        selectedCollege.location,
                        MapPin,
                      ],
                      [
                        "State",
                        selectedCollege.state,
                        MapPin,
                      ],
                      [
                        "Country",
                        selectedCollege.country,
                        Globe,
                      ],
                      [
                        "Website",
                        selectedCollege.website,
                        Globe,
                      ],
                      [
                        "Email",
                        selectedCollege.email,
                        Mail,
                      ],
                      [
                        "Phone",
                        selectedCollege.phone,
                        Phone,
                      ],
                    ].map(
                      ([
                        label,
                        value,
                        Icon,
                      ]) =>
                        value ? (
                          <div
                            key={label}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4"
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                size={15}
                                className="text-cyan-400"
                              />

                              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                {label}
                              </p>
                            </div>

                            <p className="mt-2 break-words text-sm font-semibold text-white">
                              {value}
                            </p>
                          </div>
                        ) : null
                    )}

                  </div>

                  {/* =================================================
                      FACULTY FLOW
                  ================================================= */}

                  <div className="mt-8 rounded-3xl border border-cyan-400/10 bg-cyan-400/5 p-5 sm:p-6">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <div className="flex items-center gap-2 text-cyan-400">
                          <Users size={19} />

                          <h3 className="font-black">
                            Academic Faculties
                          </h3>
                        </div>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                          Manage the faculties offered by this institution and continue into their departments and academic programs.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollege(
                            null
                          );

                          handleFaculties(
                            selectedCollege
                          );
                        }}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
                      >
                        <Users size={17} />
                        View Faculties
                        <ArrowRight
                          size={16}
                        />
                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      FOOTER ACTIONS
                  ================================================= */}

                  <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCollege(
                          null
                        );

                        handleEdit(
                          selectedCollege
                        );
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-5 py-3 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/10"
                    >
                      <Edit3 size={16} />
                      Edit Institution
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCollege(
                          null
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                      Close
                    </button>

                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default CollegesAdmin;
