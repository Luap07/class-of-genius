import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  useOutletContext,
} from "react-router-dom";

/* =========================================================
   HELPERS
========================================================= */

const readStoredStudent = () => {
  try {
    const stored =
      localStorage.getItem("scholiqen_student") ||
      localStorage.getItem("academyStudent") ||
      localStorage.getItem("student") ||
      localStorage.getItem("scholiqen_user");

    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getValue = (
  object,
  keys,
  fallback = ""
) => {
  for (const key of keys) {
    if (
      object?.[key] !== undefined &&
      object?.[key] !== null &&
      String(object[key]).trim() !== ""
    ) {
      return String(object[key]);
    }
  }

  return fallback;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentProfile() {
  const outletContext = useOutletContext();

  const contextStudent =
    outletContext?.student || null;

  const [student, setStudent] = useState(
    contextStudent || readStoredStudent()
  );

  const [isEditing, setIsEditing] =
    useState(false);

  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    school: "",
    grade: "",
  });

  useEffect(() => {
    const currentStudent =
      contextStudent || readStoredStudent();

    setStudent(currentStudent);

    setForm({
      firstName: getValue(
        currentStudent,
        [
          "firstName",
          "first_name",
        ]
      ),
      lastName: getValue(
        currentStudent,
        [
          "lastName",
          "last_name",
        ]
      ),
      email: getValue(
        currentStudent,
        ["email"]
      ),
      phone: getValue(
        currentStudent,
        [
          "phone",
          "phoneNumber",
          "phone_number",
        ]
      ),
      dateOfBirth: getValue(
        currentStudent,
        [
          "dateOfBirth",
          "date_of_birth",
          "dob",
        ]
      ),
      gender: getValue(
        currentStudent,
        ["gender"]
      ),
      address: getValue(
        currentStudent,
        [
          "address",
          "homeAddress",
          "home_address",
        ]
      ),
      school: getValue(
        currentStudent,
        [
          "school",
          "schoolName",
          "school_name",
        ]
      ),
      grade: getValue(
        currentStudent,
        [
          "grade",
          "class",
          "level",
        ]
      ),
    });
  }, [contextStudent]);

  const firstName = getValue(
    student,
    [
      "firstName",
      "first_name",
    ],
    form.firstName || "Student"
  );

  const lastName = getValue(
    student,
    [
      "lastName",
      "last_name",
    ],
    form.lastName
  );

  const fullName =
    getValue(
      student,
      [
        "fullName",
        "full_name",
        "name",
      ],
      `${firstName} ${lastName}`.trim()
    ) || "Student";

  const email = getValue(
    student,
    ["email"],
    form.email || "Not provided"
  );

  const reference = getValue(
    student,
    [
      "reference",
      "studentReference",
      "student_reference",
      "enrollmentReference",
      "enrollment_reference",
    ],
    "SCH-STUDENT"
  );

  const accountStatus = getValue(
    student,
    [
      "accountStatus",
      "account_status",
      "status",
    ],
    "Active"
  );

  const enrollmentStatus = getValue(
    student,
    [
      "enrollmentStatus",
      "enrollment_status",
    ],
    "Verified"
  );

  const initials = useMemo(() => {
    const parts = fullName
      .split(" ")
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`
      .toUpperCase();
  }, [fullName]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const updatedStudent = {
      ...student,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      address: form.address,
      school: form.school,
      grade: form.grade,
      fullName:
        `${form.firstName} ${form.lastName}`.trim(),
    };

    setStudent(updatedStudent);

    const storageKeys = [
      "scholiqen_student",
      "academyStudent",
      "student",
      "scholiqen_user",
    ];

    storageKeys.forEach((key) => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.setItem(
            key,
            JSON.stringify(updatedStudent)
          );
        }
      } catch {
        // Ignore storage errors.
      }
    });

    setIsEditing(false);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleCancel = () => {
    setForm({
      firstName: getValue(
        student,
        [
          "firstName",
          "first_name",
        ]
      ),
      lastName: getValue(
        student,
        [
          "lastName",
          "last_name",
        ]
      ),
      email: getValue(
        student,
        ["email"]
      ),
      phone: getValue(
        student,
        [
          "phone",
          "phoneNumber",
          "phone_number",
        ]
      ),
      dateOfBirth: getValue(
        student,
        [
          "dateOfBirth",
          "date_of_birth",
          "dob",
        ]
      ),
      gender: getValue(
        student,
        ["gender"]
      ),
      address: getValue(
        student,
        [
          "address",
          "homeAddress",
          "home_address",
        ]
      ),
      school: getValue(
        student,
        [
          "school",
          "schoolName",
          "school_name",
        ]
      ),
      grade: getValue(
        student,
        [
          "grade",
          "class",
          "level",
        ]
      ),
    });

    setIsEditing(false);
  };

  return (
    <div className="min-h-full bg-[#020617] text-slate-100">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              <User size={14} />
              Student Profile
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage your personal information and view
              your Scholiqen Academy account details.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() =>
                setIsEditing(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800"
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <Save size={17} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          SAVE MESSAGE
      ===================================================== */}

      {saved && (
        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
        >
          <CheckCircle2 size={18} />
          Your profile has been updated successfully.
        </motion.div>
      )}

      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#071426] via-slate-900/80 to-[#020617]">
        <div className="relative p-6 md:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10 text-2xl font-bold text-cyan-400 shadow-lg shadow-cyan-950/20">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white">
                  {fullName}
                </h2>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 size={12} />
                  {accountStatus}
                </span>
              </div>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Mail size={15} />
                {email}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400">
                  Student
                </span>

                <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400">
                  {reference}
                </span>

                <span className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 px-3 py-1.5 text-xs text-cyan-400">
                  {enrollmentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* ===================================================
            PERSONAL INFORMATION
        =================================================== */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <User size={19} />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Personal Information
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Your basic student information
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                First Name
              </label>

              {isEditing ? (
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                />
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  {form.firstName || "Not provided"}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Last Name
              </label>

              {isEditing ? (
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                />
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  {form.lastName || "Not provided"}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Email Address
              </label>

              {isEditing ? (
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  <Mail
                    size={15}
                    className="text-slate-500"
                  />
                  {form.email || "Not provided"}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Phone Number
              </label>

              {isEditing ? (
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  <Phone
                    size={15}
                    className="text-slate-500"
                  />
                  {form.phone || "Not provided"}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Date of Birth
              </label>

              {isEditing ? (
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  <CalendarDays
                    size={15}
                    className="text-slate-500"
                  />
                  {form.dateOfBirth || "Not provided"}
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Gender
              </label>

              {isEditing ? (
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>
                </select>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                  {form.gender || "Not provided"}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Address
              </label>

              {isEditing ? (
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                />
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-slate-200">
                  <MapPin
                    size={15}
                    className="mt-1 shrink-0 text-slate-500"
                  />
                  <span>
                    {form.address ||
                      "No address provided"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            ACADEMIC / ACCOUNT
        =================================================== */}

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="border-b border-slate-800 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <GraduationCap size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-white">
                    Academic Details
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Your current school information
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="school"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  School
                </label>

                {isEditing ? (
                  <input
                    id="school"
                    name="school"
                    value={form.school}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                  />
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                    {form.school ||
                      "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="grade"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Class / Grade
                </label>

                {isEditing ? (
                  <input
                    id="grade"
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
                  />
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                    {form.grade ||
                      "Not provided"}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-4">
                <div className="flex items-start gap-3">
                  <BookOpen
                    size={18}
                    className="mt-0.5 text-cyan-400"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Learning Track
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your subjects, lessons, tasks and CBT
                      activities are connected to your
                      student account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Account Status */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="border-b border-slate-800 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-white">
                    Account Status
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Student account verification
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Account
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Current account status
                  </p>
                </div>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  {accountStatus}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Enrollment
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Enrollment verification
                  </p>
                </div>

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                  {enrollmentStatus}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Student Reference
                </p>

                <p className="mt-2 break-all font-mono text-sm text-slate-300">
                  {reference}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* =====================================================
          PROFILE INFORMATION NOTICE
      ===================================================== */}

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-start gap-3">
          <Bell
            size={18}
            className="mt-0.5 shrink-0 text-slate-500"
          />

          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Keep your information up to date
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Make sure your contact and academic details
              are accurate so your Scholiqen Academy records
              remain up to date.
            </p>
          </div>

          <ChevronRight
            size={17}
            className="ml-auto mt-0.5 shrink-0 text-slate-700"
          />
        </div>
      </section>

      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div className="mt-6 flex items-center justify-center gap-2 pb-4 text-xs text-slate-600">
        <ShieldCheck size={13} />
        Your student profile is connected to your Academy
        account.
      </div>
    </div>
  );
}
