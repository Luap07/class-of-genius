import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function apiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Avoid /api/api when VITE_API_URL already ends in /api.
  if (/\/api$/i.test(API_BASE) && /^\/api\//i.test(cleanPath)) {
    return `${API_BASE}${cleanPath.slice(4)}`;
  }

  return `${API_BASE}${cleanPath}`;
}

/* =========================================================
   STORAGE HELPERS
========================================================= */

function readJSON(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getAcademyUser() {
  const keys = [
    "scholiqen_academy_user",
    "academy_user",
    "scholiqen_current_user",
    "tutor",
    "academyTutor",
  ];

  for (const key of keys) {
    const value = readJSON(key);

    if (value && typeof value === "object") {
      return value;
    }
  }

  return {};
}

function getAcademyToken() {
  const keys = [
    "scholiqen_academy_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
    "scholiqen_auth_token",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value && value !== "null" && value !== "undefined") {
      return value.replace(/^Bearer\s+/i, "").trim();
    }
  }

  return "";
}

function getTutorReference(user) {
  const candidates = [
    user?.reference,
    user?.tutorReference,
    user?.tutor_reference,
    user?.applicationReference,
    user?.application_reference,
    readJSON("tutor")?.reference,
    readJSON("tutor")?.tutorReference,
    readJSON("academyTutor")?.reference,
    readJSON("academyTutor")?.tutorReference,
  ];

  return (
    candidates
      .map((value) => String(value || "").trim())
      .find((value) => /^SQA-/i.test(value)) || ""
  );
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function unwrapObject(payload) {
  let value = payload;

  for (let i = 0; i < 4; i += 1) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      break;
    }

    if (value.data && typeof value.data === "object") {
      value = value.data;
      continue;
    }

    if (value.result && typeof value.result === "object") {
      value = value.result;
      continue;
    }

    break;
  }

  return value;
}

function extractArray(payload, keys) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const objects = [payload, unwrapObject(payload)];

  for (const object of objects) {
    if (!object || typeof object !== "object") {
      continue;
    }

    for (const key of keys) {
      if (Array.isArray(object[key])) {
        return object[key];
      }
    }
  }

  return [];
}

function getId(item) {
  return String(
    item?.id ??
      item?.assignment_id ??
      item?.assignmentId ??
      ""
  ).trim();
}

function getSubmissionId(item) {
  return String(
    item?.submission_id ??
      item?.submissionId ??
      item?.id ??
      ""
  ).trim();
}

function getAssignmentTitle(item) {
  return (
    item?.title ||
    item?.assignment_title ||
    item?.assignmentTitle ||
    "Untitled assignment"
  );
}

function getStudentName(item) {
  const student = item?.student || item?.learner || {};

  return (
    item?.student_name ||
    item?.studentName ||
    item?.learner_name ||
    item?.name ||
    student?.full_name ||
    student?.fullName ||
    student?.name ||
    item?.student_reference ||
    item?.studentReference ||
    "Student"
  );
}

function getSubmissionDate(item) {
  const date =
    item?.submitted_at ||
    item?.submittedAt ||
    item?.submission_date ||
    item?.submissionDate ||
    item?.created_at ||
    item?.createdAt;

  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleString();
}

function getStatus(item) {
  return String(
    item?.status ||
      item?.submission_status ||
      item?.submissionStatus ||
      (item?.submitted_at || item?.submittedAt ? "submitted" : "pending")
  ).toLowerCase();
}

/* =========================================================
   API REQUEST
========================================================= */

async function requestJSON(path, options = {}) {
  const user = getAcademyUser();
  const token = getAcademyToken();
  const reference = getTutorReference(user);

  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (reference) {
    headers["x-tutor-reference"] = reference;
    headers["x-tutor-ref"] = reference;
  }

  const separator = path.includes("?") ? "&" : "?";

  const requestPath = reference
    ? `${path}${separator}reference=${encodeURIComponent(
        reference
      )}&tutorReference=${encodeURIComponent(reference)}`
    : path;

  const url = apiUrl(requestPath);

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Tutor API network error:", {
      url,
      message: error?.message,
    });

    throw new Error(
      `Cannot connect to the server. Request: ${url}`
    );
  }

  const responseText = await response.text();

  let payload = {};

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { message: responseText };
    }
  }

  if (!response.ok) {
    console.error("Tutor API request failed:", {
      status: response.status,
      url: response.url || url,
      response: payload,
    });

    const message =
      payload?.message ||
      payload?.error ||
      `Request failed (${response.status})`;

    throw new Error(
      `${message}. URL: ${response.url || url}`
    );
  }

  return payload;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorAssignmentSubmissions() {
  const navigate = useNavigate();
  const params = useParams();

  // App.jsx uses :id for the assignment route.
  const routeAssignmentId = String(
    params.id || params.assignmentId || ""
  ).trim();

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState(routeAssignmentId);

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [loadingAssignments, setLoadingAssignments] =
    useState(true);
  const [loadingSubmissions, setLoadingSubmissions] =
    useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [assignmentsError, setAssignmentsError] = useState("");
  const [submissionsError, setSubmissionsError] = useState("");
  const [detailsError, setDetailsError] = useState("");

  const [search, setSearch] = useState("");

  const user = useMemo(() => getAcademyUser(), []);
  const tutorReference = useMemo(
    () => getTutorReference(user),
    [user]
  );

  /* =======================================================
     LOAD ASSIGNMENTS
  ======================================================= */

  const loadAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    setAssignmentsError("");

    try {
      const response = await requestJSON(
        "/api/academy/tutor/assignments",
        { method: "GET" }
      );

      const rows = extractArray(response, [
        "assignments",
        "results",
        "data",
        "rows",
      ]);

      const normalized = rows.filter(
        (item) => item && typeof item === "object"
      );

      setAssignments(normalized);

      setSelectedAssignmentId((current) => {
        if (
          routeAssignmentId &&
          normalized.some(
            (item) => getId(item) === routeAssignmentId
          )
        ) {
          return routeAssignmentId;
        }

        if (
          current &&
          normalized.some((item) => getId(item) === current)
        ) {
          return current;
        }

        return routeAssignmentId || getId(normalized[0]) || "";
      });
    } catch (error) {
      console.error("Could not load tutor assignments:", error);
      setAssignmentsError(
        error?.message || "Unable to load assignments."
      );
    } finally {
      setLoadingAssignments(false);
    }
  }, [routeAssignmentId]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  /* =======================================================
     LOAD SUBMISSIONS FOR SELECTED ASSIGNMENT
  ======================================================= */

  const loadSubmissions = useCallback(async () => {
    if (!selectedAssignmentId) {
      setSubmissions([]);
      setSubmissionsError("");
      return;
    }

    setLoadingSubmissions(true);
    setSubmissionsError("");
    setSubmissions([]);
    setSelectedSubmission(null);

    try {
      const path =
        `/api/academy/tutor/assignments/` +
        `${encodeURIComponent(selectedAssignmentId)}/submissions`;

      const response = await requestJSON(path, {
        method: "GET",
      });

      const rows = extractArray(response, [
        "submissions",
        "results",
        "data",
        "rows",
        "records",
      ]);

      setSubmissions(
        rows.filter((item) => item && typeof item === "object")
      );
    } catch (error) {
      console.error(
        "Could not load submissions for assignment:",
        selectedAssignmentId,
        error
      );

      setSubmissionsError(
        error?.message || "Unable to load student submissions."
      );
    } finally {
      setLoadingSubmissions(false);
    }
  }, [selectedAssignmentId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  /* =======================================================
     OPEN THE EXACT STUDENT SUBMISSION
  ======================================================= */

  const openSubmission = useCallback(
    async (submission) => {
      const submissionId = getSubmissionId(submission);

      if (!selectedAssignmentId || !submissionId) {
        setDetailsError(
          "This submission does not contain an assignment ID or submission ID."
        );
        return;
      }

      setLoadingDetails(true);
      setDetailsError("");
      setSelectedSubmission(null);

      try {
        const path =
          `/api/academy/tutor/assignments/` +
          `${encodeURIComponent(selectedAssignmentId)}` +
          `/submissions/${encodeURIComponent(submissionId)}`;

        const response = await requestJSON(path, {
          method: "GET",
        });

        const detail = unwrapObject(response);

        // Keep the selected row's student identity even if the
        // API returns the detailed record inside another wrapper.
        const detailSubmission =
          detail?.submission ||
          detail?.record ||
          detail?.result ||
          detail;

        setSelectedSubmission({
          ...submission,
          ...detailSubmission,
          id: submissionId,
          submission_id: submissionId,
          assignment_id: selectedAssignmentId,
          _rawResponse: response,
        });
      } catch (error) {
        console.error("Could not load submission details:", error);
        setDetailsError(
          error?.message ||
            "Unable to load this student's submitted work."
        );
      } finally {
        setLoadingDetails(false);
      }
    },
    [selectedAssignmentId]
  );

  /* =======================================================
     FILTER SUBMISSIONS
  ======================================================= */

  const filteredSubmissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return submissions;

    return submissions.filter((submission) => {
      const student = getStudentName(submission).toLowerCase();
      const id = getSubmissionId(submission).toLowerCase();
      const reference = String(
        submission?.student_reference ||
          submission?.studentReference ||
          ""
      ).toLowerCase();

      return (
        student.includes(term) ||
        id.includes(term) ||
        reference.includes(term)
      );
    });
  }, [submissions, search]);

  const selectedAssignment = useMemo(
    () =>
      assignments.find(
        (item) => getId(item) === selectedAssignmentId
      ) || null,
    [assignments, selectedAssignmentId]
  );

  /* =======================================================
     FILE HELPERS
  ======================================================= */

  const getStudentSubmissionFile = (submission) => {
    if (!submission) return "";

    // These fields belong to the submission record, not the
    // original assignment. Never use assignment attachment fields
    // as if they were the student's uploaded file.
    const candidates = [
      submission.submission_file_url,
      submission.submissionFileUrl,
      submission.submitted_file_url,
      submission.submittedFileUrl,
      submission.file_url,
      submission.fileUrl,
      submission.attachment_url,
      submission.attachmentUrl,
      submission.submission_file,
      submission.submissionFile,
      submission.file_path,
      submission.filePath,
      submission.attachment_path,
      submission.attachmentPath,
    ];

    const value = candidates.find(
      (candidate) =>
        typeof candidate === "string" &&
        candidate.trim() &&
        !candidate.trim().startsWith("[object")
    );

    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const normalized = value.replace(/\\/g, "/");

    if (normalized.startsWith("/")) {
      return apiUrl(normalized);
    }

    if (normalized.startsWith("uploads/")) {
      return apiUrl(`/${normalized}`);
    }

    if (normalized.startsWith("uploads/academy-assignments/")) {
      return apiUrl(`/${normalized}`);
    }

    return apiUrl(`/uploads/academy-assignments/${normalized}`);
  };

  const detailAnswers = useMemo(() => {
    if (!selectedSubmission) return [];

    const response = selectedSubmission._rawResponse;
    const root = unwrapObject(response);

    const candidates = [
      selectedSubmission.answers,
      selectedSubmission.answer_records,
      selectedSubmission.answerRecords,
      selectedSubmission.responses,
      selectedSubmission.questions,
      root?.answers,
      root?.answer_records,
      root?.answerRecords,
      root?.responses,
      root?.questions,
      root?.submission?.answers,
      root?.submission?.answer_records,
      root?.submission?.responses,
      root?.data?.answers,
    ];

    return candidates.find(Array.isArray) || [];
  }, [selectedSubmission]);

  /* =======================================================
     STYLES
  ======================================================= */

  const styles = {
    page: {
      minHeight: "100%",
      padding: "24px",
      color: "#e5e7eb",
      background: "#020617",
    },
    panel: {
      background: "#071426",
      border: "1px solid #1e293b",
      borderRadius: "14px",
      padding: "20px",
    },
    muted: {
      color: "#94a3b8",
      fontSize: "13px",
    },
    button: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      border: "1px solid #334155",
      borderRadius: "9px",
      padding: "10px 14px",
      background: "#0b1220",
      color: "#e2e8f0",
      cursor: "pointer",
      fontWeight: 600,
    },
    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      border: "1px solid #2563eb",
      borderRadius: "9px",
      padding: "10px 14px",
      background: "#1d4ed8",
      color: "#ffffff",
      cursor: "pointer",
      fontWeight: 600,
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "9px",
      color: "#f8fafc",
      outline: "none",
    },
    error: {
      padding: "14px",
      background: "rgba(127, 29, 29, 0.22)",
      border: "1px solid #7f1d1d",
      borderRadius: "10px",
      color: "#fecaca",
      overflowWrap: "anywhere",
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    },
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div style={styles.page}>
      <div style={{ ...styles.row, marginBottom: 22 }}>
        <div>
          <button
            type="button"
            style={styles.button}
            onClick={() => navigate("/academy/tutor/assignments")}
          >
            <ArrowLeft size={16} />
            Back to Assignments
          </button>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              margin: "18px 0 6px",
            }}
          >
            Assignment Submissions
          </h1>

          <p style={styles.muted}>
            View the work submitted by your students.
          </p>

          {tutorReference ? (
            <p style={{ ...styles.muted, marginTop: 6 }}>
              Tutor reference: {tutorReference}
            </p>
          ) : (
            <p style={{ ...styles.muted, marginTop: 6, color: "#fbbf24" }}>
              No SQA tutor reference was found in the Academy session.
            </p>
          )}
        </div>

        <button
          type="button"
          style={styles.button}
          onClick={() => {
            loadAssignments();
            loadSubmissions();
          }}
          disabled={loadingAssignments || loadingSubmissions}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ASSIGNMENT SELECTOR */}

      <section style={{ ...styles.panel, marginBottom: 20 }}>
        <label
          htmlFor="submission-assignment"
          style={{
            display: "block",
            marginBottom: 9,
            fontWeight: 700,
          }}
        >
          Select assignment
        </label>

        <div style={{ position: "relative" }}>
          <select
            id="submission-assignment"
            value={selectedAssignmentId}
            onChange={(event) => {
              const id = event.target.value;

              setSelectedAssignmentId(id);
              setSelectedSubmission(null);
              setDetailsError("");
            }}
            style={{
              ...styles.input,
              appearance: "none",
              paddingRight: "38px",
            }}
            disabled={loadingAssignments}
          >
            <option value="">Choose an assignment</option>

            {assignments.map((assignment, index) => {
              const id = getId(assignment);

              if (!id) return null;

              return (
                <option key={id || index} value={id}>
                  {getAssignmentTitle(assignment)}
                </option>
              );
            })}
          </select>

          <ChevronDown
            size={17}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#94a3b8",
            }}
          />
        </div>

        {selectedAssignment && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>
              {getAssignmentTitle(selectedAssignment)}
            </div>

            <p style={{ ...styles.muted, marginTop: 5 }}>
              {selectedAssignment.subject || "Subject not specified"}
              {" · "}
              {selectedAssignment.class ||
                selectedAssignment.grade ||
                selectedAssignment.class_name ||
                "Class not specified"}
            </p>
          </div>
        )}

        {loadingAssignments && (
          <p style={{ ...styles.muted, marginTop: 12 }}>
            <Loader2
              size={15}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 7,
              }}
            />
            Loading assignments...
          </p>
        )}

        {assignmentsError && (
          <div style={{ ...styles.error, marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <AlertCircle size={18} />
              <strong>Unable to load assignments</strong>
            </div>

            <div>{assignmentsError}</div>

            <button
              type="button"
              style={{ ...styles.button, marginTop: 12 }}
              onClick={loadAssignments}
            >
              Try again
            </button>
          </div>
        )}

        {!loadingAssignments &&
          !assignmentsError &&
          assignments.length === 0 && (
            <p style={{ ...styles.muted, marginTop: 14 }}>
              No assignments were returned by the server.
            </p>
          )}
      </section>

      {/* SUBMISSION LIST */}

      <section style={styles.panel}>
        <div style={{ ...styles.row, marginBottom: 16 }}>
          <div>
            <h2
              style={{
                fontSize: "19px",
                fontWeight: 800,
                margin: 0,
              }}
            >
              Student Submissions
            </h2>

            <p style={{ ...styles.muted, marginTop: 6 }}>
              {submissions.length} submission
              {submissions.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div style={{ minWidth: 220, flex: "1 1 240px", maxWidth: 360 }}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student or reference..."
              style={styles.input}
              aria-label="Search submissions"
            />
          </div>
        </div>

        {!selectedAssignmentId && !loadingAssignments && (
          <p style={styles.muted}>
            Select an assignment to view its submissions.
          </p>
        )}

        {loadingSubmissions && (
          <p style={styles.muted}>
            <Loader2
              size={16}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 8,
              }}
            />
            Loading student submissions...
          </p>
        )}

        {submissionsError && (
          <div style={styles.error}>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <AlertCircle size={18} />
              <strong>Unable to load student submissions</strong>
            </div>

            <div>{submissionsError}</div>

            <button
              type="button"
              style={{ ...styles.button, marginTop: 12 }}
              onClick={loadSubmissions}
            >
              Try again
            </button>
          </div>
        )}

        {!loadingSubmissions &&
          !submissionsError &&
          selectedAssignmentId &&
          filteredSubmissions.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "34px 12px",
                color: "#94a3b8",
              }}
            >
              <ClipboardList
                size={34}
                style={{ marginBottom: 10, opacity: 0.7 }}
              />

              <div style={{ fontWeight: 700, color: "#e2e8f0" }}>
                No submissions found
              </div>

              <p style={{ fontSize: 13 }}>
                Submitted work for this assignment will appear here.
              </p>
            </div>
          )}

        <div style={{ display: "grid", gap: 12 }}>
          {filteredSubmissions.map((submission, index) => {
            const submissionId = getSubmissionId(submission);
            const status = getStatus(submission);
            const studentName = getStudentName(submission);

            return (
              <article
                key={submissionId || index}
                style={{
                  border: "1px solid #263449",
                  background: "#050b18",
                  borderRadius: 11,
                  padding: 16,
                }}
              >
                <div style={styles.row}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        background: "#14213a",
                        color: "#93c5fd",
                      }}
                    >
                      <Users size={20} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 750,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {studentName}
                      </div>

                      <div style={{ ...styles.muted, marginTop: 4 }}>
                        Submitted: {getSubmissionDate(submission)}
                      </div>

                      {submission?.student_reference ||
                      submission?.studentReference ? (
                        <div style={{ ...styles.muted, marginTop: 3 }}>
                          Reference:{" "}
                          {submission.student_reference ||
                            submission.studentReference}
                        </div>
                      ) : null}

                      <div style={{ ...styles.muted, marginTop: 3 }}>
                        Submission ID: {submissionId || "Missing ID"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        borderRadius: 999,
                        padding: "5px 10px",
                        border: "1px solid #334155",
                        color:
                          status.includes("graded") ||
                          status.includes("reviewed")
                            ? "#86efac"
                            : "#bfdbfe",
                        background:
                          status.includes("graded") ||
                          status.includes("reviewed")
                            ? "rgba(22, 101, 52, 0.2)"
                            : "rgba(30, 64, 175, 0.2)",
                      }}
                    >
                      {status}
                    </span>

                    <button
                      type="button"
                      style={styles.primaryButton}
                      onClick={() => openSubmission(submission)}
                      disabled={!submissionId || loadingDetails}
                    >
                      <FileText size={16} />
                      View Submission
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* EXACT SUBMISSION DETAILS */}

      {(loadingDetails || detailsError || selectedSubmission) && (
        <section
          style={{
            ...styles.panel,
            marginTop: 20,
          }}
        >
          <div style={{ ...styles.row, marginBottom: 16 }}>
            <h2 style={{ fontSize: 19, margin: 0 }}>
              Submitted Work
            </h2>

            {selectedSubmission && (
              <button
                type="button"
                style={styles.button}
                onClick={() => {
                  setSelectedSubmission(null);
                  setDetailsError("");
                }}
              >
                Close details
              </button>
            )}
          </div>

          {loadingDetails && (
            <p style={styles.muted}>
              <Loader2
                size={16}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Loading the selected student's submission...
            </p>
          )}

          {detailsError && (
            <div style={styles.error}>
              <AlertCircle
                size={17}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 7,
                }}
              />
              {detailsError}
            </div>
          )}

          {selectedSubmission && !loadingDetails && (
            <>
              <div
                style={{
                  background: "#020617",
                  border: "1px solid #263449",
                  borderRadius: 10,
                  padding: 15,
                  marginBottom: 16,
                }}
              >
                <div style={styles.muted}>Student</div>

                <div style={{ fontWeight: 800, marginTop: 4 }}>
                  {getStudentName(selectedSubmission)}
                </div>

                <div style={{ ...styles.muted, marginTop: 10 }}>
                  Submission ID: {getSubmissionId(selectedSubmission)}
                </div>

                <div style={{ ...styles.muted, marginTop: 5 }}>
                  Submitted: {getSubmissionDate(selectedSubmission)}
                </div>
              </div>

              {(() => {
                const fileUrl =
                  getStudentSubmissionFile(selectedSubmission);

                return fileUrl ? (
                  <div
                    style={{
                      border: "1px solid #334155",
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <FileText size={18} />
                      <strong>Student's uploaded file</strong>
                    </div>

                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#93c5fd",
                        display: "inline-flex",
                        gap: 7,
                        alignItems: "center",
                        overflowWrap: "anywhere",
                      }}
                    >
                      Open submitted file
                      <ExternalLink size={15} />
                    </a>
                  </div>
                ) : (
                  <div
                    style={{
                      ...styles.muted,
                      padding: 13,
                      border: "1px solid #263449",
                      borderRadius: 10,
                      marginBottom: 16,
                    }}
                  >
                    No student-uploaded file URL was returned in the
                    submission details. This does not mean the original
                    assignment attachment is the student's submission.
                  </div>
                );
              })()}

              <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
                Answers and responses
              </h3>

              {detailAnswers.length > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {detailAnswers.map((answer, index) => (
                    <div
                      key={
                        answer?.id ||
                        answer?.question_id ||
                        answer?.questionId ||
                        index
                      }
                      style={{
                        background: "#020617",
                        border: "1px solid #263449",
                        borderRadius: 10,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontWeight: 750, marginBottom: 9 }}>
                        {answer?.question_text ||
                          answer?.questionText ||
                          answer?.question ||
                          answer?.text ||
                          `Question ${index + 1}`}
                      </div>

                      <div style={styles.muted}>Student's answer</div>

                      <div
                        style={{
                          marginTop: 5,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {String(
                          answer?.student_answer ??
                            answer?.studentAnswer ??
                            answer?.answer_text ??
                            answer?.answerText ??
                            answer?.answer ??
                            answer?.response ??
                            "No answer text returned."
                        )}
                      </div>

                      {answer?.marks_awarded != null && (
                        <div style={{ ...styles.muted, marginTop: 10 }}>
                          Marks awarded: {answer.marks_awarded}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    border: "1px solid #7c5a18",
                    background: "rgba(120, 78, 10, 0.12)",
                    borderRadius: 10,
                    padding: 14,
                    color: "#fde68a",
                  }}
                >
                  <AlertCircle
                    size={17}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 7,
                    }}
                  />
                  The detail endpoint returned no answer records in the
                  expected response fields. If the student's answers are
                  stored in a separate database table, the backend detail
                  endpoint must include them.
                </div>
              )}

              <div style={{ ...styles.row, marginTop: 20 }}>
                <button
                  type="button"
                  style={styles.button}
                  onClick={() => openSubmission(selectedSubmission)}
                  disabled={loadingDetails}
                >
                  <RefreshCw size={15} />
                  Reload submission
                </button>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() =>
                    navigate(
                      `/academy/tutor/assignments/` +
                        `${encodeURIComponent(selectedAssignmentId)}` +
                        `/submissions/` +
                        `${encodeURIComponent(
                          getSubmissionId(selectedSubmission)
                        )}`
                    )
                  }
                  disabled={
                    !selectedAssignmentId ||
                    !getSubmissionId(selectedSubmission)
                  }
                >
                  <CheckCircle2 size={16} />
                  Grade this submission
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}