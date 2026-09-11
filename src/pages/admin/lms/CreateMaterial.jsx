// src/pages/admin/lms/CreateMaterial.jsx

import React, {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
  FileText,
  Video,
  CheckCircle2,
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminButton from "../../../components/admin/ui/AdminButton";

/* ============================================================
   API
============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ============================================================
   COMPONENT
============================================================ */

const CreateMaterial = () => {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      subject: "",
      level: "SS1",
      material_type: "pdf",
      file: null,
    });

  /* ============================================================
     HANDLE INPUT
  ============================================================ */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     HANDLE FILE
  ============================================================ */

  const handleFile = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      file,
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     REMOVE FILE
  ============================================================ */

  const removeFile = () => {
    setFormData((previous) => ({
      ...previous,
      file: null,
    }));

    setError("");
  };

  /* ============================================================
     FORMAT FILE SIZE
  ============================================================ */

  const formatFileSize = (bytes) => {
    if (!bytes || Number(bytes) <= 0) {
      return "0 KB";
    }

    const size = Number(bytes);

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.min(
      Math.floor(
        Math.log(size) /
          Math.log(1024)
      ),
      units.length - 1
    );

    return `${(
      size /
      Math.pow(1024, index)
    ).toFixed(
      index === 0 ? 0 : 2
    )} ${units[index]}`;
  };

  /* ============================================================
     VALIDATE
  ============================================================ */

  const validate = () => {
    if (!formData.title.trim()) {
      return "Material title is required.";
    }

    if (!formData.subject.trim()) {
      return "Subject is required.";
    }

    if (!formData.file) {
      return "Please select a file.";
    }

    const maxSize =
      250 * 1024 * 1024;

    if (
      formData.file.size >
      maxSize
    ) {
      return "File is too large. Maximum file size is 250MB.";
    }

    const name =
      formData.file.name.toLowerCase();

    if (
      formData.material_type ===
      "pdf"
    ) {
      if (!name.endsWith(".pdf")) {
        return "Please select a PDF file.";
      }
    }

    if (
      formData.material_type ===
      "docx"
    ) {
      if (
        !name.endsWith(".doc") &&
        !name.endsWith(".docx")
      ) {
        return "Please select a DOC or DOCX file.";
      }
    }

    if (
      formData.material_type ===
      "video"
    ) {
      const validVideo =
        name.endsWith(".mp4") ||
        name.endsWith(".webm") ||
        name.endsWith(".mov");

      if (!validVideo) {
        return "Please select an MP4, WebM or MOV video.";
      }
    }

    return null;
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const body = new FormData();

      body.append(
        "title",
        formData.title.trim()
      );

      body.append(
        "description",
        formData.description.trim()
      );

      body.append(
        "subject",
        formData.subject.trim()
      );

      body.append(
        "level",
        formData.level
      );

      body.append(
        "material_type",
        formData.material_type
      );

      body.append(
        "file",
        formData.file
      );

      console.log(
        "Creating material...",
        {
          title: formData.title,
          subject: formData.subject,
          level: formData.level,
          material_type:
            formData.material_type,
          file:
            formData.file?.name,
          fileSize:
            formData.file?.size,
        }
      );

      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/lms/materials`,
          {
            method: "POST",
            credentials: "include",
            body,
          }
        );

      const rawResponse =
        await response.text();

      console.log(
        "Material API status:",
        response.status
      );

      console.log(
        "Material API response:",
        rawResponse
      );

      let result = null;

      try {
        result = rawResponse
          ? JSON.parse(rawResponse)
          : null;
      } catch {
        result = null;
      }

      if (!response.ok) {
        const backendMessage =
          result?.error ||
          result?.detail ||
          result?.message ||
          rawResponse ||
          `Server returned HTTP ${response.status}.`;

        const errorParts = [
          backendMessage,
          result?.code
            ? `Code: ${result.code}`
            : null,
          result?.hint
            ? `Hint: ${result.hint}`
            : null,
        ].filter(Boolean);

        throw new Error(
          errorParts.join(" | ")
        );
      }

      if (
        !result ||
        result.success !== true
      ) {
        throw new Error(
          result?.error ||
            result?.message ||
            "The server did not confirm that the material was created."
        );
      }

      console.log(
        "Material created successfully:",
        result.material
      );

      setSuccess(
        "Material created successfully."
      );

      setFormData({
        title: "",
        description: "",
        subject: "",
        level: "SS1",
        material_type: "pdf",
        file: null,
      });

      setTimeout(() => {
        navigate(
          "/admin/lms/materials"
        );
      }, 800);
    } catch (submitError) {
      console.error(
        "CREATE MATERIAL ERROR:",
        submitError
      );

      setError(
        submitError?.message ||
          "Unable to create learning material."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FILE ICON
  ============================================================ */

  const FileIcon =
    formData.material_type ===
    "video"
      ? Video
      : FileText;

  /* ============================================================
     LIVE COVER DATA
  ============================================================ */

  const coverTitle = useMemo(() => {
    return (
      formData.title.trim() ||
      "Learning Material"
    );
  }, [formData.title]);

  const coverSubject = useMemo(() => {
    return (
      formData.subject.trim() ||
      "General Studies"
    );
  }, [formData.subject]);

  const coverLevel =
    formData.level || "SS1";

  const isVideo =
    formData.material_type ===
    "video";

  /* ============================================================
     RENDER COVER
  ============================================================ */

  const renderCover = () => {
    return (
      <div className="relative mx-auto w-full max-w-[390px]">

        {/* ======================================================
            BOOK SHADOW
        ====================================================== */}

        <div
          className="
            absolute
            bottom-2
            left-5
            right-0
            top-5
            rounded-r-[24px]
            bg-black/70
            blur-2xl
          "
        />

        {/* ======================================================
            BACK COVER
        ====================================================== */}

        <div
          className="
            absolute
            bottom-1
            left-3
            right-0
            top-3
            -z-10
            rounded-r-[22px]
            border
            border-slate-700/50
            bg-[#020617]
          "
        />

        {/* ======================================================
            BOOK COVER
        ====================================================== */}

        <div
          className="
            relative
            aspect-[3/4.25]
            overflow-hidden
            rounded-r-[22px]
            rounded-l-[8px]
            border
            border-slate-700/80
            bg-[#071426]
            shadow-2xl
          "
        >

          {/* ====================================================
              COVER BACKGROUND
          ==================================================== */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#0B1220]
              via-[#071426]
              to-[#020617]
            "
          />

          {/* ====================================================
              DECORATIVE LIGHT
          ==================================================== */}

          <div
            className="
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-blue-500/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-24
              -left-20
              h-72
              w-72
              rounded-full
              bg-indigo-500/10
              blur-3xl
            "
          />

          {/* ====================================================
              GRID
          ==================================================== */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.05]
            "
            style={{
              backgroundImage: `
                linear-gradient(
                  rgba(148,163,184,0.6) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(148,163,184,0.6) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: "28px 28px",
            }}
          />

          {/* ====================================================
              SPINE
          ==================================================== */}

          <div
            className="
              absolute
              bottom-0
              left-0
              top-0
              w-[11px]
              bg-gradient-to-b
              from-blue-400
              via-blue-600
              to-indigo-700
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-[11px]
              top-0
              w-px
              bg-white/10
            "
          />

          {/* ====================================================
              BRAND
          ==================================================== */}

          <div
            className="
              absolute
              left-8
              right-7
              top-7
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-400/20
                  bg-blue-500/10
                  text-blue-400
                "
              >
                <GraduationCap
                  size={17}
                />
              </div>

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.24em]
                  text-slate-300
                "
              >
                Scholiqen
              </span>
            </div>

            <div
              className="
                rounded-full
                border
                border-white/10
                bg-black/20
                px-3
                py-1.5
                text-[8px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-slate-400
              "
            >
              {isVideo
                ? "Video"
                : "Study Material"}
            </div>
          </div>

          {/* ====================================================
              MAIN COVER CONTENT
          ==================================================== */}

          <div
            className="
              absolute
              left-8
              right-7
              top-[25%]
            "
          >

            <div
              className="
                mb-6
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-400/20
                bg-blue-500/10
                text-blue-400
              "
            >
              {isVideo ? (
                <Video size={28} />
              ) : (
                <BookOpen size={28} />
              )}
            </div>

            <p
              className="
                mb-3
                text-[9px]
                font-black
                uppercase
                tracking-[0.25em]
                text-blue-400
              "
            >
              {coverSubject}
            </p>

            <h2
              className="
                line-clamp-4
                text-3xl
                font-black
                leading-[1.05]
                tracking-tight
                text-white
              "
            >
              {coverTitle}
            </h2>

            <div
              className="
                mt-5
                h-1
                w-16
                rounded-full
                bg-blue-500
              "
            />
          </div>

          {/* ====================================================
              BOTTOM COVER
          ==================================================== */}

          <div
            className="
              absolute
              bottom-7
              left-8
              right-7
            "
          >
            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xl
                    font-black
                    text-white
                  "
                >
                  {coverLevel}
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-slate-500
                  "
                >
                  Scholiqen Learning Library
                </p>
              </div>

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  text-slate-400
                "
              >
                <BookOpen size={18} />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-500/20
                bg-blue-500/10
                text-blue-400
              "
            >
              <BookOpen size={21} />
            </div>

            <div>
              <h1
                className="
                  text-3xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                Create Material
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Create a new textbook-style
                learning material.
              </p>
            </div>
          </div>
        </div>

        <AdminButton
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() =>
            navigate(
              "/admin/lms/materials"
            )
          }
        >
          <ArrowLeft
            size={18}
            className="mr-2"
          />

          Back to Materials
        </AdminButton>
      </div>

      {/* ========================================================
          ALERTS
      ======================================================== */}

      {error && (
        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            p-4
            text-red-300
          "
        >
          <X
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            p-4
            text-emerald-300
          "
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm">
            {success}
          </p>
        </div>
      )}

      {/* ========================================================
          MAIN LAYOUT
      ======================================================== */}

      <div
        className="
          grid
          gap-8
          lg:grid-cols-[0.85fr_1.15fr]
          xl:gap-10
        "
      >

        {/* ======================================================
            LIVE COVER PREVIEW
        ====================================================== */}

        <section
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900/70
            p-6
            lg:p-8
          "
        >
          <div
            className="
              mb-7
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-blue-400
                "
              >
                Live Preview
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                Your Material Cover
              </h2>
            </div>

            <Sparkles
              size={20}
              className="text-slate-600"
            />
          </div>

          {renderCover()}

          <div
            className="
              mt-7
              rounded-2xl
              border
              border-slate-800
              bg-slate-950/70
              p-4
              text-center
            "
          >
            <p
              className="
                text-xs
                leading-5
                text-slate-500
              "
            >
              This is how the material will
              appear in the Admin Materials
              library.
            </p>
          </div>
        </section>

        {/* ======================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            space-y-7
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            p-6
            lg:p-8
          "
        >

          {/* ====================================================
              FORM HEADER
          ==================================================== */}

          <div
            className="
              border-b
              border-slate-800
              pb-6
            "
          >
            <h2
              className="
                text-xl
                font-bold
                text-white
              "
            >
              Material Information
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Enter the information that
              belongs on this learning material.
            </p>
          </div>

          {/* ====================================================
              TITLE
          ==================================================== */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-300
              "
            >
              Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              placeholder="Example: SS2 Physics Motion Notes"
              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-slate-600
                focus:border-blue-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* ====================================================
              DESCRIPTION
          ==================================================== */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-300
              "
            >
              Description
            </label>

            <textarea
              rows={5}
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              disabled={loading}
              placeholder="Describe what students will learn from this material..."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                placeholder:text-slate-600
                focus:border-blue-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* ====================================================
              SUBJECT + LEVEL
          ==================================================== */}

          <div
            className="
              grid
              gap-5
              md:grid-cols-2
            "
          >

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-300
                "
              >
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={
                  formData.subject
                }
                onChange={handleChange}
                disabled={loading}
                placeholder="Physics"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-600
                  focus:border-blue-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />
            </div>

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-300
                "
              >
                Class Level
              </label>

              <select
                name="level"
                value={
                  formData.level
                }
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-950
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  focus:border-blue-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <option value="JSS1">
                  JSS1
                </option>

                <option value="JSS2">
                  JSS2
                </option>

                <option value="JSS3">
                  JSS3
                </option>

                <option value="SS1">
                  SS1
                </option>

                <option value="SS2">
                  SS2
                </option>

                <option value="SS3">
                  SS3
                </option>
              </select>
            </div>

          </div>

          {/* ====================================================
              MATERIAL TYPE
          ==================================================== */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-300
              "
            >
              Material Type
            </label>

            <select
              name="material_type"
              value={
                formData.material_type
              }
              onChange={handleChange}
              disabled={loading}
              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="pdf">
                PDF
              </option>

              <option value="docx">
                DOC / DOCX
              </option>

              <option value="video">
                Video
              </option>
            </select>
          </div>

          {/* ====================================================
              FILE UPLOAD
          ==================================================== */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-300
              "
            >
              Material File
            </label>

            {!formData.file ? (
              <label
                htmlFor="material-file"
                className={`
                  flex
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-700
                  bg-slate-950
                  px-6
                  py-12
                  text-center
                  transition
                  ${
                    loading
                      ? "pointer-events-none opacity-50"
                      : "hover:border-blue-500 hover:bg-blue-500/5"
                  }
                `}
              >
                <div
                  className="
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-blue-500/20
                    bg-blue-500/10
                    text-blue-400
                  "
                >
                  <Upload size={25} />
                </div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Choose material file
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  {formData.material_type ===
                  "pdf"
                    ? "PDF files"
                    : formData.material_type ===
                      "docx"
                    ? "DOC and DOCX files"
                    : "MP4, WebM and MOV videos"}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Maximum size: 250MB
                </p>

                <input
                  id="material-file"
                  type="file"
                  onChange={
                    handleFile
                  }
                  disabled={loading}
                  className="hidden"
                  accept={
                    formData.material_type ===
                    "pdf"
                      ? ".pdf"
                      : formData.material_type ===
                        "docx"
                      ? ".doc,.docx"
                      : ".mp4,.webm,.mov"
                  }
                />
              </label>
            ) : (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-2xl
                  border
                  border-blue-500/20
                  bg-slate-950
                  p-5
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-4
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-500/10
                      text-blue-400
                    "
                  >
                    <FileIcon size={23} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      {formData.file.name}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      {formatFileSize(
                        formData.file.size
                      )}
                    </p>
                  </div>
                </div>

                {!loading && (
                  <button
                    type="button"
                    onClick={
                      removeFile
                    }
                    className="
                      rounded-lg
                      p-2
                      text-slate-500
                      transition
                      hover:bg-red-500/10
                      hover:text-red-400
                    "
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ====================================================
              ACTIONS
          ==================================================== */}

          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-800
              pt-6
              sm:flex-row
              sm:justify-end
            "
          >
            <AdminButton
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() =>
                navigate(
                  "/admin/lms/materials"
                )
              }
            >
              Cancel
            </AdminButton>

            <AdminButton
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="
                      mr-2
                      animate-spin
                    "
                  />

                  Uploading...
                </>
              ) : (
                <>
                  <Save
                    size={18}
                    className="mr-2"
                  />

                  Create Material
                </>
              )}
            </AdminButton>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateMaterial;
