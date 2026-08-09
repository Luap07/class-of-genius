import React, { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { motion } from "framer-motion";

import {
  Search,
  MapPin,
  GraduationCap,
  Building2,
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

const Universities = () => {
  const navigate = useNavigate();
  const { id: universityId } = useParams();

  const isDetailPage = Boolean(universityId);

  // =========================================================
  // UNIVERSITY LIST STATE
  // =========================================================

  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] =
    useState("All");

  const [error, setError] = useState("");

  // =========================================================
  // UNIVERSITY DETAIL STATE
  // =========================================================

  const [university, setUniversity] =
    useState(null);

  const [faculties, setFaculties] =
    useState([]);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");

  // =========================================================
  // FETCH UNIVERSITIES
  // =========================================================

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("universities")
        .select("*")
        .order("name", {
          ascending: true,
        });

      if (fetchError) {
        console.error(
          "Fetch Universities Error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load universities."
        );

        setUniversities([]);
        return;
      }

      setUniversities(data || []);
    } catch (err) {
      console.error(
        "Universities Fetch Error:",
        err
      );

      setError(
        "Something went wrong while loading universities."
      );

      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH UNIVERSITY DETAILS
  // =========================================================

  const fetchUniversityDetails = async () => {
    if (!universityId) return;

    try {
      setDetailLoading(true);
      setDetailError("");

      setUniversity(null);
      setFaculties([]);

      // -----------------------------------------------------
      // FETCH UNIVERSITY
      // -----------------------------------------------------

      const {
        data: universityData,
        error: universityError,
      } = await supabase
        .from("universities")
        .select("*")
        .eq("id", universityId)
        .maybeSingle();

      if (universityError) {
        console.error(
          "Fetch University Detail Error:",
          universityError
        );

        setDetailError(
          universityError.message ||
            "Unable to load university."
        );

        return;
      }

      if (!universityData) {
        setDetailError(
          "University not found."
        );

        return;
      }

      setUniversity(universityData);

      // -----------------------------------------------------
      // FETCH FACULTIES
      //
      // school_faculties already uses school_id.
      // We DO NOT query school_faculty_courses because
      // that table does not currently exist.
      // -----------------------------------------------------

      const {
        data: facultyData,
        error: facultyError,
      } = await supabase
        .from("school_faculties")
        .select("*")
        .eq("school_id", universityId)
        .order("created_at", {
          ascending: true,
        });

      if (facultyError) {
        console.error(
          "Fetch University Faculties Error:",
          facultyError
        );

        // University can still display even if
        // faculty loading fails.
        setFaculties([]);
      } else {
        setFaculties(facultyData || []);
      }
    } catch (err) {
      console.error(
        "University Detail Error:",
        err
      );

      setDetailError(
        "Something went wrong while loading the university."
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
      fetchUniversityDetails();
    } else {
      fetchUniversities();
    }
  }, [universityId]);

  // =========================================================
  // LOCATIONS
  // =========================================================

  const locations = useMemo(() => {
    const values = universities
      .map(
        (universityItem) =>
          universityItem.state ||
          universityItem.location
      )
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [universities]);

  // =========================================================
  // FILTER UNIVERSITIES
  // =========================================================

  const filteredUniversities =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return universities.filter(
        (universityItem) => {
          const name =
            universityItem.name || "";

          const state =
            universityItem.state ||
            universityItem.location ||
            "";

          const city =
            universityItem.city || "";

          const description =
            universityItem.description || "";

          const matchesSearch =
            !query ||
            name
              .toLowerCase()
              .includes(query) ||
            state
              .toLowerCase()
              .includes(query) ||
            city
              .toLowerCase()
              .includes(query) ||
            description
              .toLowerCase()
              .includes(query);

          const universityLocation =
            universityItem.state ||
            universityItem.location ||
            "";

          const matchesLocation =
            locationFilter === "All" ||
            universityLocation ===
              locationFilter;

          return (
            matchesSearch &&
            matchesLocation
          );
        }
      );
    }, [
      universities,
      search,
      locationFilter,
    ]);

  // =========================================================
  // OPEN UNIVERSITY
  // =========================================================

  const openUniversity = (
    universityItem
  ) => {
    if (!universityItem?.id) return;

    navigate(
      `/universities/${universityItem.id}`
    );
  };

  // =========================================================
  // BACK
  // =========================================================

  const goBack = () => {
    navigate("/universities");
  };

  // =========================================================
  // GET UNIVERSITY IMAGE
  // =========================================================

  const getUniversityImage = (
    universityItem
  ) => {
    if (!universityItem) return null;

    return (
      universityItem.cover_url ||
      universityItem.image_url ||
      universityItem.logo_url ||
      null
    );
  };

  // =========================================================
  // GET LOCATION
  // =========================================================

  const getUniversityLocation = (
    universityItem
  ) => {
    if (!universityItem) {
      return "Location not specified";
    }

    if (
      universityItem.city &&
      universityItem.state
    ) {
      return `${universityItem.city}, ${universityItem.state}`;
    }

    return (
      universityItem.state ||
      universityItem.location ||
      universityItem.city ||
      "Location not specified"
    );
  };

  // =========================================================
  // NORMALIZE FACULTY COURSES
  //
  // Supports a courses JSON/JSONB column if it exists.
  // No database query is made against a courses table.
  // =========================================================

  const getFacultyCourses = (
    faculty
  ) => {
    if (!faculty) return [];

    const rawCourses =
      faculty.courses;

    if (Array.isArray(rawCourses)) {
      return rawCourses;
    }

    if (
      typeof rawCourses === "string"
    ) {
      try {
        const parsed =
          JSON.parse(rawCourses);

        return Array.isArray(parsed)
          ? parsed
          : [];
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
    if (detailLoading) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 w-32 rounded bg-slate-800" />

              <div className="mt-8 h-[360px] rounded-3xl bg-slate-900" />

              <div className="mt-8 h-8 w-72 rounded bg-slate-800" />

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-40 rounded-2xl bg-slate-900"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (detailError) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft
                size={18}
              />
              Back to Universities
            </button>

            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center">
              <Building2
                size={45}
                className="mx-auto text-red-400"
              />

              <h2 className="mt-5 text-2xl font-black text-white">
                Unable to load university
              </h2>

              <p className="mt-3 text-sm text-red-300">
                {detailError}
              </p>

              <button
                type="button"
                onClick={
                  fetchUniversityDetails
                }
                className="mt-7 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!university) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft
                size={18}
              />
              Back to Universities
            </button>

            <GraduationCap
              size={50}
              className="mx-auto text-slate-700"
            />

            <h2 className="mt-5 text-2xl font-black text-white">
              University not found
            </h2>
          </div>
        </div>
      );
    }

    const universityImage =
      getUniversityImage(university);

    const universityLocation =
      getUniversityLocation(
        university
      );

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* =================================================
            DETAIL HERO
        ================================================= */}

        <div className="relative overflow-hidden border-b border-white/10">
          {universityImage ? (
            <img
              src={universityImage}
              alt={university.name}
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
              <ChevronLeft
                size={18}
              />
              Back to Universities
            </button>

            {/* UNIVERSITY HERO */}

            <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-end">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
                {universityImage ? (
                  <img
                    src={universityImage}
                    alt={university.name}
                    className="h-52 w-full object-cover lg:h-56"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900 lg:h-56">
                    <Building2
                      size={65}
                      className="text-slate-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                  <GraduationCap
                    size={15}
                  />
                  University
                </div>

                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  {university.name ||
                    "Unnamed University"}
                </h1>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={17}
                      className="text-cyan-400"
                    />
                    {universityLocation}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users
                      size={17}
                      className="text-cyan-400"
                    />
                    {faculties.length}{" "}
                    {faculties.length ===
                    1
                      ? "Faculty"
                      : "Faculties"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            UNIVERSITY CONTENT
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
                    <Building2
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
                      About
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      About the University
                    </h2>
                  </div>
                </div>

                <p className="text-sm leading-7 text-slate-400">
                  {university.description ||
                    "University information and academic opportunities will appear here."}
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
                      Explore the faculties and
                      academic areas available at
                      this university.
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-400">
                    {faculties.length}{" "}
                    {faculties.length ===
                    1
                      ? "Faculty"
                      : "Faculties"}
                  </div>
                </div>

                {faculties.length ===
                0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center">
                    <GraduationCap
                      size={42}
                      className="mx-auto text-slate-700"
                    />

                    <h3 className="mt-5 text-xl font-black text-white">
                      No faculties listed yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Faculties for this university
                      have not been added yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {faculties.map(
                      (
                        faculty,
                        index
                      ) => {
                        const facultyCourses =
                          getFacultyCourses(
                            faculty
                          );

                        return (
                          <motion.article
                            key={
                              faculty.id ||
                              index
                            }
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
                              delay:
                                index *
                                0.04,
                            }}
                            className="group rounded-3xl border border-white/10 bg-slate-900/70 p-6 transition hover:border-cyan-400/30 hover:bg-slate-900"
                          >
                            {/* FACULTY HEADER */}

                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                                <GraduationCap
                                  size={
                                    23
                                  }
                                  className="text-cyan-400"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <h3 className="text-xl font-black text-white">
                                    {faculty.name ||
                                      "Unnamed Faculty"}
                                  </h3>

                                  {faculty.active !==
                                    undefined &&
                                    faculty.active !==
                                      null && (
                                      faculty.active ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-400">
                                          <CheckCircle2
                                            size={
                                              12
                                            }
                                          />
                                          Active
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-400/10 px-2.5 py-1 text-[10px] font-black text-red-400">
                                          <XCircle
                                            size={
                                              12
                                            }
                                          />
                                          Inactive
                                        </span>
                                      )
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* DESCRIPTION */}

                            {faculty.description && (
                              <p className="mt-5 text-sm leading-6 text-slate-500">
                                {
                                  faculty.description
                                }
                              </p>
                            )}

                            {/* COURSES */}

                            {facultyCourses.length >
                              0 && (
                              <div className="mt-6 border-t border-white/10 pt-5">
                                <div className="mb-3 flex items-center gap-2">
                                  <BookOpen
                                    size={
                                      16
                                    }
                                    className="text-cyan-400"
                                  />

                                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Courses
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {facultyCourses.map(
                                    (
                                      course,
                                      courseIndex
                                    ) => {
                                      const courseName =
                                        typeof course ===
                                        "string"
                                          ? course
                                          : course?.name ||
                                            course?.title ||
                                            `Course ${
                                              courseIndex +
                                              1
                                            }`;

                                      return (
                                        <div
                                          key={
                                            course.id ||
                                            courseIndex
                                          }
                                          className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                                        >
                                          <BookOpen
                                            size={
                                              14
                                            }
                                            className="shrink-0 text-cyan-400"
                                          />

                                          <span className="text-sm font-semibold text-slate-300">
                                            {
                                              courseName
                                            }
                                          </span>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                            {/* COURSE COUNT */}

                            {facultyCourses.length ===
                              0 && (
                              <div className="mt-5 border-t border-white/10 pt-4">
                                <span className="text-xs text-slate-600">
                                  Academic courses will
                                  appear here when
                                  available.
                                </span>
                              </div>
                            )}
                          </motion.article>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="space-y-5">
              {/* UNIVERSITY SUMMARY */}

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                <h3 className="text-lg font-black text-white">
                  University Details
                </h3>

                <div className="mt-5 space-y-4">
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
                        {universityLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap
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

                  {university.website && (
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
                          href={
                            university.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-sm text-cyan-400 hover:text-cyan-300"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          {university.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {university.email && (
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
                          {university.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {university.phone && (
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
                          {university.phone}
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
                    <GraduationCap
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
                  Explore the academic faculties
                  available at{" "}
                  <span className="font-bold text-slate-300">
                    {university.name}
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
  // UNIVERSITY LIST LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
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
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UNIVERSITY LIST PAGE
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
              <GraduationCap
                size={17}
              />
              University Directory
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Explore
              <span className="text-cyan-400">
                {" "}
                Universities
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover universities, faculties,
              departments, programs, admission
              information and academic
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
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search universities..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
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
                value={
                  locationFilter
                }
                onChange={(e) =>
                  setLocationFilter(
                    e.target.value
                  )
                }
                className="h-14 min-w-[210px] appearance-none rounded-2xl border border-white/10 bg-slate-900/80 pl-11 pr-10 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                {locations.map(
                  (location) => (
                    <option
                      key={location}
                      value={location}
                      className="bg-slate-900"
                    >
                      {location}
                    </option>
                  )
                )}
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
              {search ||
              locationFilter !==
                "All"
                ? "Search Results"
                : "Universities"}
            </h2>
          </div>

          <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-400">
            {filteredUniversities.length}{" "}
            {filteredUniversities.length ===
            1
              ? "University"
              : "Universities"}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}

            <button
              type="button"
              onClick={
                fetchUniversities
              }
              className="ml-4 font-bold text-red-200 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!error &&
          filteredUniversities.length ===
            0 && (
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
                Try another search term or
                change the location filter.
              </p>

              {(search ||
                locationFilter !==
                  "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setLocationFilter(
                      "All"
                    );
                  }}
                  className="mt-7 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

        {/* UNIVERSITY GRID */}

        {filteredUniversities.length >
          0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map(
              (
                universityItem,
                index
              ) => {
                const image =
                  getUniversityImage(
                    universityItem
                  );

                const location =
                  getUniversityLocation(
                    universityItem
                  );

                return (
                  <motion.article
                    key={
                      universityItem.id
                    }
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
                      openUniversity(
                        universityItem
                      )
                    }
                    className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl transition hover:border-cyan-400/30"
                  >
                    {/* IMAGE */}

                    <div className="relative h-56 overflow-hidden bg-slate-800">
                      {image ? (
                        <img
                          src={image}
                          alt={
                            universityItem.name
                          }
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
                        {universityItem.name ||
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
                        {universityItem.description ||
                          "Explore this university, its faculties, programs and academic opportunities."}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-sm font-bold text-cyan-400">
                          View University
                        </span>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition group-hover:bg-cyan-400/10 group-hover:text-cyan-400">
                          <ArrowRight
                            size={18}
                          />
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

export default Universities;