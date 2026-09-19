import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Upload,
  Trash2,
  ExternalLink,
  Loader2,
  PlayCircle,
  Video,
  Search,
  RefreshCw,
  X,
  GraduationCap,
  BookOpen,
  AlertCircle,
  Pencil,
  Save,
} from "lucide-react";

// ============================================================
// CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY =
  "scholiqen_auth_token";

// ============================================================
// CLASS OPTIONS
// ============================================================

const CLASS_OPTIONS = [
  {
    value: "Grade 1",
    label: "Grade 1",
  },
  {
    value: "Grade 2",
    label: "Grade 2",
  },
  {
    value: "Grade 3",
    label: "Grade 3",
  },
  {
    value: "Grade 4",
    label: "Grade 4",
  },
  {
    value: "Grade 5",
    label: "Grade 5",
  },
  {
    value: "Grade 6",
    label: "Grade 6",
  },
  {
    value: "JSS 1",
    label: "JSS 1",
  },
  {
    value: "JSS 2",
    label: "JSS 2",
  },
  {
    value: "JSS 3",
    label: "JSS 3",
  },
  {
    value: "SS 1",
    label: "SS 1",
  },
  {
    value: "SS 2",
    label: "SS 2",
  },
  {
    value: "SS 3",
    label: "SS 3",
  },
];

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = () => {
  const token =
    localStorage.getItem(
      AUTH_TOKEN_KEY
    );

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// ============================================================
// ASSET URL
// ============================================================

const getAssetUrl = (url) => {
  if (!url) return "";

  const value = String(url);

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `${API_URL}${
    value.startsWith("/") ? "" : "/"
  }${value}`;
};

// ============================================================
// SAFE JSON
// ============================================================

const readJson = async (response) => {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

// ============================================================
// NORMALIZE SUBJECT
// ============================================================

const normalizeSubject = (value) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
};

// ============================================================
// COMPONENT
// ============================================================

const ResourcesAdmin = () => {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [video, setVideo] =
    useState(null);

  const [selectedClass, setSelectedClass] =
    useState("");

  const [subject, setSubject] =
    useState("");

  // ==========================================================
  // EDIT STATE
  // ==========================================================

  const [editingResource, setEditingResource] =
    useState(null);

  const [savingEdit, setSavingEdit] =
    useState(false);

  // ==========================================================
  // DATA
  // ==========================================================

  const [resources, setResources] =
    useState([]);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  // ==========================================================
  // UI
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // FETCH VIDEOS
  // ==========================================================

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/resources`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
            },
          }
        );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to fetch videos."
        );
      }

      setResources(
        Array.isArray(
          data?.resources
        )
          ? data.resources
          : []
      );
    } catch (fetchError) {
      console.error(
        "RESOURCE FETCH ERROR:",
        fetchError
      );

      setResources([]);

      setError(
        fetchError?.message ||
          "Unable to load videos."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchResources();
  }, []);

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideo(null);
    setSelectedClass("");
    setSubject("");
    setEditingResource(null);

    const fileInput =
      document.getElementById(
        "video-upload-input"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ==========================================================
  // START EDIT
  // ==========================================================

  const startEdit = (resource) => {
    setError("");

    setEditingResource(resource);

    setTitle(
      resource?.title || ""
    );

    setDescription(
      resource?.description || ""
    );

    setSelectedClass(
      resource?.class_name ||
        resource?.class ||
        resource?.grade ||
        ""
    );

    setSubject(
      normalizeSubject(
        resource?.subject ||
          resource?.subject_name ||
          resource?.subject_title ||
          ""
      )
    );

    setVideo(null);

    const fileInput =
      document.getElementById(
        "video-upload-input"
      );

    if (fileInput) {
      fileInput.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // UPLOAD VIDEO
  // ==========================================================

  const uploadVideo = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const cleanSubject =
      normalizeSubject(subject);

    if (!selectedClass) {
      setError(
        "Please select a class."
      );
      return;
    }

    if (!cleanSubject) {
      setError(
        "Please enter the subject."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Video title is required."
      );
      return;
    }

    if (!video) {
      setError(
        "Please select a video."
      );
      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      // ------------------------------------------------------
      // CLASS
      // ------------------------------------------------------

      formData.append(
        "class",
        selectedClass
      );

      formData.append(
        "class_name",
        selectedClass
      );

      formData.append(
        "grade",
        selectedClass
      );

      // ------------------------------------------------------
      // SUBJECT
      // ------------------------------------------------------

      formData.append(
        "subject",
        cleanSubject
      );

      formData.append(
        "subject_name",
        cleanSubject
      );

      // ------------------------------------------------------
      // VIDEO
      // ------------------------------------------------------

      formData.append(
        "video",
        video
      );

      const response =
        await fetch(
          `${API_URL}/api/resources`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
            },
            body: formData,
          }
        );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Video upload failed."
        );
      }

      resetForm();

      await fetchResources();

      alert(
        "Video uploaded successfully."
      );
    } catch (uploadError) {
      console.error(
        "UPLOAD ERROR:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Video upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // UPDATE VIDEO
  // ==========================================================

  const updateVideo = async (
    event
  ) => {
    event.preventDefault();

    if (!editingResource) {
      return;
    }

    setError("");

    const cleanSubject =
      normalizeSubject(subject);

    if (!selectedClass) {
      setError(
        "Please select a class."
      );
      return;
    }

    if (!cleanSubject) {
      setError(
        "Please enter the subject."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Video title is required."
      );
      return;
    }

    try {
      setSavingEdit(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      // ------------------------------------------------------
      // CLASS
      // ------------------------------------------------------

      formData.append(
        "class",
        selectedClass
      );

      formData.append(
        "class_name",
        selectedClass
      );

      formData.append(
        "grade",
        selectedClass
      );

      // ------------------------------------------------------
      // SUBJECT
      // ------------------------------------------------------

      formData.append(
        "subject",
        cleanSubject
      );

      formData.append(
        "subject_name",
        cleanSubject
      );

      // ------------------------------------------------------
      // OPTIONAL NEW VIDEO
      // ------------------------------------------------------

      if (video) {
        formData.append(
          "video",
          video
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/resources/${encodeURIComponent(
            editingResource.id
          )}`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
            },
            body: formData,
          }
        );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update video."
        );
      }

      resetForm();

      await fetchResources();

      alert(
        "Video updated successfully."
      );
    } catch (updateError) {
      console.error(
        "UPDATE VIDEO ERROR:",
        updateError
      );

      setError(
        updateError?.message ||
          "Unable to update video."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // ==========================================================
  // DELETE VIDEO
  // ==========================================================

  const deleteVideo = async (
    resource
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${resource.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        resource.id
      );

      setError("");

      const response =
        await fetch(
          `${API_URL}/api/resources/${encodeURIComponent(
            resource.id
          )}`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
            },
          }
        );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to delete video."
        );
      }

      setResources(
        (current) =>
          current.filter(
            (item) =>
              String(item.id) !==
              String(resource.id)
          )
      );

      if (
        editingResource &&
        String(editingResource.id) ===
          String(resource.id)
      ) {
        resetForm();
      }
    } catch (deleteError) {
      console.error(
        "DELETE VIDEO ERROR:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "Unable to delete video."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredResources =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return resources;
      }

      return resources.filter(
        (resource) => {
          return (
            resource.title
              ?.toLowerCase()
              .includes(query) ||
            resource.description
              ?.toLowerCase()
              .includes(query) ||
            resource.subject
              ?.toLowerCase()
              .includes(query) ||
            resource.subject_name
              ?.toLowerCase()
              .includes(query) ||
            resource.subject_title
              ?.toLowerCase()
              .includes(query) ||
            resource.class
              ?.toLowerCase()
              .includes(query) ||
            resource.class_name
              ?.toLowerCase()
              .includes(query) ||
            resource.grade
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      resources,
      search,
    ]);

  // ==========================================================
  // CLASS COUNT
  // ==========================================================

  const classCount =
    useMemo(() => {
      const classes =
        resources
          .map(
            (resource) =>
              resource.class_name ||
              resource.class ||
              resource.grade
          )
          .filter(Boolean);

      return new Set(
        classes.map((value) =>
          String(value)
            .trim()
            .toLowerCase()
        )
      ).size;
    }, [resources]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#020617]
        p-4
        text-white
        sm:p-6
        lg:p-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                mb-3
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-blue-500/20
                  bg-blue-500/10
                "
              >
                <Video
                  className="text-blue-400"
                  size={24}
                />
              </div>

              <span
                className="
                  rounded-full
                  border
                  border-blue-500/20
                  bg-blue-500/10
                  px-3
                  py-1
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-blue-400
                "
              >
                Resource Manager
              </span>
            </div>

            <h1
              className="
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              "
            >
              Video Resources
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-slate-400
              "
            >
              Upload, edit and organize
              learning videos by class
              and subject.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchResources}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-200
              transition
              hover:border-blue-500/40
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
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
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

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
              text-sm
              text-red-300
            "
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="
                ml-auto
                shrink-0
                text-red-400
                transition
                hover:text-white
              "
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ==================================================
            STATS
        ================================================== */}

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-400
                "
              >
                Total Videos
              </span>

              <PlayCircle
                size={20}
                className="text-purple-400"
              />
            </div>

            <p
              className="
                mt-2
                text-3xl
                font-black
              "
            >
              {resources.length}
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-400
                "
              >
                Classes
              </span>

              <GraduationCap
                size={20}
                className="text-blue-400"
              />
            </div>

            <p
              className="
                mt-2
                text-3xl
                font-black
              "
            >
              {classCount}
            </p>
          </div>
        </div>

        {/* ==================================================
            UPLOAD / EDIT FORM
        ================================================== */}

        <form
          onSubmit={
            editingResource
              ? updateVideo
              : uploadVideo
          }
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-800
            bg-slate-900/80
            shadow-2xl
            shadow-black/20
          "
        >
          <div
            className="
              border-b
              border-slate-800
              bg-slate-950/40
              px-6
              py-5
              sm:px-8
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-black
                  "
                >
                  {editingResource
                    ? "Edit Video"
                    : "Upload New Video"}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  {editingResource
                    ? "Update the class, subject, title, description or replace the video file."
                    : "Select the class and type the subject this video belongs to."}
                </p>
              </div>

              {editingResource && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-800
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-slate-300
                    transition
                    hover:bg-slate-700
                    hover:text-white
                  "
                >
                  <X size={17} />

                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div
            className="
              grid
              gap-6
              p-6
              sm:p-8
            "
          >
            {/* ==================================================
                CLASS
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                <GraduationCap
                  size={17}
                  className="text-blue-400"
                />

                Class
              </label>

              <select
                value={selectedClass}
                onChange={(event) =>
                  setSelectedClass(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800/80
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              >
                <option value="">
                  Select Class
                </option>

                {CLASS_OPTIONS.map(
                  (classOption) => (
                    <option
                      key={
                        classOption.value
                      }
                      value={
                        classOption.value
                      }
                    >
                      {
                        classOption.label
                      }
                    </option>
                  )
                )}
              </select>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                This determines which
                class can see the video.
              </p>
            </div>

            {/* ==================================================
                SUBJECT
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                <BookOpen
                  size={17}
                  className="text-purple-400"
                />

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
                disabled={!selectedClass}
                placeholder={
                  selectedClass
                    ? "Example: English"
                    : "Select a class first"
                }
                autoComplete="off"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800/80
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />

              {selectedClass &&
                subject.trim() && (
                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      items-center
                      gap-2
                      text-xs
                    "
                  >
                    <span className="text-slate-500">
                      This video will belong
                      to:
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-blue-500/10
                        px-2.5
                        py-1
                        font-semibold
                        text-blue-400
                      "
                    >
                      {selectedClass}
                    </span>

                    <span className="text-slate-600">
                      →
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-purple-500/10
                        px-2.5
                        py-1
                        font-semibold
                        text-purple-400
                      "
                    >
                      {normalizeSubject(
                        subject
                      )}
                    </span>
                  </div>
                )}
            </div>

            {/* ==================================================
                TITLE
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                Video Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Example: Understanding Nouns"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800/80
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-500
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />
            </div>

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Describe what students will learn from this video..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800/80
                  p-4
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-500
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />
            </div>

            {/* ==================================================
                VIDEO PICKER
            ================================================== */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                {editingResource
                  ? "Replace Video File (Optional)"
                  : "Video File"}
              </label>

              {editingResource &&
                !video && (
                  <div
                    className="
                      mb-3
                      rounded-xl
                      border
                      border-blue-500/20
                      bg-blue-500/5
                      px-4
                      py-3
                      text-sm
                      text-blue-300
                    "
                  >
                    The existing video will
                    remain unchanged unless
                    you select a new video
                    below.
                  </div>
                )}

              <label
                htmlFor="video-upload-input"
                className="
                  flex
                  min-h-48
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border-2
                  border-dashed
                  border-slate-700
                  bg-slate-950/30
                  p-8
                  text-center
                  transition
                  hover:border-blue-500/60
                  hover:bg-blue-500/5
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-500/10
                  "
                >
                  <Upload
                    size={30}
                    className="text-blue-400"
                  />
                </div>

                <p
                  className="
                    mt-4
                    max-w-full
                    truncate
                    font-bold
                    text-slate-200
                  "
                >
                  {video
                    ? video.name
                    : editingResource
                    ? "Select replacement video"
                    : "Select Video"}
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  MP4, WebM, MOV, AVI and
                  other supported video files
                </p>

                {video && (
                  <span
                    className="
                      mt-3
                      rounded-full
                      bg-blue-500/10
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-blue-400
                    "
                  >
                    {(
                      video.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </span>
                )}

                <input
                  id="video-upload-input"
                  hidden
                  type="file"
                  accept="video/*"
                  onChange={(event) =>
                    setVideo(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                />
              </label>
            </div>

            {/* ==================================================
                SUBMIT BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={
                editingResource
                  ? savingEdit ||
                    !selectedClass ||
                    !subject.trim()
                  : uploading ||
                    !selectedClass ||
                    !subject.trim() ||
                    !video
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                py-3.5
                font-bold
                text-white
                shadow-lg
                shadow-blue-900/20
                transition
                hover:from-blue-500
                hover:to-indigo-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {editingResource ? (
                savingEdit ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />

                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={19} />

                    Save Changes
                  </>
                )
              ) : uploading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Uploading Video...
                </>
              ) : (
                <>
                  <Upload size={19} />

                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h2
              className="
                text-2xl
                font-black
              "
            >
              Uploaded Videos
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Manage your learning
              video library.
            </p>
          </div>

          <div
            className="
              relative
              w-full
              sm:max-w-sm
            "
          >
            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-500
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search videos..."
              className="
                w-full
                rounded-xl
                border
                border-slate-800
                bg-slate-900
                py-3
                pl-10
                pr-10
                text-sm
                text-white
                outline-none
                focus:border-blue-500
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                  hover:text-white
                "
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            VIDEO LIST
        ================================================== */}

        {loading ? (
          <div
            className="
              flex
              min-h-60
              items-center
              justify-center
              rounded-3xl
              border
              border-slate-800
              bg-slate-900/60
            "
          >
            <div className="text-center">
              <Loader2
                size={32}
                className="
                  mx-auto
                  animate-spin
                  text-blue-400
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-400
                "
              >
                Loading videos...
              </p>
            </div>
          </div>
        ) : filteredResources.length ===
          0 ? (
          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900/60
              p-12
              text-center
            "
          >
            <PlayCircle
              size={48}
              className="
                mx-auto
                text-slate-700
              "
            />

            <h3
              className="
                mt-4
                text-lg
                font-bold
              "
            >
              {search
                ? "No videos found"
                : "No videos uploaded yet"}
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              {search
                ? "Try another search term."
                : "Upload your first learning video above."}
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {filteredResources.map(
              (resource) => {
                const videoUrl =
                  getAssetUrl(
                    resource.file_url
                  );

                const resourceClass =
                  resource.class_name ||
                  resource.class ||
                  resource.grade ||
                  "Class not assigned";

                const resourceSubject =
                  resource.subject ||
                  resource.subject_name ||
                  resource.subject_title ||
                  "Subject not assigned";

                const isEditing =
                  editingResource &&
                  String(
                    editingResource.id
                  ) ===
                    String(resource.id);

                return (
                  <div
                    key={resource.id}
                    className={`
                      overflow-hidden
                      rounded-3xl
                      border
                      bg-slate-900
                      transition
                      hover:-translate-y-1
                      ${
                        isEditing
                          ? "border-blue-500/60 ring-1 ring-blue-500/20"
                          : "border-slate-800 hover:border-blue-500/30"
                      }
                    `}
                  >
                    {/* VIDEO PREVIEW */}

                    <div
                      className="
                        relative
                        aspect-video
                        bg-black
                      "
                    >
                      <video
                        src={videoUrl}
                        controls
                        preload="metadata"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                      <div
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-3
                          rounded-full
                          bg-black/60
                          px-3
                          py-1
                          text-xs
                          font-bold
                          text-white
                          backdrop-blur
                        "
                      >
                        VIDEO
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="p-6">
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <h3
                            className="
                              line-clamp-2
                              font-bold
                              text-white
                            "
                          >
                            {resource.title}
                          </h3>

                          <div
                            className="
                              mt-3
                              flex
                              flex-wrap
                              gap-2
                            "
                          >
                            <span
                              className="
                                rounded-full
                                bg-blue-500/10
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-blue-400
                              "
                            >
                              {resourceClass}
                            </span>

                            <span
                              className="
                                rounded-full
                                bg-purple-500/10
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-purple-400
                              "
                            >
                              {resourceSubject}
                            </span>
                          </div>
                        </div>

                        <PlayCircle
                          size={20}
                          className="
                            shrink-0
                            text-purple-400
                          "
                        />
                      </div>

                      <p
                        className="
                          mt-3
                          line-clamp-3
                          text-sm
                          leading-6
                          text-slate-400
                        "
                      >
                        {resource.description ||
                          "No description provided."}
                      </p>

                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-3
                          gap-2
                        "
                      >
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-3
                            py-2.5
                            text-sm
                            font-bold
                            transition
                            hover:bg-blue-500
                          "
                        >
                          <ExternalLink
                            size={16}
                          />

                          Watch
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              resource
                            )
                          }
                          disabled={
                            savingEdit ||
                            deletingId ===
                              resource.id
                          }
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-amber-500/10
                            px-3
                            py-2.5
                            text-sm
                            font-bold
                            text-amber-400
                            transition
                            hover:bg-amber-500/20
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <Pencil
                            size={16}
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                              resource.id ||
                            savingEdit
                          }
                          onClick={() =>
                            deleteVideo(
                              resource
                            )
                          }
                          className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-red-500/10
                            px-3
                            py-2.5
                            text-sm
                            font-bold
                            text-red-400
                            transition
                            hover:bg-red-500/20
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {deletingId ===
                          resource.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={17}
                            />
                          )}

                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesAdmin;
