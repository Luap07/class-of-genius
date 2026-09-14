import React, { useEffect, useMemo, useState } from "react";
import {
  Megaphone,
  Plus,
  Send,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Users,
  BookOpen,
  X,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ANNOUNCEMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/announcements`;

/* =========================================================
   GET TUTOR REFERENCE
========================================================= */

const getTutorReference = () => {
  const keys = [
    "tutorReference",
    "tutor_reference",
    "tutor",
    "academyTutor",
    "scholiqen_user",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);

        if (typeof parsed === "string" && parsed.trim()) {
          return parsed.trim();
        }

        if (parsed && typeof parsed === "object") {
          const reference =
            parsed.tutorReference ||
            parsed.tutor_reference ||
            parsed.reference ||
            parsed.applicationReference ||
            parsed.application_reference ||
            parsed.id ||
            parsed.userReference ||
            parsed.user_reference;

          if (reference) {
            return String(reference).trim();
          }
        }
      } catch {
        if (raw.trim()) {
          return raw.trim();
        }
      }
    } catch {
      // Ignore invalid localStorage entries
    }
  }

  return "";
};

/* =========================================================
   SAFE PARSE
========================================================= */

const safeParse = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

/* =========================================================
   GET ENROLLMENT DATA
========================================================= */

const getEnrollmentData = () => {
  const keys = [
    "enrollment",
    "enrollments",
    "academyEnrollment",
    "academy_enrollment",
    "tutorEnrollment",
    "tutor_enrollment",
    "tutorAssignments",
    "tutor_assignments",
    "classAssignments",
    "class_assignments",
    "academyTutor",
    "tutor",
    "scholiqen_user",
  ];

  const results = [];

  keys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) return;

      const parsed = safeParse(raw);

      if (parsed) {
        results.push(parsed);
      }
    } catch {
      // Ignore
    }
  });

  return results;
};

/* =========================================================
   FLATTEN OBJECTS
========================================================= */

const flattenObjects = (value, output = []) => {
  if (!value) return output;

  if (Array.isArray(value)) {
    value.forEach((item) => {
      flattenObjects(item, output);
    });

    return output;
  }

  if (typeof value === "object") {
    output.push(value);

    Object.values(value).forEach((child) => {
      if (
        child &&
        typeof child === "object"
      ) {
        flattenObjects(child, output);
      }
    });
  }

  return output;
};

/* =========================================================
   GET VALUE FROM OBJECT
========================================================= */

const getValue = (object, keys) => {
  if (!object || typeof object !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = object[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      return String(value).trim();
    }
  }

  return "";
};

/* =========================================================
   BUILD CLASS + SUBJECT OPTIONS

   IMPORTANT:
   SUBJECTS ARE NOT FILTERED BY CLASS.

   The subject dropdown contains ALL subjects found
   in the tutor enrollment data.
========================================================= */

const buildEnrollmentOptions = () => {
  const sources = getEnrollmentData();

  const objects = [];

  sources.forEach((source) => {
    flattenObjects(source, objects);
  });

  const classMap = new Map();
  const subjectMap = new Map();

  objects.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const classId = getValue(item, [
      "classId",
      "class_id",
      "gradeId",
      "grade_id",
      "classReference",
      "class_reference",
      "classRef",
      "class_ref",
    ]);

    const className = getValue(item, [
      "className",
      "class_name",
      "grade",
      "class",
      "level",
      "classTitle",
      "class_title",
    ]);

    const subject = getValue(item, [
      "subject",
      "subjectName",
      "subject_name",
      "subjectTitle",
      "subject_title",
    ]);

    /* -----------------------------
       CLASSES
    ----------------------------- */

    if (className) {
      const finalClassId =
        classId || className;

      if (!classMap.has(finalClassId)) {
        classMap.set(finalClassId, {
          id: finalClassId,
          name: className,
        });
      }
    }

    /* -----------------------------
       ALL SUBJECTS
    ----------------------------- */

    if (subject) {
      const normalized =
        subject.toLowerCase();

      if (!subjectMap.has(normalized)) {
        subjectMap.set(
          normalized,
          subject
        );
      }
    }
  });

  return {
    classes: Array.from(
      classMap.values()
    ),

    subjects: Array.from(
      subjectMap.values()
    ).sort((a, b) =>
      a.localeCompare(b)
    ),
  };
};

/* =========================================================
   NORMALIZE ANNOUNCEMENT
========================================================= */

const normalizeAnnouncement = (item) => ({
  id:
    item?.id ??
    item?.announcementId ??
    item?.announcement_id,

  tutorReference:
    item?.tutorReference ??
    item?.tutor_reference ??
    "",

  classId:
    item?.classId ??
    item?.class_id ??
    "",

  className:
    item?.className ??
    item?.class_name ??
    item?.grade ??
    "",

  subject:
    item?.subject ??
    item?.subject_name ??
    "",

  title:
    item?.title ??
    "",

  message:
    item?.message ??
    item?.content ??
    "",

  createdAt:
    item?.createdAt ??
    item?.created_at ??
    null,
});

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorAnnouncements() {
  const tutorReference = useMemo(
    () => getTutorReference(),
    []
  );

  const [announcements, setAnnouncements] =
    useState([]);

  const [classes, setClasses] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [selectedClass, setSelectedClass] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [publishing, setPublishing] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =========================================================
     LOAD ENROLLMENT OPTIONS
  ========================================================= */

  useEffect(() => {
    const options =
      buildEnrollmentOptions();

    setClasses(options.classes);
    setSubjects(options.subjects);
  }, []);

  /* =========================================================
     API FETCH
  ========================================================= */

  const apiFetch = async (
    url,
    options = {}
  ) => {
    const headers = {
      Accept: "application/json",

      ...(options.body
        ? {
            "Content-Type":
              "application/json",
          }
        : {}),

      ...(tutorReference
        ? {
            "x-tutor-reference":
              tutorReference,
          }
        : {}),

      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let data;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      const text =
        await response.text();

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = {
          message: text,
        };
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          data?.details ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  /* =========================================================
     LOAD ANNOUNCEMENTS
  ========================================================= */

  const loadAnnouncements =
    async () => {
      setLoading(true);
      setError("");

      try {
        if (!tutorReference) {
          throw new Error(
            "Tutor reference was not found. Please log in again."
          );
        }

        const data =
          await apiFetch(
            ANNOUNCEMENTS_URL
          );

        const rows =
          data?.announcements ??
          data?.data ??
          data?.results ??
          [];

        setAnnouncements(
          Array.isArray(rows)
            ? rows.map(
                normalizeAnnouncement
              )
            : []
        );
      } catch (err) {
        console.error(
          "Tutor announcements error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load announcements."
        );

        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  /* =========================================================
     SELECTED CLASS NAME
  ========================================================= */

  const selectedClassName =
    useMemo(() => {
      const found =
        classes.find(
          (item) =>
            String(item.id) ===
            String(selectedClass)
        );

      return found?.name || "";
    }, [
      classes,
      selectedClass,
    ]);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setTitle("");
    setMessage("");
  };

  /* =========================================================
     PUBLISH
  ========================================================= */

  const publishAnnouncement =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (!tutorReference) {
        setError(
          "Tutor reference was not found. Please log in again."
        );
        return;
      }

      if (!selectedClass) {
        setError(
          "Please select a class."
        );
        return;
      }

      if (!selectedSubject) {
        setError(
          "Please select a subject."
        );
        return;
      }

      if (!title.trim()) {
        setError(
          "Please enter an announcement title."
        );
        return;
      }

      if (!message.trim()) {
        setError(
          "Please enter your announcement."
        );
        return;
      }

      setPublishing(true);

      try {
        const payload = {
          tutorReference:
            tutorReference,

          tutor_reference:
            tutorReference,

          classId:
            selectedClass,

          class_id:
            selectedClass,

          className:
            selectedClassName,

          class_name:
            selectedClassName,

          grade:
            selectedClassName,

          subject:
            selectedSubject,

          subject_name:
            selectedSubject,

          title:
            title.trim(),

          message:
            message.trim(),

          content:
            message.trim(),
        };

        console.log(
          "Publishing announcement:",
          payload
        );

        await apiFetch(
          ANNOUNCEMENTS_URL,
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

        setSuccess(
          "Announcement published successfully."
        );

        resetForm();

        await loadAnnouncements();
      } catch (err) {
        console.error(
          "Publish announcement error:",
          err
        );

        setError(
          err?.message ||
            "Failed to publish announcement."
        );
      } finally {
        setPublishing(false);
      }
    };

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteAnnouncement =
    async (id) => {
      if (!id) return;

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this announcement?"
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(id);
      setError("");
      setSuccess("");

      try {
        await apiFetch(
          `${ANNOUNCEMENTS_URL}/${id}`,
          {
            method: "DELETE",
          }
        );

        setAnnouncements(
          (current) =>
            current.filter(
              (announcement) =>
                String(
                  announcement.id
                ) !== String(id)
            )
        );

        setSuccess(
          "Announcement deleted successfully."
        );
      } catch (err) {
        console.error(
          "Delete announcement error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete announcement."
        );
      } finally {
        setDeletingId(null);
      }
    };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc]">
      <div className="w-full px-4 py-5 md:px-6 md:py-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
              <Megaphone
                size={24}
                className="text-indigo-600"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                Announcements
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Send announcements directly
                to your students.
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={19} />

            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span className="break-words">
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* CREATE */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Plus
                size={20}
                className="text-indigo-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Create Announcement
              </h2>

              <p className="text-sm text-slate-500">
                Choose the class and subject
                for this announcement.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              publishAnnouncement
            }
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* CLASS */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Class
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={
                      selectedClass
                    }
                    onChange={(e) =>
                      setSelectedClass(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">
                      Select class
                    </option>

                    {classes.map(
                      (item) => (
                        <option
                          key={String(
                            item.id
                          )}
                          value={
                            item.id
                          }
                        >
                          {item.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {classes.length ===
                  0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No class assignments
                    were found in your
                    enrollment data.
                  </p>
                )}
              </div>

              {/* SUBJECT - ALL SUBJECTS */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subject
                </label>

                <div className="relative">
                  <BookOpen
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={
                      selectedSubject
                    }
                    onChange={(e) =>
                      setSelectedSubject(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">
                      Select subject
                    </option>

                    {subjects.map(
                      (subject) => (
                        <option
                          key={
                            subject
                          }
                          value={
                            subject
                          }
                        >
                          {subject}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {subjects.length ===
                  0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No subjects were found
                    in your enrollment data.
                  </p>
                )}
              </div>

              {/* TITLE */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Announcement Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Enter announcement title"
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* MESSAGE */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder="Write your announcement here..."
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* PUBLISH */}
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={
                  publishing
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {publishing ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Publish Announcement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Published Announcements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Announcements you have sent
                to students.
              </p>
            </div>

            <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              {announcements.length}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading announcements...
              </div>
            </div>
          ) : announcements.length ===
            0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Megaphone
                  size={22}
                  className="text-slate-400"
                />
              </div>

              <h3 className="font-semibold text-slate-700">
                No announcements yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Create your first announcement
                above and it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(
                (announcement) => (
                  <div
                    key={String(
                      announcement.id
                    )}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30 md:p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="mb-3 flex flex-wrap items-center gap-2">

                          {announcement.className && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                              <Users size={13} />
                              {
                                announcement.className
                              }
                            </span>
                          )}

                          {announcement.subject && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              <BookOpen
                                size={13}
                              />
                              {
                                announcement.subject
                              }
                            </span>
                          )}

                        </div>

                        <h3 className="break-words text-base font-bold text-slate-900 md:text-lg">
                          {
                            announcement.title
                          }
                        </h3>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                          {
                            announcement.message
                          }
                        </p>

                        {announcement.createdAt && (
                          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              announcement.createdAt
                            )}
                          </div>
                        )}

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteAnnouncement(
                            announcement.id
                          )
                        }
                        disabled={
                          deletingId ===
                          announcement.id
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId ===
                        announcement.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={17}
                          />
                        )}

                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
