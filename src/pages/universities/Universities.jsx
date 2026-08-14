import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  Sparkles,
  Library,
  School,
  ExternalLink,
  Layers3,
  ChevronDown,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.06,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   SKELETON
========================================================= */

const UniversitySkeleton = () => (
  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220]">
    <div className="h-56 animate-pulse bg-white/5" />

    <div className="space-y-4 p-6">
      <div className="h-5 w-3/4 animate-pulse rounded-lg bg-white/10" />
      <div className="h-4 w-1/2 animate-pulse rounded-lg bg-white/10" />
      <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" />
      <div className="h-4 w-1/3 animate-pulse rounded-lg bg-white/10" />
    </div>
  </div>
);

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  value,
  label,
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]">
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl transition group-hover:bg-cyan-400/10" />

    <div className="relative flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
        <Icon
          size={20}
          className="text-cyan-400"
        />
      </div>

      <div className="min-w-0">
        <p className="text-2xl font-black text-white">
          {value}
        </p>

        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
      </div>
    </div>
  </div>
);

/* =========================================================
   MAIN
========================================================= */

const Universities = () => {
  const navigate = useNavigate();
  const { id: universityId } = useParams();

  const isDetailPage = Boolean(universityId);

  /* =======================================================
     LIST STATE
  ======================================================= */

  const [universities, setUniversities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [locationFilter, setLocationFilter] =
    useState("All");

  const [error, setError] =
    useState("");

  /* =======================================================
     DETAIL STATE
  ======================================================= */

  const [university, setUniversity] =
    useState(null);

  const [faculties, setFaculties] =
    useState([]);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");

  /* =======================================================
     FETCH UNIVERSITIES
  ======================================================= */

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

  /* =======================================================
     FETCH UNIVERSITY DETAILS
  ======================================================= */

  const fetchUniversityDetails = async () => {
    if (!universityId) return;

    try {
      setDetailLoading(true);
      setDetailError("");

      setUniversity(null);
      setFaculties([]);

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

      /* ---------------------------------------------------
         FACULTIES

         Uses:
         school_faculties.school_id

         No school_faculty_courses query.
      --------------------------------------------------- */

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

        setFaculties([]);
      } else {
        setFaculties(
          facultyData || []
        );
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

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (isDetailPage) {
      fetchUniversityDetails();
    } else {
      fetchUniversities();
    }

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [universityId]);

  /* =======================================================
     LOCATIONS
  ======================================================= */

  const locations = useMemo(() => {
    const values = universities
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
  }, [universities]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredUniversities =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return universities.filter(
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
            item.state ||
            item.location ||
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

  /* =======================================================
     HELPERS
  ======================================================= */

  const openUniversity = (
    universityItem
  ) => {
    if (!universityItem?.id) return;

    navigate(
      `/universities/${universityItem.id}`
    );
  };

  const goBack = () => {
    navigate("/universities");
  };

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

  /* =======================================================
     DETAIL LOADING
  ======================================================= */

  if (
    isDetailPage &&
    detailLoading
  ) {
    return (
      <div className="min-h-screen bg-[#050812] px-5 py-10 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-10 w-36 animate-pulse rounded-xl bg-white/10" />

          <div className="h-[420px] animate-pulse rounded-[32px] bg-white/[0.04]" />

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="h-32 animate-pulse rounded-3xl bg-white/[0.04]" />
            <div className="h-32 animate-pulse rounded-3xl bg-white/[0.04]" />
            <div className="h-32 animate-pulse rounded-3xl bg-white/[0.04]" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-3xl bg-white/[0.04]"
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DETAIL ERROR
  ======================================================= */

  if (
    isDetailPage &&
    detailError
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050812] px-5 text-white">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="w-full max-w-lg rounded-[32px] border border-red-400/10 bg-[#0b1220] p-10 text-center shadow-2xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10">
            <Building2
              size={30}
              className="text-red-400"
            />
          </div>

          <h2 className="mt-6 text-2xl font-black">
            Unable to load university
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {detailError}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={goBack}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Back to Universities
            </button>

            <button
              type="button"
              onClick={
                fetchUniversityDetails
              }
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* =======================================================
     UNIVERSITY NOT FOUND
  ======================================================= */

  if (
    isDetailPage &&
    !university
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050812] px-5 text-white">
        <div className="text-center">
          <GraduationCap
            size={60}
            className="mx-auto text-slate-700"
          />

          <h2 className="mt-5 text-2xl font-black">
            University not found
          </h2>

          <button
            type="button"
            onClick={goBack}
            className="mt-7 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950"
          >
            Back to Universities
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     DETAIL PAGE
  ======================================================= */

  if (isDetailPage) {
    const universityImage =
      getUniversityImage(university);

    const universityLocation =
      getUniversityLocation(
        university
      );

    const totalCourses =
      faculties.reduce(
        (total, faculty) =>
          total +
          getFacultyCourses(
            faculty
          ).length,
        0
      );

    const activeFaculties =
      faculties.filter(
        (faculty) =>
          faculty.active === true
      ).length;

    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen overflow-hidden bg-[#050812] text-white"
      >
        {/* =================================================
            AMBIENT BACKGROUND
        ================================================= */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />

          <div className="absolute -right-40 top-[500px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize:
                "28px 28px",
            }}
          />
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden border-b border-white/10">
          {universityImage ? (
            <img
              src={universityImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-[#050812] to-cyan-950/60" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-[#050812]/50 via-[#050812]/85 to-[#050812]" />

          <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
            <motion.button
              variants={fadeUp}
              type="button"
              onClick={goBack}
              className="group mb-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-cyan-400"
            >
              <ChevronLeft
                size={18}
                className="transition group-hover:-translate-x-1"
              />
              Universities
            </motion.button>

            <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-end">
              <motion.div
                variants={fadeUp}
                className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0b1220] shadow-2xl"
              >
                {universityImage ? (
                  <img
                    src={universityImage}
                    alt={university.name}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900">
                    <Building2
                      size={70}
                      className="text-slate-600"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="pb-2"
              >
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                  <Sparkles size={14} />
                  University Profile
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {university.name ||
                    "Unnamed University"}
                </h1>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400">
                    <MapPin
                      size={16}
                      className="text-cyan-400"
                    />
                    {universityLocation}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400">
                    <School
                      size={16}
                      className="text-cyan-400"
                    />
                    {faculties.length}{" "}
                    Faculties
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          {/* STATS */}

          <motion.div
            variants={fadeUp}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              icon={School}
              value={
                faculties.length
              }
              label="Faculties"
            />

            <StatCard
              icon={BookOpen}
              value={totalCourses}
              label="Courses"
            />

            <StatCard
              icon={CheckCircle2}
              value={activeFaculties}
              label="Active Faculties"
            />

            <StatCard
              icon={Library}
              value={
                university.website
                  ? "Available"
                  : "—"
              }
              label="Official Website"
            />
          </motion.div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* MAIN */}

            <div className="space-y-10">
              {/* ABOUT */}

              <motion.section
                variants={fadeUp}
                className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-7 shadow-xl backdrop-blur-xl sm:p-8"
              >
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/5 blur-3xl" />

                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
                      <Building2
                        size={22}
                        className="text-cyan-400"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                        Institution
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        About the University
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm leading-8 text-slate-400">
                    {university.description ||
                      "University information and academic opportunities will appear here."}
                  </p>
                </div>
              </motion.section>

              {/* FACULTIES */}

              <motion.section
                variants={fadeUp}
              >
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                      Academic Structure
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      Faculties & Academic Areas
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Explore faculties and the
                      courses associated with
                      this institution.
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-400">
                    <Layers3
                      size={14}
                      className="text-cyan-400"
                    />
                    {faculties.length}{" "}
                    {faculties.length ===
                    1
                      ? "Faculty"
                      : "Faculties"}
                  </div>
                </div>

                {faculties.length ===
                0 ? (
                  <div className="rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                      <GraduationCap
                        size={30}
                        className="text-slate-700"
                      />
                    </div>

                    <h3 className="mt-5 text-xl font-black">
                      No faculties listed yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Faculties for this
                      university have not
                      been added yet.
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
                            variants={
                              cardVariants
                            }
                            whileHover={{
                              y: -5,
                            }}
                            className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-xl transition duration-300 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                          >
                            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-400/5 blur-3xl transition group-hover:bg-cyan-400/10" />

                            <div className="relative">
                              <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
                                  <GraduationCap
                                    size={23}
                                    className="text-cyan-400"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-black leading-6 text-white">
                                      {faculty.name ||
                                        "Unnamed Faculty"}
                                    </h3>

                                    {faculty.active !==
                                      undefined &&
                                      faculty.active !==
                                        null &&
                                      (faculty.active ? (
                                        <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                                          Active
                                        </span>
                                      ) : (
                                        <span className="shrink-0 rounded-full bg-red-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-red-400">
                                          Inactive
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              </div>

                              {faculty.description && (
                                <p className="mt-5 text-sm leading-6 text-slate-500">
                                  {
                                    faculty.description
                                  }
                                </p>
                              )}

                              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                  <BookOpen
                                    size={14}
                                    className="text-cyan-400"
                                  />

                                  {facultyCourses.length}{" "}
                                  {facultyCourses.length ===
                                  1
                                    ? "Course"
                                    : "Courses"}
                                </div>

                                <ChevronDown
                                  size={16}
                                  className="text-slate-600"
                                />
                              </div>

                              <AnimatePresence>
                                {facultyCourses.length >
                                  0 && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      height: 0,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      height: "auto",
                                    }}
                                    className="mt-4 space-y-2 overflow-hidden"
                                  >
                                    {facultyCourses
                                      .slice(
                                        0,
                                        8
                                      )
                                      .map(
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
                                              className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 px-3 py-2.5"
                                            >
                                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                                                <BookOpen
                                                  size={
                                                    13
                                                  }
                                                  className="text-cyan-400"
                                                />
                                              </div>

                                              <span className="line-clamp-1 text-xs font-semibold text-slate-300">
                                                {
                                                  courseName
                                                }
                                              </span>
                                            </div>
                                          );
                                        }
                                      )}

                                    {facultyCourses.length >
                                      8 && (
                                      <p className="pt-2 text-center text-[11px] font-bold text-cyan-400">
                                        +
                                        {facultyCourses.length -
                                          8}{" "}
                                        more courses
                                      </p>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.article>
                        );
                      }
                    )}
                  </div>
                )}
              </motion.section>
            </div>

            {/* SIDEBAR */}

            <aside className="space-y-5">
              {/* DETAILS */}

              <motion.div
                variants={fadeUp}
                className="sticky top-6 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                    <School
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                      Information
                    </p>

                    <h3 className="text-lg font-black">
                      University Details
                    </h3>
                  </div>
                </div>

                <div className="mt-7 space-y-5">
                  <div className="flex gap-3">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        {universityLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <GraduationCap
                      size={17}
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                        Faculties
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        {faculties.length}
                      </p>
                    </div>
                  </div>

                  {university.website && (
                    <div className="flex gap-3">
                      <Globe
                        size={17}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                          Website
                        </p>

                        <a
                          href={
                            university.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center gap-1 truncate text-sm text-cyan-400 transition hover:text-cyan-300"
                        >
                          <span className="truncate">
                            {university.website}
                          </span>

                          <ExternalLink
                            size={12}
                            className="shrink-0"
                          />
                        </a>
                      </div>
                    </div>
                  )}

                  {university.email && (
                    <div className="flex gap-3">
                      <Mail
                        size={17}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-300">
                          {university.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {university.phone && (
                    <div className="flex gap-3">
                      <Phone
                        size={17}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                          Phone
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {university.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {university.website && (
                  <a
                    href={
                      university.website
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                  >
                    Visit Official Website
                    <ExternalLink
                      size={15}
                    />
                  </a>
                )}
              </motion.div>
            </aside>
          </div>
        </main>
      </motion.div>
    );
  }

  /* =======================================================
     LIST LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050812] px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 h-10 w-72 animate-pulse rounded-xl bg-white/10" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <UniversitySkeleton
                  key={item}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     LIST PAGE
  ======================================================= */

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen overflow-hidden bg-[#050812] text-white"
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute -right-40 top-[300px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:
              "28px 28px",
          }}
        />
      </div>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-[#050812] to-cyan-950/30" />

        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.45, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <motion.div
            variants={fadeUp}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">
              <Sparkles size={14} />
              Academic Directory
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              Find Your
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {" "}
                University
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Explore universities, discover
              faculties, browse academic areas,
              and find the information you need
              to make smarter educational
              decisions.
            </p>
          </motion.div>

          {/* SEARCH PANEL */}

          <motion.div
            variants={fadeUp}
            className="mt-10 max-w-5xl rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search universities, cities, states..."
                  className="h-14 w-full rounded-2xl border border-white/5 bg-black/20 pl-13 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-black/30"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <div className="relative">
                <Filter
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
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
                  className="h-14 w-full appearance-none rounded-2xl border border-white/5 bg-black/20 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400/40 md:w-[220px]"
                >
                  {locations.map(
                    (location) => (
                      <option
                        key={location}
                        value={location}
                        className="bg-[#0b1220]"
                      >
                        {location}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </motion.div>

          {/* QUICK STATS */}

          <motion.div
            variants={fadeUp}
            className="mt-6 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3"
          >
            <StatCard
              icon={School}
              value={
                universities.length
              }
              label="Universities"
            />

            <StatCard
              icon={MapPin}
              value={
                locations.length - 1
              }
              label="Locations"
            />

            <StatCard
              icon={Search}
              value={
                filteredUniversities.length
              }
              label="Showing"
            />
          </motion.div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <motion.div
          variants={fadeUp}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {search ||
              locationFilter !==
                "All"
                ? "Search Results"
                : "Universities"}
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-bold text-slate-400">
            <School
              size={15}
              className="text-cyan-400"
            />

            {filteredUniversities.length}{" "}
            {filteredUniversities.length ===
            1
              ? "University"
              : "Universities"}
          </div>
        </motion.div>

        {/* ERROR */}

        {error && (
          <motion.div
            variants={fadeUp}
            className="mb-8 flex flex-col gap-4 rounded-2xl border border-red-400/10 bg-red-400/5 p-5 text-sm text-red-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={
                fetchUniversities
              }
              className="w-fit font-black text-red-200 underline underline-offset-4"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* EMPTY */}

        {!error &&
          filteredUniversities.length ===
            0 && (
            <motion.div
              variants={fadeUp}
              className="rounded-[32px] border border-white/10 bg-white/[0.025] px-6 py-24 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-cyan-400/10 bg-cyan-400/5">
                <GraduationCap
                  size={36}
                  className="text-cyan-400"
                />
              </div>

              <h3 className="mt-7 text-2xl font-black">
                No universities found
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                We couldn't find a university
                matching your current search
                or location filter.
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
                  className="mt-7 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}

        {/* GRID */}

        {filteredUniversities.length >
          0 && (
          <motion.div
            variants={pageVariants}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
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
                    variants={cardVariants}
                    custom={index}
                    whileHover={{
                      y: -8,
                    }}
                    onClick={() =>
                      openUniversity(
                        universityItem
                      )
                    }
                    className="group relative cursor-pointer overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] shadow-xl transition duration-500 hover:border-cyan-400/25 hover:bg-white/[0.05] hover:shadow-cyan-950/30"
                  >
                    {/* IMAGE */}

                    <div className="relative h-60 overflow-hidden bg-[#0b1220]">
                      {image ? (
                        <img
                          src={image}
                          alt={
                            universityItem.name
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-900">
                          <Building2
                            size={60}
                            className="text-slate-600"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-black/10 to-transparent" />

                      {/* TOP BADGE */}

                      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 backdrop-blur-xl">
                        University
                      </div>

                      {/* HOVER ICON */}

                      <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white opacity-0 backdrop-blur-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowRight
                          size={17}
                        />
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-6">
                      <h3 className="line-clamp-2 min-h-[48px] text-xl font-black leading-6 text-white transition-colors group-hover:text-cyan-300">
                        {universityItem.name ||
                          "Unnamed University"}
                      </h3>

                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin
                          size={16}
                          className="shrink-0 text-cyan-400"
                        />

                        <span className="line-clamp-1">
                          {location}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
                        {universityItem.description ||
                          "Explore this university, its faculties, programs and academic opportunities."}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                          Explore University
                        </span>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-500 transition duration-300 group-hover:border-cyan-400/20 group-hover:bg-cyan-400/10 group-hover:text-cyan-400">
                          <ArrowRight
                            size={17}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              }
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default Universities;