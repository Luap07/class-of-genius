import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  RefreshCw,
  BookOpen,
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Layers3,
} from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";
import { supabase } from "../../../lib/supabaseClient";

const DEFAULT_EXAMS = [
  {
    id: "waec",
    name: "WAEC",
    title: "West African Examinations Council",
    duration: 180,
    status: "Published",
  },
  {
    id: "neco",
    name: "NECO",
    title: "National Examinations Council",
    duration: 180,
    status: "Published",
  },
  {
    id: "jamb",
    name: "JAMB",
    title: "Joint Admissions and Matriculation Board",
    duration: 120,
    status: "Published",
  },
  {
    id: "gce",
    name: "GCE",
    title: "General Certificate Examination",
    duration: 180,
    status: "Draft",
  },
  {
    id: "jupeb",
    name: "JUPEB",
    title: "Joint Universities Preliminary Examinations Board",
    duration: 180,
    status: "Draft",
  },
  {
    id: "ijmb",
    name: "IJMB",
    title: "Interim Joint Matriculation Board",
    duration: 180,
    status: "Draft",
  },
];

const REQUIRED_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Chemistry",
  "Physics",
];

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const formatDuration = (minutes) => {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) {
    return "Not set";
  }

  const hours = Math.floor(value / 60);
  const mins = value % 60;

  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${mins}m`;
};

const ExamsAdmin = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [expandedExam, setExpandedExam] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedExam, setSelectedExam] = useState(null);

  const [examForm, setExamForm] = useState({
    name: "",
    title: "",
    duration: 180,
    status: "Draft",
  });

  /*
   * ============================================================
   * LOAD QUESTIONS
   * ============================================================
   *
   * The CBT question table is the source of truth for question
   * counts.
   *
   * We intentionally do NOT hard-code:
   *
   * Physics = 40
   * Chemistry = 40
   *
   * The admin reads what actually exists in Supabase.
   */

  const fetchQuestions = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("cbt_questions")
        .select("*");

      if (error) {
        console.error("CBT Questions Error:", error);
        setQuestions([]);
        return;
      }

      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("CBT Questions Fetch Error:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  /*
   * ============================================================
   * GET EXAM NAME FROM QUESTION
   * ============================================================
   *
   * Different versions of the question uploader may have used
   * different column names.
   *
   * We support the common ones here.
   */

  const getQuestionExam = (question) => {
    return (
      question?.exam ||
      question?.exam_name ||
      question?.examination ||
      question?.examName ||
      ""
    );
  };

  /*
   * ============================================================
   * GET SUBJECT FROM QUESTION
   * ============================================================
   */

  const getQuestionSubject = (question) => {
    return (
      question?.subject ||
      question?.subject_name ||
      question?.subjectName ||
      ""
    );
  };

  /*
   * ============================================================
   * BUILD EXAMINATION DATA
   * ============================================================
   */

  const examData = useMemo(() => {
    const grouped = {};

    DEFAULT_EXAMS.forEach((exam) => {
      grouped[normalize(exam.name)] = {
        ...exam,
        subjects: {},
        totalQuestions: 0,
      };
    });

    questions.forEach((question) => {
      const examName = getQuestionExam(question);
      const subjectName = getQuestionSubject(question);

      if (!examName) {
        return;
      }

      const examKey = normalize(examName);

      if (!grouped[examKey]) {
        grouped[examKey] = {
          id: examKey,
          name: examName,
          title: examName,
          duration: 180,
          status: "Published",
          subjects: {},
          totalQuestions: 0,
        };
      }

      const exam = grouped[examKey];

      const subject =
        subjectName && String(subjectName).trim()
          ? String(subjectName).trim()
          : "Unassigned";

      const subjectKey = normalize(subject);

      if (!exam.subjects[subjectKey]) {
        exam.subjects[subjectKey] = {
          name: subject,
          count: 0,
        };
      }

      exam.subjects[subjectKey].count += 1;
      exam.totalQuestions += 1;
    });

    return Object.values(grouped);
  }, [questions]);

  /*
   * ============================================================
   * FILTER EXAMS
   * ============================================================
   */

  const filteredExams = useMemo(() => {
    const term = normalize(search);

    if (!term) {
      return examData;
    }

    return examData.filter((exam) => {
      if (normalize(exam.name).includes(term)) {
        return true;
      }

      if (normalize(exam.title).includes(term)) {
        return true;
      }

      return Object.values(exam.subjects || {}).some((subject) =>
        normalize(subject.name).includes(term)
      );
    });
  }, [examData, search]);

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  const statistics = useMemo(() => {
    const totalQuestions = questions.length;

    const subjects = new Set();

    questions.forEach((question) => {
      const subject = getQuestionSubject(question);

      if (subject) {
        subjects.add(normalize(subject));
      }
    });

    const complete40 = examData.reduce((total, exam) => {
      const subjectValues = Object.values(exam.subjects || {});

      const completeSubjects = subjectValues.filter(
        (subject) => subject.count >= 40
      );

      return total + completeSubjects.length;
    }, 0);

    return {
      exams: examData.length,
      subjects: subjects.size,
      questions: totalQuestions,
      complete40,
    };
  }, [questions, examData]);

  /*
   * ============================================================
   * SUBJECT STATUS
   * ============================================================
   */

  const getSubjectStatus = (count) => {
    if (count >= 40) {
      return {
        label: "Ready",
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
        icon: CheckCircle2,
      };
    }

    if (count > 0) {
      return {
        label: `${count}/40`,
        className:
          "border-yellow-400/20 bg-yellow-400/10 text-yellow-400",
        icon: Clock3,
      };
    }

    return {
      label: "0/40",
      className: "border-red-400/20 bg-red-400/10 text-red-400",
      icon: XCircle,
    };
  };

  /*
   * ============================================================
   * REQUIRED SUBJECT STRUCTURE
   * ============================================================
   */

  const getRequiredSubjects = (exam) => {
    const result = [];

    REQUIRED_SUBJECTS.forEach((requiredSubject) => {
      const key = normalize(requiredSubject);

      const matchingSubject = Object.values(exam.subjects || {}).find(
        (subject) => normalize(subject.name) === key
      );

      result.push({
        name: requiredSubject,
        count: matchingSubject?.count || 0,
      });
    });

    return result;
  };

  /*
   * ============================================================
   * MODAL HELPERS
   * ============================================================
   */

  const resetForm = () => {
    setExamForm({
      name: "",
      title: "",
      duration: 180,
      status: "Draft",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);

    setExamForm({
      name: exam.name || "",
      title: exam.title || "",
      duration: exam.duration || 180,
      status: exam.status || "Draft",
    });

    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedExam(null);
    resetForm();
  };

  /*
   * ============================================================
   * CREATE EXAM
   * ============================================================
   *
   * IMPORTANT:
   *
   * The existing cbt_questions table does not appear to contain
   * an examinations table from the code you supplied.
   *
   * Therefore this function does NOT pretend to insert an exam
   * into a table that may not exist.
   *
   * The question bank itself remains the source of truth.
   */

  const handleCreateExam = (event) => {
    event.preventDefault();

    const name = examForm.name.trim();

    if (!name) {
      return;
    }

    alert(
      `The examination "${name}" is ready to be connected to your examination table.`
    );

    closeModals();
  };

  /*
   * ============================================================
   * EDIT EXAM
   * ============================================================
   */

  const handleEditExam = (event) => {
    event.preventDefault();

    if (!selectedExam) {
      return;
    }

    alert(
      `The examination settings for "${selectedExam.name}" have been prepared.`
    );

    closeModals();
  };

  /*
   * ============================================================
   * DELETE EXAM
   * ============================================================
   *
   * We deliberately do NOT delete questions here.
   *
   * Deleting an exam from this screen should never accidentally
   * wipe the question bank.
   */

  const handleDeleteExam = (exam) => {
    const confirmed = window.confirm(
      `Remove "${exam.name}" from the examination list?\n\nThis action does NOT delete questions from Supabase.`
    );

    if (!confirmed) {
      return;
    }

    alert(
      `"${exam.name}" is a configuration item in this admin screen. Your questions were not deleted.`
    );
  };

  /*
   * ============================================================
   * EXPAND EXAM
   * ============================================================
   */

  const toggleExam = (examId) => {
    setExpandedExam((current) =>
      current === examId ? null : examId
    );
  };

  return (
    <div className="min-h-full space-y-6 text-white">

      {/* ========================================================
          HEADER
      ========================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
              <Layers3 size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                CBT Exams
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage examinations, subjects and question requirements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => fetchQuestions(true)}
            disabled={refreshing}
            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh
          </button>

          <AdminButton onClick={openCreateModal}>
            <span className="flex items-center gap-2">
              <Plus size={18} />
              Create Exam
            </span>
          </AdminButton>

        </div>
      </div>

      {/* ========================================================
          STATS
      ========================================================= */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Layers3 size={18} />
          </div>

          <p className="text-2xl font-bold">
            {statistics.exams}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Examination Bodies
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <BookOpen size={18} />
          </div>

          <p className="text-2xl font-bold">
            {statistics.subjects}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Active Subjects
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <FileText size={18} />
          </div>

          <p className="text-2xl font-bold">
            {loading ? "..." : statistics.questions.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Total Questions
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={18} />
          </div>

          <p className="text-2xl font-bold">
            {statistics.complete40}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Subject Banks ≥ 40
          </p>
        </div>

      </div>

      {/* ========================================================
          SEARCH
      ========================================================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full sm:max-w-md">

          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search examinations or subjects..."
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/30 focus:bg-white/[0.05]"
          />

        </div>

        <div className="text-xs text-slate-500">
          {filteredExams.length} examination
          {filteredExams.length === 1 ? "" : "s"} found
        </div>

      </div>

      {/* ========================================================
          EXAM LIST
      ========================================================= */}

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px] text-left">

            <thead className="border-b border-white/[0.07] bg-white/[0.035]">

              <tr>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Examination
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Subjects
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Questions
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Duration
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-slate-500"
                  >
                    Loading CBT examination data...
                  </td>
                </tr>

              ) : filteredExams.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex max-w-md flex-col items-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
                        <FileText size={24} />
                      </div>

                      <h3 className="mt-4 font-semibold text-white">
                        No examination data found
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Upload questions with an examination and subject
                        value to populate this section.
                      </p>

                    </div>

                  </td>
                </tr>

              ) : (

                filteredExams.map((exam) => {

                  const subjectCount = Object.keys(
                    exam.subjects || {}
                  ).length;

                  const isExpanded = expandedExam === exam.id;

                  const requiredSubjects =
                    getRequiredSubjects(exam);

                  const readySubjects =
                    requiredSubjects.filter(
                      (subject) => subject.count >= 40
                    ).length;

                  const examReady =
                    readySubjects === REQUIRED_SUBJECTS.length;

                  return (
                    <React.Fragment key={exam.id}>

                      {/* ==================================================
                          MAIN ROW
                      ================================================== */}

                      <tr
                        className="border-b border-white/[0.06] transition hover:bg-white/[0.025]"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <button
                              type="button"
                              onClick={() =>
                                toggleExam(exam.id)
                              }
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-slate-400 transition hover:border-blue-400/20 hover:text-blue-400"
                            >
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>

                            <div>

                              <p className="font-semibold text-white">
                                {exam.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {exam.title}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <span className="rounded-lg border border-blue-400/10 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                              {subjectCount} subject
                              {subjectCount === 1 ? "" : "s"}
                            </span>

                            {examReady && (
                              <CheckCircle2
                                size={15}
                                className="text-emerald-400"
                              />
                            )}

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <FileText
                              size={15}
                              className="text-slate-500"
                            />

                            <span className="font-medium text-slate-200">
                              {exam.totalQuestions.toLocaleString()}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-400">

                            <Clock3 size={15} />

                            {formatDuration(exam.duration)}

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                              exam.status === "Published"
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                                : "border-yellow-400/20 bg-yellow-400/10 text-yellow-400"
                            }`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                exam.status === "Published"
                                  ? "bg-emerald-400"
                                  : "bg-yellow-400"
                              }`}
                            />

                            {exam.status}

                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(exam)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-blue-400 transition hover:border-blue-400/20 hover:bg-blue-500/10"
                              title="Edit examination"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteExam(exam)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-red-400 transition hover:border-red-400/20 hover:bg-red-500/10"
                              title="Delete examination"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>

                      {/* ==================================================
                          EXPANDED SUBJECTS
                      ================================================== */}

                      {isExpanded && (

                        <tr className="border-b border-white/[0.06] bg-black/10">

                          <td
                            colSpan={6}
                            className="px-6 py-6"
                          >

                            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">

                              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                  <h3 className="font-semibold text-white">
                                    {exam.name} Subject Structure
                                  </h3>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Each selected subject should contain
                                    exactly 40 questions for the CBT.
                                  </p>

                                </div>

                                <div className="text-xs text-slate-500">
                                  {readySubjects}/
                                  {REQUIRED_SUBJECTS.length} required
                                  subjects ready
                                </div>

                              </div>

                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                {requiredSubjects.map(
                                  (subject) => {

                                    const status =
                                      getSubjectStatus(
                                        subject.count
                                      );

                                    const StatusIcon =
                                      status.icon;

                                    return (
                                      <div
                                        key={subject.name}
                                        className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                                      >

                                        <div className="flex items-start justify-between gap-3">

                                          <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-white">
                                              {subject.name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                              Required: 40
                                            </p>

                                          </div>

                                          <StatusIcon
                                            size={17}
                                            className={
                                              subject.count >=
                                              40
                                                ? "text-emerald-400"
                                                : subject.count >
                                                  0
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                            }
                                          />

                                        </div>

                                        <div className="mt-4 flex items-end justify-between">

                                          <span className="text-xl font-bold text-white">
                                            {subject.count}
                                          </span>

                                          <span
                                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                                          >
                                            {status.label}
                                          </span>

                                        </div>

                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                                          <div
                                            className={`h-full rounded-full transition-all ${
                                              subject.count >=
                                              40
                                                ? "bg-emerald-400"
                                                : subject.count >
                                                  0
                                                ? "bg-yellow-400"
                                                : "bg-red-400"
                                            }`}
                                            style={{
                                              width: `${Math.min(
                                                (subject.count /
                                                  40) *
                                                  100,
                                                100
                                              )}%`,
                                            }}
                                          />

                                        </div>

                                      </div>
                                    );
                                  }
                                )}

                              </div>

                              {/* OTHER SUBJECTS */}

                              {Object.values(
                                exam.subjects || {}
                              ).filter(
                                (subject) =>
                                  !REQUIRED_SUBJECTS.some(
                                    (required) =>
                                      normalize(
                                        required
                                      ) ===
                                      normalize(
                                        subject.name
                                      )
                                  )
                              ).length > 0 && (

                                <div className="mt-5 border-t border-white/[0.06] pt-5">

                                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Other Subjects
                                  </p>

                                  <div className="flex flex-wrap gap-2">

                                    {Object.values(
                                      exam.subjects || {}
                                    )
                                      .filter(
                                        (subject) =>
                                          !REQUIRED_SUBJECTS.some(
                                            (required) =>
                                              normalize(
                                                required
                                              ) ===
                                              normalize(
                                                subject.name
                                              )
                                          )
                                      )
                                      .map(
                                        (subject) => (
                                          <span
                                            key={
                                              subject.name
                                            }
                                            className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300"
                                          >
                                            {
                                              subject.name
                                            }{" "}
                                            <span className="text-slate-600">
                                              ·
                                            </span>{" "}
                                            {
                                              subject.count
                                            }{" "}
                                            questions
                                          </span>
                                        )
                                      )}

                                  </div>

                                </div>
                              )}

                            </div>

                          </td>

                        </tr>
                      )}

                    </React.Fragment>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ========================================================
          REQUIRED STRUCTURE NOTICE
      ========================================================= */}

      <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.04] p-5">

        <div className="flex items-start gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <BookOpen size={19} />
          </div>

          <div>

            <h3 className="font-semibold text-white">
              CBT Question Structure
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              The examination system supports multiple subjects under
              one examination. For the standard four-subject CBT,
              each selected subject must have 40 questions.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">

              {REQUIRED_SUBJECTS.map((subject) => (
                <span
                  key={subject}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs text-slate-300"
                >
                  {subject} · 40
                </span>
              ))}

              <span className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05] px-3 py-2 text-xs font-semibold text-cyan-400">
                Total · 160
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          CREATE EXAM MODAL
      ========================================================= */}

      {showCreateModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#080d1d] p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-white">
                  Create Examination
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create an examination body for your CBT system.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModals}
                className="text-slate-500 transition hover:text-white"
              >
                <XCircle size={21} />
              </button>

            </div>

            <form
              onSubmit={handleCreateExam}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Examination Name
                </label>

                <input
                  required
                  value={examForm.name}
                  onChange={(event) =>
                    setExamForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. WAEC"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/30"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Description
                </label>

                <input
                  value={examForm.title}
                  onChange={(event) =>
                    setExamForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. West African Examinations Council"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/30"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Duration (minutes)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={examForm.duration}
                    onChange={(event) =>
                      setExamForm((current) => ({
                        ...current,
                        duration: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-blue-400/30"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Status
                  </label>

                  <select
                    value={examForm.status}
                    onChange={(event) =>
                      setExamForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 text-sm text-white outline-none focus:border-blue-400/30"
                  >
                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Published">
                      Published
                    </option>
                  </select>

                </div>

              </div>

              <div className="rounded-xl border border-blue-400/10 bg-blue-500/[0.04] p-4 text-xs leading-5 text-slate-400">
                After creating the examination, questions should be
                uploaded with the correct examination and subject
                values. The CBT will then be able to retrieve multiple
                subjects instead of treating an examination as one
                subject.
              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModals}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
                >
                  Create Exam
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ========================================================
          EDIT EXAM MODAL
      ========================================================= */}

      {showEditModal && selectedExam && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#080d1d] p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold text-white">
                  Edit Examination
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update examination settings.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModals}
                className="text-slate-500 transition hover:text-white"
              >
                <XCircle size={21} />
              </button>

            </div>

            <form
              onSubmit={handleEditExam}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Examination Name
                </label>

                <input
                  required
                  value={examForm.name}
                  onChange={(event) =>
                    setExamForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-blue-400/30"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Description
                </label>

                <input
                  value={examForm.title}
                  onChange={(event) =>
                    setExamForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-blue-400/30"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Duration
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={examForm.duration}
                    onChange={(event) =>
                      setExamForm((current) => ({
                        ...current,
                        duration: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-blue-400/30"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Status
                  </label>

                  <select
                    value={examForm.status}
                    onChange={(event) =>
                      setExamForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 text-sm text-white outline-none focus:border-blue-400/30"
                  >

                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Published">
                      Published
                    </option>

                  </select>

                </div>

              </div>

              <div className="rounded-xl border border-yellow-400/10 bg-yellow-400/[0.04] p-4 text-xs leading-5 text-slate-400">
                Editing this examination does not modify or delete
                questions in <code className="text-yellow-400">cbt_questions</code>.
              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModals}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default ExamsAdmin;