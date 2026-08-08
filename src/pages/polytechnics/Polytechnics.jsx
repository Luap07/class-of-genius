// src/pages/Polytechnics.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Wrench,
  MapPin,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const Polytechnics = () => {
  const navigate = useNavigate();

  const [polytechnics, setPolytechnics] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH POLYTECHNICS
  ========================================================= */

  useEffect(() => {
    fetchPolytechnics();
  }, []);

  const fetchPolytechnics = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("polytechnics")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Fetch Polytechnics Error:", error);
        setPolytechnics([]);
        return;
      }

      setPolytechnics(data || []);
    } catch (error) {
      console.error("Polytechnics Error:", error);
      setPolytechnics([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredPolytechnics = polytechnics.filter((polytechnic) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      polytechnic.name?.toLowerCase().includes(query) ||
      polytechnic.location?.toLowerCase().includes(query) ||
      polytechnic.state?.toLowerCase().includes(query) ||
      polytechnic.country?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Wrench
                  size={30}
                  className="text-cyan-400"
                />
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Polytechnics
              </h1>

              <p className="mt-3 max-w-2xl text-slate-400">
                Discover polytechnics, technical programs,
                faculties, courses, locations and admission
                information.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              {polytechnics.length}{" "}
              {polytechnics.length === 1
                ? "Polytechnic"
                : "Polytechnics"}
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="mb-10">
          <div className="relative max-w-2xl">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search polytechnics..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-4 pl-14 pr-5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
            />
          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-3xl border border-white/5 bg-slate-900"
              />
            ))}
          </div>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading && filteredPolytechnics.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-20 text-center">
            <Wrench
              size={45}
              className="mx-auto text-slate-700"
            />

            <h2 className="mt-5 text-2xl font-black text-white">
              No polytechnics found
            </h2>

            <p className="mt-2 text-slate-500">
              {search
                ? "Try searching with another name or location."
                : "Polytechnic information will appear here once it is uploaded."}
            </p>
          </div>
        )}

        {/* =====================================================
            POLYTECHNIC GRID
        ===================================================== */}

        {!loading && filteredPolytechnics.length > 0 && (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredPolytechnics.map((polytechnic) => (
              <motion.div
                key={polytechnic.id}
                whileHover={{
                  y: -8,
                  scale: 1.015,
                }}
                whileTap={{
                  scale: 0.985,
                }}
                onClick={() =>
                  navigate(`/polytechnics/${polytechnic.id}`)
                }
                className="group relative min-h-[300px] cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
              >
                {/* IMAGE */}

                {polytechnic.image_url ? (
                  <img
                    src={polytechnic.image_url}
                    alt={polytechnic.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
                    <Wrench
                      size={80}
                      className="text-cyan-400/20"
                    />
                  </div>
                )}

                {/* OVERLAY */}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/10" />

                {/* CONTENT */}

                <div className="absolute inset-x-0 bottom-0 z-10 p-7">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyan-400">
                    <Wrench size={14} />
                    <span>Polytechnic</span>
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {polytechnic.name}
                  </h2>

                  {(polytechnic.location ||
                    polytechnic.state) && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <MapPin size={14} />

                      <span>
                        {polytechnic.location ||
                          polytechnic.state}
                      </span>
                    </div>
                  )}

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
                    View Polytechnic Details
                    <ExternalLink size={15} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Polytechnics;