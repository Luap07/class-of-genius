import React, {
useCallback,
useEffect,
useMemo,
useState,
} from "react";

import {
BookOpen,
BookMarked,
Search,
RefreshCw,
FileText,
Eye,
X,
Loader2,
AlertCircle,
GraduationCap,
Layers3,
Download,
Video,
File,
} from "lucide-react";

import { useOutletContext } from "react-router-dom";

/* ============================================================
CONSTANTS
============================================================ */

const API_URL =
import.meta.env.VITE_API_URL ||
"http://localhost:5000";

const TOKEN_KEYS = [
"scholiqen_academy_token",
"academyToken",
"scholiqen_student_token",
"studentToken",
];

/* ============================================================
HELPERS
============================================================ */

const clean = (value) => {
if (
value === undefined ||
value === null
) {
return "";
}

return String(value).trim();
};

const normalizeClass = (value) => {
const text = clean(value);

if (!text) {
return "";
}

return text
.replace(/\s+/g, " ")
.trim()
.toLowerCase();
};

const normalizeSubject = (value) => {
const text = clean(value);

if (!text) {
return "";
}

return text
.replace(/\s+/g, " ")
.trim()
.toLowerCase();
};

const safeParse = (value) => {
if (!value) {
return null;
}

try {
return JSON.parse(value);
} catch {
return null;
}
};

const getToken = () => {
for (const key of TOKEN_KEYS) {
const token = clean(
localStorage.getItem(key)
);

if (token) {
  return token;
}

}

return "";
};

const getStudentFromStorage = () => {
const keys = [
"scholiqen_academy_user",
"academyStudent",
"student",
"scholiqen_user",
"scholiqen_current_user",
];

for (const key of keys) {
const stored =
localStorage.getItem(key);

if (!stored) {
  continue;
}

const parsed = safeParse(stored);

if (parsed) {
  return parsed;
}

}

return null;
};

const getStudentClass = (student) => {
if (!student) {
return "";
}

return clean(
student.grade ||
student.className ||
student.class_name ||
student.class ||
student.currentClass ||
student.current_class ||
student.level
);
};

const getStudentId = (student) => {
if (!student) {
return "";
}

return clean(
student.studentId ||
student.student_id ||
student.id ||
student.enrollmentId ||
student.enrollment_id
);
};

const getStudentEmail = (student) => {
if (!student) {
return "";
}

return clean(
student.email ||
student.emailAddress ||
student.email_address
);
};

const formatFileSize = (bytes) => {
const size = Number(bytes);

if (!Number.isFinite(size) || size <= 0) {
return "File";
}

const sizes = [
"Bytes",
"KB",
"MB",
"GB",
];

const index = Math.min(
Math.floor(
Math.log(size) / Math.log(1024)
),
sizes.length - 1
);

return `${(
    size / Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${
    sizes[index]
  }`;
};

const getFileExtension = (
fileName = "",
fileType = ""
) => {
const name = clean(fileName);

if (name.includes(".")) {
return (
name
.split(".")
.pop()
?.toUpperCase() || "FILE"
);
}

const type = clean(fileType);

if (type.includes("/")) {
return (
type
.split("/")
.pop()
?.toUpperCase() || "FILE"
);
}

return "FILE";
};

const getMaterialUrl = (material) => {
return clean(
material?.file_url ||
material?.fileUrl ||
material?.url ||
material?.download_url ||
material?.downloadUrl
);
};

const getMaterialType = (material) => {
const mime = clean(
material?.file_mime_type ||
material?.fileMimeType ||
material?.file_type ||
material?.fileType ||
material?.material_type ||
material?.materialType
).toLowerCase();

const fileName = clean(
material?.file_name ||
material?.fileName
).toLowerCase();

if (
mime.includes("video") ||
/.(mp4|webm|mov|m4v)$/i.test(
fileName
)
) {
return "video";
}

if (
mime.includes("pdf") ||
/.pdf$/i.test(fileName)
) {
return "pdf";
}

if (
mime.includes("word") ||
mime.includes("document") ||
/.(doc|docx)$/i.test(
fileName
)
) {
return "document";
}

return "file";
};

const getMaterialClass = (material) => {
return clean(
material?.level ||
material?.class_name ||
material?.className ||
material?.class ||
material?.grade
);
};

/* ============================================================
COMPONENT
============================================================ */

const StudentTextbooks = () => {
const outletContext =
useOutletContext() || {};

const contextStudent =
outletContext?.student ||
outletContext?.user ||
outletContext?.currentUser ||
null;

const [student, setStudent] =
useState(
contextStudent ||
getStudentFromStorage()
);

const [materials, setMaterials] =
useState([]);

const [loading, setLoading] =
useState(true);

const [refreshing, setRefreshing] =
useState(false);

const [error, setError] =
useState("");

const [searchTerm, setSearchTerm] =
useState("");

const [
selectedSubject,
setSelectedSubject,
] = useState("All Subjects");

const [
selectedMaterial,
setSelectedMaterial,
] = useState(null);

/* ==========================================================
KEEP STUDENT IN SYNC
========================================================== */

useEffect(() => {
const storedStudent =
getStudentFromStorage();

setStudent(
  contextStudent ||
    storedStudent ||
    null
);

}, [contextStudent]);

/* ==========================================================
LOAD STUDENT MATERIALS
========================================================== */

const loadMaterials = useCallback(
async ({
showRefresh = false,
} = {}) => {
const token = getToken();

  try {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    if (!token) {
      throw new Error(
        "Your Academy session has expired. Please log in again."
      );
    }

    const currentStudent =
      contextStudent ||
      getStudentFromStorage();

    const studentId =
      getStudentId(
        currentStudent
      );

    const email =
      getStudentEmail(
        currentStudent
      );

    const query = new URLSearchParams();

    if (studentId) {
      query.set(
        "studentId",
        studentId
      );
    }

    if (email) {
      query.set(
        "email",
        email
      );
    }

    const queryString =
      query.toString();

    const endpoint =
      `${API_URL}/api/academy/student/materials` +
      (queryString
        ? `?${queryString}`
        : "");

    const response =
      await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${token}`,
        },
      });

    let payload = null;

    try {
      payload =
        await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        payload?.message ||
        payload?.error ||
        `Unable to load materials (${response.status}).`;

      throw new Error(message);
    }

    const rows =
      Array.isArray(
        payload?.materials
      )
        ? payload.materials
        : Array.isArray(
            payload?.data
          )
          ? payload.data
          : Array.isArray(
              payload?.results
            )
            ? payload.results
            : Array.isArray(
                payload
              )
              ? payload
              : [];

    setMaterials(rows);
  } catch (loadError) {
    console.error(
      "Student materials fetch error:",
      loadError
    );

    setMaterials([]);

    setError(
      loadError?.message ||
        "Unable to load learning materials."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
},
[contextStudent]

);

useEffect(() => {
loadMaterials();
}, [loadMaterials]);

/* ==========================================================
STUDENT CLASS
========================================================== */

const studentClass = useMemo(() => {
return getStudentClass(student);
}, [student]);

const normalizedStudentClass =
useMemo(() => {
return normalizeClass(
studentClass
);
}, [studentClass]);

/* ==========================================================
FILTER BY CLASS
========================================================== */

const classMaterials = useMemo(() => {
if (!normalizedStudentClass) {
return materials;
}

return materials.filter(
  (material) => {
    const materialClass =
      normalizeClass(
        getMaterialClass(
          material
        )
      );

    /*
     * If backend has no class/level
     * attached to a material, keep it
     * visible instead of hiding it.
     */

    if (!materialClass) {
      return true;
    }

    return (
      materialClass ===
      normalizedStudentClass
    );
  }
);

}, [
materials,
normalizedStudentClass,
]);

/* ==========================================================
AVAILABLE SUBJECTS
========================================================== */

const availableSubjects =
useMemo(() => {
const subjects =
classMaterials
.map((material) =>
clean(material.subject)
)
.filter(Boolean);

  return [
    ...new Set(subjects),
  ].sort((a, b) =>
    a.localeCompare(b)
  );
}, [classMaterials]);

/* ==========================================================
FILTER MATERIALS
========================================================== */

const filteredMaterials =
useMemo(() => {
const search =
clean(searchTerm)
.toLowerCase();

return classMaterials.filter(
    (material) => {
      const searchableText = [
        material.title,
        material.description,
        material.subject,
        material.level,
        material.class_name,
        material.chapter,
        material.topic,
        material.material_type,
        material.file_name,
      ]
        .map(clean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(
          search
        );

      const matchesSubject =
        selectedSubject ===
          "All Subjects" ||
        normalizeSubject(
          material.subject
        ) ===
          normalizeSubject(
            selectedSubject
          );

      return (
        matchesSearch &&
        matchesSubject
      );
    }
  );
}, [
  classMaterials,
  searchTerm,
  selectedSubject,
]);

/* ==========================================================
STATISTICS
========================================================== */

const totalMaterials =
classMaterials.length;

const totalSubjects =
availableSubjects.length;

const totalChapters = useMemo(() => {
return new Set(
classMaterials
.map((material) =>
clean(material.chapter)
)
.filter(Boolean)
).size;
}, [classMaterials]);

/* ==========================================================
OPEN MATERIAL
========================================================== */

const openMaterial = (
material
) => {
const fileUrl =
getMaterialUrl(material);

if (!fileUrl) {
  setSelectedMaterial(
    material
  );

  return;
}

window.open(
  fileUrl,
  "_blank",
  "noopener,noreferrer"
);

};

/* ==========================================================
FILE ICON
========================================================== */

const MaterialIcon = ({
material,
size = 25,
}) => {
const type =
getMaterialType(
material
);

if (type === "video") {
  return (
    <Video
      size={size}
      className="text-blue-400"
    />
  );
}

if (type === "pdf") {
  return (
    <FileText
      size={size}
      className="text-red-400"
    />
  );
}

if (type === "document") {
  return (
    <FileText
      size={size}
      className="text-purple-400"
    />
  );
}

return (
  <File
    size={size}
    className="text-slate-400"
  />
);

};

/* ==========================================================
RENDER
========================================================== */

return ( <div className="min-h-full bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8"> <div className="mx-auto max-w-7xl">

    {/* HEADER */}

    <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <BookMarked
              size={24}
              className="text-blue-400"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Materials
            </h1>

            <p className="text-xs text-slate-500">
              Academy Learning Materials
            </p>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Access learning materials,
          documents and videos provided
          for your class and subjects.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 sm:flex">
          <GraduationCap
            size={17}
            className="text-blue-400"
          />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Your Class
            </p>

            <p className="text-xs font-semibold text-slate-300">
              {studentClass ||
                "Class not set"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            loadMaterials({
              showRefresh: true,
            })
          }
          disabled={
            loading ||
            refreshing
          }
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          <span className="hidden sm:inline">
            Refresh
          </span>
        </button>
      </div>
    </div>

    {/* CLASS NOTICE */}

    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-500/10 bg-blue-500/[0.04] px-4 py-3">
      <BookOpen
        size={18}
        className="shrink-0 text-blue-400"
      />

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-300">
          {studentClass
            ? `Showing materials for ${studentClass}`
            : "Showing Academy learning materials"}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-600">
          Materials are managed by the
          Academy administration.
        </p>
      </div>
    </div>

    {/* ERROR */}

    {error && (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0 text-red-400"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-300">
            Unable to load materials
          </p>

          <p className="mt-1 text-xs leading-5 text-red-400/80">
            {error}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadMaterials()
          }
          className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
        >
          Retry
        </button>
      </div>
    )}

    {/* STAT CARDS */}

    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <BookOpen
              size={19}
              className="text-blue-400"
            />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Library
          </span>
        </div>

        <p className="text-2xl font-bold text-white">
          {totalMaterials}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Available materials
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <GraduationCap
              size={19}
              className="text-purple-400"
            />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Subjects
          </span>
        </div>

        <p className="text-2xl font-bold text-white">
          {totalSubjects}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Subjects available
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Layers3
              size={19}
              className="text-amber-400"
            />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Chapters
          </span>
        </div>

        <p className="text-2xl font-bold text-white">
          {totalChapters}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Chapters represented
        </p>
      </div>
    </div>

    {/* SEARCH */}

    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_230px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search materials, subjects, chapters, topics..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(event) =>
            setSelectedSubject(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50"
        >
          <option>
            All Subjects
          </option>

          {availableSubjects.map(
            (subject) => (
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            )
          )}
        </select>
      </div>
    </div>

    {/* LOADING */}

    {loading ? (
      <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-blue-400"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading your materials...
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Connecting to the Academy
            library
          </p>
        </div>
      </div>
    ) : filteredMaterials.length ===
      0 ? (
      /* EMPTY STATE */

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
          <BookOpen
            size={28}
            className="text-blue-400"
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-white">
          No materials found
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {searchTerm ||
          selectedSubject !==
            "All Subjects"
            ? "No learning materials match your current search or subject filter."
            : studentClass
              ? `There are currently no materials available for ${studentClass}.`
              : "There are currently no Academy materials available."}
        </p>

        {(searchTerm ||
          selectedSubject !==
            "All Subjects") && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedSubject(
                "All Subjects"
              );
            }}
            className="mt-6 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Clear Filters
          </button>
        )}
      </div>
    ) : (
      /* MATERIAL CARDS */

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredMaterials.map(
          (material) => {
            const fileUrl =
              getMaterialUrl(
                material
              );

            const type =
              getMaterialType(
                material
              );

            return (
              <div
                key={material.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex gap-4">

                  {/* FILE ICON */}

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10">
                    <MaterialIcon
                      material={material}
                    />
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white">
                        {material.title ||
                          "Untitled Material"}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {material.subject && (
                          <span className="rounded-md border border-blue-500/10 bg-blue-500/10 px-2 py-1 text-[10px] font-medium text-blue-400">
                            {
                              material.subject
                            }
                          </span>
                        )}

                        {getMaterialClass(
                          material
                        ) && (
                          <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
                            {getMaterialClass(
                              material
                            )}
                          </span>
                        )}

                        {material.material_type && (
                          <span className="rounded-md bg-purple-500/10 px-2 py-1 text-[10px] font-medium capitalize text-purple-400">
                            {clean(
                              material.material_type
                            ).replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {material.description && (
                      <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-500">
                        {
                          material.description
                        }
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-500">
                      {material.chapter && (
                        <span>
                          Chapter:{" "}
                          <span className="text-slate-300">
                            {
                              material.chapter
                            }
                          </span>
                        </span>
                      )}

                      {material.topic && (
                        <span>
                          Topic:{" "}
                          <span className="text-slate-300">
                            {
                              material.topic
                            }
                          </span>
                        </span>
                      )}

                      {material.file_size && (
                        <span>
                          {formatFileSize(
                            material.file_size
                          )}
                        </span>
                      )}

                      {material.file_name && (
                        <span>
                          {
                            getFileExtension(
                              material.file_name,
                              material.file_mime_type ||
                                material.file_type
                            )
                          }
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openMaterial(
                            material
                          )
                        }
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                      >
                        <Eye
                          size={15}
                        />

                        {type ===
                        "video"
                          ? "Watch Material"
                          : "Open Material"}
                      </button>

                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={
                            material.file_name ||
                            undefined
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                        >
                          <Download
                            size={15}
                          />

                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    )}
  </div>

  {/* MATERIAL DETAILS MODAL */}

  {selectedMaterial && (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              Material Information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Academy learning material
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedMaterial(
                null
              )
            }
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <MaterialIcon
                material={
                  selectedMaterial
                }
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">
                {
                  selectedMaterial.title ||
                  "Untitled Material"
                }
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {
                  selectedMaterial.file_name ||
                  "Academy material"
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Subject
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {
                  selectedMaterial.subject ||
                  "Not specified"
                }
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Class / Level
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {getMaterialClass(
                  selectedMaterial
                ) ||
                  "Not specified"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Type
              </p>

              <p className="mt-1 text-sm font-medium capitalize text-slate-200">
                {clean(
                  selectedMaterial.material_type ||
                    getMaterialType(
                      selectedMaterial
                    )
                ).replace(
                  /_/g,
                  " "
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                File
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {getFileExtension(
                  selectedMaterial.file_name,
                  selectedMaterial.file_mime_type ||
                    selectedMaterial.file_type
                )}
              </p>
            </div>
          </div>

          {selectedMaterial.description && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Description
              </p>

              <p className="text-sm leading-6 text-slate-400">
                {
                  selectedMaterial.description
                }
              </p>
            </div>
          )}

          <div className="flex gap-3 border-t border-slate-800 pt-5">
            {getMaterialUrl(
              selectedMaterial
            ) && (
              <button
                type="button"
                onClick={() => {
                  openMaterial(
                    selectedMaterial
                  );

                  setSelectedMaterial(
                    null
                  );
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Eye size={17} />

                Open Material
              </button>
            )}

            {getMaterialUrl(
              selectedMaterial
            ) && (
              <a
                href={getMaterialUrl(
                  selectedMaterial
                )}
                target="_blank"
                rel="noopener noreferrer"
                download={
                  selectedMaterial.file_name ||
                  undefined
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <Download
                  size={17}
                />
              </a>
            )}

            <button
              type="button"
              onClick={() =>
                setSelectedMaterial(
                  null
                )
              }
              className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

);
};

export default StudentTextbooks;
