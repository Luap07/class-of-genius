// src/pages/Colleges.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  School,
  MapPin,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

/* =========================================================
   COLLEGES
========================================================= */

const Colleges = () => {
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);

  /* =========================================================
     FETCH COLLEGES
  ========================================================= */

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Fetch Colleges Error:", error);
        setColleges([]);
        return;
      }

      setColleges(data || []);
    } catch (error) {
      console.error("Colleges Error:", error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredColleges = colleges.filter((college) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      college.name?.toLowerCase().includes(query) ||
      college.location?.toLowerCase().includes(query) ||
      college.state?.toLowerCase().includes(query) ||
      college.country?.toLowerCase().includes(query)
    );
  });

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">

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
              <School
                size={30}
                className="text-cyan-400"
              />
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Colleges
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Discover colleges and explore their programs,
              faculties, locations and admission information.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {colleges.length}{" "}
            {colleges.length === 1 ? "College" : "Colleges"}
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
            placeholder="Search colleges..."
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

      {!loading && filteredColleges.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-20 text-center">
          <School
            size={45}
            className="mx-auto text-slate-700"
          />

          <h2 className="mt-5 text-2xl font-black text-white">
            No colleges found
          </h2>

          <p className="mt-2 text-slate-500">
            {search
              ? "Try searching with another name or location."
              : "College information will appear here once it is uploaded."}
          </p>
        </div>
      )}

      {/* =====================================================
          COLLEGE GRID
      ===================================================== */}

      {!loading && filteredColleges.length > 0 && (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

          {filteredColleges.map((college) => (
            <motion.div
              key={college.id}
              whileHover={{
                y: -8,
                scale: 1.015,
              }}
              whileTap={{
                scale: 0.985,
              }}
              onClick={() => setSelectedCollege(college)}
              className="group relative min-h-[300px] cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
            >

              {/* =================================================
                  COLLEGE IMAGE
              ================================================= */}

              {college.image_url ? (
                <img
                  src={college.image_url}
                  alt={college.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
                  <School
                    size={80}
                    className="text-cyan-400/20"
                  />
                </div>
              )}

              {/* =================================================
                  OVERLAY
              ================================================= */}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/10" />

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="absolute inset-x-0 bottom-0 z-10 p-7">

                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <School size={14} />

                  <span>
                    College
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white">
                  {college.name}
                </h2>

                {(college.location || college.state) && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <MapPin size={14} />

                    <span>
                      {college.location ||
                        college.state}
                    </span>
                  </div>
                )}

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-400">
                  View College Details
                  <ExternalLink size={15} />
                </div>

              </div>
            </motion.div>
          ))}

        </div>
      )}

      {/* =====================================================
          COLLEGE DETAILS
      ===================================================== */}

      <AnimatePresence>
        {selectedCollege && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setSelectedCollege(null)}
          >

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
            >

              {/* =================================================
                  DETAIL IMAGE
              ================================================= */}

              <div className="relative h-64 overflow-hidden sm:h-80">

                {selectedCollege.image_url ? (
                  <img
                    src={selectedCollege.image_url}
                    alt={selectedCollege.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-cyan-950">
                    <School
                      size={100}
                      className="text-cyan-400/20"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                <button
                  onClick={() =>
                    setSelectedCollege(null)
                  }
                  className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-6 left-6 right-6">

                  <p className="mb-2 text-sm font-bold text-cyan-400">
                    College
                  </p>

                  <h2 className="text-3xl font-black text-white sm:text-4xl">
                    {selectedCollege.name}
                  </h2>

                </div>
              </div>

              {/* =================================================
                  DETAILS
              ================================================= */}

              <div className="space-y-8 p-6 sm:p-8">

                {/* Location */}

                {(selectedCollege.location ||
                  selectedCollege.state ||
                  selectedCollege.country) && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">

                    <div className="flex items-center gap-3">
                      <MapPin
                        size={20}
                        className="text-cyan-400"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Location
                        </p>

                        <p className="mt-1 font-semibold text-white">
                          {[
                            selectedCollege.location,
                            selectedCollege.state,
                            selectedCollege.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>

                  </div>
                )}

                {/* About */}

                {selectedCollege.description && (
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <BookOpen
                        size={20}
                        className="text-cyan-400"
                      />

                      <h3 className="text-xl font-black text-white">
                        About the College
                      </h3>
                    </div>

                    <p className="leading-8 text-slate-400">
                      {selectedCollege.description}
                    </p>
                  </div>
                )}

                {/* Faculties */}

                {selectedCollege.faculties && (
                  <div>
                    <h3 className="mb-4 text-xl font-black text-white">
                      Faculties
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.isArray(
                        selectedCollege.faculties
                      ) &&
                        selectedCollege.faculties.map(
                          (faculty, index) => (
                            <div
                              key={index}
                              className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-300"
                            >
                              {typeof faculty ===
                              "string"
                                ? faculty
                                : faculty.name ||
                                  faculty.title}
                            </div>
                          )
                        )}
                    </div>
                  </div>
                )}

                {/* Website */}

                {selectedCollege.website && (
                  <a
                    href={selectedCollege.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Visit College Website
                    <ExternalLink size={16} />
                  </a>
                )}

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Colleges;