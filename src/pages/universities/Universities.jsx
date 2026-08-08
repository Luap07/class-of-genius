import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  GraduationCap,
  Building2,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const Universities = () => {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("universities")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Fetch Universities Error:", error);
      setError("Unable to load universities.");
      setUniversities([]);
    } else {
      setUniversities(data || []);
    }

    setLoading(false);
  };

  const locations = useMemo(() => {
    const values = universities
      .map((university) => university.state || university.location)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [universities]);

  const filteredUniversities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return universities.filter((university) => {
      const name = university.name || "";
      const state = university.state || university.location || "";
      const city = university.city || "";
      const description = university.description || "";

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        state.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query);

      const universityLocation =
        university.state || university.location || "";

      const matchesLocation =
        locationFilter === "All" ||
        universityLocation === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [universities, search, locationFilter]);

  const openUniversity = (university) => {
    navigate(`/universities/${university.id}`);
  };

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-950 to-cyan-950/30" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              <GraduationCap size={17} />
              University Directory
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Explore
              <span className="text-cyan-400"> Universities</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover universities, faculties, departments,
              programs, admission information and academic
              opportunities.
            </p>
          </motion.div>

          {/* SEARCH */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 flex max-w-4xl flex-col gap-3 md:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search universities..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-14 min-w-[210px] appearance-none rounded-2xl border border-white/10 bg-slate-900/80 pl-11 pr-10 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                {locations.map((location) => (
                  <option
                    key={location}
                    value={location}
                    className="bg-slate-900"
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              University Directory
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {search || locationFilter !== "All"
                ? "Search Results"
                : "Universities"}
            </h2>
          </div>

          <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-400">
            {filteredUniversities.length}{" "}
            {filteredUniversities.length === 1
              ? "University"
              : "Universities"}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[390px] animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
              >
                <div className="h-52 bg-slate-800" />

                <div className="space-y-4 p-6">
                  <div className="h-5 w-3/4 rounded bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-800" />
                  <div className="h-10 w-full rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUniversities.length === 0 ? (
          /* EMPTY */

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
              <GraduationCap
                size={30}
                className="text-cyan-400"
              />
            </div>

            <h3 className="mt-6 text-2xl font-black">
              No universities found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Try another search term or change the location
              filter.
            </p>

            {(search || locationFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setLocationFilter("All");
                }}
                className="mt-7 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* UNIVERSITY GRID */

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((university, index) => {
              const image =
                university.cover_url ||
                university.image_url ||
                university.logo_url;

              const location =
                university.city && university.state
                  ? `${university.city}, ${university.state}`
                  : university.state ||
                    university.location ||
                    "Location not specified";

              return (
                <motion.article
                  key={university.id}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.05, 0.4),
                  }}
                  whileHover={{
                    y: -8,
                  }}
                  onClick={() =>
                    openUniversity(university)
                  }
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl transition hover:border-cyan-400/30"
                >
                  {/* IMAGE */}

                  <div className="relative h-56 overflow-hidden bg-slate-800">
                    {image ? (
                      <img
                        src={image}
                        alt={university.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900">
                        <Building2
                          size={55}
                          className="text-slate-600"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
                      University
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-6">
                    <h3 className="line-clamp-1 text-xl font-black text-white">
                      {university.name ||
                        "Unnamed University"}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin
                        size={16}
                        className="shrink-0 text-cyan-400"
                      />

                      <span className="line-clamp-1">
                        {location}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                      {university.description ||
                        "Explore this university, its faculties, programs and academic opportunities."}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="text-sm font-bold text-cyan-400">
                        View University
                      </span>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition group-hover:bg-cyan-400/10 group-hover:text-cyan-400">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Universities;
