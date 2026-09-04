import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Clock,
  BookOpen,
  FolderOpen,
  Video,
  Loader2,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

/* =========================================================
   HELPERS
========================================================= */

const resolveMediaUrl = (url) => {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getYouTubeVideoId = (url) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\/+/, "").split("/")[0] || null;
    }

    const watchId = parsed.searchParams.get("v");

    if (watchId) {
      return watchId;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    const embedIndex = parts.indexOf("embed");

    if (embedIndex !== -1 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }

    const shortsIndex = parts.indexOf("shorts");

    if (shortsIndex !== -1 && parts[shortsIndex + 1]) {
      return parts[shortsIndex + 1];
    }

    const liveIndex = parts.indexOf("live");

    if (liveIndex !== -1 && parts[liveIndex + 1]) {
      return parts[liveIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
};

const getYouTubeThumbnail = (url) => {
  const id = getYouTubeVideoId(url);

  if (!id) return "";

  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const total = Math.floor(seconds);

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
};

/* =========================================================
   RESOURCE CARD
========================================================= */

const ResourceCard = ({ resource, onOpen }) => {
  const videoRef = useRef(null);

  const [duration, setDuration] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageError, setImageError] = useState(false);

  /* =======================================================
     RESOURCE DATA
  ======================================================= */

  const title = resource?.title || "Untitled Video";

  const description =
    resource?.description ||
    "Watch this learning resource.";

  const resourceType = String(
    resource?.resource_type ||
      resource?.resourceType ||
      resource?.type ||
      ""
  ).toLowerCase();

  const youtubeUrl =
    resource?.youtube_url ||
    resource?.youtubeUrl ||
    "";

  const fileUrl =
    resource?.file_url ||
    resource?.fileUrl ||
    resource?.video_url ||
    resource?.videoUrl ||
    "";

  const topic =
    resource?.course_topics ||
    resource?.course_topic ||
    resource?.topic ||
    null;

  const course =
    topic?.courses ||
    resource?.course ||
    null;

  const topicTitle =
    typeof topic === "string"
      ? topic
      : topic?.title ||
        resource?.topic_title ||
        "";

  const courseTitle =
    typeof course === "string"
      ? course
      : course?.title ||
        resource?.course_title ||
        "";

  const isYouTube =
    resourceType === "youtube" ||
    (!fileUrl && Boolean(youtubeUrl));

  const isLocalVideo =
    !isYouTube && Boolean(fileUrl);

  const videoUrl = resolveMediaUrl(fileUrl);

  const youtubeThumbnail = getYouTubeThumbnail(youtubeUrl);

  /* =======================================================
     VIDEO METADATA
  ======================================================= */

  useEffect(() => {
    setDuration("");
    setIsLoaded(false);
    setHasError(false);
    setIsPlayingPreview(false);

    const video = videoRef.current;

    if (!video || !isLocalVideo) {
      return;
    }

    const handleLoadedMetadata = () => {
      if (Number.isFinite(video.duration)) {
        setDuration(formatDuration(video.duration));
      }

      setIsLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    video.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    video.addEventListener(
      "error",
      handleError
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      video.removeEventListener(
        "error",
        handleError
      );
    };
  }, [videoUrl, isLocalVideo]);

  /* =======================================================
     PREVIEW
  ======================================================= */

  const startPreview = async () => {
    if (!videoRef.current || !isLocalVideo) {
      return;
    }

    try {
      const video = videoRef.current;

      video.muted = true;

      await video.play();

      setIsPlayingPreview(true);
    } catch (error) {
      console.warn(
        "Video preview could not start:",
        error
      );
    }
  };

  const stopPreview = () => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.pause();
    videoRef.current.currentTime = 0;

    setIsPlayingPreview(false);
  };

  /* =======================================================
     OPEN VIDEO
  ======================================================= */

  const handleOpen = () => {
    if (!resource?.id) {
      console.warn(
        "Invalid resource:",
        resource
      );
      return;
    }

    if (typeof onOpen === "function") {
      onOpen(resource);
    }
  };

  /* =======================================================
     FALLBACK
  ======================================================= */

  const fallbackPreview = (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_55%)]" />

      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-xl">
        <Video className="h-9 w-9 text-white/80" />
      </div>
    </div>
  );

  /* =======================================================
     PREVIEW RENDER
  ======================================================= */

  const renderPreview = () => {
    /* -----------------------------------------------------
       YOUTUBE THUMBNAIL
    ----------------------------------------------------- */

    if (
      isYouTube &&
      youtubeThumbnail &&
      !imageError
    ) {
      return (
        <img
          src={youtubeThumbnail}
          alt={title}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-105
          "
          onError={() => setImageError(true)}
        />
      );
    }

    /* -----------------------------------------------------
       LOCAL VIDEO
    ----------------------------------------------------- */

    if (
      isLocalVideo &&
      !hasError
    ) {
      return (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline
          preload="metadata"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />
      );
    }

    return fallbackPreview;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-slate-950/80
        shadow-xl
        shadow-black/20
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-500/30
        hover:shadow-2xl
        hover:shadow-blue-950/30
      "
    >
      {/* =================================================
          VIDEO PREVIEW
      ================================================= */}

      <div
        className="
          relative
          aspect-video
          overflow-hidden
          bg-black
        "
        onMouseEnter={() => {
          if (isLocalVideo) {
            startPreview();
          }
        }}
        onMouseLeave={() => {
          if (isLocalVideo) {
            stopPreview();
          }
        }}
      >
        {renderPreview()}

        {/* DARK OVERLAY */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

        {/* =================================================
            TYPE BADGE
        ================================================= */}

        <div className="absolute left-3 top-3">
          {isYouTube ? (
            <span className="rounded-full border border-red-400/20 bg-red-600/90 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
              YOUTUBE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-600/90 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
              <Video className="h-3 w-3" />
              VIDEO
            </span>
          )}
        </div>

        {/* =================================================
            DURATION
        ================================================= */}

        {duration && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <Clock className="h-3 w-3" />
            {duration}
          </div>
        )}

        {/* =================================================
            PLAY BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleOpen}
          aria-label={`Play ${title}`}
          className="
            absolute
            left-1/2
            top-1/2
            flex
            h-16
            w-16
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-white/15
            text-white
            shadow-2xl
            backdrop-blur-xl
            transition-all
            duration-300
            hover:scale-110
            hover:border-blue-400
            hover:bg-blue-600
            active:scale-95
          "
        >
          <Play
            className="ml-1 h-7 w-7 fill-current"
            fill="currentColor"
          />
        </button>

        {/* =================================================
            PREVIEW INDICATOR
        ================================================= */}

        {isPlayingPreview && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            <span className="flex items-center gap-0.5">
              <span className="h-2 w-0.5 animate-pulse bg-white" />
              <span className="h-3 w-0.5 animate-pulse bg-white [animation-delay:100ms]" />
              <span className="h-2 w-0.5 animate-pulse bg-white [animation-delay:200ms]" />
            </span>

            Preview
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {isLocalVideo &&
          !isLoaded &&
          !hasError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-black/40 p-3 backdrop-blur-md">
                <Loader2 className="h-5 w-5 animate-spin text-white/70" />
              </div>
            </div>
          )}

        {/* =================================================
            ERROR
        ================================================= */}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
            <Video className="mb-2 h-8 w-8 text-slate-600" />

            <span className="text-xs text-slate-500">
              Video preview unavailable
            </span>
          </div>
        )}

        {/* HOVER GLOW */}

        <div className="pointer-events-none absolute inset-0 bg-blue-500/0 transition group-hover:bg-blue-500/5" />
      </div>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <div className="p-4">
        {/* TITLE */}

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-white transition-colors group-hover:text-blue-400">
          {title}
        </h3>

        {/* DESCRIPTION */}

        {description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
            {description}
          </p>
        )}

        {/* COURSE */}

        {courseTitle && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-400" />

            <span className="truncate">
              {courseTitle}
            </span>
          </div>
        )}

        {/* TOPIC */}

        {topicTitle && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-indigo-400" />

            <span className="truncate">
              {topicTitle}
            </span>
          </div>
        )}

        {/* BOTTOM */}

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Video className="h-3.5 w-3.5" />

            <span>
              {isYouTube
                ? "YouTube lesson"
                : "Video lesson"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="
              flex
              items-center
              gap-1.5
              rounded-lg
              bg-blue-600/10
              px-3
              py-1.5
              text-xs
              font-semibold
              text-blue-400
              transition
              hover:bg-blue-600
              hover:text-white
            "
          >
            <Play className="h-3.5 w-3.5 fill-current" />

            Watch
          </button>
        </div>
      </div>
    </article>
  );
};

export default ResourceCard;