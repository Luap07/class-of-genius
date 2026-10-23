import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Loader2,
  Search,
  Upload,
  RefreshCw,
  Pencil,
  Eye,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

/* ============================================================
   API
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const ASSIGNMENTS_ENDPOINT =
  `${API_URL}/api/academy/student/assignments`;

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const parseJSON = (value, fallback = null) => {
  if (typeof value !== "string") {
    return value ?? fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getAcademyToken = () => {
  const keys = [
    "scholiqen_academy_token",
    "scholiqen_auth_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return "";
};

const getStudentId = (student) => {
  if (!student) return "";

  return clean(
    firstValue(
      student.id,
      student.studentId,
      student.student_id,
      student.enrollmentId,
      student.enrollment_id,
      student.reference,
      student.studentReference,
      student.student_reference
    )
  );
};

const getStudentClass = (student) => {
  if (!student) return "";

  return clean(
    firstValue(
      student.className,
      student.class_name,
      student.class,
      student.grade,
      student.currentClass,
      student.current_class,
      student.studentClass,
      student.student_class
    )
  );
};

const normalizeClass = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/* ============================================================
   FILE HELPERS
============================================================ */

const getAssignmentFile = (item) => {
  if (!item) {
    return {
      url: "",
      name: "",
      type: "",
      size: null,
    };
  }

  let attachment = parseJSON(
    item.attachment,
    item.attachment
  );

  let file = parseJSON(
    firstValue(
      item.file,
      item.document,
      attachment
    ),
    {}
  );

  if (typeof file === "string") {
    file = { url: file };
  }

  if (!file || typeof file !== "object") {
    file = {};
  }

  return {
    url: clean(
      firstValue(
        item.fileUrl,
        item.file_url,
        item.attachmentUrl,
        item.attachment_url,
        item.documentUrl,
        item.document_url,
        item.url,
        file.url,
        file.fileUrl,
        file.file_url,
        file.attachmentUrl,
        file.attachment_url,
        file.documentUrl,
        file.document_url,
        file.path
      )
    ),

    name: clean(
      firstValue(
        item.fileName,
        item.file_name,
        item.attachmentName,
        item.attachment_name,
        item.documentName,
        item.document_name,
        item.originalName,
        item.original_name,
        file.name,
        file.originalName,
        file.original_name,
        file.fileName,
        file.file_name
      )
    ),

    type: clean(
      firstValue(
        item.fileType,
        item.file_type,
        item.attachmentType,
        item.attachment_type,
        item.documentType,
        item.document_type,
        item.mimeType,
        item.mime_type,
        file.type,
        file.fileType,
        file.file_type,
        file.mimeType,
        file.mime_type
      )
    ),

    size:
      firstValue(
        item.fileSize,
        item.file_size,
        item.attachmentSize,
        item.attachment_size,
        item.documentSize,
        item.document_size,
        file.size,
        file.fileSize,
        file.file_size
      ) ?? null,
  };
};

const resolveFileUrl = (fileUrl) => {
  const value = clean(fileUrl);

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
};

/* ============================================================
   SUBMISSION HELPERS
============================================================ */

const getSubmission = (item) => {
  if (!item) return null;

  const submission = parseJSON(
    firstValue(
      item.submission,
      item.studentSubmission,
      item.student_submission,
      item.latestSubmission,
      item.latest_submission
    ),
    null
  );

  if (
    submission &&
    typeof submission === "object"
  ) {
    return submission;
  }

  /*
   * Some APIs return submission columns
   * directly on the assignment object.
   */
  const submissionId = firstValue(
    item.submissionId,
    item.submission_id,
    item.studentSubmissionId,
    item.student_submission_id
  );

  const submissionStatus = firstValue(
    item.submissionStatus,
    item.submission_status
  );

  const submittedAt = firstValue(
    item.submittedAt,
    item.submitted_at
  );

  const submittedFile = getAssignmentFile({
    fileUrl: firstValue(
      item.submissionFileUrl,
      item.submission_file_url,
      item.submittedFileUrl,
      item.submitted_file_url
    ),
    fileName: firstValue(
      item.submissionFileName,
      item.submission_file_name,
      item.submittedFileName,
      item.submitted_file_name
    ),
    fileType: firstValue(
      item.submissionFileType,
      item.submission_file_type
    ),
  });

  if (
    submissionId ||
    submissionStatus ||
    submittedAt ||
    submittedFile.url
  ) {
    return {
      id: submissionId || "",
      status: submissionStatus || "submitted",
      submittedAt: submittedAt || "",
      file: submittedFile,
      answers: parseJSON(
        firstValue(
          item.submittedAnswers,
          item.submitted_answers,
          item.answers
        ),
        []
      ),
      raw: item,
    };
  }

  return null;
};

const normalizeStatus = (item, submission) => {
  const rawStatus = clean(
    firstValue(
      submission?.status,
      item?.submissionStatus,
      item?.submission_status,
      item?.status
    )
  ).toLowerCase();

  if (
    [
      "graded",
      "reviewed",
      "completed",
    ].includes(rawStatus)
  ) {
    return rawStatus;
  }

  if (
    [
      "submitted",
      "turned_in",
      "turned-in",
      "resubmitted",
    ].includes(rawStatus)
  ) {
    return "submitted";
  }

  if (
    rawStatus === "overdue"
  ) {
    return "overdue";
  }

  if (
    rawStatus === "pending" ||
    rawStatus === "not_submitted"
  ) {
    return "pending";
  }

  if (
    submission ||
    item?.submissionId ||
    item?.submission_id ||
    item?.submittedAt ||
    item?.submitted_at
  ) {
    return "submitted";
  }

  const dueDate = firstValue(
    item?.dueDate,
    item?.due_date,
    item?.deadline,
    item?.dueAt,
    item?.due_at
  );

  if (dueDate) {
    const parsed = new Date(dueDate);

    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getTime() < Date.now()
    ) {
      return "overdue";
    }
  }

  return "pending";
};

/* ============================================================
   NORMALIZE ASSIGNMENT
============================================================ */

const normalizeAssignment = (item, index) => {
  const questions = Array.isArray(item?.questions)
    ? item.questions
    : Array.isArray(item?.items)
    ? item.items
    : Array.isArray(item?.assignmentQuestions)
    ? item.assignmentQuestions
    : Array.isArray(item?.assignment_questions)
    ? item.assignment_questions
    : [];

  const submission = getSubmission(item);
  const document = getAssignmentFile(item);
  const status = normalizeStatus(item, submission);

  const totalMarks = firstValue(
    item?.totalMarks,
    item?.total_marks,
    item?.maxMarks,
    item?.max_marks,
    item?.maxScore,
    item?.max_score,
    questions.reduce(
      (total, question) =>
        total + Number(question?.marks || 1),
      0
    )
  );

  return {
    id: clean(
      firstValue(
        item?.id,
        item?.assignmentId,
        item?.assignment_id,
        item?.reference,
        item?.assignmentReference,
        item?.assignment_reference,
        `assignment-${index}`
      )
    ),

    reference: clean(
      firstValue(
        item?.reference,
        item?.assignmentReference,
        item?.assignment_reference
      )
    ),

    title: clean(
      firstValue(
        item?.title,
        item?.name,
        item?.assignmentTitle,
        item?.assignment_title,
        "Untitled Assignment"
      )
    ),

    subject: clean(
      firstValue(
        item?.subject,
        item?.subjectName,
        item?.subject_name,
        "General"
      )
    ),

    className: clean(
      firstValue(
        item?.className,
        item?.class_name,
        item?.class,
        item?.grade,
        item?.classGrade,
        "Student"
      )
    ),

    description: clean(
      firstValue(
        item?.description,
        item?.instructions,
        item?.details,
        "Complete this assignment according to the instructions provided by your tutor."
      )
    ),

    instructions: clean(
      firstValue(
        item?.instructions,
        item?.instruction,
        ""
      )
    ),

    dueDate: firstValue(
      item?.dueDate,
      item?.due_date,
      item?.deadline,
      item?.dueAt,
      item?.due_at,
      ""
    ),

    createdAt: firstValue(
      item?.createdAt,
      item?.created_at,
      ""
    ),

    status,

    score: firstValue(
      submission?.score,
      item?.score,
      null
    ),

    maxScore: firstValue(
      submission?.max_score,
      submission?.maxScore,
      item?.maxScore,
      item?.max_score,
      totalMarks
    ),

    percentage: firstValue(
      submission?.percentage,
      item?.percentage,
      null
    ),

    gradeResult: firstValue(
      submission?.grade,
      submission?.gradeResult,
      item?.gradeResult,
      item?.grade_result,
      null
    ),

    totalMarks,

    totalQuestions: firstValue(
      item?.totalQuestions,
      item?.total_questions,
      questions.length
    ),

    questions,

    document,

    submission,

    resultReleased: Boolean(
      firstValue(
        submission?.resultReleased,
        submission?.result_released,
        item?.resultReleased,
        item?.result_released,
        false
      )
    ),

    raw: item,
  };
};

/* ============================================================
   DATE AND STATUS
============================================================ */

const formatDate = (date) => {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusLabel = (status) => {
  const labels = {
    submitted: "Submitted",
    graded: "Graded",
    overdue: "Overdue",
    reviewed: "Reviewed",
    completed: "Completed",
    pending: "Pending",
  };

  return labels[status] || "Pending";
};

const getStatusStyle = (status) => {
  const styles = {
    submitted:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    graded:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    reviewed:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    completed:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    overdue:
      "border-red-400/20 bg-red-400/10 text-red-300",
    pending:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  };

  return styles[status] || styles.pending;
};

const getSubjectStyle = (subject) => {
  const normalized = clean(subject)
    .toLowerCase()
    .replace(/\s+/g, "");

  const styles = {
    mathematics:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
    maths:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
    english:
      "border-purple-400/20 bg-purple-400/10 text-purple-300",
    englishstudies:
      "border-purple-400/20 bg-purple-400/10 text-purple-300",
    biology:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    chemistry:
      "border-orange-400/20 bg-orange-400/10 text-orange-300",
    physics:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    computerscience:
      "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
    ict:
      "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
    economics:
      "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    geography:
      "border-teal-400/20 bg-teal-400/10 text-teal-300",
    government:
      "border-pink-400/20 bg-pink-400/10 text-pink-300",
    literature:
      "border-rose-400/20 bg-rose-400/10 text-rose-300",
    history:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  };

  return (
    styles[normalized] ||
    "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
  );
};

/* ============================================================
   RESPONSE PARSING
============================================================ */

const extractAssignments = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  const candidates = [
    data?.assignments,
    data?.data?.assignments,
    data?.data,
    data?.items,
    data?.results,
    data?.rows,
  ];

  return candidates.find(
    Array.isArray
  ) || [];
};

const extractSubjects = (data) => {
  const candidates = [
    data?.subjects,
    data?.data?.subjects,
  ];

  return candidates.find(
    Array.isArray
  ) || [];
};

/* ============================================================
   COMPONENT
============================================================ */

export default function StudentAssignments() {
  const navigate = useNavigate();

  const outletContext = useOutletContext() || {};
  const student = outletContext.student || null;

  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSubject, setSelectedSubject] =
    useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId = getStudentId(student);
  const studentClass = getStudentClass(student);

  /* ==========================================================
     LOAD ASSIGNMENTS
  ========================================================== */

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAcademyToken();

      if (!token) {
        throw new Error(
          "Your student session has expired. Please log in again."
        );
      }

      const response = await fetch(
        ASSIGNMENTS_ENDPOINT,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-academy-token": token,
            "x-student-token": token,
          },
        }
      );

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "The assignment server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to load assignments (${response.status}).`
        );
      }

      const rawItems = extractAssignments(data);

      let normalized = rawItems.map(
        (item, index) =>
          normalizeAssignment(item, index)
      );

      /*
       * Keep the existing class guard.
       * The backend should also filter assignments
       * using the authenticated student's enrollment.
       */
      if (studentClass) {
        const currentClass =
          normalizeClass(studentClass);

        normalized = normalized.filter(
          (assignment) => {
            const assignmentClass =
              normalizeClass(assignment.className);

            if (
              !assignmentClass ||
              !currentClass
            ) {
              return true;
            }

            return (
              assignmentClass === currentClass
            );
          }
        );
      }

      setAssignments(normalized);

      const backendSubjects = extractSubjects(data);

      if (backendSubjects.length) {
        setSubjects(
          backendSubjects.map((subject) => {
            if (typeof subject === "string") {
              return {
                name: subject,
                count: normalized.filter(
                  (assignment) =>
                    assignment.subject.toLowerCase() ===
                    subject.toLowerCase()
                ).length,
              };
            }

            return {
              ...subject,
              name: clean(
                firstValue(
                  subject.name,
                  subject.subject,
                  subject.subjectName,
                  subject.subject_name
                )
              ),
              count: Number(subject.count || 0),
            };
          }).filter((subject) => subject.name)
        );
      } else {
        const subjectMap = new Map();

        normalized.forEach((assignment) => {
          const name = clean(assignment.subject);

          if (!name) return;

          const key = name.toLowerCase();

          if (!subjectMap.has(key)) {
            subjectMap.set(key, {
              name,
              count: 0,
            });
          }

          subjectMap.get(key).count += 1;
        });

        setSubjects(
          Array.from(subjectMap.values()).sort(
            (a, b) =>
              a.name.localeCompare(b.name)
          )
        );
      }
    } catch (err) {
      console.error(
        "STUDENT ASSIGNMENTS ERROR:",
        err
      );

      setAssignments([]);
      setSubjects([]);
      setError(
        err?.message ||
          "Assignments could not be loaded from the server."
      );
    } finally {
      setLoading(false);
    }
  }, [studentClass]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  /* ==========================================================
     SUBJECT FILTER
  ========================================================== */

  const subjectFilteredAssignments = useMemo(() => {
    if (selectedSubject === "all") {
      return assignments;
    }

    return assignments.filter(
      (assignment) =>
        assignment.subject.toLowerCase() ===
        selectedSubject.toLowerCase()
    );
  }, [assignments, selectedSubject]);

  /* ==========================================================
     SEARCH AND STATUS FILTER
  ========================================================== */

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subjectFilteredAssignments.filter(
      (assignment) => {
        const matchesSearch =
          !query ||
          assignment.title.toLowerCase().includes(query) ||
          assignment.subject.toLowerCase().includes(query) ||
          assignment.className.toLowerCase().includes(query);

        const matchesFilter =
          filter === "all" ||
          assignment.status === filter;

        return matchesSearch && matchesFilter;
      }
    );
  }, [
    subjectFilteredAssignments,
    search,
    filter,
  ]);

  /* ==========================================================
     STATS
  ========================================================== */

  const stats = useMemo(() => ({
    total: assignments.length,

    pending: assignments.filter(
      (item) => item.status === "pending"
    ).length,

    submitted: assignments.filter(
      (item) => item.status === "submitted"
    ).length,

    graded: assignments.filter(
      (item) =>
        ["graded", "reviewed", "completed"].includes(
          item.status
        )
    ).length,
  }), [assignments]);

  /* ==========================================================
     OPEN ASSIGNMENT
  ========================================================== */

  const openAssignment = (assignment) => {
    const submittedStatuses = [
      "submitted",
      "graded",
      "reviewed",
      "completed",
    ];

    const alreadySubmitted =
      submittedStatuses.includes(assignment.status) ||
      Boolean(assignment.submission);

    navigate(
      `/academy/student/assignments/${encodeURIComponent(
        assignment.id
      )}`,
      {
        state: {
          assignment,
          document: assignment.document,
          student,
          studentId,
          studentClass,

          /*
           * Details page should use this to decide
           * whether to load an existing submission
           * and display review/edit controls.
           */
          mode: alreadySubmitted
            ? "review-edit"
            : "new",

          existingSubmission:
            assignment.submission || null,

          canEdit:
            alreadySubmitted &&
            !assignment.resultReleased,

          returnTo:
            "/academy/student/assignments",
        },
      }
    );
  };

  /* ==========================================================
     SUBJECT SELECTION
  ========================================================== */

  const selectSubject = (name) => {
    setSelectedSubject(name);
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <ClipboardCheck
                  size={24}
                  className="text-cyan-300"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Assignments
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  View, complete, review and update your assignments.
                </p>
              </div>
            </div>

            {studentClass && (
              <div className="mt-4 inline-flex rounded-full border border-white/10 bg-[#071426] px-3 py-1.5 text-xs text-slate-400">
                Your class:
                <span className="ml-1.5 font-semibold text-cyan-300">
                  {studentClass}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={loadAssignments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh assignments
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p>{error}</p>

              <button
                type="button"
                onClick={loadAssignments}
                className="mt-2 font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: ClipboardCheck,
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock3,
            },
            {
              label: "Submitted",
              value: stats.submitted,
              icon: Upload,
            },
            {
              label: "Reviewed / Graded",
              value: stats.graded,
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#071426] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-400">
                    {item.label}
                  </span>

                  <Icon
                    size={18}
                    className="shrink-0 text-cyan-300"
                  />
                </div>

                <div className="mt-2 text-2xl font-bold">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* SUBJECTS */}

        {!loading && subjects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Subjects
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose a subject to filter assignments.
                </p>
              </div>

              {selectedSubject !== "all" && (
                <button
                  type="button"
                  onClick={() => selectSubject("all")}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Show all
                </button>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => selectSubject("all")}
                className={`min-w-[110px] rounded-2xl border px-4 py-3 text-left transition ${
                  selectedSubject === "all"
                    ? "border-cyan-400/40 bg-cyan-400/10"
                    : "border-white/10 bg-[#071426] hover:border-white/20"
                }`}
              >
                <p className="text-sm font-semibold">
                  All subjects
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {assignments.length} assignment
                  {assignments.length === 1 ? "" : "s"}
                </p>
              </button>

              {subjects.map((subject) => {
                const name = subject.name;

                const count = assignments.filter(
                  (assignment) =>
                    assignment.subject.toLowerCase() ===
                    name.toLowerCase()
                ).length;

                const selected =
                  selectedSubject.toLowerCase() ===
                  name.toLowerCase();

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectSubject(name)}
                    className={`min-w-[150px] rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? getSubjectStyle(name)
                        : "border-white/10 bg-[#071426] hover:border-white/20"
                    }`}
                  >
                    <p className="truncate text-sm font-semibold">
                      {name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {count} assignment
                      {count === 1 ? "" : "s"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SEARCH AND FILTER */}

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search assignments..."
              className="w-full rounded-2xl border border-white/10 bg-[#071426] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/40"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["submitted", "Submitted"],
              ["graded", "Graded"],
              ["reviewed", "Reviewed"],
              ["overdue", "Overdue"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                  filter === value
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-[#071426] text-slate-300 hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />
              Loading assignments...
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          /* EMPTY STATE */

          <div className="rounded-3xl border border-white/10 bg-[#071426] p-12 text-center">
            <FileText
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              No assignments found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {assignments.length === 0
                ? "There are currently no assignments available for your class."
                : "No assignments match your current search or filters."}
            </p>

            {(search ||
              filter !== "all" ||
              selectedSubject !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                  setSelectedSubject("all");
                }}
                className="mt-4 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          /* ASSIGNMENT CARDS */

          <div className="space-y-4">
            {filteredAssignments.map(
              (assignment, index) => {
                const tutorDocumentUrl =
                  resolveFileUrl(
                    assignment.document?.url
                  );

                const hasTutorDocument =
                  Boolean(tutorDocumentUrl);

                const submitted =
                  Boolean(assignment.submission) ||
                  [
                    "submitted",
                    "graded",
                    "reviewed",
                    "completed",
                  ].includes(assignment.status);

                const editable =
                  submitted &&
                  !assignment.resultReleased;

                return (
                  <motion.div
                    key={assignment.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.03,
                    }}
                    className="rounded-3xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* ASSIGNMENT DETAILS */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getSubjectStyle(
                              assignment.subject
                            )}`}
                          >
                            {assignment.subject}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                              assignment.status
                            )}`}
                          >
                            {getStatusLabel(
                              assignment.status
                            )}
                          </span>

                          {submitted && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                              <CheckCircle2 size={12} />
                              Work submitted
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 break-words text-lg font-semibold">
                          {assignment.title}
                        </h2>

                        <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-400">
                          {assignment.description}
                        </p>

                        {/* METADATA */}

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>
                            Class:{" "}
                            <strong className="text-slate-300">
                              {assignment.className}
                            </strong>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            Due:{" "}
                            <strong className="text-slate-300">
                              {formatDate(
                                assignment.dueDate
                              )}
                            </strong>
                          </span>

                          {Number(
                            assignment.totalQuestions
                          ) > 0 && (
                            <span>
                              Questions:{" "}
                              <strong className="text-slate-300">
                                {assignment.totalQuestions}
                              </strong>
                            </span>
                          )}

                          {assignment.score !== null &&
                            assignment.score !== undefined && (
                              <span>
                                Score:{" "}
                                <strong className="text-cyan-300">
                                  {assignment.score}/
                                  {assignment.maxScore ||
                                    assignment.totalMarks}
                                </strong>
                              </span>
                            )}
                        </div>

                        {/* TUTOR'S ASSIGNMENT FILE */}

                        {hasTutorDocument && (
                          <div className="mt-4 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                              <FileText
                                size={19}
                                className="text-cyan-300"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-slate-400">
                                Tutor's Assignment Document
                              </p>

                              <p className="truncate text-sm text-slate-200">
                                {assignment.document.name ||
                                  "Assignment attachment"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  tutorDocumentUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              className="shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                            >
                              Open file
                            </button>
                          </div>
                        )}

                        {/* EXISTING SUBMISSION INDICATOR */}

                        {submitted && (
                          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-3 sm:flex-row sm:items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                              <CheckCircle2
                                size={19}
                                className="text-emerald-300"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-emerald-200">
                                Your submission is available to review
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                Open this assignment to review your saved answers or document.
                                {editable
                                  ? " You can edit your work if resubmission is allowed."
                                  : " Editing may be unavailable after results are released."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}

                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:w-52 lg:flex-col">
                        <button
                          type="button"
                          onClick={() =>
                            openAssignment(assignment)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          {submitted ? (
                            <>
                              <Eye size={16} />
                              Review Submission
                            </>
                          ) : (
                            <>
                              <FileText size={16} />
                              Open Assignment
                            </>
                          )}
                        </button>

                        {submitted && editable && (
                          <button
                            type="button"
                            onClick={() =>
                              openAssignment(assignment)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
                          >
                            <Pencil size={16} />
                            Review & Edit
                          </button>
                        )}

                        {submitted &&
                          assignment.resultReleased && (
                            <p className="text-center text-xs text-slate-500">
                              Results released
                            </p>
                          )}
                      </div>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}