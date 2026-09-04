// src/pages/lms/Resources.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Search,
  Filter,
  Video,
  PlayCircle,
  Loader2,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

import ResourceCard from "../../components/lms/ResourceCard";

// =========================================================
// API
// =========================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";

// =========================================================
// FILTERS
// =========================================================

const filters = [
  "All",
  "video",
  "youtube",
];

// =========================================================
// COMPONENT
// =========================================================

const Resources = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const [refreshing, setRefreshing] = useState(false);

  // =======================================================
  // FETCH RESOURCES
  // =======================================================

  const fetchResources = async () => {
    try {
      setError("");
      setLoading(true);

      const token = localStorage.getItem(
        AUTH_TOKEN_KEY
      );

      const response = await fetch(
        `${API_URL}/api/resources`,
        {
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
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to load resources (${response.status}).`
        );
      }

      /*
       * Supports:
       *
       * {
       *   success: true,
       *   resources: [...]
       * }
       *
       * OR
       *
       * {
       *   data: [...]
       * }
       *
       * OR
       *
       * [...]
       */

      const resourceList =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.resources)
          ? data.resources
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setResources(resourceList);
    } catch (err) {
      console.error(
        "VIDEO RESOURCE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load video resources."
      );

      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchResources();
  }, []);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchResources();
    } finally {
      setRefreshing(false);
    }
  };

  // =======================================================
  // SEARCH + FILTER
  // =======================================================

  const filteredResources = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    return resources.filter(
      (resource) => {
        const topicTitle =
          resource?.course_topics?.title ||
          resource?.topic_title ||
          resource?.topic?.title ||
          "";

        const courseTitle =
          resource?.course_topics?.courses?.title ||
          resource?.course_title ||
          resource?.course?.title ||
          "";

        const title =
          resource?.title || "";

        const description =
          resource?.description || "";

        const matchesSearch =
          !searchText ||
          title
            .toLowerCase()
            .includes(searchText) ||
          description
            .toLowerCase()
            .includes(searchText) ||
          topicTitle
            .toLowerCase()
            .includes(searchText) ||
          courseTitle
            .toLowerCase()
            .includes(searchText);

        const matchesFilter =
          filter === "All"
            ? true
            : resource?.resource_type ===
              filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    resources,
    search,
    filter,
  ]);

  // =======================================================
  // STATS
  // =======================================================

  const stats = useMemo(() => {
    return {
      video: resources.filter(
        (item) =>
          item?.resource_type ===
          "video"
      ).length,

      youtube: resources.filter(
        (item) =>
          item?.resource_type ===
          "youtube"
      ).length,
    };
  }, [resources]);

  // =======================================================
  // OPEN RESOURCE
  // =======================================================

  const openResource = (resource) => {
    if (!resource?.id) {
      console.warn(
        "Invalid resource:",
        resource
      );

      return;
    }

    /*
     * Both uploaded videos and YouTube
     * videos now use the same VideoReader.
     *
     * VideoReader decides whether to display:
     *
     * 1. Local uploaded MP4
     * 2. YouTube embedded player
     */

    navigate(
      `/video/${encodeURIComponent(
        String(resource.id)
      )}`
    );
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[400px]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <Loader2
            size={45}
            className="
              mx-auto
              animate-spin
              text-blue-500
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-slate-400
            "
          >
            Loading video resources...
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <div
        className="
          space-y-5
        "
      >
        <div>
          <h1
            className="
              text-4xl
              font-black
              text-white
            "
          >
            Video Resources
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Watch uploaded lessons and
            YouTube classes from your courses.
          </p>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-red-500/30
            bg-red-500/10
            p-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  text-red-400
                "
              >
                Failed loading videos
              </h2>

              <p
                className="
                  mt-3
                  text-slate-300
                "
              >
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-3
                font-semibold
                text-white
                transition
                hover:bg-blue-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div
      className="
        space-y-8
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

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
          <h1
            className="
              text-4xl
              font-black
              text-white
            "
          >
            Video Resources
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            Watch uploaded lessons and
            YouTube classes from your courses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-800
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
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            px-5
            py-4
            lg:w-[450px]
          "
        >
          <Search
            size={20}
            className="
              shrink-0
              text-slate-500
            "
          />

          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              bg-transparent
              text-white
              outline-none
              placeholder:text-slate-500
            "
          />
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            px-6
            py-4
            text-slate-300
          "
        >
          <Filter size={18} />

          <span>
            {filteredResources.length}
          </span>

          <span className="text-slate-500">
            resources
          </span>
        </div>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div
        className="
          flex
          flex-wrap
          gap-3
        "
      >
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setFilter(item)
            }
            className={`
              rounded-xl
              px-5
              py-3
              font-medium
              transition

              ${
                filter === item
                  ? `
                    bg-blue-600
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                  `
                  : `
                    border
                    border-slate-800
                    bg-slate-900
                    text-slate-300
                    hover:border-slate-700
                    hover:bg-slate-800
                  `
              }
            `}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div
        className="
          grid
          gap-6
          md:grid-cols-2
        "
      >
        {/* UPLOADED VIDEOS */}

        <div
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Uploaded Videos
              </p>

              <h2
                className="
                  mt-2
                  text-4xl
                  font-bold
                  text-white
                "
              >
                {stats.video}
              </h2>
            </div>

            <div
              className="
                rounded-2xl
                bg-purple-500/10
                p-4
              "
            >
              <Video
                className="
                  text-purple-400
                "
                size={35}
              />
            </div>
          </div>
        </div>

        {/* YOUTUBE */}

        <div
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                YouTube Lessons
              </p>

              <h2
                className="
                  mt-2
                  text-4xl
                  font-bold
                  text-white
                "
              >
                {stats.youtube}
              </h2>
            </div>

            <div
              className="
                rounded-2xl
                bg-red-500/10
                p-4
              "
            >
              <PlayCircle
                className="
                  text-red-400
                "
                size={35}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          RESOURCE GRID
      ================================================= */}

      {filteredResources.length > 0 ? (
        <div
          className="
            grid
            gap-8
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filteredResources.map(
            (resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onOpen={openResource}
              />
            )
          )}
        </div>
      ) : (
        <div
          className="
            rounded-3xl
            border
            border-dashed
            border-slate-700
            bg-slate-900
            py-24
            text-center
          "
        >
          <FolderOpen
            size={60}
            className="
              mx-auto
              text-slate-600
            "
          />

          <h2
            className="
              mt-5
              text-2xl
              font-bold
              text-white
            "
          >
            No Videos Found
          </h2>

          <p
            className="
              mt-3
              text-slate-400
            "
          >
            {search
              ? "Try changing your search or filter."
              : "No video lessons are available yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Resources;