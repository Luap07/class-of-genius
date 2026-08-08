// src/admin/pages/schools/universities/UniversitiesAdmin.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  GraduationCap,
  MapPin,
  Globe,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

/* =========================================================
   UNIVERSITY CARD
========================================================= */

const UniversityCard = ({
  university,
  onEdit,
  onDelete,
  onView,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const logo =
    university.logo_url ||
    university.image_url ||
    university.cover_url;

  const location = [
    university.city,
    university.state,
    university.country,
  ]
    .filter(Boolean)
    .join(", ");

  const isActive = university.active !== false;

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
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl"
    >
      {/* =================================================
          COVER
      ================================================= */}

      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
        {university.cover_url ? (
          <img
            src={university.cover_url}
            alt={university.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <GraduationCap
              size={52}
              className="text-slate-700"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        {/* STATUS */}

        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-md ${
              isActive
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                : "border-red-400/20 bg-red-400/10 text-red-400"
            }`}
          >
            {isActive ? (
              <CheckCircle2 size={13} />
            ) : (
              <XCircle size={13} />
            )}

            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* MENU */}

        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={() =>
              setMenuOpen((value) => !value)
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/60 text-slate-300 backdrop-blur-md transition hover:bg-slate-900 hover:text-white"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -5,
                }}
                className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onView(university);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(university);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(university);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/5"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="relative px-6">
        <div className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800 shadow-xl">
          {logo ? (
            <img
              src={logo}
              alt={`${university.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <GraduationCap
              size={30}
              className="text-cyan-400"
            />
          )}
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-6 pt-4">
        <h3 className="line-clamp-2 text-xl font-black text-white">
          {university.name || "Unnamed University"}
        </h3>

        {university.short_name && (
          <p className="mt-1 text-sm font-semibold text-cyan-400">
            {university.short_name}
          </p>
        )}

        {location && (
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-400">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-slate-500"
            />

            <span>{location}</span>
          </div>
        )}

        {university.website && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Globe size={15} />

            <span className="truncate">
              {university.website}
            </span>
          </div>
        )}

        {university.email && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Mail size={15} />

            <span className="truncate">
              {university.email}
            </span>
          </div>
        )}

        {university.phone && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Phone size={15} />

            <span className="truncate">
              {university.phone}
            </span>
          </div>
        )}

        {university.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {university.description}
          </p>
        )}

        {/* ACTIONS */}

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onView(university)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Eye size={15} />
            View
          </button>

          <button
            type="button"
            onClick={() => onEdit(university)}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-2.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-400/10"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(university)}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-400/5 px-3 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-400/10"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   DELETE MODAL
========================================================= */

const DeleteModal = ({
  university,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!university) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <Trash2 size={25} />
        </div>

        <h2 className="mt-6 text-2xl font-black text-white">
          Delete University?
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          You are about to delete{" "}
          <strong className="text-white">
            {university.name}
          </strong>
          . This action cannot be undone.
        </p>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* =========================================================
   UNIVERSITIES ADMIN
========================================================= */

const UniversitiesAdmin = () => {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     FETCH UNIVERSITIES
  ======================================================= */

  const fetchUniversities = async (
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
          .from("universities")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (fetchError) {
        throw fetchError;
      }

      setUniversities(data || []);
    } catch (err) {
      console.error(
        "Fetch Universities Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load universities."
      );

      setUniversities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredUniversities = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return universities.filter(
      (university) => {
        const name =
          university.name || "";

        const shortName =
          university.short_name || "";

        const city =
          university.city || "";

        const state =
          university.state || "";

        const country =
          university.country || "";

        const matchesSearch =
          !query ||
          name.toLowerCase().includes(query) ||
          shortName
            .toLowerCase()
            .includes(query) ||
          city.toLowerCase().includes(query) ||
          state.toLowerCase().includes(query) ||
          country
            .toLowerCase()
            .includes(query);

        const active =
          university.active !== false;

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" &&
            active) ||
          (statusFilter === "inactive" &&
            !active);

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    universities,
    search,
    statusFilter,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const activeCount = universities.filter(
    (university) =>
      university.active !== false
  ).length;

  const inactiveCount =
    universities.length - activeCount;

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleAdd = () => {
    navigate(
      "/admin/schools/universities/new"
    );
  };

  const handleEdit = (university) => {
    if (!university?.id) {
      return;
    }

    navigate(
      `/admin/schools/universities/${university.id}/edit`
    );
  };

  const handleView = (university) => {
    if (!university?.id) {
      return;
    }

    navigate(
      `/admin/schools/universities/${university.id}`
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");

      const { error: deleteError } =
        await supabase
          .from("universities")
          .delete()
          .eq("id", deleteTarget.id);

      if (deleteError) {
        throw deleteError;
      }

      setUniversities((current) =>
        current.filter(
          (item) =>
            item.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(
        "Delete University Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete university."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-20 animate-pulse rounded-2xl bg-slate-900" />

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-[450px] animate-pulse rounded-3xl bg-slate-900"
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
          <button
            type="button"
            onClick={() =>
              navigate("/admin/schools")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Schools
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <GraduationCap size={29} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  School Management
                </p>

                <h1 className="mt-1 text-3xl font-black text-white">
                  Universities
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage universities in the Scholiqen directory.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              Add University
            </button>
          </div>
        </motion.div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Universities
            </p>

            <p className="mt-2 text-3xl font-black text-white">
              {universities.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-400">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-400/10 bg-red-400/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-black text-red-400">
              {inactiveCount}
            </p>
          </div>
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
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
                placeholder="Search universities..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ].map(
                ([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() =>
                      setStatusFilter(value)
                    }
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                      statusFilter === value
                        ? "bg-cyan-500 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  fetchUniversities(true)
                }
                disabled={refreshing}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:text-white disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-8 flex items-start justify-between gap-4 rounded-2xl border border-red-400/10 bg-red-400/5 p-5 text-sm text-red-400">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400/60 transition hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredUniversities.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
              <GraduationCap size={32} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-white">
              {universities.length === 0
                ? "No universities yet"
                : "No universities found"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              {universities.length === 0
                ? "Start building your school directory by adding your first university."
                : "Try changing your search or status filter."}
            </p>

            {universities.length === 0 && (
              <button
                type="button"
                onClick={handleAdd}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus size={18} />
                Add University
              </button>
            )}
          </div>
        )}

        {/* =================================================
            UNIVERSITY GRID
        ================================================= */}

        {filteredUniversities.length > 0 && (
          <motion.div
            layout
            className="grid gap-7 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredUniversities.map(
                (university) => (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={(item) =>
                      setDeleteTarget(item)
                    }
                  />
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =================================================
            DELETE MODAL
        ================================================= */}

        <DeleteModal
          university={deleteTarget}
          loading={deleteLoading}
          onCancel={() =>
            setDeleteTarget(null)
          }
          onConfirm={handleDelete}
        />
      </div>
    </section>
  );
};

export default UniversitiesAdmin;