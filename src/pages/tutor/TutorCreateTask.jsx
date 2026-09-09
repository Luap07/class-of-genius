import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  File,
  FileImage,
  FileText,
  GraduationCap,
  Info,
  Loader2,
  Paperclip,
  Plus,
  Send,
  Upload,
  Video,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const RAW_API_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const API_BASE_URL = RAW_API_URL.endsWith("/api/academy")
  ? RAW_API_URL
  : `${RAW_API_URL}/api/academy`;

const TUTOR_CLASSES_URL = `${API_BASE_URL}/tutor/classes`;
const CREATE_TASK_URL = `${API_BASE_URL}/tutor/class-activities`;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalize(value) {
  return clean(value).replace(/\s+/g, " ").toLowerCase();
}

function unique(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return unique(value);
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return unique(parsed);
      }
    } catch {
      // Continue with comma separated parsing.
    }

    return unique(
      trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }

  return [];
}

function subjectsMatch(first, second) {
  const a = normalize(first);
  const b = normalize(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const aliases = {
    mathematics: ["general mathematics"],
    "general mathematics": ["mathematics"],

    "english studies": ["english language"],
    "english language": ["english studies"],

    "computer studies": ["computer science", "data processing"],
    "computer science": ["computer studies"],

    "physical and health education": [
      "physical health education",
      "physical education",
    ],

    "christian religious studies": ["crs", "christian religious knowledge"],
    crs: ["christian religious studies", "christian religious knowledge"],

    "islamic religious studies": ["irs", "islamic religious knowledge"],
    irs: ["islamic religious studies", "islamic religious knowledge"],
  };

  return (
    aliases[a]?.some((item) => normalize(item) === b) ||
    aliases[b]?.some((item) => normalize(item) === a) ||
    false
  );
}

function getStorageObject(key) {
  try {
    const value =
      localStorage.getItem(key) || sessionStorage.getItem(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch {
    return null;
  }
}

function findTutorObject(source, depth = 0) {
  if (!source || depth > 5) {
    return null;
  }

  if (typeof source !== "object") {
    return null;
  }

  const reference =
    source.reference ||
    source.tutorReference ||
    source.tutor_reference ||
    source.referenceId ||
    source.tutor_reference_id;

  if (reference) {
    return source;
  }

  const possibleKeys = [
    "tutor",
    "data",
    "user",
    "profile",
    "account",
    "application",
    "tutorData",
    "loggedInTutor",
  ];

  for (const key of possibleKeys) {
    if (source[key] && typeof source[key] === "object") {
      const found = findTutorObject(source[key], depth + 1);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

function getTutorReference(source) {
  const tutor = findTutorObject(source);

  if (!tutor) {
    return "";
  }

  return clean(
    tutor.reference ||
      tutor.tutorReference ||
      tutor.tutor_reference ||
      tutor.referenceId ||
      tutor.tutor_reference_id
  );
}

function getResponseMessage(data, fallback) {
  return (
    clean(data?.message) ||
    clean(data?.error) ||
    clean(data?.data?.message) ||
    fallback
  );
}

function extractTutorData(data) {
  const candidates = [
    data?.tutor,
    data?.data?.tutor,
    data?.data,
    data,
  ];

  let tutor = null;

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    if (
      Array.isArray(candidate.classes) ||
      Array.isArray(candidate.subjects) ||
      typeof candidate.classes === "string" ||
      typeof candidate.subjects === "string"
    ) {
      tutor = candidate;
      break;
    }
  }

  if (!tutor) {
    return {
      classes: [],
      subjects: [],
    };
  }

  return {
    classes: arrayFromValue(tutor.classes),
    subjects: arrayFromValue(tutor.subjects),
  };
}

function getFileIcon(file) {
  if (!file) {
    return File;
  }

  const type = clean(file.type).toLowerCase();

  if (type.startsWith("image/")) {
    return FileImage;
  }

  if (type.startsWith("video/")) {
    return Video;
  }

  if (
    type.includes("pdf") ||
    type.includes("word") ||
    type.includes("document") ||
    type.includes("text")
  ) {
    return FileText;
  }

  return File;
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorCreateTask({
  tutor: tutorProp = null,
  tutorData: tutorDataProp = null,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  /* -------------------------------------------------------
     Tutor
  ------------------------------------------------------- */

  const [tutorReference, setTutorReference] = useState("");

  const [registeredClasses, setRegisteredClasses] = useState([]);
  const [registeredSubjects, setRegisteredSubjects] = useState([]);

  const [loadingTutorData, setLoadingTutorData] = useState(true);

  /* -------------------------------------------------------
     Form
  ------------------------------------------------------- */

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [maxScore, setMaxScore] = useState("100");

  const [files, setFiles] = useState([]);

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /* =======================================================
     GET LOCAL TUTOR
  ======================================================= */

  const getLocalTutor = useCallback(() => {
    const sources = [
      tutorProp,
      tutorDataProp,

      getStorageObject("tutorData"),
      getStorageObject("tutor"),
      getStorageObject("currentTutor"),
      getStorageObject("loggedInTutor"),
      getStorageObject("user"),
      getStorageObject("tutorEnrollment"),
      getStorageObject("enrollment"),
    ];

    for (const source of sources) {
      const tutor = findTutorObject(source);

      if (tutor) {
        return tutor;
      }
    }

    return null;
  }, [tutorProp, tutorDataProp]);

  /* =======================================================
     LOAD REGISTERED CLASSES + SUBJECTS FROM DATABASE
  ======================================================= */

  const loadTutorData = useCallback(async () => {
    setLoadingTutorData(true);
    setErrorMessage("");

    const localTutor = getLocalTutor();

    const reference = getTutorReference(localTutor);

    if (!reference) {
      setRegisteredClasses([]);
      setRegisteredSubjects([]);
      setTutorReference("");

      setErrorMessage(
        "Your tutor reference could not be found. Please log in again."
      );

      setLoadingTutorData(false);
      return;
    }

    setTutorReference(reference);

    /* -----------------------------------------------------
       Local fallback
    ----------------------------------------------------- */

    const localClasses = arrayFromValue(localTutor?.classes);
    const localSubjects = arrayFromValue(localTutor?.subjects);

    try {
      const url = `${TUTOR_CLASSES_URL}?reference=${encodeURIComponent(
        reference
      )}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-tutor-reference": reference,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            data,
            `Unable to load your tutor account (${response.status}).`
          )
        );
      }

      const tutorData = extractTutorData(data);

      const classes = unique([
        ...tutorData.classes,
        ...localClasses,
      ]);

      const subjects = unique([
        ...tutorData.subjects,
        ...localSubjects,
      ]);

      setRegisteredClasses(classes);
      setRegisteredSubjects(subjects);

      if (classes.length > 0) {
        setSelectedClass((current) => {
          if (
            current &&
            classes.some(
              (item) => normalize(item) === normalize(current)
            )
          ) {
            return current;
          }

          return classes[0];
        });
      } else {
        setSelectedClass("");
      }

      if (subjects.length > 0) {
        setSelectedSubject((current) => {
          if (
            current &&
            subjects.some((item) =>
              subjectsMatch(item, current)
            )
          ) {
            return current;
          }

          return subjects[0];
        });
      } else {
        setSelectedSubject("");
      }

      if (!classes.length) {
        setErrorMessage(
          "No registered classes were found in your tutor account."
        );
      } else if (!subjects.length) {
        setErrorMessage(
          "No registered subjects were found in your tutor account."
        );
      }
    } catch (error) {
      /* ---------------------------------------------------
         Backend failed — use local tutor data if available
      --------------------------------------------------- */

      if (localClasses.length || localSubjects.length) {
        setRegisteredClasses(localClasses);
        setRegisteredSubjects(localSubjects);

        setSelectedClass((current) => {
          if (
            current &&
            localClasses.some(
              (item) => normalize(item) === normalize(current)
            )
          ) {
            return current;
          }

          return localClasses[0] || "";
        });

        setSelectedSubject((current) => {
          if (
            current &&
            localSubjects.some((item) =>
              subjectsMatch(item, current)
            )
          ) {
            return current;
          }

          return localSubjects[0] || "";
        });

        setErrorMessage(
          "Your saved tutor information was loaded, but the latest database data could not be fetched."
        );
      } else {
        setRegisteredClasses([]);
        setRegisteredSubjects([]);
        setSelectedClass("");
        setSelectedSubject("");

        setErrorMessage(
          error?.message ||
            "Unable to load your registered classes and subjects."
        );
      }
    } finally {
      setLoadingTutorData(false);
    }
  }, [getLocalTutor]);

  useEffect(() => {
    loadTutorData();
  }, [loadTutorData]);

  /* =======================================================
     FILE HANDLING
  ======================================================= */

  const acceptedFileTypes = useMemo(
    () => [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ],
    []
  );

  const isAllowedFile = useCallback(
    (file) => {
      if (!file) {
        return false;
      }

      const type = clean(file.type).toLowerCase();

      if (acceptedFileTypes.includes(type)) {
        return true;
      }

      const extension = clean(file.name)
        .split(".")
        .pop()
        ?.toLowerCase();

      return [
        "pdf",
        "doc",
        "docx",
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "mp4",
        "webm",
        "mov",
      ].includes(extension);
    },
    [acceptedFileTypes]
  );

  const handleFiles = useCallback(
    (incomingFiles) => {
      setErrorMessage("");
      setSuccessMessage("");

      const incoming = Array.from(incomingFiles || []);

      if (!incoming.length) {
        return;
      }

      const invalid = incoming.find(
        (file) => !isAllowedFile(file)
      );

      if (invalid) {
        setErrorMessage(
          `${invalid.name} is not a supported file. Upload PDF, DOC, DOCX, image, or video files.`
        );
        return;
      }

      const tooLarge = incoming.find(
        (file) => file.size > 100 * 1024 * 1024
      );

      if (tooLarge) {
        setErrorMessage(
          `${tooLarge.name} is larger than the 100 MB limit.`
        );
        return;
      }

      setFiles((current) => {
        const combined = [...current, ...incoming];

        const uniqueFiles = [];

        for (const file of combined) {
          const exists = uniqueFiles.some(
            (existing) =>
              existing.name === file.name &&
              existing.size === file.size &&
              existing.lastModified === file.lastModified
          );

          if (!exists) {
            uniqueFiles.push(file);
          }
        }

        return uniqueFiles.slice(0, 10);
      });
    },
    [isAllowedFile]
  );

  const handleFileInputChange = (event) => {
    handleFiles(event.target.files);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  /* =======================================================
     DRAG AND DROP
  ======================================================= */

  const [draggingFiles, setDraggingFiles] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingFiles(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingFiles(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDraggingFiles(false);

    handleFiles(event.dataTransfer.files);
  };

  /* =======================================================
     CLASS CHANGE
  ======================================================= */

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =======================================================
     SUBJECT CHANGE
  ======================================================= */

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!tutorReference) {
      return "Your tutor reference is missing. Please log in again.";
    }

    if (!registeredClasses.length) {
      return "No registered classes were found in your tutor account.";
    }

    if (!registeredSubjects.length) {
      return "No registered subjects were found in your tutor account.";
    }

    if (!selectedClass) {
      return "Please select a class.";
    }

    const validClass = registeredClasses.some(
      (item) =>
        normalize(item) === normalize(selectedClass)
    );

    if (!validClass) {
      return "The selected class is not registered to your tutor account.";
    }

    if (!selectedSubject) {
      return "Please select a subject.";
    }

    const validSubject = registeredSubjects.some(
      (item) => subjectsMatch(item, selectedSubject)
    );

    if (!validSubject) {
      return "The selected subject is not registered to your tutor account.";
    }

    if (!clean(title)) {
      return "Please enter a task title.";
    }

    if (clean(title).length < 3) {
      return "Task title must contain at least 3 characters.";
    }

    if (!clean(description)) {
      return "Please enter a task description.";
    }

    if (maxScore) {
      const score = Number(maxScore);

      if (!Number.isFinite(score) || score <= 0) {
        return "Maximum score must be greater than 0.";
      }
    }

    return "";
  };

  /* =======================================================
     SUBMIT TASK
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      /*
       * IMPORTANT:
       * There is NO assignment payload here.
       *
       * The tutor's registered classes and subjects come
       * directly from academy_tutor_applications.
       */

      formData.append("reference", tutorReference);
      formData.append("tutor_reference", tutorReference);

      formData.append("class", selectedClass);
      formData.append("grade", selectedClass);

      formData.append("subject", selectedSubject);

      formData.append("activityType", "task");
      formData.append("type", "task");

      formData.append("title", clean(title));
      formData.append(
        "description",
        clean(description)
      );

      if (clean(instructions)) {
        formData.append(
          "instructions",
          clean(instructions)
        );
      }

      if (clean(dueDate)) {
        formData.append("dueDate", dueDate);
      }

      if (clean(maxScore)) {
        formData.append("maxScore", maxScore);
      }

      /*
       * Store simple metadata only.
       * No assignment object.
       */

      formData.append(
        "metadata",
        JSON.stringify({
          source: "tutor",
          activityType: "task",
          hasFiles: files.length > 0,
        })
      );

      /*
       * Upload every selected file.
       */

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        CREATE_TASK_URL,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "x-tutor-reference": tutorReference,
          },
          body: formData,
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            data,
            `Unable to create task (${response.status}).`
          )
        );
      }

      setSuccessMessage(
        "Task created successfully. Students in the selected class and subject can now receive it."
      );

      setTitle("");
      setDescription("");
      setInstructions("");
      setDueDate("");
      setMaxScore("100");
      setFiles([]);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Create task error:", error);

      setErrorMessage(
        error?.message ||
          "Something went wrong while creating the task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleCancel = () => {
    navigate(-1);
  };

  /* =======================================================
     FILE TYPE LABEL
  ======================================================= */

  const getFileTypeLabel = (file) => {
    const type = clean(file?.type).toLowerCase();

    if (type.includes("pdf")) return "PDF";
    if (type.includes("word")) return "DOC";
    if (type.startsWith("image/")) return "IMAGE";
    if (type.startsWith("video/")) return "VIDEO";

    return "FILE";
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ClipboardList
                  size={18}
                  className="text-cyan-400"
                />

                <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                  Create Task
                </h1>
              </div>

              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                Create a task for one of your registered classes
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] px-3 py-2 sm:flex">
            <GraduationCap
              size={16}
              className="text-cyan-400"
            />

            <span className="text-xs font-medium text-slate-300">
              Tutor Portal
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* =================================================
            ALERTS
        ================================================= */}

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-400/10">
              <Info
                size={17}
                className="text-red-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-300">
                Unable to continue
              </p>

              <p className="mt-1 text-sm leading-6 text-red-200/70">
                {errorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-red-300/60 transition hover:text-red-200"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
              <CheckCircle2
                size={17}
                className="text-emerald-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-300">
                Task created
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-200/70">
                {successMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="text-emerald-300/60 transition hover:text-emerald-200"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            REGISTERED TEACHING INFO
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#071426] shadow-2xl shadow-black/20">
          <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen
                    size={18}
                    className="text-cyan-400"
                  />

                  <h2 className="font-bold text-white">
                    Your teaching details
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Only classes and subjects registered to your tutor
                  account are available here.
                </p>
              </div>

              {tutorReference && (
                <div className="hidden rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 sm:block">
                  <span className="text-[10px] uppercase tracking-wider text-slate-600">
                    Reference
                  </span>

                  <p className="mt-0.5 font-mono text-xs text-slate-400">
                    {tutorReference}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            {/* Classes */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Registered classes
                </span>

                <span className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-300">
                  {registeredClasses.length}
                </span>
              </div>

              {loadingTutorData ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2
                    size={15}
                    className="animate-spin text-cyan-400"
                  />
                  Loading classes...
                </div>
              ) : registeredClasses.length ? (
                <div className="flex flex-wrap gap-2">
                  {registeredClasses.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-white/[0.07] bg-[#020617] px-2.5 py-1.5 text-xs font-medium text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-300/70">
                  No classes found.
                </p>
              )}
            </div>

            {/* Subjects */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Registered subjects
                </span>

                <span className="rounded-lg bg-blue-400/10 px-2 py-1 text-xs font-bold text-blue-300">
                  {registeredSubjects.length}
                </span>
              </div>

              {loadingTutorData ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2
                    size={15}
                    className="animate-spin text-cyan-400"
                  />
                  Loading subjects...
                </div>
              ) : registeredSubjects.length ? (
                <div className="flex flex-wrap gap-2">
                  {registeredSubjects.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-white/[0.07] bg-[#020617] px-2.5 py-1.5 text-xs font-medium text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-300/70">
                  No subjects found.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#071426] shadow-2xl shadow-black/20">
            {/* Form heading */}

            <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-white">
                Task information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the class and subject this task is intended
                for.
              </p>
            </div>

            <div className="space-y-7 p-5 sm:p-6">
              {/* =================================================
                  CLASS + SUBJECT
              ================================================= */}

              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white">
                    Class and subject
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    These fields are required.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Class */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Class
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <GraduationCap
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <select
                        value={selectedClass}
                        onChange={handleClassChange}
                        disabled={
                          loadingTutorData ||
                          !registeredClasses.length
                        }
                        className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#020617] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          {loadingTutorData
                            ? "Loading classes..."
                            : "Select a class"}
                        </option>

                        {registeredClasses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Subject */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Subject
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <BookOpen
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <select
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                        disabled={
                          loadingTutorData ||
                          !registeredSubjects.length
                        }
                        className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#020617] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          {loadingTutorData
                            ? "Loading subjects..."
                            : "Select a subject"}
                        </option>

                        {registeredSubjects.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  TITLE
              ================================================= */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Task title
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Quadratic Equations Practice"
                  maxLength={200}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-[11px] text-slate-700">
                    {title.length}/200
                  </span>
                </div>
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Description
                  <span className="ml-1 text-red-400">
                    *
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Explain what students need to do..."
                  rows={5}
                  maxLength={5000}
                  className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-[11px] text-slate-700">
                    {description.length}/5000
                  </span>
                </div>
              </div>

              {/* =================================================
                  INSTRUCTIONS
              ================================================= */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Instructions
                  <span className="ml-2 text-xs font-normal text-slate-600">
                    Optional
                  </span>
                </label>

                <textarea
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(event.target.value)
                  }
                  placeholder="Add any instructions, submission requirements, or guidance..."
                  rows={4}
                  maxLength={5000}
                  className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />
              </div>

              {/* =================================================
                  DUE DATE + SCORE
              ================================================= */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Due date
                    <span className="ml-2 text-xs font-normal text-slate-600">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(event) =>
                        setDueDate(event.target.value)
                      }
                      className="w-full rounded-xl border border-white/[0.08] bg-[#020617] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Maximum score
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={maxScore}
                    onChange={(event) =>
                      setMaxScore(event.target.value)
                    }
                    placeholder="100"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                  />
                </div>
              </div>

              {/* =================================================
                  FILE UPLOAD
              ================================================= */}

              <div>
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-slate-300">
                    Attach materials
                    <span className="ml-2 text-xs font-normal text-slate-600">
                      Optional
                    </span>
                  </label>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Upload PDF, DOC, DOCX, image, or video files.
                    Maximum 10 files, up to 100 MB each.
                  </p>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-2xl border border-dashed p-6 text-center transition ${
                    draggingFiles
                      ? "border-cyan-400/60 bg-cyan-400/[0.06]"
                      : "border-white/[0.10] bg-[#020617]/60 hover:border-cyan-400/30 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06]">
                    <Upload
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-slate-300">
                    Drop your files here
                  </h4>

                  <p className="mt-1 text-xs text-slate-600">
                    or select files from your device
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                  >
                    <Plus size={15} />
                    Choose files
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>

                {/* Files */}

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => {
                      const Icon = getFileIcon(file);

                      return (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#020617] p-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                            <Icon
                              size={18}
                              className="text-cyan-400"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-300">
                              {file.name}
                            </p>

                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-600">
                              <span>
                                {getFileTypeLabel(file)}
                              </span>

                              <span>•</span>

                              <span>
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFile(index)
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-400/10 hover:text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                    <Info
                      size={16}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-cyan-300">
                      Task delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      This task will be associated with{" "}
                      <span className="font-semibold text-slate-300">
                        {selectedClass || "the selected class"}
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold text-slate-300">
                        {selectedSubject || "the selected subject"}
                      </span>
                      . Students matching that class and subject
                      can receive the task.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] bg-[#020617]/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingTutorData ||
                  !registeredClasses.length ||
                  !registeredSubjects.length ||
                  !selectedClass ||
                  !selectedSubject
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-[#020617] shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating task...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Create task
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}