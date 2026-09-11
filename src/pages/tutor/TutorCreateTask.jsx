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
  Plus,
  Send,
  Upload,
  Video,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

function buildApiBaseUrl() {
  const raw = String(
    import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:5000"
  )
    .trim()
    .replace(/\/+$/, "");

  if (raw.endsWith("/api/academy")) {
    return raw;
  }

  if (raw.endsWith("/api")) {
    return `${raw}/academy`;
  }

  return `${raw}/api/academy`;
}

const API_BASE_URL = buildApiBaseUrl();

const TUTOR_CLASSES_URL =
  `${API_BASE_URL}/tutor/classes`;

const CREATE_TASK_URL =
  `${API_BASE_URL}/tutor/class-activities`;

/* =========================================================
   STORAGE
========================================================= */

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

const ACADEMY_TOKEN_KEY =
  "scholiqen_academy_token";

/* =========================================================
   FILE LIMITS
========================================================= */

const MAX_FILES = 10;

const MAX_FILE_SIZE =
  250 * 1024 * 1024;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

function normalize(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function unique(values = []) {
  const result = [];

  for (const value of values) {
    const cleaned = clean(value);

    if (!cleaned) {
      continue;
    }

    if (
      !result.some(
        (item) =>
          normalize(item) ===
          normalize(cleaned)
      )
    ) {
      result.push(cleaned);
    }
  }

  return result;
}

/* =========================================================
   SUBJECT ALIASES
========================================================= */

const SUBJECT_ALIASES = {
  mathematics: [
    "math",
    "maths",
    "general mathematics",
    "general maths",
  ],

  maths: [
    "mathematics",
    "math",
    "general mathematics",
    "general maths",
  ],

  math: [
    "mathematics",
    "maths",
    "general mathematics",
    "general maths",
  ],

  "general mathematics": [
    "mathematics",
    "math",
    "maths",
    "general maths",
  ],

  "general maths": [
    "mathematics",
    "math",
    "maths",
    "general mathematics",
  ],

  english: [
    "english language",
    "english studies",
    "use of english",
  ],

  "english language": [
    "english",
    "english studies",
    "use of english",
  ],

  "english studies": [
    "english",
    "english language",
    "use of english",
  ],

  "use of english": [
    "english",
    "english language",
    "english studies",
  ],

  "computer studies": [
    "computer science",
    "computer",
    "data processing",
    "ict",
    "information technology",
  ],

  "computer science": [
    "computer studies",
    "computer",
    "data processing",
    "ict",
    "information technology",
  ],

  "data processing": [
    "computer studies",
    "computer science",
    "computer",
    "ict",
    "information technology",
  ],

  computer: [
    "computer studies",
    "computer science",
    "data processing",
    "ict",
    "information technology",
  ],

  ict: [
    "computer studies",
    "computer science",
    "computer",
    "data processing",
    "information technology",
  ],

  "information technology": [
    "computer studies",
    "computer science",
    "computer",
    "data processing",
    "ict",
  ],

  "physical & health education": [
    "physical and health education",
    "physical health education",
    "physical education",
    "phe",
  ],

  "physical and health education": [
    "physical & health education",
    "physical health education",
    "physical education",
    "phe",
  ],

  "physical health education": [
    "physical & health education",
    "physical and health education",
    "physical education",
    "phe",
  ],

  "physical education": [
    "physical & health education",
    "physical and health education",
    "physical health education",
    "phe",
  ],

  phe: [
    "physical & health education",
    "physical and health education",
    "physical health education",
    "physical education",
  ],

  "christian religious studies": [
    "crs",
    "christian religious knowledge",
    "crk",
  ],

  crs: [
    "christian religious studies",
    "christian religious knowledge",
    "crk",
  ],

  "christian religious knowledge": [
    "christian religious studies",
    "crs",
    "crk",
  ],

  crk: [
    "christian religious studies",
    "christian religious knowledge",
    "crs",
  ],

  "islamic religious studies": [
    "irs",
    "islamic religious knowledge",
    "irk",
  ],

  irs: [
    "islamic religious studies",
    "islamic religious knowledge",
    "irk",
  ],

  "islamic religious knowledge": [
    "islamic religious studies",
    "irs",
    "irk",
  ],

  irk: [
    "islamic religious studies",
    "islamic religious knowledge",
    "irs",
  ],

  "further mathematics": [
    "further maths",
    "further math",
  ],

  "further maths": [
    "further mathematics",
    "further math",
  ],

  "further math": [
    "further mathematics",
    "further maths",
  ],

  "agricultural science": [
    "agriculture",
    "agric science",
  ],

  agriculture: [
    "agricultural science",
    "agric science",
  ],

  "agric science": [
    "agricultural science",
    "agriculture",
  ],

  "literature in english": [
    "literature",
    "english literature",
  ],

  literature: [
    "literature in english",
    "english literature",
  ],

  "english literature": [
    "literature in english",
    "literature",
  ],
};

function subjectsMatch(first, second) {
  const a = normalize(first);
  const b = normalize(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  return Boolean(
    SUBJECT_ALIASES[a]?.some(
      (item) => normalize(item) === b
    ) ||
      SUBJECT_ALIASES[b]?.some(
        (item) => normalize(item) === a
      )
  );
}

/* =========================================================
   STORAGE HELPERS
========================================================= */

function getStorageObject(key) {
  try {
    const value =
      localStorage.getItem(key);

    if (value) {
      return JSON.parse(value);
    }
  } catch {
    // Continue.
  }

  try {
    const value =
      sessionStorage.getItem(key);

    if (value) {
      return JSON.parse(value);
    }
  } catch {
    // Continue.
  }

  return null;
}

function getStorageValue(key) {
  try {
    const value =
      localStorage.getItem(key);

    if (value) {
      return clean(value);
    }
  } catch {
    // Continue.
  }

  try {
    const value =
      sessionStorage.getItem(key);

    if (value) {
      return clean(value);
    }
  } catch {
    // Continue.
  }

  return "";
}

/* =========================================================
   TOKEN
========================================================= */

function getAcademyToken() {
  const direct =
    getStorageValue(
      ACADEMY_TOKEN_KEY
    );

  if (direct) {
    return direct;
  }

  const sources = [
    getStorageObject(
      ACADEMY_USER_KEY
    ),
    getStorageObject("academyUser"),
    getStorageObject("tutor"),
    getStorageObject("tutorData"),
    getStorageObject("currentTutor"),
    getStorageObject("loggedInTutor"),
    getStorageObject("currentUser"),
    getStorageObject("user"),
    getStorageObject("profile"),
  ];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    const token =
      source.token ||
      source.access_token ||
      source.accessToken ||
      source.academyToken ||
      source.authToken ||
      source?.data?.token ||
      source?.data?.access_token ||
      source?.data?.accessToken ||
      source?.data?.academyToken ||
      source?.data?.authToken;

    if (clean(token)) {
      return clean(token);
    }
  }

  return "";
}

/* =========================================================
   FIND TUTOR
========================================================= */

function findTutorObject(
  source,
  depth = 0
) {
  if (
    !source ||
    typeof source !== "object" ||
    depth > 8
  ) {
    return null;
  }

  const reference =
    source.reference ||
    source.tutorReference ||
    source.tutor_reference ||
    source.referenceId ||
    source.tutor_reference_id;

  if (
    reference ||
    source.first_name ||
    source.firstName ||
    source.last_name ||
    source.lastName ||
    source.classes ||
    source.subjects ||
    source.tutorClasses ||
    source.tutorSubjects
  ) {
    return source;
  }

  const nestedKeys = [
    "tutor",
    "data",
    "user",
    "profile",
    "account",
    "application",
    "tutorData",
    "loggedInTutor",
    "session",
    "result",
  ];

  for (const key of nestedKeys) {
    if (
      source[key] &&
      typeof source[key] === "object"
    ) {
      const found =
        findTutorObject(
          source[key],
          depth + 1
        );

      if (found) {
        return found;
      }
    }
  }

  return null;
}

/* =========================================================
   TUTOR REFERENCE
========================================================= */

function getTutorReference(source) {
  const tutor =
    findTutorObject(source) ||
    source;

  if (!tutor) {
    return "";
  }

  return clean(
    tutor.reference ||
      tutor.tutorReference ||
      tutor.tutor_reference ||
      tutor.referenceId ||
      tutor.tutor_reference_id ||
      tutor?.data?.reference ||
      tutor?.data?.tutorReference
  );
}

/* =========================================================
   ARRAY HELPERS
========================================================= */

function extractStringValues(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return unique(
      value
        .map((item) => {
          if (
            typeof item === "string"
          ) {
            return item;
          }

          if (
            item &&
            typeof item === "object"
          ) {
            return (
              item.grade ||
              item.class ||
              item.class_name ||
              item.className ||
              item.subject ||
              item.subject_name ||
              item.subjectName ||
              item.name ||
              item.title ||
              ""
            );
          }

          return "";
        })
        .filter(Boolean)
    );
  }

  if (
    typeof value === "string"
  ) {
    const text = value.trim();

    if (!text) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(text);

      return extractStringValues(
        parsed
      );
    } catch {
      return unique(
        text
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean)
      );
    }
  }

  if (
    typeof value === "object"
  ) {
    return unique(
      Object.values(value)
        .flatMap((item) =>
          extractStringValues(
            item
          )
        )
    );
  }

  return [];
}

/* =========================================================
   EXTRACT CLASSES
========================================================= */

function extractClasses(data) {
  const candidates = [
    data?.tutor?.classes,
    data?.tutor?.tutorClasses,
    data?.tutor?.registeredClasses,

    data?.data?.tutor?.classes,
    data?.data?.tutor?.tutorClasses,
    data?.data?.tutor?.registeredClasses,

    data?.classes,
    data?.tutorClasses,
    data?.registeredClasses,

    data?.data?.classes,
    data?.data?.tutorClasses,
    data?.data?.registeredClasses,

    data?.classCards,
    data?.data?.classCards,
    data?.data?.data?.classCards,
  ];

  for (const candidate of candidates) {
    if (
      Array.isArray(candidate)
    ) {
      const values = unique(
        candidate
          .map((item) => {
            if (
              typeof item === "string"
            ) {
              return item;
            }

            return (
              item?.grade ||
              item?.class ||
              item?.class_name ||
              item?.className ||
              item?.level ||
              ""
            );
          })
          .filter(Boolean)
      );

      if (values.length) {
        return values;
      }
    }

    const values =
      extractStringValues(
        candidate
      );

    if (values.length) {
      return values;
    }
  }

  return [];
}

/* =========================================================
   EXTRACT SUBJECTS
========================================================= */

function extractSubjects(data) {
  const candidates = [
    data?.tutor?.subjects,
    data?.tutor?.tutorSubjects,
    data?.tutor?.registeredSubjects,

    data?.data?.tutor?.subjects,
    data?.data?.tutor?.tutorSubjects,
    data?.data?.tutor?.registeredSubjects,

    data?.subjects,
    data?.tutorSubjects,
    data?.registeredSubjects,

    data?.data?.subjects,
    data?.data?.tutorSubjects,
    data?.data?.registeredSubjects,

    data?.data?.data?.subjects,
    data?.data?.data?.tutorSubjects,
  ];

  for (const candidate of candidates) {
    const values =
      extractStringValues(
        candidate
      );

    if (values.length) {
      return values;
    }
  }

  return [];
}

/* =========================================================
   RESPONSE MESSAGE
========================================================= */

function getResponseMessage(
  data,
  fallback
) {
  if (!data) {
    return fallback;
  }

  if (
    typeof data === "string"
  ) {
    return clean(data) || fallback;
  }

  return (
    clean(data.message) ||
    clean(data.error) ||
    clean(data.details) ||
    clean(data.reason) ||
    clean(data?.data?.message) ||
    clean(data?.data?.error) ||
    clean(data?.data?.details) ||
    clean(data?.data?.reason) ||
    fallback
  );
}

/* =========================================================
   FILE HELPERS
========================================================= */

function getFileIcon(file) {
  if (!file) {
    return File;
  }

  const type =
    clean(file.type).toLowerCase();

  const name =
    clean(file.name).toLowerCase();

  if (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)$/.test(
      name
    )
  ) {
    return FileImage;
  }

  if (
    type.startsWith("video/") ||
    /\.(mp4|webm|mov)$/.test(name)
  ) {
    return Video;
  }

  if (
    type.includes("pdf") ||
    type.includes("word") ||
    type.includes("document") ||
    /\.(pdf|doc|docx)$/.test(name)
  ) {
    return FileText;
  }

  return File;
}

function getFileTypeLabel(file) {
  const type =
    clean(file?.type).toLowerCase();

  const name =
    clean(file?.name).toLowerCase();

  if (
    type.includes("pdf") ||
    name.endsWith(".pdf")
  ) {
    return "PDF";
  }

  if (
    type.includes("word") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return "DOC";
  }

  if (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)$/.test(
      name
    )
  ) {
    return "IMAGE";
  }

  if (
    type.startsWith("video/") ||
    /\.(mp4|webm|mov)$/.test(
      name
    )
  ) {
    return "VIDEO";
  }

  return "FILE";
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) {
    return "0 KB";
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.ceil(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorCreateTask({
  tutor: tutorProp = null,
  tutorData: tutorDataProp = null,
}) {
  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);

  /* =======================================================
     TUTOR DATA
  ======================================================= */

  const [
    tutorReference,
    setTutorReference,
  ] = useState("");

  const [
    registeredClasses,
    setRegisteredClasses,
  ] = useState([]);

  const [
    registeredSubjects,
    setRegisteredSubjects,
  ] = useState([]);

  const [
    loadingTutorData,
    setLoadingTutorData,
  ] = useState(true);

  /* =======================================================
     FORM
  ======================================================= */

  const [
    selectedClass,
    setSelectedClass,
  ] = useState("");

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState("");

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    instructions,
    setInstructions,
  ] = useState("");

  const [
    dueDate,
    setDueDate,
  ] = useState("");

  const [
    maxScore,
    setMaxScore,
  ] = useState("100");

  const [
    files,
    setFiles,
  ] = useState([]);

  /* =======================================================
     UI
  ======================================================= */

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    draggingFiles,
    setDraggingFiles,
  ] = useState(false);

  /* =======================================================
     LOCAL TUTOR
  ======================================================= */

  const getLocalTutor =
    useCallback(() => {
      const sources = [
        tutorProp,
        tutorDataProp,

        getStorageObject(
          ACADEMY_USER_KEY
        ),

        getStorageObject("academyUser"),
        getStorageObject("tutor"),
        getStorageObject("tutorData"),
        getStorageObject("currentTutor"),
        getStorageObject("loggedInTutor"),
        getStorageObject("currentUser"),
        getStorageObject("user"),
        getStorageObject("profile"),
      ];

      for (const source of sources) {
        if (!source) {
          continue;
        }

        const tutor =
          findTutorObject(source);

        if (tutor) {
          return tutor;
        }
      }

      return null;
    }, [
      tutorProp,
      tutorDataProp,
    ]);

  /* =======================================================
     LOAD TUTOR DATA
  ======================================================= */

  const loadTutorData =
    useCallback(async () => {
      setLoadingTutorData(true);
      setErrorMessage("");

      const localTutor =
        getLocalTutor();

      const reference =
        getTutorReference(
          localTutor
        );

      if (!reference) {
        setTutorReference("");
        setRegisteredClasses([]);
        setRegisteredSubjects([]);
        setSelectedClass("");
        setSelectedSubject("");

        setErrorMessage(
          "Your tutor reference could not be found. Please log in again."
        );

        setLoadingTutorData(false);
        return;
      }

      setTutorReference(
        reference
      );

      const localClasses =
        extractClasses(
          localTutor
        );

      const localSubjects =
        extractSubjects(
          localTutor
        );

      try {
        const url =
          `${TUTOR_CLASSES_URL}?reference=${encodeURIComponent(
            reference
          )}`;

        const token =
          getAcademyToken();

        const headers = {
          Accept:
            "application/json",

          "x-tutor-reference":
            reference,
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(url, {
            method: "GET",
            headers,
            cache: "no-store",
          });

        const text =
          await response.text();

        let data = null;

        if (text) {
          try {
            data =
              JSON.parse(text);
          } catch {
            data = text;
          }
        }

        if (!response.ok) {
          throw new Error(
            getResponseMessage(
              data,
              `Unable to load tutor classes (${response.status}).`
            )
          );
        }

        const serverClasses =
          extractClasses(data);

        const serverSubjects =
          extractSubjects(data);

        const classes =
          unique([
            ...serverClasses,
            ...localClasses,
          ]);

        const subjects =
          unique([
            ...serverSubjects,
            ...localSubjects,
          ]);

        setRegisteredClasses(
          classes
        );

        setRegisteredSubjects(
          subjects
        );

        setSelectedClass(
          (current) => {
            if (
              current &&
              classes.some(
                (item) =>
                  normalize(item) ===
                  normalize(current)
              )
            ) {
              return current;
            }

            return classes[0] || "";
          }
        );

        setSelectedSubject(
          (current) => {
            if (
              current &&
              subjects.some(
                (item) =>
                  subjectsMatch(
                    item,
                    current
                  )
              )
            ) {
              return current;
            }

            return subjects[0] || "";
          }
        );

        if (!classes.length) {
          setErrorMessage(
            "No registered classes were found in your tutor account."
          );
        } else if (!subjects.length) {
          setErrorMessage(
            "No registered subjects were found in your tutor account."
          );
        } else {
          setErrorMessage("");
        }
      } catch (error) {
        console.error(
          "Load tutor data error:",
          error
        );

        if (
          localClasses.length ||
          localSubjects.length
        ) {
          setRegisteredClasses(
            localClasses
          );

          setRegisteredSubjects(
            localSubjects
          );

          setSelectedClass(
            localClasses[0] || ""
          );

          setSelectedSubject(
            localSubjects[0] || ""
          );

          setErrorMessage("");
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
     ACCEPTED FILE TYPES
  ======================================================= */

  const acceptedFileTypes =
    useMemo(
      () =>
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/svg+xml",
          "image/avif",

          "video/mp4",
          "video/webm",
          "video/quicktime",
        ],
      []
    );

  /* =======================================================
     FILE VALIDATION
  ======================================================= */

  const isAllowedFile =
    useCallback(
      (file) => {
        if (!file) {
          return false;
        }

        const type =
          clean(file.type).toLowerCase();

        if (
          acceptedFileTypes.includes(
            type
          )
        ) {
          return true;
        }

        const extension =
          clean(file.name)
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
          "svg",
          "avif",
          "mp4",
          "webm",
          "mov",
        ].includes(
          extension
        );
      },
      [acceptedFileTypes]
    );

  /* =======================================================
     FILE HANDLER
  ======================================================= */

  const handleFiles =
    useCallback(
      (incomingFiles) => {
        setErrorMessage("");
        setSuccessMessage("");

        const incoming =
          Array.from(
            incomingFiles || []
          );

        if (!incoming.length) {
          return;
        }

        const invalid =
          incoming.find(
            (file) =>
              !isAllowedFile(file)
          );

        if (invalid) {
          setErrorMessage(
            `${invalid.name} is not supported. Upload PDF, DOC, DOCX, image, or video files.`
          );
          return;
        }

        const oversized =
          incoming.find(
            (file) =>
              file.size >
              MAX_FILE_SIZE
          );

        if (oversized) {
          setErrorMessage(
            `${oversized.name} is larger than 250 MB.`
          );
          return;
        }

        setFiles(
          (current) => {
            const combined = [
              ...current,
              ...incoming,
            ];

            const uniqueFiles = [];

            for (
              const file of combined
            ) {
              const duplicate =
                uniqueFiles.some(
                  (existing) =>
                    existing.name ===
                      file.name &&
                    existing.size ===
                      file.size &&
                    existing.lastModified ===
                      file.lastModified
                );

              if (!duplicate) {
                uniqueFiles.push(
                  file
                );
              }
            }

            if (
              uniqueFiles.length >
              MAX_FILES
            ) {
              setErrorMessage(
                `You can upload a maximum of ${MAX_FILES} files.`
              );
            }

            return uniqueFiles.slice(
              0,
              MAX_FILES
            );
          }
        );
      },
      [isAllowedFile]
    );

  const handleFileInputChange =
    (event) => {
      handleFiles(
        event.target.files
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    };

  const removeFile = (index) => {
    setFiles(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  };

  /* =======================================================
     DRAG & DROP
  ======================================================= */

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDraggingFiles(true);
  };

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDraggingFiles(false);
  };

  const handleDrop = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDraggingFiles(false);

    handleFiles(
      event.dataTransfer.files
    );
  };

  /* =======================================================
     FORM VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!tutorReference) {
      return "Your tutor reference is missing. Please log in again.";
    }

    if (
      !registeredClasses.length
    ) {
      return "No registered classes were found.";
    }

    if (
      !registeredSubjects.length
    ) {
      return "No registered subjects were found.";
    }

    if (!selectedClass) {
      return "Please select a class.";
    }

    if (
      !registeredClasses.some(
        (item) =>
          normalize(item) ===
          normalize(selectedClass)
      )
    ) {
      return "The selected class is not registered to your tutor account.";
    }

    if (!selectedSubject) {
      return "Please select a subject.";
    }

    if (
      !registeredSubjects.some(
        (item) =>
          subjectsMatch(
            item,
            selectedSubject
          )
      )
    ) {
      return "The selected subject is not registered to your tutor account.";
    }

    if (!clean(title)) {
      return "Please enter a task title.";
    }

    if (
      clean(title).length < 3
    ) {
      return "Task title must contain at least 3 characters.";
    }

    if (!clean(description)) {
      return "Please enter a task description.";
    }

    if (
      clean(description).length < 3
    ) {
      return "Task description must contain at least 3 characters.";
    }

    const score =
      Number(maxScore);

    if (
      !Number.isFinite(score) ||
      score <= 0
    ) {
      return "Maximum score must be greater than 0.";
    }

    if (score > 10000) {
      return "Maximum score cannot be greater than 10,000.";
    }

    const oversized =
      files.find(
        (file) =>
          file.size >
          MAX_FILE_SIZE
      );

    if (oversized) {
      return `${oversized.name} is larger than 250 MB.`;
    }

    return "";
  };

  /* =======================================================
     CREATE TASK
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      setErrorMessage("");
      setSuccessMessage("");

      const validationError =
        validateForm();

      if (validationError) {
        setErrorMessage(
          validationError
        );
        return;
      }

      setSubmitting(true);

      try {
        const reference =
          clean(tutorReference);

        const grade =
          clean(selectedClass);

        const subject =
          clean(selectedSubject);

        const taskTitle =
          clean(title);

        const taskDescription =
          clean(description);

        const taskInstructions =
          clean(instructions);

        /*
         * This is the exact multipart
         * payload expected by
         * academyRoutes.js.
         */

        const formData =
          new FormData();

        formData.append(
          "reference",
          reference
        );

        formData.append(
          "grade",
          grade
        );

        formData.append(
          "subject",
          subject
        );

        formData.append(
          "activityType",
          "task"
        );

        formData.append(
          "title",
          taskTitle
        );

        formData.append(
          "description",
          taskDescription
        );

        if (taskInstructions) {
          formData.append(
            "instructions",
            taskInstructions
          );
        }

        if (clean(dueDate)) {
          formData.append(
            "dueDate",
            clean(dueDate)
          );
        }

        formData.append(
          "maxScore",
          clean(maxScore) || "100"
        );

        const metadata = {
          source: "TutorCreateTask",

          activityType: "task",

          tutor_reference:
            reference,

          reference,

          grade,

          class: grade,

          subject,

          instructions:
            taskInstructions,

          dueDate:
            clean(dueDate),

          maxScore:
            Number(maxScore) || 100,

          fileCount:
            files.length,

          hasFiles:
            files.length > 0,
        };

        formData.append(
          "metadata",
          JSON.stringify(metadata)
        );

        /*
         * IMPORTANT:
         * Backend uses:
         *
         * taskUpload.array("files", 10)
         */

        files.forEach((file) => {
          formData.append(
            "files",
            file,
            file.name
          );
        });

        const token =
          getAcademyToken();

        const headers = {
          Accept:
            "application/json",

          "x-tutor-reference":
            reference,
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        console.log(
          "========================================"
        );

        console.log(
          "SCHOLIQEN CREATE TASK"
        );

        console.log({
          url:
            CREATE_TASK_URL,

          method: "POST",

          reference,

          grade,

          subject,

          activityType:
            "task",

          title:
            taskTitle,

          fileCount:
            files.length,

          hasToken:
            Boolean(token),
        });

        console.log(
          "========================================"
        );

        /*
         * DO NOT manually set
         * Content-Type.
         *
         * Browser creates:
         * multipart/form-data;
         * boundary=...
         */

        const response =
          await fetch(
            CREATE_TASK_URL,
            {
              method: "POST",
              headers,
              body: formData,
            }
          );

        const responseText =
          await response.text();

        let data = null;

        if (responseText) {
          try {
            data =
              JSON.parse(
                responseText
              );
          } catch {
            data =
              responseText;
          }
        }

        console.log(
          "CREATE TASK RESPONSE",
          {
            status:
              response.status,

            ok:
              response.ok,

            data,
          }
        );

        if (!response.ok) {
          throw new Error(
            getResponseMessage(
              data,
              `Unable to create task (${response.status}).`
            )
          );
        }

        if (
          data &&
          typeof data === "object" &&
          data.success === false
        ) {
          throw new Error(
            getResponseMessage(
              data,
              "The server rejected the task."
            )
          );
        }

        setSuccessMessage(
          "Task created successfully. Students in the selected class and subject can receive this task."
        );

        setErrorMessage("");

        setTitle("");
        setDescription("");
        setInstructions("");
        setDueDate("");
        setMaxScore("100");
        setFiles([]);

        if (fileInputRef.current) {
          fileInputRef.current.value =
            "";
        }

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        console.error(
          "Create task error:",
          error
        );

        setSuccessMessage("");

        setErrorMessage(
          clean(error?.message) ||
            "Something went wrong while creating the task."
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } finally {
        setSubmitting(false);
      }
    };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = () => {
    if (submitting) {
      return;
    }

    navigate(-1);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
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
                Create a task for your
                registered students
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
      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ERROR */}

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

              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-red-200/70">
                {errorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setErrorMessage("")
              }
              className="text-red-300/60 transition hover:text-red-200"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* SUCCESS */}

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
              onClick={() =>
                setSuccessMessage("")
              }
              className="text-emerald-300/60 transition hover:text-emerald-200"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            TEACHING DETAILS
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
                  Only your registered
                  classes and subjects
                  can be selected.
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
            {/* CLASSES */}

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Registered classes
                </span>

                <span className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-300">
                  {
                    registeredClasses.length
                  }
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
                  {registeredClasses.map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-white/[0.07] bg-[#020617] px-2.5 py-1.5 text-xs font-medium text-slate-300"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-300/70">
                  No classes found.
                </p>
              )}
            </div>

            {/* SUBJECTS */}

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Registered subjects
                </span>

                <span className="rounded-lg bg-blue-400/10 px-2 py-1 text-xs font-bold text-blue-300">
                  {
                    registeredSubjects.length
                  }
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
                  {registeredSubjects.map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-white/[0.07] bg-[#020617] px-2.5 py-1.5 text-xs font-medium text-slate-300"
                      >
                        {item}
                      </span>
                    )
                  )}
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

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#071426] shadow-2xl shadow-black/20">
            <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-white">
                Task information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create an academic task
                for a specific class
                and subject.
              </p>
            </div>

            <div className="space-y-7 p-5 sm:p-6">
              {/* CLASS + SUBJECT */}

              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white">
                    Class and subject
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Both fields are
                    required.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* CLASS */}

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
                        value={
                          selectedClass
                        }
                        onChange={(event) => {
                          setSelectedClass(
                            event.target
                              .value
                          );

                          setErrorMessage(
                            ""
                          );
                          setSuccessMessage(
                            ""
                          );
                        }}
                        disabled={
                          loadingTutorData ||
                          !registeredClasses.length ||
                          submitting
                        }
                        className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#020617] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          {loadingTutorData
                            ? "Loading classes..."
                            : "Select a class"}
                        </option>

                        {registeredClasses.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />
                    </div>
                  </div>

                  {/* SUBJECT */}

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
                        value={
                          selectedSubject
                        }
                        onChange={(event) => {
                          setSelectedSubject(
                            event.target
                              .value
                          );

                          setErrorMessage(
                            ""
                          );
                          setSuccessMessage(
                            ""
                          );
                        }}
                        disabled={
                          loadingTutorData ||
                          !registeredSubjects.length ||
                          submitting
                        }
                        className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#020617] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          {loadingTutorData
                            ? "Loading subjects..."
                            : "Select a subject"}
                        </option>

                        {registeredSubjects.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TITLE */}

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
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Quadratic Equations Practice"
                  maxLength={200}
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-[11px] text-slate-700">
                    {title.length}/200
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}

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
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Explain what students need to do..."
                  rows={5}
                  maxLength={5000}
                  disabled={submitting}
                  className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-[11px] text-slate-700">
                    {description.length}/5000
                  </span>
                </div>
              </div>

              {/* INSTRUCTIONS */}

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
                    setInstructions(
                      event.target.value
                    )
                  }
                  placeholder="Add submission instructions or guidance..."
                  rows={4}
                  maxLength={5000}
                  disabled={submitting}
                  className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                />
              </div>

              {/* DATE + SCORE */}

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
                        setDueDate(
                          event.target.value
                        )
                      }
                      disabled={submitting}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#020617] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
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
                      setMaxScore(
                        event.target.value
                      )
                    }
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#020617] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* FILES */}

              <div>
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-slate-300">
                    Attach materials
                    <span className="ml-2 text-xs font-normal text-slate-600">
                      Optional
                    </span>
                  </label>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    PDF, DOC, DOCX,
                    images and videos.
                    Maximum 10 files,
                    250 MB per file.
                  </p>
                </div>

                <div
                  onDragOver={
                    handleDragOver
                  }
                  onDragLeave={
                    handleDragLeave
                  }
                  onDrop={handleDrop}
                  className={`rounded-2xl border border-dashed p-6 text-center transition ${
                    draggingFiles
                      ? "border-cyan-400/60 bg-cyan-400/[0.06]"
                      : "border-white/[0.10] bg-[#020617]/60 hover:border-cyan-400/30"
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.06]">
                    <Upload
                      size={21}
                      className="text-cyan-400"
                    />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-slate-300">
                    Drop files here
                  </h4>

                  <p className="mt-1 text-xs text-slate-600">
                    or select files from
                    your device
                  </p>

                  <button
                    type="button"
                    disabled={
                      submitting ||
                      files.length >=
                        MAX_FILES
                    }
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={15} />
                    Choose files
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.mp4,.webm,.mov"
                    onChange={
                      handleFileInputChange
                    }
                    className="hidden"
                  />

                  {files.length > 0 && (
                    <p className="mt-3 text-[11px] text-slate-600">
                      {files.length}/
                      {MAX_FILES} files
                      selected
                    </p>
                  )}
                </div>

                {/* FILE LIST */}

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map(
                      (
                        file,
                        index
                      ) => {
                        const Icon =
                          getFileIcon(
                            file
                          );

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
                                  {getFileTypeLabel(
                                    file
                                  )}
                                </span>

                                <span>
                                  •
                                </span>

                                <span>
                                  {formatFileSize(
                                    file.size
                                  )}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={
                                submitting
                              }
                              onClick={() =>
                                removeFile(
                                  index
                                )
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-30"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* DELIVERY */}

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
                      This task belongs
                      to{" "}
                      <span className="font-semibold text-slate-300">
                        {selectedClass ||
                          "the selected class"}
                      </span>{" "}
                      for{" "}
                      <span className="font-semibold text-slate-300">
                        {selectedSubject ||
                          "the selected subject"}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] bg-[#020617]/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
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
