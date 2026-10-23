
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Upload,
  X,
  Pencil,
  Video,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TOKEN_KEYS = [
  "scholiqen_academy_token",
  "scholiqen_auth_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

const STUDENT_KEYS = [
  "scholiqen_academy_student",
  "scholiqen_academy_user",
  "academy_student",
  "academyStudent",
  "student",
  "currentStudent",
  "current_student",
  "studentUser",
  "student_user",
  "loggedInStudent",
  "logged_in_student",
];

const MAX_FILE_SIZE = 250 * 1024 * 1024;

const ACCEPTED_FILES =
  ".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.mp4,.webm,.mov,.m4v";

const clean = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

function readJson(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getToken() {
  for (const key of TOKEN_KEYS) {
    const value = clean(localStorage.getItem(key));
    if (value) return value;
  }
  return "";
}

function getStudentIdentity() {
  const objects = STUDENT_KEYS.map(readJson).filter(Boolean);
  const flat = {};

  for (const item of objects) {
    if (item && typeof item === "object") {
      Object.assign(flat, item);
    }
  }

  const pick = (...values) => values.map(clean).find(Boolean) || "";

  const studentReference = pick(
    flat.studentReference,
    flat.student_reference,
    flat.studentRef,
    flat.student_ref,
    flat.reference,
    flat.studentNumber,
    flat.student_number,
    localStorage.getItem("studentReference"),
    localStorage.getItem("student_reference")
  );

  const studentId = pick(
    flat.studentId,
    flat.student_id,
    flat.id,
    flat.userId,
    flat.user_id
  );

  const enrollmentId = pick(
    flat.enrollmentId,
    flat.enrollment_id,
    flat.studentEnrollmentId,
    flat.student_enrollment_id,
    localStorage.getItem("enrollmentId"),
    localStorage.getItem("enrollment_id")
  );

  const studentName =
    pick(
      flat.studentName,
      flat.student_name,
      flat.fullName,
      flat.full_name,
      flat.name,
      [flat.firstName, flat.lastName].filter(Boolean).join(" ")
    ) || "Student";

  return {
    studentReference,
    studentId,
    enrollmentId,
    studentName,
  };
}

function authHeaders(json = false) {
  const token = getToken();
  const headers = { Accept: "application/json" };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = /^Bearer\s/i.test(token)
      ? token
      : `Bearer ${token}`;
  }

  return headers;
}

function getPayload(data) {
  return (
    data?.assignment ||
    data?.data?.assignment ||
    data?.data ||
    data?.result?.assignment ||
    data?.result ||
    data?.activity ||
    data?.task ||
    data
  );
}

function getQuestions(data) {
  const candidates = [
    data?.questions,
    data?.assignment?.questions,
    data?.data?.questions,
    data?.data?.assignment?.questions,
    data?.activity?.questions,
  ];

  return candidates.find(Array.isArray) || [];
}

function getExistingSubmission(data) {
  const candidates = [
    data?.submission,
    data?.savedSubmission,
    data?.data?.submission,
    data?.data?.savedSubmission,
    data?.result?.submission,
    data?.existingSubmission,
  ];

  return (
    candidates.find(
      (item) => item && typeof item === "object"
    ) || null
  );
}

function getAssignmentFile(assignment) {
  const file =
    assignment?.file ||
    assignment?.document ||
    assignment?.attachment ||
    {};

  const url = clean(
    file.url ||
      file.fileUrl ||
      file.file_url ||
      file.filePath ||
      file.file_path ||
      assignment?.fileUrl ||
      assignment?.file_url ||
      assignment?.filePath ||
      assignment?.file_path ||
      assignment?.documentUrl ||
      assignment?.document_url ||
      assignment?.attachmentUrl ||
      assignment?.attachment_url
  );

  const name = clean(
    file.name ||
      file.fileName ||
      file.file_name ||
      assignment?.fileName ||
      assignment?.file_name ||
      assignment?.documentName ||
      assignment?.document_name
  );

  const type = clean(
    file.type ||
      file.mimeType ||
      file.mime_type ||
      assignment?.fileType ||
      assignment?.file_type
  );

  return { url, name, type };
}

function getSubmissionFile(submission) {
  const file =
    submission?.file ||
    submission?.attachment ||
    submission?.document ||
    {};

  const url = clean(
    file.url ||
      file.fileUrl ||
      file.file_url ||
      file.filePath ||
      file.file_path ||
      submission?.submissionFileUrl ||
      submission?.submission_file_url ||
      submission?.fileUrl ||
      submission?.file_url ||
      submission?.filePath ||
      submission?.file_path ||
      submission?.attachmentUrl ||
      submission?.attachment_url ||
      submission?.documentUrl ||
      submission?.document_url ||
      submission?.url
  );

  const name = clean(
    file.name ||
      file.fileName ||
      file.file_name ||
      submission?.fileName ||
      submission?.file_name ||
      submission?.attachmentName ||
      submission?.attachment_name ||
      submission?.originalName ||
      submission?.original_name ||
      submission?.filename
  );

  const type = clean(
    file.type ||
      file.mimeType ||
      file.mime_type ||
      submission?.mimeType ||
      submission?.mime_type ||
      submission?.fileType ||
      submission?.file_type ||
      submission?.contentType ||
      submission?.content_type
  );

  return { url, name, type };
}

function resolveUrl(value) {
  if (!value) return "";

  if (/^(https?:|blob:|data:)/i.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `${window.location.protocol}${value}`;
  }

  return value.startsWith("/")
    ? `${API_URL}${value}`
    : `${API_URL}/${value}`;
}

function formatSize(bytes) {
  if (!Number.isFinite(Number(bytes))) return "";

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function parseResponseText(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "The server returned an invalid response.",
    };
  }
}

function isVideoFile(name = "", type = "") {
  return (
    /^video\//i.test(type) ||
    /\.(mp4|webm|mov|m4v|ogv)$/i.test(name)
  );
}

function isImageFile(name = "", type = "") {
  return (
    /^image\//i.test(type) ||
    /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name)
  );
}

function isPdfFile(name = "", type = "") {
  return (
    type.toLowerCase().includes("pdf") ||
    /\.pdf$/i.test(name)
  );
}

function FilePreview({ url, name, type, localFile }) {
  const previewUrl = useMemo(() => {
    if (localFile) {
      return URL.createObjectURL(localFile);
    }

    return resolveUrl(url);
  }, [localFile, url]);

  useEffect(() => {
    if (!localFile || !previewUrl) return undefined;

    return () => URL.revokeObjectURL(previewUrl);
  }, [localFile, previewUrl]);

  if (!previewUrl) return null;

  if (isVideoFile(name, type)) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          key={previewUrl}
          src={previewUrl}
          controls
          playsInline
          preload="metadata"
          className="max-h-[480px] w-full bg-black"
        >
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  if (isImageFile(name, type)) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <img
          src={previewUrl}
          alt={name || "Submission preview"}
          className="max-h-[480px] w-full object-contain"
        />
      </div>
    );
  }

  if (isPdfFile(name, type)) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
        <iframe
          title={name || "PDF submission preview"}
          src={previewUrl}
          className="h-[480px] w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <FileText className="shrink-0 text-cyan-300" size={24} />
      <div className="min-w-0">
        <p className="truncate font-medium">
          {name || "Submitted file"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Preview is not available for this file type. Use Open or Download.
        </p>
      </div>
    </div>
  );
}

export default function StudentAssignmentDetails() {
  const { assignmentId: routeAssignmentId, id: routeId } = useParams();
  const assignmentId = routeAssignmentId || routeId;

  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [assignment, setAssignment] = useState(
    location.state?.assignment || location.state?.activity || null
  );

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [savedSubmission, setSavedSubmission] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isReplacingSubmission, setIsReplacingSubmission] = useState(false);
  const [identity, setIdentity] = useState(getStudentIdentity);

  // Used to show the replacement immediately if the server does not return
  // a usable file URL in its success response.
  const [localSubmittedFile, setLocalSubmittedFile] = useState(null);

  const file = useMemo(
    () => getAssignmentFile(assignment),
    [assignment]
  );

  const submittedFile = useMemo(
    () => getSubmissionFile(savedSubmission),
    [savedSubmission]
  );

  const isQuestionAssignment = questions.length > 0;
  const dueAt =
    assignment?.dueAt ||
    assignment?.due_at ||
    assignment?.dueDate ||
    assignment?.due_date;

  const assignmentTitle =
    assignment?.title ||
    assignment?.name ||
    assignment?.assignmentTitle ||
    "Assignment";

  const assignmentDescription =
    assignment?.description ||
    assignment?.instructions ||
    assignment?.details ||
    "";

  const displayedSubmissionName =
    submittedFile.name ||
    localSubmittedFile?.name ||
    selectedFile?.name ||
    "Submitted assignment";

  const displayedSubmissionUrl =
    submittedFile.url || localSubmittedFile?.url || "";

  const displayedSubmissionType =
    submittedFile.type || localSubmittedFile?.type || "";

  const loadAssignment = useCallback(async () => {
    if (!assignmentId) {
      setLoading(false);
      setError("Assignment ID is missing from the page URL.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
          assignmentId
        )}`,
        {
          headers: authHeaders(),
          credentials: "include",
        }
      );

      const raw = await response.text();
      const data = parseResponseText(raw);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to load assignment (${response.status}).`
        );
      }

      const payload = getPayload(data);
      const merged = {
        ...(location.state?.assignment || {}),
        ...(payload || {}),
      };

      setAssignment(merged);

      const loadedQuestions = getQuestions(data);
      setQuestions(
        loadedQuestions.length
          ? loadedQuestions
          : getQuestions(merged)
      );

      const existing = getExistingSubmission(data);

      if (existing) {
        setSavedSubmission(existing);

        const status = clean(existing.status).toLowerCase();

        if (
          [
            "submitted",
            "reviewed",
            "graded",
            "completed",
            "returned",
          ].includes(status) ||
          existing.id
        ) {
          setSubmitted(true);
        }
      }

      const priorAnswers =
        data?.answers ||
        data?.data?.answers ||
        existing?.answers ||
        [];

      if (Array.isArray(priorAnswers)) {
        const mapped = {};

        priorAnswers.forEach((row) => {
          const qid =
            row.question_id ??
            row.questionId ??
            row.question?.id;

          const answer =
            row.student_answer ??
            row.studentAnswer ??
            row.answer ??
            row.selected_answer ??
            "";

          if (qid !== undefined && qid !== null) {
            mapped[String(qid)] = answer;
          }
        });

        if (Object.keys(mapped).length) {
          setAnswers(mapped);
        }
      }
    } catch (err) {
      console.error("StudentAssignmentDetails load error:", err);

      if (location.state?.assignment || location.state?.activity) {
        const fallback =
          location.state.assignment || location.state.activity;

        setAssignment(fallback);
        setQuestions(getQuestions(fallback));
      } else {
        setError(err?.message || "Unable to load this assignment.");
      }
    } finally {
      setLoading(false);
    }
  }, [assignmentId, location.state]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  useEffect(() => {
    setIdentity(getStudentIdentity());
  }, []);

  // Release the temporary preview URL when it is replaced or the page closes.
  useEffect(() => {
    return () => {
      if (localSubmittedFile?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(localSubmittedFile.url);
      }
    };
  }, [localSubmittedFile]);

  const handleFileChange = (event) => {
    const picked = event.target.files?.[0] || null;

    setFileError("");
    setSubmitError("");

    if (!picked) {
      setSelectedFile(null);
      return;
    }

    if (picked.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError(
        "The file is too large. Maximum upload size is 250 MB."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(picked);
  };

  const startReplacement = () => {
    setIsReplacingSubmission(true);
    setSelectedFile(null);
    setFileError("");
    setSubmitError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelReplacement = () => {
    if (submitting) return;

    setIsReplacingSubmission(false);
    setSelectedFile(null);
    setFileError("");
    setSubmitError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateIdentity = () => {
    const current = getStudentIdentity();
    setIdentity(current);

    if (
      !current.enrollmentId &&
      !current.studentReference &&
      !current.studentId
    ) {
      throw new Error(
        "Your student enrollment information could not be found. Please log out and log in again."
      );
    }

    return current;
  };

  const handleSubmit = async () => {
    if (!assignment?.id && !assignmentId) {
      setSubmitError("This assignment does not have a valid ID.");
      return;
    }

    // A submitted assignment can only be sent again when the student
    // explicitly enters replacement mode.
    if (submitted && !isReplacingSubmission) return;

    setSubmitError("");
    setFileError("");

    if (isQuestionAssignment) {
      const missing = questions.filter((question, index) => {
        const qid = String(
          question.id ??
            question.questionId ??
            question.question_id ??
            index
        );

        return !clean(answers[qid]);
      });

      if (missing.length) {
        setSubmitError(
          `Please answer all questions. ${missing.length} remaining.`
        );
        return;
      }
    } else if (!selectedFile) {
      setFileError(
        isReplacingSubmission
          ? "Choose the new video or document you want to submit."
          : "Please attach your completed assignment before submitting."
      );

      setSubmitError(
        isReplacingSubmission
          ? "Please select a replacement file first."
          : "Please select the file you want your tutor to review."
      );

      return;
    }

    let student;

    try {
      student = validateIdentity();
    } catch (err) {
      setSubmitError(err.message);
      return;
    }

    const id = assignment?.id ?? assignmentId;
    setSubmitting(true);

    try {
      let response;

      if (isQuestionAssignment) {
        const answerList = questions.map((question, index) => {
          const qid = String(
            question.id ??
              question.questionId ??
              question.question_id ??
              index
          );

          const questionId =
            question.id ??
            question.questionId ??
            question.question_id ??
            qid;

          return {
            questionId,
            question_id: questionId,
            answer: answers[qid],
            studentAnswer: answers[qid],
            student_answer: answers[qid],
          };
        });

        const payload = {
          assignmentId: id,
          assignment_id: id,
          enrollmentId: student.enrollmentId,
          enrollment_id: student.enrollmentId,
          studentReference: student.studentReference,
          student_reference: student.studentReference,
          reference: student.studentReference,
          studentId: student.studentId,
          student_id: student.studentId,
          studentName: student.studentName,
          student_name: student.studentName,
          submissionType: "questions",
          submission_type: "questions",
          activityType: "assignment",
          activity_type: "assignment",
          answers,
          responses: answers,
          answerList,
        };

        response = await fetch(
          `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
            id
          )}/submit`,
          {
            method: "POST",
            headers: authHeaders(true),
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
      } else {
        const form = new FormData();

        const fields = {
          assignmentId: id,
          assignment_id: id,
          enrollmentId: student.enrollmentId,
          enrollment_id: student.enrollmentId,
          studentReference: student.studentReference,
          student_reference: student.studentReference,
          reference: student.studentReference,
          studentId: student.studentId,
          student_id: student.studentId,
          studentName: student.studentName,
          student_name: student.studentName,
          submissionType: "document",
          submission_type: "document",
          activityType: "assignment",
          activity_type: "assignment",
          attachmentName: selectedFile.name,
          fileName: selectedFile.name,
          file_name: selectedFile.name,
          replaceSubmission: isReplacingSubmission ? "true" : "false",
          replace_submission: isReplacingSubmission ? "true" : "false",
        };

        // Send the existing submission ID when available so the server
        // can update the correct submission rather than create a duplicate.
        const existingSubmissionId =
          savedSubmission?.id ??
          savedSubmission?.submissionId ??
          savedSubmission?.submission_id;

        if (existingSubmissionId) {
          fields.submissionId = existingSubmissionId;
          fields.submission_id = existingSubmissionId;
        }

        Object.entries(fields).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
          ) {
            form.append(key, String(value));
          }
        });

        // The backend Multer upload field must be named "file".
        form.append("file", selectedFile, selectedFile.name);

        response = await fetch(
          `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
            id
          )}/submit`,
          {
            method: "POST",
            headers: authHeaders(false),
            credentials: "include",
            body: form,
          }
        );
      }

      const data = parseResponseText(await response.text());

      if (response.status === 409) {
        const existing = getExistingSubmission(data);

        if (existing && !isReplacingSubmission) {
          setSavedSubmission(existing);
          setSubmitted(true);
          return;
        }

        if (isReplacingSubmission) {
          throw new Error(
            data?.message ||
              "The server rejected the replacement. Your backend must allow replacing an existing submission."
          );
        }
      }

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Submission failed (${response.status}).`
        );
      }

      const responseSubmission = getExistingSubmission(data);
      const responseData = data?.data || data?.result || {};

      const saved = {
        ...(savedSubmission || {}),
        ...(responseData && typeof responseData === "object"
          ? responseData
          : {}),
        ...(responseSubmission || {}),
        id:
          responseSubmission?.id ??
          responseData?.submissionId ??
          responseData?.submission_id ??
          savedSubmission?.id ??
          data?.submissionId ??
          data?.submission_id ??
          null,
        status:
          responseSubmission?.status ||
          responseData?.status ||
          "submitted",
        submittedAt:
          responseSubmission?.submittedAt ||
          responseSubmission?.submitted_at ||
          responseData?.submittedAt ||
          responseData?.submitted_at ||
          new Date().toISOString(),
        fileName: selectedFile?.name || submittedFile.name,
        file_name: selectedFile?.name || submittedFile.name,
        fileType: selectedFile?.type || submittedFile.type,
        file_type: selectedFile?.type || submittedFile.type,
      };

      const returnedFile = getSubmissionFile(saved);

      // Keep a local video/document preview available immediately after
      // success when the server response doesn't include a file URL.
      let temporaryPreview = null;

      if (selectedFile && !returnedFile.url) {
        temporaryPreview = {
          url: URL.createObjectURL(selectedFile),
          name: selectedFile.name,
          type: selectedFile.type,
        };
      }

      setSavedSubmission(saved);
      setLocalSubmittedFile(temporaryPreview);
      setSubmitted(true);
      setIsReplacingSubmission(false);

      setAssignment((previous) =>
        previous ? { ...previous, status: "submitted" } : previous
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Assignment submission error:", err);
      setSubmitError(
        err?.message || "Unable to submit your assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openFile = async (urlValue, filename, download = false) => {
    const url = resolveUrl(urlValue);

    if (!url) {
      setSubmitError("The file URL is not available.");
      return;
    }

    try {
      const response = await fetch(url, {
        headers: authHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to open this file.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (download) {
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename || "assignment-file";

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      } else {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      }
    } catch (err) {
      // Direct URLs can still be opened if the server doesn't expose
      // the file through an authenticated fetch.
      if (!download && /^https?:/i.test(url)) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setSubmitError(
          err?.message || "Unable to open this file."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={34} className="animate-spin text-cyan-400" />
          <p className="text-slate-400">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/academy/student/assignments")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"
          >
            <ArrowLeft size={18} />
            Back to Assignments
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 flex gap-3">
            <AlertCircle className="text-red-400 shrink-0" />
            <div>
              <h2 className="font-semibold text-red-200">
                Unable to load assignment
              </h2>
              <p className="text-sm text-red-100/80 mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/academy/student/assignments")}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to Assignments
        </button>

        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#10213a] to-[#081120] p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300 font-semibold mb-3">
                Scholiqen Academy · Student Assignment
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold">
                {assignmentTitle}
              </h1>

              {assignmentDescription && (
                <p className="text-slate-300 mt-3 leading-relaxed whitespace-pre-wrap">
                  {assignmentDescription}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5 text-sm text-slate-300">
                {(assignment?.grade ||
                  assignment?.className ||
                  assignment?.class_name) && (
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    {assignment.grade ||
                      assignment.className ||
                      assignment.class_name}
                  </span>
                )}

                {assignment?.subject && (
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    {assignment.subject}
                  </span>
                )}

                {dueAt && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    <Clock3 size={14} />
                    Due {new Date(dueAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                submitted
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-200"
              }`}
            >
              {submitted ? (
                <CheckCircle2 size={16} />
              ) : (
                <Clock3 size={16} />
              )}
              {submitted ? "Submitted" : "Awaiting submission"}
            </div>
          </div>
        </motion.header>

        {/* SUCCESS SCREEN */}
        {submitted && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
                <CheckCircle2 className="text-emerald-300" size={25} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-emerald-200">
                  Assignment submitted successfully
                </h2>

                <p className="text-slate-300 mt-2">
                  Your submission has been saved. You can review the uploaded
                  file below or replace it if you need to submit an updated
                  version.
                </p>

                {/* CURRENT SUBMISSION PREVIEW */}
                {!isQuestionAssignment && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-[#081120] p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                        {isVideoFile(
                          displayedSubmissionName,
                          displayedSubmissionType
                        ) ? (
                          <Video className="text-cyan-300" size={22} />
                        ) : (
                          <FileText className="text-cyan-300" size={22} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {displayedSubmissionName}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Your currently submitted file
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {displayedSubmissionUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openFile(
                                  displayedSubmissionUrl,
                                  displayedSubmissionName,
                                  false
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                            >
                              <ExternalLink size={15} />
                              Open
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openFile(
                                  displayedSubmissionUrl,
                                  displayedSubmissionName,
                                  true
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                            >
                              <Download size={15} />
                              Download
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {displayedSubmissionUrl && (
                      <FilePreview
                        url={displayedSubmissionUrl}
                        name={displayedSubmissionName}
                        type={displayedSubmissionType}
                      />
                    )}

                    {!displayedSubmissionUrl && (
                      <p className="text-sm text-slate-400">
                        The submission was saved, but the server did not
                        return a preview URL. You can still replace the file
                        below.
                      </p>
                    )}
                  </div>
                )}

                {/* EDIT & REVIEW / REPLACEMENT EDITOR */}
                {!isQuestionAssignment && !isReplacingSubmission && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={startReplacement}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition"
                    >
                      <Pencil size={17} />
                      Edit &amp; Review
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/academy/student/assignments")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10 transition"
                    >
                      <ArrowLeft size={17} />
                      Return to Assignments
                    </button>
                  </div>
                )}

                {isReplacingSubmission && (
                  <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                        <RotateCcw className="text-cyan-300" size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-cyan-100">
                          Replace your submission
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Choose a new video or document. Your current
                          submission will remain visible until the replacement
                          has been accepted by the server.
                        </p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_FILES}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!selectedFile ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-5 w-full rounded-2xl border border-dashed border-cyan-400/30 bg-white/[0.02] p-7 text-center hover:border-cyan-400/60 hover:bg-cyan-400/[0.03] transition"
                      >
                        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
                          <Upload size={23} className="text-cyan-300" />
                        </div>

                        <p className="font-semibold">
                          Choose replacement video or document
                        </p>

                        <p className="text-sm text-slate-400 mt-2">
                          MP4, WebM, MOV, PDF, Word, PowerPoint, Excel, TXT,
                          images or ZIP
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Maximum file size: 250 MB
                        </p>

                        <span className="inline-flex items-center gap-2 mt-4 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
                          <Paperclip size={16} />
                          Browse files
                        </span>
                      </button>
                    ) : (
                      <div className="mt-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-cyan-400/20 bg-black/20 p-4">
                          {isVideoFile(
                            selectedFile.name,
                            selectedFile.type
                          ) ? (
                            <Video
                              size={25}
                              className="shrink-0 text-cyan-300"
                            />
                          ) : (
                            <FileText
                              size={25}
                              className="shrink-0 text-cyan-300"
                            />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatSize(selectedFile.size)} · Replacement
                              selected
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() =>
                                fileInputRef.current?.click()
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
                            >
                              <RotateCcw size={15} />
                              Change
                            </button>

                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => {
                                setSelectedFile(null);
                                setFileError("");

                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
                            >
                              <X size={15} />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-300 mb-3">
                            Preview replacement
                          </p>

                          <FilePreview
                            localFile={selectedFile}
                            name={selectedFile.name}
                            type={selectedFile.type}
                          />
                        </div>
                      </div>
                    )}

                    {fileError && (
                      <p className="flex items-center gap-2 text-sm text-red-300 mt-4">
                        <AlertCircle size={16} />
                        {fileError}
                      </p>
                    )}

                    {submitError && (
                      <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 flex gap-2 text-sm text-red-200">
                        <AlertCircle size={17} className="shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedFile}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                        {submitting
                          ? "Replacing submission..."
                          : "Submit Replacement"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelReplacement}
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10 disabled:opacity-50"
                      >
                        <X size={17} />
                        Cancel
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-4">
                      Your replacement will only be shown as submitted after
                      the server accepts it.
                    </p>
                  </div>
                )}

                {isQuestionAssignment && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/academy/student/assignments")
                    }
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                  >
                    <ArrowLeft size={17} />
                    Return to Assignments
                  </button>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* ORIGINAL ASSIGNMENT / FIRST SUBMISSION FORM */}
        {!submitted && (
          <>
            {file.url && (
              <section className="rounded-3xl border border-white/10 bg-[#0a1425] p-5 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <FileText className="text-cyan-300" size={23} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold">Assignment document</h2>
                    <p className="text-sm text-slate-400 mt-1 truncate">
                      {file.name || "Attached assignment material"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openFile(file.url, file.name, false)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10"
                    >
                      <ExternalLink size={16} />
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() => openFile(file.url, file.name, true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </section>
            )}

            {isQuestionAssignment && (
              <section className="rounded-3xl border border-white/10 bg-[#0a1425] p-5 sm:p-7 mb-6">
                <h2 className="text-xl font-semibold mb-6">
                  Answer the questions
                </h2>

                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const qid = String(
                      question.id ??
                        question.questionId ??
                        question.question_id ??
                        index
                    );

                    const prompt =
                      question.question ||
                      question.questionText ||
                      question.question_text ||
                      question.text ||
                      `Question ${index + 1}`;

                    const options = [
                      [
                        "A",
                        question.optionA ??
                          question.option_a ??
                          question.options?.A,
                      ],
                      [
                        "B",
                        question.optionB ??
                          question.option_b ??
                          question.options?.B,
                      ],
                      [
                        "C",
                        question.optionC ??
                          question.option_c ??
                          question.options?.C,
                      ],
                      [
                        "D",
                        question.optionD ??
                          question.option_d ??
                          question.options?.D,
                      ],
                    ].filter(
                      ([, value]) =>
                        value !== undefined &&
                        value !== null &&
                        clean(value)
                    );

                    return (
                      <div
                        key={qid}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
                      >
                        <p className="font-medium leading-relaxed">
                          <span className="text-cyan-300 mr-2">
                            {index + 1}.
                          </span>
                          {prompt}
                        </p>

                        {options.length ? (
                          <div className="grid sm:grid-cols-2 gap-3 mt-4">
                            {options.map(([letter, label]) => (
                              <label
                                key={letter}
                                className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                                  answers[qid] === letter
                                    ? "border-cyan-400/50 bg-cyan-400/10"
                                    : "border-white/10 hover:bg-white/[0.04]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${qid}`}
                                  value={letter}
                                  checked={answers[qid] === letter}
                                  onChange={() =>
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [qid]: letter,
                                    }))
                                  }
                                  className="mt-1 accent-cyan-400"
                                />

                                <span className="text-sm text-slate-200">
                                  <b className="text-cyan-300 mr-2">
                                    {letter}.
                                  </b>
                                  {label}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={answers[qid] || ""}
                            onChange={(event) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [qid]: event.target.value,
                              }))
                            }
                            rows={3}
                            placeholder="Type your answer..."
                            className="mt-4 w-full rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {!isQuestionAssignment && (
              <section className="rounded-3xl border border-white/10 bg-[#0a1425] overflow-hidden mb-6">
                <div className="p-5 sm:p-6 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl border border-emerald-400/20 bg-emerald-400/10 flex items-center justify-center">
                      <Upload size={22} className="text-emerald-300" />
                    </div>

                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Submit your completed work
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Attach your document or video so your tutor can review
                        the actual file.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILES}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                        {isVideoFile(
                          selectedFile.name,
                          selectedFile.type
                        ) ? (
                          <Video
                            size={26}
                            className="text-emerald-300 shrink-0"
                          />
                        ) : (
                          <FileText
                            size={26}
                            className="text-emerald-300 shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatSize(selectedFile.size)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);

                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
                        >
                          <X size={16} />
                          Remove
                        </button>
                      </div>

                      <FilePreview
                        localFile={selectedFile}
                        name={selectedFile.name}
                        type={selectedFile.type}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center hover:border-cyan-400/50 hover:bg-cyan-400/[0.03] transition"
                    >
                      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
                        <Paperclip
                          size={25}
                          className="text-cyan-300"
                        />
                      </div>

                      <p className="font-semibold">
                        Choose your submission file
                      </p>

                      <p className="text-sm text-slate-400 mt-2">
                        PDF, Word, PowerPoint, Excel, TXT, images, ZIP or
                        videos · Maximum 250 MB
                      </p>

                      <span className="inline-flex items-center gap-2 mt-5 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950">
                        <Upload size={16} />
                        Browse files
                      </span>
                    </button>
                  )}

                  {fileError && (
                    <p className="flex items-center gap-2 text-sm text-red-300 mt-4">
                      <AlertCircle size={16} />
                      {fileError}
                    </p>
                  )}
                </div>
              </section>
            )}

            {submitError && (
              <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 flex gap-3 text-sm text-red-200">
                <AlertCircle size={18} className="shrink-0" />
                {submitError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <p className="text-sm text-slate-400">
                After submission, your tutor can review your work from Tutor
                Assignment Submissions.
              </p>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}

                {submitting ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
