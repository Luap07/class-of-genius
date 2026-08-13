import React, { useEffect, useMemo,useState,} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { ArrowLeft,  ArrowRight,
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
  Clock3,
  Award,
  Search,
  X,
  Layers3,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
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
      staggerChildren: 0.06,
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
        amount: 0.06,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className={[
        "relative overflow-hidden rounded-[2rem]",
        "border border-white/[0.08]",
        "bg-[#0a1020]/90",
        "shadow-[0_25px_90px_rgba(0,0,0,0.28)]",
        "backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-4">
          {Icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
              <Icon
                size={19}
                className="text-cyan-400"
              />
            </div>
          )}

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
    cyan:
      "border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-400",

    blue:
      "border-blue-400/10 bg-blue-400/[0.06] text-blue-400",

    emerald:
      "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400",

    violet:
      "border-violet-400/10 bg-violet-400/[0.06] text-violet-400",
  };

  return (
    <motion.div
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a1020]/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.13] hover:bg-[#0d1426]"
    >
      <div
        className={[
          "flex h-10 w-10 items-center justify-center rounded-xl border",
          accentClasses[accent] ||
            accentClasses.cyan,
        ].join(" ")}
      >
        {Icon && <Icon size={18} />}
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
        y: -3,
      }}
      whileTap={{
        scale: 0.995,
      }}
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-[1.5rem]",
        "border p-5 text-left",
        "transition-all duration-300",

        selected
          ? "border-cyan-400/30 bg-cyan-400/[0.055] shadow-[0_15px_50px_rgba(6,182,212,0.07)]"
          : "border-white/[0.07] bg-[#080d19]/90 hover:border-cyan-400/20 hover:bg-[#0b1220]",
      ].join(" ")}
    >
      {selected && (
        <motion.div
          layoutId="faculty-active-indicator"
          className="absolute left-0 top-5 h-10 w-1 rounded-r-full bg-cyan-400"
        />
      )}

      <div className="flex items-start gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",

            selected
              ? "border-cyan-400/20 bg-cyan-400/[0.09]"
              : "border-white/[0.07] bg-white/[0.025] group-hover:border-cyan-400/20 group-hover:bg-cyan-400/[0.06]",
          ].join(" ")}
        >
          <GraduationCap
            size={22}
            className={
              selected
                ? "text-cyan-400"
                : "text-slate-600 transition-colors group-hover:text-cyan-400"
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-700">
                Faculty{" "}
                {String(index + 1).padStart(
                  2,
                  "0"
                )}
              </p>

              <h3 className="font-black leading-6 text-white">
                {faculty?.name ||
                  "Unnamed Faculty"}
              </h3>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={[
                  "hidden rounded-full border px-2.5 py-1 sm:inline-flex",
                  "text-[9px] font-black uppercase tracking-wider",

                  isActive
                    ? "border-emerald-400/10 bg-emerald-400/10 text-emerald-400"
                    : "border-slate-700 bg-slate-800/60 text-slate-500",
                ].join(" ")}
              >
                {isActive
                  ? "Active"
                  : "Inactive"}
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
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
              {faculty.description}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Explore the academic programs offered under this faculty.
            </p>
          )}

          <div
            className={[
              "mt-4 flex items-center gap-2 text-xs font-bold transition-colors",

              selected
                ? "text-cyan-400"
                : "text-slate-600 group-hover:text-cyan-400",
            ].join(" ")}
          >
            <span>
              {selected
                ? "Programs displayed below"
                : "View academic programs"}
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
   PROGRAM CARD
========================================================= */

const ProgramCard = ({
  program,
  index,
}) => {
  const programName =
    program?.name ||
    program?.course_name ||
    program?.title ||
    program?.course ||
    "Unnamed Course";

  const shortName =
    program?.short_name ||
    program?.shortName ||
    program?.code ||
    program?.course_code ||
    "";

  const description =
    program?.description ||
    program?.details ||
    program?.overview ||
    "";

  const degreeType =
    program?.degree_type ||
    program?.degreeType ||
    program?.degree ||
    "";

  const duration =
    program?.duration || "";

  const studyMode =
    program?.study_mode ||
    program?.studyMode ||
    "";

  const admissionRequirements =
    program?.admission_requirements ||
    program?.admissionRequirements ||
    program?.requirements ||
    "";

  const department =
    program?.department ||
    program?.department_name ||
    "";

  const entryMode =
    program?.entry_mode ||
    program?.entryMode ||
    "";

  const accreditation =
    program?.accreditation ||
    program?.accredited_by ||
    "";

  const excludedFields = [
    "id",
    "faculty_id",
    "name",
    "course_name",
    "title",
    "course",
    "short_name",
    "shortName",
    "code",
    "course_code",
    "description",
    "details",
    "overview",
    "degree_type",
    "degreeType",
    "degree",
    "duration",
    "study_mode",
    "studyMode",
    "admission_requirements",
    "admissionRequirements",
    "requirements",
    "department",
    "department_name",
    "entry_mode",
    "entryMode",
    "accreditation",
    "accredited_by",
  ];

  return (
    <motion.article
      variants={fadeUp}
      className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#070c17] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-[#0a1020] sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06]">
          <BookOpen
            size={19}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-700">
              Course{" "}
              {String(index + 1).padStart(
                2,
                "0"
              )}
            </p>

            {shortName && (
              <span className="rounded-full border border-cyan-400/10 bg-cyan-400/[0.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-cyan-300">
                {shortName}
              </span>
            )}
          </div>

          <h4 className="mt-1 text-lg font-black leading-7 text-white">
            {programName}
          </h4>
        </div>
      </div>

      {description && (
        <div className="mt-5 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-700">
            Description
          </p>

          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
            {description}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {degreeType && (
          <div className="rounded-xl border border-violet-400/10 bg-violet-400/[0.045] p-3.5">
            <div className="flex items-center gap-2">
              <Award
                size={14}
                className="text-violet-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                Degree Type
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-violet-300">
              {degreeType}
            </p>
          </div>
        )}

        {duration && (
          <div className="rounded-xl border border-blue-400/10 bg-blue-400/[0.045] p-3.5">
            <div className="flex items-center gap-2">
              <Clock3
                size={14}
                className="text-blue-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                Duration
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-blue-300">
              {duration}
            </p>
          </div>
        )}

        {studyMode && (
          <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.045] p-3.5">
            <div className="flex items-center gap-2">
              <GraduationCap
                size={14}
                className="text-emerald-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                Study Mode
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-emerald-300">
              {studyMode}
            </p>
          </div>
        )}

        {department && (
          <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.045] p-3.5">
            <div className="flex items-center gap-2">
              <Layers3
                size={14}
                className="text-cyan-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                Department
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-cyan-300">
              {department}
            </p>
          </div>
        )}

        {entryMode && (
          <div className="rounded-xl border border-orange-400/10 bg-orange-400/[0.045] p-3.5">
            <div className="flex items-center gap-2">
              <ClipboardCheck
                size={14}
                className="text-orange-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                Entry Mode
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-orange-300">
              {entryMode}
            </p>
          </div>
        )}

        {accreditation && (
          <div className="rounded-xl border border-green-400/10 bg-green-400/[0.045] p-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={14}
                className="text-green-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                Accreditation
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-green-300">
              {accreditation}
            </p>
          </div>
        )}
      </div>

      {admissionRequirements && (
        <div className="mt-5 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck
              size={17}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-400/60">
                Admission Requirements
              </p>

              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                {admissionRequirements}
              </p>
            </div>
          </div>
        </div>
      )}

      {Object.entries(
        program || {}
      )
        .filter(
          ([key, value]) =>
            !excludedFields.includes(
              key
            ) &&
            value !== null &&
            value !== undefined &&
            value !== ""
        )
        .map(([key, value]) => (
          <div
            key={key}
            className="mt-2 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3.5"
          >
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-700">
              {key
                .replace(/_/g, " ")
                .replace(
                  /\b\w/g,
                  (letter) =>
                    letter.toUpperCase()
                )}
            </p>

            <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-400">
              {typeof value ===
              "object"
                ? JSON.stringify(
                    value,
                    null,
                    2
                  )
                : String(value)}
            </p>
          </div>
        ))}
    </motion.article>
  );
};

/* =========================================================
   FACULTY PROGRAM PANEL
========================================================= */

const FacultyProgramPanel = ({
  faculty,
  programs,
  loading,
  error,
  onClose,
  search,
  setSearch,
}) => {
  const filteredPrograms =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return programs;
      }

      return programs.filter(
        (program) =>
          Object.values(
            program || {}
          ).some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
          )
      );
    }, [programs, search]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -12,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="mt-5 overflow-hidden rounded-[1.75rem] border border-cyan-400/10 bg-[#060b15]"
    >
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-cyan-400/[0.045] to-transparent p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.07]">
              <Layers3
                size={20}
                className="text-cyan-400"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                Academic Programs
              </p>

              <h3 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                {faculty?.name ||
                  "Faculty"}
              </h3>

              <p className="mt-1 text-xs text-slate-600">
                Academic programs and courses under this faculty
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-slate-600 transition hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {faculty?.description && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-700">
              About this faculty
            </p>

            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-500">
              {faculty.description}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          programs.length > 0 && (
            <div className="mb-5 flex justify-end">
              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search courses..."
                  className="w-full rounded-xl border border-white/[0.07] bg-[#0b1220] py-3 pl-9 pr-9 text-xs font-semibold text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/20"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-700 hover:bg-white/[0.05] hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              size={25}
              className="animate-spin text-cyan-400"
            />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.035] p-5">
            <p className="text-sm leading-7 text-red-300">
              {error}
            </p>
          </div>
        ) : filteredPrograms.length >
          0 ? (
          <motion.div
            variants={
              staggerContainer
            }
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredPrograms.map(
              (
                program,
                index
              ) => (
                <ProgramCard
                  key={
                    program?.id ||
                    `${faculty?.id}-program-${index}`
                  }
                  program={program}
                  index={index}
                />
              )
            )}
          </motion.div>
        ) : search ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm font-semibold text-slate-600">
              No matching course found.
            </p>
          </div>
        ) : null}
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

  const [
    selectedFaculty,
    setSelectedFaculty,
  ] = useState(null);

  const [
    facultyPrograms,
    setFacultyPrograms,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    facultyLoading,
    setFacultyLoading,
  ] = useState(false);

  const [
    programLoading,
    setProgramLoading,
  ] = useState(false);

  const [
    programError,
    setProgramError,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    facultySearch,
    setFacultySearch,
  ] = useState("");

  const [
    programSearch,
    setProgramSearch,
  ] = useState("");

  const [copied, setCopied] =
    useState(false);

  /* =======================================================
     LOAD UNIVERSITY + FACULTIES
  ======================================================= */

  useEffect(() => {
    if (!id) {
      setError(
        "University ID is missing."
      );

      setLoading(false);

      return;
    }

    loadUniversity();
  }, [id]);

  const loadUniversity =
    async () => {
      try {
        setLoading(true);
        setError("");
        setFacultyLoading(true);

        const {
          data: universityData,
          error: universityError,
        } = await supabase
          .from("universities")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (universityError) {
          throw universityError;
        }

        if (!universityData) {
          setUniversity(null);

          setError(
            "The university you're looking for does not exist."
          );

          return;
        }

        setUniversity(
          universityData
        );

        const {
          data: facultyData,
          error: facultyError,
        } = await supabase
          .from("school_faculties")
          .select("*")
          .eq(
            "school_id",
            universityData.id
          )
          .order(
            "display_order",
            {
              ascending: true,
            }
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (facultyError) {
          console.error(
            "Fetch Faculties Error:",
            facultyError
          );

          setFaculties([]);
        } else {
          setFaculties(
            Array.isArray(
              facultyData
            )
              ? facultyData
              : []
          );
        }
      } catch (err) {
        console.error(
          "University Details Error:",
          err
        );

        setUniversity(null);

        setError(
          err?.message ||
            "Unable to load university."
        );
      } finally {
        setFacultyLoading(false);
        setLoading(false);
      }
    };

  /* =======================================================
     LOAD FACULTY COURSES
  ======================================================= */

  const loadFacultyPrograms =
    async (faculty) => {
      if (!faculty?.id) {
        setFacultyPrograms([]);

        setProgramError(
          "This faculty does not have a valid ID."
        );

        return;
      }

      try {
        setProgramLoading(true);
        setProgramError("");
        setFacultyPrograms([]);

        const {
          data,
          error: facultyError,
        } = await supabase
          .from("school_faculties")
          .select(
            "id, name, description, course_list"
          )
          .eq(
            "id",
            faculty.id
          )
          .maybeSingle();

        if (facultyError) {
          throw facultyError;
        }

        if (!data) {
          setFacultyPrograms([]);
          return;
        }

        let courseList =
          data.course_list;

        if (
          typeof courseList ===
          "string"
        ) {
          try {
            courseList =
              JSON.parse(
                courseList
              );
          } catch (parseError) {
            console.error(
              "course_list JSON parse error:",
              parseError
            );

            courseList = [];
          }
        }

        if (
          courseList &&
          !Array.isArray(
            courseList
          ) &&
          typeof courseList ===
            "object"
        ) {
          courseList =
            courseList.courses ||
            courseList.programs ||
            courseList.course_list ||
            [];
        }

        if (
          !Array.isArray(
            courseList
          )
        ) {
          courseList = [];
        }

        const normalizedCourses =
          courseList
            .filter(
              (course) =>
                course !==
                  null &&
                course !==
                  undefined
            )
            .map(
              (
                course,
                index
              ) => {
                if (
                  typeof course ===
                  "string"
                ) {
                  return {
                    id: `${faculty.id}-course-${index + 1}`,
                    faculty_id:
                      faculty.id,
                    name: course,
                  };
                }

                return {
                  ...course,

                  id:
                    course?.id ||
                    `${faculty.id}-course-${index + 1}`,

                  faculty_id:
                    faculty.id,

                  name:
                    course?.name ||
                    course?.course_name ||
                    course?.title ||
                    course?.course ||
                    "Unnamed Course",

                  short_name:
                    course?.short_name ||
                    course?.shortName ||
                    course?.code ||
                    course?.course_code ||
                    "",

                  description:
                    course?.description ||
                    course?.details ||
                    course?.overview ||
                    "",

                  degree_type:
                    course?.degree_type ||
                    course?.degreeType ||
                    course?.degree ||
                    "",

                  duration:
                    course?.duration ||
                    "",

                  study_mode:
                    course?.study_mode ||
                    course?.studyMode ||
                    "",

                  admission_requirements:
                    course?.admission_requirements ||
                    course?.admissionRequirements ||
                    course?.requirements ||
                    "",

                  department:
                    course?.department ||
                    course?.department_name ||
                    "",

                  entry_mode:
                    course?.entry_mode ||
                    course?.entryMode ||
                    "",

                  accreditation:
                    course?.accreditation ||
                    course?.accredited_by ||
                    "",
                };
              }
            );

        setFacultyPrograms(
          normalizedCourses
        );
      } catch (err) {
        console.error(
          "Faculty Courses Error:",
          err
        );

        setFacultyPrograms([]);

        setProgramError(
          err?.message ||
            "Unable to load academic programs for this faculty."
        );
      } finally {
        setProgramLoading(false);
      }
    };

  /* =======================================================
     FACULTY CLICK
  ======================================================= */

  const handleFacultyClick =
    async (faculty) => {
      if (!faculty?.id) {
        console.error(
          "Faculty clicked without ID:",
          faculty
        );

        return;
      }

      if (
        selectedFaculty?.id ===
        faculty.id
      ) {
        setSelectedFaculty(
          null
        );

        setFacultyPrograms(
          []
        );

        setProgramError("");

        setProgramSearch("");

        return;
      }

      setSelectedFaculty(
        faculty
      );

      setFacultyPrograms(
        []
      );

      setProgramError("");

      setProgramSearch("");

      await loadFacultyPrograms(
        faculty
      );

      requestAnimationFrame(
        () => {
          document
            .getElementById(
              `faculty-${faculty.id}`
            )
            ?.scrollIntoView({
              behavior:
                "smooth",
              block: "center",
            });
        }
      );
    };

  /* =======================================================
     UNIVERSITY DATA
  ======================================================= */

  const universityName =
    useMemo(
      () =>
        university?.name ||
        "Unnamed University",
      [university]
    );

  const universityDescription =
    useMemo(
      () =>
        university?.description ||
        "Explore this institution, its faculties, academic programs and available information.",
      [university]
    );

  const universityAbout =
    useMemo(
      () =>
        university?.about ||
        university?.description ||
        "This institution provides academic opportunities across a range of disciplines.",
      [university]
    );

  const universityLocation =
    useMemo(() => {
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
      return (
        university?.short_name ||
        university?.shortName ||
        university?.acronym ||
        university?.code ||
        universityName
          .split(/\s+/)
          .filter(Boolean)
          .map(
            (word) =>
              word[0]
          )
          .join("")
          .slice(0, 6)
          .toUpperCase()
      );
    }, [
      university,
      universityName,
    ]);

  const universityImage =
    university?.cover_url ||
    university?.image_url ||
    university?.image ||
    null;

  const universityLogo =
    university?.logo_url ||
    university?.logo ||
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

  /* =======================================================
     FACULTY STATS
  ======================================================= */

  const activeFacultyCount =
    useMemo(
      () =>
        faculties.filter(
          (faculty) =>
            faculty?.active ===
              true ||
            faculty?.active ===
              "true" ||
            faculty?.status ===
              "active"
        ).length,
      [faculties]
    );

  /* =======================================================
     FACULTY SEARCH
  ======================================================= */

  const filteredFaculties =
    useMemo(() => {
      const query =
        facultySearch
          .trim()
          .toLowerCase();

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
            name.includes(
              query
            ) ||
            description.includes(
              query
            )
          );
        }
      );
    }, [
      faculties,
      facultySearch,
    ]);

  /* =======================================================
     WEBSITE
  ======================================================= */

  const websiteUrl =
    useMemo(() => {
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

  const handleCopyEmail =
    async () => {
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
     SCROLL
  ======================================================= */

  const scrollToFaculties =
    () => {
      document
        .getElementById(
          "faculties"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    };

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (
    !loading &&
    !university
  ) {
    return (
      <div className="min-h-screen bg-[#03050a] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/universities"
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-400 transition-all hover:border-cyan-400/20 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Back to Universities
          </button>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0a1020] px-6 py-20 text-center shadow-2xl">
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
                navigate(
                  "/universities"
                )
              }
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-black text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              <ArrowLeft
                size={17}
              />

              Browse Universities
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03050a] px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="h-[500px] animate-pulse rounded-[2.25rem] border border-white/[0.06] bg-white/[0.025]" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025]"
              />
            ))}
          </div>

          <div className="flex flex-col items-center justify-center py-16">
            <Loader2
              size={28}
              className="animate-spin text-cyan-400"
            />

            <p className="mt-4 text-sm font-bold text-slate-600">
              Loading university profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03050a] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.025] blur-[150px]" />

        <div className="absolute right-[-12%] top-[20%] h-[550px] w-[550px] rounded-full bg-blue-600/[0.025] blur-[150px]" />

        <div className="absolute bottom-[-15%] left-[30%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.018] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:
              "32px 32px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* BACK */}

        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          className="mb-6"
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/universities"
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-sm font-bold text-slate-500 backdrop-blur-xl transition-all hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />

            Universities
          </button>
        </motion.div>

        {/* HERO */}

        <motion.section
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            ease: "easeOut",
          }}
          className="relative mb-7 overflow-hidden rounded-[2.25rem] border border-white/[0.09] bg-[#080d19] shadow-[0_35px_120px_rgba(0,0,0,0.4)]"
        >
          <div className="relative h-[500px] sm:h-[560px] lg:h-[600px]">
            {universityImage ? (
              <img
                src={universityImage}
                alt={universityName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#101a31] via-[#080d19] to-[#03050a]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-[#040711]/65 to-[#040711]/10" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#040711]/80 via-[#040711]/20 to-transparent" />

            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />

            {/* LOGO */}

            <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-950/75 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:h-24 sm:w-24">
                {universityLogo ? (
                  <img
                    src={universityLogo}
                    alt={`${universityName} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2
                    size={36}
                    className="text-slate-600"
                  />
                )}
              </div>
            </div>

            {/* TYPE */}

            <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/65 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.17em] text-cyan-300 backdrop-blur-xl">
                <Sparkles
                  size={12}
                />

                {universityType}
              </div>
            </div>

            {/* HERO CONTENT */}

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:p-11">
              <div className="max-w-5xl">
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-cyan-300">
                    {universityShortName}
                  </span>

                  {activeFacultyCount >
                    0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400">
                      <CheckCircle2
                        size={11}
                      />

                      Institution Listed
                    </span>
                  )}
                </div>

                <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
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

          {/* ACTION BAR */}

          <div className="flex flex-col gap-3 border-t border-white/[0.07] bg-[#050914]/95 p-5 backdrop-blur-xl sm:flex-row sm:flex-wrap sm:p-6">
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                <Globe2
                  size={17}
                />

                Official Website

                <ExternalLink
                  size={14}
                />
              </a>
            )}

            <button
              type="button"
              onClick={
                scrollToFaculties
              }
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-5 py-3.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.06]"
            >
              Explore Faculties

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </motion.section>

        {/* QUICK STATS */}

        <motion.div
          variants={
            staggerContainer
          }
          initial="hidden"
          animate="visible"
          className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <InfoStat
            icon={GraduationCap}
            label="Institution"
            value={
              universityShortName
            }
            accent="cyan"
          />

          <InfoStat
            icon={MapPin}
            label="Location"
            value={
              universityState
            }
            accent="blue"
          />

          <InfoStat
            icon={Building2}
            label="Faculties"
            value={
              faculties.length
            }
            accent="emerald"
          />

          <InfoStat
            icon={BookOpen}
            label="Faculty Programs"
            value={
              selectedFaculty
                ? facultyPrograms.length
                : "Select faculty"
            }
            accent="violet"
          />
        </motion.div>

        {/* MAIN GRID */}

        <motion.div
          variants={
            staggerContainer
          }
          initial="hidden"
          animate="visible"
          className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]"
        >
          {/* LEFT */}

          <div className="min-w-0 space-y-7">
            {/* ABOUT */}

            <SectionCard
              icon={Building2}
              title="About the University"
              description="An overview of the institution and its academic identity."
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060b15] p-5 sm:p-6">
                <div className="absolute left-0 top-6 h-12 w-1 rounded-r-full bg-cyan-400/60" />

                <p className="whitespace-pre-line pl-4 text-sm leading-8 text-slate-400 sm:text-[15px]">
                  {universityAbout}
                </p>
              </div>
            </SectionCard>

            {/* FACULTIES */}

            <div
              id="faculties"
              className="scroll-mt-24"
            >
              <SectionCard
                icon={
                  GraduationCap
                }
                title="Faculties & Academic Programs"
                description={
                  facultyLoading
                    ? "Loading academic faculties..."
                    : `${faculties.length} ${
                        faculties.length ===
                        1
                          ? "faculty"
                          : "faculties"
                      } currently listed. Select a faculty to see the academic programs added by the administrator.`
                }
              >
                {/* FACULTY SEARCH */}

                {faculties.length >
                  0 && (
                  <div className="mb-5">
                    <div className="relative">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-700"
                      />

                      <input
                        type="text"
                        value={
                          facultySearch
                        }
                        onChange={(
                          event
                        ) =>
                          setFacultySearch(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Search faculties..."
                        className="w-full rounded-2xl border border-white/[0.07] bg-[#060b15] py-3.5 pl-11 pr-11 text-sm font-semibold text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/20"
                      />

                      {facultySearch && (
                        <button
                          type="button"
                          onClick={() =>
                            setFacultySearch(
                              ""
                            )
                          }
                          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-700 hover:bg-white/[0.05] hover:text-white"
                        >
                          <X
                            size={
                              14
                            }
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* FACULTY LIST */}

                <AnimatePresence
                  mode="wait"
                >
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
                      className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#060b15] py-14"
                    >
                      <Loader2
                        size={26}
                        className="animate-spin text-cyan-400"
                      />

                      <p className="mt-4 text-sm font-bold text-slate-600">
                        Loading faculties...
                      </p>
                    </motion.div>
                  ) : faculties.length ===
                    0 ? (
                    <motion.div
                      key="faculty-empty"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      className="rounded-2xl border border-dashed border-white/[0.08] bg-[#060b15] px-6 py-14 text-center"
                    >
                      <GraduationCap
                        size={28}
                        className="mx-auto text-slate-700"
                      />

                      <h3 className="mt-5 font-black text-white">
                        No faculties listed yet
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                        Faculty information for this institution has not been added yet.
                      </p>
                    </motion.div>
                  ) : filteredFaculties.length ===
                    0 ? (
                    <motion.div
                      key="faculty-search-empty"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      className="rounded-2xl border border-dashed border-white/[0.08] bg-[#060b15] px-6 py-12 text-center"
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
                    <motion.div
                      key="faculty-list"
                      variants={
                        staggerContainer
                      }
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {filteredFaculties.map(
                        (
                          faculty,
                          index
                        ) => (
                          <div
                            key={
                              faculty.id
                            }
                            id={`faculty-${faculty.id}`}
                            className="scroll-mt-24"
                          >
                            <FacultyCard
                              faculty={
                                faculty
                              }
                              index={
                                index
                              }
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

                            <AnimatePresence
                              mode="wait"
                            >
                              {selectedFaculty?.id ===
                                faculty.id && (
                                <FacultyProgramPanel
                                  key={`programs-${faculty.id}`}
                                  faculty={
                                    faculty
                                  }
                                  programs={
                                    facultyPrograms
                                  }
                                  loading={
                                    programLoading
                                  }
                                  error={
                                    programError
                                  }
                                  search={
                                    programSearch
                                  }
                                  setSearch={
                                    setProgramSearch
                                  }
                                  onClose={() => {
                                    setSelectedFaculty(
                                      null
                                    );

                                    setFacultyPrograms(
                                      []
                                    );

                                    setProgramError(
                                      ""
                                    );

                                    setProgramSearch(
                                      ""
                                    );
                                  }}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="min-w-0 space-y-7">
            {/* ADMISSION */}

            <SectionCard
              icon={
                ClipboardCheck
              }
              title="Admission"
              description="Important information before applying."
            >
              {university?.admission ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                  {
                    university.admission
                  }
                </p>
              ) : (
                <p className="text-sm leading-7 text-slate-600">
                  Admission information for this institution has not been added yet.
                </p>
              )}

              <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.045] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-cyan-400"
                  />

                  <p className="text-xs leading-6 text-cyan-300/80">
                    Always verify current admission requirements directly with the institution before applying.
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
                <p className="text-sm leading-7 text-slate-600">
                  Fee information for this institution has not been added yet.
                </p>
              )}

              <div className="mt-5 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-4">
                <div className="flex items-start gap-3">
                  <Wallet
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <p className="text-xs leading-6 text-amber-300/70">
                    Fees may change between academic sessions. Confirm current charges before making any payment.
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
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.06] bg-[#060b15] p-4">
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
                        {
                          universityAddress
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {universityPhone && (
                  <a
                    href={`tel:${universityPhone}`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#060b15] p-4 transition-all hover:border-cyan-400/15 hover:bg-white/[0.025]"
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

                      <p className="mt-1.5 truncate text-sm font-semibold text-slate-400 group-hover:text-white">
                        {
                          universityPhone
                        }
                      </p>
                    </div>
                  </a>
                )}

                {universityEmail && (
                  <div className="rounded-2xl border border-white/[0.06] bg-[#060b15] p-4">
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
                          >
                            {copied ? (
                              <Check
                                size={
                                  14
                                }
                              />
                            ) : (
                              <Copy
                                size={
                                  14
                                }
                              />
                            )}
                          </button>
                        </div>

                        <a
                          href={`mailto:${universityEmail}`}
                          className="mt-1.5 block break-all text-sm font-semibold text-slate-400 transition-colors hover:text-cyan-400"
                        >
                          {
                            universityEmail
                          }
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {!universityPhone &&
                  !universityEmail && (
                    <div className="rounded-2xl border border-dashed border-white/[0.07] bg-[#060b15] p-6 text-center">
                      <Phone
                        size={23}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-3 text-sm text-slate-600">
                        Contact information has not been added yet.
                      </p>
                    </div>
                  )}
              </div>
            </SectionCard>

            {/* WEBSITE */}

            {websiteUrl && (
              <motion.a
                variants={fadeUp}
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] to-blue-500/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/[0.05] blur-3xl" />

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
                      className="text-slate-700 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
                    />
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.17em] text-cyan-400/70">
                    Official Institution
                  </p>

                  <h3 className="mt-1 font-black text-white">
                    Visit official website
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    Get the latest information directly from the institution.
                  </p>
                </div>
              </motion.a>
            )}
          </aside>
        </motion.div>

        {/* TRUST */}

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
          className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-6"
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
                Information displayed on this profile is loaded from the institution records available in the platform. Confirm important admission, fee and application details with the institution.
              </p>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM NAVIGATION */}

        <div className="flex justify-center py-12">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/universities"
              )
            }
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-6 py-3.5 text-sm font-black text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to All Universities
          </button>
        </div>

        {/* FOOTER */}

        <footer className="border-t border-white/[0.06] py-8 text-center">
          <p className="text-xs font-semibold text-slate-700">
            University information powered by Scholiqen.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default UniversityDetails;
