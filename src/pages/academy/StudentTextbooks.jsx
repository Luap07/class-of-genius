import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  AlertCircle,
  BookOpen,
  Download,
  FileText,
  Loader2,
  Lock,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* ============================================================
   API
============================================================ */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const MATERIALS_URL =
  `${API_BASE_URL}/api/academy/student/materials`;

/* ============================================================
   STORAGE
============================================================ */

const MATERIAL_TOKEN_PREFIX =
  "scholiqen_material_access_";

const getToken = () => {
  return (
    localStorage.getItem(
      "scholiqen_academy_token"
    ) || ""
  ).trim();
};

const getUser = () => {
  try {
    const raw =
      localStorage.getItem(
        "scholiqen_academy_user"
      );

    return raw
      ? JSON.parse(raw)
      : {};
  } catch {
    return {};
  }
};

/* ============================================================
   MATERIAL ACCESS TOKEN STORAGE
============================================================ */

const getMaterialAccessToken = (
  materialId
) => {
  if (!materialId) return "";

  try {
    return (
      sessionStorage.getItem(
        `${MATERIAL_TOKEN_PREFIX}${materialId}`
      ) || ""
    ).trim();
  } catch {
    return "";
  }
};

const saveMaterialAccessToken = (
  materialId,
  token
) => {
  if (!materialId || !token) return;

  try {
    sessionStorage.setItem(
      `${MATERIAL_TOKEN_PREFIX}${materialId}`,
      token
    );
  } catch (error) {
    console.error(
      "Unable to save material access token:",
      error
    );
  }
};

const removeMaterialAccessToken = (
  materialId
) => {
  if (!materialId) return;

  try {
    sessionStorage.removeItem(
      `${MATERIAL_TOKEN_PREFIX}${materialId}`
    );
  } catch {
    // Ignore storage errors.
  }
};

/* ============================================================
   URL HELPERS
============================================================ */

const normalizeUrl = (url) => {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value}`;
};

/* ============================================================
   NORMALIZE MATERIAL
============================================================ */

const normalizeMaterial = (item) => {
  const material = item || {};

  return {
    ...material,

    id: material.id,

    title:
      material.title ||
      material.name ||
      "Untitled Material",

    description:
      material.description || "",

    subject:
      material.subject ||
      material.subject_name ||
      material.subjectName ||
      material.category ||
      "General",

    level:
      material.level ||
      material.class_name ||
      material.className ||
      material.class ||
      material.grade ||
      "All Classes",

    material_type:
      material.material_type ||
      material.type ||
      material.file_type ||
      material.file_mime_type ||
      "",

    file_name:
      material.file_name ||
      material.fileName ||
      material.title ||
      "material",

    /*
     * The secure student API should NOT expose
     * file_url anymore.
     *
     * We keep this only for compatibility with
     * any old response, but the application does
     * not use it to open protected materials.
     */

    file_url:
      material.file_url ||
      material.fileUrl ||
      material.url ||
      "",

    cover_page_url:
      material.cover_page_url ||
      material.coverPageUrl ||
      material.cover_url ||
      material.coverUrl ||
      material.thumbnail_url ||
      material.thumbnailUrl ||
      "",

    file_mime_type:
      material.file_mime_type ||
      material.file_type ||
      "",

    normalizedFileUrl:
      normalizeUrl(
        material.file_url ||
          material.fileUrl ||
          material.url
      ),

    normalizedCoverUrl:
      normalizeUrl(
        material.cover_page_url ||
          material.coverPageUrl ||
          material.cover_url ||
          material.coverUrl ||
          material.thumbnail_url ||
          material.thumbnailUrl
      ),

    is_locked:
      Boolean(
        material.is_locked ??
          material.isLocked ??
          true
      ),
  };
};

/* ============================================================
   TYPE
============================================================ */

const getMaterialType = (
  material
) => {
  const value = String(
    material?.material_type ||
      material?.file_type ||
      material?.file_mime_type ||
      material?.file_name ||
      ""
  ).toLowerCase();

  if (
    value.includes("video") ||
    value.includes(".mp4") ||
    value.includes(".webm") ||
    value.includes(".mov") ||
    value.includes("quicktime")
  ) {
    return "video";
  }

  if (
    value.includes("pdf") ||
    value.includes(".pdf")
  ) {
    return "pdf";
  }

  return "document";
};

/* ============================================================
   COMPONENT
============================================================ */

export default function StudentTextbooks() {
  const navigate = useNavigate();

  const [materials, setMaterials] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [level, setLevel] =
    useState("All");

  const [unlockMaterial, setUnlockMaterial] =
    useState(null);

  const [accessCode, setAccessCode] =
    useState("");

  const [unlocking, setUnlocking] =
    useState(false);

  const [unlockError, setUnlockError] =
    useState("");

  const [downloadLoading, setDownloadLoading] =
    useState(null);

  const user = useMemo(
    () => getUser(),
    []
  );

  /* ==========================================================
     LOAD MATERIALS
  ========================================================== */

  const loadMaterials =
    useCallback(async () => {
      setLoading(true);
      setError("");

      const token =
        getToken();

      console.log(
        "=========================================="
      );

      console.log(
        "STUDENT MATERIALS DEBUG"
      );

      console.log(
        "=========================================="
      );

      console.log(
        "API URL:",
        MATERIALS_URL
      );

      console.log(
        "Academy token:",
        token
          ? "YES"
          : "NO"
      );

      console.log(
        "Academy user:",
        user
      );

      console.log(
        "=========================================="
      );

      if (!token) {
        setError(
          "Your Academy login token is missing. Please log out and log in again."
        );

        setLoading(false);

        return;
      }

      try {
        const response =
          await fetch(
            MATERIALS_URL,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              cache:
                "no-store",
            }
          );

        const text =
          await response.text();

        console.log(
          "Materials HTTP status:",
          response.status
        );

        console.log(
          "Materials raw response:",
          text
        );

        let data = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          data = {
            error: text,
          };
        }

        console.log(
          "Materials parsed response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Server returned HTTP ${response.status}`
          );
        }

        if (
          data?.success === false
        ) {
          throw new Error(
            data?.error ||
              data?.message ||
              "The server rejected the materials request."
          );
        }

        const rows =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.materials
              )
            ? data.materials
            : Array.isArray(
                data?.data
              )
            ? data.data
            : Array.isArray(
                data?.results
              )
            ? data.results
            : [];

        const normalized =
          rows
            .map(
              normalizeMaterial
            )
            .filter(
              (item) =>
                item.id !==
                undefined &&
                item.id !==
                null
            );

        console.log(
          "Normalized materials:",
          normalized
        );

        setMaterials(
          normalized
        );
      } catch (err) {
        console.error(
          "=========================================="
        );

        console.error(
          "STUDENT MATERIALS FETCH ERROR"
        );

        console.error(
          "=========================================="
        );

        console.error(
          err
        );

        let message =
          err?.message ||
          "Failed to fetch materials.";

        if (
          message ===
            "Failed to fetch" ||
          message.includes(
            "NetworkError"
          ) ||
          message.includes(
            "Load failed"
          )
        ) {
          message =
            `Cannot connect to the backend server. ` +
            `The frontend is trying to reach ${MATERIALS_URL}. ` +
            `Make sure the Express server is running on port 5000 and CORS is enabled.`;
        }

        setError(
          message
        );

        setMaterials([]);
      } finally {
        setLoading(false);
      }
    }, [user]);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  /* ==========================================================
     LEVELS
  ========================================================== */

  const levels = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          materials
            .map(
              (item) =>
                item.level
            )
            .filter(Boolean)
        )
      ),
    ];
  }, [materials]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredMaterials =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return materials.filter(
        (material) => {
          const matchesSearch =
            !query ||
            String(
              material.title
            )
              .toLowerCase()
              .includes(query) ||
            String(
              material.subject
            )
              .toLowerCase()
              .includes(query) ||
            String(
              material.description
            )
              .toLowerCase()
              .includes(query);

          const matchesLevel =
            level === "All" ||
            String(
              material.level
            ) ===
              String(level);

          return (
            matchesSearch &&
            matchesLevel
          );
        }
      );
    }, [
      materials,
      search,
      level,
    ]);

  /* ==========================================================
     CLOSE UNLOCK MODAL
  ========================================================== */

  const closeUnlockModal =
    () => {
      if (unlocking) {
        return;
      }

      setUnlockMaterial(
        null
      );

      setAccessCode("");

      setUnlockError("");
    };

  /* ==========================================================
     NAVIGATE TO MATERIAL
  ========================================================== */

  const navigateToMaterial =
    (material) => {
      if (!material?.id) {
        return;
      }

      const type =
        getMaterialType(
          material
        );

      const materialId =
        encodeURIComponent(
          String(
            material.id
          )
        );

      if (
        type ===
        "video"
      ) {
        navigate(
          `/video/${materialId}`
        );

        return;
      }

      navigate(
        `/pdf/${materialId}`
      );
    };

  /* ==========================================================
     OPEN MATERIAL
  ========================================================== */

  const openMaterial = (
    material
  ) => {
    if (!material?.id) {
      return;
    }

    const existingToken =
      getMaterialAccessToken(
        material.id
      );

    /*
     * If the student already unlocked
     * this material during this session,
     * open it directly.
     */

    if (existingToken) {
      navigateToMaterial(
        material
      );

      return;
    }

    /*
     * Unlocked material:
     * create a material access token
     * without asking for a code.
     */

    if (
      !material.is_locked
    ) {
      unlockMaterialWithoutCode(
        material
      );

      return;
    }

    /*
     * Locked material.
     */

    setUnlockError("");

    setAccessCode("");

    setUnlockMaterial(
      material
    );
  };

  /* ==========================================================
     UNLOCK FREE / UNLOCKED MATERIAL
  ========================================================== */

  const unlockMaterialWithoutCode =
    async (material) => {
      if (!material?.id) {
        return;
      }

      setUnlocking(true);

      setUnlockError("");

      try {
        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Your Academy login session has expired. Please log in again."
          );
        }

        const response =
          await fetch(
            `${MATERIALS_URL}/${encodeURIComponent(
              String(material.id)
            )}/unlock`,
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                code: "",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to open material."
          );
        }

        if (
          !data?.accessToken
        ) {
          throw new Error(
            "The server did not return a material access token."
          );
        }

        saveMaterialAccessToken(
          material.id,
          data.accessToken
        );

        navigateToMaterial(
          material
        );
      } catch (error) {
        console.error(
          "Open material error:",
          error
        );

        /*
         * If an unlocked material is rejected
         * because the backend requires a code,
         * show the normal code modal.
         */

        setUnlockMaterial(
          material
        );

        setUnlockError(
          error?.message ||
            "Unable to open this material."
        );
      } finally {
        setUnlocking(false);
      }
    };

  /* ==========================================================
     SUBMIT ACCESS CODE
  ========================================================== */

  const handleUnlock =
    async (event) => {
      event.preventDefault();

      if (
        !unlockMaterial?.id
      ) {
        return;
      }

      const code =
        accessCode.trim();

      if (!code) {
        setUnlockError(
          "Enter the access code provided by your administrator."
        );

        return;
      }

      setUnlocking(true);

      setUnlockError("");

      try {
        const token =
          getToken();

        if (!token) {
          throw new Error(
            "Your Academy login session has expired. Please log in again."
          );
        }

        const materialId =
          String(
            unlockMaterial.id
          );

        const response =
          await fetch(
            `${MATERIALS_URL}/${encodeURIComponent(
              materialId
            )}/unlock`,
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                code,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "Unlock response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to unlock material. HTTP ${response.status}`
          );
        }

        if (
          data?.success === false
        ) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Incorrect access code."
          );
        }

        if (
          !data?.accessToken
        ) {
          throw new Error(
            "The server did not return a material access token."
          );
        }

        saveMaterialAccessToken(
          materialId,
          data.accessToken
        );

        const materialToOpen =
          unlockMaterial;

        setUnlockMaterial(
          null
        );

        setAccessCode("");

        setUnlockError("");

        navigateToMaterial(
          materialToOpen
        );
      } catch (error) {
        console.error(
          "Material unlock error:",
          error
        );

        setUnlockError(
          error?.message ||
            "Incorrect access code."
        );
      } finally {
        setUnlocking(false);
      }
    };

  /* ==========================================================
     DOWNLOAD MATERIAL
  ========================================================== */

  const downloadMaterial =
    async (material) => {
      if (!material?.id) {
        return;
      }

      try {
        setDownloadLoading(
          material.id
        );

        const academyToken =
          getToken();

        if (!academyToken) {
          throw new Error(
            "Your Academy login session has expired."
          );
        }

        let materialToken =
          getMaterialAccessToken(
            material.id
          );

        /*
         * Download also requires material
         * access.
         */

        if (!materialToken) {
          if (
            material.is_locked
          ) {
            setUnlockMaterial(
              material
            );

            setUnlockError(
              "Unlock this material first before downloading it."
            );

            return;
          }

          /*
           * Try to obtain an access token
           * for an unlocked material.
           */

          const unlockResponse =
            await fetch(
              `${MATERIALS_URL}/${encodeURIComponent(
                String(material.id)
              )}/unlock`,
              {
                method: "POST",

                headers: {
                  Accept:
                    "application/json",

                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${academyToken}`,
                },

                body: JSON.stringify({
                  code: "",
                }),
              }
            );

          const unlockData =
            await unlockResponse.json();

          if (
            !unlockResponse.ok ||
            !unlockData?.accessToken
          ) {
            throw new Error(
              unlockData?.message ||
                "Unable to unlock material for download."
            );
          }

          materialToken =
            unlockData.accessToken;

          saveMaterialAccessToken(
            material.id,
            materialToken
          );
        }

        const contentUrl =
          `${MATERIALS_URL}/${encodeURIComponent(
            String(material.id)
          )}/content`;

        const response =
          await fetch(
            contentUrl,
            {
              method: "GET",

              headers: {
                Accept:
                  material.file_type ||
                  "*/*",

                Authorization:
                  `Bearer ${academyToken}`,

                "X-Material-Access-Token":
                  materialToken,
              },
            }
          );

        if (
          !response.ok
        ) {
          if (
            response.status ===
            401
          ) {
            removeMaterialAccessToken(
              material.id
            );
          }

          throw new Error(
            `Download failed: HTTP ${response.status}`
          );
        }

        const blob =
          await response.blob();

        const blobUrl =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          blobUrl;

        anchor.download =
          material.file_name ||
          material.title ||
          "material";

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        setTimeout(() => {
          URL.revokeObjectURL(
            blobUrl
          );
        }, 1000);
      } catch (error) {
        console.error(
          "Material download error:",
          error
        );

        if (
          error?.message?.includes(
            "expired"
          )
        ) {
          setUnlockMaterial(
            material
          );
        }

        alert(
          error?.message ||
            "Unable to download this material."
        );
      } finally {
        setDownloadLoading(
          null
        );
      }
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-white/10 border-t-cyan-400 animate-spin" />

          <p className="mt-4 text-sm text-slate-400">
            Loading materials...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="min-h-[70vh] bg-[#050816] px-5 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-7">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold">
                  Unable to load materials
                </h2>

                <p className="mt-2 break-words text-sm leading-6 text-slate-400">
                  {error}
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">
                    API endpoint
                  </p>

                  <p className="mt-2 break-all text-sm text-slate-300">
                    {MATERIALS_URL}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={
                      loadMaterials
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
                  >
                    <RefreshCw className="h-4 w-4" />

                    Try Again
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/academy/student"
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.08]"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
                <BookOpen className="h-5 w-5 text-cyan-400" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">
                  Student Library
                </p>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Materials
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Access your class learning materials,
              documents and video resources.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {materials.length}{" "}
            {materials.length ===
            1
              ? "material"
              : "materials"}
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-7 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search materials..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.035] py-3.5 pl-11 pr-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {levels.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setLevel(item)
                  }
                  className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-medium ${
                    level === item
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-white/[0.035] text-slate-300"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        {/* MATERIALS */}
        {filteredMaterials.length ===
        0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-600" />

            <h2 className="mt-4 text-lg font-semibold">
              No materials found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No learning materials
              are currently available
              for your account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredMaterials.map(
              (
                material,
                index
              ) => {
                const type =
                  getMaterialType(
                    material
                  );

                const isLocked =
                  Boolean(
                    material.is_locked
                  );

                const hasAccess =
                  Boolean(
                    getMaterialAccessToken(
                      material.id
                    )
                  );

                return (
                  <motion.article
                    key={
                      material.id
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: Math.min(
                        index *
                          0.04,
                        0.25
                      ),
                    }}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition hover:border-cyan-400/20"
                  >

                    {/* COVER */}
                    <button
                      type="button"
                      onClick={() =>
                        openMaterial(
                          material
                        )
                      }
                      className="group block w-full text-left"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#0b1220]">

                        {material.normalizedCoverUrl ? (
                          <img
                            src={
                              material.normalizedCoverUrl
                            }
                            alt={
                              material.title
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            {type ===
                            "video" ? (
                              <PlayCircle className="h-12 w-12 text-cyan-400" />
                            ) : (
                              <FileText className="h-12 w-12 text-cyan-400" />
                            )}
                          </div>
                        )}

                        {/* TOP STATUS */}
                        <div className="absolute left-4 top-4">
                          {isLocked &&
                          !hasAccess ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur">
                              <Lock className="h-3.5 w-3.5" />

                              Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur">
                              <ShieldCheck className="h-3.5 w-3.5" />

                              {hasAccess
                                ? "Unlocked"
                                : "Available"}
                            </span>
                          )}
                        </div>

                        {/* BOTTOM */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex justify-between gap-2">
                            <span className="rounded-full bg-black/50 px-3 py-1 text-xs backdrop-blur">
                              {
                                material.subject
                              }
                            </span>

                            <span className="rounded-full bg-black/50 px-3 py-1 text-xs backdrop-blur">
                              {
                                material.level
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* BODY */}
                    <div className="p-5">

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                          {type ===
                          "video" ? (
                            <PlayCircle className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2 className="line-clamp-2 text-base font-semibold">
                            {
                              material.title
                            }
                          </h2>

                          <p className="mt-1 text-xs text-slate-500">
                            {type ===
                            "video"
                              ? "Video lesson"
                              : type ===
                                "pdf"
                              ? "PDF document"
                              : "Learning material"}
                          </p>
                        </div>

                        {isLocked &&
                          !hasAccess && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                              <Lock className="h-4 w-4" />
                            </div>
                          )}
                      </div>

                      {material.description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                          {
                            material.description
                          }
                        </p>
                      )}

                      {/* BUTTONS */}
                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openMaterial(
                              material
                            )
                          }
                          className="flex-1 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300"
                        >
                          {isLocked &&
                          !hasAccess
                            ? "Enter Access Code"
                            : type ===
                              "video"
                            ? "Watch Lesson"
                            : "Read Material"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            downloadMaterial(
                              material
                            )
                          }
                          disabled={
                            downloadLoading ===
                            material.id
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                          title={
                            isLocked &&
                            !hasAccess
                              ? "Unlock material first"
                              : "Download"
                          }
                        >
                          {downloadLoading ===
                          material.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          ACCESS CODE MODAL
      ====================================================== */}

      <AnimatePresence>
        {unlockMaterial && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeUnlockModal();
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              transition={{
                duration: 0.2,
              }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] shadow-2xl"
            >

              {/* MODAL HEADER */}
              <div className="flex items-start justify-between border-b border-white/10 p-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10">
                    <Lock className="h-5 w-5 text-amber-300" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">
                      Protected Material
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-white">
                      Enter Access Code
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeUnlockModal
                  }
                  disabled={
                    unlocking
                  }
                  className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <form
                onSubmit={
                  handleUnlock
                }
                className="p-6"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Material
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {
                      unlockMaterial.title
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      unlockMaterial.subject
                    }{" "}
                    •{" "}
                    {
                      unlockMaterial.level
                    }
                  </p>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Access Code
                  </span>

                  <input
                    type="password"
                    value={
                      accessCode
                    }
                    onChange={(
                      event
                    ) =>
                      setAccessCode(
                        event.target
                          .value
                      )
                    }
                    autoFocus
                    autoComplete="off"
                    placeholder="Enter the code provided by admin"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                </label>

                {unlockError && (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                    <p className="text-sm leading-6 text-red-300">
                      {
                        unlockError
                      }
                    </p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={
                      closeUnlockModal
                    }
                    disabled={
                      unlocking
                    }
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      unlocking ||
                      !accessCode.trim()
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {unlocking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Checking...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />

                        Unlock
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-5 text-center text-xs leading-5 text-slate-600">
                  The access code is provided by your
                  Academy administrator.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}