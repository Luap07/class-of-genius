
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
  Wrench,
  X,
  Users,
  MapPin,
  Globe,
  Mail,
  Phone,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";
import PolytechnicForm from "./PolytechnicForm";

const PolytechnicsAdmin = () => {
  const navigate = useNavigate();

  const [polytechnics, setPolytechnics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPolytechnic, setEditingPolytechnic] =
    useState(null);

  const [selectedPolytechnic, setSelectedPolytechnic] =
    useState(null);

  const [error, setError] = useState("");

  /* =========================================================
     FETCH POLYTECHNICS
  ========================================================= */

  const fetchPolytechnics = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data, error: fetchError } = await supabase
        .from("polytechnics")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setPolytechnics(data || []);
    } catch (err) {
      console.error(
        "Fetch Polytechnics Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load polytechnics."
      );

      setPolytechnics([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPolytechnics();
  }, []);

  /* =========================================================
     CREATE
  ========================================================= */

  const handleCreate = () => {
    setEditingPolytechnic(null);
    setShowForm(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (polytechnic) => {
    if (!polytechnic?.id) {
      return;
    }

    setEditingPolytechnic(polytechnic);
    setShowForm(true);
  };

  /* =========================================================
     VIEW DETAILS
  ========================================================= */

  const handleView = (polytechnic) => {
    setSelectedPolytechnic(polytechnic);
  };

  /* =========================================================
     FACULTY FLOW
  ========================================================= */

  const handleFaculties = (polytechnic) => {
    if (!polytechnic?.id) {
      return;
    }

    navigate(
      `/admin/schools/polytechnics/${polytechnic.id}/faculties`
    );
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const polytechnic = polytechnics.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        polytechnic?.name || "this polytechnic"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const { error: deleteError } = await supabase
        .from("polytechnics")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setPolytechnics((previous) =>
        previous.filter(
          (polytechnic) =>
            polytechnic.id !== id
        )
      );

      if (
        selectedPolytechnic?.id === id
      ) {
        setSelectedPolytechnic(null);
      }
    } catch (err) {
      console.error(
        "Delete Polytechnic Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete polytechnic."
      );
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredPolytechnics = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return polytechnics;
    }

    return polytechnics.filter(
      (polytechnic) => {
        const name =
          polytechnic.name || "";

        const location =
          polytechnic.location || "";

        const state =
          polytechnic.state || "";

        const country =
          polytechnic.country || "";

        return (
          name
            .toLowerCase()
            .includes(query) ||
          location
            .toLowerCase()
            .includes(query) ||
          state
            .toLowerCase()
            .includes(query) ||
          country
            .toLowerCase()
            .includes(query)
        );
      }
    );
  }, [polytechnics, search]);

  /* =========================================================
     FORM SUCCESS
  ========================================================= */

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPolytechnic(null);
    fetchPolytechnics();
  };

  /* =========================================================
     FORM CANCEL
  ========================================================= */

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPolytechnic(null);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 h-20 animate-pulse rounded-3xl bg-slate-900" />

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
                  className="h-[430px] animate-pulse rounded-3xl bg-slate-900"
                />
              )
            )}
          </div>

        </div>
      </section>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

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

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-400">
                <Wrench size={29} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  School Management
                </p>

                <h1 className="mt-1 text-3xl font-black">
                  Polytechnics
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage polytechnics, faculties and
                  academic programmes.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  fetchPolytechnics(true)
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
                Add Polytechnic
              </button>

            </div>
          </div>
        </motion.div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-400/10 bg-red-400/5 p-4 text-sm text-red-400">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span className="flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400/60 transition hover:text-red-300"
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="mb-7 rounded-2xl border border-white/10 bg-slate-900/70 p-4">

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
              placeholder="Search polytechnics by name, location or state..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
            />

          </div>

        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Polytechnics
            </p>

            <p className="mt-2 text-3xl font-black">
              {polytechnics.length}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-500">
              Showing
            </p>

            <p className="mt-2 text-3xl font-black text-cyan-400">
              {filteredPolytechnics.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Directory Status
            </p>

            <p className="mt-2 text-lg font-black text-emerald-400">
              Active
            </p>
          </div>

        </div>

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {filteredPolytechnics.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
              <Wrench size={32} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              {polytechnics.length === 0
                ? "No polytechnics yet"
                : "No polytechnics found"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              {polytechnics.length === 0
                ? "Add your first polytechnic to begin building the school directory."
                : "Try changing your search terms."}
            </p>

            {polytechnics.length === 0 && (
              <button
                type="button"
                onClick={handleCreate}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus size={18} />
                Add Polytechnic
              </button>
            )}

          </div>
        )}

        {/* =====================================================
            POLYTECHNIC GRID
        ===================================================== */}

        {filteredPolytechnics.length > 0 && (
          <motion.div
            layout
            className="grid gap-7 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">

              {filteredPolytechnics.map(
                (polytechnic) => (
                  <motion.div
                    key={polytechnic.id}
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

                    {/* IMAGE */}

                    <div className="relative h-48 overflow-hidden bg-slate-800">

                      {polytechnic.image_url ? (
                        <img
                          src={
                            polytechnic.image_url
                          }
                          alt={
                            polytechnic.name ||
                            "Polytechnic"
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Wrench
                            size={48}
                            className="text-slate-700"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                      <div className="absolute bottom-4 left-4">

                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-400 backdrop-blur-md">
                          <Wrench size={12} />
                          Polytechnic
                        </span>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="p-6">

                      <h2 className="truncate text-xl font-black text-white">
                        {polytechnic.name ||
                          "Unnamed Polytechnic"}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                        {polytechnic.description ||
                          "Polytechnic information and technical education opportunities."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">

                        {polytechnic.location && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-slate-400">
                            <MapPin size={12} />
                            {polytechnic.location}
                          </span>
                        )}

                        {polytechnic.state && (
                          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-slate-400">
                            {polytechnic.state}
                          </span>
                        )}

                      </div>

                      {/* =================================================
                          FACULTIES BUTTON
                      ================================================= */}

                      <button
                        type="button"
                        onClick={() =>
                          handleFaculties(
                            polytechnic
                          )
                        }
                        className="mt-5 flex w-full items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3.5 text-sm font-black text-cyan-400 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                      >

                        <span className="flex items-center gap-2">
                          <Users size={17} />
                          Faculties & Programmes
                        </span>

                        <ChevronRight size={17} />

                      </button>

                      {/* ACTIONS */}

                      <div className="mt-3 grid grid-cols-3 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleView(
                              polytechnic
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              polytechnic
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 py-3 text-xs font-bold text-cyan-400 transition hover:bg-cyan-400/10"
                        >
                          <Edit3 size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              polytechnic.id
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-400/5 py-3 text-xs font-bold text-red-400 transition hover:bg-red-400/10"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>

                      </div>

                    </div>

                  </motion.div>
                )
              )}

            </AnimatePresence>
          </motion.div>
        )}

        {/* =====================================================
            FORM MODAL
        ===================================================== */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

              <button
                type="button"
                onClick={
                  handleFormCancel
                }
                className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>

              <PolytechnicForm
                polytechnic={
                  editingPolytechnic
                }
                onSuccess={
                  handleFormSuccess
                }
                onCancel={
                  handleFormCancel
                }
              />

            </div>
          </div>
        )}

        {/* =====================================================
            DETAILS MODAL
        ===================================================== */}

        {selectedPolytechnic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-8 shadow-2xl"
            >

              <button
                type="button"
                onClick={() =>
                  setSelectedPolytechnic(
                    null
                  )
                }
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="pr-12">

                <span className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Polytechnic Details
                </span>

                <h2 className="mt-3 text-3xl font-black text-white">
                  {selectedPolytechnic.name}
                </h2>

                {selectedPolytechnic.description && (
                  <p className="mt-5 leading-8 text-slate-400">
                    {
                      selectedPolytechnic.description
                    }
                  </p>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">

                  {[
                    [
                      "Location",
                      selectedPolytechnic.location,
                    ],
                    [
                      "State",
                      selectedPolytechnic.state,
                    ],
                    [
                      "Country",
                      selectedPolytechnic.country,
                    ],
                    [
                      "Website",
                      selectedPolytechnic.website,
                    ],
                    [
                      "Email",
                      selectedPolytechnic.email,
                    ],
                    [
                      "Phone",
                      selectedPolytechnic.phone,
                    ],
                  ].map(
                    ([label, value]) =>
                      value ? (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            {label}
                          </p>

                          <p className="mt-2 break-words text-sm font-semibold text-white">
                            {value}
                          </p>
                        </div>
                      ) : null
                  )}

                </div>

                {/* =================================================
                    FACULTY FLOW FROM DETAILS
                ================================================= */}

                <div className="mt-7">

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPolytechnic(
                        null
                      );

                      handleFaculties(
                        selectedPolytechnic
                      );
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                        <Users size={20} />
                      </div>

                      <div>
                        <p className="font-black text-white">
                          Faculties & Programmes
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Manage faculties and what
                          each faculty offers.
                        </p>
                      </div>

                    </div>

                    <ChevronRight
                      size={20}
                      className="text-cyan-400"
                    />

                  </button>

                </div>

              </div>

            </motion.div>

          </div>
        )}

      </div>
    </section>
  );
};

export default PolytechnicsAdmin;
