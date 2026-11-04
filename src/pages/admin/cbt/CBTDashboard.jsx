
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  HelpCircle,
  FileText,
  BarChart3,
  Loader2,
  Activity,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
} from "lucide-react";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/$/, "");

const DASHBOARD_URL = `${API_URL}/api/admin/cbt/dashboard`;
const SUBJECTS_URL = `${API_URL}/api/admin/cbt/subjects`;

const EMPTY_STATS = {
  subjects: 0,
  questions: 0,
  exams: 0,
  attempts: 0,
};

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

const getAdminToken = () => {
  const tokenKeys = [
    "scholiqen_auth_token",
    "token",
    "access_token",
    "authToken",
    "admin_token",
  ];

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);

    if (token && token !== "undefined" && token !== "null") {
      return token;
    }
  }

  return null;
};

const getAdminHeaders = (includeJson = false) => {
  const token = getAdminToken();

  if (!token) {
    throw new Error(
      "Admin session not found. Please log out and log in again."
    );
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(includeJson
      ? { "Content-Type": "application/json" }
      : {}),
  };
};

// ============================================================
// HELPERS
// ============================================================

const normalize = (value) =>
  String(value ?? "")
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getCanonicalSubject = (subject) => {
  const value = normalize(subject);

  const aliases = {
    agriculture: "Agricultural Science",
    "agricultural science": "Agricultural Science",
    english: "English",
    "english language": "English",
    mathematics: "Mathematics",
    maths: "Mathematics",
    math: "Mathematics",
    physics: "Physics",
    chemistry: "Chemistry",
    biology: "Biology",
    economics: "Economics",
    government: "Government",
    literature: "Literature in English",
    "literature in english": "Literature in English",
    "civic education": "Civic Education",
    "financial accounting": "Financial Accounting",
    accounting: "Financial Accounting",
    commerce: "Commerce",
    geography: "Geography",
    "computer studies": "Computer Studies",
    "computer science": "Computer Science",
    "information technology": "Information Technology",
    "information technology it": "Information Technology",
    "data processing": "Data Processing",
    "home economics": "Home Economics",
    "technical drawing": "Technical Drawing",
    "christian religious studies": "Christian Religious Studies",
    crs: "Christian Religious Studies",
    "islamic religious studies": "Islamic Religious Studies",
    irs: "Islamic Religious Studies",
    "social studies": "Social Studies",
    "further mathematics": "Further Mathematics",
    "yoruba language": "Yoruba",
    yoruba: "Yoruba",
    "igbo language": "Igbo",
    igbo: "Igbo",
    "hausa language": "Hausa",
    hausa: "Hausa",
  };

  if (aliases[value]) return aliases[value];

  return String(subject ?? "")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const readResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        data.message ||
        "Your admin session has expired. Please log in again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        data.message ||
        "Your account does not have administrator access."
      );
    }

    if (response.status === 404) {
      throw new Error(
        data.message ||
        "CBT API route not found. Check that the CBT admin routes are mounted in server.js."
      );
    }

    throw new Error(
      data.message ||
      data.error ||
      `Request failed (${response.status})`
    );
  }

  return data;
};

// ============================================================
// CBT DASHBOARD
// ============================================================

const CBTDashboard = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [subjectList, setSubjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const [deletingSubject, setDeletingSubject] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    subject: null,
    questionCount: 0,
    rawSubjects: [],
  });

  // ==========================================================
  // FETCH CBT DASHBOARD
  // ==========================================================

  const fetchCBTStats = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(DASHBOARD_URL, {
        method: "GET",
        credentials: "include",
        headers: getAdminHeaders(),
      });

      const data = await readResponse(response);

      const rows = Array.isArray(data.questionRows)
        ? data.questionRows
        : [];

      const subjectMap = new Map();
      const examSet = new Set();

      rows.forEach((row) => {
        const rawSubject = String(row.subject ?? "").trim();
        const rawExam = String(row.exam ?? "").trim();

        const count = Number(
          row.questionCount ?? row.count ?? 0
        );

        if (rawExam) {
          examSet.add(normalize(rawExam));
        }

        if (!rawSubject) return;

        const canonical = getCanonicalSubject(rawSubject);

        if (!subjectMap.has(canonical)) {
          subjectMap.set(canonical, {
            name: canonical,
            questionCount: 0,
            rawSubjects: new Set(),
          });
        }

        const item = subjectMap.get(canonical);

        item.questionCount += count;
        item.rawSubjects.add(rawSubject);
      });

      const subjects = Array.from(subjectMap.values())
        .map((item) => ({
          ...item,
          rawSubjects: Array.from(item.rawSubjects),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      const questionCount = Number(
        data.questionCount ?? 0
      );

      const attemptsCount = Number(
        data.attemptsCount ?? 0
      );

      setStats({
        subjects: subjects.length,
        questions: questionCount,
        exams: Number(data.examCount ?? examSet.size),
        attempts: attemptsCount,
      });

      setSubjectList(subjects);
      setLastUpdated(new Date());
      setLive(true);
    } catch (err) {
      console.error("CBT dashboard error:", err);

      setLive(false);
      setError(
        err.message || "Unable to connect to the CBT API."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // AUTOMATIC REFRESH
  // ==========================================================

  useEffect(() => {
    fetchCBTStats();

    const interval = setInterval(() => {
      fetchCBTStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCBTStats]);

  // ==========================================================
  // DELETE MODAL
  // ==========================================================

  const openDeleteModal = (subject) => {
    setDeleteModal({
      open: true,
      subject: subject.name,
      questionCount: subject.questionCount,
      rawSubjects: subject.rawSubjects,
    });
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteModal({
      open: false,
      subject: null,
      questionCount: 0,
      rawSubjects: [],
    });
  };

  // ==========================================================
  // DELETE SUBJECT
  // ==========================================================

  const deleteSubject = async () => {
    if (!deleteModal.subject) return;

    try {
      setDeleteLoading(true);
      setDeletingSubject(deleteModal.subject);
      setError("");

      const response = await fetch(SUBJECTS_URL, {
        method: "DELETE",
        credentials: "include",
        headers: getAdminHeaders(true),
        body: JSON.stringify({
          subject: deleteModal.subject,
          rawSubjects: deleteModal.rawSubjects,
        }),
      });

      await readResponse(response);

      setDeleteModal({
        open: false,
        subject: null,
        questionCount: 0,
        rawSubjects: [],
      });

      await fetchCBTStats(true);
    } catch (err) {
      console.error("Delete subject error:", err);

      alert(
        err.message || "Unable to delete this subject."
      );
    } finally {
      setDeleteLoading(false);
      setDeletingSubject(null);
    }
  };

  // ==========================================================
  // FORMATTED TIME
  // ==========================================================

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statsData = [
    {
      title: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
      description: "Unique CBT subjects",
    },
    {
      title: "Questions",
      value: stats.questions,
      icon: HelpCircle,
      description: "Total questions in question bank",
    },
    {
      title: "Exams",
      value: stats.exams,
      icon: FileText,
      description: "Unique exams in question bank",
    },
    {
      title: "Attempts",
      value: stats.attempts,
      icon: BarChart3,
      description: "Recorded CBT attempts",
    },
  ];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <div className="space-y-8">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                CBT Dashboard
              </h1>

              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                  live
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    live ? "bg-emerald-500" : "bg-slate-500"
                  }`}
                />

                <span className="text-xs font-medium">
                  {live ? "CONNECTED" : "OFFLINE"}
                </span>
              </div>
            </div>

            <p className="text-slate-400 mt-1">
              Manage computer based tests, questions and examinations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity size={14} />
                Updated {formattedTime}
              </div>
            )}

            <button
              type="button"
              onClick={() => fetchCBTStats(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={18}
                className="shrink-0 mt-0.5"
              />

              <div>
                <p className="font-semibold">
                  CBT dashboard connection error
                </p>

                <p className="mt-1">{error}</p>

                <p className="mt-2 text-xs text-red-300/70">
                  Check that your Express backend is running,
                  the CBT admin routes are mounted, and your
                  admin session is valid.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAT CARDS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statsData.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-950/20"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <Icon size={25} />
                </div>

                <h2 className="text-slate-400">
                  {item.title}
                </h2>

                <p className="text-3xl font-bold mt-2 text-white">
                  {loading ? (
                    <Loader2
                      size={25}
                      className="animate-spin text-blue-400"
                    />
                  ) : (
                    item.value.toLocaleString()
                  )}
                </p>

                <p className="text-xs text-slate-600 mt-2">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CBT SUBJECTS */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                CBT Subjects
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Manage subjects in your CBT question bank.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold">
              {stats.subjects}{" "}
              {stats.subjects === 1 ? "Subject" : "Subjects"}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              Loading subjects...
            </div>
          ) : subjectList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subjectList.map((subject) => {
                const isDeleting =
                  deletingSubject === subject.name;

                return (
                  <div
                    key={subject.name}
                    className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/20"
                  >
                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                          <BookOpen size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {subject.name}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            CBT Subject
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {subject.questionCount.toLocaleString()}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {subject.questionCount === 1
                            ? "Question"
                            : "Questions"}
                        </p>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400">
                        Question Bank
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(subject)}
                      disabled={deleteLoading}
                      className="relative w-full mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting && deleteLoading ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      {isDeleting && deleteLoading
                        ? "Deleting..."
                        : "Delete Subject"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-8 text-center">
              <BookOpen
                size={30}
                className="mx-auto text-slate-600 mb-3"
              />

              <p className="text-slate-400 font-medium">
                No CBT subjects found
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Add questions with a subject in the cbt_questions table.
              </p>
            </div>
          )}
        </div>

        {/* QUESTION BANK */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Question Bank
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Total number of questions currently stored in the CBT
                question bank.
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-blue-400">
                {loading ? (
                  <Loader2
                    size={25}
                    className="animate-spin inline-block"
                  />
                ) : (
                  stats.questions.toLocaleString()
                )}
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Total Questions
              </p>
            </div>
          </div>
        </div>

        {/* RECENT CBT ACTIVITY */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Recent CBT Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Activity updates automatically.
              </p>
            </div>

            <div
              className={`flex items-center gap-2 text-sm ${
                live ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  live ? "bg-emerald-500" : "bg-slate-500"
                }`}
              />

              {live ? "Connected" : "Offline"}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              Loading activity...
            </div>
          ) : stats.attempts > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <BarChart3 size={21} />
              </div>

              <div>
                <p className="text-white font-medium">
                  {stats.attempts.toLocaleString()} CBT attempt
                  {stats.attempts === 1 ? "" : "s"}
                </p>

                <p className="text-sm text-slate-500">
                  Recorded by users
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center">
                <BarChart3 size={21} />
              </div>

              <div>
                <p className="text-white font-medium">
                  No CBT attempts yet
                </p>

                <p className="text-sm text-slate-500">
                  User attempts will appear here automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DELETE SUBJECT MODAL */}

      {deleteModal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Delete Subject
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-300 text-sm leading-6">
                Are you sure you want to delete all questions under{" "}
                <span className="font-bold text-white">
                  {deleteModal.subject}
                </span>
                ?
              </p>

              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Questions to delete
                  </span>

                  <span className="text-lg font-bold text-red-400">
                    {deleteModal.questionCount.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-4">
                Agriculture and Agricultural Science are treated as the
                same subject and will be deleted together.
              </p>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteSubject}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CBTDashboard;
