import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Globe2,
  GraduationCap,
  Building2,
  ClipboardCheck,
  Wallet,
  Phone,
  Mail,
  CheckCircle2,
  Loader2,
  BookOpen,
  ExternalLink,
  Landmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  Layers3,
  Clock3,
  Award,
  Search,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

/* =========================================================
   ANIMATION PRESETS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/* =========================================================
   SECTION CARD
========================================================= */

const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className={[
        "group relative overflow-hidden rounded-[2rem]",
        "border border-white/[0.08]",
        "bg-slate-900/65",
        "shadow-[0_20px_80px_rgba(0,0,0,0.22)]",
        "backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      <div className="relative p-6 sm:p-7 lg:p-8">
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.08] shadow-inner shadow-cyan-400/5">
            <Icon size={21} className="text-cyan-400" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
              {title}
            </h2>

            {description && (
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {children}
      </div>
    </motion.section>
  );
};

/* =========================================================
   INFO STAT
========================================================= */

const InfoStat = ({
  icon: Icon,
  label,
  value,
  accent = "cyan",
}) => {
  const accentClasses = {
    cyan: "bg-cyan-400/10 text-cyan-400 border-cyan-400/10",
    blue: "bg-blue-400/10 text-blue-400 border-blue-400/10",
    emerald:
      "bg-emerald-400/10 text-emerald-400 border-emerald-400/10",
    violet:
      "bg-violet-400/10 text-violet-400 border-violet-400/10",
  };

  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-xl border",
          accentClasses[accent] || accentClasses.cyan,
        ].join(" ")}
      >
        <Icon size={18} />
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-lg font-black text-white">
        {value}
      </p>
    </motion.div>
  );
};

/* =========================================================
   FACULTY CARD
========================================================= */

const FacultyCard = ({
  faculty,
  index,
  selected,
  onClick,
}) => {
  const isActive =
    faculty?.active === true ||
    faculty?.active === "true" ||
    faculty?.status === "active";

  return (
    <motion.button
      type="button"
      variants={fadeUp}
      whileHover={{
        y: -4,
      }}
      whileTap={{
        scale: 0.99,
      }}
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-2xl",
        "border p-5 text-left",
        "transition-all duration-300",
        selected
          ? "border-cyan-400/30 bg-cyan-400/[0.06] shadow-lg shadow-cyan-500/[0.05]"
          : "border-white/[0.07] bg-slate-950/55 hover:border-cyan-400/20 hover:bg-slate-950/80",
      ].join(" ")}
    >
      <div className="relative flex items-start gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",
            selected
              ? "border-cyan-400/20 bg-cyan-400/[0.10]"
              : "border-white/[0.07] bg-white/[0.035] group-hover:border-cyan-400/20 group-hover:bg-cyan-400/[0.08]",
          ].join(" ")}
        >
          <GraduationCap
            size={20}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                Faculty {String(index + 1).padStart(2, "0")}
              </p>

              <h3 className="font-black text-white">
                {faculty?.name || "Unnamed Faculty"}
              </h3>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={[
                  "rounded-full border px-2.5 py-1",
                  "text-[9px] font-black uppercase tracking-wider",
                  isActive
                    ? "border-emerald-400/10 bg-emerald-400/10 text-emerald-400"
                    : "border-slate-700 bg-slate-800/60 text-slate-500",
                ].join(" ")}
              >
                {isActive ? "Active" : "Inactive"}
              </span>

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.03]">
                {selected ? (
                  <ChevronUp
                    size={15}
                    className="text-cyan-400"
                  />
                ) : (
                  <ChevronDown
                    size={15}
                    className="text-slate-600 transition-colors group-hover:text-cyan-400"
                  />
                )}
              </div>
            </div>
          </div>

          {faculty?.description ? (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {faculty.description}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Faculty information is available through the
              institution.
            </p>
          )}

          <div
            className={[
              "mt-4 flex items-center gap-2 text-xs font-bold transition-colors",
              selected
                ? "text-cyan-400"
                : "text-slate-600 group-hover:text-cyan-400/70",
            ].join(" ")}
          >
            <span>
              {selected
                ? "Viewing faculty courses"
                : "View faculty courses"}
            </span>

            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

/* =========================================================
   COURSE CARD
========================================================= */

const CourseCard = ({
  course,
  index,
}) => {
  const degreeType =
    course?.degree_type ||
    course?.degreeType ||
    course?.qualification ||
    "";

  const duration =
    course?.duration ||
    "";

  const studyMode =
    course?.study_mode ||
    course?.studyMode ||
    "";

  const courseName =
    course?.name ||
    course?.title ||
    course?.course_name ||
    course?.program_name ||
    "Unnamed Course";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.35,
        delay: index * 0.035,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-950/55 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-950/80"
    >
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
              <BookOpen
                size={19}
                className="text-cyan-400"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
                Course {String(index + 1).padStart(2, "0")}
              </p>

              <h4 className="mt-1 font-black leading-6 text-white">
                {courseName}
              </h4>

              {course?.short_name && (
                <p className="mt-1 text-xs font-bold text-cyan-400/70">
                  {course.short_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {course?.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-500">
            {course.description}
          </p>
        )}

        {(degreeType || duration || studyMode) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {degreeType && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/10 bg-violet-400/[0.06] px-3 py-1.5 text-[10px] font-bold text-violet-300">
                <Award size={12} />
                {degreeType}
              </span>
            )}

            {duration && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/10 bg-blue-400/[0.06] px-3 py-1.5 text-[10px] font-bold text-blue-300">
                <Clock3 size={12} />
                {duration}
              </span>
            )}

            {studyMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-bold text-emerald-300">
                <Layers3 size={12} />
                {studyMode}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* =========================================================
   FACULTY COURSE PANEL
========================================================= */

const FacultyCoursePanel = ({
  faculty,
  courses,
  loading,
  error,
  onClose,
}) => {
  if (!faculty) {
    return null;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
        y: -10,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        y: 0,
      }}
      exit={{
        opacity: 0,
        height: 0,
        y: -10,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      className="mt-6 overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-slate-950/35"
    >
      <div className="relative p-6 sm:p-8">

        {/* FACULTY HEADER */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.08]">
              <GraduationCap
                size={25}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">
                Selected Faculty
              </p>

              <h3 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {faculty.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-500 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
            title="Close faculty"
          >
            <X size={17} />
          </button>
        </div>

        {/* FACULTY DESCRIPTION */}

        {faculty.description && (
          <div className="mt-7 rounded-2xl border border-white/[0.06] bg-slate-950/55 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                About this faculty
              </p>
            </div>

            <p className="whitespace-pre-line text-sm leading-8 text-slate-400 sm:text-[15px]">
              {faculty.description}
            </p>
          </div>
        )}

        {/* COURSES */}

        <div className="mt-7">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="text-lg font-black text-white">
                Courses
              </h4>

              <p className="mt-1 text-sm text-slate-600">
                Courses connected to this faculty are displayed
                below.
              </p>
            </div>

            {!loading && !error && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                <BookOpen size={12} />

                {courses.length}{" "}
                {courses.length === 1
                  ? "Course"
                  : "Courses"}
              </div>
            )}
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/45 py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06]">
                <Loader2
                  size={24}
                  className="animate-spin text-cyan-400"
                />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">
                Loading courses...
              </p>
            </div>
          ) : error ? (
            /* COURSE ERROR */

            <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.035] px-6 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.06]">
                <BookOpen
                  size={27}
                  className="text-red-400"
                />
              </div>

              <h4 className="mt-5 font-black text-white">
                Unable to load courses
              </h4>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-500">
                {error}
              </p>
            </div>
          ) : courses.length === 0 ? (
            /* NO COURSES */

            <div className="rounded-2xl border border-dashed border-white/[0.08] bg-slate-950/45 px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025]">
                <BookOpen
                  size={27}
                  className="text-slate-700"
                />
              </div>

              <h4 className="mt-5 font-black text-white">
                No courses found
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-600">
                No courses have been connected to this faculty
                yet.
              </p>
            </div>
          ) : (
            /* COURSES */

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2"
            >
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id || `${faculty.id}-${index}`}
                  course={course}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   UNIVERSITY DETAILS
========================================================= */

const UniversityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [university, setUniversity] =
    useState(null);

  const [faculties, setFaculties] =
    useState([]);

  const [selectedFaculty, setSelectedFaculty] =
    useState(null);

  const [facultyCourses, setFacultyCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [facultyLoading, setFacultyLoading] =
    useState(false);

  const [courseLoading, setCourseLoading] =
    useState(false);

  const [courseError, setCourseError] =
    useState("");

  const [error, setError] =
    useState("");

  const [facultySearch, setFacultySearch] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  /* =======================================================
     FETCH UNIVERSITY
  ======================================================= */

  useEffect(() => {
    if (!id) {
      setError("University ID is missing.");
      setLoading(false);
      return;
    }

    fetchUniversity();
  }, [id]);

  const fetchUniversity = async () => {
    try {
      setLoading(true);
      setError("");

      /* ---------------------------------------------------
         UNIVERSITY
      --------------------------------------------------- */

      const {
        data: universityData,
        error: universityError,
      } = await supabase
        .from("universities")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (universityError) {
        console.error(
          "Fetch University Error:",
          universityError
        );

        setError(
          universityError.message ||
            "Unable to load university."
        );

        setUniversity(null);
        return;
      }

      if (!universityData) {
        setUniversity(null);
        setError(
          "The university you're looking for does not exist."
        );
        return;
      }

      setUniversity(universityData);

      /* ---------------------------------------------------
         FACULTIES
      --------------------------------------------------- */

      setFacultyLoading(true);

      const {
        data: facultyData,
        error: facultyError,
      } = await supabase
        .from("school_faculties")
        .select("*")
        .eq("school_id", universityData.id)
        .order("created_at", {
          ascending: false,
        });

      if (facultyError) {
        console.error(
          "Fetch University Faculties Error:",
          facultyError
        );

        setFaculties([]);
      } else {
        setFaculties(facultyData || []);
      }
    } catch (err) {
      console.error(
        "University Details Error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while loading the university."
      );

      setUniversity(null);
    } finally {
      setFacultyLoading(false);
      setLoading(false);
    }
  };

  /* =======================================================
     FETCH COURSES FOR SELECTED FACULTY
     
     IMPORTANT:
     
     The previous version used:
     
       academic_programs
     
     That table does not exist in the current Supabase
     schema.
     
     Courses are now loaded from:
     
       courses
     
     using:
     
       courses.faculty_id = school_faculties.id
  ======================================================= */
const fetchFacultyCourses = async (faculty) => {
  if (!faculty?.id) {
    setFacultyCourses([]);
    return;
  }

  try {
    setCourseLoading(true);
    setFacultyCourses([]);

    console.log("Loading courses for faculty:", faculty);

    /*
     * IMPORTANT
     * ---------------------------------------------------------
     * Do NOT use:
     *
     * .eq("faculty_id", faculty.id)
     *
     * because the current `courses` table does not have a
     * faculty_id column.
     *
     * We first load the course records and then identify the
     * faculty relationship from the fields actually returned.
     */

    const {
      data: courseData,
      error: courseError,
    } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    if (courseError) {
      console.error(
        "Fetch Courses Error:",
        courseError
      );

      setFacultyCourses([]);
      return;
    }

    const allCourses = courseData || [];

    console.log(
      "All courses returned:",
      allCourses
    );

    /*
     * ---------------------------------------------------------
     * FIND COURSES BELONGING TO THE SELECTED FACULTY
     * ---------------------------------------------------------
     *
     * We support the common possible field names without
     * querying nonexistent columns directly.
     */

    const selectedFacultyId = String(
      faculty.id
    );

    const selectedFacultyName = String(
      faculty.name || ""
    )
      .trim()
      .toLowerCase();

    const matchingCourses = allCourses.filter(
      (course) => {
        if (!course) {
          return false;
        }

        /*
         * UUID / ID based relationships
         */

        const possibleFacultyIds = [
          course.faculty_id,
          course.facultyId,
          course.school_faculty_id,
          course.schoolFacultyId,
          course.faculty_uuid,
          course.facultyUuid,
        ]
          .filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              value !== ""
          )
          .map((value) => String(value));

        if (
          possibleFacultyIds.includes(
            selectedFacultyId
          )
        ) {
          return true;
        }

        /*
         * Sometimes the database stores the faculty itself
         * as a UUID under a generic `faculty` field.
         */

        if (
          course.faculty !== null &&
          course.faculty !== undefined
        ) {
          const facultyValue = String(
            course.faculty
          )
            .trim()
            .toLowerCase();

          if (
            facultyValue ===
            selectedFacultyId.toLowerCase()
          ) {
            return true;
          }

          if (
            selectedFacultyName &&
            facultyValue === selectedFacultyName
          ) {
            return true;
          }
        }

        /*
         * Sometimes the course record stores the faculty
         * name instead of its UUID.
         */

        const possibleFacultyNames = [
          course.faculty_name,
          course.facultyName,
          course.faculty_title,
          course.facultyTitle,
        ]
          .filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              value !== ""
          )
          .map((value) =>
            String(value)
              .trim()
              .toLowerCase()
          );

        if (
          selectedFacultyName &&
          possibleFacultyNames.includes(
            selectedFacultyName
          )
        ) {
          return true;
        }

        return false;
      }
    );

    console.log(
      `Courses belonging to ${faculty.name}:`,
      matchingCourses
    );

    setFacultyCourses(
      matchingCourses
    );
  } catch (err) {
    console.error(
      "Faculty Courses Error:",
      err
    );

    setFacultyCourses([]);
  } finally {
    setCourseLoading(false);
  }
};
  /* =======================================================
     SELECT FACULTY
  ======================================================= */

  const handleFacultyClick = async (
    faculty
  ) => {
    if (!faculty?.id) {
      return;
    }

    if (
      selectedFaculty?.id === faculty.id
    ) {
      setSelectedFaculty(null);
      setFacultyCourses([]);
      setCourseError("");
      return;
    }

    setSelectedFaculty(faculty);
    setFacultyCourses([]);
    setCourseError("");

    await fetchFacultyCourses(faculty);

    requestAnimationFrame(() => {
      document
        .getElementById("selected-faculty")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  /* =======================================================
     DERIVED UNIVERSITY DATA
  ======================================================= */

  const universityName = useMemo(
    () =>
      university?.name ||
      "Unnamed University",
    [university]
  );

  const universityDescription = useMemo(
    () =>
      university?.description ||
      "Explore this institution, its faculties, academic opportunities and available information.",
    [university]
  );

  const universityAbout = useMemo(
    () =>
      university?.about ||
      university?.description ||
      "This institution provides academic opportunities across a range of disciplines.",
    [university]
  );

  const universityLocation = useMemo(() => {
    if (
      university?.city &&
      university?.state
    ) {
      return `${university.city}, ${university.state}`;
    }

    return (
      university?.location ||
      university?.state ||
      "Location not specified"
    );
  }, [university]);

  const universityState =
    university?.state ||
    university?.location ||
    "Not specified";

  const universityType =
    university?.type ||
    university?.school_type ||
    university?.institution_type ||
    "University";

  const universityShortName =
    useMemo(() => {
      if (
        university?.short_name ||
        university?.shortName ||
        university?.acronym ||
        university?.code
      ) {
        return (
          university.short_name ||
          university.shortName ||
          university.acronym ||
          university.code
        );
      }

      return universityName
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 6)
        .toUpperCase();
    }, [university, universityName]);

  const universityImage =
    university?.cover_url ||
    university?.image_url ||
    university?.image ||
    university?.logo_url ||
    null;

  const universityWebsite =
    university?.website ||
    university?.website_url ||
    university?.official_website ||
    "";

  const universityPhone =
    university?.phone ||
    university?.phone_number ||
    university?.contact_phone ||
    "";

  const universityEmail =
    university?.email ||
    university?.contact_email ||
    "";

  const universityAddress =
    university?.address ||
    university?.contact_address ||
    universityLocation;

  const activeFacultyCount =
    useMemo(
      () =>
        faculties.filter(
          (faculty) =>
            faculty?.active === true ||
            faculty?.active === "true" ||
            faculty?.status === "active"
        ).length,
      [faculties]
    );

  /* =======================================================
     FILTER FACULTIES
  ======================================================= */

  const filteredFaculties =
    useMemo(() => {
      const query =
        facultySearch.trim().toLowerCase();

      if (!query) {
        return faculties;
      }

      return faculties.filter(
        (faculty) => {
          const name =
            faculty?.name?.toLowerCase() ||
            "";

          const description =
            faculty?.description?.toLowerCase() ||
            "";

          return (
            name.includes(query) ||
            description.includes(query)
          );
        }
      );
    }, [faculties, facultySearch]);

  /* =======================================================
     WEBSITE URL
  ======================================================= */

  const websiteUrl = useMemo(() => {
    if (!universityWebsite) {
      return "";
    }

    return universityWebsite.startsWith(
      "http"
    )
      ? universityWebsite
      : `https://${universityWebsite}`;
  }, [universityWebsite]);

  /* =======================================================
     COPY EMAIL
  ======================================================= */

  const handleCopyEmail = async () => {
    if (!universityEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        universityEmail
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error(
        "Unable to copy email:",
        err
      );
    }
  };

  /* =======================================================
     SCROLL TO FACULTIES
  ======================================================= */

  const scrollToFaculties = () => {
    document
      .getElementById("faculties")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!loading && !university) {
    return (
      <section className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate("/universities")
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-400 transition-all hover:border-cyan-400/20 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to Universities
          </button>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-slate-900/70 px-6 py-20 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/10 bg-red-400/[0.07]">
              <Building2
                size={34}
                className="text-red-400"
              />
            </div>

            <h1 className="mt-7 text-3xl font-black tracking-tight text-white sm:text-4xl">
              University not found
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
              {error ||
                "The university you're looking for does not exist or is no longer available."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/universities")
              }
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-black text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              <ArrowLeft size={17} />

              Browse Universities
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-slate-900/70">
            <div className="space-y-4 p-7">
              <div className="h-5 w-32 animate-pulse rounded-full bg-white/[0.06]" />

              <div className="h-12 max-w-xl animate-pulse rounded-xl bg-white/[0.06]" />

              <div className="h-5 max-w-2xl animate-pulse rounded-lg bg-white/[0.04]" />
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
              />
            ))}
          </div>

          <div className="flex flex-col items-center justify-center py-16">
            <Loader2
              size={28}
              className="animate-spin text-cyan-400"
            />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading university profile...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.025] blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/[0.025] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* =================================================
            BACK
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-7"
        >
          <button
            type="button"
            onClick={() =>
              navigate("/universities")
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-sm font-bold text-slate-400 backdrop-blur-xl transition-all hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Universities
          </button>
        </motion.div>

        {/* =================================================
            HERO
        ================================================= */}

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
            duration: 0.65,
            ease: "easeOut",
          }}
          className="relative mb-8 overflow-hidden rounded-[2.25rem] border border-white/[0.09] bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
        >
          <div className="relative h-[480px] sm:h-[540px] lg:h-[580px]">
            {universityImage ? (
              <img
                src={universityImage}
                alt={universityName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950">
                <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/[0.06] bg-white/[0.025]">
                  <Building2
                    size={58}
                    className="text-slate-700"
                  />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/5" />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />

            <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300 backdrop-blur-xl">
                <Sparkles size={13} />

                {universityType}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:p-11">
              <div className="max-w-5xl">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-300">
                    {universityShortName}
                  </span>

                  {activeFacultyCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
                      <CheckCircle2 size={12} />

                      Institution Listed
                    </span>
                  )}
                </div>

                <h1 className="max-w-5xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
                  {universityName}
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  {universityDescription}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <MapPin
                      size={16}
                      className="text-cyan-400"
                    />

                    {universityLocation}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Landmark
                      size={16}
                      className="text-cyan-400"
                    />

                    {universityState}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HERO ACTIONS */}

          <div className="flex flex-col gap-3 border-t border-white/[0.07] bg-slate-950/80 p-5 backdrop-blur-xl sm:flex-row sm:flex-wrap sm:p-6">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <Globe2 size={17} />

                Official Website

                <ExternalLink
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            )}

            <button
              type="button"
              onClick={scrollToFaculties}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-5 py-3.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.06]"
            >
              Explore Faculties

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </motion.div>

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <InfoStat
            icon={GraduationCap}
            label="Institution"
            value={universityShortName}
            accent="cyan"
          />

          <InfoStat
            icon={MapPin}
            label="Location"
            value={universityState}
            accent="blue"
          />

          <InfoStat
            icon={Building2}
            label="Faculties"
            value={faculties.length}
            accent="emerald"
          />

          <InfoStat
            icon={BookOpen}
            label="Courses"
            value={
              selectedFaculty
                ? facultyCourses.length
                : "Select a faculty"
            }
            accent="violet"
          />
        </motion.div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]"
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="min-w-0 space-y-8">
            {/* ABOUT */}

            <SectionCard
              icon={Building2}
              title="About the University"
              description="An overview of the institution and its academic identity."
            >
              <div className="relative rounded-2xl border border-white/[0.06] bg-slate-950/45 p-5 sm:p-6">
                <div className="absolute left-0 top-6 h-12 w-1 rounded-r-full bg-cyan-400/50" />

                <p className="whitespace-pre-line pl-4 text-sm leading-8 text-slate-400 sm:text-[15px]">
                  {universityAbout}
                </p>
              </div>
            </SectionCard>

            {/* FACULTIES */}

            <div id="faculties">
              <SectionCard
                icon={GraduationCap}
                title="Faculties"
                description={
                  facultyLoading
                    ? "Loading academic faculties..."
                    : `${faculties.length} ${
                        faculties.length === 1
                          ? "faculty"
                          : "faculties"
                      } currently listed. Select a faculty to view its complete description and courses.`
                }
              >
                {/* FACULTY SEARCH */}

                {faculties.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <Search
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <input
                        type="text"
                        value={facultySearch}
                        onChange={(event) =>
                          setFacultySearch(
                            event.target.value
                          )
                        }
                        placeholder="Search faculties..."
                        className="w-full rounded-2xl border border-white/[0.07] bg-slate-950/60 py-3.5 pl-11 pr-11 text-sm font-semibold text-white outline-none placeholder:text-slate-700 transition-all focus:border-cyan-400/20 focus:bg-slate-950/80"
                      />

                      {facultySearch && (
                        <button
                          type="button"
                          onClick={() =>
                            setFacultySearch("")
                          }
                          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/[0.05] hover:text-white"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* FACULTY LOADING */}

                  {facultyLoading ? (
                    <motion.div
                      key="faculty-loading"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/45 py-14"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06]">
                        <Loader2
                          size={24}
                          className="animate-spin text-cyan-400"
                        />
                      </div>

                      <p className="mt-4 text-sm font-bold text-slate-500">
                        Loading faculties...
                      </p>
                    </motion.div>
                  ) : faculties.length === 0 ? (
                    /* NO FACULTIES */

                    <motion.div
                      key="faculty-empty"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="rounded-2xl border border-dashed border-white/[0.08] bg-slate-950/45 px-6 py-14 text-center"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025]">
                        <GraduationCap
                          size={28}
                          className="text-slate-700"
                        />
                      </div>

                      <h3 className="mt-5 font-black text-white">
                        No faculties listed yet
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                        Faculty information for this
                        institution has not been added yet.
                      </p>
                    </motion.div>
                  ) : filteredFaculties.length === 0 ? (
                    /* SEARCH EMPTY */

                    <motion.div
                      key="faculty-no-search"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="rounded-2xl border border-dashed border-white/[0.08] bg-slate-950/45 px-6 py-12 text-center"
                    >
                      <Search
                        size={26}
                        className="mx-auto text-slate-700"
                      />

                      <h3 className="mt-4 font-black text-white">
                        No faculty found
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        Try a different faculty name.
                      </p>
                    </motion.div>
                  ) : (
                    /* FACULTY LIST */

                    <motion.div
                      key="faculty-list"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      {filteredFaculties.map(
                        (
                          faculty,
                          index
                        ) => (
                          <FacultyCard
                            key={faculty.id}
                            faculty={faculty}
                            index={index}
                            selected={
                              selectedFaculty?.id ===
                              faculty.id
                            }
                            onClick={() =>
                              handleFacultyClick(
                                faculty
                              )
                            }
                          />
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* =================================================
                    SELECTED FACULTY + COURSES
                ================================================= */}

                <div
                  id="selected-faculty"
                  className="scroll-mt-24"
                >
                  <AnimatePresence>
                    {selectedFaculty && (
                      <FacultyCoursePanel
                        faculty={
                          selectedFaculty
                        }
                        courses={
                          facultyCourses
                        }
                        loading={
                          courseLoading
                        }
                        error={
                          courseError
                        }
                        onClose={() => {
                          setSelectedFaculty(
                            null
                          );
                          setFacultyCourses(
                            []
                          );
                          setCourseError("");
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </SectionCard>
            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="min-w-0 space-y-8">
            {/* ADMISSION */}

            <SectionCard
              icon={ClipboardCheck}
              title="Admission"
              description="Important information before applying."
            >
              {university?.admission ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                  {university.admission}
                </p>
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Admission information for this institution
                  has not been added yet.
                </p>
              )}

              <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-cyan-400"
                  />

                  <p className="text-xs leading-6 text-cyan-300">
                    Always verify current admission
                    requirements directly with the institution
                    before applying.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* FEES */}

            <SectionCard
              icon={Wallet}
              title="Fees"
              description="Tuition and related financial information."
            >
              {university?.fees ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                  {university.fees}
                </p>
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Fee information for this institution has not
                  been added yet.
                </p>
              )}

              <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <Wallet
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <p className="text-xs leading-6 text-amber-300/80">
                    Fees may change between academic sessions.
                    Confirm current charges before making any
                    payment.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* CONTACT */}

            <SectionCard
              icon={Phone}
              title="Contact"
              description="Available institutional contact details."
            >
              <div className="space-y-5">
                {/* ADDRESS */}

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/45 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07]">
                      <MapPin
                        size={17}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
                        Address
                      </p>

                      <p className="mt-1.5 text-sm leading-6 text-slate-400">
                        {universityAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PHONE */}

                {universityPhone && (
                  <a
                    href={`tel:${universityPhone}`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-slate-950/45 p-4 transition-all hover:border-cyan-400/15 hover:bg-white/[0.025]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07]">
                      <Phone
                        size={17}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
                        Phone
                      </p>

                      <p className="mt-1.5 truncate text-sm font-semibold text-slate-400 transition-colors group-hover:text-white">
                        {universityPhone}
                      </p>
                    </div>
                  </a>
                )}

                {/* EMAIL */}

                {universityEmail && (
                  <div className="rounded-2xl border border-white/[0.06] bg-slate-950/45 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07]">
                        <Mail
                          size={17}
                          className="text-cyan-400"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
                            Email
                          </p>

                          <button
                            type="button"
                            onClick={
                              handleCopyEmail
                            }
                            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-cyan-400"
                            title="Copy email"
                          >
                            {copied ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>

                        <a
                          href={`mailto:${universityEmail}`}
                          className="mt-1.5 block break-all text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-400"
                        >
                          {universityEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {!universityPhone &&
                  !universityEmail && (
                    <div className="rounded-2xl border border-dashed border-white/[0.07] bg-slate-950/45 p-6 text-center">
                      <Phone
                        size={23}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-3 text-sm text-slate-600">
                        Contact information has not been added
                        yet.
                      </p>
                    </div>
                  )}
              </div>
            </SectionCard>

            {/* OFFICIAL WEBSITE */}

            {websiteUrl && (
              <motion.a
                variants={fadeUp}
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] to-blue-500/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/[0.06] blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
                      <Globe2
                        size={20}
                        className="text-cyan-400"
                      />
                    </div>

                    <ExternalLink
                      size={17}
                      className="text-slate-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
                    />
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.17em] text-cyan-400/70">
                    Official Institution
                  </p>

                  <h3 className="mt-1 font-black text-white">
                    Visit official website
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Get the latest information directly from the
                    institution.
                  </p>
                </div>
              </motion.a>
            )}
          </aside>
        </motion.div>

        {/* =================================================
            TRUST NOTICE
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="mt-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.06]">
              <ShieldCheck
                size={19}
                className="text-cyan-400"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-black text-white">
                University information
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-600">
                Information displayed on this profile is loaded
                from the institution records available in the
                platform. Confirm important admission, fee and
                application details with the institution.
              </p>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            BOTTOM NAVIGATION
        ================================================= */}

        <div className="flex justify-center py-12">
          <button
            type="button"
            onClick={() =>
              navigate("/universities")
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-6 py-3.5 text-sm font-black text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to All Universities
          </button>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="border-t border-white/[0.06] py-8 text-center">
          <p className="text-xs font-semibold text-slate-700">
            University information powered by Scholiqen.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default UniversityDetails;