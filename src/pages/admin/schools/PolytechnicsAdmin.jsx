
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";
import PolytechnicForm from "./PolytechnicForm";

const PolytechnicsAdmin = () => {
  const [polytechnics, setPolytechnics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPolytechnic, setEditingPolytechnic] =
    useState(null);

  const [selectedPolytechnic, setSelectedPolytechnic] =
    useState(null);

  /* =========================================================
     FETCH POLYTECHNICS
  ========================================================= */

  const fetchPolytechnics = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("polytechnics")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setPolytechnics(data || []);
    } catch (error) {
      console.error(
        "Fetch Polytechnics Error:",
        error
      );
    } finally {
      setLoading(false);
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
    setEditingPolytechnic(polytechnic);
    setShowForm(true);
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this polytechnic?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("polytechnics")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setPolytechnics((previous) =>
        previous.filter(
          (polytechnic) =>
            polytechnic.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete Polytechnic Error:",
        error
      );

      alert(
        "Unable to delete polytechnic."
      );
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredPolytechnics =
    polytechnics.filter((polytechnic) => {
      const query = search.toLowerCase().trim();

      if (!query) return true;

      return (
        polytechnic.name
          ?.toLowerCase()
          .includes(query) ||
        polytechnic.location
          ?.toLowerCase()
          .includes(query) ||
        polytechnic.state
          ?.toLowerCase()
          .includes(query) ||
        polytechnic.country
          ?.toLowerCase()
          .includes(query)
      );
    });

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white lg:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Wrench
              size={25}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h1 className="text-3xl font-black">
              Polytechnics
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage polytechnics and their
              institutional information.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchPolytechnics}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus size={18} />
            Add Polytechnic
          </button>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mb-7">
        <div className="relative max-w-xl">
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
            placeholder="Search polytechnics..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
          />
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-500">
            Total Polytechnics
          </p>

          <p className="mt-2 text-3xl font-black">
            {polytechnics.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-500">
            Showing
          </p>

          <p className="mt-2 text-3xl font-black text-cyan-400">
            {filteredPolytechnics.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-500">
            Directory Status
          </p>

          <p className="mt-2 text-lg font-black text-emerald-400">
            Active
          </p>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-3xl border border-white/10 bg-slate-900"
            />
          ))}
        </div>
      ) : filteredPolytechnics.length === 0 ? (
        /* ===================================================
           EMPTY
        =================================================== */

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-16 text-center">
          <Wrench
            size={45}
            className="mx-auto text-slate-700"
          />

          <h2 className="mt-5 text-xl font-black">
            No polytechnics found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add your first polytechnic to begin
            building the directory.
          </p>

          <button
            onClick={handleCreate}
            className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            Add Polytechnic
          </button>
        </div>
      ) : (
        /* ===================================================
           GRID
        =================================================== */

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPolytechnics.map(
            (polytechnic) => (
              <motion.div
                key={polytechnic.id}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
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
                        polytechnic.name
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

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />

                  <div className="absolute bottom-4 left-4">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400">
                      Polytechnic
                    </span>
                  </div>
                </div>

                {/* DETAILS */}

                <div className="p-6">
                  <h2 className="truncate text-xl font-black">
                    {polytechnic.name}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                    {polytechnic.description ||
                      "Polytechnic information and technical education opportunities."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {polytechnic.location && (
                      <span className="rounded-lg bg-white/5 px-3 py-1.5 text-slate-400">
                        {polytechnic.location}
                      </span>
                    )}

                    {polytechnic.state && (
                      <span className="rounded-lg bg-white/5 px-3 py-1.5 text-slate-400">
                        {polytechnic.state}
                      </span>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        setSelectedPolytechnic(
                          polytechnic
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    <button
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
        </div>
      )}

      {/* =====================================================
          FORM MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingPolytechnic(null);
              }}
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>

            <PolytechnicForm
              polytechnic={
                editingPolytechnic
              }
              onSuccess={() => {
                setShowForm(false);
                setEditingPolytechnic(null);
                fetchPolytechnics();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingPolytechnic(null);
              }}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedPolytechnic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-8 shadow-2xl">
            <button
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

              <h2 className="mt-3 text-3xl font-black">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolytechnicsAdmin;
