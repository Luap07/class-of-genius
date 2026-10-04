import React, {
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
} from "lucide-react";

import { motion } from "framer-motion";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const ASSIGNMENTS_ENDPOINT =
  `${API_URL}/api/academy/student/assignments`;

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

/* ============================================================
   STUDENT TOKEN
============================================================ */

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
    const value =
      localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return "";
};

/* ============================================================
   STUDENT
============================================================ */

const getStudentId = (student) => {
  if (!student) {
    return "";
  }

  return (
    student.id ||
    student.studentId ||
    student.student_id ||
    student.enrollmentId ||
    student.enrollment_id ||
    student.reference ||
    student.studentReference ||
    student.student_reference ||
    ""
  );
};

const getStudentClass = (student) => {
  if (!student) {
    return "";
  }

  return (
    student.className ||
    student.class_name ||
    student.class ||
    student.grade ||
    student.currentClass ||
    student.current_class ||
    student.studentClass ||
    student.student_class ||
    ""
  );
};

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

  let attachment =
    item.attachment;

  if (
    typeof attachment ===
    "string"
  ) {
    try {
      attachment =
        JSON.parse(attachment);
    } catch {
      attachment = {
        url: attachment,
      };
    }
  }

  let file =
    item.file ||
    item.document ||
    attachment ||
    {};

  if (
    typeof file ===
    "string"
  ) {
    try {
      file = JSON.parse(file);
    } catch {
      file = {
        url: file,
      };
    }
  }

  return {
    url:
      item.fileUrl ||
      item.file_url ||
      item.attachmentUrl ||
      item.attachment_url ||
      item.documentUrl ||
      item.document_url ||
      item.url ||
      file.url ||
      file.fileUrl ||
      file.file_url ||
      file.attachmentUrl ||
      file.attachment_url ||
      file.documentUrl ||
      file.document_url ||
      "",

    name:
      item.fileName ||
      item.file_name ||
      item.attachmentName ||
      item.attachment_name ||
      item.documentName ||
      item.document_name ||
      item.originalName ||
      item.original_name ||
      file.name ||
      file.originalName ||
      file.original_name ||
      file.fileName ||
      file.file_name ||
      file.attachmentName ||
      file.attachment_name ||
      file.documentName ||
      file.document_name ||
      "",

    type:
      item.fileType ||
      item.file_type ||
      item.attachmentType ||
      item.attachment_type ||
      item.documentType ||
      item.document_type ||
      item.mimeType ||
      item.mime_type ||
      file.type ||
      file.fileType ||
      file.file_type ||
      file.mimeType ||
      file.mime_type ||
      "",

    size:
      item.fileSize ??
      item.file_size ??
      item.attachmentSize ??
      item.attachment_size ??
      item.documentSize ??
      item.document_size ??
      file.size ??
      file.fileSize ??
      file.file_size ??
      null,
  };
};

const resolveFileUrl = (
  fileUrl
) => {
  if (!fileUrl) {
    return "";
  }

  const value =
    String(fileUrl).trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    ) ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (
    value.startsWith("/")
  ) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/${value}`;
};

const getFileExtension = (
  fileName = "",
  fileType = ""
) => {
  const name =
    String(fileName)
      .toLowerCase()
      .trim();

  if (
    name.includes(".")
  ) {
    return name
      .split(".")
      .pop();
  }

  const type =
    String(fileType)
      .toLowerCase()
      .trim();

  if (
    type.includes("pdf")
  ) {
    return "pdf";
  }

  if (
    type.includes("msword")
  ) {
    return "doc";
  }

  if (
    type.includes(
      "wordprocessingml"
    )
  ) {
    return "docx";
  }

  if (
    type.includes("mp4")
  ) {
    return "mp4";
  }

  if (
    type.includes("webm")
  ) {
    return "webm";
  }

  if (
    type.includes("quicktime")
  ) {
    return "mov";
  }

  return "";
};

const isPdfFile = (
  fileName,
  fileType
) => {
  const extension =
    getFileExtension(
      fileName,
      fileType
    );

  return (
    extension === "pdf" ||
    String(fileType)
      .toLowerCase()
      .includes("pdf")
  );
};

const isVideoFile = (
  fileName,
  fileType
) => {
  const extension =
    getFileExtension(
      fileName,
      fileType
    );

  return (
    [
      "mp4",
      "webm",
      "mov",
    ].includes(extension) ||
    String(fileType)
      .toLowerCase()
      .startsWith("video/")
  );
};

/* ============================================================
   STATUS
============================================================ */

const normalizeStatus = (
  item
) => {
  const status =
    String(
      item?.submissionStatus ||
        item?.submission_status ||
        item?.status ||
        ""
    ).toLowerCase();

  if (
    [
      "submitted",
      "graded",
      "reviewed",
      "completed",
      "overdue",
      "pending",
    ].includes(status)
  ) {
    return status;
  }

  if (
    item?.submission ||
    item?.submissionId ||
    item?.submission_id
  ) {
    return "submitted";
  }

  const due =
    item?.dueDate ||
    item?.due_date ||
    item?.deadline ||
    item?.dueAt ||
    item?.due_at;

  if (due) {
    const dueDate =
      new Date(due);

    if (
      !Number.isNaN(
        dueDate.getTime()
      ) &&
      dueDate.getTime() <
        Date.now()
    ) {
      return "overdue";
    }
  }

  return "pending";
};

/* ============================================================
   NORMALIZE ASSIGNMENT
============================================================ */

const normalizeAssignment = (
  item,
  index
) => {
  const file =
    getAssignmentFile(item);

  const questions =
    Array.isArray(
      item?.questions
    )
      ? item.questions
      : Array.isArray(
          item?.items
        )
      ? item.items
      : Array.isArray(
          item?.assignmentQuestions
        )
      ? item.assignmentQuestions
      : Array.isArray(
          item?.assignment_questions
        )
      ? item.assignment_questions
      : [];

  const status =
    normalizeStatus(item);

  const totalMarks =
    item?.totalMarks ??
    item?.total_marks ??
    item?.maxMarks ??
    item?.max_marks ??
    item?.maxScore ??
    item?.max_score ??
    questions.reduce(
      (
        total,
        question
      ) =>
        total +
        Number(
          question?.marks ||
            1
        ),
      0
    );

  return {
    id:
      item?.id ||
      item?.assignmentId ||
      item?.assignment_id ||
      item?.reference ||
      item?.assignmentReference ||
      item?.assignment_reference ||
      `assignment-${index}`,

    reference:
      item?.reference ||
      item?.assignmentReference ||
      item?.assignment_reference ||
      "",

    title:
      item?.title ||
      item?.name ||
      item?.assignmentTitle ||
      item?.assignment_title ||
      "Untitled Assignment",

    subject:
      item?.subject ||
      item?.subjectName ||
      item?.subject_name ||
      "General",

    className:
      item?.className ||
      item?.class_name ||
      item?.class ||
      item?.grade ||
      item?.classGrade ||
      "Student",

    description:
      item?.description ||
      item?.instructions ||
      item?.details ||
      "Complete this assignment according to the instructions provided by your tutor.",

    instructions:
      item?.instructions ||
      item?.instruction ||
      "",

    dueDate:
      item?.dueDate ||
      item?.due_date ||
      item?.deadline ||
      item?.dueAt ||
      item?.due_at ||
      "",

    createdAt:
      item?.createdAt ||
      item?.created_at ||
      "",

    status,

    score:
      item?.score ??
      item?.submission?.score ??
      null,

    maxScore:
      item?.maxScore ??
      item?.max_score ??
      item?.submission?.max_score ??
      totalMarks,

    percentage:
      item?.percentage ??
      item?.submission?.percentage ??
      null,

    gradeResult:
      item?.gradeResult ??
      item?.grade_result ??
      item?.submission?.grade ??
      null,

    totalMarks,

    totalQuestions:
      item?.totalQuestions ??
      item?.total_questions ??
      questions.length,

    questions,

    document: file,

    submission:
      item?.submission ||
      null,

    resultReleased:
      Boolean(
        item?.resultReleased ??
          item?.result_released ??
          false
      ),

    raw: item,
  };
};

/* ============================================================
   DATE
============================================================ */

const formatDate = (
  date
) => {
  if (!date) {
    return "No deadline";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

/* ============================================================
   STATUS LABEL
============================================================ */

const getStatusLabel = (
  status
) => {
  switch (status) {
    case "submitted":
      return "Submitted";

    case "graded":
      return "Graded";

    case "overdue":
      return "Overdue";

    case "reviewed":
      return "Reviewed";

    case "completed":
      return "Completed";

    default:
      return "Pending";
  }
};

/* ============================================================
   SUBJECT COLOR
============================================================ */

const getSubjectStyle = (
  subject
) => {
  const normalized =
    String(
      subject || ""
    )
      .toLowerCase()
      .replace(
        /\s+/g,
        ""
      );

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

    computerScience:
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
   COMPONENT
============================================================ */

export default function StudentAssignments() {
  const navigate =
    useNavigate();

  const {
    student,
  } =
    useOutletContext() || {};

  const [
    assignments,
    setAssignments,
  ] = useState([]);

  const [
    subjects,
    setSubjects,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const studentId =
    getStudentId(student);

  const studentClass =
    getStudentClass(student);

  /* ==========================================================
     LOAD ASSIGNMENTS
  ========================================================== */

  const loadAssignments =
    async () => {
      setLoading(true);
      setError("");

      try {
        const token =
          getAcademyToken();

        if (!token) {
          throw new Error(
            "Your student session has expired. Please log in again."
          );
        }

        const response =
          await fetch(
            ASSIGNMENTS_ENDPOINT,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

                "x-academy-token":
                  token,

                "x-student-token":
                  token,
              },
            }
          );

        const text =
          await response.text();

        let data = {};

        try {
          data = text
            ? JSON.parse(text)
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
              `Unable to load assignments. (${response.status})`
          );
        }

        const rawItems =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data.assignments
              )
            ? data.assignments
            : Array.isArray(
                data.data
              )
            ? data.data
            : Array.isArray(
                data.items
              )
            ? data.items
            : Array.isArray(
                data.results
              )
            ? data.results
            : [];

        const normalized =
          rawItems.map(
            (
              item,
              index
            ) =>
              normalizeAssignment(
                item,
                index
              )
          );

        /*
          Backend already filters by
          authenticated student class.

          This additional frontend guard
          prevents accidentally displaying
          assignments from another class if
          an unexpected response is returned.
        */

        const visible =
          studentClass
            ? normalized.filter(
                (assignment) => {
                  const assignmentClass =
                    clean(
                      assignment.className
                    ).toLowerCase();

                  const currentClass =
                    clean(
                      studentClass
                    ).toLowerCase();

                  if (
                    !assignmentClass ||
                    !currentClass
                  ) {
                    return true;
                  }

                  const normalizedA =
                    assignmentClass.replace(
                      /[^a-z0-9]/g,
                      ""
                    );

                  const normalizedB =
                    currentClass.replace(
                      /[^a-z0-9]/g,
                      ""
                    );

                  return (
                    normalizedA ===
                    normalizedB
                  );
                }
              )
            : normalized;

        setAssignments(
          visible
        );

        /*
          Use backend subject list when
          available. Otherwise derive it
          from the assignments.
        */

        const backendSubjects =
          Array.isArray(
            data.subjects
          )
            ? data.subjects
            : [];

        if (
          backendSubjects.length
        ) {
          setSubjects(
            backendSubjects
          );
        } else {
          const subjectMap =
            new Map();

          visible.forEach(
            (assignment) => {
              const subject =
                clean(
                  assignment.subject
                );

              if (!subject) {
                return;
              }

              const key =
                subject.toLowerCase();

              if (
                !subjectMap.has(
                  key
                )
              ) {
                subjectMap.set(
                  key,
                  {
                    name:
                      subject,

                    count: 0,
                  }
                );
              }

              subjectMap.get(
                key
              ).count += 1;
            }
          );

          setSubjects(
            Array.from(
              subjectMap.values()
            ).sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name
                )
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
    };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadAssignments();
  }, []);

  /* ==========================================================
     SUBJECT FILTER
  ========================================================== */

  const subjectFilteredAssignments =
    useMemo(() => {
      if (
        selectedSubject ===
        "all"
      ) {
        return assignments;
      }

      return assignments.filter(
        (assignment) =>
          assignment.subject
            .toLowerCase() ===
          selectedSubject.toLowerCase()
      );
    }, [
      assignments,
      selectedSubject,
    ]);

  /* ==========================================================
     SEARCH + STATUS FILTER
  ========================================================== */

  const filteredAssignments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return subjectFilteredAssignments.filter(
        (assignment) => {
          const matchesSearch =
            !query ||
            assignment.title
              .toLowerCase()
              .includes(query) ||
            assignment.subject
              .toLowerCase()
              .includes(query) ||
            assignment.className
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            assignment.status ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
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

  const stats =
    useMemo(() => {
      return {
        total:
          assignments.length,

        pending:
          assignments.filter(
            (item) =>
              item.status ===
              "pending"
          ).length,

        submitted:
          assignments.filter(
            (item) =>
              item.status ===
              "submitted"
          ).length,

        graded:
          assignments.filter(
            (item) =>
              item.status ===
                "graded" ||
              item.status ===
                "reviewed"
          ).length,
      };
    }, [
      assignments,
    ]);

  /* ==========================================================
     OPEN ASSIGNMENT
  ========================================================== */

  const openAssignment = (
    assignment
  ) => {
    navigate(
      `/academy/student/assignments/${assignment.id}`,
      {
        state: {
          assignment,

          document:
            assignment.document,

          student,

          studentId,

          studentClass,
        },
      }
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* ==================================================
            HEADER
        ================================================== */}

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
                  View and complete assignments
                  from your tutors.
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

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={
                  loadAssignments
                }
                className="ml-3 font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Try again
              </button>

            </div>

          </div>
        )}

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          {[
            {
              label: "Total",
              value:
                stats.total,
              icon:
                ClipboardCheck,
            },
            {
              label: "Pending",
              value:
                stats.pending,
              icon:
                Clock3,
            },
            {
              label: "Submitted",
              value:
                stats.submitted,
              icon:
                Upload,
            },
            {
              label: "Graded",
              value:
                stats.graded,
              icon:
                CheckCircle2,
            },
          ].map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={
                    item.label
                  }
                  className="rounded-2xl border border-white/10 bg-[#071426] p-4"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-400">
                      {item.label}
                    </span>

                    <Icon
                      size={18}
                      className="text-cyan-300"
                    />

                  </div>

                  <div className="mt-2 text-2xl font-bold">
                    {item.value}
                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* ==================================================
            SUBJECTS
        ================================================== */}

        {!loading &&
          subjects.length >
            0 && (
            <div className="space-y-3">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Subjects
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Only subjects with assignments
                    for your class are shown.
                  </p>
                </div>

                {selectedSubject !==
                  "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSubject(
                        "all"
                      )
                    }
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Show all
                  </button>
                )}

              </div>

              <div className="flex gap-3 overflow-x-auto pb-1">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedSubject(
                      "all"
                    )
                  }
                  className={`min-w-[110px] rounded-2xl border px-4 py-3 text-left transition ${
                    selectedSubject ===
                    "all"
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-white/10 bg-[#071426] hover:border-white/20"
                  }`}
                >

                  <p className="text-sm font-semibold">
                    All
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      assignments.length
                    }{" "}
                    assignment
                    {assignments.length ===
                    1
                      ? ""
                      : "s"}
                  </p>

                </button>

                {subjects.map(
                  (
                    subject
                  ) => {

                    const name =
                      typeof subject ===
                      "string"
                        ? subject
                        : subject.name;

                    const count =
                      typeof subject ===
                      "string"
                        ? assignments.filter(
                            (
                              assignment
                            ) =>
                              assignment.subject.toLowerCase() ===
                              name.toLowerCase()
                          ).length
                        : subject.count;

                    return (
                      <button
                        key={
                          name
                        }
                        type="button"
                        onClick={() =>
                          setSelectedSubject(
                            name
                          )
                        }
                        className={`min-w-[150px] rounded-2xl border px-4 py-3 text-left transition ${
                          selectedSubject.toLowerCase() ===
                          name.toLowerCase()
                            ? getSubjectStyle(
                                name
                              )
                            : "border-white/10 bg-[#071426] hover:border-white/20"
                        }`}
                      >

                        <p className="truncate text-sm font-semibold">
                          {name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {count}{" "}
                          assignment
                          {count ===
                          1
                            ? ""
                            : "s"}
                        </p>

                      </button>
                    );
                  }
                )}

              </div>

            </div>
          )}

        {/* ==================================================
            SEARCH / FILTER
        ================================================== */}

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search assignments..."
              className="w-full rounded-2xl border border-white/10 bg-[#071426] py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
            />

          </div>

          <div className="flex gap-2 overflow-x-auto">

            {[
              [
                "all",
                "All",
              ],
              [
                "pending",
                "Pending",
              ],
              [
                "submitted",
                "Submitted",
              ],
              [
                "graded",
                "Graded",
              ],
              [
                "overdue",
                "Overdue",
              ],
            ].map(
              ([
                value,
                label,
              ]) => (
                <button
                  key={
                    value
                  }
                  type="button"
                  onClick={() =>
                    setFilter(
                      value
                    )
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                    filter ===
                    value
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-[#071426] text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              )
            )}

          </div>

        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

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
        ) : filteredAssignments.length ===
          0 ? (

          /* ==================================================
             EMPTY
          ================================================== */

          <div className="rounded-3xl border border-white/10 bg-[#071426] p-12 text-center">

            <FileText
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              No assignments found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {assignments.length ===
              0
                ? "There are currently no assignments available for your class."
                : selectedSubject !==
                  "all"
                ? `There are no ${selectedSubject} assignments matching your current filter.`
                : "There are no assignments matching your current filter."}
            </p>

          </div>

        ) : (

          /* ==================================================
             ASSIGNMENTS
          ================================================== */

          <div className="space-y-4">

            {filteredAssignments.map(
              (
                assignment,
                index
              ) => {

                const documentUrl =
                  resolveFileUrl(
                    assignment
                      .document
                      ?.url
                  );

                const hasDocument =
                  Boolean(
                    documentUrl
                  );

                return (
                  <motion.div
                    key={
                      assignment.id
                    }
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index *
                        0.04,
                    }}
                    className="rounded-3xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* ========================================
                          INFORMATION
                      ======================================== */}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getSubjectStyle(
                              assignment.subject
                            )}`}
                          >
                            {
                              assignment.subject
                            }
                          </span>

                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                            {
                              getStatusLabel(
                                assignment.status
                              )
                            }
                          </span>

                        </div>

                        <h2 className="mt-3 text-lg font-semibold">
                          {
                            assignment.title
                          }
                        </h2>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                          {
                            assignment.description
                          }
                        </p>

                        {/* ======================================
                            META
                        ====================================== */}

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                          <span>
                            Class:{" "}

                            <strong className="text-slate-300">
                              {
                                assignment.className
                              }
                            </strong>
                          </span>

                          <span className="flex items-center gap-1.5">

                            <CalendarDays
                              size={14}
                            />

                            Due:{" "}

                            <strong className="text-slate-300">
                              {
                                formatDate(
                                  assignment.dueDate
                                )
                              }
                            </strong>

                          </span>

                          {assignment.totalQuestions >
                            0 && (
                            <span>
                              Questions:{" "}

                              <strong className="text-slate-300">
                                {
                                  assignment.totalQuestions
                                }
                              </strong>
                            </span>
                          )}

                          {assignment.score !==
                            null && (
                            <span>
                              Score:{" "}

                              <strong className="text-cyan-300">
                                {
                                  assignment.score
                                }
                                /
                                {
                                  assignment.maxScore ||
                                  assignment.totalMarks
                                }
                              </strong>
                            </span>
                          )}

                        </div>

                        {/* ======================================
                            TUTOR DOCUMENT
                        ====================================== */}

                        {hasDocument && (
                          <div className="mt-4 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">

                              <FileText
                                size={19}
                                className="text-cyan-300"
                              />

                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="text-xs font-medium text-slate-400">
                                Assignment Document
                              </p>

                              <p className="truncate text-sm text-slate-200">
                                {
                                  assignment
                                    .document
                                    .name ||
                                  "Tutor attachment"
                                }
                              </p>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                openAssignment(
                                  assignment
                                )
                              }
                              className="shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                            >
                              View
                            </button>

                          </div>
                        )}

                      </div>

                      {/* ========================================
                          ACTION
                      ======================================== */}

                      <button
                        type="button"
                        onClick={() =>
                          openAssignment(
                            assignment
                          )
                        }
                        className="shrink-0 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        {assignment.status ===
                        "graded"
                          ? "View Result"
                          : assignment.status ===
                            "reviewed"
                          ? "View Result"
                          : assignment.status ===
                            "submitted"
                          ? "View Submission"
                          : "Open Assignment"}
                      </button>

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
