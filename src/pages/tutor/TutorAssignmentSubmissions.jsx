import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/academy/tutor/assignments`;

const TOKEN_KEYS = [
  "scholiqen_academy_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

const USER_KEYS = [
  "scholiqen_academy_user",
  "academy_user",
  "scholiqen_current_user",
  "current_user",
  "user",
];

const REF_KEYS = [
  "tutorReference",
  "tutor_reference",
  "applicationReference",
  "application_reference",
  "reference",
];

function parseJSON(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getTutorSession() {
  let token = "";
  let reference = "";

  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value && value !== "null" && value !== "undefined") {
      token = value;
      break;
    }
  }

  for (const key of USER_KEYS) {
    const user = parseJSON(localStorage.getItem(key));
    if (!user || typeof user !== "object") continue;

    for (const field of REF_KEYS) {
      const value = String(user[field] || "").trim();

      if (/^SQA-[A-Z0-9-]+$/i.test(value)) {
        reference = value;
        break;
      }
    }

    if (reference) break;
  }

  if (!reference) {
    for (const key of REF_KEYS) {
      const value = String(localStorage.getItem(key) || "").trim();

      if (/^SQA-[A-Z0-9-]+$/i.test(value)) {
        reference = value;
        break;
      }
    }
  }

  return { token, reference };
}

async function requestJSON(url) {
  const { token, reference } = getTutorSession();

  if (!/^SQA-[A-Z0-9-]+$/i.test(reference)) {
    throw new Error(
      "Your SQA tutor reference was not found. Please log in again."
    );
  }

  const headers = {
    Accept: "application/json",
    "x-tutor-reference": reference,
    "x-tutor-ref": reference,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["x-access-token"] = token;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Invalid server response." };
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        data.error ||
        `Server request failed (${response.status}).`
    );
  }

  return data;
}

function unwrapObject(data, keys = []) {
  if (!data || typeof data !== "object") return {};

  for (const key of keys) {
    if (
      data[key] &&
      typeof data[key] === "object" &&
      !Array.isArray(data[key])
    ) {
      return data[key];
    }
  }

  if (data.data && typeof data.data === "object") {
    for (const key of keys) {
      if (
        data.data[key] &&
        typeof data.data[key] === "object" &&
        !Array.isArray(data.data[key])
      ) {
        return data.data[key];
      }
    }

    return data.data;
  }

  return data;
}

function unwrapArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  if (data?.data && typeof data.data === "object") {
    for (const key of keys) {
      if (Array.isArray(data.data[key])) return data.data[key];
    }
  }

  if (Array.isArray(data?.result)) return data.result;

  return [];
}

function normalizeAssignment(data, fallbackId) {
  const item = unwrapObject(data, ["assignment", "result"]);

  const questions = unwrapArray(item, [
    "questions",
    "assignment_questions",
  ]);

  return {
    ...item,
    id: item.id ?? item.assignment_id ?? fallbackId,
    title: item.title || "Assignment",
    subject: item.subject || "",
    class:
      item.class ||
      item.class_name ||
      item.grade ||
      "",
    description: item.description || item.instructions || "",
    questions,
    dueDate: item.due_date || item.dueDate || null,
  };
}

function normalizeSubmission(item, index) {
  const student =
    item.student ||
    item.student_details ||
    item.user ||
    {};

  const files = [
    item.file_url,
    item.fileUrl,
    item.attachment_url,
    item.attachmentUrl,
    item.submission_file_url,
    item.submissionFileUrl,
    item.document_url,
    item.documentUrl,
    item.uploaded_file_url,
    item.uploadedFileUrl,
  ].filter(Boolean);

  if (Array.isArray(item.files)) {
    for (const file of item.files) {
      const url =
        typeof file === "string"
          ? file
          : file?.url ||
            file?.file_url ||
            file?.fileUrl ||
            file?.path;

      if (url) files.push(url);
    }
  }

  return {
    ...item,
    id:
      item.id ??
      item.submission_id ??
      item.assignment_submission_id ??
      index + 1,
    studentName:
      item.student_name ||
      item.full_name ||
      student.full_name ||
      student.name ||
      [student.first_name, student.last_name]
        .filter(Boolean)
        .join(" ") ||
      "Student",
    studentReference:
      item.student_reference ||
      item.studentReference ||
      student.reference ||
      "",
    submittedAt:
      item.submitted_at ||
      item.submittedAt ||
      item.created_at ||
      item.updated_at ||
      null,
    status: String(item.status || "submitted").toLowerCase(),
    score:
      item.score ??
      item.marks_awarded ??
      item.total_score ??
      null,
    answers: Array.isArray(item.answers)
      ? item.answers
      : Array.isArray(item.answer_records)
        ? item.answer_records
        : [],
    files: [...new Set(files)],
  };
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

function readableStatus(value) {
  return String(value || "submitted")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function answerText(value) {
  if (value === undefined || value === null || value === "") {
    return "No answer provided";
  }

  if (Array.isArray(value)) return value.join(", ");

  if (typeof value === "object") {
    return (
      value.text ??
      value.answer ??
      value.value ??
      JSON.stringify(value)
    );
  }

  return String(value);
}

function getQuestionText(answer, assignment, index) {
  if (answer.question_text || answer.questionText) {
    return answer.question_text || answer.questionText;
  }

  if (
    answer.question &&
    typeof answer.question === "object"
  ) {
    return (
      answer.question.question_text ||
      answer.question.question ||
      answer.question.text ||
      `Question ${index + 1}`
    );
  }

  const questionId =
    answer.question_id ??
    answer.questionId ??
    answer.assignment_question_id;

  if (questionId !== undefined && questionId !== null) {
    const matched = assignment.questions?.find(
      (question) =>
        String(question.id ?? question.question_id) ===
        String(questionId)
    );

    if (matched) {
      return (
        matched.question_text ||
        matched.question ||
        matched.text ||
        `Question ${index + 1}`
      );
    }
  }

  const questionNumber = Number(
    answer.question_number ?? answer.questionNumber
  );

  if (questionNumber > 0) {
    const matched = assignment.questions?.find(
      (question, questionIndex) =>
        Number(
          question.question_number ??
            question.questionNumber ??
            questionIndex + 1
        ) === questionNumber
    );

    if (matched) {
      return (
        matched.question_text ||
        matched.question ||
        matched.text ||
        `Question ${index + 1}`
      );
    }
  }

  return (
    assignment.questions?.[index]?.question_text ||
    assignment.questions?.[index]?.question ||
    assignment.questions?.[index]?.text ||
    `Question ${index + 1}`
  );
}

function getStudentAnswer(answer) {
  return (
    answer.student_answer ??
    answer.studentAnswer ??
    answer.answer_text ??
    answer.answer ??
    answer.response ??
    answer.selected_option ??
    answer.answer_value ??
    answer.text_answer ??
    answer.written_answer ??
    answer.response_text ??
    answer.value
  );
}

function getFileName(url) {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(pathname.split("/").pop()) || "Submitted file";
  } catch {
    return String(url).split("/").pop() || "Submitted file";
  }
}

function isDocument(url) {
  return /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|png|jpe?g|webp)(\?|#|$)/i.test(
    url
  );
}

function isVideo(url) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

function fileHref(url) {
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
}

export default function TutorAssignmentSubmissions() {
  const navigate = useNavigate();
  const params = useParams();

  const assignmentId =
    params.assignmentId ||
    params.id ||
    new URLSearchParams(window.location.search).get("assignmentId") ||
    "";

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    if (!assignmentId) {
      setError("Assignment ID is missing from the page URL.");
      setLoading(false);
      return;
    }

    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const { reference } = getTutorSession();
      const query = new URLSearchParams({
        reference,
        tutorReference: reference,
      }).toString();

      const base = `${API_URL}/${encodeURIComponent(assignmentId)}`;

      const [assignmentResponse, submissionsResponse] =
        await Promise.all([
          requestJSON(`${base}?${query}`),
          requestJSON(`${base}/submissions?${query}`),
        ]);

      const nextAssignment = normalizeAssignment(
        assignmentResponse,
        assignmentId
      );

      const list = unwrapArray(submissionsResponse, [
        "submissions",
        "results",
        "items",
      ]).map(normalizeSubmission);

      setAssignment(nextAssignment);
      setSubmissions(list);

      setSelected((previous) => {
        if (!previous) return null;

        return (
          list.find(
            (item) => String(item.id) === String(previous.id)
          ) || null
        );
      });
    } catch (err) {
      console.error("Tutor submissions error:", err);
      setError(err.message || "Unable to load assignment.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return submissions;

    return submissions.filter((submission) =>
      [
        submission.studentName,
        submission.studentReference,
        submission.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      )
    );
  }, [submissions, search]);

  const openSubmission = async (submission) => {
    setSelected(submission);
    setDetailError("");

    setDetailLoading(true);

    try {
      const { reference } = getTutorSession();
      const query = new URLSearchParams({
        reference,
        tutorReference: reference,
      }).toString();

      const url =
        `${API_URL}/${encodeURIComponent(assignmentId)}` +
        `/submissions/${encodeURIComponent(submission.id)}?${query}`;

      const response = await requestJSON(url);
      const detail = unwrapObject(response, ["submission", "result"]);

      const answerList = unwrapArray(detail, [
        "answers",
        "answer_records",
        "responses",
      ]);

      const merged = normalizeSubmission(
        {
          ...submission,
          ...detail,
          answers: answerList.length
            ? answerList
            : submission.answers,
        },
        0
      );

      setSelected(merged);

      setSubmissions((previous) =>
        previous.map((item) =>
          String(item.id) === String(merged.id)
            ? merged
            : item
        )
      );
    } catch (err) {
      console.error("Submission detail error:", err);
      setDetailError(err.message || "Unable to load submission details.");
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">
            Loading student submissions...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] p-5 text-slate-100 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900"
          >
            <ArrowLeft size={16} />
            Go back
          </button>

          <section className="rounded-2xl border border-red-500/30 bg-[#0B1220] p-6">
            <AlertCircle className="mb-4 h-8 w-8 text-red-400" />
            <h1 className="text-xl font-semibold">
              Unable to load assignment
            </h1>
            <p className="mt-3 break-words text-sm leading-6 text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadData()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-slate-100 sm:px-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-900"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-[#071426] p-5 sm:p-7">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
            <FileText size={16} />
            Student work
          </p>

          <h1 className="break-words text-2xl font-bold sm:text-3xl">
            {assignment?.title || "Assignment submissions"}
          </h1>

          {assignment?.description && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
              {assignment.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {assignment?.subject && (
              <span className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300">
                {assignment.subject}
              </span>
            )}

            {assignment?.class && (
              <span className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-300">
                {assignment.class}
              </span>
            )}

            <span className="rounded-full border border-cyan-500/30 px-3 py-1.5 text-cyan-300">
              {submissions.length} submission(s)
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#071426]">
            <div className="border-b border-slate-800 p-4">
              <h2 className="font-semibold">Students</h2>

              <div className="relative mt-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student..."
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] py-3 pl-9 pr-3 text-sm outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                <p className="font-medium text-slate-300">
                  {submissions.length
                    ? "No matching students"
                    : "No submissions found"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {submissions.length
                    ? "Try another search."
                    : "Student submissions will appear here after students submit their work."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredSubmissions.map((submission) => (
                  <button
                    key={submission.id}
                    type="button"
                    onClick={() => openSubmission(submission)}
                    className={`w-full p-4 text-left transition ${
                      String(selected?.id) === String(submission.id)
                        ? "bg-cyan-500/10"
                        : "hover:bg-slate-900/70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
                        <UserRound size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words font-medium">
                          {submission.studentName}
                        </p>

                        {submission.studentReference && (
                          <p className="mt-1 break-all text-xs text-slate-500">
                            {submission.studentReference}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          {readableStatus(submission.status)}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 size={12} />
                          {formatDate(submission.submittedAt)}
                        </p>

                        {submission.files.length > 0 && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300">
                            <FileText size={13} />
                            {submission.files.length} uploaded file(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#071426]">
            {!selected ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
                <FileText className="mb-4 h-10 w-10 text-slate-600" />
                <h2 className="font-semibold">Submitted work</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Select a student to view the work they submitted for this assignment.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 p-5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      Student submission
                    </p>

                    <h2 className="mt-2 break-words text-xl font-semibold">
                      {selected.studentName}
                    </h2>

                    <p className="mt-2 text-xs text-slate-400">
                      Submitted: {formatDate(selected.submittedAt)}
                    </p>

                    {selected.score !== null &&
                      selected.score !== undefined && (
                        <p className="mt-2 text-sm text-emerald-300">
                          Score: {selected.score}
                        </p>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-900"
                    aria-label="Close submission"
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="space-y-6 p-5">
                  {detailLoading && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-800 p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                      <p className="text-sm text-slate-400">
                        Loading the student's saved answers and files...
                      </p>
                    </div>
                  )}

                  {detailError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                      <p className="text-sm leading-6 text-red-300">
                        {detailError}
                      </p>
                    </div>
                  )}

                  {selected.files.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-semibold">
                        <FileText size={18} className="text-cyan-300" />
                        Uploaded files
                      </h3>

                      <div className="space-y-3">
                        {selected.files.map((file, index) => {
                          const href = fileHref(file);
                          const filename = getFileName(file);

                          return (
                            <div
                              key={`${file}-${index}`}
                              className="rounded-xl border border-slate-800 bg-[#020617] p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <FileText className="h-6 w-6 shrink-0 text-cyan-300" />

                                  <div className="min-w-0">
                                    <p className="break-all text-sm font-medium">
                                      {filename}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      File submitted by student
                                    </p>
                                  </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900"
                                  >
                                    <ExternalLink size={14} />
                                    Open
                                  </a>

                                  <a
                                    href={href}
                                    download={filename}
                                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                                  >
                                    <Download size={14} />
                                    Download
                                  </a>
                                </div>
                              </div>

                              {isDocument(file) && /\.pdf(\?|#|$)/i.test(file) && (
                                <iframe
                                  title={`Student submission ${filename}`}
                                  src={href}
                                  className="mt-4 h-[500px] w-full rounded-lg border border-slate-800 bg-white"
                                />
                              )}

                              {isVideo(file) && (
                                <video
                                  controls
                                  preload="metadata"
                                  className="mt-4 max-h-[500px] w-full rounded-lg bg-black"
                                >
                                  <source src={href} />
                                  Your browser does not support video playback.
                                </video>
                              )}

                              {/\.(png|jpe?g|webp)(\?|#|$)/i.test(file) && (
                                <img
                                  src={href}
                                  alt={filename}
                                  className="mt-4 max-h-[500px] max-w-full rounded-lg object-contain"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selected.submission_text ||
                  selected.answer_text ||
                  selected.response_text ||
                  selected.written_answer ? (
                    <div>
                      <h3 className="mb-3 font-semibold">
                        Written submission
                      </h3>

                      <div className="whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-[#020617] p-4 text-sm leading-7 text-slate-200">
                        {selected.submission_text ||
                          selected.answer_text ||
                          selected.response_text ||
                          selected.written_answer}
                      </div>
                    </div>
                  ) : null}

                  {selected.answers.length > 0 && (
                    <div>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-semibold">
                          Answers to assignment questions
                        </h3>

                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                          {selected.answers.length} answer(s)
                        </span>
                      </div>

                      <div className="space-y-4">
                        {selected.answers.map((answer, index) => {
                          const response = getStudentAnswer(answer);
                          const correctAnswer =
                            answer.correct_answer ??
                            answer.correctAnswer ??
                            "";

                          const hasCorrectness =
                            answer.is_correct !== undefined &&
                            answer.is_correct !== null;

                          const correct =
                            answer.is_correct === true ||
                            answer.is_correct === 1 ||
                            answer.is_correct === "true";

                          return (
                            <article
                              key={
                                answer.id ??
                                answer.answer_id ??
                                `${selected.id}-${index}`
                              }
                              className="rounded-xl border border-slate-800 bg-[#020617] p-4 sm:p-5"
                            >
                              <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                                    Question {index + 1}
                                  </p>

                                  <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6">
                                    {getQuestionText(
                                      answer,
                                      assignment,
                                      index
                                    )}
                                  </p>
                                </div>

                                {hasCorrectness && (
                                  <span
                                    className={
                                      correct
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                    }
                                  >
                                    <CheckCircle2 size={19} />
                                  </span>
                                )}
                              </div>

                              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                <p className="text-xs text-slate-500">
                                  Student's submitted answer
                                </p>

                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                                  {answerText(response)}
                                </p>
                              </div>

                              {correctAnswer !== "" && (
                                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                                  <p className="text-xs text-emerald-400">
                                    Correct answer
                                  </p>

                                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                                    {answerText(correctAnswer)}
                                  </p>
                                </div>
                              )}

                              {answer.feedback && (
                                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-400">
                                  Feedback: {answer.feedback}
                                </p>
                              )}

                              {answer.marks_awarded !== undefined &&
                                answer.marks_awarded !== null && (
                                  <p className="mt-3 text-xs text-slate-400">
                                    Marks awarded: {answer.marks_awarded}
                                  </p>
                                )}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!detailLoading &&
                    !detailError &&
                    selected.answers.length === 0 &&
                    selected.files.length === 0 &&
                    !selected.submission_text &&
                    !selected.answer_text &&
                    !selected.response_text &&
                    !selected.written_answer && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

                          <div>
                            <h3 className="font-semibold text-amber-200">
                              Submission content not returned
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              The server returned a submission record but no
                              saved answers or file location. This page can
                              display the student's work once the backend
                              returns the actual answer records and uploaded
                              file path for this submission.
                            </p>

                            <button
                              type="button"
                              onClick={() => openSubmission(selected)}
                              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
                            >
                              <RefreshCw size={14} />
                              Reload submission
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-500">Submission status</p>
                    <p className="mt-2 text-sm font-medium text-slate-200">
                      {readableStatus(selected.status)}
                    </p>

                    {selected.score !== null &&
                      selected.score !== undefined && (
                        <p className="mt-2 text-sm text-emerald-300">
                          Score: {selected.score}
                        </p>
                      )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
