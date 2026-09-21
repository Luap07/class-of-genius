import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
AlertCircle,
BookOpen,
Download,
FileText,
Loader2,
PlayCircle,
RefreshCw,
Search,
X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
"http://localhost:5000";

const MATERIALS_ENDPOINT =
`${API_BASE_URL}/api/academy/student/materials`;

const getAcademyToken = () =>
localStorage.getItem("scholiqen_academy_token") ||
localStorage.getItem("scholiqen_auth_token") ||
"";

const getAcademyUser = () => {
try {
return JSON.parse(
localStorage.getItem("scholiqen_academy_user") ||
localStorage.getItem("scholiqen_current_user") ||
"{}"
);
} catch {
return {};
}
};

const normalizeFileUrl = (value) => {
if (!value) return "";

const url = String(value).trim();

if (!url) return "";

if (/^https?:\/\//i.test(url)) {
return url;
}

if (url.startsWith("/")) {
return `${API_BASE_URL}${url}`;
}

return `${API_BASE_URL}/${url}`;
};

const normalizeMaterial = (item, index) => {
const material = item || {};

const id =
material.id ??
material.material_id ??
material.materialId ??
index;

const title =
material.title ||
material.name ||
"Untitled Material";

const description =
material.description ||
material.summary ||
"";

const subject =
material.subject ||
material.subject_name ||
material.subjectName ||
"General";

const level =
material.level ||
material.class_name ||
material.className ||
material.class ||
material.grade ||
"All Classes";

const materialType =
material.material_type ||
material.materialType ||
material.type ||
material.file_type ||
material.fileType ||
"";

const fileUrl =
material.file_url ||
material.fileUrl ||
material.url ||
material.download_url ||
material.downloadUrl ||
"";

const coverUrl =
material.cover_page_url ||
material.coverPageUrl ||
material.cover_url ||
material.coverUrl ||
material.thumbnail_url ||
material.thumbnailUrl ||
"";

const fileName =
material.file_name ||
material.fileName ||
"";

const fileMimeType =
material.file_mime_type ||
material.fileMimeType ||
material.mime_type ||
material.mimeType ||
"";

return {
...material,
id,
title,
description,
subject,
level,
material_type: materialType,
file_url: fileUrl,
cover_page_url: coverUrl,
file_name: fileName,
file_mime_type: fileMimeType,
normalizedFileUrl: normalizeFileUrl(fileUrl),
normalizedCoverUrl: normalizeFileUrl(coverUrl),
};
};

const getMaterialKind = (material) => {
const type = String(
material?.material_type ||
material?.file_mime_type ||
material?.file_name ||
material?.file_url ||
""
).toLowerCase();

if (
type.includes("video") ||
type.includes("mp4") ||
type.includes("webm") ||
type.includes("mov")
) {
return "video";
}

if (
type.includes("pdf") ||
type.includes(".pdf")
) {
return "pdf";
}

return "document";
};

const getInitials = (title) => {
return String(title || "M")
.split(/\s+/)
.filter(Boolean)
.slice(0, 2)
.map((word) => word[0]?.toUpperCase())
.join("");
};

export default function StudentTextbooks() {
const navigate = useNavigate();

const [materials, setMaterials] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [selectedLevel, setSelectedLevel] = useState("All");

const academyUser = useMemo(() => getAcademyUser(), []);

const loadMaterials = useCallback(async () => {
setLoading(true);
setError("");
try {
  const token = getAcademyToken();

  const params = new URLSearchParams();

  const studentId =
    academyUser?.studentId ||
    academyUser?.student_id ||
    academyUser?.id ||
    "";

  const email = academyUser?.email || "";

  if (studentId) {
    params.set("studentId", String(studentId));
  }

  if (email) {
    params.set("email", String(email));
  }

  const url = params.toString()
    ? `${MATERIALS_ENDPOINT}?${params.toString()}`
    : MATERIALS_ENDPOINT;

  console.log("STUDENT MATERIALS REQUEST:", url);
  console.log("STUDENT MATERIALS TOKEN EXISTS:", Boolean(token));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    cache: "no-store",
  });

  const rawText = await response.text();

  let payload = {};

  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    payload = {
      message: rawText,
    };
  }

  console.log("STUDENT MATERIALS STATUS:", response.status);
  console.log("STUDENT MATERIALS RESPONSE:", payload);

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        payload?.error ||
        `Materials request failed with status ${response.status}`
    );
  }

  if (payload?.success === false) {
    throw new Error(
      payload?.message ||
        payload?.error ||
        "The server could not load the materials."
    );
  }

  const rows =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.materials)
      ? payload.materials
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.results)
      ? payload.results
      : [];

  const normalized = rows.map(normalizeMaterial);

  setMaterials(normalized);
} catch (err) {
  console.error("STUDENT MATERIALS ERROR:", err);

  let message = err?.message || "Failed to fetch";

  if (
    message === "Failed to fetch" ||
    message.includes("NetworkError") ||
    message.includes("Load failed")
  ) {
    message =
      `Unable to connect to the Scholiqen server at ${API_BASE_URL}. ` +
      `Make sure your backend is running and VITE_API_URL is correct.`;
  }

  setError(message);
  setMaterials([]);
} finally {
  setLoading(false);
}

}, [academyUser]);

useEffect(() => {
loadMaterials();
}, [loadMaterials]);

const levels = useMemo(() => {
const values = materials
.map((material) => material.level)
.filter(Boolean);

return ["All", ...Array.from(new Set(values))];

}, [materials]);

const filteredMaterials = useMemo(() => {
const query = search.trim().toLowerCase();

return materials.filter((material) => {
  const matchesSearch =
    !query ||
    String(material.title || "")
      .toLowerCase()
      .includes(query) ||
    String(material.subject || "")
      .toLowerCase()
      .includes(query) ||
    String(material.description || "")
      .toLowerCase()
      .includes(query) ||
    String(material.level || "")
      .toLowerCase()
      .includes(query);

  const matchesLevel =
    selectedLevel === "All" ||
    String(material.level) === String(selectedLevel);

  return matchesSearch && matchesLevel;
});

}, [materials, search, selectedLevel]);

const handleOpenMaterial = (material) => {
if (!material?.id) return;
const kind = getMaterialKind(material);

if (kind === "video") {
  navigate(
    `/video/${encodeURIComponent(String(material.id))}`
  );
  return;
}

navigate(
  `/pdf/${encodeURIComponent(String(material.id))}`
);

};

const handleDownload = async (material) => {
if (!material?.normalizedFileUrl) {
return;
}

try {
  const token = getAcademyToken();

  const response = await fetch(material.normalizedFileUrl, {
    headers: {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Download failed with status ${response.status}`
    );
  }

  const blob = await response.blob();

  const blobUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download =
    material.file_name ||
    `${material.title || "material"}.pdf`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(blobUrl);
} catch (err) {
  console.error("MATERIAL DOWNLOAD ERROR:", err);

  window.open(
    material.normalizedFileUrl,
    "_blank",
    "noopener,noreferrer"
  );
}

};

const clearSearch = () => {
setSearch("");
setSelectedLevel("All");
};

if (loading) {
return ( <div className="min-h-[70vh] bg-[#050816] text-white flex items-center justify-center"> <div className="flex flex-col items-center gap-4"> <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-cyan-400 animate-spin" />
      <div className="flex items-center gap-2 text-slate-300">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading materials...
      </div>
    </div>
  </div>
);
}

if (error) {
return ( <div className="min-h-[70vh] bg-[#050816] text-white px-4 py-10"> <div className="max-w-3xl mx-auto"> <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-7"> <div className="flex items-start gap-4"> <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0"> <AlertCircle className="w-6 h-6 text-red-400" /> </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              Unable to load materials
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {error}
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Materials API
              </p>

              <p className="mt-2 break-all text-sm text-slate-300">
                {MATERIALS_ENDPOINT}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadMaterials}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/academy/student")
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.08] transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

return ( <div className="min-h-screen bg-[#050816] text-white px-4 py-6 sm:px-6 lg:px-8"> <div className="max-w-7xl mx-auto">
<motion.div
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
className="mb-7"
> <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"> <div> <div className="flex items-center gap-3"> <div className="w-11 h-11 rounded-2xl bg-cyan-400/10 flex items-center justify-center"> <BookOpen className="w-5 h-5 text-cyan-400" /> </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">
                Student Library
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold">
                Materials
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Access your class learning materials, documents,
            textbooks and video resources.
          </p>
        </div>

        <div className="text-sm text-slate-400">
          {materials.length}{" "}
          {materials.length === 1
            ? "material"
            : "materials"}
        </div>
      </div>
    </motion.div>

    <div className="mb-7 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search materials..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.035] py-3.5 pl-11 pr-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setSelectedLevel(level)}
            className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-medium transition ${
              selectedLevel === level
                ? "bg-cyan-400 text-slate-950"
                : "border border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.07]"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>

    {filteredMaterials.length === 0 ? (
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
          <FileText className="w-6 h-6 text-slate-500" />
        </div>

        <h2 className="text-lg font-semibold text-white">
          No materials found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {search || selectedLevel !== "All"
            ? "Try changing your search or class filter."
            : "No learning materials have been added yet."}
        </p>

        {(search || selectedLevel !== "All") && (
          <button
            type="button"
            onClick={clearSearch}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.08]"
          >
            Clear Filters
          </button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredMaterials.map((material, index) => {
          const kind = getMaterialKind(material);

          return (
            <motion.article
              key={material.id ?? index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(index * 0.04, 0.3),
              }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] hover:border-cyan-400/20 transition"
            >
              <button
                type="button"
                onClick={() =>
                  handleOpenMaterial(material)
                }
                className="group block w-full text-left"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#0b1220]">
                  {material.normalizedCoverUrl ? (
                    <img
                      src={material.normalizedCoverUrl}
                      alt={material.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.05]">
                        {kind === "video" ? (
                          <PlayCircle className="h-9 w-9 text-cyan-400" />
                        ) : (
                          <FileText className="h-9 w-9 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4">
                    <div className="flex items-end justify-between gap-3">
                      <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {material.subject}
                      </span>

                      <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-slate-200 backdrop-blur">
                        {material.level}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                    {kind === "video" ? (
                      <PlayCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-bold">
                        {getInitials(material.title)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-base font-semibold text-white">
                      {material.title}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {kind === "video"
                        ? "Video lesson"
                        : kind === "pdf"
                        ? "PDF document"
                        : "Learning material"}
                    </p>
                  </div>
                </div>

                {material.description && (
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                    {material.description}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenMaterial(material)
                    }
                    className="flex-1 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    {kind === "video"
                      ? "Watch Lesson"
                      : "Read Material"}
                  </button>

                  {material.normalizedFileUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(material)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    )}
  </div>
</div>
);
}
