import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENT_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

/* =========================================================
   STORAGE
========================================================= */

const getStoredTutor = () => {
  const keys = [
    "scholiqen_academy_user",
    "academy_user",
    "scholiqen_user",
    "user",
  ];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        continue;
      }

      const parsed = JSON.parse(value);

      if (parsed) {
        return parsed;
      }
    } catch {
      // Ignore invalid localStorage values.
    }
  }

  return null;
};

const getTutorReference = () => {
  const user = getStoredTutor();

  return (
    user?.reference ||
    user?.tutorReference ||
    user?.tutor_reference ||
    user?.tutor?.reference ||
    user?.tutor?.tutorReference ||
    user?.tutor?.tutor_reference ||
    user?.user?.reference ||
    ""
  );
};

/* =========================================================
   ASSIGNMENT HELPERS
========================================================= */

const getAssignmentId = (assignment) => {
  return (
    assignment?.id ??
    assignment?.assignment_id ??
    assignment?.assignmentId ??
    assignment?.ID ??
    ""
  );
};

const getAssignmentTitle = (assignment) => {
  return (
    assignment?.title ||
    assignment?.name ||
    "Untitled Assignment"
  );
};

const getAssignmentSubject = (assignment) => {
  return (
    assignment?.subject ||
    assignment?.course_subject ||
    ""
  );
};

const getAssignmentGrade = (assignment) => {
  return (
    assignment?.grade ||
    assignment?.class ||
    assignment?.school_class ||
    ""
  );
};

const getAssignmentsFromResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.assignments)) {
    return data.assignments;
  }

  if (Array.isArray(data?.data?.assignments)) {
    return data.data.assignments;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

/* =========================================================
   SUBMISSION HELPERS
========================================================= */

const getStudentName = (submission) => {
  return (
    submission?.student_name ||
    submission?.studentName ||
    submission?.name ||
    submission?.student?.name ||
    submission?.student?.full_name ||
    submission?.student?.fullName ||
    submission?.student_reference ||
    submission?.studentReference ||
    submission?.student_id ||
    submission?.studentId ||
    "Student"
  );
};

const getStudentReference = (submission) => {
  return (
    submission?.student_reference ||
    submission?.studentReference ||
    submission?.student?.reference ||
    submission?.student_id ||
    submission?.studentId ||
    "N/A"
  );
};

const getSubmissionId = (submission) => {
  return (
    submission?.id ||
    submission?.submission_id ||
    submission?.submissionId
  );
};

const getAnswers = (submission) => {
  if (Array.isArray(submission?.answers)) {
    return submission.answers;
  }

  if (Array.isArray(submission?.answer_details)) {
    return submission.answer_details;
  }

  if (Array.isArray(submission?.answerDetails)) {
    return submission.answerDetails;
  }

  return [];
};

const getQuestionText = (answer) => {
  return (
    answer?.question ||
    answer?.question_text ||
    answer?.questionText ||
    answer?.question_title ||
    answer?.questionTitle ||
    answer?.question?.question ||
    `Question ${
      answer?.question_number ||
      answer?.questionNumber ||
      ""
    }`
  );
};

const getStudentAnswer = (answer) => {
  const value =
    answer?.student_answer ??
    answer?.studentAnswer ??
    answer?.answer ??
    answer?.selected_answer ??
    answer?.selectedAnswer;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "No answer";
  }

  return String(value);
};

const getCorrectAnswer = (answer) => {
  const value =
    answer?.correct_answer ??
    answer?.correctAnswer ??
    answer?.question?.correct_answer ??
    answer?.question?.correctAnswer;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not available";
  }

  return String(value);
};

const getReason = (answer) => {
  return (
    answer?.reason ||
    answer?.explanation ||
    answer?.question?.reason ||
    answer?.question?.explanation ||
    ""
  );
};

const getQuestionNumber = (answer, index) => {
  return (
    answer?.question_number ||
    answer?.questionNumber ||
    answer?.number ||
    answer?.question?.question_number ||
    index + 1
  );
};

const isAnswerCorrect = (answer) => {
  if (typeof answer?.is_correct === "boolean") {
    return answer.is_correct;
  }

  if (typeof answer?.isCorrect === "boolean") {
    return answer.isCorrect;
  }

  const student = getStudentAnswer(answer)
    .trim()
    .toUpperCase();

  const correct = getCorrectAnswer(answer)
    .trim()
    .toUpperCase();

  return (
    student !== "NO ANSWER" &&
    correct !== "NOT AVAILABLE" &&
    student === correct
  );
};

const getMarksAwarded = (answer) => {
  const value =
    answer?.marks_awarded ??
    answer?.marksAwarded ??
    answer?.awarded_marks ??
    answer?.awardedMarks ??
    0;

  return Number(value) || 0;
};

const getMaxMarks = (answer) => {
  const value =
    answer?.marks ??
    answer?.max_marks ??
    answer?.maxMarks ??
    answer?.question?.marks ??
    1;

  return Number(value) || 1;
};

/* =========================================================
   RESULT HELPERS
========================================================= */

const getPercentage = (submission) => {
  const value =
    submission?.percentage ??
    submission?.percent ??
    submission?.score_percentage ??
    submission?.scorePercentage;

  if (
    value !== undefined &&
    value !== null &&
    value !== ""
  ) {
    return Number(value) || 0;
  }

  const score = Number(submission?.score) || 0;

  const total =
    Number(submission?.total_marks) ||
    Number(submission?.totalMarks) ||
    0;

  if (!total) {
    return 0;
  }

  return (score / total) * 100;
};

const getGrade = (submission) => {
  if (submission?.grade) {
    return String(submission.grade).toUpperCase();
  }

  const percentage = getPercentage(submission);

  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 45) return "D";
  if (percentage >= 40) return "E";

  return "F";
};

const getScore = (submission) => {
  const score =
    submission?.score ??
    submission?.marks_awarded ??
    submission?.marksAwarded ??
    0;

  const total =
    submission?.total_marks ??
    submission?.totalMarks ??
    0;

  return {
    score: Number(score) || 0,
    total: Number(total) || 0,
  };
};

const getReleaseState = (submission) => {
  return (
    submission?.result_released === true ||
    submission?.resultReleased === true ||
    submission?.released === true
  );
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (value) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const getAssignmentFromResponse = (data) => {
  return (
    data?.assignment ||
    data?.data?.assignment ||
    data?.result?.assignment ||
    null
  );
};

const getSubmissionsFromResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.submissions)) {
    return data.submissions;
  }

  if (Array.isArray(data?.data?.submissions)) {
    return data.data.submissions;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorAssignmentSubmissions() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);

  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState("");

  const [assignment, setAssignment] =
    useState(null);

  const [submissions, setSubmissions] =
    useState([]);

  const [loadingAssignments, setLoadingAssignments] =
    useState(true);

  const [loadingSubmissions, setLoadingSubmissions] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    expandedSubmission,
    setExpandedSubmission,
  ] = useState(null);

  const [
    releasingSubmission,
    setReleasingSubmission,
  ] = useState(null);

  const tutorReference = useMemo(
    () => getTutorReference(),
    []
  );

  /* =======================================================
     LOAD ALL ASSIGNMENTS
  ======================================================= */

  const loadAssignments = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoadingAssignments(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const query = tutorReference
          ? `?reference=${encodeURIComponent(
              tutorReference
            )}`
          : "";

        const response = await fetch(
          `${ASSIGNMENT_URL}${query}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to load assignments (${response.status}).`
          );
        }

        const list =
          getAssignmentsFromResponse(data);

        setAssignments(list);

        if (list.length > 0) {
          setSelectedAssignmentId((current) => {
            if (current) {
              const stillExists = list.some(
                (item) =>
                  String(getAssignmentId(item)) ===
                  String(current)
              );

              if (stillExists) {
                return current;
              }
            }

            const firstId =
              getAssignmentId(list[0]);

            return firstId
              ? String(firstId)
              : "";
          });
        } else {
          setSelectedAssignmentId("");
          setAssignment(null);
          setSubmissions([]);
        }
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load your assignments."
        );
      } finally {
        setLoadingAssignments(false);
        setRefreshing(false);
      }
    },
    [tutorReference]
  );

  /* =======================================================
     LOAD SUBMISSIONS
  ======================================================= */

  const loadSubmissions = useCallback(
    async (assignmentId, showLoader = true) => {
      if (!assignmentId) {
        setSubmissions([]);
        setAssignment(null);
        return;
      }

      if (showLoader) {
        setLoadingSubmissions(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const query = tutorReference
          ? `?reference=${encodeURIComponent(
              tutorReference
            )}`
          : "";

        const response = await fetch(
          `${ASSIGNMENT_URL}/${encodeURIComponent(
            assignmentId
          )}/submissions${query}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to load submissions (${response.status}).`
          );
        }

        const list =
          getSubmissionsFromResponse(data);

        setSubmissions(list);

        const foundAssignment =
          getAssignmentFromResponse(data);

        if (foundAssignment) {
          setAssignment(foundAssignment);
        } else {
          const localAssignment =
            assignments.find(
              (item) =>
                String(getAssignmentId(item)) ===
                String(assignmentId)
            );

          if (localAssignment) {
            setAssignment(localAssignment);
          }
        }
      } catch (err) {
        setSubmissions([]);

        setError(
          err?.message ||
            "Unable to load assignment submissions."
        );
      } finally {
        setLoadingSubmissions(false);
        setRefreshing(false);
      }
    },
    [assignments, tutorReference]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadAssignments(true);
  }, [loadAssignments]);

  /* =======================================================
     LOAD SELECTED ASSIGNMENT
  ======================================================= */

  useEffect(() => {
    if (!selectedAssignmentId) {
      return;
    }

    const selected =
      assignments.find(
        (item) =>
          String(getAssignmentId(item)) ===
          String(selectedAssignmentId)
      );

    if (selected) {
      setAssignment(selected);
    }

    setExpandedSubmission(null);

    loadSubmissions(
      selectedAssignmentId,
      true
    );
  }, [
    selectedAssignmentId,
    assignments,
    loadSubmissions,
  ]);

  /* =======================================================
     ASSIGNMENT CHANGE
  ======================================================= */

  const handleAssignmentChange = (event) => {
    const value = event.target.value;

    setSelectedAssignmentId(value);
    setExpandedSubmission(null);
    setError("");
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      const query = tutorReference
        ? `?reference=${encodeURIComponent(
            tutorReference
          )}`
        : "";

      const response = await fetch(
        `${ASSIGNMENT_URL}${query}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to refresh assignments (${response.status}).`
        );
      }

      const list =
        getAssignmentsFromResponse(data);

      setAssignments(list);

      const currentStillExists =
        list.some(
          (item) =>
            String(getAssignmentId(item)) ===
            String(selectedAssignmentId)
        );

      if (
        selectedAssignmentId &&
        currentStillExists
      ) {
        await loadSubmissions(
          selectedAssignmentId,
          false
        );
      } else if (list.length > 0) {
        const firstId =
          getAssignmentId(list[0]);

        setSelectedAssignmentId(
          firstId ? String(firstId) : ""
        );
      } else {
        setSelectedAssignmentId("");
        setAssignment(null);
        setSubmissions([]);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to refresh assignments."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     RELEASE RESULT
  ======================================================= */

  const handleReleaseResult = async (
    submission
  ) => {
    const submissionId =
      getSubmissionId(submission);

    if (!selectedAssignmentId) {
      setError(
        "Please select an assignment first."
      );

      return;
    }

    if (!submissionId) {
      setError(
        "This submission does not have a valid submission ID."
      );

      return;
    }

    setReleasingSubmission(submissionId);
    setError("");

    try {
      const response = await fetch(
        `${ASSIGNMENT_URL}/${encodeURIComponent(
          selectedAssignmentId
        )}/submissions/${encodeURIComponent(
          submissionId
        )}/release`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            reference: tutorReference,
            tutorReference,
            tutor_reference: tutorReference,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to release result (${response.status}).`
        );
      }

      setSubmissions((current) =>
        current.map((item) => {
          if (
            getSubmissionId(item) !==
            submissionId
          ) {
            return item;
          }

          return {
            ...item,
            result_released: true,
            resultReleased: true,
            released: true,
          };
        })
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to release this result."
      );
    } finally {
      setReleasingSubmission(null);
    }
  };

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total = submissions.length;

    const released = submissions.filter(
      (item) => getReleaseState(item)
    ).length;

    const percentages = submissions.map(
      getPercentage
    );

    const average =
      percentages.length > 0
        ? percentages.reduce(
            (sum, value) => sum + value,
            0
          ) / percentages.length
        : 0;

    const highest =
      percentages.length > 0
        ? Math.max(...percentages)
        : 0;

    return {
      total,
      released,
      pending: total - released,
      average,
      highest,
    };
  }, [submissions]);

  /* =======================================================
     ASSIGNMENT INFO
  ======================================================= */

  const assignmentTitle =
    assignment?.title ||
    assignment?.name ||
    "Assignment Grading";

  const assignmentSubject =
    assignment?.subject || "";

  const assignmentGrade =
    assignment?.grade ||
    assignment?.class ||
    "";

  /* =======================================================
     LOADING ASSIGNMENTS
  ======================================================= */

  if (loadingAssignments) {
    return (
      <div className="min-h-[70vh] bg-[#020617] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <Loader2 className="w-9 h-9 animate-spin text-cyan-400" />

          <p className="text-slate-400 text-sm">
            Loading assignments...
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-6 md:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col gap-5 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/tutor/assignments"
                )
              }
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition w-fit"
            >
              <ArrowLeft className="w-5 h-5" />

              Back to Assignments
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-[#071426] text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* ASSIGNMENT SELECTOR */}

          <div className="rounded-2xl border border-slate-800 bg-[#071426] p-4 md:p-5">

            <div className="flex flex-col lg:flex-row lg:items-end gap-4">

              <div className="flex-1">

                <label
                  htmlFor="grading-assignment"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
                >
                  Select Assignment
                </label>

                <div className="relative">

                  <select
                    id="grading-assignment"
                    value={
                      selectedAssignmentId
                    }
                    onChange={
                      handleAssignmentChange
                    }
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-500/60"
                  >

                    <option
                      value=""
                      className="bg-[#020617]"
                    >
                      Select an assignment
                    </option>

                    {assignments.map(
                      (item, index) => {
                        const id =
                          getAssignmentId(
                            item
                          );

                        const title =
                          getAssignmentTitle(
                            item
                          );

                        const subject =
                          getAssignmentSubject(
                            item
                          );

                        const grade =
                          getAssignmentGrade(
                            item
                          );

                        if (!id) {
                          return null;
                        }

                        return (
                          <option
                            key={`${id}-${index}`}
                            value={String(id)}
                            className="bg-[#020617]"
                          >
                            {title}
                            {subject
                              ? ` — ${subject}`
                              : ""}
                            {grade
                              ? ` (${grade})`
                              : ""}
                          </option>
                        );
                      }
                    )}

                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                </div>

              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400">

                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">

                  <FileText className="w-5 h-5 text-cyan-400" />

                </div>

                <div>

                  <p className="text-white font-semibold">
                    {assignments.length}
                  </p>

                  <p className="text-xs text-slate-500">
                    Total assignments
                  </p>

                </div>

              </div>

            </div>

          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2 mb-3">

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">

                <GraduationCap className="w-3.5 h-3.5" />

                Automatic Grading

              </span>

              {assignmentGrade && (
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  {assignmentGrade}
                </span>
              )}

              {assignmentSubject && (
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  {assignmentSubject}
                </span>
              )}

            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {selectedAssignmentId
                ? assignmentTitle
                : "Assignment Grading"}
            </h1>

            <p className="text-slate-400 mt-2 max-w-2xl">
              Select an assignment to view student
              submissions, review answers, and release
              results.
            </p>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 flex items-start gap-3">

            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />

            <div className="flex-1">

              <p className="text-red-300 text-sm font-medium">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* NO ASSIGNMENTS */}

        {assignments.length === 0 ? (

          <div className="rounded-3xl border border-slate-800 bg-[#071426] px-6 py-16 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">

              <FileText className="w-8 h-8 text-cyan-400" />

            </div>

            <h2 className="text-xl font-semibold mb-2">
              No assignments yet
            </h2>

            <p className="text-slate-400 max-w-md mx-auto text-sm leading-6 mb-5">
              Create an assignment first. Once students
              submit their work, their automatically graded
              results will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/tutor/assignments/create"
                )
              }
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition font-semibold text-sm"
            >
              <FileText className="w-4 h-4" />

              Create Assignment
            </button>

          </div>

        ) : !selectedAssignmentId ? (

          <div className="rounded-3xl border border-slate-800 bg-[#071426] px-6 py-16 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">

              <BookOpen className="w-8 h-8 text-cyan-400" />

            </div>

            <h2 className="text-xl font-semibold mb-2">
              Select an assignment
            </h2>

            <p className="text-slate-400 max-w-md mx-auto text-sm leading-6">
              Choose an assignment above to view its
              student submissions and grades.
            </p>

          </div>

        ) : loadingSubmissions ? (

          <div className="rounded-3xl border border-slate-800 bg-[#071426] px-6 py-16 text-center">

            <Loader2 className="w-9 h-9 mx-auto animate-spin text-cyan-400 mb-4" />

            <p className="text-slate-400 text-sm">
              Loading student submissions...
            </p>

          </div>

        ) : (

          <>
            {/* STATS */}

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">

              <StatCard
                icon={FileText}
                label="Submissions"
                value={stats.total}
              />

              <StatCard
                icon={CheckCircle2}
                label="Released"
                value={stats.released}
              />

              <StatCard
                icon={Clock3}
                label="Pending Release"
                value={stats.pending}
              />

              <StatCard
                icon={Award}
                label="Average"
                value={`${stats.average.toFixed(1)}%`}
              />

              <StatCard
                icon={GraduationCap}
                label="Highest"
                value={`${stats.highest.toFixed(1)}%`}
              />

            </div>

            {/* EMPTY STATE */}

            {submissions.length === 0 ? (

              <div className="rounded-3xl border border-slate-800 bg-[#071426] px-6 py-16 text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">

                  <FileText className="w-8 h-8 text-cyan-400" />

                </div>

                <h2 className="text-xl font-semibold mb-2">
                  No submissions yet
                </h2>

                <p className="text-slate-400 max-w-md mx-auto text-sm leading-6">
                  When students submit this assignment,
                  their work will be automatically graded
                  and appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {submissions.map(
                  (submission, index) => {

                    const submissionId =
                      getSubmissionId(
                        submission
                      ) ||
                      `submission-${index}`;

                    const studentName =
                      getStudentName(
                        submission
                      );

                    const studentReference =
                      getStudentReference(
                        submission
                      );

                    const percentage =
                      getPercentage(
                        submission
                      );

                    const grade =
                      getGrade(
                        submission
                      );

                    const score =
                      getScore(
                        submission
                      );

                    const released =
                      getReleaseState(
                        submission
                      );

                    const isExpanded =
                      expandedSubmission ===
                      submissionId;

                    const answers =
                      getAnswers(
                        submission
                      );

                    return (
                      <div
                        key={submissionId}
                        className="rounded-2xl border border-slate-800 bg-[#071426] overflow-hidden"
                      >

                        {/* SUBMISSION HEADER */}

                        <div className="p-4 md:p-5">

                          <div className="flex flex-col xl:flex-row xl:items-center gap-5">

                            <div className="flex items-center gap-3 min-w-0 flex-1">

                              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">

                                <User className="w-5 h-5 text-cyan-400" />

                              </div>

                              <div className="min-w-0">

                                <h3 className="font-semibold text-white truncate">
                                  {studentName}
                                </h3>

                                <p className="text-xs text-slate-500 mt-1 truncate">
                                  Reference:{" "}
                                  {studentReference}
                                </p>

                              </div>

                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 xl:flex items-center gap-3">

                              <ResultMetric
                                label="Score"
                                value={`${score.score}/${
                                  score.total ||
                                  "—"
                                }`}
                              />

                              <ResultMetric
                                label="Percentage"
                                value={`${percentage.toFixed(
                                  1
                                )}%`}
                              />

                              <div className="min-w-[72px] text-center">

                                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                  Grade
                                </span>

                                <span
                                  className={`inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg font-bold text-sm ${getGradeClass(
                                    grade
                                  )}`}
                                >
                                  {grade}
                                </span>

                              </div>

                              <div className="hidden sm:block min-w-[150px]">

                                <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                  Submitted
                                </span>

                                <span className="text-xs text-slate-300">
                                  {formatDate(
                                    submission?.submitted_at ||
                                      submission?.submittedAt ||
                                      submission?.created_at ||
                                      submission?.createdAt
                                  )}
                                </span>

                              </div>

                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 xl:w-auto">

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedSubmission(
                                    isExpanded
                                      ? null
                                      : submissionId
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition text-sm"
                              >

                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}

                                {isExpanded
                                  ? "Hide Answers"
                                  : "Review Answers"}

                              </button>

                              {released ? (

                                <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">

                                  <Check className="w-4 h-4" />

                                  Result Released

                                </div>

                              ) : (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReleaseResult(
                                      submission
                                    )
                                  }
                                  disabled={
                                    releasingSubmission ===
                                    submissionId
                                  }
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition text-sm font-semibold disabled:opacity-50"
                                >

                                  {releasingSubmission ===
                                  submissionId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}

                                  {releasingSubmission ===
                                  submissionId
                                    ? "Releasing..."
                                    : "Release Result"}

                                </button>

                              )}

                            </div>

                          </div>

                          <div className="sm:hidden mt-4 pt-4 border-t border-slate-800">

                            <div className="flex items-center gap-2 text-xs text-slate-500">

                              <Clock3 className="w-3.5 h-3.5" />

                              Submitted{" "}
                              {formatDate(
                                submission?.submitted_at ||
                                  submission?.submittedAt ||
                                  submission?.created_at ||
                                  submission?.createdAt
                              )}

                            </div>

                          </div>

                        </div>

                        {/* ANSWERS */}

                        {isExpanded && (
                          <div className="border-t border-slate-800 bg-[#020617]/50">

                            <div className="p-4 md:p-6">

                              <div className="flex items-center justify-between gap-3 mb-5">

                                <div>

                                  <h4 className="font-semibold text-white">
                                    Answer Review
                                  </h4>

                                  <p className="text-xs text-slate-500 mt-1">
                                    Automatically graded
                                    against the assignment
                                    answer key.
                                  </p>

                                </div>

                                <div className="text-xs text-slate-400">
                                  {answers.length} question
                                  {answers.length === 1
                                    ? ""
                                    : "s"}
                                </div>

                              </div>

                              {answers.length === 0 ? (

                                <div className="rounded-2xl border border-slate-800 bg-[#071426] p-8 text-center">

                                  <BookOpen className="w-7 h-7 mx-auto text-slate-600 mb-3" />

                                  <p className="text-sm text-slate-400">
                                    Answer details were not
                                    returned for this
                                    submission.
                                  </p>

                                </div>

                              ) : (

                                <div className="space-y-4">

                                  {answers.map(
                                    (
                                      answer,
                                      answerIndex
                                    ) => {

                                      const correct =
                                        isAnswerCorrect(
                                          answer
                                        );

                                      const studentAnswer =
                                        getStudentAnswer(
                                          answer
                                        );

                                      const correctAnswer =
                                        getCorrectAnswer(
                                          answer
                                        );

                                      const reason =
                                        getReason(
                                          answer
                                        );

                                      const marksAwarded =
                                        getMarksAwarded(
                                          answer
                                        );

                                      const maxMarks =
                                        getMaxMarks(
                                          answer
                                        );

                                      return (
                                        <div
                                          key={
                                            answer?.id ||
                                            answer?.question_id ||
                                            `${submissionId}-answer-${answerIndex}`
                                          }
                                          className="rounded-2xl border border-slate-800 bg-[#071426] p-4 md:p-5"
                                        >

                                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">

                                            <div className="flex items-start gap-3">

                                              <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                                                {getQuestionNumber(
                                                  answer,
                                                  answerIndex
                                                )}
                                              </span>

                                              <p className="text-sm md:text-[15px] text-slate-200 leading-6">
                                                {getQuestionText(
                                                  answer
                                                )}
                                              </p>

                                            </div>

                                            <span
                                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                                                correct
                                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                                  : "bg-red-500/10 border border-red-500/20 text-red-300"
                                              }`}
                                            >

                                              {correct ? (
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                              ) : (
                                                <XCircle className="w-3.5 h-3.5" />
                                              )}

                                              {correct
                                                ? "Correct"
                                                : "Wrong"}

                                            </span>

                                          </div>

                                          <div className="grid md:grid-cols-2 gap-3">

                                            <AnswerBox
                                              label="Student Answer"
                                              value={
                                                studentAnswer
                                              }
                                              correct={
                                                correct
                                              }
                                              student
                                            />

                                            <AnswerBox
                                              label="Correct Answer"
                                              value={
                                                correctAnswer
                                              }
                                              correct
                                            />

                                          </div>

                                          <div className="mt-3 flex flex-wrap items-center gap-3">

                                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">

                                              <Award className="w-3.5 h-3.5" />

                                              Marks:{" "}

                                              <span className="text-white font-semibold">
                                                {marksAwarded}/
                                                {maxMarks}
                                              </span>

                                            </div>

                                          </div>

                                          {reason && (
                                            <div className="mt-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">

                                              <p className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold mb-2">
                                                Explanation
                                              </p>

                                              <p className="text-sm text-slate-300 leading-6">
                                                {reason}
                                              </p>

                                            </div>
                                          )}

                                        </div>
                                      );
                                    }
                                  )}

                                </div>
                              )}

                            </div>

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </>
        )}

      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#071426] p-4">

      <div className="flex items-center gap-2 text-slate-500 mb-3">

        <Icon className="w-4 h-4" />

        <span className="text-[11px] uppercase tracking-wider">
          {label}
        </span>

      </div>

      <p className="text-xl md:text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   RESULT METRIC
========================================================= */

function ResultMetric({
  label,
  value,
}) {
  return (
    <div className="min-w-[72px] text-center">

      <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </span>

      <span className="text-sm font-semibold text-white">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   ANSWER BOX
========================================================= */

function AnswerBox({
  label,
  value,
  correct = false,
  student = false,
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        correct && !student
          ? "border-emerald-500/15 bg-emerald-500/5"
          : student && correct
          ? "border-emerald-500/15 bg-emerald-500/5"
          : student
          ? "border-red-500/15 bg-red-500/5"
          : "border-slate-800 bg-slate-900/50"
      }`}
    >

      <div className="flex items-center gap-2 mb-2">

        {student ? (
          correct ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-400" />
          )
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        )}

        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </span>

      </div>

      <p className="text-sm font-medium text-slate-200 break-words">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   GRADE CLASS
========================================================= */

function getGradeClass(grade) {
  switch (String(grade).toUpperCase()) {
    case "A":
      return "bg-emerald-500/15 border border-emerald-500/20 text-emerald-300";

    case "B":
      return "bg-cyan-500/15 border border-cyan-500/20 text-cyan-300";

    case "C":
      return "bg-blue-500/15 border border-blue-500/20 text-blue-300";

    case "D":
      return "bg-amber-500/15 border border-amber-500/20 text-amber-300";

    case "E":
      return "bg-orange-500/15 border border-orange-500/20 text-orange-300";

    default:
      return "bg-red-500/15 border border-red-500/20 text-red-300";
  }
}
