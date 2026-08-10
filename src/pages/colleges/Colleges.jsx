// src/pages/Colleges.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Search,
  MapPin,
  School,
  ArrowRight,
  Filter,
  X,
  ChevronLeft,
  BookOpen,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const Colleges = () => {
  const navigate = useNavigate();
  const { id: collegeId } = useParams();

  const isDetailPage = Boolean(collegeId);

  // =========================================================
  // COLLEGE LIST STATE
  // =========================================================

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");

  const [error, setError] = useState("");

  // =========================================================
  // COLLEGE DETAIL STATE
  // =========================================================

  const [college, setCollege] = useState(null);
  const [faculties, setFaculties] = useState([]);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // =========================================================
  // FETCH COLLEGES
  // =========================================================

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("colleges")
        .select("*")
        .order("name", {
          ascending: true,
        });

      if (fetchError) {
        console.error("Fetch Colleges Error:", fetchError);

        setError(
          fetchError.message || "Unable to load colleges."
        );

        setColleges([]);
        return;
      }

      setColleges(data || []);
    } catch (err) {
      console.error("Colleges Fetch Error:", err);

      setError(
        "Something went wrong while loading colleges."
      );

      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH COLLEGE DETAILS
  // =========================================================

  const fetchCollegeDetails = async () => {
    if (!collegeId) return;

    try {
      setDetailLoading(true);
      setDetailError("");

      setCollege(null);
      setFaculties([]);

      // -----------------------------------------------------
      // FETCH COLLEGE
      // -----------------------------------------------------

      const {
        data: collegeData,
        error: collegeError,
      } = await supabase
        .from("colleges")
        .select("*")
        .eq("id", collegeId)
        .maybeSingle();

      if (collegeError) {
        console.error(
          "Fetch College Detail Error:",
          collegeError
        );

        setDetailError(
          collegeError.message ||
            "Unable to load college."
        );

        return;
      }

      if (!collegeData) {
        setDetailError("College not found.");
        return;
      }

      setCollege(collegeData);

      // -----------------------------------------------------
      // FETCH FACULTIES
      //
      // Uses the same structure as Universities.jsx.
      //
      // school_faculties.school_id -> colleges.id
      //
      // We do NOT query:
      // - college_faculties
      // - school_faculty_courses
      // - courses table
      //
      // Courses are read from faculty.courses when available.
      // -----------------------------------------------------

      const {
        data: facultyData,
        error: facultyError,
      } = await supabase
        .from("school_faculties")
        .select("*")
        .eq("school_id", collegeId)
        .order("created_at", {
          ascending: true,
        });

      if (facultyError) {
        console.error(
          "Fetch College Faculties Error:",
          facultyError
        );

        setFaculties([]);
      } else {
        setFaculties(facultyData || []);
      }
    } catch (err) {
      console.error("College Detail Error:", err);

      setDetailError(
        "Something went wrong while loading the college."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (isDetailPage) {
      fetchCollegeDetails();
    } else {
      fetchColleges();
    }
  }, [collegeId]);

  // =========================================================
  // LOCATIONS
  //
  // IMPORTANT:
  // We do NOT use college.location because your
  // colleges table does not contain that column.
  // =========================================================

  const locations = useMemo(() => {
    const values = colleges
      .map(
        (collegeItem) =>
          collegeItem.state ||
          collegeItem.city ||
          collegeItem.country
      )
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [colleges]);

  // =========================================================
  // GET COLLEGE LOCATION
  // =========================================================

  const getCollegeLocation = (collegeItem) => {
    if (!collegeItem) {
      return "Location not specified";
    }

    const parts = [
      collegeItem.city,
      collegeItem.state,
      collegeItem.country,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return "Location not specified";
  };

  // =========================================================
  // FILTER COLLEGES
  // =========================================================

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase();

    return colleges.filter((collegeItem) => {
      const name = collegeItem.name || "";
      const state = collegeItem.state || "";
      const city = collegeItem.city || "";
      const country = collegeItem.country || "";
      const description = collegeItem.description || "";

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        state.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query) ||
        country.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query);

      const collegeLocation =
        collegeItem.state ||
        collegeItem.city ||
        collegeItem.country ||
        "";

      const matchesLocation =
        locationFilter === "All" ||
        collegeLocation === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [colleges, search, locationFilter]);

  // =========================================================
  // OPEN COLLEGE
  // =========================================================

  const openCollege = (collegeItem) => {
    if (!collegeItem?.id) return;

    navigate(`/colleges/${collegeItem.id}`);
  };

  // =========================================================
  // BACK
  // =========================================================

  const goBack = () => {
    navigate("/colleges");
  };

  // =========================================================
  // GET COLLEGE IMAGE
  // =========================================================

  const getCollegeImage = (collegeItem) => {
    if (!collegeItem) return null;

    return (
      collegeItem.cover_url ||
      collegeItem.image_url ||
      collegeItem.logo_url ||
      null
    );
  };

  // =========================================================
  // NORMALIZE FACULTY COURSES
  //
  // Supports courses stored as JSON/JSONB.
  // =========================================================

  const getFacultyCourses = (faculty) => {
    if (!faculty) return [];

    const rawCourses = faculty.courses;

    if (Array.isArray(rawCourses)) {
      return rawCourses;
    }

    if (typeof rawCourses === "string") {
      try {
        const parsed = JSON.parse(rawCourses);

        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  // =========================================================
  // DETAIL PAGE
  // =========================================================

  if (isDetailPage) {
    // -------------------------------------------------------
    // DETAIL LOADING
    // -------------------------------------------------------

    if (detailLoading) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 w-32 rounded bg-slate-800" />

              <div className="mt-8 h-[360px] rounded-3xl bg-slate-900" />

              <div className="mt-8 h-8 w-72 rounded bg-slate-800" />

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-40 rounded-2xl bg-slate-900"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------
    // DETAIL ERROR
    // -------------------------------------------------------

    if (detailError) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={18} />
              Back to Colleges
            </button>

            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center">
              <School
                size={45}
                className="mx-auto text-red-400"
              />

              <h2 className="mt-5 text-2xl font-black text-white">
                Unable to load college
              </h2>

              <p className="mt-3 text-sm text-red-300">
                {detailError}
              </p>

              <button
                type="button"
                onClick={fetchCollegeDetails}
                className="mt-7 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------
    // COLLEGE NOT FOUND
    // -------------------------------------------------------

    if (!college) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={18} />
              Back to Colleges
            </button>

            <School
              size={50}
              className="mx-auto text-slate-700"
            />

            <h2 className="mt-5 text-2xl font-black text-white">
              College not found
            </h2>
          </div>
        </div>
      );
    }

    const collegeImage = getCollegeImage(college);

    const collegeLocation = getCollegeLocation(college);

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* =================================================
            DETAIL HERO
        ================================================= */}

        <div className="relative overflow-hidden border-b border-white/10">
          {collegeImage ? (
            <img
              src={collegeImage}
              alt={college.name}
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-cyan-950" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950" />

          <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            {/* BACK */}

            <button
              type="button"
              onClick={goBack}
              className="mb-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-cyan-400"
            >
              <ChevronLeft size={18} />
              Back to Colleges
            </button>

            {/* COLLEGE HERO */}

            <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-end">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
                {collegeImage ? (
                  <img
                    src={collegeImage}
                    alt={college.name}
                    className="h-52 w-full object-cover lg:h-56"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900 lg:h-56">
                    <School
                      size={65}
                      className="text-slate-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                  <School size={15} />
                  College
                </div>

                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  {college.name || "Unnamed College"}
                </h1>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={17}
                      className="text-cyan-400"
                    />
                    {collegeLocation}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users
                      size={17}
                      className="text-cyan-400"
                    />
                    {faculties.length}{" "}
                    {faculties.length === 1
                      ? "Faculty"
                      : "Faculties"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            COLLEGE CONTENT
        ================================================= */}

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
            {/* =================================================
                MAIN
            ================================================= */}

            <div className="space-y-8">
              {/* DESCRIPTION */}

              <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                    <School
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
                      About
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      About the College
                    </h2>
                  </div>
                </div>

                <p className="text-sm leading-7 text-slate-400">
                  {college.description ||
                    "College information and academic opportunities will appear here."}
                </p>
              </section>

              {/* =================================================
                  FACULTIES
              ================================================= */}

              <section>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
                      Academic Structure
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      Faculties
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Explore the faculties and academic areas
                      available at this college.
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-400">
                    {faculties.length}{" "}
                    {faculties.length === 1
                      ? "Faculty"
                      : "Faculties"}
                  </div>
                </div>

                {faculties.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center">
                    <School
                      size={42}
                      className="mx-auto text-slate-700"
                    />

                    <h3 className="mt-5 text-xl font-black text-white">
                      No faculties listed yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Faculties for this college have not been
                      added yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {faculties.map((faculty, index) => {
                      const facultyCourses =
                        getFacultyCourses(faculty);

                      return (
                        <motion.article
                          key={faculty.id || index}
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.35,
                            delay: index * 0.04,
                          }}
                          className="group rounded-3xl border border-white/10 bg-slate-900/70 p-6 transition hover:border-cyan-400/30 hover:bg-slate-900"
                        >
                          {/* FACULTY HEADER */}

                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                              <School
                                size={23}
                                className="text-cyan-400"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <h3 className="text-xl font-black text-white">
                                  {faculty.name ||
                                    "Unnamed Faculty"}
                                </h3>

                                {faculty.active !== undefined &&
                                  faculty.active !== null &&
                                  (faculty.active ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-400">
                                      <CheckCircle2 size={12} />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-400/10 px-2.5 py-1 text-[10px] font-black text-red-400">
                                      <XCircle size={12} />
                                      Inactive
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* DESCRIPTION */}

                          {faculty.description && (
                            <p className="mt-5 text-sm leading-6 text-slate-500">
                              {faculty.description}
                            </p>
                          )}

                          {/* COURSES */}

                          {facultyCourses.length > 0 && (
                            <div className="mt-6 border-t border-white/10 pt-5">
                              <div className="mb-3 flex items-center gap-2">
                                <BookOpen
                                  size={16}
                                  className="text-cyan-400"
                                />

                                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                                  Courses
                                </span>
                              </div>

                              <div className="space-y-2">
                                {facultyCourses.map(
                                  (course, courseIndex) => {
                                    const courseName =
                                      typeof course === "string"
                                        ? course
                                        : course?.name ||
                                          course?.title ||
                                          `Course ${
                                            courseIndex + 1
                                          }`;

                                    return (
                                      <div
                                        key={
                                          course?.id ||
                                          courseIndex
                                        }
                                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                                      >
                                        <BookOpen
                                          size={14}
                                          className="shrink-0 text-cyan-400"
                                        />

                                        <span className="text-sm font-semibold text-slate-300">
                                          {courseName}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}

                          {/* NO COURSES */}

                          {facultyCourses.length === 0 && (
                            <div className="mt-5 border-t border-white/10 pt-4">
                              <span className="text-xs text-slate-600">
                                Academic courses will appear
                                here when available.
                              </span>
                            </div>
                          )}
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="space-y-5">
              {/* COLLEGE SUMMARY */}

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                <h3 className="text-lg font-black text-white">
                  College Details
                </h3>

                <div className="mt-5 space-y-4">
                  {/* LOCATION */}

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        {collegeLocation}
                      </p>
                    </div>
                  </div>

                  {/* FACULTIES */}

                  <div className="flex items-start gap-3">
                    <School
                      size={17}
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Faculties
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        {faculties.length}
                      </p>
                    </div>
                  </div>

                  {/* WEBSITE */}

                  {college.website && (
                    <div className="flex items-start gap-3">
                      <Globe
                        size={17}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Website
                        </p>

                        <a
                          href={college.website}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-sm text-cyan-400 hover:text-cyan-300"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          {college.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* EMAIL */}

                  {college.email && (
                    <div className="flex items-start gap-3">
                      <Mail
                        size={17}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-300">
                          {college.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PHONE */}

                  {college.phone && (
                    <div className="flex items-start gap-3">
                      <Phone
                        size={17}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Phone
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {college.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FACULTY SUMMARY */}

              <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                    <School
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-2xl font-black text-white">
                      {faculties.length}
                    </p>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Faculties Available
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-500">
                  Explore the academic faculties available
                  at{" "}
                  <span className="font-bold text-slate-300">
                    {college.name}
                  </span>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // COLLEGE LIST LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
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
        </div>
      </div>
    );
  }

  // =========================================================
  // COLLEGE LIST PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-950 to-cyan-950/30" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              <School size={17} />
              College Directory
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Explore
              <span className="text-cyan-400">
                {" "}
                Colleges
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover colleges, faculties, courses,
              admission information and academic
              opportunities.
            </p>
          </motion.div>

          {/* SEARCH */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.15,
            }}
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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search colleges..."
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
                onChange={(e) =>
                  setLocationFilter(e.target.value)
                }
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
              College Directory
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {search || locationFilter !== "All"
                ? "Search Results"
                : "Colleges"}
            </h2>
          </div>

          <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-400">
            {filteredColleges.length}{" "}
            {filteredColleges.length === 1
              ? "College"
              : "Colleges"}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}

            <button
              type="button"
              onClick={fetchColleges}
              className="ml-4 font-bold text-red-200 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!error && filteredColleges.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
              <School
                size={30}
                className="text-cyan-400"
              />
            </div>

            <h3 className="mt-6 text-2xl font-black">
              No colleges found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Try another search term or change the
              location filter.
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
        )}

        {/* COLLEGE GRID */}

        {filteredColleges.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredColleges.map(
              (collegeItem, index) => {
                const image =
                  getCollegeImage(collegeItem);

                const location =
                  getCollegeLocation(collegeItem);

                return (
                  <motion.article
                    key={collegeItem.id}
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
                      delay: Math.min(
                        index * 0.05,
                        0.4
                      ),
                    }}
                    whileHover={{
                      y: -8,
                    }}
                    onClick={() =>
                      openCollege(collegeItem)
                    }
                    className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl transition hover:border-cyan-400/30"
                  >
                    {/* IMAGE */}

                    <div className="relative h-56 overflow-hidden bg-slate-800">
                      {image ? (
                        <img
                          src={image}
                          alt={
                            collegeItem.name
                          }
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900">
                          <School
                            size={55}
                            className="text-slate-600"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
                        College
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-6">
                      <h3 className="line-clamp-1 text-xl font-black text-white">
                        {collegeItem.name ||
                          "Unnamed College"}
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
                        {collegeItem.description ||
                          "Explore this college, its faculties, courses and academic opportunities."}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-sm font-bold text-cyan-400">
                          View College
                        </span>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition group-hover:bg-cyan-400/10 group-hover:text-cyan-400">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;