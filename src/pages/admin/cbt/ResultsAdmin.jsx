
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Search,
  RefreshCw,
  Users,
  FileText,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  GraduationCap,
  Hash,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

import AdminSearch from "../../../components/admin/ui/AdminSearch";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const RESULTS_URL = `${API_BASE}/api/admin/school-exams/results`;

const TOKEN_KEYS = [
  "scholiqen_auth_token",
  "scholiqen_token",
  "admin_token",
  "auth_token",
  "access_token",
  "token",
];

const clean = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return "";
};

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStudentName = (result) =>
  clean(
    firstValue(
      result.studentName,
      result.student_name,
      result.fullName,
      result.full_name,
      result.name,
      `${clean(result.first_name)} ${clean(result.last_name)}`
    )
  );

const getStudentReference = (result) =>
  clean(
    firstValue(
      result.studentReference,
      result.student_reference,
      result.studentRef,
      result.student_ref,
      result.reference,
      result.enrollmentReference,
      result.enrollment_reference
    )
  );

const getStudentClass = (result) =>
  clean(
    firstValue(
      result.className,
      result.class_name,
      result.studentClass,
      result.student_class,
      result.grade,
      result.level
    )
  );

const getExamTitle = (result) =>
  clean(
    firstValue(
      result.examTitle,
      result.exam_title,
      result.examName,
      result.exam_name,
      result.title,
      result.exam,
      "School Examination"
    )
  );

const getSubject = (result) =>
  clean(
    firstValue(
      result.subject,
      result.subjectName,
      result.subject_name,
      "Not specified"
    )
  );

const getPercentage = (result) => {
  const value = firstValue(
    result.percentage,
    result.scorePercentage,
    result.score_percentage,
    result.score
  );

  if (value === undefined) return null;

  const number = Number(String(value).replace("%", ""));

  return Number.isFinite(number) ? number : null;
};

const getGrade = (result) => {
  const savedGrade = firstValue(result.grade, result.final_grade);

  if (savedGrade) return clean(savedGrade);

  const percentage = getPercentage(result);

  if (percentage === null) return "—";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 40) return "E";

  return "F";
};

const getSubmissionDate = (result) =>
  firstValue(
    result.submittedAt,
    result.submitted_at,
    result.completedAt,
    result.completed_at,
    result.date
  );

const getScoreDisplay = (result) => {
  const percentage = getPercentage(result);

  return percentage === null ? "—" : `${percentage.toFixed(1)}%`;
};

const getNumber = (...values) => {
  const value = firstValue(...values);
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normalizeResult = (result, index) => ({
  ...result,
  id: firstValue(result.id, result.attemptId, result.attempt_id, index),
  student: getStudentName(result) || "Student",
  reference: getStudentReference(result) || "Not available",
  className: getStudentClass(result) || "Not available",
  examTitle: getExamTitle(result),
  subject: getSubject(result),
  percentage: getPercentage(result),
  scoreDisplay: getScoreDisplay(result),
  grade: getGrade(result),
  submittedAt: getSubmissionDate(result),
  correct: getNumber(
    result.correct,
    result.correctAnswers,
    result.correct_answers
  ),
  incorrect: getNumber(
    result.incorrect,
    result.incorrectAnswers,
    result.incorrect_answers
  ),
  unanswered: getNumber(
    result.unanswered,
    result.unansweredQuestions,
    result.unanswered_questions
  ),
  totalQuestions: getNumber(
    result.totalQuestions,
    result.total_questions,
    result.questionCount,
    result.question_count
  ),
  obtainedMarks: getNumber(
    result.obtainedMarks,
    result.obtained_marks,
    result.scoreMarks
  ),
  totalMarks: getNumber(
    result.totalMarks,
    result.total_marks
  ),
});

const gradeStyles = {
  A: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  B: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  C: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  D: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  E: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  F: "bg-red-500/10 text-red-400 border-red-500/20",
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Icon size={15} />
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-semibold text-white">
      {value || "Not available"}
    </p>
  </div>
);

const ResultsAdmin = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadResults = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = getToken();

      const response = await fetch(RESULTS_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(token ? { "x-academy-token": token } : {}),
        },
        credentials: "include",
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.message ||
            payload.error ||
            `Unable to load results (${response.status}).`
        );
      }

      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.results)
        ? payload.results
        : Array.isArray(payload.data?.results)
        ? payload.data.results
        : Array.isArray(payload.data)
        ? payload.data
        : [];

      setResults(rows.map(normalizeResult));
    } catch (err) {
      setError(
        err.message ||
          "Unable to load examination results. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return results;

    return results.filter((result) => {
      const searchable = [
        result.student,
        result.reference,
        result.className,
        result.examTitle,
        result.subject,
        result.grade,
        result.scoreDisplay,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [results, search]);

  const statistics = useMemo(() => {
    const total = results.length;

    const average =
      total > 0
        ? results.reduce(
            (sum, result) => sum + (result.percentage ?? 0),
            0
          ) / total
        : 0;

    const passed = results.filter(
      (result) => result.percentage !== null && result.percentage >= 50
    ).length;

    return {
      total,
      passed,
      failed: total - passed,
      average,
    };
  }, [results]);

  return (
    <div className="min-h-full space-y-6 text-white">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <FileText className="text-blue-400" size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                CBT Results
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                View submitted student examinations and performance records.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadResults(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh Results
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Submitted Results</p>
            <FileText className="text-blue-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            {statistics.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Completed examinations
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Passed</p>
            <CheckCircle2 className="text-emerald-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums text-emerald-400">
            {statistics.passed}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            50% and above
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Below Pass Mark</p>
            <XCircle className="text-red-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums text-red-400">
            {statistics.failed}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Below 50%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Average Score</p>
            <Award className="text-amber-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            {statistics.total ? `${statistics.average.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across submitted results
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search name, reference, class, subject..."
          />
        </div>

        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-300">
            {filteredResults.length}
          </span>{" "}
          of {results.length} results
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-red-400" size={18} />
            <div>
              <p className="text-sm font-semibold text-red-300">
                Unable to load results
              </p>
              <p className="mt-1 text-sm text-red-300/70">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadResults(true)}
            className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Try Again
          </button>
        </div>
      )}

      {/* RESULTS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">
              Student Examination Records
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Only submitted examination attempts should appear here.
            </p>
          </div>

          <Users className="text-slate-500" size={20} />
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-400" size={30} />
            <p className="text-sm text-slate-400">
              Loading examination results...
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
              <FileText className="text-slate-500" size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-white">
              {search ? "No matching results" : "No submitted results yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {search
                ? "Try searching with another student name, reference number, class or subject."
                : "When students submit their School Examination, their results and student details will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Student Details</th>
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Class</th>
                  <th className="px-5 py-4">Examination</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Grade</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredResults.map((result) => (
                  <tr
                    key={result.id}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">
                        {result.student}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Student
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-blue-300">
                        {result.reference}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200">
                        {result.className}
                      </span>
                    </td>

                    <td className="max-w-[200px] px-5 py-4 text-sm text-slate-300">
                      {result.examTitle}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-300">
                      {result.subject}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold tabular-nums text-white">
                        {result.scoreDisplay}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                          gradeStyles[result.grade] ||
                          "border-slate-700 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {result.grade}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDateTime(result.submittedAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedResult(result)}
                        title="View complete student result"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 transition hover:bg-blue-500/20"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPLETE RESULT DETAILS */}
      {selectedResult && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedResult(null);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Examination Result
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Complete student and examination record
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* STUDENT IDENTITY */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Users size={17} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">
                    Student Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={Users}
                    label="Full Name"
                    value={selectedResult.student}
                  />

                  <DetailItem
                    icon={Hash}
                    label="Student Reference"
                    value={selectedResult.reference}
                  />

                  <DetailItem
                    icon={GraduationCap}
                    label="Class"
                    value={selectedResult.className}
                  />

                  <DetailItem
                    icon={FileText}
                    label="Student Email"
                    value={firstValue(
                      selectedResult.studentEmail,
                      selectedResult.student_email,
                      selectedResult.email
                    )}
                  />

                  <DetailItem
                    icon={Hash}
                    label="Enrollment ID"
                    value={firstValue(
                      selectedResult.enrollmentId,
                      selectedResult.enrollment_id
                    )}
                  />

                  <DetailItem
                    icon={Hash}
                    label="Attempt ID"
                    value={firstValue(
                      selectedResult.attemptId,
                      selectedResult.attempt_id,
                      selectedResult.id
                    )}
                  />
                </div>
              </section>

              {/* EXAMINATION INFORMATION */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <FileText size={17} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">
                    Examination Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={FileText}
                    label="Examination"
                    value={selectedResult.examTitle}
                  />

                  <DetailItem
                    icon={GraduationCap}
                    label="Subject"
                    value={selectedResult.subject}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Submission Date"
                    value={formatDateTime(selectedResult.submittedAt)}
                  />

                  <DetailItem
                    icon={Clock}
                    label="Duration Used"
                    value={firstValue(
                      selectedResult.durationUsed,
                      selectedResult.duration_used,
                      selectedResult.timeTaken,
                      selectedResult.time_taken
                    )
                      ? `${firstValue(
                          selectedResult.durationUsed,
                          selectedResult.duration_used,
                          selectedResult.timeTaken,
                          selectedResult.time_taken
                        )} minutes`
                      : "Not available"}
                  />
                </div>
              </section>

              {/* PERFORMANCE */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Award size={17} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Performance Summary
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="text-xs text-slate-400">Percentage</p>
                    <p className="mt-2 text-2xl font-bold text-blue-400">
                      {selectedResult.scoreDisplay}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs text-slate-400">Correct</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-400">
                      {selectedResult.correct}
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-xs text-slate-400">Incorrect</p>
                    <p className="mt-2 text-2xl font-bold text-red-400">
                      {selectedResult.incorrect}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-xs text-slate-400">Unanswered</p>
                    <p className="mt-2 text-2xl font-bold text-amber-400">
                      {selectedResult.unanswered}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DetailItem
                    icon={FileText}
                    label="Total Questions"
                    value={selectedResult.totalQuestions || "Not available"}
                  />

                  <DetailItem
                    icon={Award}
                    label="Marks Obtained"
                    value={
                      selectedResult.totalMarks
                        ? `${selectedResult.obtainedMarks} / ${selectedResult.totalMarks}`
                        : selectedResult.obtainedMarks || "Not available"
                    }
                  />

                  <DetailItem
                    icon={Award}
                    label="Final Grade"
                    value={selectedResult.grade}
                  />
                </div>
              </section>

              <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400" size={21} />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      Examination Submitted
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      This record represents a completed student attempt.
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  Submitted
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsAdmin;
