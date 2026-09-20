import React, { useEffect, useMemo, useState } from "react";
import {
BookOpen,
Upload,
Search,
Plus,
X,
Trash2,
Eye,
FileText,
CheckCircle2,
XCircle,
Loader2,
RefreshCw,
BookMarked,
GraduationCap,
Layers3,
MoreVertical,
} from "lucide-react";

/* ============================================================
API
============================================================ */

const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";

const MATERIALS_URL =
`${API_URL}/api/academy/admin/materials`;

const ACADEMY_TOKEN_KEY =
"scholiqen_academy_token";

/* ============================================================
CONSTANTS
============================================================ */

const CLASS_OPTIONS = [
"Grade 1",
"Grade 2",
"Grade 3",
"Grade 4",
"Grade 5",
"Grade 6",
"JSS 1",
"JSS 2",
"JSS 3",
"SS 1",
"SS 2",
"SS 3",
];

const SUBJECT_OPTIONS = [
"Mathematics",
"English Language",
"Physics",
"Chemistry",
"Biology",
"Basic Science",
"Basic Technology",
"Computer Science",
"Geography",
"Economics",
"Government",
"Civic Education",
"Literature",
"Christian Religious Studies",
"Islamic Religious Studies",
"Agricultural Science",
"Commerce",
"Financial Accounting",
"Further Mathematics",
"History",
"French",
"Physical and Health Education",
];

const ACCEPTED_FILE_TYPES = [
"application/pdf",
"application/msword",
"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXTENSIONS = [
".pdf",
".doc",
".docx",
];

/* ============================================================
HELPERS
============================================================ */

const getToken = () => {
return localStorage.getItem(
ACADEMY_TOKEN_KEY
);
};

const formatFileSize = (bytes) => {
if (!bytes) return "0 KB";

const sizes = [
"Bytes",
"KB",
"MB",
"GB",
];

const index = Math.min(
Math.floor(
Math.log(bytes) / Math.log(1024)
),
sizes.length - 1
);

return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${
    sizes[index]
  }`;
};

const getFileExtension = (
fileName = ""
) => {
const parts =
fileName.split(".");

if (parts.length < 2) {
return "FILE";
}

return parts
.pop()
.toUpperCase();
};

const getMaterialFileUrl = (
material
) => {
if (!material) {
return "";
}

if (material.file_url) {
return material.file_url;
}

if (material.fileUrl) {
return material.fileUrl;
}

if (material.url) {
return material.url;
}

return "";
};

const normalizeMaterialsResponse = (
response
) => {
if (Array.isArray(response)) {
return response;
}

if (
Array.isArray(
response?.materials
)
) {
return response.materials;
}

if (
Array.isArray(
response?.data
)
) {
return response.data;
}

if (
Array.isArray(
response?.results
)
) {
return response.results;
}

return [];
};

const getErrorMessage = async (
response
) => {
try {
const data =
await response.json();

return (
  data?.message ||
  data?.error ||
  "Request failed."
);

} catch {
return `Request failed with status ${response.status}.`;
}
};

/* ============================================================
COMPONENT
============================================================ */

const AdminMaterials = () => {
const [materials, setMaterials] =
useState([]);

const [loading, setLoading] =
useState(true);

const [saving, setSaving] =
useState(false);

const [deletingId, setDeletingId] =
useState(null);

const [publishingId, setPublishingId] =
useState(null);

const [searchTerm, setSearchTerm] =
useState("");

const [filterClass, setFilterClass] =
useState("All Classes");

const [filterSubject, setFilterSubject] =
useState("All Subjects");

const [showCreateModal, setShowCreateModal] =
useState(false);

const [selectedMaterial, setSelectedMaterial] =
useState(null);

const [message, setMessage] =
useState({
type: "",
text: "",
});

const [form, setForm] =
useState({
title: "",
description: "",
subject: "",
className: "",
chapter: "",
topic: "",
file: null,
published: true,
});

/* ==========================================================
FETCH MATERIALS
========================================================== */

const fetchMaterials =
async () => {
try {
setLoading(true);

    const token =
      getToken();

    const headers = {};

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response =
      await fetch(
        MATERIALS_URL,
        {
          method: "GET",
          headers,
        }
      );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response
        )
      );
    }

    const data =
      await response.json();

    const loadedMaterials =
      normalizeMaterialsResponse(
        data
      );

    setMaterials(
      loadedMaterials
    );
  } catch (error) {
    console.error(
      "Fetch materials error:",
      error
    );

    setMessage({
      type: "error",
      text:
        error?.message ||
        "Unable to load materials.",
    });
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
fetchMaterials();
}, []);

/* ==========================================================
FORM CHANGE
========================================================== */

const handleFormChange = (
event
) => {
const {
name,
value,
type,
checked,
files,
} = event.target;

if (type === "file") {
  setForm(
    (previous) => ({
      ...previous,
      file:
        files?.[0] ||
        null,
    })
  );

  return;
}

setForm(
  (previous) => ({
    ...previous,
    [name]:
      type ===
      "checkbox"
        ? checked
        : value,
  })
);

};

/* ==========================================================
RESET FORM
========================================================== */

const resetForm = () => {
setForm({
title: "",
description: "",
subject: "",
className: "",
chapter: "",
topic: "",
file: null,
published: true,
});
};

/* ==========================================================
CLOSE MODAL
========================================================== */

const closeCreateModal =
() => {
if (saving) return;

  setShowCreateModal(
    false
  );

  resetForm();
};

/* ==========================================================
CREATE MATERIAL
========================================================== */

const handleCreateMaterial =
async (event) => {
event.preventDefault();

  setMessage({
    type: "",
    text: "",
  });

  if (!form.title.trim()) {
    setMessage({
      type: "error",
      text:
        "Please enter the material title.",
    });

    return;
  }

  if (!form.subject) {
    setMessage({
      type: "error",
      text:
        "Please select a subject.",
    });

    return;
  }

  if (!form.className) {
    setMessage({
      type: "error",
      text:
        "Please select a class.",
    });

    return;
  }

  if (!form.file) {
    setMessage({
      type: "error",
      text:
        "Please select a PDF, DOC, or DOCX file.",
    });

    return;
  }

  const fileExtension =
    `.${getFileExtension(
      form.file.name
    ).toLowerCase()}`;

  const validMime =
    ACCEPTED_FILE_TYPES.includes(
      form.file.type
    );

  const validExtension =
    ACCEPTED_EXTENSIONS.includes(
      fileExtension
    );

  if (
    !validMime &&
    !validExtension
  ) {
    setMessage({
      type: "error",
      text:
        "Only PDF, DOC, and DOCX files are supported.",
    });

    return;
  }

  try {
    setSaving(true);

    const token =
      getToken();

    if (!token) {
      throw new Error(
        "Your Academy session has expired. Please log in again."
      );
    }

    /* ======================================================
       MULTIPART FORM DATA
    ====================================================== */

    const formData =
      new FormData();

    formData.append(
      "title",
      form.title.trim()
    );

    formData.append(
      "description",
      form.description.trim()
    );

    formData.append(
      "subject",
      form.subject
    );

    formData.append(
      "className",
      form.className
    );

    formData.append(
      "chapter",
      form.chapter.trim()
    );

    formData.append(
      "topic",
      form.topic.trim()
    );

    formData.append(
      "published",
      String(
        form.published
      )
    );

    formData.append(
      "file",
      form.file
    );

    /* ======================================================
       SEND TO EXPRESS BACKEND
    ====================================================== */

    const response =
      await fetch(
        MATERIALS_URL,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: formData,
        }
      );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response
        )
      );
    }

    await response.json();

    setMessage({
      type: "success",
      text:
        "Material added successfully.",
    });

    setShowCreateModal(
      false
    );

    resetForm();

    await fetchMaterials();
  } catch (error) {
    console.error(
      "Create material error:",
      error
    );

    setMessage({
      type: "error",
      text:
        error?.message ||
        "Unable to create material.",
    });
  } finally {
    setSaving(false);
  }
};

/* ==========================================================
DELETE MATERIAL
========================================================== */

const handleDeleteMaterial =
async (material) => {
const confirmed =
window.confirm(
`Delete "${material.title}"? This will permanently remove the material from the library.`
);

  if (!confirmed) {
    return;
  }

  try {
    setDeletingId(
      material.id
    );

    setMessage({
      type: "",
      text: "",
    });

    const token =
      getToken();

    if (!token) {
      throw new Error(
        "Your Academy session has expired. Please log in again."
      );
    }

    const response =
      await fetch(
        `${MATERIALS_URL}/${encodeURIComponent(
          material.id
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response
        )
      );
    }

    setMaterials(
      (previous) =>
        previous.filter(
          (item) =>
            String(item.id) !==
            String(
              material.id
            )
        )
    );

    if (
      selectedMaterial &&
      String(
        selectedMaterial.id
      ) ===
        String(material.id)
    ) {
      setSelectedMaterial(
        null
      );
    }

    setMessage({
      type: "success",
      text:
        "Material deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete material error:",
      error
    );

    setMessage({
      type: "error",
      text:
        error?.message ||
        "Unable to delete material.",
    });
  } finally {
    setDeletingId(null);
  }
};

/* ==========================================================
TOGGLE PUBLISHED
========================================================== */

const togglePublished =
async (material) => {
try {
setPublishingId(
material.id
);
    setMessage({
      type: "",
      text: "",
    });

    const token =
      getToken();

    if (!token) {
      throw new Error(
        "Your Academy session has expired. Please log in again."
      );
    }

    const nextPublished =
      !Boolean(
        material.published
      );

    const response =
      await fetch(
        `${MATERIALS_URL}/${encodeURIComponent(
          material.id
        )}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            published:
              nextPublished,
          }),
        }
      );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response
        )
      );
    }

    setMaterials(
      (previous) =>
        previous.map(
          (item) =>
            String(
              item.id
            ) ===
            String(
              material.id
            )
              ? {
                  ...item,
                  published:
                    nextPublished,
                }
              : item
        )
    );

    setSelectedMaterial(
      (previous) =>
        previous &&
        String(
          previous.id
        ) ===
          String(
            material.id
          )
          ? {
              ...previous,
              published:
                nextPublished,
            }
          : previous
    );
  } catch (error) {
    console.error(
      "Toggle published error:",
      error
    );

    setMessage({
      type: "error",
      text:
        error?.message ||
        "Unable to update material status.",
    });
  } finally {
    setPublishingId(null);
  }
};

/* ==========================================================
FILTERED MATERIALS
========================================================== */

const filteredMaterials =
useMemo(() => {
const search =
searchTerm
.trim()
.toLowerCase();

  return materials.filter(
    (material) => {
      const title =
        String(
          material.title ||
            ""
        ).toLowerCase();

      const subject =
        String(
          material.subject ||
            ""
        ).toLowerCase();

      const className =
        String(
          material.class_name ||
            material.className ||
            ""
        ).toLowerCase();

      const chapter =
        String(
          material.chapter ||
            ""
        ).toLowerCase();

      const topic =
        String(
          material.topic ||
            ""
        ).toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(
          search
        ) ||
        subject.includes(
          search
        ) ||
        className.includes(
          search
        ) ||
        chapter.includes(
          search
        ) ||
        topic.includes(
          search
        );

      const actualClass =
        material.class_name ||
        material.className ||
        "";

      const matchesClass =
        filterClass ===
          "All Classes" ||
        actualClass ===
          filterClass;

      const matchesSubject =
        filterSubject ===
          "All Subjects" ||
        material.subject ===
          filterSubject;

      return (
        matchesSearch &&
        matchesClass &&
        matchesSubject
      );
    }
  );
}, [
  materials,
  searchTerm,
  filterClass,
  filterSubject,
]);

/* ==========================================================
STATISTICS
========================================================== */

const totalMaterials =
materials.length;

const publishedMaterials =
materials.filter(
(item) =>
Boolean(
item.published
)
).length;

const unpublishedMaterials =
totalMaterials -
publishedMaterials;

const totalSubjects =
new Set(
materials
.map(
(item) =>
item.subject
)
.filter(Boolean)
).size;

/* ==========================================================
RENDER
========================================================== */

return ( <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8"> <div className="mx-auto max-w-7xl">

    {/* ==================================================
        HEADER
    ================================================== */}

    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
            <BookMarked
              size={22}
              className="text-blue-400"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Materials
            </h1>

            <p className="text-xs text-slate-500">
              Academy Textbook Library
            </p>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Manage textbooks and learning
          materials that will be available
          to Academy tutors and students.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={
            fetchMaterials
          }
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

        <button
          type="button"
          onClick={() =>
            setShowCreateModal(
              true
            )
          }
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
        >
          <Plus size={18} />

          Add Material
        </button>
      </div>
    </div>

    {/* ==================================================
        MESSAGE
    ================================================== */}

    {message.text && (
      <div
        className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 ${
          message.type ===
          "success"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            : "border-red-500/20 bg-red-500/10 text-red-300"
        }`}
      >
        {message.type ===
        "success" ? (
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />
        ) : (
          <XCircle
            size={18}
            className="mt-0.5 shrink-0"
          />
        )}

        <p className="text-sm">
          {message.text}
        </p>

        <button
          type="button"
          onClick={() =>
            setMessage({
              type: "",
              text: "",
            })
          }
          className="ml-auto text-slate-500 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    )}

    {/* ==================================================
        STAT CARDS
    ================================================== */}

    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

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
          Total Materials
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2
              size={19}
              className="text-emerald-400"
            />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Published
          </span>
        </div>

        <p className="text-2xl font-bold text-white">
          {publishedMaterials}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Available to users
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
            Drafts
          </span>
        </div>

        <p className="text-2xl font-bold text-white">
          {unpublishedMaterials}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Not currently published
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
          Subjects represented
        </p>
      </div>
    </div>

    {/* ==================================================
        FILTERS
    ================================================== */}

    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_200px_200px]">

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={
              searchTerm
            }
            onChange={(
              event
            ) =>
              setSearchTerm(
                event.target
                  .value
              )
            }
            placeholder="Search materials, subjects, chapters..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
          />
        </div>

        <select
          value={
            filterClass
          }
          onChange={(
            event
          ) =>
            setFilterClass(
              event.target
                .value
            )
          }
          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50"
        >
          <option>
            All Classes
          </option>

          {CLASS_OPTIONS.map(
            (className) => (
              <option
                key={
                  className
                }
                value={
                  className
                }
              >
                {className}
              </option>
            )
          )}
        </select>

        <select
          value={
            filterSubject
          }
          onChange={(
            event
          ) =>
            setFilterSubject(
              event.target
                .value
            )
          }
          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50"
        >
          <option>
            All Subjects
          </option>

          {SUBJECT_OPTIONS.map(
            (subject) => (
              <option
                key={
                  subject
                }
                value={
                  subject
                }
              >
                {subject}
              </option>
            )
          )}
        </select>
      </div>
    </div>

    {/* ==================================================
        MATERIALS
    ================================================== */}

    {loading ? (
      <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-blue-400"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading materials...
          </p>
        </div>
      </div>
    ) : filteredMaterials.length ===
      0 ? (
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
          Your Academy textbook library
          currently has no materials
          matching the selected filters.
        </p>

        <button
          type="button"
          onClick={() =>
            setShowCreateModal(
              true
            )
          }
          className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus size={17} />

          Add Material
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredMaterials.map(
          (material) => {
            const fileUrl =
              getMaterialFileUrl(
                material
              );

            const className =
              material.class_name ||
              material.className ||
              "";

            return (
              <div
                key={
                  material.id
                }
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/10">
                    <FileText
                      size={25}
                      className="text-red-400"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-white">
                          {
                            material.title
                          }
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          <span className="rounded-md border border-blue-500/10 bg-blue-500/10 px-2 py-1 text-[10px] font-medium text-blue-400">
                            {
                              material.subject
                            }
                          </span>

                          <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
                            {
                              className
                            }
                          </span>

                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                              material.published
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {material.published
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMaterial(
                            material
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                      >
                        <MoreVertical
                          size={18}
                        />
                      </button>
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
                              material.file_name
                            )
                          }
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">

                      {fileUrl && (
                        <a
                          href={
                            fileUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                        >
                          <Eye
                            size={
                              15
                            }
                          />

                          View
                        </a>
                      )}

                      <button
                        type="button"
                        disabled={
                          publishingId ===
                          material.id
                        }
                        onClick={() =>
                          togglePublished(
                            material
                          )
                        }
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          material.published
                            ? "border border-amber-500/10 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            : "border border-emerald-500/10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {publishingId ===
                        material.id ? (
                          <Loader2
                            size={
                              15
                            }
                            className="animate-spin"
                          />
                        ) : material.published ? (
                          <XCircle
                            size={
                              15
                            }
                          />
                        ) : (
                          <CheckCircle2
                            size={
                              15
                            }
                          />
                        )}

                        {material.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          material.id
                        }
                        onClick={() =>
                          handleDeleteMaterial(
                            material
                          )
                        }
                        className="flex items-center gap-2 rounded-lg border border-red-500/10 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId ===
                        material.id ? (
                          <Loader2
                            size={
                              15
                            }
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={
                              15
                            }
                          />
                        )}

                        Delete
                      </button>
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

  {/* ====================================================
      CREATE MODAL
  ==================================================== */}

  {showCreateModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Upload
                  size={19}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">
                  Add Material
                </h2>

                <p className="text-xs text-slate-500">
                  Add a textbook to the Academy
                  library
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              closeCreateModal
            }
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={
            handleCreateMaterial
          }
          className="space-y-5 p-6"
        >

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Material Title
            </label>

            <input
              type="text"
              name="title"
              value={
                form.title
              }
              onChange={
                handleFormChange
              }
              placeholder="e.g. Complete Mathematics for SS 2"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Subject
              </label>

              <select
                name="subject"
                value={
                  form.subject
                }
                onChange={
                  handleFormChange
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50"
              >
                <option value="">
                  Select Subject
                </option>

                {SUBJECT_OPTIONS.map(
                  (
                    subject
                  ) => (
                    <option
                      key={
                        subject
                      }
                      value={
                        subject
                      }
                    >
                      {
                        subject
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Class
              </label>

              <select
                name="className"
                value={
                  form.className
                }
                onChange={
                  handleFormChange
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50"
              >
                <option value="">
                  Select Class
                </option>

                {CLASS_OPTIONS.map(
                  (
                    className
                  ) => (
                    <option
                      key={
                        className
                      }
                      value={
                        className
                      }
                    >
                      {
                        className
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Chapter
              </label>

              <input
                type="text"
                name="chapter"
                value={
                  form.chapter
                }
                onChange={
                  handleFormChange
                }
                placeholder="e.g. Chapter 4"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Topic
              </label>

              <input
                type="text"
                name="topic"
                value={
                  form.topic
                }
                onChange={
                  handleFormChange
                }
                placeholder="e.g. Quadratic Equations"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleFormChange
              }
              rows={4}
              placeholder="Briefly describe what this material contains..."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Textbook / Material File
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-6 py-8 text-center transition hover:border-blue-500/40 hover:bg-blue-500/[0.03]">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Upload
                  size={21}
                  className="text-blue-400"
                />
              </div>

              {form.file ? (
                <>
                  <p className="mt-4 max-w-full truncate text-sm font-medium text-white">
                    {
                      form.file
                        .name
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(
                      form.file
                        .size
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm font-medium text-slate-300">
                    Choose textbook file
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    PDF, DOC or DOCX
                  </p>
                </>
              )}

              <input
                type="file"
                name="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={
                  handleFormChange
                }
                className="hidden"
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-4">

            <div>
              <p className="text-sm font-medium text-white">
                Publish immediately
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Published materials become
                available to tutors and students.
              </p>
            </div>

            <input
              type="checkbox"
              name="published"
              checked={
                form.published
              }
              onChange={
                handleFormChange
              }
              className="h-5 w-5 accent-blue-600"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                closeCreateModal
              }
              disabled={
                saving
              }
              className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Uploading...
                </>
              ) : (
                <>
                  <Upload
                    size={17}
                  />

                  Add Material
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* ====================================================
      MATERIAL DETAILS MODAL
  ==================================================== */}

  {selectedMaterial && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-white">
              Material Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Library information
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedMaterial(
                null
              )
            }
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">

          <div className="flex gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <BookOpen
                size={25}
                className="text-blue-400"
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">
                {
                  selectedMaterial.title
                }
              </h3>

              <p className="mt-1 truncate text-xs text-slate-500">
                {
                  selectedMaterial.file_name
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
                  selectedMaterial.subject
                }
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Class
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {
                  selectedMaterial.class_name ||
                  selectedMaterial.className
                }
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Chapter
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {
                  selectedMaterial.chapter ||
                  "Not specified"
                }
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Topic
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {
                  selectedMaterial.topic ||
                  "Not specified"
                }
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

            {getMaterialFileUrl(
              selectedMaterial
            ) && (
              <a
                href={getMaterialFileUrl(
                  selectedMaterial
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Eye size={17} />

                Open Material
              </a>
            )}

            <button
              type="button"
              onClick={() =>
                setSelectedMaterial(
                  null
                )
              }
              className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
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

export default AdminMaterials;
