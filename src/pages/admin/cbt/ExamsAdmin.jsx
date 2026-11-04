
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  FileText,
  Layers3,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock3,
  XCircle,
  Upload,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

const SCHOOL_EXAM = "School Examination";

const SCHOOL_CLASSES = [
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

const REQUIRED_QUESTIONS = 40;

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const SCHOOL_EXAMS_API = `${API_BASE_URL}/api/admin/school-exams`;

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getAdminToken = () => {
  const tokenKeys = [
    "scholiqen_auth_token",
    "scholiqen_token",
    "admin_token",
    "access_token",
    "token",
  ];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);

    if (value) return value;
  }

  return "";
};

const getHeaders = () => {
  const token = getAdminToken();

  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const getErrorMessage = (data, fallback) =>
  data?.message ||
  data?.error ||
  data?.details ||
  fallback;

const requestJson = async (url) => {
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      getErrorMessage(
        data,
        `Unable to load school examinations (${response.status}).`
      )
    );
  }

  return data;
};

const extractExams = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.exams)) {
    return data.exams;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (data?.exam && typeof data.exam === "object") {
    return [data.exam];
  }

  return [];
};

const extractExam = (data) => {
  if (data?.exam && typeof data.exam === "object") {
    return data.exam;
  }

  if (data?.data && !Array.isArray(data.data)) {
    return data.data;
  }

  return data;
};

const getQuestionClass = (question) =>
  question?.class_name ||
  question?.className ||
  question?.class ||
  question?.student_class ||
  question?.studentClass ||
  question?.grade ||
  question?.level ||
  "";

const getQuestionSubject = (question) =>
  question?.subject ||
  question?.subject_name ||
  question?.subjectName ||
  "";

const getClassOrder = (className) =>
  SCHOOL_CLASSES.findIndex(
    (item) => normalize(item) === normalize(className)
  );

const formatNumber = (value) =>
  Number(value || 0).toLocaleString();

const getSubjectStatus = (count) => {
  if (count >= REQUIRED_QUESTIONS) {
    return {
      label: "Ready",
      icon: CheckCircle2,
      color: "text-emerald-400",
      badge:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
      bar: "bg-emerald-400",
    };
  }

  if (count > 0) {
    return {
      label: `${count}/${REQUIRED_QUESTIONS}`,
      icon: Clock3,
      color: "text-yellow-400",
      badge:
        "border-yellow-400/20 bg-yellow-400/10 text-yellow-400",
      bar: "bg-yellow-400",
    };
  }

  return {
    label: "No questions",
    icon: XCircle,
    color: "text-red-400",
    badge:
      "border-red-400/20 bg-red-400/10 text-red-400",
    bar: "bg-red-400",
  };
};

/*
|--------------------------------------------------------------------------
| LOAD SAVED SCHOOL EXAMINATIONS
|--------------------------------------------------------------------------
|
| This uses:
| GET /api/admin/school-exams
|
| Questions belong to school_exam_questions.
| Class and subject belong to school_exams.
|
*/

const fetchSchoolExamQuestions = async () => {
  const response = await requestJson(SCHOOL_EXAMS_API);

  const exams = extractExams(response);

  if (!exams.length) {
    return [];
  }

  const results = await Promise.all(
    exams.map(async (exam) => {
      let examQuestions = Array.isArray(exam.questions)
        ? exam.questions
        : [];

      const expectedCount = Number(
        exam.question_count ??
        exam.questionCount ??
        exam.total_questions ??
        exam.totalQuestions ??
        0
      );

      /*
       * If the list endpoint did not return the actual questions,
       * retrieve them using the individual exam endpoint.
       */
      if (
        examQuestions.length === 0 &&
        expectedCount > 0 &&
        exam.id
      ) {
        const detailResponse = await requestJson(
          `${SCHOOL_EXAMS_API}/${encodeURIComponent(exam.id)}`
        );

        const detailedExam = extractExam(detailResponse);

        examQuestions = Array.isArray(detailedExam?.questions)
          ? detailedExam.questions
          : [];
      }

      /*
       * Attach the parent exam's class and subject to every
       * question because those fields are stored on school_exams.
       */
      return examQuestions.map((question) => ({
        ...question,

        class_name:
          getQuestionClass(question) ||
          exam.class_name ||
          exam.className ||
          exam.class ||
          "",

        subject:
          getQuestionSubject(question) ||
          exam.subject ||
          exam.subject_name ||
          "",

        exam: SCHOOL_EXAM,

        exam_id: question.exam_id || exam.id,

        exam_title: exam.title || SCHOOL_EXAM,

        exam_status: exam.status || "draft",
      }));
    })
  );

  return results.flat();
};

const ExamsAdmin = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedClass, setSelectedClass] =
    useState("All Classes");

  const [expandedClass, setExpandedClass] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH QUESTIONS
  |--------------------------------------------------------------------------
  */

  const fetchQuestions = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setLoadError("");

      const savedQuestions = await fetchSchoolExamQuestions();

      setQuestions(savedQuestions);

      console.log(
        "School Examination questions loaded:",
        savedQuestions
      );
    } catch (error) {
      console.error(
        "School examination questions error:",
        error
      );

      setLoadError(
        error?.message ||
          "Unable to load school examination questions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /*
  |--------------------------------------------------------------------------
  | GROUP QUESTIONS BY CLASS AND SUBJECT
  |--------------------------------------------------------------------------
  */

  const schoolData = useMemo(() => {
    const classes = SCHOOL_CLASSES.map((className) => ({
      name: className,
      key: normalize(className),
      subjects: {},
      totalQuestions: 0,
    }));

    const classMap = new Map(
      classes.map((item) => [item.key, item])
    );

    questions.forEach((question) => {
      const className = getQuestionClass(question);
      const subjectName = getQuestionSubject(question);

      if (!className || !subjectName) {
        return;
      }

      const classKey = normalize(className);

      let classItem = classMap.get(classKey);

      if (!classItem) {
        classItem = {
          name: String(className).trim(),
          key: classKey,
          subjects: {},
          totalQuestions: 0,
        };

        classMap.set(classKey, classItem);
        classes.push(classItem);
      }

      const subjectKey = normalize(subjectName);

      if (!classItem.subjects[subjectKey]) {
        classItem.subjects[subjectKey] = {
          name: String(subjectName).trim(),
          count: 0,
        };
      }

      classItem.subjects[subjectKey].count += 1;
      classItem.totalQuestions += 1;
    });

    return classes.sort((a, b) => {
      const first = getClassOrder(a.name);
      const second = getClassOrder(b.name);

      if (first !== -1 && second !== -1) {
        return first - second;
      }

      if (first !== -1) return -1;
      if (second !== -1) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [questions]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const statistics = useMemo(() => {
    const subjects = new Set();

    let completeSubjects = 0;
    let unassigned = 0;

    schoolData.forEach((classItem) => {
      Object.values(classItem.subjects).forEach((subject) => {
        subjects.add(subject.name);

        if (subject.count >= REQUIRED_QUESTIONS) {
          completeSubjects += 1;
        }
      });
    });

    questions.forEach((question) => {
      if (
        !getQuestionClass(question) ||
        !getQuestionSubject(question)
      ) {
        unassigned += 1;
      }
    });

    const activeClasses = schoolData.filter(
      (item) => item.totalQuestions > 0
    ).length;

    return {
      classes: activeClasses,
      subjects: subjects.size,
      questions: questions.length,
      completeSubjects,
      unassigned,
    };
  }, [questions, schoolData]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH AND FILTER
  |--------------------------------------------------------------------------
  */

  const filteredClasses = useMemo(() => {
    const term = normalize(search);

    return schoolData.filter((classItem) => {
      if (
        selectedClass !== "All Classes" &&
        normalize(classItem.name) !== normalize(selectedClass)
      ) {
        return false;
      }

      if (!term) return true;

      if (normalize(classItem.name).includes(term)) {
        return true;
      }

      return Object.values(classItem.subjects).some(
        (subject) =>
          normalize(subject.name).includes(term)
      );
    });
  }, [schoolData, search, selectedClass]);

  const toggleClass = (className) => {
    setExpandedClass((current) =>
      current === className ? null : className
    );
  };

  /*
  |--------------------------------------------------------------------------
  | QUESTION UPLOAD NAVIGATION
  |--------------------------------------------------------------------------
  */

  const openQuestionUploader = (className, subjectName) => {
    const params = new URLSearchParams({
      exam: SCHOOL_EXAM,
      class: className,
      subject: subjectName,
    });

    navigate(
      `/admin/cbt/exams/create?${params.toString()}`
    );
  };

  const openClassUploader = (className) => {
    const params = new URLSearchParams({
      exam: SCHOOL_EXAM,
      class: className,
    });

    navigate(
      `/admin/cbt/exams/create?${params.toString()}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-full space-y-6 text-white">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
            <GraduationCap size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              School Examination
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage your school's examination questions by class and subject.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchQuestions(true)}
          disabled={refreshing}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh Questions
        </button>
      </div>

      {/* EXAMINATION IDENTITY */}

      <div className="rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.025] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Internal Examination
            </div>

            <h2 className="text-xl font-bold text-white">
              {SCHOOL_EXAM}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Upload and manage examination questions prepared by your
              school. Every question belongs to a specific class and subject.
              External examination question banks are managed separately.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-blue-300">
            <BookOpen size={30} />
          </div>
        </div>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={Layers3}
          label="Active Classes"
          value={statistics.classes}
          color="blue"
        />

        <StatCard
          icon={BookOpen}
          label="Active Subjects"
          value={statistics.subjects}
          color="purple"
        />

        <StatCard
          icon={FileText}
          label="Total Questions"
          value={
            loading
              ? "..."
              : formatNumber(statistics.questions)
          }
          color="cyan"
        />

        <StatCard
          icon={CheckCircle2}
          label="Ready Subject Banks"
          value={statistics.completeSubjects}
          color="emerald"
        />
      </div>

      {/* FILTERS */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search class or subject..."
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/30"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(event) =>
            setSelectedClass(event.target.value)
          }
          className="h-11 rounded-xl border border-white/10 bg-[#0b1020] px-4 text-sm text-white outline-none focus:border-blue-400/30"
        >
          <option value="All Classes">All Classes</option>

          {SCHOOL_CLASSES.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </div>

      {/* ERROR */}

      {loadError && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-red-300">
              Unable to load school examination questions
            </p>

            <p className="mt-1 text-xs text-red-300/80">
              {loadError}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchQuestions()}
            className="text-sm font-semibold text-red-300 hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* CLASS LIST */}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-16 text-center text-sm text-slate-500">
            Loading school examination data...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
              <GraduationCap size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-white">
              No matching classes
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or select a different class.
            </p>
          </div>
        ) : (
          filteredClasses.map((classItem) => {
            const subjects = Object.values(
              classItem.subjects
            ).sort((a, b) =>
              a.name.localeCompare(b.name)
            );

            const isExpanded =
              expandedClass === classItem.name;

            const readySubjects = subjects.filter(
              (subject) =>
                subject.count >= REQUIRED_QUESTIONS
            ).length;

            return (
              <div
                key={classItem.key}
                className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
              >
                {/* CLASS HEADER */}

                <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleClass(classItem.name)
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 transition hover:border-blue-400/20 hover:text-blue-400"
                    >
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <GraduationCap size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-white">
                        {classItem.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {subjects.length} subject
                        {subjects.length === 1 ? "" : "s"}
                        {" · "}
                        {formatNumber(classItem.totalQuestions)}{" "}
                        questions
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300">
                      {readySubjects} ready
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        openClassUploader(classItem.name)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      <Upload size={16} />
                      Upload Questions
                    </button>
                  </div>
                </div>

                {/* SUBJECTS */}

                {isExpanded && (
                  <div className="border-t border-white/[0.07] bg-black/10 p-5">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          {classItem.name} Subjects
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Select a subject to upload questions specifically
                          for this class.
                        </p>
                      </div>

                      <span className="text-xs text-slate-500">
                        Target: {REQUIRED_QUESTIONS} questions per subject
                      </span>
                    </div>

                    {subjects.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                        <BookOpen
                          size={24}
                          className="mx-auto text-slate-600"
                        />

                        <p className="mt-3 text-sm font-medium text-white">
                          No subjects uploaded yet
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Start by uploading questions for this class.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            openClassUploader(classItem.name)
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          <Upload size={15} />
                          Upload First Questions
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {subjects.map((subject) => {
                          const status = getSubjectStatus(
                            subject.count
                          );

                          const StatusIcon = status.icon;

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
                                    Target: {REQUIRED_QUESTIONS} questions
                                  </p>
                                </div>

                                <StatusIcon
                                  size={17}
                                  className={status.color}
                                />
                              </div>

                              <div className="mt-5 flex items-end justify-between gap-3">
                                <span className="text-2xl font-bold text-white">
                                  {formatNumber(subject.count)}
                                </span>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.badge}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                  className={`h-full rounded-full transition-all ${status.bar}`}
                                  style={{
                                    width: `${Math.min(
                                      (subject.count /
                                        REQUIRED_QUESTIONS) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openQuestionUploader(
                                    classItem.name,
                                    subject.name
                                  )
                                }
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/15 bg-blue-500/[0.06] px-3 py-2.5 text-xs font-semibold text-blue-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
                              >
                                <Upload size={14} />
                                Upload {subject.name} Questions
                                <ArrowUpRight size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* UNASSIGNED QUESTIONS */}

      {!loading && statistics.unassigned > 0 && (
        <div className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.04] p-4">
          <div className="flex items-start gap-3">
            <XCircle
              size={19}
              className="mt-0.5 shrink-0 text-yellow-400"
            />

            <div>
              <h3 className="text-sm font-semibold text-yellow-300">
                Questions missing class or subject
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {statistics.unassigned} school examination question(s) do not
                have both a class and subject assigned.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STRUCTURE NOTICE */}

      <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.04] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <BookOpen size={19} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              School CBT Question Structure
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Each question belongs to School Examination, a class and
              a subject. The student CBT should use the student's class
              and selected subject to retrieve the correct question bank.
              External examination question banks remain separate.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {SCHOOL_CLASSES.map((className) => (
                <span
                  key={className}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs text-slate-300"
                >
                  {className}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
          colors[color] || colors.blue
        }`}
      >
        <Icon size={18} />
      </div>

      <p className="text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
};

export default ExamsAdmin;
