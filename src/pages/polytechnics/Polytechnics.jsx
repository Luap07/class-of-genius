import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  School,
  Award,
  CalendarDays,
  ShieldCheck,
  UserRound,
  Landmark,
  MapPinned,
  ExternalLink,
  Info,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const Polytechnics = () => {
  const navigate = useNavigate();
  const { id: polytechnicId } = useParams();

  const isDetailPage = Boolean(polytechnicId);

  // =========================================================
  // LIST STATE
  // =========================================================

  const [polytechnics, setPolytechnics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");

  const [error, setError] = useState("");

  // =========================================================
  // DETAIL STATE
  // =========================================================

  const [polytechnic, setPolytechnic] = useState(null);
  const [faculties, setFaculties] = useState([]);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // =========================================================
  // FETCH POLYTECHNICS
  // =========================================================

  const fetchPolytechnics = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("polytechnics")
        .select("*")
        .order("name", {
          ascending: true,
        });

      if (fetchError) {
        console.error(
          "Fetch Polytechnics Error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load polytechnics."
        );

        setPolytechnics([]);
        return;
      }

      setPolytechnics(data || []);
    } catch (err) {
      console.error(
        "Polytechnics Fetch Error:",
        err
      );

      setError(
        "Something went wrong while loading polytechnics."
      );

      setPolytechnics([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH POLYTECHNIC DETAILS
  // =========================================================

  const fetchPolytechnicDetails = async () => {
    if (!polytechnicId) return;

    try {
      setDetailLoading(true);
      setDetailError("");

      setPolytechnic(null);
      setFaculties([]);

      // -----------------------------------------------------
      // POLYTECHNIC
      // -----------------------------------------------------

      const {
        data: polytechnicData,
        error: polytechnicError,
      } = await supabase
        .from("polytechnics")
        .select("*")
        .eq("id", polytechnicId)
        .maybeSingle();

      if (polytechnicError) {
        console.error(
          "Fetch Polytechnic Detail Error:",
          polytechnicError
        );

        setDetailError(
          polytechnicError.message ||
            "Unable to load polytechnic."
        );

        return;
      }

      if (!polytechnicData) {
        setDetailError(
          "Polytechnic not found."
        );

        return;
      }

      setPolytechnic(polytechnicData);

      // -----------------------------------------------------
      // FACULTIES
      // -----------------------------------------------------

      const {
        data: facultyData,
        error: facultyError,
      } = await supabase
        .from("school_faculties")
        .select("*")
        .eq("school_id", polytechnicId)
        .order("created_at", {
          ascending: true,
        });

      if (facultyError) {
        console.error(
          "Fetch Polytechnic Faculties Error:",
          facultyError
        );

        setFaculties([]);
      } else {
        setFaculties(facultyData || []);
      }
    } catch (err) {
      console.error(
        "Polytechnic Detail Error:",
        err
      );

      setDetailError(
        "Something went wrong while loading the polytechnic."
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
      fetchPolytechnicDetails();
    } else {
      fetchPolytechnics();
    }
  }, [polytechnicId]);

  // =========================================================
  // LOCATIONS
  // =========================================================

  const locations = useMemo(() => {
    const values = polytechnics
      .map(
        (item) =>
          item.state ||
          item.location
      )
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [polytechnics]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredPolytechnics = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return polytechnics.filter(
      (item) => {
        const name =
          item.name || "";

        const state =
          item.state ||
          item.location ||
          "";

        const city =
          item.city || "";

        const description =
          item.description || "";

        const shortName =
          item.short_name || "";

        const matchesSearch =
          !query ||
          name
            .toLowerCase()
            .includes(query) ||
          shortName
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

        const polytechnicLocation =
          item.state ||
          item.location ||
          "";

        const matchesLocation =
          locationFilter === "All" ||
          polytechnicLocation ===
            locationFilter;

        return (
          matchesSearch &&
          matchesLocation
        );
      }
    );
  }, [
    polytechnics,
    search,
    locationFilter,
  ]);

  // =========================================================
  // HELPERS
  // =========================================================

  const openPolytechnic = (item) => {
    if (!item?.id) return;

    navigate(
      `/polytechnics/${item.id}`
    );
  };

  const goBack = () => {
    navigate("/polytechnics");
  };

  const getImage = (item) => {
    if (!item) return null;

    return (
      item.cover_url ||
      item.image_url ||
      item.logo_url ||
      null
    );
  };

  const getLogo = (item) => {
    if (!item) return null;

    return (
      item.logo_url ||
      item.image_url ||
      null
    );
  };

  const getLocation = (item) => {
    if (!item) {
      return "Location not specified";
    }

    const parts = [
      item.address,
      item.city,
      item.state,
      item.country,
    ].filter(Boolean);

    return parts.length
      ? parts.join(", ")
      : "Location not specified";
  };

  const getFacultyCourses = (faculty) => {
    if (!faculty) return [];

    const rawCourses =
      faculty.courses;

    if (Array.isArray(rawCourses)) {
      return rawCourses;
    }

    if (
      typeof rawCourses ===
      "string"
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

  const getCourseName = (
    course,
    index
  ) => {
    if (typeof course === "string") {
      return course;
    }

    return (
      course?.name ||
      course?.title ||
      course?.course_name ||
      course?.course_title ||
      `Course ${index + 1}`
    );
  };

  const getCourseCode = (course) => {
    if (
      !course ||
      typeof course !== "object"
    ) {
      return null;
    }

    return (
      course.short_name ||
      course.code ||
      course.course_code ||
      null
    );
  };

  const formatDate = (value) => {
    if (!value) return null;

    try {
      return new Intl.DateTimeFormat(
        "en-NG",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ).format(new Date(value));
    } catch {
      return value;
    }
  };

  // =========================================================
  // DETAIL PAGE
  // =========================================================

  if (isDetailPage) {
    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    if (detailLoading) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="h-10 w-44 rounded-xl bg-slate-900" />

            <div className="mt-8 h-[420px] rounded-[2rem] bg-slate-900" />

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <div className="h-64 rounded-3xl bg-slate-900" />
                <div className="h-96 rounded-3xl bg-slate-900" />
              </div>

              <div className="h-[500px] rounded-3xl bg-slate-900" />
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    if (detailError) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 text-white sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
            >
              <ChevronLeft size={18} />
              Back to Polytechnics
            </button>

            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-12 text-center">
              <Building2
                size={48}
                className="mx-auto text-red-400"
              />

              <h2 className="mt-6 text-2xl font-black">
                Unable to load polytechnic
              </h2>

              <p className="mt-3 text-sm text-red-300">
                {detailError}
              </p>

              <button
                type="button"
                onClick={
                  fetchPolytechnicDetails
                }
                className="mt-7 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------
    // NOT FOUND
    // -------------------------------------------------------

    if (!polytechnic) {
      return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300"
            >
              <ChevronLeft size={18} />
              Back to Polytechnics
            </button>

            <School
              size={55}
              className="mx-auto text-slate-700"
            />

            <h2 className="mt-6 text-2xl font-black">
              Polytechnic not found
            </h2>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------
    // DETAIL DATA
    // -------------------------------------------------------

    const coverImage =
      getImage(polytechnic);

    const logoImage =
      getLogo(polytechnic);

    const location =
      getLocation(polytechnic);

    const totalCourses =
      faculties.reduce(
        (total, faculty) =>
          total +
          getFacultyCourses(
            faculty
          ).length,
        0
      );

    // -------------------------------------------------------
    // FULL DETAIL PAGE
    // -------------------------------------------------------

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden border-b border-white/10">
          {coverImage ? (
            <img
              src={coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-cyan-950" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/85 to-slate-950" />

          <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <button
              type="button"
              onClick={goBack}
              className="mb-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-bold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-white"
            >
              <ChevronLeft size={18} />
              Back to Polytechnics
            </button>

            <div className="grid gap-8 lg:grid-cols-[190px_1fr] lg:items-end">
              {/* LOGO */}

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl">
                {logoImage ? (
                  <img
                    src={logoImage}
                    alt={
                      polytechnic.name
                    }
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-blue-950 to-slate-900">
                    <School
                      size={65}
                      className="text-slate-600"
                    />
                  </div>
                )}
              </div>

              {/* TITLE */}

              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-300">
                    <School size={14} />
                    Polytechnic
                  </span>

                  {polytechnic.active !==
                    undefined &&
                    polytechnic.active !==
                      null && (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${
                          polytechnic.active
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-red-400/10 text-red-400"
                        }`}
                      >
                        {polytechnic.active ? (
                          <CheckCircle2
                            size={14}
                          />
                        ) : (
                          <XCircle
                            size={14}
                          />
                        )}

                        {polytechnic.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    )}
                </div>

                <h1 className="max-w-5xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {polytechnic.name ||
                    "Unnamed Polytechnic"}
                </h1>

                {polytechnic.short_name && (
                  <p className="mt-3 text-lg font-bold uppercase tracking-wider text-cyan-400">
                    {polytechnic.short_name}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={17}
                      className="text-cyan-400"
                    />
                    {location}
                  </div>

                  <div className="flex items-center gap-2">
                    <GraduationCap
                      size={17}
                      className="text-cyan-400"
                    />
                    {faculties.length}{" "}
                    {faculties.length ===
                    1
                      ? "Faculty"
                      : "Faculties"}
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen
                      size={17}
                      className="text-cyan-400"
                    />
                    {totalCourses}{" "}
                    {totalCourses ===
                    1
                      ? "Course"
                      : "Courses"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-8">
              {/* =================================================
                  ABOUT
              ================================================= */}

              <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                    <Info
                      size={22}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                      About
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      About the Polytechnic
                    </h2>
                  </div>
                </div>

                <p className="mt-7 text-sm leading-8 text-slate-400">
                  {polytechnic.description ||
                    "No description has been provided for this polytechnic."}
                </p>
              </section>

              {/* =================================================
                  INSTITUTION PROFILE
              ================================================= */}

              <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 sm:p-8">
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10">
                    <Building2
                      size={22}
                      className="text-blue-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                      Institution Profile
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Polytechnic Information
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* SHORT NAME */}

                  {polytechnic.short_name && (
                    <DetailItem
                      icon={School}
                      label="Short Name"
                      value={
                        polytechnic.short_name
                      }
                    />
                  )}

                  {/* TYPE */}

                  {polytechnic.type && (
                    <DetailItem
                      icon={Building2}
                      label="Institution Type"
                      value={
                        polytechnic.type
                      }
                    />
                  )}

                  {/* OWNERSHIP */}

                  {polytechnic.ownership && (
                    <DetailItem
                      icon={UserRound}
                      label="Ownership"
                      value={
                        polytechnic.ownership
                      }
                    />
                  )}

                  {/* ACCREDITATION */}

                  {polytechnic.accreditation && (
                    <DetailItem
                      icon={ShieldCheck}
                      label="Accreditation"
                      value={
                        polytechnic.accreditation
                      }
                    />
                  )}

                  {/* ESTABLISHED */}

                  {polytechnic.established_year && (
                    <DetailItem
                      icon={CalendarDays}
                      label="Established"
                      value={String(
                        polytechnic.established_year
                      )}
                    />
                  )}

                  {/* COUNTRY */}

                  {polytechnic.country && (
                    <DetailItem
                      icon={Globe}
                      label="Country"
                      value={
                        polytechnic.country
                      }
                    />
                  )}

                  {/* STATE */}

                  {polytechnic.state && (
                    <DetailItem
                      icon={MapPinned}
                      label="State"
                      value={
                        polytechnic.state
                      }
                    />
                  )}

                  {/* CITY */}

                  {polytechnic.city && (
                    <DetailItem
                      icon={MapPin}
                      label="City"
                      value={
                        polytechnic.city
                      }
                    />
                  )}

                  {/* ADDRESS */}

                  {polytechnic.address && (
                    <div className="sm:col-span-2">
                      <DetailItem
                        icon={Landmark}
                        label="Address"
                        value={
                          polytechnic.address
                        }
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  FACULTIES
              ================================================= */}

              <section>
                <div className="mb-7">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                    Academic Structure
                  </p>

                  <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black">
                        Faculties & Courses
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Explore the faculties
                        and courses available
                        at this institution.
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
                </div>

                {faculties.length ===
                0 ? (
                  <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/50 p-12 text-center">
                    <GraduationCap
                      size={45}
                      className="mx-auto text-slate-700"
                    />

                    <h3 className="mt-5 text-xl font-black">
                      No faculties listed yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Faculties for this
                      polytechnic have not
                      been added yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {faculties.map(
                      (
                        faculty,
                        index
                      ) => {
                        const courses =
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
                              y: 15,
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
                            className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70"
                          >
                            {/* FACULTY HEADER */}

                            <div className="p-6 sm:p-7">
                              <div className="flex items-start gap-4">
                                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                                  <GraduationCap
                                    size={
                                      24
                                    }
                                    className="text-cyan-400"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <h3 className="text-xl font-black text-white">
                                        {faculty.name ||
                                          "Unnamed Faculty"}
                                      </h3>

                                      {faculty.short_name && (
                                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                                          {
                                            faculty.short_name
                                          }
                                        </p>
                                      )}
                                    </div>

                                    {faculty.active !==
                                      undefined &&
                                      faculty.active !==
                                        null && (
                                        <span
                                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black ${
                                            faculty.active
                                              ? "bg-emerald-400/10 text-emerald-400"
                                              : "bg-red-400/10 text-red-400"
                                          }`}
                                        >
                                          {faculty.active ? (
                                            <CheckCircle2
                                              size={
                                                12
                                              }
                                            />
                                          ) : (
                                            <XCircle
                                              size={
                                                12
                                              }
                                            />
                                          )}

                                          {faculty.active
                                            ? "Active"
                                            : "Inactive"}
                                        </span>
                                      )}
                                  </div>

                                  {faculty.description && (
                                    <p className="mt-4 text-sm leading-7 text-slate-500">
                                      {
                                        faculty.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* COURSES */}

                            <div className="border-t border-white/10 p-6 sm:p-7">
                              <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <BookOpen
                                    size={
                                      17
                                    }
                                    className="text-cyan-400"
                                  />

                                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Courses
                                  </span>
                                </div>

                                <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black text-slate-500">
                                  {
                                    courses.length
                                  }{" "}
                                  {courses.length ===
                                  1
                                    ? "Course"
                                    : "Courses"}
                                </span>
                              </div>

                              {courses.length >
                              0 ? (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {courses.map(
                                    (
                                      course,
                                      courseIndex
                                    ) => {
                                      const courseName =
                                        getCourseName(
                                          course,
                                          courseIndex
                                        );

                                      const courseCode =
                                        getCourseCode(
                                          course
                                        );

                                      return (
                                        <div
                                          key={
                                            course?.id ||
                                            courseIndex
                                          }
                                          className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
                                        >
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                                            <BookOpen
                                              size={
                                                15
                                              }
                                              className="text-cyan-400"
                                            />
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-300 transition group-hover:text-white">
                                              {
                                                courseName
                                              }
                                            </p>

                                            {courseCode && (
                                              <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                                                {
                                                  courseCode
                                                }
                                              </p>
                                            )}
                                          </div>

                                          <ArrowRight
                                            size={
                                              15
                                            }
                                            className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-400"
                                          />
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5">
                                  <p className="text-xs leading-6 text-slate-600">
                                    No courses have
                                    been added to
                                    this faculty yet.
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.article>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <aside className="space-y-5">
              {/* CONTACT */}

              <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
                <h3 className="text-lg font-black">
                  Contact & Location
                </h3>

                <div className="mt-6 space-y-5">
                  {/* ADDRESS */}

                  {(
                    polytechnic.address ||
                    polytechnic.city ||
                    polytechnic.state ||
                    polytechnic.country
                  ) && (
                    <SidebarDetail
                      icon={MapPin}
                      label="Address"
                      value={location}
                    />
                  )}

                  {/* WEBSITE */}

                  {polytechnic.website && (
                    <div className="flex items-start gap-3">
                      <Globe
                        size={18}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                          Website
                        </p>

                        <a
                          href={
                            /^https?:\/\//i.test(
                              polytechnic.website
                            )
                              ? polytechnic.website
                              : `https://${polytechnic.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          <span>
                            {
                              polytechnic.website
                            }
                          </span>

                          <ExternalLink
                            size={13}
                            className="shrink-0"
                          />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* EMAIL */}

                  {polytechnic.email && (
                    <SidebarDetail
                      icon={Mail}
                      label="Email"
                      value={
                        polytechnic.email
                      }
                    />
                  )}

                  {/* PHONE */}

                  {polytechnic.phone && (
                    <SidebarDetail
                      icon={Phone}
                      label="Phone"
                      value={
                        polytechnic.phone
                      }
                    />
                  )}
                </div>
              </section>

              {/* ACADEMIC SUMMARY */}

              <section className="rounded-[2rem] border border-cyan-400/10 bg-cyan-400/[0.03] p-6">
                <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  Academic Overview
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <StatBox
                    icon={GraduationCap}
                    value={
                      faculties.length
                    }
                    label="Faculties"
                  />

                  <StatBox
                    icon={BookOpen}
                    value={
                      totalCourses
                    }
                    label="Courses"
                  />
                </div>
              </section>

              {/* INSTITUTION DETAILS */}

              <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
                <h3 className="text-lg font-black">
                  Institution Details
                </h3>

                <div className="mt-5 space-y-4">
                  {polytechnic.type && (
                    <SidebarDetail
                      icon={Building2}
                      label="Type"
                      value={
                        polytechnic.type
                      }
                    />
                  )}

                  {polytechnic.ownership && (
                    <SidebarDetail
                      icon={UserRound}
                      label="Ownership"
                      value={
                        polytechnic.ownership
                      }
                    />
                  )}

                  {polytechnic.accreditation && (
                    <SidebarDetail
                      icon={Award}
                      label="Accreditation"
                      value={
                        polytechnic.accreditation
                      }
                    />
                  )}

                  {polytechnic.established_year && (
                    <SidebarDetail
                      icon={CalendarDays}
                      label="Established"
                      value={String(
                        polytechnic.established_year
                      )}
                    />
                  )}

                  {polytechnic.country && (
                    <SidebarDetail
                      icon={Globe}
                      label="Country"
                      value={
                        polytechnic.country
                      }
                    />
                  )}
                </div>
              </section>

              {/* CREATED / UPDATED */}

              {(polytechnic.created_at ||
                polytechnic.updated_at) && (
                <section className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6">
                  <div className="space-y-4">
                    {polytechnic.created_at && (
                      <SidebarDetail
                        icon={CalendarDays}
                        label="Profile Added"
                        value={
                          formatDate(
                            polytechnic.created_at
                          ) || "-"
                        }
                      />
                    )}

                    {polytechnic.updated_at && (
                      <SidebarDetail
                        icon={CalendarDays}
                        label="Last Updated"
                        value={
                          formatDate(
                            polytechnic.updated_at
                          ) || "-"
                        }
                      />
                    )}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // LIST LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="h-56 animate-pulse rounded-[2rem] bg-slate-900" />

          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900"
                >
                  <div className="h-56 animate-pulse bg-slate-800" />

                  <div className="space-y-4 p-6">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-slate-800" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800" />

                    <div className="h-10 w-full animate-pulse rounded bg-slate-800" />
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
  // LIST PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-white/10">
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
              Polytechnic Directory
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Explore
              <span className="text-cyan-400">
                {" "}
                Polytechnics
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover polytechnics,
              faculties, courses,
              programs, admission
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
                placeholder="Search polytechnics..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
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
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Polytechnic Directory
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {search ||
              locationFilter !==
                "All"
                ? "Search Results"
                : "Polytechnics"}
            </h2>
          </div>

          <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-400">
            {
              filteredPolytechnics.length
            }{" "}
            {filteredPolytechnics.length ===
            1
              ? "Polytechnic"
              : "Polytechnics"}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}

            <button
              type="button"
              onClick={
                fetchPolytechnics
              }
              className="ml-4 font-bold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!error &&
          filteredPolytechnics.length ===
            0 && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-20 text-center">
              <School
                size={45}
                className="mx-auto text-slate-700"
              />

              <h3 className="mt-6 text-2xl font-black">
                No polytechnics found
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Try another search term
                or change the location
                filter.
              </p>
            </div>
          )}

        {/* GRID */}

        {filteredPolytechnics.length >
          0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPolytechnics.map(
              (
                item,
                index
              ) => {
                const image =
                  getImage(item);

                const location =
                  getLocation(item);

                return (
                  <motion.article
                    key={item.id}
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
                      openPolytechnic(
                        item
                      )
                    }
                    className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl transition hover:border-cyan-400/30"
                  >
                    <div className="relative h-56 overflow-hidden bg-slate-800">
                      {image ? (
                        <img
                          src={image}
                          alt={
                            item.name
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900">
                          <School
                            size={55}
                            className="text-slate-600"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
                        Polytechnic
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="line-clamp-1 text-xl font-black">
                        {item.name ||
                          "Unnamed Polytechnic"}
                      </h3>

                      {item.short_name && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-cyan-400">
                          {
                            item.short_name
                          }
                        </p>
                      )}

                      <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-cyan-400"
                        />

                        <span className="line-clamp-2">
                          {location}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                        {item.description ||
                          "Explore this polytechnic, its faculties, courses and academic opportunities."}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-sm font-bold text-cyan-400">
                          View Polytechnic
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
      </main>
    </div>
  );
};

// =========================================================
// DETAIL ITEM
// =========================================================

const DetailItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
          <Icon
            size={16}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-300">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SIDEBAR DETAIL
// =========================================================

const SidebarDetail = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={18}
        className="mt-0.5 shrink-0 text-cyan-400"
      />

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
          {label}
        </p>

        <p className="mt-1 break-words text-sm leading-6 text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
};

// =========================================================
// STAT BOX
// =========================================================

const StatBox = ({
  icon: Icon,
  value,
  label,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <Icon
        size={18}
        className="text-cyan-400"
      />

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
        {label}
      </p>
    </div>
  );
};

export default Polytechnics;