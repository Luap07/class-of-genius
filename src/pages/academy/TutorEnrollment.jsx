import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Clock3,
  FileText,
  AlertCircle,
  Send,
  School,
  X,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const STEPS = [
  {
    id: 1,
    title: "Personal Information",
    short: "Personal",
    icon: User,
  },
  {
    id: 2,
    title: "Teaching Information",
    short: "Teaching",
    icon: BookOpen,
  },
  {
    id: 3,
    title: "Qualifications",
    short: "Qualifications",
    icon: Award,
  },
  {
    id: 4,
    title: "Availability",
    short: "Availability",
    icon: CalendarDays,
  },
  {
    id: 5,
    title: "Review",
    short: "Review",
    icon: FileText,
  },
];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "English Language",
  "English Literature",
  "Basic Science",
  "Basic Technology",
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Economics",
  "Government",
  "Civic Education",
  "Geography",
  "History",
  "Commerce",
  "Financial Accounting",
  "Computer Studies",
  "Data Processing",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Christian Religious Studies",
  "Islamic Religious Studies",
];

const LEVEL_OPTIONS = [
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

const QUALIFICATION_OPTIONS = [
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

const initialForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  state: "",
  city: "",

  subjects: [],
  levels: [],
  teachingExperience: "",
  currentOccupation: "",
  schoolName: "",
  teachingApproach: "",

  highestQualification: "",
  institution: "",
  fieldOfStudy: "",
  graduationYear: "",
  professionalCertification: "",
  additionalQualification: "",

  availabilityType: "",
  availableDays: [],
  startTime: "",
  endTime: "",
  preferredMode: "",
  weeklyHours: "",

  motivation: "",
  agreement: false,
};

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-200"
      >
        {label}
        {required && <span className="ml-1 text-cyan-400">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-13 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-200"
      >
        {label}
        {required && <span className="ml-1 text-cyan-400">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-13 w-full rounded-2xl border border-white/10 bg-[#090d20] px-4 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
      >
        <option value="" className="bg-[#090d20]">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#090d20]"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-200"
      >
        {label}
        {required && <span className="ml-1 text-cyan-400">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
      />
    </div>
  );
}

function MultiSelect({
  label,
  options,
  selected,
  onToggle,
  description,
}) {
  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-bold text-slate-200">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        )}
      </div>

      <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <button
              type="button"
              key={option}
              onClick={() => onToggle(option)}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${
                active
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-slate-300"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  active
                    ? "border-cyan-400 bg-cyan-400 text-[#050816]"
                    : "border-white/15"
                }`}
              >
                {active && <Check className="h-3.5 w-3.5" />}
              </span>

              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <div>
        <h2 className="text-xl font-black text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-slate-300">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default function TutorEnrollment() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationReference, setApplicationReference] =
    useState("");

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const toggleArrayValue = (field, value) => {
    setForm((previous) => {
      const current = previous[field] || [];

      const exists = current.includes(value);

      return {
        ...previous,
        [field]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!form.firstName.trim()) {
        nextErrors.firstName = "First name is required.";
      }

      if (!form.lastName.trim()) {
        nextErrors.lastName = "Last name is required.";
      }

      if (!form.email.trim()) {
        nextErrors.email = "Email address is required.";
      }

      if (
        form.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (!form.phone.trim()) {
        nextErrors.phone = "Phone number is required.";
      }

      if (!form.gender) {
        nextErrors.gender = "Please select your gender.";
      }

      if (!form.state.trim()) {
        nextErrors.state = "State is required.";
      }

      if (!form.city.trim()) {
        nextErrors.city = "City is required.";
      }
    }

    if (currentStep === 2) {
      if (form.subjects.length === 0) {
        nextErrors.subjects =
          "Select at least one subject you can teach.";
      }

      if (form.levels.length === 0) {
        nextErrors.levels =
          "Select at least one class level.";
      }

      if (!form.teachingExperience) {
        nextErrors.teachingExperience =
          "Select your teaching experience.";
      }

      if (!form.teachingApproach.trim()) {
        nextErrors.teachingApproach =
          "Please describe your teaching approach.";
      }
    }

    if (currentStep === 3) {
      if (!form.highestQualification) {
        nextErrors.highestQualification =
          "Select your highest qualification.";
      }

      if (!form.institution.trim()) {
        nextErrors.institution =
          "Institution name is required.";
      }

      if (!form.fieldOfStudy.trim()) {
        nextErrors.fieldOfStudy =
          "Field of study is required.";
      }
    }

    if (currentStep === 4) {
      if (!form.availabilityType) {
        nextErrors.availabilityType =
          "Select your availability.";
      }

      if (form.availableDays.length === 0) {
        nextErrors.availableDays =
          "Select at least one available day.";
      }

      if (!form.preferredMode) {
        nextErrors.preferredMode =
          "Select your preferred teaching mode.";
      }

      if (!form.weeklyHours) {
        nextErrors.weeklyHours =
          "Select your expected weekly hours.";
      }
    }

    if (currentStep === 5) {
      if (!form.motivation.trim()) {
        nextErrors.motivation =
          "Please tell us why you want to teach at Scholiqen Academy.";
      }

      if (!form.agreement) {
        nextErrors.agreement =
          "You must agree to the tutor application terms.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setStep((previous) =>
      Math.min(previous + 1, STEPS.length)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const previousStep = () => {
    setStep((previous) => Math.max(previous - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const submitApplication = async () => {
    if (!validateStep(5)) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `${API_URL}/api/academy/tutor-application`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            applicationType: "tutor",
            status: "pending",
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to submit your tutor application."
        );
      }

      const reference =
        data?.applicationReference ||
        data?.reference ||
        data?.applicationId ||
        "";

      setApplicationReference(reference);
      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Tutor application error:", error);

      /*
       * The backend endpoint will be created in the next
       * Academy backend stage. We deliberately show the
       * backend response here rather than pretending the
       * application was successfully submitted.
       */
      setSubmitError(
        error?.message ||
          "Something went wrong while submitting your application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSubjectText = useMemo(
    () =>
      form.subjects.length
        ? form.subjects.join(", ")
        : "None selected",
    [form.subjects]
  );

  const selectedLevelsText = useMemo(
    () =>
      form.levels.length
        ? form.levels.join(", ")
        : "None selected",
    [form.levels]
  );

  if (submitted) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(56,189,248,0.9) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

          <div className="absolute -right-40 top-1/3 h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[150px]" />
        </div>

        <header className="relative z-10 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <button
              onClick={() => navigate("/academy")}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div className="text-left">
                <p className="font-black tracking-tight">
                  SCHOLIQEN
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Academy
                </p>
              </div>
            </button>
          </div>
        </header>

        <main className="relative z-10 flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.035] p-7 text-center shadow-2xl shadow-black/30 sm:p-10"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs font-black text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              APPLICATION RECEIVED
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Thank You, {form.firstName}
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
              Your tutor application has been submitted and is
              now awaiting review by the Scholiqen Academy
              administration team.
            </p>

            {applicationReference && (
              <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                  Application Reference
                </p>

                <p className="mt-2 break-all text-sm font-black text-cyan-300">
                  {applicationReference}
                </p>
              </div>
            )}

            <div className="mt-7 space-y-3 text-left">
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

                <div>
                  <p className="text-sm font-bold">
                    Watch your email
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    We will contact you using the email address
                    provided in your application.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />

                <div>
                  <p className="text-sm font-bold">
                    Approval is required
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Tutor access is only granted after the Academy
                    reviews and approves your application.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/academy")}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-black shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
            >
              Return to Academy
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(56,189,248,0.9) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute -right-40 top-1/3 h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div className="absolute bottom-[-250px] left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">
          <button
            onClick={() => navigate("/academy")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div className="text-left">
              <p className="font-black tracking-tight">
                SCHOLIQEN
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                Academy
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/academy")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-white sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Back to Academy
            </span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Intro */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-3 py-1.5 text-xs font-black text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              BECOME AN ACADEMY TUTOR
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Share Your Knowledge.
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Inspire Students.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Apply to teach primary and secondary students through
              Scholiqen Academy. Applications are reviewed before
              tutor access is granted.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-7 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Application Progress
                </p>

                <p className="mt-1 text-sm font-black">
                  Step {step} of {STEPS.length}
                </p>
              </div>

              <p className="text-xs font-black text-cyan-400">
                {Math.round(progress)}%
              </p>
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {STEPS.map((item) => {
                const Icon = item.icon;
                const active = step === item.id;
                const complete = step > item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center gap-2 text-center ${
                      active || complete
                        ? "text-cyan-300"
                        : "text-slate-700"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                        complete
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                          : active
                            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
                            : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      {complete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>

                    <span className="hidden text-[9px] font-black uppercase tracking-wider sm:block">
                      {item.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/30">
            <div className="p-5 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SectionTitle
                      icon={User}
                      title="Personal Information"
                      description="Tell us who you are and how the Academy can contact you."
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Input
                          label="First Name"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          required
                        />
                        {errors.firstName && (
                          <ErrorText text={errors.firstName} />
                        )}
                      </div>

                      <Input
                        label="Middle Name"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        placeholder="Optional"
                      />

                      <div>
                        <Input
                          label="Last Name"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          required
                        />
                        {errors.lastName && (
                          <ErrorText text={errors.lastName} />
                        )}
                      </div>

                      <div>
                        <Input
                          label="Email Address"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                        />
                        {errors.email && (
                          <ErrorText text={errors.email} />
                        )}
                      </div>

                      <div>
                        <Input
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="080..."
                          required
                        />
                        {errors.phone && (
                          <ErrorText text={errors.phone} />
                        )}
                      </div>

                      <div>
                        <Select
                          label="Gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          options={[
                            "Male",
                            "Female",
                            "Prefer not to say",
                          ]}
                          required
                        />
                        {errors.gender && (
                          <ErrorText text={errors.gender} />
                        )}
                      </div>

                      <Input
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                      />

                      <div>
                        <Input
                          label="State"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          placeholder="e.g. Lagos"
                          required
                        />
                        {errors.state && (
                          <ErrorText text={errors.state} />
                        )}
                      </div>

                      <div>
                        <Input
                          label="City"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="e.g. Ikeja"
                          required
                        />
                        {errors.city && (
                          <ErrorText text={errors.city} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SectionTitle
                      icon={BookOpen}
                      title="Teaching Information"
                      description="Tell us what you teach and the students you are comfortable teaching."
                    />

                    <div className="space-y-7">
                      <div>
                        <MultiSelect
                          label="Subjects You Can Teach"
                          description="Select every subject you are qualified and confident to teach."
                          options={SUBJECT_OPTIONS}
                          selected={form.subjects}
                          onToggle={(value) =>
                            toggleArrayValue("subjects", value)
                          }
                        />

                        {errors.subjects && (
                          <ErrorText text={errors.subjects} />
                        )}
                      </div>

                      <div>
                        <MultiSelect
                          label="Class Levels"
                          description="Select the primary and/or secondary levels you can teach."
                          options={LEVEL_OPTIONS}
                          selected={form.levels}
                          onToggle={(value) =>
                            toggleArrayValue("levels", value)
                          }
                        />

                        {errors.levels && (
                          <ErrorText text={errors.levels} />
                        )}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Select
                            label="Teaching Experience"
                            name="teachingExperience"
                            value={form.teachingExperience}
                            onChange={handleChange}
                            options={[
                              "Less than 1 year",
                              "1 - 2 years",
                              "3 - 5 years",
                              "6 - 10 years",
                              "More than 10 years",
                            ]}
                            required
                          />

                          {errors.teachingExperience && (
                            <ErrorText
                              text={errors.teachingExperience}
                            />
                          )}
                        </div>

                        <Input
                          label="Current Occupation"
                          name="currentOccupation"
                          value={form.currentOccupation}
                          onChange={handleChange}
                          placeholder="e.g. Teacher, Lecturer, Student"
                        />

                        <Input
                          label="Current / Previous School"
                          name="schoolName"
                          value={form.schoolName}
                          onChange={handleChange}
                          placeholder="School or organization"
                        />
                      </div>

                      <div>
                        <Textarea
                          label="Teaching Approach"
                          name="teachingApproach"
                          value={form.teachingApproach}
                          onChange={handleChange}
                          placeholder="Briefly explain how you teach students, explain difficult topics and keep learners engaged."
                          rows={6}
                          required
                        />

                        {errors.teachingApproach && (
                          <ErrorText
                            text={errors.teachingApproach}
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SectionTitle
                      icon={Award}
                      title="Qualifications"
                      description="Provide your academic and professional background."
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Select
                          label="Highest Qualification"
                          name="highestQualification"
                          value={form.highestQualification}
                          onChange={handleChange}
                          options={QUALIFICATION_OPTIONS}
                          required
                        />

                        {errors.highestQualification && (
                          <ErrorText
                            text={errors.highestQualification}
                          />
                        )}
                      </div>

                      <div>
                        <Input
                          label="Institution"
                          name="institution"
                          value={form.institution}
                          onChange={handleChange}
                          placeholder="University / College / Institution"
                          required
                        />

                        {errors.institution && (
                          <ErrorText
                            text={errors.institution}
                          />
                        )}
                      </div>

                      <div>
                        <Input
                          label="Field of Study"
                          name="fieldOfStudy"
                          value={form.fieldOfStudy}
                          onChange={handleChange}
                          placeholder="e.g. Mathematics Education"
                          required
                        />

                        {errors.fieldOfStudy && (
                          <ErrorText
                            text={errors.fieldOfStudy}
                          />
                        )}
                      </div>

                      <Input
                        label="Graduation Year"
                        name="graduationYear"
                        type="number"
                        value={form.graduationYear}
                        onChange={handleChange}
                        placeholder="e.g. 2022"
                      />

                      <div className="sm:col-span-2">
                        <Input
                          label="Professional Certification"
                          name="professionalCertification"
                          value={form.professionalCertification}
                          onChange={handleChange}
                          placeholder="e.g. TRCN, Cambridge, Microsoft, Google..."
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Textarea
                          label="Additional Qualifications"
                          name="additionalQualification"
                          value={form.additionalQualification}
                          onChange={handleChange}
                          placeholder="Mention additional training, certifications, awards, workshops or relevant professional development."
                          rows={5}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SectionTitle
                      icon={CalendarDays}
                      title="Availability"
                      description="Help us understand when and how you prefer to teach."
                    />

                    <div className="space-y-7">
                      <div>
                        <p className="mb-3 text-sm font-bold text-slate-200">
                          Availability Type
                        </p>

                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            {
                              value: "Weekdays",
                              label: "Weekdays",
                              icon: BriefcaseBusiness,
                            },
                            {
                              value: "Weekends",
                              label: "Weekends",
                              icon: CalendarDays,
                            },
                            {
                              value: "Both",
                              label: "Weekdays & Weekends",
                              icon: Clock3,
                            },
                          ].map((item) => {
                            const Icon = item.icon;
                            const active =
                              form.availabilityType ===
                              item.value;

                            return (
                              <button
                                type="button"
                                key={item.value}
                                onClick={() =>
                                  setForm((previous) => ({
                                    ...previous,
                                    availabilityType:
                                      item.value,
                                  }))
                                }
                                className={`rounded-2xl border p-4 text-left transition ${
                                  active
                                    ? "border-cyan-400/30 bg-cyan-400/10"
                                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                                }`}
                              >
                                <Icon
                                  className={`h-5 w-5 ${
                                    active
                                      ? "text-cyan-400"
                                      : "text-slate-600"
                                  }`}
                                />

                                <p
                                  className={`mt-3 text-xs font-black ${
                                    active
                                      ? "text-cyan-300"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {item.label}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {errors.availabilityType && (
                          <ErrorText
                            text={errors.availabilityType}
                          />
                        )}
                      </div>

                      <div>
                        <MultiSelect
                          label="Available Days"
                          options={[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ]}
                          selected={form.availableDays}
                          onToggle={(value) =>
                            toggleArrayValue(
                              "availableDays",
                              value
                            )
                          }
                        />

                        {errors.availableDays && (
                          <ErrorText
                            text={errors.availableDays}
                          />
                        )}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                          label="Available From"
                          name="startTime"
                          type="time"
                          value={form.startTime}
                          onChange={handleChange}
                        />

                        <Input
                          label="Available Until"
                          name="endTime"
                          type="time"
                          value={form.endTime}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Select
                            label="Preferred Teaching Mode"
                            name="preferredMode"
                            value={form.preferredMode}
                            onChange={handleChange}
                            options={[
                              "Online",
                              "Physical",
                              "Both Online and Physical",
                            ]}
                            required
                          />

                          {errors.preferredMode && (
                            <ErrorText
                              text={errors.preferredMode}
                            />
                          )}
                        </div>

                        <div>
                          <Select
                            label="Expected Weekly Hours"
                            name="weeklyHours"
                            value={form.weeklyHours}
                            onChange={handleChange}
                            options={[
                              "1 - 3 hours",
                              "4 - 6 hours",
                              "7 - 10 hours",
                              "11 - 15 hours",
                              "16+ hours",
                            ]}
                            required
                          />

                          {errors.weeklyHours && (
                            <ErrorText
                              text={errors.weeklyHours}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5 */}
                {step === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SectionTitle
                      icon={FileText}
                      title="Review Your Application"
                      description="Check your information carefully before submitting your tutor application."
                    />

                    <div className="space-y-6">
                      {/* Personal */}
                      <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wider text-cyan-400">
                          Personal Information
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <ReviewItem
                            label="Full Name"
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
                            value={form.email}
                          />

                          <ReviewItem
                            label="Phone"
                            value={form.phone}
                          />

                          <ReviewItem
                            label="Location"
                            value={`${form.city}, ${form.state}`}
                          />
                        </div>
                      </div>

                      {/* Teaching */}
                      <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wider text-cyan-400">
                          Teaching Information
                        </p>

                        <div className="grid gap-3">
                          <ReviewItem
                            label="Subjects"
                            value={selectedSubjectText}
                          />

                          <ReviewItem
                            label="Class Levels"
                            value={selectedLevelsText}
                          />

                          <ReviewItem
                            label="Teaching Experience"
                            value={form.teachingExperience}
                          />

                          <ReviewItem
                            label="Teaching Approach"
                            value={form.teachingApproach}
                          />
                        </div>
                      </div>

                      {/* Qualification */}
                      <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wider text-cyan-400">
                          Qualification
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <ReviewItem
                            label="Highest Qualification"
                            value={form.highestQualification}
                          />

                          <ReviewItem
                            label="Institution"
                            value={form.institution}
                          />

                          <ReviewItem
                            label="Field of Study"
                            value={form.fieldOfStudy}
                          />

                          <ReviewItem
                            label="Graduation Year"
                            value={form.graduationYear}
                          />
                        </div>
                      </div>

                      {/* Availability */}
                      <div>
                        <p className="mb-3 text-xs font-black uppercase tracking-wider text-cyan-400">
                          Availability
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <ReviewItem
                            label="Availability"
                            value={form.availabilityType}
                          />

                          <ReviewItem
                            label="Teaching Mode"
                            value={form.preferredMode}
                          />

                          <ReviewItem
                            label="Available Days"
                            value={
                              form.availableDays.join(", ") ||
                              "None selected"
                            }
                          />

                          <ReviewItem
                            label="Weekly Hours"
                            value={form.weeklyHours}
                          />
                        </div>
                      </div>

                      {/* Motivation */}
                      <div>
                        <Textarea
                          label="Why do you want to teach at Scholiqen Academy?"
                          name="motivation"
                          value={form.motivation}
                          onChange={handleChange}
                          placeholder="Tell us about your motivation, teaching goals and how you would contribute to the Academy."
                          rows={6}
                          required
                        />

                        {errors.motivation && (
                          <ErrorText
                            text={errors.motivation}
                          />
                        )}
                      </div>

                      {/* Agreement */}
                      <div
                        className={`rounded-2xl border p-4 ${
                          errors.agreement
                            ? "border-red-400/20 bg-red-500/5"
                            : "border-cyan-400/10 bg-cyan-400/[0.025]"
                        }`}
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            name="agreement"
                            checked={form.agreement}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 accent-cyan-400"
                          />

                          <span className="text-xs leading-5 text-slate-500">
                            I confirm that the information provided
                            in this application is accurate and
                            complete. I understand that Scholiqen
                            Academy may review my qualifications
                            before approving my tutor application,
                            and that submitting this application
                            does not guarantee tutor approval.
                          </span>
                        </label>

                        {errors.agreement && (
                          <ErrorText text={errors.agreement} />
                        )}
                      </div>

                      {/* Submit error */}
                      {submitError && (
                        <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer controls */}
            <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <button
                type="button"
                onClick={
                  step === 1
                    ? () => navigate("/academy")
                    : previousStep
                }
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 text-sm font-bold text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {step === 1 ? "Cancel" : "Previous"}
              </button>

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 text-sm font-black shadow-lg shadow-blue-500/20 transition hover:scale-[1.01]"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitApplication}
                  disabled={submitting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 text-sm font-black shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Trust notice */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

            <div>
              <p className="text-xs font-black text-slate-300">
                Your information is handled securely
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-700">
                Your application details are used for tutor
                verification and Academy administration. Tutor
                access is only granted after approval.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
            © {new Date().getFullYear()} Scholiqen Academy
          </p>
        </div>
      </main>
    </div>
  );
}

function ErrorText({ text }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-400">
      <AlertCircle className="h-3.5 w-3.5" />
      {text}
    </p>
  );
}
