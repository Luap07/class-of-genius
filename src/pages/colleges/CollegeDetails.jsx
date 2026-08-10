
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  School,
  Sparkles,
  BookOpen,
  Clock3,
  Layers3,
  Award,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const CollegeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [college, setCollege] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [facultyCourses, setFacultyCourses] = useState({});
  const [expandedFaculty, setExpandedFaculty] = useState(null);

  const [loading, setLoading] = useState(true);
  const [facultyLoading, setFacultyLoading] = useState(false);

  const [copied, setCopied] = useState("");

  /* =========================================================
     FETCH COLLEGE
  ========================================================= */

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchCollege();
  }, [id]);

  /* =========================================================
     FETCH COLLEGE + FACULTIES
  ========================================================= */

  const fetchCollege = async () => {
    try {
      setLoading(true);

      const { data: collegeData, error: collegeError } =
        await supabase
          .from("colleges")
          .select("*")
          .eq("id", id)
          .single();

      if (collegeError) {
        console.error(
          "College Details Error:",
          collegeError
        );

        setCollege(null);
        return;
      }

      setCollege(collegeData);

      /*
       * Faculties are stored in school_faculties.
       *
       * IMPORTANT:
       * school_type must be "college".
       */

      const {
        data: facultyData,
        error: facultyError,
      } = await supabase
        .from("school_faculties")
        .select("*")
        .eq("school_id", id)
        .eq("school_type", "college")
        .order("created_at", {
          ascending: true,
        });

      if (facultyError) {
        console.error(
          "College Faculties Error:",
          facultyError
        );

        setFaculties([]);
      } else {
        setFaculties(facultyData || []);
      }
    } catch (error) {
      console.error(
        "College Details Error:",
        error
      );

      setCollege(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH FACULTY CONTENT
  ========================================================= */

  const fetchFacultyContent = async (faculty) => {
    if (!faculty?.id) return;

    /*
     * Already loaded.
     */

    if (
      Object.prototype.hasOwnProperty.call(
        facultyCourses,
        faculty.id
      )
    ) {
      return;
    }

    try {
      setFacultyLoading(true);

      /*
       * All courses belonging to this faculty.
       *
       * Nothing is hardcoded here.
       */

      const {
        data: courses,
        error,
      } = await supabase
        .from("courses")
        .select("*")
        .eq("faculty_id", faculty.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Faculty Courses Error:",
          error
        );

        setFacultyCourses((prev) => ({
          ...prev,
          [faculty.id]: [],
        }));

        return;
      }

      setFacultyCourses((prev) => ({
        ...prev,
        [faculty.id]: courses || [],
      }));
    } catch (error) {
      console.error(
        "Faculty Content Error:",
        error
      );

      setFacultyCourses((prev) => ({
        ...prev,
        [faculty.id]: [],
      }));
    } finally {
      setFacultyLoading(false);
    }
  };

  /* =========================================================
     FACULTY CLICK
  ========================================================= */

  const handleFacultyClick = async (faculty) => {
    const isOpen =
      expandedFaculty === faculty.id;

    if (isOpen) {
      setExpandedFaculty(null);
      return;
    }

    setExpandedFaculty(faculty.id);

    await fetchFacultyContent(faculty);
  };

  /* =========================================================
     COPY
  ========================================================= */

  const handleCopy = async (value, type) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (error) {
      console.error(
        "Copy Error:",
        error
      );
    }
  };

  /* =========================================================
     WEBSITE
  ========================================================= */

  const websiteUrl = college?.website
    ? college.website.startsWith("http://") ||
      college.website.startsWith("https://")
      ? college.website
      : `https://${college.website}`
    : "";

  /* =========================================================
     LOCATION
  ========================================================= */

  const locationText = [
    college?.location,
    college?.state,
    college?.country,
  ]
    .filter(Boolean)
    .join(", ");

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="h-11 w-36 rounded-2xl bg-white/5" />

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.025]">
            <div className="h-[430px] bg-white/5 sm:h-[520px]" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-3xl bg-white/5"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
            <div className="h-80 rounded-[2rem] bg-white/5" />
            <div className="h-80 rounded-[2rem] bg-white/5" />
          </div>

        </div>
      </section>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!college) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-6 text-white">

        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[140px]" />

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative z-10 max-w-md text-center"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03]">
            <School
              size={42}
              className="text-slate-600"
            />
          </div>

          <h1 className="mt-7 text-3xl font-black">
            College Not Found
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            The college you're looking for could not
            be found or may no longer be available.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/colleges")
            }
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to Colleges
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[8%] top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.055] blur-[150px]" />

        <div className="absolute right-[3%] top-[35%] h-[380px] w-[380px] rounded-full bg-blue-500/[0.045] blur-[140px]" />

        <div className="absolute bottom-0 left-[35%] h-[320px] w-[320px] rounded-full bg-cyan-400/[0.025] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ===================================================
            TOP NAV
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-6 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={() =>
              navigate("/colleges")
            }
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to Colleges
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 sm:flex">
            <ShieldIcon />
            College Profile
          </div>
        </motion.div>

        {/* ===================================================
            HERO
        =================================================== */}

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
            duration: 0.55,
          }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
        >

          <div className="relative h-[430px] sm:h-[520px]">

            {college.image_url ? (
              <img
                src={college.image_url}
                alt={college.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
                <School
                  size={150}
                  strokeWidth={1}
                  className="text-cyan-400/10"
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/70 via-transparent to-transparent" />

            {/* =================================================
                LOGO
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.2,
              }}
              className="absolute left-6 top-6 sm:left-10 sm:top-10"
            >
              <div className="relative">

                <div className="absolute -inset-3 rounded-[2rem] bg-cyan-400/10 blur-2xl" />

                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/30 bg-white p-3 shadow-2xl sm:h-36 sm:w-36">

                  {college.logo_url ? (
                    <img
                      src={college.logo_url}
                      alt={`${college.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2
                      size={52}
                      strokeWidth={1.5}
                      className="text-slate-400"
                    />
                  )}

                </div>

                <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-400/20 bg-slate-950/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-400 shadow-xl backdrop-blur-xl">
                  <CheckCircle2 size={11} />
                  Institution
                </div>

              </div>
            </motion.div>

            {/* =================================================
                HERO CONTENT
            ================================================= */}

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12">

              <div className="max-w-5xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300 backdrop-blur-xl">
                  <Sparkles size={13} />
                  College
                </div>

                <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  {college.name}
                </h1>

                {locationText && (
                  <div className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-300 sm:text-base">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10">
                      <MapPin
                        size={17}
                        className="text-cyan-400"
                      />
                    </div>

                    {locationText}

                  </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>

        {/* ===================================================
            QUICK INFO
        =================================================== */}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            icon={School}
            title="Institution"
            value="College"
          />

          <InfoCard
            icon={MapPin}
            title="Location"
            value={
              college.state ||
              college.location ||
              "Not provided"
            }
          />

          <InfoCard
            icon={Globe}
            title="Country"
            value={
              college.country ||
              "Nigeria"
            }
          />

          <InfoCard
            icon={Building2}
            title="Faculties"
            value={`${faculties.length} Faculties`}
          />

        </div>

        {/* ===================================================
            WHERE TO FIND US
            FIRST SECTION
        =================================================== */}

        {locationText && (
          <SectionCard
            icon={MapPin}
            eyebrow="Where to find us"
            title="Where to Find Us"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-400/[0.08] via-white/[0.025] to-transparent p-6 sm:p-8">

              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
                  <MapPin
                    size={28}
                    className="text-cyan-400"
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                    Campus Location
                  </p>

                  <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                    {locationText}
                  </h3>

                  {college.address && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {college.address}
                    </p>
                  )}

                </div>

              </div>
            </div>
          </SectionCard>
        )}

        {/* ===================================================
            ABOUT THE COLLEGE
            SECOND SECTION
        =================================================== */}

        {college.description && (
          <SectionCard
            icon={BookOpen}
            eyebrow="Institution Overview"
            title="About the College"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-white/[0.02] p-6 sm:p-8">

              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/[0.025] blur-3xl" />

              <p className="relative whitespace-pre-line text-[15px] leading-8 text-slate-400 sm:text-base">
                {college.description}
              </p>

            </div>
          </SectionCard>
        )}

        {/* ===================================================
            FACULTIES
            THIRD SECTION
        =================================================== */}

        <SectionCard
          icon={Building2}
          eyebrow="Academic Structure"
          title="Faculties"
        >

          {faculties.length > 0 ? (
            <div className="space-y-4">

              {faculties.map((faculty, index) => {
                const isExpanded =
                  expandedFaculty === faculty.id;

                const courses =
                  facultyCourses[faculty.id] || [];

                const facultyName =
                  faculty.name ||
                  faculty.title ||
                  `Faculty ${index + 1}`;

                return (
                  <motion.div
                    key={faculty.id}
                    layout
                    className={`overflow-hidden rounded-[1.75rem] border transition-all duration-300 ${
                      isExpanded
                        ? "border-cyan-400/20 bg-cyan-400/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.2)]"
                        : "border-white/7 bg-white/[0.02] hover:border-cyan-400/15 hover:bg-white/[0.035]"
                    }`}
                  >

                    {/* FACULTY HEADER */}

                    <button
                      type="button"
                      onClick={() =>
                        handleFacultyClick(
                          faculty
                        )
                      }
                      className="group w-full p-5 text-left sm:p-6"
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition ${
                            isExpanded
                              ? "border-cyan-400/20 bg-cyan-400/10"
                              : "border-white/5 bg-white/[0.035] group-hover:border-cyan-400/15 group-hover:bg-cyan-400/[0.07]"
                          }`}
                        >
                          <Building2
                            size={23}
                            className="text-cyan-400"
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/60">
                            Faculty
                          </p>

                          <h3 className="mt-1 text-lg font-black text-white sm:text-xl">
                            {facultyName}
                          </h3>

                          {faculty.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                              {faculty.description}
                            </p>
                          )}

                        </div>

                        <div
                          className={`hidden shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold sm:flex ${
                            isExpanded
                              ? "border-cyan-400/15 bg-cyan-400/10 text-cyan-400"
                              : "border-white/5 bg-white/[0.03] text-slate-500"
                          }`}
                        >
                          <span>
                            {isExpanded
                              ? "Close"
                              : "Explore"}
                          </span>

                          {isExpanded ? (
                            <ChevronUp size={15} />
                          ) : (
                            <ChevronDown size={15} />
                          )}
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-500 sm:hidden">
                          {isExpanded ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                        </div>

                      </div>
                    </button>

                    {/* =================================================
                        FACULTY CONTENT
                    ================================================= */}

                    <AnimatePresence initial={false}>

                      {isExpanded && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                        >

                          <div className="border-t border-white/5 px-5 pb-6 pt-5 sm:px-6">

                            {/* FACULTY DESCRIPTION */}

                            {faculty.description && (
                              <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">

                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/60">
                                  About this Faculty
                                </p>

                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-400">
                                  {faculty.description}
                                </p>

                              </div>
                            )}

                            {/* LOADING */}

                            {facultyLoading &&
                              !Object.prototype.hasOwnProperty.call(
                                facultyCourses,
                                faculty.id
                              ) && (
                                <div className="grid gap-4 sm:grid-cols-2">

                                  {[1, 2, 3].map(
                                    (item) => (
                                      <div
                                        key={item}
                                        className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/[0.025]"
                                      />
                                    )
                                  )}

                                </div>
                              )}

                            {/* COURSES */}

                            {!facultyLoading &&
                              Object.prototype.hasOwnProperty.call(
                                facultyCourses,
                                faculty.id
                              ) &&
                              courses.length > 0 && (
                                <div>

                                  <div className="mb-4 flex items-center justify-between gap-4">

                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/60">
                                        Academic Programs
                                      </p>

                                      <h4 className="mt-1 text-lg font-black text-white">
                                        Courses & Programs
                                      </h4>
                                    </div>

                                    <div className="rounded-full border border-cyan-400/10 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-black text-cyan-400">
                                      {courses.length}
                                    </div>

                                  </div>

                                  <div className="grid gap-4 md:grid-cols-2">

                                    {courses.map(
                                      (
                                        course,
                                        courseIndex
                                      ) => (
                                        <CourseCard
                                          key={
                                            course.id ||
                                            courseIndex
                                          }
                                          course={
                                            course
                                          }
                                        />
                                      )
                                    )}

                                  </div>

                                </div>
                              )}

                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>

                  </motion.div>
                );
              })}

            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.015] p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
                <Building2
                  size={24}
                  className="text-slate-600"
                />
              </div>

              <h3 className="mt-4 font-black text-white">
                Faculty Information
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Faculty information is currently
                unavailable.
              </p>

            </div>
          )}

        </SectionCard>

        {/* ===================================================
            CONTACT + WEBSITE
        =================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">

          <SectionCard
            icon={Building2}
            eyebrow="Get in touch"
            title="College Contact"
          >

            <div className="grid gap-3 sm:grid-cols-2">

              {college.email && (
                <ContactItem
                  icon={Mail}
                  label="Email"
                  value={college.email}
                  onCopy={() =>
                    handleCopy(
                      college.email,
                      "email"
                    )
                  }
                  copied={copied === "email"}
                />
              )}

              {college.phone && (
                <ContactItem
                  icon={Phone}
                  label="Phone"
                  value={college.phone}
                  onCopy={() =>
                    handleCopy(
                      college.phone,
                      "phone"
                    )
                  }
                  copied={copied === "phone"}
                />
              )}

              {college.address && (
                <ContactItem
                  icon={MapPin}
                  label="Address"
                  value={college.address}
                  onCopy={() =>
                    handleCopy(
                      college.address,
                      "address"
                    )
                  }
                  copied={
                    copied === "address"
                  }
                />
              )}

            </div>

          </SectionCard>

          {websiteUrl && (
            <motion.div
              whileHover={{
                y: -3,
              }}
              className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.10] via-slate-900 to-slate-950 p-6 shadow-xl"
            >

              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
                  <Globe
                    size={21}
                    className="text-cyan-400"
                  />
                </div>

                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                  Official Website
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-slate-400">
                  {college.website}
                </p>

                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
                >
                  Visit Website
                  <ExternalLink size={16} />
                </a>

              </div>
            </motion.div>
          )}

        </div>

        {/* ===================================================
            FOOTER ACTION
        =================================================== */}

        <div className="mb-12 mt-8 flex justify-center">

          <button
            type="button"
            onClick={() =>
              navigate("/colleges")
            }
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Explore More Colleges

          </button>

        </div>

      </div>
    </section>
  );
};

/* =========================================================
   COURSE CARD
========================================================= */

const CourseCard = ({ course }) => {
  const courseName =
    course.name ||
    course.title ||
    course.course_name ||
    "Course";

  const description =
    course.description ||
    course.summary ||
    "";

  const degreeType =
    course.degree_type ||
    course.degree ||
    "";

  const duration =
    course.duration ||
    "";

  const studyMode =
    course.study_mode ||
    course.studyMode ||
    "";

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.025] p-5 transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.025]"
    >

      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/[0.035] blur-2xl transition group-hover:bg-cyan-400/[0.07]" />

      <div className="relative">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/[0.08]">
            <GraduationCap
              size={20}
              className="text-blue-400"
            />
          </div>

          <div className="min-w-0 flex-1">

            <h5 className="font-black leading-6 text-white">
              {courseName}
            </h5>

            {degreeType && (
              <p className="mt-1 text-xs font-bold text-cyan-400">
                {degreeType}
              </p>
            )}

          </div>

        </div>

        {description && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}

        {(duration ||
          studyMode) && (
          <div className="mt-4 flex flex-wrap gap-2">

            {duration && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                <Clock3 size={12} />
                {duration}
              </div>
            )}

            {studyMode && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                <Layers3 size={12} />
                {studyMode}
              </div>
            )}

          </div>
        )}

      </div>
    </motion.div>
  );
};

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
  icon: Icon,
  title,
  value,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl"
    >

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/[0.035] blur-2xl transition group-hover:bg-cyan-400/[0.08]" />

      <div className="relative flex items-center gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.08]">
          <Icon
            size={20}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-white">
            {value}
          </p>

        </div>

      </div>
    </motion.div>
  );
};

/* =========================================================
   SECTION CARD
========================================================= */

const SectionCard = ({
  icon: Icon,
  eyebrow,
  title,
  children,
  compact = false,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.45,
      }}
      className={`rounded-[2rem] border border-white/10 bg-white/[0.025] backdrop-blur-2xl ${
        compact
          ? "p-5"
          : "p-6 sm:p-8"
      }`}
    >

      <div className="mb-6 flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.08]">
          <Icon
            size={20}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">

          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
            {title}
          </h2>

        </div>

      </div>

      {children}

    </motion.div>
  );
};

/* =========================================================
   CONTACT ITEM
========================================================= */

const ContactItem = ({
  icon: Icon,
  label,
  value,
  onCopy,
  copied,
}) => {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.025]">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08]">
          <Icon
            size={17}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
            {label}
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-slate-300">
            {value}
          </p>

        </div>

        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-500 transition hover:bg-white/10 hover:text-white"
            title={`Copy ${label}`}
          >
            {copied ? (
              <Check
                size={15}
                className="text-emerald-400"
              />
            ) : (
              <Copy size={15} />
            )}
          </button>
        )}

      </div>
    </div>
  );
};

/* =========================================================
   SHIELD ICON
========================================================= */

const ShieldIcon = () => {
  return (
    <CheckCircle2
      size={14}
      className="text-cyan-400"
    />
  );
};

export default CollegeDetails;
