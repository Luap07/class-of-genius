import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const MAX_FILE_SIZE = 250 * 1024 * 1024;

const MATERIAL_ACCEPT =
  ".pdf,.doc,.docx,.mp4,.webm,.mov";

const COVER_ACCEPT =
  ".jpg,.jpeg,.png,.webp";

const LEVELS = [
  "JSS1",
  "JSS2",
  "JSS3",
  "SS1",
  "SS2",
  "SS3",
];

const MATERIAL_TYPES = [
  {
    value: "pdf",
    label: "PDF",
  },
  {
    value: "doc",
    label: "Word Document",
  },
  {
    value: "video",
    label: "Video",
  },
];

function getFileUrl(url) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}

function formatBytes(bytes) {
  if (!bytes || Number(bytes) <= 0) {
    return "0 Bytes";
  }

  const value = Number(bytes);
  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(value) / Math.log(1024)
  );

  return `${(
    value / Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function getMaterialType(fileName = "", materialType = "") {
  if (materialType) {
    return materialType;
  }

  const extension =
    fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "pdf";

  if (
    extension === "doc" ||
    extension === "docx"
  ) {
    return "doc";
  }

  if (
    extension === "mp4" ||
    extension === "webm" ||
    extension === "mov"
  ) {
    return "video";
  }

  return "pdf";
}

export default function MaterialEditor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [material, setMaterial] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("SS1");
  const [materialType, setMaterialType] =
    useState("pdf");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [coverPage, setCoverPage] =
    useState(null);

  const [backPage, setBackPage] =
    useState(null);

  const [coverPreview, setCoverPreview] =
    useState("");

  const [backPreview, setBackPreview] =
    useState("");

  const existingFileUrl = useMemo(() => {
    return getFileUrl(material?.file_url);
  }, [material]);

  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }

      if (backPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(backPreview);
      }
    };
  }, [coverPreview, backPreview]);

  useEffect(() => {
    loadMaterial();
  }, [id]);

  async function loadMaterial() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/lms/materials/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to load material."
        );
      }

      const item =
        data?.material ||
        data?.data ||
        data;

      if (!item) {
        throw new Error(
          "Material could not be found."
        );
      }

      setMaterial(item);

      setTitle(item.title || "");
      setDescription(item.description || "");
      setSubject(item.subject || "");
      setLevel(item.level || "SS1");

      setMaterialType(
        getMaterialType(
          item.file_name,
          item.material_type
        )
      );

      const existingCover =
        item.cover_page_url ||
        item.cover_url ||
        item.cover_image_url ||
        "";

      const existingBack =
        item.back_page_url ||
        item.back_cover_url ||
        item.back_image_url ||
        "";

      setCoverPreview(
        existingCover
          ? getFileUrl(existingCover)
          : ""
      );

      setBackPreview(
        existingBack
          ? getFileUrl(existingBack)
          : ""
      );
    } catch (err) {
      console.error(
        "Load material error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load material."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMaterialFileChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "The material file cannot be larger than 250MB."
      );

      event.target.value = "";
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    const allowed = [
      "pdf",
      "doc",
      "docx",
      "mp4",
      "webm",
      "mov",
    ];

    if (!allowed.includes(extension)) {
      setError(
        "Only PDF, DOC, DOCX, MP4, WebM, and MOV files are allowed."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);

    setMaterialType(
      extension === "pdf"
        ? "pdf"
        : extension === "doc" ||
          extension === "docx"
        ? "doc"
        : "video"
    );
  }

  function handleCoverPageChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setError(
        "Cover Page must be a JPG, JPEG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setCoverPage(file);
    setCoverPreview(previewUrl);
    setError("");
  }

  function handleBackPageChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setError(
        "Back Page must be a JPG, JPEG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    if (backPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(backPreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setBackPage(file);
    setBackPreview(previewUrl);
    setError("");
  }

  function removeCoverPage() {
    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverPage(null);
    setCoverPreview("");
  }

  function removeBackPage() {
    if (backPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(backPreview);
    }

    setBackPage(null);
    setBackPreview("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Material title is required.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!level) {
      setError("Academic level is required.");
      return;
    }

    if (!coverPreview) {
      setError(
        "Please upload the Cover Page."
      );
      return;
    }

    if (!backPreview) {
      setError(
        "Please upload the Back Page."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "subject",
        subject.trim()
      );

      formData.append(
        "level",
        level
      );

      formData.append(
        "material_type",
        materialType
      );

      if (selectedFile) {
        formData.append(
          "file",
          selectedFile
        );
      }

      if (coverPage) {
        formData.append(
          "cover_page",
          coverPage
        );
      }

      if (backPage) {
        formData.append(
          "back_page",
          backPage
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/lms/materials/${id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to save material."
        );
      }

      const updatedMaterial =
        data?.material ||
        data?.data ||
        data;

      if (updatedMaterial) {
        setMaterial(updatedMaterial);

        setTitle(
          updatedMaterial.title || title
        );

        setDescription(
          updatedMaterial.description ||
            description
        );

        setSubject(
          updatedMaterial.subject || subject
        );

        setLevel(
          updatedMaterial.level || level
        );

        setMaterialType(
          getMaterialType(
            updatedMaterial.file_name,
            updatedMaterial.material_type ||
              materialType
          )
        );

        if (
          updatedMaterial.cover_page_url
        ) {
          setCoverPreview(
            getFileUrl(
              updatedMaterial.cover_page_url
            )
          );
        }

        if (
          updatedMaterial.back_page_url
        ) {
          setBackPreview(
            getFileUrl(
              updatedMaterial.back_page_url
            )
          );
        }
      }

      setSelectedFile(null);
      setCoverPage(null);
      setBackPage(null);

      setSuccess(
        "Material saved successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Save material error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save material."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Delete this material permanently? This will remove the material and its uploaded cover files."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/lms/materials/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to delete material."
        );
      }

      navigate(
        "/admin/lms/materials",
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "Delete material error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete material."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Loading material...
        </div>
      </div>
    );
  }

  if (!material && error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/lms/materials"
              )
            }
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8"
          >
            <ArrowLeft size={18} />
            Back to Materials
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/lms/materials"
                )
              }
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              Back to Materials
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                <BookOpen
                  size={22}
                  className="text-cyan-300"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Edit Material
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                  Update the material and its
                  physical textbook covers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/15 disabled:opacity-50 transition"
            >
              {deleting ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={17} />
              )}

              Delete
            </button>

            <button
              type="submit"
              form="material-editor-form"
              disabled={saving || deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              Save Changes
            </button>
          </div>
        </div>

        {/* =====================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 flex items-start gap-3">
            <X
              size={19}
              className="text-red-300 mt-0.5 shrink-0"
            />

            <p className="text-sm text-red-200">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 flex items-start gap-3">
            <CheckCircle2
              size={19}
              className="text-emerald-300 mt-0.5 shrink-0"
            />

            <p className="text-sm text-emerald-200">
              {success}
            </p>
          </div>
        )}

        <form
          id="material-editor-form"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_500px] gap-6">

            {/* =================================================
                LEFT
            ================================================== */}

            <div className="space-y-6">

              {/* MATERIAL INFORMATION */}

              <section className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <h2 className="font-bold text-lg">
                    Material Information
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    These details identify the
                    material in the admin system.
                  </p>
                </div>

                <div className="p-5 space-y-5">

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Material Title
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(event) =>
                        setTitle(
                          event.target.value
                        )
                      }
                      placeholder="Enter material title"
                      className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                      This is used to identify the
                      material. It is not placed on
                      the textbook cover.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value
                        )
                      }
                      rows={5}
                      placeholder="Describe this material..."
                      className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Subject
                      </label>

                      <input
                        type="text"
                        value={subject}
                        onChange={(event) =>
                          setSubject(
                            event.target.value
                          )
                        }
                        placeholder="e.g. Physics"
                        className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Academic Level
                      </label>

                      <select
                        value={level}
                        onChange={(event) =>
                          setLevel(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                      >
                        {LEVELS.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                              className="bg-[#020617]"
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Material Type
                    </label>

                    <select
                      value={materialType}
                      onChange={(event) =>
                        setMaterialType(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    >
                      {MATERIAL_TYPES.map(
                        (item) => (
                          <option
                            key={item.value}
                            value={item.value}
                            className="bg-[#020617]"
                          >
                            {item.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>
              </section>

              {/* =================================================
                  COVER PAGE
              ================================================== */}

              <section className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <ImageIcon
                        size={20}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <h2 className="font-bold text-lg">
                        Cover Page
                      </h2>

                      <p className="text-sm text-slate-400">
                        Upload the actual front cover
                        artwork.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <input
                    id="cover-page-input"
                    type="file"
                    accept={COVER_ACCEPT}
                    onChange={
                      handleCoverPageChange
                    }
                    className="hidden"
                  />

                  {!coverPreview ? (
                    <label
                      htmlFor="cover-page-input"
                      className="min-h-[260px] rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition cursor-pointer flex flex-col items-center justify-center text-center p-6"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
                        <Upload
                          size={25}
                          className="text-cyan-300"
                        />
                      </div>

                      <h3 className="font-bold text-white">
                        Upload Cover Page
                      </h3>

                      <p className="text-sm text-slate-400 mt-2 max-w-sm">
                        Upload the real front cover
                        image containing your school
                        branding, subject, artwork and
                        other cover content.
                      </p>

                      <span className="mt-4 text-xs text-cyan-300">
                        JPG, JPEG, PNG or WebP
                      </span>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#020617] overflow-hidden">
                        <div className="aspect-[3/4] max-w-sm mx-auto">
                          <img
                            src={coverPreview}
                            alt="Uploaded cover page"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <label
                          htmlFor="cover-page-input"
                          className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 cursor-pointer hover:bg-cyan-500/15 transition"
                        >
                          <Upload size={17} />
                          Replace Cover Page
                        </label>

                        <button
                          type="button"
                          onClick={
                            removeCoverPage
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/15 transition"
                        >
                          <X size={17} />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  BACK PAGE
              ================================================== */}

              <section className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <ImageIcon
                        size={20}
                        className="text-indigo-300"
                      />
                    </div>

                    <div>
                      <h2 className="font-bold text-lg">
                        Back Page
                      </h2>

                      <p className="text-sm text-slate-400">
                        Upload the actual back cover
                        artwork.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <input
                    id="back-page-input"
                    type="file"
                    accept={COVER_ACCEPT}
                    onChange={
                      handleBackPageChange
                    }
                    className="hidden"
                  />

                  {!backPreview ? (
                    <label
                      htmlFor="back-page-input"
                      className="min-h-[260px] rounded-2xl border border-dashed border-indigo-400/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition cursor-pointer flex flex-col items-center justify-center text-center p-6"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                        <Upload
                          size={25}
                          className="text-indigo-300"
                        />
                      </div>

                      <h3 className="font-bold text-white">
                        Upload Back Page
                      </h3>

                      <p className="text-sm text-slate-400 mt-2 max-w-sm">
                        Upload the real back cover
                        image for the physical
                        textbook representation.
                      </p>

                      <span className="mt-4 text-xs text-indigo-300">
                        JPG, JPEG, PNG or WebP
                      </span>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#020617] overflow-hidden">
                        <div className="aspect-[3/4] max-w-sm mx-auto">
                          <img
                            src={backPreview}
                            alt="Uploaded back page"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <label
                          htmlFor="back-page-input"
                          className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 cursor-pointer hover:bg-indigo-500/15 transition"
                        >
                          <Upload size={17} />
                          Replace Back Page
                        </label>

                        <button
                          type="button"
                          onClick={
                            removeBackPage
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/15 transition"
                        >
                          <X size={17} />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  MATERIAL FILE
              ================================================== */}

              <section className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <h2 className="font-bold text-lg">
                    Material File
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Upload the actual learning material
                    file.
                  </p>
                </div>

                <div className="p-5">
                  <input
                    id="material-file-input"
                    type="file"
                    accept={MATERIAL_ACCEPT}
                    onChange={
                      handleMaterialFileChange
                    }
                    className="hidden"
                  />

                  <label
                    htmlFor="material-file-input"
                    className="block rounded-2xl border border-dashed border-white/15 bg-[#020617] hover:border-cyan-400/30 transition cursor-pointer p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <FileText
                          size={22}
                          className="text-slate-300"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">
                          {selectedFile
                            ? selectedFile.name
                            : material?.file_name ||
                              "Choose a new material file"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {selectedFile
                            ? formatBytes(
                                selectedFile.size
                              )
                            : material?.file_size
                            ? formatBytes(
                                material.file_size
                              )
                            : "PDF, DOC, DOCX, MP4, WebM or MOV"}
                        </p>
                      </div>

                      <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200">
                        <Upload size={16} />
                        Replace
                      </span>
                    </div>
                  </label>

                  {!selectedFile &&
                    existingFileUrl && (
                      <a
                        href={existingFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        <FileText size={16} />
                        Open current material file
                      </a>
                    )}
                </div>
              </section>
            </div>

            {/* =================================================
                RIGHT — TEXTBOOK PREVIEW
            ================================================== */}

            <aside className="xl:sticky xl:top-6 h-fit">
              <section className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden">

                <div className="px-5 py-4 border-b border-white/10">
                  <h2 className="font-bold text-lg">
                    Textbook Preview
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    The uploaded images are used directly
                    as the front and back covers.
                  </p>
                </div>

                <div className="p-5">

                  {/* BOOK */}

                  <div className="relative w-full max-w-[430px] mx-auto">

                    <div className="relative aspect-[1.45/1]">

                      {/* BACK COVER */}

                      {backPreview ? (
                        <div className="absolute right-0 top-[5%] w-[58%] h-[90%] rounded-r-[7px] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                          <img
                            src={backPreview}
                            alt="Back cover"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="absolute right-0 top-[5%] w-[58%] h-[90%] rounded-r-[7px] border border-dashed border-white/10 bg-white/[0.025] flex items-center justify-center">
                          <span className="text-xs text-slate-600">
                            Back Page
                          </span>
                        </div>
                      )}

                      {/* PAGE BLOCK / SPINE */}

                      <div className="absolute left-[36%] top-[3%] h-[94%] w-[7%] z-20 rounded-sm bg-gradient-to-r from-slate-800 via-slate-500/20 to-slate-900 border-y border-white/10 shadow-lg">
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10" />
                      </div>

                      {/* FRONT COVER */}

                      {coverPreview ? (
                        <div className="absolute left-0 top-0 w-[58%] h-full z-30 rounded-l-[7px] overflow-hidden border border-white/15 bg-slate-900 shadow-[14px_18px_35px_rgba(0,0,0,0.5)]">
                          <img
                            src={coverPreview}
                            alt="Front cover"
                            className="w-full h-full object-cover"
                          />

                          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="absolute left-0 top-0 w-[58%] h-full z-30 rounded-l-[7px] border border-dashed border-cyan-400/20 bg-cyan-500/5 flex flex-col items-center justify-center text-center p-4">
                          <ImageIcon
                            size={28}
                            className="text-cyan-400/60 mb-3"
                          />

                          <span className="text-xs text-slate-500">
                            Upload Cover Page
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PREVIEW STATUS */}

                  <div className="mt-7 grid grid-cols-2 gap-3">

                    <div
                      className={`rounded-xl border px-4 py-3 ${
                        coverPreview
                          ? "border-emerald-400/20 bg-emerald-500/5"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {coverPreview ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-300"
                          />
                        ) : (
                          <ImageIcon
                            size={16}
                            className="text-slate-500"
                          />
                        )}

                        <span className="text-xs font-semibold text-slate-300">
                          Cover Page
                        </span>
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border px-4 py-3 ${
                        backPreview
                          ? "border-emerald-400/20 bg-emerald-500/5"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {backPreview ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-300"
                          />
                        ) : (
                          <ImageIcon
                            size={16}
                            className="text-slate-500"
                          />
                        )}

                        <span className="text-xs font-semibold text-slate-300">
                          Back Page
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* SAVE */}

                  <button
                    type="submit"
                    disabled={saving || deleting}
                    className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition"
                  >
                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    Save Material
                  </button>

                </div>
              </section>
            </aside>

          </div>
        </form>
      </div>
    </div>
  );
}
