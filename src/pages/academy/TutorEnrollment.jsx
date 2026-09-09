import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Clock3,
  FileText,
  AlertCircle,
  Send,
  LogIn,
  Plus,
  X,
  Layers3,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_BASE_URL = `${API_URL}/api/academy`;

const ASSIGNMENTS_URL = `${API_BASE_URL}/tutor/assignments`;

const TASKS_URL = `${API_BASE_URL}/tutor/class-activities`;


const TUTOR_APPLICATION_URL =
  `${API_URL}/api/academy/tutor-application`;

/* =========================================================
   CONSTANTS
========================================================= */

const STEPS = [
  {
    id: 1,
    title: "Personal",
    icon: User,
  },
  {
    id: 2,
    title: "Teaching",
    icon: BookOpen,
  },
  {
    id: 3,
    title: "Qualifications",
    icon: GraduationCap,
  },
  {
    id: 4,
    title: "Availability",
    icon: CalendarDays,
  },
  {
    id: 5,
    title: "Review",
    icon: CheckCircle2,
  },
];

/* =========================================================
   SUBJECTS
========================================================= */

const PRIMARY_SUBJECTS = [
  "English Studies",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Computer Studies",
  "Social Studies",
  "Civic Education",
  "PHE",
  "Agricultural Science",
  "CCA",
  "CRS",
  "IRS",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Home Economics",
  "Music",
  "Handwriting",
  "Verbal Reasoning",
  "Quantitative Reasoning",
  "Health Education",
  "Moral Instruction",
  "Environmental Studies",
  "Literacy",
  "Numeracy",
];

const JSS_SUBJECTS = [
  "English Studies",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Computer Studies",
  "Business Studies",
  "Social Studies",
  "Civic Education",
  "Agricultural Science",
  "Home Economics",
  "CCA",
  "CRS",
  "IRS",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
  "PHE",
  "Music",
  "Fine Art",
  "History",
  "Geography",
  "Security Education",
  "Entrepreneurship",
  "Arabic",
];

const SSS_SUBJECTS = [
  "English Language",
  "Literature in English",
  "Mathematics",
  "Further Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Economics",
  "Government",
  "Geography",
  "Commerce",
  "Financial Accounting",
  "Marketing",
  "Insurance",
  "Office Practice",
  "Computer Science",
  "Data Processing",
  "Information Technology",
  "Civic Education",
  "CRS",
  "IRS",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Arabic",
  "Visual Arts",
  "Music",
  "Home Management",
  "Food & Nutrition",
  "Technical Drawing",
  "Building Construction",
  "Auto Mechanics",
  "Electrical Installation",
  "Electronics",
  "Woodwork",
  "Metalwork",
  "Clothing & Textiles",
  "Animal Husbandry",
  "Fishery",
  "Health Education",
  "Physical Education",
  "Photography",
  "Tourism",
  "Data Analysis",
];

/* =========================================================
   LEVELS
========================================================= */

const LEVELS = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

/* =========================================================
   QUALIFICATIONS
========================================================= */

const QUALIFICATIONS = [
  "NCE",
  "OND",
  "HND",
  "B.Ed",
  "B.Sc",
  "B.A",
  "B.Tech",
  "PGDE",
  "M.Ed",
  "M.Sc",
  "M.A",
  "Ph.D",
  "Other",
];

/* =========================================================
   DAYS
========================================================= */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",

  address: "",
  city: "",
  state: "",

  teachingLevel: [],
  subjects: [],

  /*
   * IMPORTANT:
   * This now stores the EXACT class → subject relationship.
   *
   * Example:
   *
   * [
   *   {
   *     class: "JSS 1",
   *     subjects: ["Mathematics", "English Studies"]
   *   },
   *   {
   *     class: "JSS 2",
   *     subjects: ["Physics"]
   *   }
   * ]
   */
  assignments: [],

  yearsExperience: "",
  currentOccupation: "",

  highestQualification: "",
  institution: "",
  courseOfStudy: "",
  graduationYear: "",
  professionalCertification: "",

  availableDays: [],
  availableFrom: "",
  availableTo: "",
  preferredMode: "",

  motivation: "",
  teachingExperience: "",

  agreement: false,
};

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  return String(value ?? "").trim();
}

function getLevelType(level) {
  if (level.startsWith("Primary")) {
    return "primary";
  }

  if (level.startsWith("JSS")) {
    return "jss";
  }

  if (level.startsWith("SS")) {
    return "sss";
  }

  return "primary";
}

function getSubjectsForLevel(level) {
  const type = getLevelType(level);

  if (type === "primary") {
    return PRIMARY_SUBJECTS;
  }

  if (type === "jss") {
    return JSS_SUBJECTS;
  }

  return SSS_SUBJECTS;
}

function uniqueArray(values) {
  return [...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  )];
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
      />
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">*</span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
      >
        <option
          value=""
          className="bg-slate-950"
        >
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-slate-950"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">*</span>
        )}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
      />
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorText({ children }) {
  if (!children) {
    return null;
  }

  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle size={13} />
      {children}
    </p>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW ITEM
========================================================= */

function ReviewItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {value || "Not provided"}
      </p>
    </div>
  );
}

/* =========================================================
   LEVEL BUTTON
========================================================= */

function LevelButton({
  level,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-2xl border px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200 shadow-lg shadow-cyan-500/5"
          : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-cyan-400/20 hover:bg-white/[0.04]"
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
            active
              ? "border-cyan-400 bg-cyan-400 text-slate-950"
              : "border-slate-700"
          }`}
        >
          {active && (
            <Check
              size={13}
              strokeWidth={3}
            />
          )}
        </span>

        {level}
      </span>
    </button>
  );
}

/* =========================================================
   SUBJECT BUTTON
========================================================= */

function SubjectButton({
  subject,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
        active
          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
          : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/[0.04]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          active
            ? "border-cyan-400 bg-cyan-400 text-slate-950"
            : "border-slate-700"
        }`}
      >
        {active && (
          <Check
            size={13}
            strokeWidth={3}
          />
        )}
      </span>

      {subject}
    </button>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorEnrollment() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState(
    INITIAL_FORM
  );

  const [errors, setErrors] = useState({});

  const [submitError, setSubmitError] =
    useState("");

  const [alreadyRegistered, setAlreadyRegistered] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [
    applicationReference,
    setApplicationReference,
  ] = useState("");

  /* =========================================================
     SELECTED LEVELS
  ========================================================= */

  const selectedLevels = useMemo(
    () => form.teachingLevel || [],
    [form.teachingLevel]
  );

  /* =========================================================
     SELECTED SUBJECTS
  ========================================================= */

  const selectedSubjects = useMemo(
    () => form.subjects || [],
    [form.subjects]
  );

  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
    setAlreadyRegistered(false);
  };

  /* =========================================================
     TOGGLE LEVEL
     
     IMPORTANT:
     Selecting a class creates an assignment object.
     
     Example:
     
     JSS 1
     
     becomes:
     
     {
       class: "JSS 1",
       subjects: []
     }
  ========================================================= */

  const toggleLevel = (level) => {
    setForm((prev) => {
      const exists =
        prev.teachingLevel.includes(level);

      if (exists) {
        const newLevels =
          prev.teachingLevel.filter(
            (item) => item !== level
          );

        const newAssignments =
          prev.assignments.filter(
            (assignment) =>
              assignment.class !== level
          );

        const newSubjects =
          newAssignments.flatMap(
            (assignment) =>
              assignment.subjects || []
          );

        return {
          ...prev,
          teachingLevel: newLevels,
          assignments: newAssignments,
          subjects: uniqueArray(newSubjects),
        };
      }

      return {
        ...prev,

        teachingLevel: [
          ...prev.teachingLevel,
          level,
        ],

        assignments: [
          ...prev.assignments,
          {
            class: level,
            subjects: [],
          },
        ],
      };
    });

    setErrors((prev) => ({
      ...prev,
      teachingLevel: "",
      assignments: "",
      subjects: "",
    }));

    setSubmitError("");
  };

  /* =========================================================
     TOGGLE SUBJECT FOR SPECIFIC CLASS
  ========================================================= */

  const toggleSubjectForClass = (
    level,
    subject
  ) => {
    setForm((prev) => {
      const assignments =
        Array.isArray(prev.assignments)
          ? [...prev.assignments]
          : [];

      const assignmentIndex =
        assignments.findIndex(
          (item) =>
            item.class === level
        );

      if (assignmentIndex === -1) {
        return prev;
      }

      const currentSubjects =
        Array.isArray(
          assignments[assignmentIndex].subjects
        )
          ? assignments[
              assignmentIndex
            ].subjects
          : [];

      const exists =
        currentSubjects.includes(subject);

      const nextSubjects = exists
        ? currentSubjects.filter(
            (item) => item !== subject
          )
        : [
            ...currentSubjects,
            subject,
          ];

      assignments[
        assignmentIndex
      ] = {
        ...assignments[assignmentIndex],
        subjects: nextSubjects,
      };

      const allSubjects =
        assignments.flatMap(
          (assignment) =>
            assignment.subjects || []
        );

      return {
        ...prev,
        assignments,
        subjects: uniqueArray(allSubjects),
      };
    });

    setErrors((prev) => ({
      ...prev,
      assignments: "",
      subjects: "",
    }));

    setSubmitError("");
  };

  /* =========================================================
     GET SUBJECTS FOR CLASS
  ========================================================= */

  const getSelectedSubjectsForClass = (
    level
  ) => {
    const assignment =
      form.assignments.find(
        (item) =>
          item.class === level
      );

    return assignment?.subjects || [];
  };

  /* =========================================================
     TOGGLE DAY
  ========================================================= */

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists =
        prev.availableDays.includes(day);

      return {
        ...prev,

        availableDays: exists
          ? prev.availableDays.filter(
              (item) => item !== day
            )
          : [
              ...prev.availableDays,
              day,
            ],
      };
    });

    setErrors((prev) => ({
      ...prev,
      availableDays: "",
    }));
  };

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    updateField(
      name,
      type === "checkbox"
        ? checked
        : value
    );
  };

  /* =========================================================
     VALIDATE ASSIGNMENTS
  ========================================================= */

  const hasValidAssignments = () => {
    if (
      !Array.isArray(
        form.assignments
      ) ||
      form.assignments.length === 0
    ) {
      return false;
    }

    return form.assignments.every(
      (assignment) =>
        clean(assignment.class) &&
        Array.isArray(
          assignment.subjects
        ) &&
        assignment.subjects.length > 0
    );
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateStep = (
    currentStep
  ) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!clean(form.firstName)) {
        nextErrors.firstName =
          "First name is required.";
      }

      if (!clean(form.lastName)) {
        nextErrors.lastName =
          "Last name is required.";
      }

      if (!clean(form.email)) {
        nextErrors.email =
          "Email address is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          clean(form.email)
        )
      ) {
        nextErrors.email =
          "Enter a valid email address.";
      }

      if (!clean(form.phone)) {
        nextErrors.phone =
          "Phone number is required.";
      }

      if (!clean(form.gender)) {
        nextErrors.gender =
          "Please select your gender.";
      }
    }

    if (currentStep === 2) {
      if (
        !Array.isArray(
          form.teachingLevel
        ) ||
        form.teachingLevel.length === 0
      ) {
        nextErrors.teachingLevel =
          "Select at least one teaching level.";
      }

      if (!hasValidAssignments()) {
        nextErrors.assignments =
          "Select at least one subject for every teaching level you selected.";
      }

      if (
        !Array.isArray(
          form.subjects
        ) ||
        form.subjects.length === 0
      ) {
        nextErrors.subjects =
          "Select at least one subject.";
      }

      if (
        !clean(
          form.yearsExperience
        )
      ) {
        nextErrors.yearsExperience =
          "Enter your years of teaching experience.";
      }

      if (
        !clean(
          form.currentOccupation
        )
      ) {
        nextErrors.currentOccupation =
          "Enter your current occupation.";
      }
    }

    if (currentStep === 3) {
      if (
        !clean(
          form.highestQualification
        )
      ) {
        nextErrors.highestQualification =
          "Select your highest qualification.";
      }

      if (!clean(form.institution)) {
        nextErrors.institution =
          "Enter your institution.";
      }

      if (
        !clean(
          form.courseOfStudy
        )
      ) {
        nextErrors.courseOfStudy =
          "Enter your course of study.";
      }
    }

    if (currentStep === 4) {
      if (
        !Array.isArray(
          form.availableDays
        ) ||
        form.availableDays.length === 0
      ) {
        nextErrors.availableDays =
          "Select at least one available day.";
      }

      if (
        !clean(form.availableFrom)
      ) {
        nextErrors.availableFrom =
          "Select your starting time.";
      }

      if (!clean(form.availableTo)) {
        nextErrors.availableTo =
          "Select your ending time.";
      }

      if (
        !clean(form.preferredMode)
      ) {
        nextErrors.preferredMode =
          "Select your preferred teaching mode.";
      }
    }

    if (currentStep === 5) {
      if (!clean(form.motivation)) {
        nextErrors.motivation =
          "Tell us why you want to become a tutor.";
      }

      if (
        !clean(
          form.teachingExperience
        )
      ) {
        nextErrors.teachingExperience =
          "Tell us about your teaching experience.";
      }

      if (!form.agreement) {
        nextErrors.agreement =
          "You must agree to the tutor terms.";
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  /* =========================================================
     NEXT
  ========================================================= */

  const nextStep = () => {
    setSubmitError("");

    if (!validateStep(step)) {
      return;
    }

    if (step < STEPS.length) {
      setStep((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =========================================================
     PREVIOUS
  ========================================================= */

  const previousStep = () => {
    setSubmitError("");

    if (step > 1) {
      setStep((prev) => prev - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSubmitError("");
    setAlreadyRegistered(false);

    if (!validateStep(5)) {
      return;
    }

    /*
     * Extra safety check.
     *
     * We never want to send separate classes and
     * subjects without the exact relationship.
     */
    if (!hasValidAssignments()) {
      setSubmitError(
        "Please select at least one subject for every class you selected."
      );

      setStep(2);

      return;
    }

    setSubmitting(true);

    try {
      /*
       * Clean the exact assignments before sending them.
       */
      const assignments =
        form.assignments
          .map((assignment) => ({
            class: clean(
              assignment.class
            ),

            subjects:
              uniqueArray(
                assignment.subjects
              ),
          }))
          .filter(
            (assignment) =>
              assignment.class &&
              assignment.subjects
                .length > 0
          );

      /*
       * Flatten subjects for backward compatibility.
       */
      const subjects =
        uniqueArray(
          assignments.flatMap(
            (assignment) =>
              assignment.subjects
          )
        );

      /*
       * Classes are now taken directly from
       * the exact assignment list.
       */
      const teachingLevel =
        uniqueArray(
          assignments.map(
            (assignment) =>
              assignment.class
          )
        );

      const payload = {
        ...form,

        /*
         * =====================================================
         * EXACT CLASS → SUBJECT ASSIGNMENTS
         * =====================================================
         */
        assignments,

        /*
         * Backward compatibility.
         */
        teachingLevel,
        subjects,

        applicationType: "tutor",
        status: "pending",

        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,

        teaching_level:
          teachingLevel,

        subjects_taught:
          subjects,

        /*
         * Also send assignments under snake_case
         * in case the backend uses that convention.
         */
        teaching_assignments:
          assignments,

        class_subject_assignments:
          assignments,

        years_experience:
          form.yearsExperience,

        current_occupation:
          form.currentOccupation,

        highest_qualification:
          form.highestQualification,

        institution_name:
          form.institution,

        course_of_study:
          form.courseOfStudy,

        graduation_year:
          form.graduationYear,

        professional_certification:
          form.professionalCertification,

        available_days:
          form.availableDays,

        available_from:
          form.availableFrom,

        available_to:
          form.availableTo,

        preferred_mode:
          form.preferredMode,

        teaching_experience:
          form.teachingExperience,

        motivation:
          form.motivation,

        email:
          clean(form.email)
            .toLowerCase(),
      };

      console.log(
        "TUTOR APPLICATION PAYLOAD:",
        payload
      );

      const response =
        await fetch(
          TUTOR_APPLICATION_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

      const rawText =
        await response.text();

      let data = {};

      try {
        data = rawText
          ? JSON.parse(rawText)
          : {};
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      /* =====================================================
         ALREADY REGISTERED
      ===================================================== */

      if (
        response.status === 409 ||
        data.code ===
          "ALREADY_REGISTERED"
      ) {
        setAlreadyRegistered(true);

        setSubmitError(
          data.message ||
            "You are already registered as a tutor. Please sign in to your account."
        );

        setSubmitting(false);

        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to submit your application."
        );
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      const reference =
        data.applicationReference ||
        data.reference ||
        data.applicationId ||
        data.id ||
        "";

      setApplicationReference(
        reference
      );

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "TUTOR APPLICATION ERROR:",
        error
      );

      setSubmitError(
        error?.message ||
          "Something went wrong while submitting your application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

          <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-violet-500/10 blur-[140px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 py-16">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            className="w-full rounded-[32px] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
          >
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 size={40} />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              Application Received
            </p>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Thank You,{" "}
              {form.firstName}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400">
              Your tutor registration
              has been received
              successfully. Our Academy
              team will review your
              application.
            </p>

            {applicationReference && (
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Application Reference
                </p>

                <p className="mt-2 break-all font-mono text-lg font-bold text-cyan-300">
                  {
                    applicationReference
                  }
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-5 text-left">
                <Mail
                  size={20}
                  className="text-cyan-300"
                />

                <h3 className="mt-3 font-semibold text-white">
                  Watch Your Email
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep an eye on your
                  email for important
                  Academy updates.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-5 text-left">
                <ShieldCheck
                  size={20}
                  className="text-emerald-300"
                />

                <h3 className="mt-3 font-semibold text-white">
                  Approval Required
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your application must
                  be approved before you
                  can begin tutoring.
                </p>
              </div>
            </div>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/academy/login"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-3.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/15"
              >
                <LogIn size={17} />
                Go to Academy Login
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/academy"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06]"
              >
                Return to Academy
                <ArrowRight size={17} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:
              "28px 28px",
          }}
        />

        <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute right-[-200px] top-[300px] h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/academy")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Academy
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <Sparkles
              size={16}
              className="text-cyan-300"
            />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Scholiqen Academy
            </span>
          </div>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="mb-10 max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold text-cyan-300">
            <Award size={14} />
            Tutor Registration
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Become a Scholiqen Tutor
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Share your knowledge,
            inspire learners, and become
            part of the Scholiqen Academy
            teaching community.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">
              Already registered as a
              tutor?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/login"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"
            >
              <LogIn size={15} />
              Sign in to your account
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* =====================================================
            PROGRESS
        ===================================================== */}

        <div className="mb-8 rounded-3xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map(
              (item, index) => {
                const Icon =
                  item.icon;

                const active =
                  step === item.id;

                const completed =
                  step > item.id;

                return (
                  <React.Fragment
                    key={item.id}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          item.id <
                          step
                        ) {
                          setStep(
                            item.id
                          );
                        }
                      }}
                      className="flex min-w-0 items-center gap-2"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                          completed
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : active
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                            : "border-white/10 bg-white/[0.02] text-slate-600"
                        }`}
                      >
                        {completed ? (
                          <Check size={16} />
                        ) : (
                          <Icon
                            size={16}
                          />
                        )}
                      </span>

                      <span
                        className={`hidden text-xs font-semibold sm:block ${
                          active ||
                          completed
                            ? "text-slate-200"
                            : "text-slate-600"
                        }`}
                      >
                        {item.title}
                      </span>
                    </button>

                    {index <
                      STEPS.length -
                        1 && (
                      <div
                        className={`h-px flex-1 ${
                          step >
                          item.id
                            ? "bg-emerald-400/30"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              }
            )}
          </div>
        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <SectionTitle
                    icon={User}
                    title="Personal Information"
                    description="Tell us a little about yourself."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Input
                        label="First Name"
                        name="firstName"
                        value={
                          form.firstName
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your first name"
                        required
                      />

                      <ErrorText>
                        {
                          errors.firstName
                        }
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Middle Name"
                        name="middleName"
                        value={
                          form.middleName
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your middle name"
                      />
                    </div>

                    <div>
                      <Input
                        label="Last Name"
                        name="lastName"
                        value={
                          form.lastName
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your last name"
                        required
                      />

                      <ErrorText>
                        {
                          errors.lastName
                        }
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={
                          form.email
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="you@example.com"
                        required
                      />

                      <ErrorText>
                        {errors.email}
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Phone Number"
                        name="phone"
                        value={
                          form.phone
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="080..."
                        required
                      />

                      <ErrorText>
                        {errors.phone}
                      </ErrorText>
                    </div>

                    <div>
                      <Select
                        label="Gender"
                        name="gender"
                        value={
                          form.gender
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Select gender"
                        options={[
                          "Male",
                          "Female",
                          "Prefer not to say",
                        ]}
                        required
                      />

                      <ErrorText>
                        {errors.gender}
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={
                          form.dateOfBirth
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div>
                      <Input
                        label="City"
                        name="city"
                        value={
                          form.city
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Your city"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Address"
                        name="address"
                        value={
                          form.address
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your residential address"
                      />
                    </div>

                    <div>
                      <Input
                        label="State"
                        name="state"
                        value={
                          form.state
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Your state"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  STEP 2
              ================================================= */}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <SectionTitle
                    icon={BookOpen}
                    title="Teaching Information"
                    description="Choose your classes first, then select the exact subjects you teach for each class."
                  />

                  {/* =================================================
                      STEP 2 EXPLANATION
                  ================================================= */}

                  <div className="mb-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <Layers3
                          size={19}
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-cyan-200">
                          Tell us exactly
                          what you teach
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          Select a class and
                          then choose only the
                          subjects you teach that
                          class. These exact
                          class-subject
                          assignments will be
                          used when creating
                          your tutor classes and
                          tasks.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      LEVELS
                  ================================================= */}

                  <div>
                    <p className="mb-3 text-sm font-medium text-slate-300">
                      Teaching Levels

                      <span className="ml-1 text-cyan-400">
                        *
                      </span>
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {LEVELS.map(
                        (level) => (
                          <LevelButton
                            key={level}
                            level={level}
                            active={selectedLevels.includes(
                              level
                            )}
                            onClick={() =>
                              toggleLevel(
                                level
                              )
                            }
                          />
                        )
                      )}
                    </div>

                    <ErrorText>
                      {
                        errors.teachingLevel
                      }
                    </ErrorText>
                  </div>

                  {/* =================================================
                      EXACT CLASS SUBJECT ASSIGNMENTS
                  ================================================= */}

                  <div className="mt-8">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Subjects for Each Class

                          <span className="ml-1 text-cyan-400">
                            *
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Each class has its own
                          subject selection.
                        </p>
                      </div>

                      {selectedLevels.length >
                        0 && (
                        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                          {
                            selectedLevels.length
                          }{" "}
                          class
                          {selectedLevels.length !==
                          1
                            ? "es"
                            : ""}{" "}
                          selected
                        </div>
                      )}
                    </div>

                    {selectedLevels.length ===
                      0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                        <BookOpen
                          size={30}
                          className="mx-auto text-slate-700"
                        />

                        <p className="mt-3 text-sm font-medium text-slate-400">
                          Select a teaching
                          level first
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          The subjects for that
                          class will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {selectedLevels.map(
                          (level) => {
                            const subjects =
                              getSubjectsForLevel(
                                level
                              );

                            const selectedForClass =
                              getSelectedSubjectsForClass(
                                level
                              );

                            return (
                              <motion.div
                                key={level}
                                layout
                                initial={{
                                  opacity: 0,
                                  y: 10,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60"
                              >
                                {/* CLASS HEADER */}

                                <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                                      <GraduationCap
                                        size={20}
                                      />
                                    </div>

                                    <div>
                                      <p className="text-xs uppercase tracking-wider text-slate-600">
                                        Teaching
                                      </p>

                                      <h3 className="text-lg font-bold text-white">
                                        {level}
                                      </h3>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400">
                                      {
                                        selectedForClass.length
                                      }{" "}
                                      subject
                                      {selectedForClass.length !==
                                      1
                                        ? "s"
                                        : ""}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleLevel(
                                          level
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/5 text-red-400 transition hover:border-red-400/20 hover:bg-red-400/10"
                                      title={`Remove ${level}`}
                                    >
                                      <X
                                        size={
                                          15
                                        }
                                      />
                                    </button>
                                  </div>
                                </div>

                                {/* SUBJECTS */}

                                <div className="p-5">
                                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Subjects you teach
                                    in {level}
                                  </p>

                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {subjects.map(
                                      (
                                        subject
                                      ) => (
                                        <SubjectButton
                                          key={`${level}-${subject}`}
                                          subject={
                                            subject
                                          }
                                          active={selectedForClass.includes(
                                            subject
                                          )}
                                          onClick={() =>
                                            toggleSubjectForClass(
                                              level,
                                              subject
                                            )
                                          }
                                        />
                                      )
                                    )}
                                  </div>

                                  {selectedForClass.length >
                                    0 && (
                                    <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
                                      <div className="flex items-start gap-3">
                                        <CheckCircle2
                                          size={
                                            18
                                          }
                                          className="mt-0.5 shrink-0 text-emerald-300"
                                        />

                                        <div>
                                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                            Exact assignment
                                          </p>

                                          <p className="mt-1 text-sm leading-6 text-slate-400">
                                            <span className="font-semibold text-slate-200">
                                              {
                                                level
                                              }
                                            </span>

                                            {" → "}

                                            {selectedForClass.join(
                                              ", "
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          }
                        )}
                      </div>
                    )}

                    <ErrorText>
                      {errors.assignments}
                    </ErrorText>

                    <ErrorText>
                      {errors.subjects}
                    </ErrorText>
                  </div>

                  {/* =================================================
                      ASSIGNMENT SUMMARY
                  ================================================= */}

                  {hasValidAssignments() && (
                    <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                          <CheckCircle2
                            size={18}
                          />
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            Your Teaching
                            Assignments
                          </h3>

                          <p className="text-xs text-slate-600">
                            These are the exact
                            combinations that will
                            be saved to your tutor
                            account.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {form.assignments
                          .filter(
                            (
                              assignment
                            ) =>
                              assignment
                                .subjects
                                ?.length
                          )
                          .map(
                            (
                              assignment
                            ) => (
                              <div
                                key={
                                  assignment.class
                                }
                                className="rounded-2xl border border-white/5 bg-slate-950/60 p-4"
                              >
                                <p className="text-sm font-bold text-cyan-300">
                                  {
                                    assignment.class
                                  }
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {assignment.subjects.map(
                                    (
                                      subject
                                    ) => (
                                      <span
                                        key={`${assignment.class}-${subject}`}
                                        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-400"
                                      >
                                        {
                                          subject
                                        }
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      EXPERIENCE
                  ================================================= */}

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div>
                      <Input
                        label="Years of Teaching Experience"
                        name="yearsExperience"
                        type="number"
                        min="0"
                        value={
                          form.yearsExperience
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. 5"
                        required
                      />

                      <ErrorText>
                        {
                          errors.yearsExperience
                        }
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Current Occupation"
                        name="currentOccupation"
                        value={
                          form.currentOccupation
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. Teacher"
                        required
                      />

                      <ErrorText>
                        {
                          errors.currentOccupation
                        }
                      </ErrorText>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  STEP 3
              ================================================= */}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <SectionTitle
                    icon={
                      GraduationCap
                    }
                    title="Qualifications"
                    description="Provide your academic and professional background."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Select
                        label="Highest Qualification"
                        name="highestQualification"
                        value={
                          form.highestQualification
                        }
                        onChange={
                          handleChange
                        }
                        options={
                          QUALIFICATIONS
                        }
                        placeholder="Select qualification"
                        required
                      />

                      <ErrorText>
                        {
                          errors.highestQualification
                        }
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Institution"
                        name="institution"
                        value={
                          form.institution
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="University / College / Institution"
                        required
                      />

                      <ErrorText>
                        {
                          errors.institution
                        }
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Course of Study"
                        name="courseOfStudy"
                        value={
                          form.courseOfStudy
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. Mathematics Education"
                        required
                      />

                      <ErrorText>
                        {
                          errors.courseOfStudy
                        }
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Graduation Year"
                        name="graduationYear"
                        type="number"
                        value={
                          form.graduationYear
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. 2022"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Professional Certification"
                        name="professionalCertification"
                        value={
                          form.professionalCertification
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. TRCN, Google Certified Educator, etc."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  STEP 4
              ================================================= */}

              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <SectionTitle
                    icon={Clock3}
                    title="Availability"
                    description="Tell us when you are available to teach."
                  />

                  <div>
                    <p className="mb-4 text-sm font-medium text-slate-300">
                      Available Days

                      <span className="ml-1 text-cyan-400">
                        *
                      </span>
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                      {DAYS.map(
                        (day) => {
                          const active =
                            form.availableDays.includes(
                              day
                            );

                          return (
                            <button
                              type="button"
                              key={day}
                              onClick={() =>
                                toggleDay(
                                  day
                                )
                              }
                              className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                                active
                                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <ErrorText>
                      {
                        errors.availableDays
                      }
                    </ErrorText>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div>
                      <Input
                        label="Available From"
                        name="availableFrom"
                        type="time"
                        value={
                          form.availableFrom
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <ErrorText>
                        {
                          errors.availableFrom
                        }
                      </ErrorText>
                    </div>

                    <div>
                      <Input
                        label="Available To"
                        name="availableTo"
                        type="time"
                        value={
                          form.availableTo
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <ErrorText>
                        {
                          errors.availableTo
                        }
                      </ErrorText>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Select
                      label="Preferred Teaching Mode"
                      name="preferredMode"
                      value={
                        form.preferredMode
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Select teaching mode"
                      options={[
                        "Online",
                        "Physical",
                        "Hybrid",
                      ]}
                      required
                    />

                    <ErrorText>
                      {
                        errors.preferredMode
                      }
                    </ErrorText>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  STEP 5
              ================================================= */}

              {step === 5 && (
                <motion.div
                  key="step-5"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                >
                  <SectionTitle
                    icon={FileText}
                    title="Review Application"
                    description="Review your information before submitting your tutor application."
                  />

                  {/* =================================================
                      EXACT ASSIGNMENTS REVIEW
                  ================================================= */}

                  <div className="mb-5 rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.03] p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <Layers3
                          size={19}
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-white">
                          Exact Teaching
                          Assignments
                        </h3>

                        <p className="text-xs text-slate-600">
                          Class and subject
                          relationships that will
                          be saved.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {form.assignments
                        .filter(
                          (
                            assignment
                          ) =>
                            assignment
                              .subjects
                              ?.length
                        )
                        .map(
                          (
                            assignment
                          ) => (
                            <div
                              key={
                                assignment.class
                              }
                              className="rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span className="font-bold text-cyan-300">
                                  {
                                    assignment.class
                                  }
                                </span>

                                <span className="text-xs text-slate-600">
                                  {
                                    assignment
                                      .subjects
                                      .length
                                  }{" "}
                                  subject
                                  {assignment
                                    .subjects
                                    .length !==
                                  1
                                    ? "s"
                                    : ""}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {assignment.subjects.map(
                                  (
                                    subject
                                  ) => (
                                    <span
                                      key={`${assignment.class}-${subject}`}
                                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300"
                                    >
                                      {
                                        subject
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ReviewItem
                      label="Name"
                      value={[
                        form.firstName,
                        form.middleName,
                        form.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />

                    <ReviewItem
                      label="Email"
                      value={
                        form.email
                      }
                    />

                    <ReviewItem
                      label="Phone"
                      value={
                        form.phone
                      }
                    />

                    <ReviewItem
                      label="Gender"
                      value={
                        form.gender
                      }
                    />

                    <ReviewItem
                      label="Classes"
                      value={form.teachingLevel.join(
                        ", "
                      )}
                    />

                    <ReviewItem
                      label="Subjects"
                      value={form.subjects.join(
                        ", "
                      )}
                    />

                    <ReviewItem
                      label="Experience"
                      value={`${form.yearsExperience} year(s)`}
                    />

                    <ReviewItem
                      label="Qualification"
                      value={
                        form.highestQualification
                      }
                    />

                    <ReviewItem
                      label="Institution"
                      value={
                        form.institution
                      }
                    />

                    <ReviewItem
                      label="Course"
                      value={
                        form.courseOfStudy
                      }
                    />

                    <ReviewItem
                      label="Available Days"
                      value={form.availableDays.join(
                        ", "
                      )}
                    />

                    <ReviewItem
                      label="Teaching Mode"
                      value={
                        form.preferredMode
                      }
                    />
                  </div>

                  <div className="mt-7 space-y-5">
                    <Textarea
                      label="Why do you want to become a Scholiqen tutor?"
                      name="motivation"
                      value={
                        form.motivation
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Tell us why you want to teach on Scholiqen..."
                      required
                    />

                    <ErrorText>
                      {
                        errors.motivation
                      }
                    </ErrorText>

                    <Textarea
                      label="Teaching Experience"
                      name="teachingExperience"
                      value={
                        form.teachingExperience
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Describe your previous teaching experience..."
                      required
                    />

                    <ErrorText>
                      {
                        errors.teachingExperience
                      }
                    </ErrorText>

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                      <input
                        type="checkbox"
                        name="agreement"
                        checked={
                          form.agreement
                        }
                        onChange={
                          handleChange
                        }
                        className="mt-1 h-4 w-4 accent-cyan-400"
                      />

                      <span className="text-sm leading-6 text-slate-400">
                        I confirm that the
                        information I have
                        provided is accurate
                        and I agree to follow
                        Scholiqen Academy's
                        tutor policies and
                        guidelines.
                      </span>
                    </label>

                    <ErrorText>
                      {errors.agreement}
                    </ErrorText>
                  </div>

                  {/* =================================================
                      DUPLICATE ACCOUNT ERROR
                  ================================================= */}

                  {alreadyRegistered && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          size={21}
                          className="mt-0.5 shrink-0 text-amber-300"
                        />

                        <div className="flex-1">
                          <h3 className="font-bold text-amber-200">
                            Already Registered
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {submitError}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                "/academy/login"
                              )
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                          >
                            <LogIn
                              size={
                                16
                              }
                            />
                            Sign in to your
                            account
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {submitError &&
                    !alreadyRegistered && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-300"
                      >
                        <AlertCircle
                          size={19}
                          className="mt-0.5 shrink-0"
                        />

                        <span>
                          {
                            submitError
                          }
                        </span>
                      </motion.div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* =====================================================
                BUTTONS
            ===================================================== */}

            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={
                  step === 1
                    ? () =>
                        navigate(
                          "/academy"
                        )
                    : previousStep
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ChevronLeft
                  size={17}
                />

                {step === 1
                  ? "Cancel"
                  : "Previous"}
              </button>

              {step <
              STEPS.length ? (
                <button
                  type="button"
                  onClick={
                    nextStep
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Continue
                  <ArrowRight
                    size={17}
                  />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send
                        size={17}
                      />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* =====================================================
            SECURITY NOTE
        ===================================================== */}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-600">
          <ShieldCheck
            size={14}
          />
          Your application information
          is handled securely.
        </div>
      </div>
    </div>
  );
}