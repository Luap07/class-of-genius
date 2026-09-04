import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Mail,
  MapPin,
  Phone,
  School,
  ShieldCheck,
  User,
  Users,
  WalletCards,
  CreditCard,
  AlertCircle,
  Loader2,
  Sparkles,
  LogIn,
  GraduationCap,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

/* =========================================================
   ACCEPTANCE FEE
========================================================= */

const ACCEPTANCE_FEE = {
  amount: "₦2,000",
  numericAmount: 2000,
  bank: "Opay",
  accountNumber: "8104264197",
  accountName: "Komolafe Damilare Paul",
};

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",

  dateOfBirth: "",
  gender: "",

  studentPhone: "",
  email: "",

  schoolLevel: "",
  grade: "",
  academicSession: "2026/2027",

  state: "",
  city: "",

  subjects: [],

  guardianFirstName: "",
  guardianLastName: "",
  guardianRelationship: "",
  guardianPhone: "",
  guardianEmail: "",

  agree: false,
};

/* =========================================================
   GRADES
========================================================= */

const PRIMARY_GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
];

const SECONDARY_CLASSES = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

/* =========================================================
   CLASS-SPECIFIC SUBJECTS
========================================================= */

const SUBJECTS_BY_CLASS = {
  "Grade 1": [
    "English Studies",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Religious Studies",
  ],

  "Grade 2": [
    "English Studies",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Religious Studies",
  ],

  "Grade 3": [
    "English Studies",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Agricultural Science",
    "Home Economics",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Religious Studies",
  ],

  "Grade 4": [
    "English Studies",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Agricultural Science",
    "Home Economics",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Religious Studies",
  ],

  "Grade 5": [
    "English Studies",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Agricultural Science",
    "Home Economics",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Religious Studies",
  ],

  "Grade 6": [
    "English Studies",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Agricultural Science",
    "Home Economics",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Religious Studies",
  ],

  "JSS 1": [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Business Studies",
    "Home Economics",
    "Agricultural Science",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "French",
  ],

  "JSS 2": [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Business Studies",
    "Home Economics",
    "Agricultural Science",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "French",
  ],

  "JSS 3": [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Computer Studies",
    "Business Studies",
    "Home Economics",
    "Agricultural Science",
    "Cultural and Creative Arts",
    "Physical and Health Education",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "French",
  ],

  "SS 1": [
    "English Language",
    "General Mathematics",
    "Further Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "Agricultural Science",
    "Economics",
    "Government",
    "Geography",
    "Literature in English",
    "Commerce",
    "Financial Accounting",
    "Marketing",
    "Data Processing",
    "Computer Studies",
    "Civic Education",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "French",
    "Technical Drawing",
    "Food and Nutrition",
    "Home Management",
    "Yoruba",
    "Igbo",
    "Hausa",
  ],

  "SS 2": [
    "English Language",
    "General Mathematics",
    "Further Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "Agricultural Science",
    "Economics",
    "Government",
    "Geography",
    "Literature in English",
    "Commerce",
    "Financial Accounting",
    "Marketing",
    "Data Processing",
    "Computer Studies",
    "Civic Education",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "French",
    "Technical Drawing",
    "Food and Nutrition",
    "Home Management",
    "Yoruba",
    "Igbo",
    "Hausa",
  ],

  "SS 3": [
    "English Language",
    "General Mathematics",
    "Further Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "Agricultural Science",
    "Economics",
    "Government",
    "Geography",
    "Literature in English",
    "Commerce",
    "Financial Accounting",
    "Marketing",
    "Data Processing",
    "Computer Studies",
    "Civic Education",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "French",
    "Technical Drawing",
    "Food and Nutrition",
    "Home Management",
    "Yoruba",
    "Igbo",
    "Hausa",
  ],
};

/* =========================================================
   NIGERIAN STATES
========================================================= */

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Federal Capital Territory",
];

/* =========================================================
   STEPS
========================================================= */

const STEPS = [
  {
    id: 1,
    label: "Student",
    description: "Basic information",
    icon: User,
  },
  {
    id: 2,
    label: "Academics",
    description: "Level & class",
    icon: School,
  },
  {
    id: 3,
    label: "Subjects",
    description: "Learning subjects",
    icon: BookOpen,
  },
  {
    id: 4,
    label: "Guardian",
    description: "Parent information",
    icon: Users,
  },
  {
    id: 5,
    label: "Review",
    description: "Confirm enrollment",
    icon: ShieldCheck,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const generatePaymentReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();

  const random = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `OPAY-${timestamp}-${random}`;
};

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  icon: Icon,
  required = true,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200">
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">*</span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 ${
            Icon ? "pl-11" : ""
          } ${
            error
              ? "border-red-500/70"
              : "border-white/10 focus:border-cyan-400/50"
          }`}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200">
        {label}
        <span className="ml-1 text-cyan-400">*</span>
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-2xl border bg-slate-950/80 px-4 py-3.5 text-sm text-white outline-none transition ${
          error
            ? "border-red-500/70"
            : "border-white/10 focus:border-cyan-400/50"
        }`}
      >
        <option value="" className="bg-slate-950">
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

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   REVIEW ITEM
========================================================= */

function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentEnrollment() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const [enrollmentResult, setEnrollmentResult] =
    useState(null);

  const [paymentReference, setPaymentReference] =
    useState("");

  const [paymentSubmitting, setPaymentSubmitting] =
    useState(false);

  const [paymentSubmitted, setPaymentSubmitted] =
    useState(false);

  /* =======================================================
     GRADES
  ======================================================= */

  const grades = useMemo(() => {
    if (form.schoolLevel === "Primary") {
      return PRIMARY_GRADES;
    }

    if (form.schoolLevel === "Secondary") {
      return SECONDARY_CLASSES;
    }

    return [];
  }, [form.schoolLevel]);

  /* =======================================================
     SUBJECTS
  ======================================================= */

  const subjects = useMemo(() => {
    if (!form.grade) {
      return [];
    }

    return SUBJECTS_BY_CLASS[form.grade] || [];
  }, [form.grade]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =======================================================
     LEVEL CHANGE
  ======================================================= */

  const handleLevelChange = (value) => {
    setForm((prev) => ({
      ...prev,
      schoolLevel: value,
      grade: "",
      subjects: [],
    }));

    setErrors((prev) => ({
      ...prev,
      schoolLevel: "",
      grade: "",
      subjects: "",
    }));
  };

  /* =======================================================
     GRADE CHANGE
  ======================================================= */

  const handleGradeChange = (value) => {
    setForm((prev) => ({
      ...prev,
      grade: value,
      subjects: [],
    }));

    setErrors((prev) => ({
      ...prev,
      grade: "",
      subjects: "",
    }));
  };

  /* =======================================================
     SUBJECT TOGGLE
  ======================================================= */

  const toggleSubject = (subject) => {
    setForm((prev) => {
      if (!subjects.includes(subject)) {
        return prev;
      }

      const exists =
        prev.subjects.includes(subject);

      return {
        ...prev,
        subjects: exists
          ? prev.subjects.filter(
              (item) => item !== subject
            )
          : [...prev.subjects, subject],
      };
    });

    setErrors((prev) => ({
      ...prev,
      subjects: "",
    }));
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!form.firstName.trim()) {
        newErrors.firstName =
          "First name is required.";
      }

      if (!form.lastName.trim()) {
        newErrors.lastName =
          "Last name is required.";
      }

      if (!form.dateOfBirth) {
        newErrors.dateOfBirth =
          "Date of birth is required.";
      }

      if (!form.gender) {
        newErrors.gender =
          "Please select gender.";
      }

      if (!form.studentPhone.trim()) {
        newErrors.studentPhone =
          "Student phone number is required.";
      }

      if (!form.email.trim()) {
        newErrors.email =
          "Email address is required.";
      } else if (
        !/^\S+@\S+\.\S+$/.test(
          form.email.trim()
        )
      ) {
        newErrors.email =
          "Enter a valid email address.";
      }
    }

    if (currentStep === 2) {
      if (!form.schoolLevel) {
        newErrors.schoolLevel =
          "Please select a school level.";
      }

      if (!form.grade) {
        newErrors.grade =
          "Please select a class.";
      }

      if (!form.academicSession) {
        newErrors.academicSession =
          "Academic session is required.";
      }
    }

    if (currentStep === 3) {
      if (!form.grade) {
        newErrors.grade =
          "Please select a class first.";
      }

      if (!form.subjects.length) {
        newErrors.subjects =
          `Please select at least one subject for ${
            form.grade || "this class"
          }.`;
      }

      const invalidSubjects =
        form.subjects.filter(
          (subject) =>
            !subjects.includes(subject)
        );

      if (invalidSubjects.length > 0) {
        newErrors.subjects =
          "One or more selected subjects do not belong to this class.";
      }
    }

    if (currentStep === 4) {
      if (!form.guardianFirstName.trim()) {
        newErrors.guardianFirstName =
          "Guardian first name is required.";
      }

      if (!form.guardianLastName.trim()) {
        newErrors.guardianLastName =
          "Guardian last name is required.";
      }

      if (!form.guardianRelationship) {
        newErrors.guardianRelationship =
          "Please select the relationship.";
      }

      if (!form.guardianPhone.trim()) {
        newErrors.guardianPhone =
          "Guardian phone number is required.";
      }

      if (!form.state) {
        newErrors.state =
          "Please select a state.";
      }

      if (!form.city.trim()) {
        newErrors.city =
          "City is required.";
      }
    }

    if (currentStep === 5) {
      if (!form.agree) {
        newErrors.agree =
          "You must agree to the enrollment information before submitting.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setCurrentStep((prev) =>
      Math.min(prev + 1, STEPS.length)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
      return;
    }

    setCurrentStep((prev) =>
      Math.max(prev - 1, 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SUBMIT ENROLLMENT
  ======================================================= */

  const submitEnrollment = async () => {
    if (!validateStep()) {
      return;
    }

    setSubmitting(true);

    try {
      const allowedSubjects =
        SUBJECTS_BY_CLASS[form.grade] || [];

      const cleanSubjects =
        form.subjects.filter((subject) =>
          allowedSubjects.includes(subject)
        );

      const payload = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),

        dateOfBirth: form.dateOfBirth,
        gender: form.gender,

        studentPhone:
          form.studentPhone.trim(),

        email:
          form.email.trim().toLowerCase(),

        schoolLevel:
          form.schoolLevel,

        grade:
          form.grade,

        academicSession:
          form.academicSession,

        state:
          form.state,

        city:
          form.city.trim(),

        subjects:
          cleanSubjects,

        guardianFirstName:
          form.guardianFirstName.trim(),

        guardianLastName:
          form.guardianLastName.trim(),

        guardianRelationship:
          form.guardianRelationship,

        guardianPhone:
          form.guardianPhone.trim(),

        guardianEmail:
          form.guardianEmail
            .trim()
            .toLowerCase(),
      };

      const response = await axios.post(
        `${API_URL}/api/academy/student-enrollment`,
        payload
      );

      const result = response.data;

      setEnrollmentResult(result);

      setPaymentReference(
        generatePaymentReference()
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Student enrollment error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to complete registration. Please try again.";

      setErrors({
        submit: message,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     PAYMENT CONFIRMATION
  ======================================================= */

  const confirmPayment = async () => {
    if (!enrollmentResult?.enrollmentId) {
      setErrors({
        payment:
          "Enrollment information is missing.",
      });

      return;
    }

    if (!paymentReference.trim()) {
      setErrors({
        payment:
          "Please enter your payment reference.",
      });

      return;
    }

    setPaymentSubmitting(true);

    try {
      const payload = {
        enrollmentId:
          enrollmentResult.enrollmentId,

        paymentReference:
          paymentReference.trim(),

        amount:
          ACCEPTANCE_FEE.numericAmount,

        paymentMethod:
          "bank_transfer",

        bank:
          ACCEPTANCE_FEE.bank,

        email:
          form.email.trim().toLowerCase(),
      };

      await axios.post(
        `${API_URL}/api/academy/acceptance-fee`,
        payload
      );

      setPaymentSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Acceptance fee confirmation error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to submit payment confirmation.";

      setErrors({
        payment: message,
      });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  /* =======================================================
     COPY ACCOUNT
  ======================================================= */

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(
        ACCEPTANCE_FEE.accountNumber
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  /* =======================================================
     PAYMENT SUCCESS
  ======================================================= */

  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-[#020817] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-12">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full rounded-[32px] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur-xl md:p-12"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
              <CheckCircle2
                size={42}
                className="text-emerald-400"
              />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
              <ShieldCheck size={14} />
              PAYMENT SUBMITTED
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Enrollment Submitted Successfully
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
              Your enrollment has been received and
              your acceptance-fee payment confirmation
              has been submitted for verification.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Enrollment ID
                </p>

                <p className="mt-2 break-all font-mono text-lg font-bold text-cyan-300">
                  {enrollmentResult?.enrollmentId ||
                    "Pending"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Payment Status
                </p>

                <p className="mt-2 font-bold text-amber-300">
                  Awaiting Verification
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-left">
              <div className="flex gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-400"
                />

                <div>
                  <p className="font-semibold text-amber-200">
                    What happens next?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Your payment will be reviewed by
                    an administrator. Once the transfer
                    is confirmed, your enrollment can be
                    approved.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/academy")
              }
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-bold shadow-lg shadow-cyan-950/30"
            >
              Return to Academy
              <ArrowRight size={17} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ACCEPTANCE FEE PAGE
  ======================================================= */

  if (enrollmentResult) {
    return (
      <div className="min-h-screen bg-[#020817] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        </div>

        <header className="relative border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Scholiqen Academy
              </p>

              <h1 className="mt-1 text-lg font-bold">
                Acceptance Fee
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
              <ShieldCheck size={14} />
              Registration Complete
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-5xl px-5 py-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <WalletCards
                  size={30}
                  className="text-cyan-400"
                />
              </div>

              <h2 className="text-3xl font-black">
                Acceptance Fee Payment
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Complete your acceptance-fee transfer
                using the account details below.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Amount Payable
                    </p>

                    <p className="mt-2 text-4xl font-black text-cyan-300">
                      {ACCEPTANCE_FEE.amount}
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <CreditCard
                      size={26}
                      className="text-cyan-400"
                    />
                  </div>
                </div>

                <div className="my-7 h-px bg-white/10" />

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Bank / Wallet
                    </p>

                    <p className="mt-1 text-base font-bold">
                      {ACCEPTANCE_FEE.bank}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Account Number
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-mono text-xl font-bold tracking-wider text-cyan-300">
                        {ACCEPTANCE_FEE.accountNumber}
                      </p>

                      <button
                        type="button"
                        onClick={
                          copyAccountNumber
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        <Copy size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Account Name
                    </p>

                    <p className="mt-1 text-base font-bold">
                      {ACCEPTANCE_FEE.accountName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Payment Method
                    </p>

                    <p className="mt-1 text-base font-bold">
                      Bank Transfer
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Enrollment ID
                  </p>

                  <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-300">
                    {enrollmentResult.enrollmentId}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
                  <div className="flex gap-3">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />

                    <p className="text-sm leading-6 text-slate-400">
                      Transfer exactly{" "}
                      <strong className="text-amber-300">
                        ₦2,000
                      </strong>{" "}
                      to the Opay account above.
                      Keep your transfer receipt for
                      verification.
                    </p>
                  </div>
                </div>

                <div className="my-7 h-px bg-white/10" />

                <label className="text-sm font-medium text-slate-200">
                  Payment Reference
                </label>

                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <WalletCards
                    size={18}
                    className="shrink-0 text-slate-500"
                  />

                  <input
                    value={paymentReference}
                    onChange={(event) =>
                      setPaymentReference(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                    placeholder="Enter transfer reference"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Enter your actual transfer reference
                  if your bank/Opay provides one.
                </p>

                {errors.payment && (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                    {errors.payment}
                  </div>
                )}

                <button
                  type="button"
                  disabled={paymentSubmitting}
                  onClick={confirmPayment}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-950/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      I Have Made the Transfer
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Your payment will remain pending until
                  it is verified by an administrator.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  /* =======================================================
     MAIN FORM
  ======================================================= */

  const activeStep =
    STEPS[currentStep - 1];

  return (
    <div className="min-h-screen overflow-hidden bg-[#020817] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute bottom-[-15%] left-[30%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020817]/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft size={17} />

              <span className="hidden sm:inline">
                Back
              </span>
            </button>

            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                Scholiqen Academy
              </p>

              <h1 className="mt-0.5 text-sm font-bold sm:text-base">
                Student Enrollment
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
              <ShieldCheck size={14} />

              <span className="hidden sm:inline">
                Secure
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 py-8 md:py-12">
        {/* TITLE */}

        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Sparkles
                size={25}
                className="text-cyan-400"
              />
            </div>

            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Begin Your Enrollment
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Complete your student information
              carefully. Your selected class determines
              the subjects available.
            </p>
          </motion.div>
        </div>

        {/* =====================================================
            ALREADY ENROLLED — FIRST THING STUDENTS SEE
        ===================================================== */}

        <div className="mx-auto mt-8 max-w-5xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-gradient-to-r from-cyan-500/[0.10] via-blue-500/[0.06] to-violet-500/[0.10] p-5 shadow-2xl shadow-cyan-950/10 md:p-6"
          >
            <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                  <GraduationCap
                    size={23}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">
                      Already enrolled?
                    </h3>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Existing Student
                    </span>
                  </div>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                    If you have already submitted your
                    enrollment, you do not need to register
                    again. Sign in to your student portal
                    to check your enrollment status.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/academy/student-enrollment-login"
                  )
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-bold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/20 hover:text-white"
              >
                <LogIn size={17} />
                Student Login
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* STEPS */}

        <div className="mx-auto mt-10 max-w-5xl">
          <div className="relative">
            <div className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-white/10 md:block" />

            <div className="relative grid grid-cols-5 gap-2">
              {STEPS.map((step) => {
                const Icon = step.icon;

                const active =
                  currentStep === step.id;

                const completed =
                  currentStep > step.id;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                        completed
                          ? "border-cyan-400/30 bg-cyan-400 text-slate-950"
                          : active
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-950/30"
                          : "border-white/10 bg-slate-950 text-slate-600"
                      }`}
                    >
                      {completed ? (
                        <Check size={20} />
                      ) : (
                        <Icon size={19} />
                      )}
                    </div>

                    <p
                      className={`mt-3 hidden text-xs font-bold sm:block ${
                        active || completed
                          ? "text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="mt-1 hidden text-[10px] text-slate-600 md:block">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FORM CARD */}

        <div className="mx-auto mt-10 max-w-5xl">
          <motion.div
            layout
            className="rounded-[30px] border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            {/* CARD HEADER */}

            <div className="border-b border-white/10 px-6 py-6 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                  <activeStep.icon
                    size={20}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Step {currentStep} of{" "}
                    {STEPS.length}
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {activeStep.label}
                  </h3>
                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="px-6 py-7 md:px-8 md:py-9">
              <AnimatePresence mode="wait">
                {/* =================================================
                    STEP 1
                ================================================= */}

                {currentStep === 1 && (
                  <motion.div
                    key="student"
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -15,
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h4 className="text-lg font-bold">
                        Student Information
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Enter the student's personal
                        details.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                      <InputField
                        label="First Name"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        placeholder="First name"
                        icon={User}
                      />

                      <InputField
                        label="Middle Name"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        error={errors.middleName}
                        placeholder="Middle name"
                        icon={User}
                        required={false}
                      />

                      <InputField
                        label="Last Name"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        placeholder="Last name"
                        icon={User}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Date of Birth"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        error={errors.dateOfBirth}
                        type="date"
                      />

                      <SelectField
                        label="Gender"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        error={errors.gender}
                        placeholder="Select gender"
                        options={[
                          "Male",
                          "Female",
                        ]}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Student Phone"
                        name="studentPhone"
                        value={form.studentPhone}
                        onChange={handleChange}
                        error={errors.studentPhone}
                        placeholder="08012345678"
                        icon={Phone}
                      />

                      <InputField
                        label="Email Address"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="student@example.com"
                        type="email"
                        icon={Mail}
                      />
                    </div>

                    {errors.submit && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                        <div className="flex gap-3">
                          <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                          />

                          <p>
                            {errors.submit}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* =================================================
                    STEP 2
                ================================================= */}

                {currentStep === 2 && (
                  <motion.div
                    key="academics"
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -15,
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h4 className="text-lg font-bold">
                        Academic Information
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Select the student's level
                        and exact class.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                      <SelectField
                        label="School Level"
                        name="schoolLevel"
                        value={form.schoolLevel}
                        onChange={(event) =>
                          handleLevelChange(
                            event.target.value
                          )
                        }
                        error={errors.schoolLevel}
                        placeholder="Select level"
                        options={[
                          "Primary",
                          "Secondary",
                        ]}
                      />

                      <SelectField
                        label="Class"
                        name="grade"
                        value={form.grade}
                        onChange={(event) =>
                          handleGradeChange(
                            event.target.value
                          )
                        }
                        error={errors.grade}
                        placeholder={
                          form.schoolLevel
                            ? "Select class"
                            : "Select level first"
                        }
                        options={grades}
                      />

                      <SelectField
                        label="Academic Session"
                        name="academicSession"
                        value={form.academicSession}
                        onChange={handleChange}
                        error={
                          errors.academicSession
                        }
                        placeholder="Select session"
                        options={[
                          "2026/2027",
                          "2027/2028",
                          "2028/2029",
                        ]}
                      />
                    </div>

                    <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                          <BookOpen
                            size={20}
                            className="text-cyan-400"
                          />
                        </div>

                        <div>
                          <h4 className="font-bold">
                            Class-Specific Subjects
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Your selected class
                            determines exactly which
                            subjects appear on the next
                            step.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    STEP 3
                ================================================= */}

                {currentStep === 3 && (
                  <motion.div
                    key="subjects"
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -15,
                    }}
                    className="space-y-8"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                      <div>
                        <h4 className="text-lg font-bold">
                          Select Subjects
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                          Showing subjects for{" "}
                          <strong className="text-cyan-300">
                            {form.grade ||
                              "your class"}
                          </strong>{" "}
                          only.
                        </p>
                      </div>

                      <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">
                        {form.subjects.length}{" "}
                        Selected
                      </div>
                    </div>

                    {form.grade ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {subjects.map(
                          (subject) => {
                            const selected =
                              form.subjects.includes(
                                subject
                              );

                            return (
                              <button
                                type="button"
                                key={subject}
                                onClick={() =>
                                  toggleSubject(
                                    subject
                                  )
                                }
                                className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                                  selected
                                    ? "border-cyan-400/40 bg-cyan-400/10"
                                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                                }`}
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                                    selected
                                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                                      : "border-white/20 text-transparent"
                                  }`}
                                >
                                  <Check size={14} />
                                </span>

                                <span
                                  className={`text-sm font-medium ${
                                    selected
                                      ? "text-cyan-100"
                                      : "text-slate-300"
                                  }`}
                                >
                                  {subject}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
                        <School
                          size={34}
                          className="mx-auto text-slate-600"
                        />

                        <p className="mt-4 font-semibold text-slate-300">
                          Select a class first
                        </p>
                      </div>
                    )}

                    {errors.subjects && (
                      <p className="flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle size={16} />
                        {errors.subjects}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* =================================================
                    STEP 4
                ================================================= */}

                {currentStep === 4 && (
                  <motion.div
                    key="guardian"
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -15,
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h4 className="text-lg font-bold">
                        Guardian Information
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Provide the parent or guardian
                        details.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Guardian First Name"
                        name="guardianFirstName"
                        value={
                          form.guardianFirstName
                        }
                        onChange={handleChange}
                        error={
                          errors.guardianFirstName
                        }
                        placeholder="First name"
                        icon={User}
                      />

                      <InputField
                        label="Guardian Last Name"
                        name="guardianLastName"
                        value={
                          form.guardianLastName
                        }
                        onChange={handleChange}
                        error={
                          errors.guardianLastName
                        }
                        placeholder="Last name"
                        icon={User}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <SelectField
                        label="Relationship"
                        name="guardianRelationship"
                        value={
                          form.guardianRelationship
                        }
                        onChange={handleChange}
                        error={
                          errors.guardianRelationship
                        }
                        placeholder="Select relationship"
                        options={[
                          "Father",
                          "Mother",
                          "Guardian",
                          "Uncle",
                          "Aunt",
                          "Grandparent",
                          "Sibling",
                          "Other",
                        ]}
                      />

                      <InputField
                        label="Guardian Phone"
                        name="guardianPhone"
                        value={form.guardianPhone}
                        onChange={handleChange}
                        error={
                          errors.guardianPhone
                        }
                        placeholder="08012345678"
                        icon={Phone}
                      />
                    </div>

                    <InputField
                      label="Guardian Email"
                      name="guardianEmail"
                      value={form.guardianEmail}
                      onChange={handleChange}
                      error={errors.guardianEmail}
                      placeholder="guardian@example.com"
                      type="email"
                      icon={Mail}
                      required={false}
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      <SelectField
                        label="State"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        error={errors.state}
                        placeholder="Select state"
                        options={NIGERIAN_STATES}
                      />

                      <InputField
                        label="City"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        error={errors.city}
                        placeholder="Enter city"
                        icon={MapPin}
                      />
                    </div>
                  </motion.div>
                )}

                {/* =================================================
                    STEP 5
                ================================================= */}

                {currentStep === 5 && (
                  <motion.div
                    key="review"
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -15,
                    }}
                    className="space-y-7"
                  >
                    <div>
                      <h4 className="text-lg font-bold">
                        Review Enrollment
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Check your information before
                        submitting your registration.
                      </p>
                    </div>

                    {/* STUDENT */}

                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                          <User size={18} />
                        </div>

                        <div>
                          <h5 className="font-bold">
                            Student
                          </h5>

                          <p className="text-xs text-slate-500">
                            Personal information
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 text-sm sm:grid-cols-2">
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
                          label="Gender"
                          value={form.gender}
                        />

                        <ReviewItem
                          label="Date of Birth"
                          value={form.dateOfBirth}
                        />

                        <ReviewItem
                          label="Phone"
                          value={form.studentPhone}
                        />

                        <ReviewItem
                          label="Email"
                          value={form.email}
                        />
                      </div>
                    </div>

                    {/* ACADEMICS */}

                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
                          <School size={18} />
                        </div>

                        <div>
                          <h5 className="font-bold">
                            Academics
                          </h5>

                          <p className="text-xs text-slate-500">
                            Academic information
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 text-sm sm:grid-cols-3">
                        <ReviewItem
                          label="Level"
                          value={form.schoolLevel}
                        />

                        <ReviewItem
                          label="Class"
                          value={form.grade}
                        />

                        <ReviewItem
                          label="Session"
                          value={
                            form.academicSession
                          }
                        />
                      </div>
                    </div>

                    {/* SUBJECTS */}

                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                          <BookOpen size={18} />
                        </div>

                        <div>
                          <h5 className="font-bold">
                            Subjects
                          </h5>

                          <p className="text-xs text-slate-500">
                            {form.grade}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {form.subjects.map(
                          (subject) => (
                            <span
                              key={subject}
                              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-200"
                            >
                              {subject}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* GUARDIAN */}

                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                          <Users size={18} />
                        </div>

                        <div>
                          <h5 className="font-bold">
                            Guardian
                          </h5>

                          <p className="text-xs text-slate-500">
                            Parent/guardian information
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 text-sm sm:grid-cols-2">
                        <ReviewItem
                          label="Name"
                          value={`${form.guardianFirstName} ${form.guardianLastName}`}
                        />

                        <ReviewItem
                          label="Relationship"
                          value={
                            form.guardianRelationship
                          }
                        />

                        <ReviewItem
                          label="Phone"
                          value={form.guardianPhone}
                        />

                        <ReviewItem
                          label="Location"
                          value={`${form.city}, ${form.state}`}
                        />
                      </div>
                    </div>

                    {/* PAYMENT */}

                    <div className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.09] via-blue-500/[0.04] to-violet-500/[0.05]">
                      <div className="border-b border-white/10 px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                            <WalletCards
                              size={20}
                              className="text-cyan-400"
                            />
                          </div>

                          <div>
                            <h5 className="font-bold">
                              Acceptance Fee
                            </h5>

                            <p className="text-xs text-slate-500">
                              Payment required after
                              registration
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                        <div className="bg-slate-950/60 p-5">
                          <p className="text-xs text-slate-500">
                            Amount
                          </p>

                          <p className="mt-1 text-2xl font-black text-cyan-300">
                            ₦2,000
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-5">
                          <p className="text-xs text-slate-500">
                            Payment Method
                          </p>

                          <p className="mt-1 font-bold text-white">
                            Bank Transfer
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-5">
                          <p className="text-xs text-slate-500">
                            Bank / Wallet
                          </p>

                          <p className="mt-1 font-bold text-white">
                            Opay
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-5">
                          <p className="text-xs text-slate-500">
                            Account Number
                          </p>

                          <p className="mt-1 font-mono font-bold tracking-wide text-cyan-300">
                            8104264197
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-5 sm:col-span-2">
                          <p className="text-xs text-slate-500">
                            Account Name
                          </p>

                          <p className="mt-1 font-bold text-white">
                            Komolafe Damilare Paul
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 px-5 py-4">
                        <p className="text-xs leading-5 text-slate-400">
                          After submitting this
                          registration, you will be taken
                          to the payment page where you can
                          complete the ₦2,000 transfer and
                          submit your payment reference for
                          verification.
                        </p>
                      </div>
                    </div>

                    {/* AGREEMENT */}

                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <input
                        type="checkbox"
                        name="agree"
                        checked={form.agree}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 accent-cyan-500"
                      />

                      <span className="text-sm leading-6 text-slate-400">
                        I confirm that the information
                        provided is accurate and I agree to
                        the Scholiqen Academy enrollment
                        terms. I understand that the
                        acceptance fee is{" "}
                        <strong className="text-cyan-300">
                          ₦2,000
                        </strong>{" "}
                        and payment must be verified before
                        final approval.
                      </span>
                    </label>

                    {errors.agree && (
                      <p className="flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle size={16} />
                        {errors.agree}
                      </p>
                    )}

                    {errors.submit && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                        {errors.submit}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-950/30 transition hover:scale-[1.01]"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={submitEnrollment}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-950/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating Enrollment...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}