import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock3,
  Edit3,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  Users,
  X,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

/* =========================================================
   OPTIONS
========================================================= */

const CLASS_OPTIONS = [
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

const PRIMARY_SUBJECTS = [
  "English Studies",
  "Mathematics",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Cultural and Creative Arts",
  "Physical and Health Education",
  "Religious Studies",
];

const JSS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Business Studies",
  "Home Economics",
  "Cultural and Creative Arts",
  "Christian Religious Studies",
  "Islamic Religious Studies",
];

const SS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Literature in English",
  "Civic Education",
  "Agricultural Science",
  "Commerce",
  "Financial Accounting",
  "Geography",
  "Computer Science",
  "Data Processing",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Further Mathematics",
  "French",
];

/* =========================================================
   HELPERS
========================================================= */

function getSubjectsForClass(grade = "") {
  if (grade.startsWith("Primary")) {
    return PRIMARY_SUBJECTS;
  }

  if (grade.startsWith("JSS")) {
    return JSS_SUBJECTS;
  }

  if (grade.startsWith("SS")) {
    return SS_SUBJECTS;
  }

  return [];
}

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

/* =========================================================
   ROBUST ASSIGNMENT ID
========================================================= */

function getAssignmentId(assignment) {
  if (!assignment || typeof assignment !== "object") {
    return null;
  }

  const possibleIds = [
    assignment.id,
    assignment.assignment_id,
    assignment.assignmentId,
    assignment.assignmentID,
    assignment.assignment?.id,
    assignment.assignment?.assignment_id,
    assignment.data?.id,
    assignment.data?.assignment_id,
  ];

  const found = possibleIds.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

  if (
    found === undefined ||
    found === null ||
    String(found).trim() === ""
  ) {
    return null;
  }

  return String(found).trim();
}

/* =========================================================
   TUTOR REFERENCE
========================================================= */

function getTutorReference() {
  const keys = [
    "scholiqen_academy_user",
    "academy_user",
    "scholiqen_user",
    "user",
  ];

  for (const key of keys) {
    try {
      const raw =
        localStorage.getItem(key);

      if (!raw) continue;

      const parsed =
        JSON.parse(raw);

      const references = [
        parsed?.reference,
        parsed?.tutorReference,
        parsed?.tutor_reference,
        parsed?.user?.reference,
        parsed?.user?.tutorReference,
        parsed?.user?.tutor_reference,
        parsed?.user?.tutor?.reference,
        parsed?.user?.tutor?.tutorReference,
        parsed?.user?.tutor?.tutor_reference,
      ];

      const found =
        references.find(
          (value) =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );

      if (found) {
        return String(found).trim();
      }
    } catch {
      // Continue checking other keys.
    }
  }

  return "";
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function isPastDue(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < Date.now();
}

function getQuestionCount(assignment) {
  return Number(
    assignment?.total_questions ??
      assignment?.totalQuestions ??
      assignment?.questions?.length ??
      0
  );
}

function getTotalMarks(assignment) {
  const value =
    assignment?.total_marks ??
    assignment?.totalMarks;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return Number(value);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorAssignments() {
  const navigate = useNavigate();

  const [tutorReference, setTutorReference] =
    useState("");

  const [assignments, setAssignments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [expandedId, setExpandedId] =
    useState(null);

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [editingId, setEditingId] =
    useState(null);

  const [savingId, setSavingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    grade: "",
    subject: "",
    dueDate: "",
  });

  /* =======================================================
     TUTOR REFERENCE
  ======================================================= */

  useEffect(() => {
    const reference =
      getTutorReference();

    setTutorReference(reference);
  }, []);

  /* =======================================================
     FETCH ASSIGNMENTS
  ======================================================= */

  const loadAssignments =
    useCallback(
      async (showRefresh = false) => {
        const reference =
          tutorReference ||
          getTutorReference();

        if (!reference) {
          setLoading(false);
          setError(
            "Your tutor reference could not be found. Please log in again."
          );
          return;
        }

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const url =
            `${ASSIGNMENTS_URL}?reference=${encodeURIComponent(
              reference
            )}`;

          const response =
            await fetch(url);

          let data = null;

          try {
            data =
              await response.json();
          } catch {
            data = null;
          }

          if (!response.ok) {
            throw new Error(
              data?.details ||
                data?.error ||
                data?.message ||
                `Unable to load assignments. Server returned ${response.status}.`
            );
          }

          const loadedAssignments =
            Array.isArray(
              data?.assignments
            )
              ? data.assignments
              : [];

          console.log(
            "Tutor assignments loaded:",
            loadedAssignments
          );

          setAssignments(
            loadedAssignments
          );
        } catch (err) {
          console.error(
            "Load assignments error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load assignments."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [tutorReference]
    );

  useEffect(() => {
    if (tutorReference) {
      loadAssignments();
    }
  }, [
    tutorReference,
    loadAssignments,
  ]);

  /* =======================================================
     SUBJECTS
  ======================================================= */

  const editSubjects = useMemo(
    () =>
      getSubjectsForClass(
        form.grade
      ),
    [form.grade]
  );

  /* =======================================================
     START EDIT
  ======================================================= */

  const startEdit =
    useCallback(
      (assignment) => {
        const id =
          getAssignmentId(
            assignment
          );

        if (!id) {
          console.error(
            "Cannot edit assignment because ID is missing:",
            assignment
          );

          setError(
            "This assignment does not have a valid ID."
          );

          return;
        }

        setEditingId(id);
        setSelectedAssignment(null);

        setForm({
          title:
            clean(
              assignment?.title
            ),
          description:
            clean(
              assignment?.description
            ),
          instructions:
            clean(
              assignment?.instructions
            ),
          grade:
            clean(
              assignment?.grade
            ),
          subject:
            clean(
              assignment?.subject
            ),
          dueDate:
            formatDateTime(
              assignment?.due_date ??
                assignment?.dueDate
            ),
        });

        setError("");
        setSuccess("");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
      []
    );

  /* =======================================================
     CANCEL EDIT
  ======================================================= */

  const cancelEdit =
    useCallback(() => {
      setEditingId(null);

      setForm({
        title: "",
        description: "",
        instructions: "",
        grade: "",
        subject: "",
        dueDate: "",
      });

      setError("");
    }, []);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleFormChange =
    useCallback(
      (field, value) => {
        setForm((current) => ({
          ...current,
          [field]: value,
          ...(field === "grade"
            ? {
                subject: "",
              }
            : {}),
        }));
      },
      []
    );

  /* =======================================================
     SAVE EDIT
  ======================================================= */

  const saveEdit =
    useCallback(
      async () => {
        if (!editingId) {
          return;
        }

        if (
          form.title.trim().length < 3
        ) {
          setError(
            "Assignment title must be at least 3 characters."
          );
          return;
        }

        if (!form.grade) {
          setError(
            "Please select a class."
          );
          return;
        }

        if (!form.subject) {
          setError(
            "Please select a subject."
          );
          return;
        }

        setSavingId(editingId);
        setError("");
        setSuccess("");

        try {
          const response =
            await fetch(
              `${ASSIGNMENTS_URL}/${editingId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  reference:
                    tutorReference,
                  tutorReference:
                    tutorReference,
                  tutor_reference:
                    tutorReference,
                  title:
                    form.title.trim(),
                  description:
                    form.description.trim(),
                  instructions:
                    form.instructions.trim(),
                  class: form.grade,
                  grade: form.grade,
                  subject:
                    form.subject,
                  dueDate:
                    form.dueDate || "",
                }),
              }
            );

          let data = null;

          try {
            data =
              await response.json();
          } catch {
            data = null;
          }

          if (!response.ok) {
            throw new Error(
              data?.details ||
                data?.error ||
                data?.message ||
                `Unable to save assignment. Server returned ${response.status}.`
            );
          }

          const updatedAssignment =
            data?.assignment;

          setAssignments(
            (current) =>
              current.map(
                (assignment) =>
                  String(
                    getAssignmentId(
                      assignment
                    )
                  ) ===
                  String(editingId)
                    ? updatedAssignment ||
                      {
                        ...assignment,
                        title:
                          form.title.trim(),
                        description:
                          form.description.trim(),
                        instructions:
                          form.instructions.trim(),
                        grade:
                          form.grade,
                        subject:
                          form.subject,
                        due_date:
                          form.dueDate ||
                          null,
                      }
                    : assignment
              )
          );

          setEditingId(null);

          setSuccess(
            data?.message ||
              "Assignment saved successfully."
          );

          setTimeout(() => {
            setSuccess("");
          }, 4000);
        } catch (err) {
          console.error(
            "Save assignment error:",
            err
          );

          setError(
            err?.message ||
              "Unable to save assignment."
          );
        } finally {
          setSavingId(null);
        }
      },
      [
        editingId,
        form,
        tutorReference,
      ]
    );

  /* =======================================================
     DELETE
  ======================================================= */

  const confirmDelete =
    useCallback(
      (assignment) => {
        const id =
          getAssignmentId(
            assignment
          );

        if (!id) {
          console.error(
            "Cannot delete assignment because ID is missing:",
            assignment
          );

          setError(
            "This assignment does not have a valid ID."
          );

          return;
        }

        setDeleteTarget(
          assignment
        );
        setError("");
      },
      []
    );

  const cancelDelete =
    useCallback(() => {
      if (deletingId) {
        return;
      }

      setDeleteTarget(null);
    }, [deletingId]);

  const deleteAssignment =
    useCallback(
      async () => {
        if (!deleteTarget) {
          return;
        }

        const id =
          getAssignmentId(
            deleteTarget
          );

        if (!id) {
          setError(
            "This assignment does not have a valid ID."
          );
          setDeleteTarget(null);
          return;
        }

        setDeletingId(id);
        setError("");
        setSuccess("");

        try {
          const response =
            await fetch(
              `${ASSIGNMENTS_URL}/${id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type":
                    "application/json",
                },
              }
            );

          let data = null;

          try {
            data =
              await response.json();
          } catch {
            data = null;
          }

          if (!response.ok) {
            throw new Error(
              data?.details ||
                data?.error ||
                data?.message ||
                `Unable to delete assignment. Server returned ${response.status}.`
            );
          }

          setAssignments(
            (current) =>
              current.filter(
                (assignment) =>
                  String(
                    getAssignmentId(
                      assignment
                    )
                  ) !==
                  String(id)
              )
          );

          if (
            String(editingId) ===
            String(id)
          ) {
            cancelEdit();
          }

          setDeleteTarget(null);

          setSuccess(
            data?.message ||
              "Assignment deleted successfully."
          );

          setTimeout(() => {
            setSuccess("");
          }, 4000);
        } catch (err) {
          console.error(
            "Delete assignment error:",
            err
          );

          setError(
            err?.message ||
              "Unable to delete assignment."
          );
        } finally {
          setDeletingId(null);
        }
      },
      [
        deleteTarget,
        editingId,
        cancelEdit,
      ]
    );

  /* =======================================================
     EXPAND
  ======================================================= */

  const toggleExpanded =
    useCallback(
      (assignment) => {
        const id =
          getAssignmentId(
            assignment
          );

        if (!id) {
          console.error(
            "Cannot expand assignment because ID is missing:",
            assignment
          );
          return;
        }

        setExpandedId(
          (current) =>
            String(current) ===
            String(id)
              ? null
              : id
        );
      },
      []
    );

  /* =======================================================
     VIEW ASSIGNMENT
  ======================================================= */

  const viewAssignment =
    useCallback(
      (assignment) => {
        const id =
          getAssignmentId(
            assignment
          );

        console.log(
          "Opening assignment:",
          {
            assignment,
            assignmentId: id,
          }
        );

        if (!id) {
          setError(
            "This assignment does not have a valid ID."
          );

          return;
        }

        navigate(
          `/academy/tutor/assignments/${encodeURIComponent(
            id
          )}`
        );
      },
      [navigate]
    );

  /* =======================================================
     SUBMISSIONS / GRADING
  ======================================================= */

  const viewSubmissions =
    useCallback(
      (assignment) => {
        const id =
          getAssignmentId(
            assignment
          );

        console.log(
          "Opening assignment submissions:",
          {
            assignment,
            assignmentId: id,
            target:
              id
                ? `/academy/tutor/assignments/${id}/submissions`
                : null,
          }
        );

        if (!id) {
          setError(
            "This assignment does not have a valid ID, so its submissions cannot be opened."
          );

          return;
        }

        /*
         * IMPORTANT:
         *
         * Every grading page MUST contain the assignment ID.
         *
         * Correct:
         * /academy/tutor/assignments/17/submissions
         *
         * Incorrect:
         * /academy/tutor/assignments/grading
         */

        navigate(
          `/academy/tutor/assignments/${encodeURIComponent(
            id
          )}/submissions`
        );
      },
      [navigate]
    );

  /* =======================================================
     NEW ASSIGNMENT
  ======================================================= */

  const createAssignment =
    useCallback(() => {
      navigate(
        "/academy/tutor/assignments/create"
      );
    }, [navigate]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-[#0b1b31] hover:text-white"
          >
            <ArrowLeft
              size={17}
            />
            Back
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                <ClipboardList
                  size={14}
                />
                Academy Assignments
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                My Assignments
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage the assignments you have
                created for your students. Edit,
                save, delete, or review submissions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  loadAssignments(true)
                }
                disabled={
                  loading ||
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-[#0b1b31] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={
                  createAssignment
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-[#020617] transition hover:bg-cyan-400"
              >
                <FileText
                  size={17}
                />
                Create Assignment
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 break-words text-red-200/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 text-red-300 transition hover:bg-red-400/10 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2
              size={19}
            />
            <span>
              {success}
            </span>
          </div>
        )}

        {/* =================================================
            EDIT PANEL
        ================================================= */}

        {editingId && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071426] shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <Edit3
                    size={18}
                    className="text-cyan-300"
                  />

                  <h2 className="text-lg font-bold text-white">
                    Edit Assignment
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  Update the assignment details
                  and save your changes.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                disabled={
                  savingId !== null
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Assignment Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleFormChange(
                      "title",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                  placeholder="Enter assignment title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Class
                </label>

                <select
                  value={form.grade}
                  onChange={(event) =>
                    handleFormChange(
                      "grade",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                >
                  <option value="">
                    Select class
                  </option>

                  {CLASS_OPTIONS.map(
                    (grade) => (
                      <option
                        key={grade}
                        value={grade}
                      >
                        {grade}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Subject
                </label>

                <select
                  value={form.subject}
                  onChange={(event) =>
                    handleFormChange(
                      "subject",
                      event.target.value
                    )
                  }
                  disabled={
                    !form.grade
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {form.grade
                      ? "Select subject"
                      : "Select class first"}
                  </option>

                  {editSubjects.map(
                    (subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(event) =>
                    handleFormChange(
                      "dueDate",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Description
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "description",
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                  placeholder="Assignment description"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Instructions
                </label>

                <textarea
                  value={
                    form.instructions
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "instructions",
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                  placeholder="Instructions for students"
                />
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={
                    savingId !== null
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={
                    savingId !== null
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-[#020617] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingId !== null ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save
                        size={17}
                      />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        {!loading &&
          assignments.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <ClipboardList
                    size={20}
                  />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Assignments
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {assignments.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                  <BookOpen
                    size={20}
                  />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Questions
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {assignments.reduce(
                    (total, assignment) =>
                      total +
                      getQuestionCount(
                        assignment
                      ),
                    0
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <GraduationCap
                    size={20}
                  />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Assignments
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {
                    assignments.filter(
                      (assignment) =>
                        clean(
                          assignment.status
                        ).toLowerCase() ===
                        "published"
                    ).length
                  }
                </p>
              </div>
            </div>
          )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-[#071426]">
            <div className="flex flex-col items-center text-center">
              <Loader2
                size={32}
                className="animate-spin text-cyan-400"
              />

              <p className="mt-4 text-sm font-semibold text-slate-200">
                Loading your assignments...
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Please wait a moment.
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          assignments.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#071426] px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5 text-cyan-300">
                <ClipboardList
                  size={28}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                No assignments yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Assignments you create will appear
                here. Create your first assignment
                and start giving work to your students.
              </p>

              <button
                type="button"
                onClick={
                  createAssignment
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-[#020617] transition hover:bg-cyan-400"
              >
                <FileText
                  size={17}
                />
                Create Assignment
              </button>
            </div>
          )}

        {/* =================================================
            ASSIGNMENT LIST
        ================================================= */}

        {!loading &&
          assignments.length > 0 && (
            <div className="space-y-4">
              {assignments.map(
                (assignment, index) => {
                  const id =
                    getAssignmentId(
                      assignment
                    );

                  const questionCount =
                    getQuestionCount(
                      assignment
                    );

                  const totalMarks =
                    getTotalMarks(
                      assignment
                    );

                  const dueDate =
                    assignment?.due_date ??
                    assignment?.dueDate;

                  const expanded =
                    String(
                      expandedId
                    ) ===
                    String(id);

                  const pastDue =
                    isPastDue(
                      dueDate
                    );

                  /*
                   * If the backend somehow sends an
                   * assignment without an ID, give the
                   * React row a temporary key, but DO NOT
                   * use that temporary key as the real ID.
                   */
                  const rowKey =
                    id ||
                    `assignment-${index}`;

                  return (
                    <article
                      key={rowKey}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#071426] transition hover:border-white/15"
                    >
                      {/* =================================
                          MAIN ROW
                      ================================= */}

                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                                <BookOpen
                                  size={13}
                                />
                                {clean(
                                  assignment.subject
                                ) ||
                                  "Subject"}
                              </span>

                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-slate-300">
                                <GraduationCap
                                  size={13}
                                />
                                {clean(
                                  assignment.grade
                                ) ||
                                  "Class"}
                              </span>

                              {clean(
                                assignment.status
                              ) && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-300">
                                  <CheckCircle2
                                    size={13}
                                  />
                                  {clean(
                                    assignment.status
                                  )}
                                </span>
                              )}
                            </div>

                            <h2 className="mt-3 break-words text-lg font-bold text-white sm:text-xl">
                              {clean(
                                assignment.title
                              ) ||
                                "Untitled Assignment"}
                            </h2>

                            {clean(
                              assignment.description
                            ) && (
                              <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-400">
                                {
                                  assignment.description
                                }
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <FileText
                                  size={14}
                                />
                                {questionCount}{" "}
                                {questionCount ===
                                1
                                  ? "question"
                                  : "questions"}
                              </span>

                              {totalMarks !==
                                null && (
                                <span className="inline-flex items-center gap-1.5">
                                  <CheckCircle2
                                    size={14}
                                  />
                                  {totalMarks}{" "}
                                  {totalMarks ===
                                  1
                                    ? "mark"
                                    : "marks"}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays
                                  size={14}
                                />
                                Created{" "}
                                {formatDate(
                                  assignment.created_at
                                )}
                              </span>

                              {dueDate && (
                                <span
                                  className={`inline-flex items-center gap-1.5 ${
                                    pastDue
                                      ? "text-red-300"
                                      : "text-slate-500"
                                  }`}
                                >
                                  <Clock3
                                    size={14}
                                  />
                                  Due{" "}
                                  {formatDate(
                                    dueDate
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ===========================
                              ACTIONS
                          =========================== */}

                          <div className="flex flex-wrap gap-2 xl:max-w-md xl:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                viewAssignment(
                                  assignment
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#020b18] px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-white sm:text-sm"
                            >
                              <FileText
                                size={16}
                              />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                startEdit(
                                  assignment
                                )
                              }
                              disabled={
                                editingId !==
                                null
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#020b18] px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                            >
                              <Edit3
                                size={16}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                viewSubmissions(
                                  assignment
                                )
                              }
                              disabled={!id}
                              title={
                                id
                                  ? "View student submissions"
                                  : "Assignment ID is missing"
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3.5 py-2.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                            >
                              <Users
                                size={16}
                              />
                              Submissions
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                confirmDelete(
                                  assignment
                                )
                              }
                              disabled={
                                deletingId !==
                                null
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-3.5 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                            >
                              <Trash2
                                size={16}
                              />
                              Delete
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleExpanded(
                                  assignment
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#020b18] px-3.5 py-2.5 text-xs font-semibold text-slate-400 transition hover:text-white sm:text-sm"
                              aria-label={
                                expanded
                                  ? "Collapse assignment"
                                  : "Expand assignment"
                              }
                            >
                              {expanded ? (
                                <ChevronUp
                                  size={16}
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* =================================
                          EXPANDED DETAILS
                      ================================= */}

                      {expanded && (
                        <div className="border-t border-white/10 bg-[#020b18]/50 px-5 py-5 sm:px-6">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-white/10 bg-[#071426] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Class
                              </p>

                              <p className="mt-2 text-sm font-semibold text-white">
                                {clean(
                                  assignment.grade
                                ) ||
                                  "Not specified"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-[#071426] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Subject
                              </p>

                              <p className="mt-2 text-sm font-semibold text-white">
                                {clean(
                                  assignment.subject
                                ) ||
                                  "Not specified"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-[#071426] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Due Date
                              </p>

                              <p className="mt-2 text-sm font-semibold text-white">
                                {dueDate
                                  ? formatDate(
                                      dueDate
                                    )
                                  : "No due date"}
                              </p>
                            </div>
                          </div>

                          {clean(
                            assignment.instructions
                          ) && (
                            <div className="mt-4 rounded-xl border border-white/10 bg-[#071426] p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Instructions
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                {
                                  assignment.instructions
                                }
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                viewAssignment(
                                  assignment
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-[#020617] transition hover:bg-cyan-400"
                            >
                              <FileText
                                size={16}
                              />
                              Open Assignment
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                viewSubmissions(
                                  assignment
                                )
                              }
                              disabled={!id}
                              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Users
                                size={16}
                              />
                              Grade Submissions
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
      </div>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#071426] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                  <Trash2
                    size={19}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Delete Assignment
                  </h3>

                  <p className="text-xs text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  cancelDelete
                }
                disabled={
                  deletingId !== null
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-slate-300">
                Are you sure you want to delete:
              </p>

              <div className="mt-3 rounded-xl border border-white/10 bg-[#020b18] p-4">
                <p className="font-semibold text-white">
                  {clean(
                    deleteTarget.title
                  ) ||
                    "Untitled Assignment"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>
                    {clean(
                      deleteTarget.grade
                    ) ||
                      "Class not specified"}
                  </span>

                  <span>•</span>

                  <span>
                    {clean(
                      deleteTarget.subject
                    ) ||
                      "Subject not specified"}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-red-300/80">
                This will also remove the assignment
                questions and any stored submissions
                associated with it.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    cancelDelete
                  }
                  disabled={
                    deletingId !== null
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    deleteAssignment
                  }
                  disabled={
                    deletingId !== null
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId !==
                  null ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={17}
                      />
                      Delete Assignment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
