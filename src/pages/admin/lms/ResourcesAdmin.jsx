import React, {
  useEffect,
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

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

// ============================================================
// COMPONENT
// ============================================================

const ResourcesAdmin = () => {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [video, setVideo] =
    useState(null);

  const [topicId, setTopicId] =
    useState("");

  const [topics, setTopics] =
    useState([]);

  const [resources, setResources] =
    useState([]);

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [loadingTopics, setLoadingTopics] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  // ==========================================================
  // FETCH TOPICS
  // ==========================================================

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);

      const response =
        await fetch(
          `${API_URL}/api/resources/topics`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to fetch video categories."
        );
      }

      setTopics(
        Array.isArray(data?.topics)
          ? data.topics
          : []
      );
    } catch (error) {
      console.error(
        "TOPIC FETCH ERROR:",
        error
      );

      setTopics([]);

      alert(
        error?.message ||
          "Unable to load video categories."
      );
    } finally {
      setLoadingTopics(false);
    }
  };

  // ==========================================================
  // FETCH VIDEOS
  // ==========================================================

  const fetchResources = async () => {
    try {
      setLoading(true);

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
        await response.json();

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
    } catch (error) {
      console.error(
        "RESOURCE FETCH ERROR:",
        error
      );

      setResources([]);

      alert(
        error?.message ||
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
    fetchTopics();
  }, []);

  // ==========================================================
  // UPLOAD VIDEO
  // ==========================================================

  const uploadVideo = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert(
        "Video title is required."
      );
      return;
    }

    if (!video) {
      alert(
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

      if (topicId) {
        formData.append(
          "topic_id",
          topicId
        );
      }

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
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Video upload failed."
        );
      }

      setTitle("");
      setDescription("");
      setVideo(null);
      setTopicId("");

      const fileInput =
        document.getElementById(
          "video-upload-input"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchResources();

      alert(
        "Video uploaded successfully."
      );
    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      alert(
        error?.message ||
          "Video upload failed."
      );
    } finally {
      setUploading(false);
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

    if (!confirmed) return;

    try {
      setDeletingId(
        resource.id
      );

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
        await response.json();

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
    } catch (error) {
      console.error(
        "DELETE VIDEO ERROR:",
        error
      );

      alert(
        error?.message ||
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
    resources.filter(
      (resource) => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) return true;

        return (
          resource.title
            ?.toLowerCase()
            .includes(query) ||
          resource.description
            ?.toLowerCase()
            .includes(query) ||
          resource.topic_title
            ?.toLowerCase()
            .includes(query)
        );
      }
    );

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
              Upload and manage learning
              videos for your students.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchResources();
              fetchTopics();
            }}
            disabled={
              loading ||
              loadingTopics
            }
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
            "
          >
            <RefreshCw
              size={17}
              className={
                loading ||
                loadingTopics
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

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
                  Categories
                </span>

                <Video
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
                {topics.length}
              </p>
            </div>
        </div>

        {/* ==================================================
            UPLOAD FORM
        ================================================== */}

        <form
          onSubmit={uploadVideo}
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
            <h2
              className="
                text-xl
                font-black
              "
            >
              Upload New Video
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-400
              "
            >
              Add a video lesson to
              your resource library.
            </p>
          </div>

          <div
            className="
              grid
              gap-6
              p-6
              sm:p-8
            "
          >
            {/* TITLE */}

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
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Example: Newton's Laws of Motion"
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

            {/* DESCRIPTION */}

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
                onChange={(e) =>
                  setDescription(
                    e.target.value
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

            {/* CATEGORY */}

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
                Video Category
              </label>

              <select
                value={topicId}
                onChange={(e) =>
                  setTopicId(
                    e.target.value
                  )
                }
                disabled={
                  loadingTopics
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
                  Select Category
                </option>

                {topics.map(
                  (topic) => (
                    <option
                      key={topic.id}
                      value={topic.id}
                    >
                      {topic.title ||
                        topic.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* VIDEO PICKER */}

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
                Video File
              </label>

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
                    font-bold
                    text-slate-200
                  "
                >
                  {video
                    ? video.name
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
                  onChange={(e) =>
                    setVideo(
                      e.target.files?.[0] ||
                        null
                    )
                  }
                />
              </label>
            </div>

            {/* UPLOAD BUTTON */}

            <button
              type="submit"
              disabled={uploading}
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
              {uploading ? (
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
              onChange={(e) =>
                setSearch(
                  e.target.value
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

                return (
                  <div
                    key={resource.id}
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-800
                      bg-slate-900
                      transition
                      hover:-translate-y-1
                      hover:border-blue-500/30
                    "
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
                            {
                              resource.title
                            }
                          </h3>

                          {resource.topic_title && (
                            <span
                              className="
                                mt-2
                                inline-block
                                rounded-full
                                bg-blue-500/10
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-blue-400
                              "
                            >
                              {
                                resource.topic_title
                              }
                            </span>
                          )}
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

                      <div
                        className="
                          mt-5
                          flex
                          gap-3
                        "
                      >
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            flex
                            flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-4
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
                          disabled={
                            deletingId ===
                            resource.id
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
                            rounded-xl
                            bg-red-500/10
                            px-4
                            text-red-400
                            transition
                            hover:bg-red-500/20
                            disabled:opacity-50
                          "
                        >
                          {deletingId ===
                          resource.id ? (
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={18}
                            />
                          )}
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