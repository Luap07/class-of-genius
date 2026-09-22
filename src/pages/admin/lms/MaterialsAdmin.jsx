import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Lock,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
  Upload,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const MATERIALS_URL =
  `${API_URL}/api/admin/lms/materials`;

/* ============================================================
   AUTH
============================================================ */

const getAuthToken = () => {
  return (
    localStorage.getItem("scholiqen_auth_token") ||
    localStorage.getItem("scholiqen_admin_token") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("scholiqen_auth_token") ||
    sessionStorage.getItem("scholiqen_admin_token") ||
    sessionStorage.getItem("admin_token") ||
    sessionStorage.getItem("auth_token") ||
    ""
  );
};

/* ============================================================
   HELPERS
============================================================ */

const formatFileSize = (bytes) => {
  if (!bytes || Number(bytes) <= 0) return "—";

  const value = Number(bytes);

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const getMaterialTypeLabel = (type) => {
  if (!type) return "Material";

  return String(type)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getFileIcon = (material) => {
  const mime = String(material?.file_mime_type || "").toLowerCase();

  if (mime.includes("pdf")) {
    return FileText;
  }

  return BookOpen;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function MaterialsAdmin() {
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [creating, setCreating] = useState(false);
  const [generatingCodeId, setGeneratingCodeId] = useState(null);
  const [lockingId, setLockingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    level: "",
    material_type: "textbook",
    file: null,
    cover_page: null,
    back_page: null,
  });

  /* ============================================================
     LOAD MATERIALS
  ============================================================ */

  const loadMaterials = useCallback(async (showRefresh = false) => {
    const token = getAuthToken();

    if (!token) {
      setError("Admin authentication token was not found.");
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(MATERIALS_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load learning materials."
        );
      }

      const rows =
        data.materials ||
        data.data ||
        data.results ||
        [];

      setMaterials(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("LOAD MATERIALS ERROR:", err);

      setError(
        err.message || "Unable to load learning materials."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  /* ============================================================
     FILTER OPTIONS
  ============================================================ */

  const subjects = useMemo(() => {
    return [
      ...new Set(
        materials
          .map((material) => material.subject)
          .filter(Boolean)
      ),
    ].sort();
  }, [materials]);

  const levels = useMemo(() => {
    return [
      ...new Set(
        materials
          .map((material) => material.level)
          .filter(Boolean)
      ),
    ].sort();
  }, [materials]);

  /* ============================================================
     FILTERED MATERIALS
  ============================================================ */

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesSearch =
        !query ||
        String(material.title || "")
          .toLowerCase()
          .includes(query) ||
        String(material.description || "")
          .toLowerCase()
          .includes(query) ||
        String(material.subject || "")
          .toLowerCase()
          .includes(query) ||
        String(material.level || "")
          .toLowerCase()
          .includes(query);

      const matchesSubject =
        subjectFilter === "all" ||
        material.subject === subjectFilter;

      const matchesLevel =
        levelFilter === "all" ||
        material.level === levelFilter;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLevel
      );
    });
  }, [
    materials,
    search,
    subjectFilter,
    levelFilter,
  ]);

  /* ============================================================
     FORM HANDLERS
  ============================================================ */

  const handleFormChange = (event) => {
    const { name, value, files } = event.target;

    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      subject: "",
      level: "",
      material_type: "textbook",
      file: null,
      cover_page: null,
      back_page: null,
    });
  };

  /* ============================================================
     CREATE MATERIAL
  ============================================================ */

  const handleCreateMaterial = async (event) => {
    event.preventDefault();

    const token = getAuthToken();

    if (!token) {
      setError("Admin authentication token was not found.");
      return;
    }

    if (!form.title.trim()) {
      setError("Material title is required.");
      return;
    }

    if (!form.file) {
      setError("Please select the main material file.");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("subject", form.subject);
      formData.append("level", form.level);
      formData.append("material_type", form.material_type);

      formData.append("file", form.file);

      if (form.cover_page) {
        formData.append(
          "cover_page",
          form.cover_page
        );
      }

      if (form.back_page) {
        formData.append(
          "back_page",
          form.back_page
        );
      }

      const response = await fetch(MATERIALS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create learning material."
        );
      }

      const created =
        data.material ||
        data.data;

      if (created) {
        setMaterials((current) => [
          created,
          ...current,
        ]);
      } else {
        await loadMaterials(true);
      }

      setSuccess(
        "Learning material created successfully."
      );

      resetForm();
      setShowCreateModal(false);
    } catch (err) {
      console.error("CREATE MATERIAL ERROR:", err);

      setError(
        err.message ||
          "Unable to create learning material."
      );
    } finally {
      setCreating(false);
    }
  };

  /* ============================================================
     GENERATE ACCESS CODE
     
     IMPORTANT:
     This uses the dedicated endpoint:
     
     POST /api/admin/lms/materials/:id/access-code
     
     It does NOT use PUT.
     ============================================================ */

  const handleGenerateCode = async (material) => {
    const token = getAuthToken();

    if (!token) {
      setError("Admin authentication token was not found.");
      return;
    }

    setGeneratingCodeId(material.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${MATERIALS_URL}/${material.id}/access-code`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to generate material access code."
        );
      }

      const accessCode =
        data.accessCode ||
        data.code ||
        data.material?.access_code;

      if (!accessCode) {
        throw new Error(
          "The server generated the code but did not return it."
        );
      }

      /*
       * IMPORTANT:
       * Update the actual card immediately.
       * The database already contains the same code.
       */
      setMaterials((currentMaterials) =>
        currentMaterials.map((item) =>
          item.id === material.id
            ? {
                ...item,
                access_code: accessCode,
                is_locked: true,
              }
            : item
        )
      );

      /*
       * Also update selected material if the details
       * panel/modal is currently open.
       */
      setSelectedMaterial((current) => {
        if (!current || current.id !== material.id) {
          return current;
        }

        return {
          ...current,
          access_code: accessCode,
          is_locked: true,
        };
      });

      setSuccess(
        material.access_code
          ? "Material access code loaded successfully."
          : "Material access code generated successfully."
      );
    } catch (err) {
      console.error(
        "GENERATE MATERIAL CODE ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to generate material access code."
      );
    } finally {
      setGeneratingCodeId(null);
    }
  };

  /* ============================================================
     COPY ACCESS CODE
  ============================================================ */

  const handleCopyCode = async (material) => {
    const code = material?.access_code;

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);

      setCopiedCodeId(material.id);

      setTimeout(() => {
        setCopiedCodeId((current) =>
          current === material.id
            ? null
            : current
        );
      }, 1800);
    } catch (err) {
      console.error("COPY CODE ERROR:", err);

      setError(
        "Unable to copy the access code."
      );
    }
  };

  /* ============================================================
     LOCK / UNLOCK
  ============================================================ */

  const handleToggleLock = async (material) => {
    const token = getAuthToken();

    if (!token) {
      setError("Admin authentication token was not found.");
      return;
    }

    setLockingId(material.id);
    setError("");
    setSuccess("");

    const nextLocked = !material.is_locked;

    try {
      const response = await fetch(
        `${MATERIALS_URL}/${material.id}/lock`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_locked: nextLocked,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update material lock status."
        );
      }

      setMaterials((currentMaterials) =>
        currentMaterials.map((item) =>
          item.id === material.id
            ? {
                ...item,
                is_locked: nextLocked,
              }
            : item
        )
      );

      setSelectedMaterial((current) => {
        if (!current || current.id !== material.id) {
          return current;
        }

        return {
          ...current,
          is_locked: nextLocked,
        };
      });

      setSuccess(
        nextLocked
          ? "Material locked successfully."
          : "Material unlocked successfully."
      );
    } catch (err) {
      console.error("TOGGLE LOCK ERROR:", err);

      setError(
        err.message ||
          "Unable to update material lock status."
      );
    } finally {
      setLockingId(null);
    }
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = async (material) => {
    const confirmed = window.confirm(
      `Delete "${material.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setError("Admin authentication token was not found.");
      return;
    }

    setDeletingId(material.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${MATERIALS_URL}/${material.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete learning material."
        );
      }

      setMaterials((current) =>
        current.filter(
          (item) => item.id !== material.id
        )
      );

      if (
        selectedMaterial?.id === material.id
      ) {
        setSelectedMaterial(null);
      }

      setSuccess(
        "Learning material deleted successfully."
      );
    } catch (err) {
      console.error("DELETE MATERIAL ERROR:", err);

      setError(
        err.message ||
          "Unable to delete learning material."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ============================================================
     DOWNLOAD / OPEN
  ============================================================ */

  const getFileUrl = (material) => {
    if (!material?.file_url) {
      return null;
    }

    if (
      material.file_url.startsWith("http://") ||
      material.file_url.startsWith("https://")
    ) {
      return material.file_url;
    }

    return `${API_URL}${material.file_url}`;
  };

  const handleOpenMaterial = (material) => {
    const url = getFileUrl(material);

    if (!url) {
      setError("No material file is available.");
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ============================================================
     STATS
  ============================================================ */

  const totalMaterials = materials.length;

  const lockedMaterials = materials.filter(
    (material) => material.is_locked
  ).length;

  const materialsWithCodes = materials.filter(
    (material) => Boolean(material.access_code)
  ).length;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                <BookOpen
                  size={22}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Learning Materials
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Manage textbooks, documents and learning resources.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadMaterials(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={17} />
              Add Material
            </button>
          </div>
        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-300">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-200/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-300 hover:text-white"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4"
            >
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <p className="flex-1 text-sm text-emerald-200">
                {success}
              </p>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="text-emerald-300 hover:text-white"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Materials
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {totalMaterials}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Locked
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-300">
              {lockedMaterials}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Access Codes
            </p>

            <p className="mt-2 text-2xl font-bold text-cyan-400">
              {materialsWithCodes}
            </p>
          </div>
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#071426] p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search materials..."
                className="w-full rounded-xl border border-white/10 bg-[#050816] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/40"
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/40"
            >
              <option value="all">
                All Subjects
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject}
                  value={subject}
                >
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/40"
            >
              <option value="all">
                All Levels
              </option>

              {levels.map((level) => (
                <option
                  key={level}
                  value={level}
                >
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#071426]">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw
                size={28}
                className="animate-spin text-cyan-400"
              />

              <p className="text-sm text-slate-400">
                Loading learning materials...
              </p>
            </div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          /* ====================================================
             EMPTY
          ==================================================== */

          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#071426] px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              <BookOpen
                size={25}
                className="text-slate-500"
              />
            </div>

            <h3 className="text-lg font-bold text-white">
              No materials found
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {search ||
              subjectFilter !== "all" ||
              levelFilter !== "all"
                ? "Try changing your search or filters."
                : "Add your first learning material to get started."}
            </p>
          </div>
        ) : (
          /* ====================================================
             MATERIAL CARDS
          ==================================================== */

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredMaterials.map(
              (material, index) => {
                const Icon =
                  getFileIcon(material);

                const isGenerating =
                  generatingCodeId ===
                  material.id;

                const isLocking =
                  lockingId === material.id;

                const isDeleting =
                  deletingId === material.id;

                const hasCode =
                  Boolean(material.access_code);

                return (
                  <motion.div
                    key={material.id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.03,
                    }}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#071426]"
                  >
                    {/* CARD HEADER */}

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                          <Icon
                            size={22}
                            className="text-cyan-400"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h2 className="break-words text-lg font-bold text-white">
                                {material.title}
                              </h2>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {material.subject && (
                                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                                    {material.subject}
                                  </span>
                                )}

                                {material.level && (
                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                    {material.level}
                                  </span>
                                )}

                                {material.material_type && (
                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                                    {getMaterialTypeLabel(
                                      material.material_type
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              {material.is_locked ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                                  <Lock size={12} />
                                  Locked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                                  <Unlock size={12} />
                                  Open
                                </span>
                              )}
                            </div>
                          </div>

                          {material.description && (
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                              {material.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ==================================================
                          MATERIAL META
                      ================================================== */}

                      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-[#050816] p-3 sm:grid-cols-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            File
                          </p>

                          <p className="mt-1 truncate text-xs font-medium text-slate-300">
                            {material.file_name ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Size
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-300">
                            {formatFileSize(
                              material.file_size
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Type
                          </p>

                          <p className="mt-1 truncate text-xs font-medium text-slate-300">
                            {material.file_mime_type ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Added
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-300">
                            {formatDate(
                              material.created_at
                            )}
                          </p>
                        </div>
                      </div>

                      {/* ==================================================
                          ACCESS CODE CARD
                          
                          THIS IS THE IMPORTANT PART.
                          
                          The code stays here because it is loaded
                          directly from material.access_code.
                          ================================================== */}

                      <div
                        className={`mt-4 rounded-xl border p-4 ${
                          hasCode
                            ? "border-cyan-500/20 bg-cyan-500/5"
                            : "border-white/10 bg-white/[0.02]"
                        }`}
                      >
                        {hasCode ? (
                          <>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <LockKeyhole
                                    size={15}
                                    className="text-cyan-400"
                                  />

                                  <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                                    Material Access Code
                                  </p>
                                </div>

                                <p className="mt-2 break-all font-mono text-lg font-bold tracking-[0.12em] text-white">
                                  {material.access_code}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyCode(
                                    material
                                  )
                                }
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                              >
                                {copiedCodeId ===
                                material.id ? (
                                  <>
                                    <CheckCircle2
                                      size={14}
                                    />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy
                                      size={14}
                                    />
                                    Copy Code
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="mt-2 text-[11px] leading-5 text-slate-500">
                              This access code is saved to
                              the material and remains available
                              after logout and login.
                            </p>
                          </>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-300">
                                No Access Code
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Generate a code to protect this
                                material.
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={isGenerating}
                              onClick={() =>
                                handleGenerateCode(
                                  material
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isGenerating ? (
                                <>
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <LockKeyhole
                                    size={14}
                                  />
                                  Generate Code
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenMaterial(
                              material
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          <Download size={14} />
                          Open
                        </button>

                        {hasCode && (
                          <button
                            type="button"
                            disabled={isGenerating}
                            onClick={() =>
                              handleGenerateCode(
                                material
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10 disabled:opacity-50"
                          >
                            <RefreshCw
                              size={14}
                              className={
                                isGenerating
                                  ? "animate-spin"
                                  : ""
                              }
                            />
                            Load Code
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isLocking}
                          onClick={() =>
                            handleToggleLock(
                              material
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                        >
                          {material.is_locked ? (
                            <>
                              <Unlock size={14} />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock size={14} />
                              Lock
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            handleDelete(
                              material
                            )
                          }
                          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={14} />
                          )}

                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          CREATE MATERIAL MODAL
      ============================================================ */}

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 10,
              }}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#071426] shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#071426] p-5">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Add Learning Material
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload a new material for students.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={handleCreateMaterial}
                className="space-y-5 p-5"
              >
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Title
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Enter material title"
                    className="w-full rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Describe this material..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Subject
                    </label>

                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleFormChange}
                      placeholder="e.g. Mathematics"
                      className="w-full rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Level
                    </label>

                    <input
                      name="level"
                      value={form.level}
                      onChange={handleFormChange}
                      placeholder="e.g. JSS 2"
                      className="w-full rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Material Type
                  </label>

                  <select
                    name="material_type"
                    value={form.material_type}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                  >
                    <option value="textbook">
                      Textbook
                    </option>

                    <option value="study_material">
                      Study Material
                    </option>

                    <option value="worksheet">
                      Worksheet
                    </option>

                    <option value="past_question">
                      Past Question
                    </option>

                    <option value="handout">
                      Handout
                    </option>

                    <option value="document">
                      Document
                    </option>
                  </select>
                </div>

                {/* MAIN FILE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Main Material File
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#050816] p-4 transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Upload
                        size={18}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200">
                        {form.file
                          ? form.file.name
                          : "Choose material file"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PDF, DOC, DOCX and supported files
                      </p>
                    </div>

                    <input
                      type="file"
                      name="file"
                      onChange={handleFormChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* COVER */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cover Page
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#050816] p-4 transition hover:border-cyan-500/30">
                    <Upload
                      size={17}
                      className="text-slate-500"
                    />

                    <p className="truncate text-sm text-slate-300">
                      {form.cover_page
                        ? form.cover_page.name
                        : "Choose cover page"}
                    </p>

                    <input
                      type="file"
                      name="cover_page"
                      onChange={handleFormChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>

                {/* BACK */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Back Page
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#050816] p-4 transition hover:border-cyan-500/30">
                    <Upload
                      size={17}
                      className="text-slate-500"
                    />

                    <p className="truncate text-sm text-slate-300">
                      {form.back_page
                        ? form.back_page.name
                        : "Choose back page"}
                    </p>

                    <input
                      type="file"
                      name="back_page"
                      onChange={handleFormChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateModal(false)
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Material
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          MATERIAL DETAILS MODAL
      ============================================================ */}

      <AnimatePresence>
        {selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() =>
              setSelectedMaterial(null)
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#071426] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedMaterial.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Material details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedMaterial(null)
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedMaterial.access_code ? (
                <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <div className="flex items-center gap-2">
                    <LockKeyhole
                      size={17}
                      className="text-cyan-400"
                    />

                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Access Code
                    </p>
                  </div>

                  <p className="mt-3 break-all font-mono text-2xl font-bold tracking-widest text-white">
                    {selectedMaterial.access_code}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCode(
                        selectedMaterial
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300"
                  >
                    <Copy size={15} />

                    {copiedCodeId ===
                    selectedMaterial.id
                      ? "Copied"
                      : "Copy Code"}
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-slate-400">
                    No access code has been generated
                    for this material yet.
                  </p>

                  <button
                    type="button"
                    disabled={
                      generatingCodeId ===
                      selectedMaterial.id
                    }
                    onClick={() =>
                      handleGenerateCode(
                        selectedMaterial
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950"
                  >
                    {generatingCodeId ===
                    selectedMaterial.id ? (
                      <>
                        <RefreshCw
                          size={15}
                          className="animate-spin"
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <LockKeyhole
                          size={15}
                        />
                        Generate Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}