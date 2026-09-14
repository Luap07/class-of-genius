import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Clock,
  BookOpen,
  Camera,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const API_BASE_URL = `${API_URL}/api/academy`;

const EMPTY_FORM = {
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

  profileImage: "",
};

function getTutorReference() {
  const sources = [
    localStorage.getItem("tutorReference"),
    localStorage.getItem("tutor_reference"),
  ];

  for (const value of sources) {
    if (value && value !== "undefined" && value !== "null") {
      return value;
    }
  }

  const raw =
    localStorage.getItem("tutor") ||
    localStorage.getItem("academyTutor") ||
    localStorage.getItem("scholiqen_user");

  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);

    return (
      parsed?.tutorReference ||
      parsed?.reference ||
      parsed?.tutor_reference ||
      parsed?.applicationReference ||
      parsed?.application_reference ||
      parsed?.id ||
      ""
    );
  } catch {
    return "";
  }
}

function getImageUrl(image) {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;

  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeProfile(data) {
  const profile =
    data?.profile ||
    data?.tutor ||
    data?.data ||
    data ||
    {};

  return {
    ...EMPTY_FORM,

    firstName: profile.firstName || "",
    middleName: profile.middleName || "",
    lastName: profile.lastName || "",

    email: profile.email || "",
    phone: profile.phone || "",

    gender: profile.gender || "",
    dateOfBirth: profile.dateOfBirth || "",

    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",

    teachingLevel: normalizeArray(
      profile.teachingLevel
    ),

    assignments: normalizeArray(
      profile.assignments
    ),

    yearsExperience:
      profile.yearsExperience || "",

    currentOccupation:
      profile.currentOccupation || "",

    highestQualification:
      profile.highestQualification || "",

    institution:
      profile.institution || "",

    courseOfStudy:
      profile.courseOfStudy || "",

    graduationYear:
      profile.graduationYear || "",

    professionalCertification:
      profile.professionalCertification || "",

    availableDays:
      normalizeArray(profile.availableDays),

    availableFrom:
      profile.availableFrom || "",

    availableTo:
      profile.availableTo || "",

    preferredMode:
      profile.preferredMode || "",

    motivation:
      profile.motivation || "",

    teachingExperience:
      profile.teachingExperience || "",

    profileImage:
      profile.profileImage ||
      profile.profileImageUrl ||
      "",
  };
}

export default function TutorProfile() {
  const fileInputRef = useRef(null);

  const tutorReference = useMemo(
    () => getTutorReference(),
    []
  );

  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-tutor-reference": tutorReference,
  };

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      if (!tutorReference) {
        throw new Error(
          "Tutor reference was not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/tutor/profile`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-tutor-reference": tutorReference,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load tutor profile."
        );
      }

      setForm(normalizeProfile(data));
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateAssignment(
    index,
    field,
    value
  ) {
    setForm((prev) => {
      const assignments = [...prev.assignments];

      assignments[index] = {
        ...assignments[index],
        [field]: value,
      };

      return {
        ...prev,
        assignments,
      };
    });
  }

  function addAssignment() {
    setForm((prev) => ({
      ...prev,
      assignments: [
        ...prev.assignments,
        {
          class: "",
          subjects: [],
        },
      ],
    }));
  }

  function removeAssignment(index) {
    setForm((prev) => ({
      ...prev,
      assignments: prev.assignments.filter(
        (_, i) => i !== index
      ),
    }));
  }

  function toggleDay(day) {
    setForm((prev) => {
      const exists =
        prev.availableDays.includes(day);

      return {
        ...prev,
        availableDays: exists
          ? prev.availableDays.filter(
              (item) => item !== day
            )
          : [...prev.availableDays, day],
      };
    });
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/tutor/profile`,
        {
          method: "PATCH",
          headers,
          credentials: "include",
          body: JSON.stringify({
            ...form,

            first_name: form.firstName,
            middle_name: form.middleName,
            last_name: form.lastName,

            date_of_birth: form.dateOfBirth,

            teaching_level: form.teachingLevel,

            assignments: form.assignments,

            years_experience:
              form.yearsExperience,

            current_occupation:
              form.currentOccupation,

            highest_qualification:
              form.highestQualification,

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
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to save profile."
        );
      }

      setForm(normalizeProfile(data));

      setEditing(false);

      setMessage(
        "Your profile has been updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (err) {
      setError(
        err?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Image must be smaller than 10MB."
      );
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const previewUrl =
        URL.createObjectURL(file);

      setForm((prev) => ({
        ...prev,
        profileImage: previewUrl,
      }));

      const formData = new FormData();

      formData.append("image", file);
      formData.append(
        "tutorReference",
        tutorReference
      );

      const response = await fetch(
        `${API_BASE_URL}/tutor/profile/image`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "x-tutor-reference":
              tutorReference,
          },
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to upload image."
        );
      }

      setForm((prev) => ({
        ...prev,
        profileImage:
          data.profileImage ||
          data.profileImageUrl ||
          data.imageUrl ||
          prev.profileImage,
      }));

      setMessage(
        "Profile picture updated successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (err) {
      setError(
        err?.message ||
          "Failed to upload profile picture."
      );
    } finally {
      setUploadingImage(false);

      if (event.target) {
        event.target.value = "";
      }
    }
  }

  const fullName = [
    form.firstName,
    form.middleName,
    form.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm text-slate-400 mb-1">
              Tutor Account
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              My Profile
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your registration and teaching information.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-200 transition"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  loadProfile();
                }}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* PROFILE HEADER CARD */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 mb-6">

          <div className="flex flex-col md:flex-row md:items-center gap-6">

            <div className="relative w-fit">

              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 flex items-center justify-center">

                {form.profileImage ? (
                  <img
                    src={getImageUrl(
                      form.profileImage
                    )}
                    alt={fullName || "Tutor"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-slate-500" />
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploadingImage}
                className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center border-4 border-slate-900 transition"
              >
                {uploadingImage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1">

              <h2 className="text-2xl md:text-3xl font-bold">
                {fullName || "Tutor"}
              </h2>

              <p className="text-slate-400 mt-1">
                {form.email || "No email"}
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Tutor Reference:{" "}
                <span className="text-slate-300">
                  {tutorReference}
                </span>
              </p>

              <div className="flex flex-wrap gap-2 mt-4">

                {form.teachingLevel.map(
                  (level) => (
                    <span
                      key={level}
                      className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm"
                    >
                      {level}
                    </span>
                  )
                )}

              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <Section
          icon={<User className="w-5 h-5" />}
          title="Personal Information"
        >

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <Field
              label="First Name"
              value={form.firstName}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "firstName",
                  value
                )
              }
            />

            <Field
              label="Middle Name"
              value={form.middleName}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "middleName",
                  value
                )
              }
            />

            <Field
              label="Last Name"
              value={form.lastName}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "lastName",
                  value
                )
              }
            />

            <Field
              label="Email"
              value={form.email}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "email",
                  value
                )
              }
              type="email"
            />

            <Field
              label="Phone"
              value={form.phone}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "phone",
                  value
                )
              }
            />

            <Field
              label="Gender"
              value={form.gender}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "gender",
                  value
                )
              }
            />

            <Field
              label="Date of Birth"
              value={form.dateOfBirth}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "dateOfBirth",
                  value
                )
              }
              type="date"
            />

            <Field
              label="Address"
              value={form.address}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "address",
                  value
                )
              }
            />

            <Field
              label="City"
              value={form.city}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "city",
                  value
                )
              }
            />

            <Field
              label="State"
              value={form.state}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "state",
                  value
                )
              }
            />

          </div>
        </Section>

        {/* TEACHING */}
        <Section
          icon={
            <GraduationCap className="w-5 h-5" />
          }
          title="Teaching Information"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Field
              label="Years of Experience"
              value={form.yearsExperience}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "yearsExperience",
                  value
                )
              }
            />

            <Field
              label="Current Occupation"
              value={form.currentOccupation}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "currentOccupation",
                  value
                )
              }
            />

          </div>

          <div className="mt-7">

            <div className="flex items-center justify-between mb-4">

              <h3 className="font-semibold text-lg">
                Class & Subject Assignments
              </h3>

              {editing && (
                <button
                  type="button"
                  onClick={addAssignment}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
                >
                  + Add Assignment
                </button>
              )}

            </div>

            <div className="space-y-3">

              {form.assignments.length === 0 && (
                <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-5 text-slate-400">
                  No class assignments available.
                </div>
              )}

              {form.assignments.map(
                (assignment, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-slate-800/50 border border-slate-700 p-4"
                  >

                    <div className="flex flex-col md:flex-row gap-4">

                      <div className="flex-1">

                        <label className="block text-sm text-slate-400 mb-2">
                          Class
                        </label>

                        {editing ? (
                          <input
                            value={
                              assignment.class ||
                              ""
                            }
                            onChange={(e) =>
                              updateAssignment(
                                index,
                                "class",
                                e.target.value
                              )
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500"
                          />
                        ) : (
                          <div className="font-medium">
                            {assignment.class ||
                              "Not specified"}
                          </div>
                        )}

                      </div>

                      <div className="flex-[2]">

                        <label className="block text-sm text-slate-400 mb-2">
                          Subjects
                        </label>

                        {editing ? (
                          <input
                            value={normalizeArray(
                              assignment.subjects
                            ).join(", ")}
                            onChange={(e) =>
                              updateAssignment(
                                index,
                                "subjects",
                                e.target.value
                                  .split(",")
                                  .map((item) =>
                                    item.trim()
                                  )
                                  .filter(Boolean)
                              )
                            }
                            placeholder="Mathematics, English Studies"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">

                            {normalizeArray(
                              assignment.subjects
                            ).map(
                              (subject) => (
                                <span
                                  key={subject}
                                  className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-sm"
                                >
                                  {subject}
                                </span>
                              )
                            )}

                          </div>
                        )}

                      </div>

                      {editing && (
                        <button
                          type="button"
                          onClick={() =>
                            removeAssignment(
                              index
                            )
                          }
                          className="self-end md:self-center p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}

                    </div>
                  </div>
                )
              )}

            </div>
          </div>
        </Section>

        {/* QUALIFICATIONS */}
        <Section
          icon={
            <BookOpen className="w-5 h-5" />
          }
          title="Qualifications"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Field
              label="Highest Qualification"
              value={
                form.highestQualification
              }
              editing={editing}
              onChange={(value) =>
                updateField(
                  "highestQualification",
                  value
                )
              }
            />

            <Field
              label="Institution"
              value={form.institution}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "institution",
                  value
                )
              }
            />

            <Field
              label="Course of Study"
              value={form.courseOfStudy}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "courseOfStudy",
                  value
                )
              }
            />

            <Field
              label="Graduation Year"
              value={form.graduationYear}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "graduationYear",
                  value
                )
              }
            />

            <Field
              label="Professional Certification"
              value={
                form.professionalCertification
              }
              editing={editing}
              onChange={(value) =>
                updateField(
                  "professionalCertification",
                  value
                )
              }
            />

          </div>
        </Section>

        {/* AVAILABILITY */}
        <Section
          icon={<Clock className="w-5 h-5" />}
          title="Availability"
        >

          <div className="mb-6">

            <label className="block text-sm text-slate-400 mb-3">
              Available Days
            </label>

            <div className="flex flex-wrap gap-2">

              {days.map((day) => {

                const selected =
                  form.availableDays.includes(
                    day
                  );

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={!editing}
                    onClick={() =>
                      toggleDay(day)
                    }
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      selected
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    } ${
                      !editing
                        ? "cursor-default"
                        : "cursor-pointer"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <Field
              label="Available From"
              value={form.availableFrom}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "availableFrom",
                  value
                )
              }
              type="time"
            />

            <Field
              label="Available To"
              value={form.availableTo}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "availableTo",
                  value
                )
              }
              type="time"
            />

            <Field
              label="Preferred Mode"
              value={form.preferredMode}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "preferredMode",
                  value
                )
              }
            />

          </div>
        </Section>

        {/* EXPERIENCE */}
        <Section
          icon={
            <Briefcase className="w-5 h-5" />
          }
          title="Teaching Experience"
        >

          <TextArea
            label="Teaching Experience"
            value={form.teachingExperience}
            editing={editing}
            onChange={(value) =>
              updateField(
                "teachingExperience",
                value
              )
            }
          />

          <div className="mt-5">

            <TextArea
              label="Why do you want to teach?"
              value={form.motivation}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "motivation",
                  value
                )
              }
            />

          </div>
        </Section>

        {/* SAVE BOTTOM */}
        {editing && (
          <div className="flex justify-end gap-3 pb-10">

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                loadProfile();
              }}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}

              Save Changes
            </button>

          </div>
        )}

      </div>
    </div>
  );
}


// ============================================================
// COMPONENTS
// ============================================================

function Section({
  icon,
  title,
  children,
}) {
  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 mb-6">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
          {icon}
        </div>

        <h2 className="text-xl font-bold">
          {title}
        </h2>

      </div>

      {children}
    </section>
  );
}


function Field({
  label,
  value,
  editing,
  onChange,
  type = "text",
}) {
  return (
    <div>

      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>

      {editing ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition"
        />
      ) : (
        <div className="min-h-[48px] flex items-center px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-200">
          {value || (
            <span className="text-slate-500">
              Not provided
            </span>
          )}
        </div>
      )}

    </div>
  );
}


function TextArea({
  label,
  value,
  editing,
  onChange,
}) {
  return (
    <div>

      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>

      {editing ? (
        <textarea
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          rows={5}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
        />
      ) : (
        <div className="min-h-[120px] px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-200 whitespace-pre-wrap">
          {value || (
            <span className="text-slate-500">
              Not provided
            </span>
          )}
        </div>
      )}

    </div>
  );
}