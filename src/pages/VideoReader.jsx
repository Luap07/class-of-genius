import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
  X,
  Clock,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const ACADEMY_TOKEN_KEY = "scholiqen_academy_token";
const ACADEMY_USER_KEY = "scholiqen_academy_user";

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

const getYouTubeVideoId = (url = "") => {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").split("?")[0];
    }

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtube-nocookie.com")
    ) {
      const watchId = parsed.searchParams.get("v");

      if (watchId) {
        return watchId;
      }

      const embedMatch = parsed.pathname.match(
        /\/(?:embed|shorts|live)\/([^/?]+)/
      );

      if (embedMatch) {
        return embedMatch[1];
      }
    }
  } catch {
    const fallbackMatch = url.match(
      /(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([^&?/\s]+)/
    );

    return fallbackMatch?.[1] || null;
  }

  return null;
};

const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) return "";

  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
};

const getStorageKey = (id) =>
  `scholiqen-video-progress-${String(id || "")}`;

/* =========================================================
   COMPONENT
========================================================= */

const VideoReader = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  const [resource, setResource] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const [playbackRate, setPlaybackRate] = useState(1);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [savedProgress, setSavedProgress] = useState(0);

  const [completed, setCompleted] = useState(false);

  /* =========================================================
     ACADEMY AUTH
  ========================================================= */

  const getAcademyToken = useCallback(() => {
    try {
      const token = localStorage.getItem(ACADEMY_TOKEN_KEY);

      if (!token) {
        return "";
      }

      return token.trim();
    } catch (err) {
      console.warn("Unable to read Academy token:", err);
      return "";
    }
  }, []);

  const getAcademyUser = useCallback(() => {
    try {
      const rawUser = localStorage.getItem(ACADEMY_USER_KEY);

      if (!rawUser) {
        return null;
      }

      return JSON.parse(rawUser);
    } catch (err) {
      console.warn("Unable to read Academy user:", err);
      return null;
    }
  }, []);

  /* =========================================================
     RESOURCE TYPE
  ========================================================= */

  const isYouTube = useMemo(() => {
    if (!resource) return false;

    return (
      resource.resource_type === "youtube" ||
      Boolean(resource.youtube_url && !resource.file_url)
    );
  }, [resource]);

  /* =========================================================
     MEDIA URL
  ========================================================= */

  const mediaUrl = useMemo(() => {
    if (!resource) return "";

    if (isYouTube) {
      return getYouTubeEmbedUrl(resource.youtube_url);
    }

    return resolveMediaUrl(resource.file_url);
  }, [resource, isYouTube]);

  /* =========================================================
     FETCH RESOURCE
  ========================================================= */

  const fetchResource = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (!id) {
        throw new Error("No video resource ID was provided.");
      }

      const token = getAcademyToken();
      const academyUser = getAcademyUser();

      /*
       * IMPORTANT:
       * This reader now uses the Academy student token.
       */

      if (!token) {
        throw new Error(
          "Your student session has expired. Please log in again."
        );
      }

      console.log("VIDEO READER AUTH", {
        hasToken: Boolean(token),
        userType: academyUser?.userType,
        studentId: academyUser?.studentId,
        email: academyUser?.email,
        resourceId: id,
      });

      const response = await fetch(
        `${API_URL}/api/resources/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      /*
       * Handle authentication specifically.
       */
      if (response.status === 401) {
        console.error("Video resource authentication failed.", {
          status: response.status,
          data,
        });

        throw new Error(
          "Your student authentication token is invalid or has expired. Please log in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You are not authorized to access this video."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to load video (${response.status}).`
        );
      }

      const item =
        data?.resource ||
        data?.data ||
        data;

      if (!item?.id) {
        throw new Error("Video resource was not found.");
      }

      setResource(item);
    } catch (err) {
      console.error("VideoReader error:", err);

      setError(
        err?.message ||
          "Unable to load this video."
      );
    } finally {
      setLoading(false);
    }
  }, [id, getAcademyToken, getAcademyUser]);

  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

  /* =========================================================
     LOAD SAVED PROGRESS
  ========================================================= */

  useEffect(() => {
    if (!resource?.id) return;

    try {
      const saved = localStorage.getItem(
        getStorageKey(resource.id)
      );

      if (!saved) return;

      const parsed = Number(saved);

      if (Number.isFinite(parsed) && parsed > 0) {
        setSavedProgress(parsed);
        setCurrentTime(parsed);
      }
    } catch (err) {
      console.warn(
        "Unable to restore video progress:",
        err
      );
    }
  }, [resource?.id]);

  /* =========================================================
     SAVE PROGRESS
  ========================================================= */

  const saveProgress = useCallback(
    (time) => {
      if (!resource?.id) return;

      try {
        localStorage.setItem(
          getStorageKey(resource.id),
          String(Math.floor(time || 0))
        );
      } catch (err) {
        console.warn(
          "Unable to save video progress:",
          err
        );
      }
    },
    [resource?.id]
  );

  /* =========================================================
     VIDEO EVENTS
  ========================================================= */

  const handleLoadedMetadata = () => {
    const video = videoRef.current;

    if (!video) return;

    const videoDuration = video.duration;

    setDuration(
      Number.isFinite(videoDuration)
        ? videoDuration
        : 0
    );

    if (savedProgress > 0) {
      try {
        const resumeTime = Math.min(
          savedProgress,
          Math.max(0, videoDuration - 2)
        );

        video.currentTime = resumeTime;
        setCurrentTime(resumeTime);
      } catch (err) {
        console.warn(
          "Unable to resume video:",
          err
        );
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video) return;

    setCurrentTime(video.currentTime);

    saveProgress(video.currentTime);

    if (
      video.duration &&
      video.currentTime / video.duration >= 0.9
    ) {
      setCompleted(true);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCompleted(true);

    if (resource?.id) {
      localStorage.removeItem(
        getStorageKey(resource.id)
      );
    }
  };

  /* =========================================================
     VIDEO ERROR
  ========================================================= */

  const handleVideoError = (event) => {
    console.error(
      "HTML video playback error:",
      event?.currentTarget?.error
    );

    setError(
      "The video file could not be played. The video URL may be invalid or inaccessible."
    );
  };

  /* =========================================================
     PLAY / PAUSE
  ========================================================= */

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.error(
        "Unable to play video:",
        err
      );
    }
  }, []);

  /* =========================================================
     SEEK
  ========================================================= */

  const seekTo = useCallback(
    (time) => {
      const video = videoRef.current;

      if (!video) return;

      const nextTime = Math.max(
        0,
        Math.min(time, video.duration || 0)
      );

      video.currentTime = nextTime;

      setCurrentTime(nextTime);

      saveProgress(nextTime);
    },
    [saveProgress]
  );

  const skipForward = useCallback(() => {
    seekTo(currentTime + 10);
  }, [currentTime, seekTo]);

  const skipBackward = useCallback(() => {
    seekTo(currentTime - 10);
  }, [currentTime, seekTo]);

  /* =========================================================
     VOLUME
  ========================================================= */

  const handleVolumeChange = (event) => {
    const value = Number(event.target.value);

    const video = videoRef.current;

    setVolume(value);
    setIsMuted(value === 0);

    if (video) {
      video.volume = value;
      video.muted = value === 0;
    }
  };

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.muted || video.volume === 0) {
      video.muted = false;

      const restoredVolume =
        volume > 0 ? volume : 1;

      video.volume = restoredVolume;

      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [volume]);

  /* =========================================================
     PLAYBACK SPEED
  ========================================================= */

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;

    if (!video) return;

    video.playbackRate = rate;

    setPlaybackRate(rate);
    setShowSettings(false);
  };

  /* =========================================================
     FULLSCREEN
  ========================================================= */

  const toggleFullscreen = useCallback(async () => {
    const container =
      playerContainerRef.current;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error(
        "Fullscreen error:",
        err
      );
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement)
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  /* =========================================================
     KEYBOARD SHORTCUTS
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }

      if (event.key === "ArrowRight") {
        seekTo(currentTime + 5);
      }

      if (event.key === "ArrowLeft") {
        seekTo(currentTime - 5);
      }

      if (event.key.toLowerCase() === "m") {
        toggleMute();
      }

      if (event.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    currentTime,
    togglePlay,
    seekTo,
    toggleMute,
    toggleFullscreen,
  ]);

  /* =========================================================
     RESET
  ========================================================= */

  const restartVideo = () => {
    seekTo(0);

    const video = videoRef.current;

    if (video) {
      video.play().catch(() => {});
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-sm text-slate-400">
            Loading video...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !resource) {
    const isAuthError =
      error?.toLowerCase().includes("authentication") ||
      error?.toLowerCase().includes("token") ||
      error?.toLowerCase().includes("log in again");

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <X className="h-8 w-8 text-red-400" />
          </div>

          <h1 className="text-xl font-bold">
            Unable to load video
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error ||
              "This video resource could not be found."}
          </p>

          {isAuthError && (
            <p className="mt-3 text-xs text-slate-500">
              Your Academy student session may have expired.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              Go Back
            </button>

            {isAuthError ? (
              <button
                onClick={() =>
                  navigate(
                    "/academy/student-enrollment-login",
                    { replace: true }
                  )
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Student Login
              </button>
            ) : (
              <button
                onClick={fetchResource}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.09] hover:text-white"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {resource.title}
            </p>

            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              {resource.course_title && (
                <>
                  <span className="truncate">
                    {resource.course_title}
                  </span>

                  <span>•</span>
                </>
              )}

              <span>
                {isYouTube
                  ? "YouTube Lesson"
                  : "Video Lesson"}
              </span>
            </div>
          </div>

          {completed && (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:flex">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </div>
          )}
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              PLAYER
          ================================================= */}

          <section>
            <div
              ref={playerContainerRef}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
            >
              {/* VIDEO */}

              <div className="relative aspect-video w-full bg-black">
                {isYouTube ? (
                  mediaUrl ? (
                    <iframe
                      src={mediaUrl}
                      title={resource.title}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Invalid YouTube URL
                    </div>
                  )
                ) : (
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    className="h-full w-full object-contain"
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={
                      handleLoadedMetadata
                    }
                    onTimeUpdate={
                      handleTimeUpdate
                    }
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleEnded}
                    onError={handleVideoError}
                    onClick={togglePlay}
                  />
                )}

                {/* CENTER PLAY BUTTON */}

                {!isYouTube &&
                  !isPlaying && (
                    <button
                      onClick={togglePlay}
                      className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-blue-600/90 shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-blue-500"
                    >
                      <Play className="ml-1 h-7 w-7 fill-current" />
                    </button>
                  )}
              </div>

              {/* CONTROLS */}

              {!isYouTube && (
                <div className="border-t border-white/10 bg-[#080b16] px-4 py-3">
                  {/* PROGRESS */}

                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={(event) =>
                        seekTo(
                          Number(event.target.value)
                        )
                      }
                      className="h-1.5 w-full cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* PLAY */}

                    <button
                      onClick={togglePlay}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 fill-current" />
                      )}
                    </button>

                    {/* BACKWARD */}

                    <button
                      onClick={skipBackward}
                      className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white sm:flex"
                      title="Back 10 seconds"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    {/* FORWARD */}

                    <button
                      onClick={skipForward}
                      className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white sm:flex"
                      title="Forward 10 seconds"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>

                    {/* TIME */}

                    <div className="ml-1 min-w-[100px] text-xs tabular-nums text-slate-400">
                      {formatTime(currentTime)}
                      {" / "}
                      {formatTime(duration)}
                    </div>

                    <div className="flex-1" />

                    {/* VOLUME */}

                    <button
                      onClick={toggleMute}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={
                        isMuted ? 0 : volume
                      }
                      onChange={
                        handleVolumeChange
                      }
                      className="hidden w-20 cursor-pointer accent-blue-500 sm:block"
                    />

                    {/* SETTINGS */}

                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowSettings(
                            (value) => !value
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        <Settings className="h-5 w-5" />
                      </button>

                      {showSettings && (
                        <div className="absolute bottom-12 right-0 z-30 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#101522] p-2 shadow-2xl">
                          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Playback speed
                          </p>

                          {[
                            0.5,
                            0.75,
                            1,
                            1.25,
                            1.5,
                            1.75,
                            2,
                          ].map((rate) => (
                            <button
                              key={rate}
                              onClick={() =>
                                changePlaybackRate(
                                  rate
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                                playbackRate ===
                                rate
                                  ? "bg-blue-500/15 text-blue-300"
                                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span>
                                {rate === 1
                                  ? "Normal"
                                  : `${rate}×`}
                              </span>

                              {playbackRate ===
                                rate && (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* FULLSCREEN */}

                    <button
                      onClick={
                        toggleFullscreen
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      {isFullscreen ? (
                        <Minimize className="h-5 w-5" />
                      ) : (
                        <Maximize className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* YOUTUBE LABEL */}

              {isYouTube && (
                <div className="flex items-center justify-between border-t border-white/10 bg-[#080b16] px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ExternalLink className="h-4 w-4" />
                    YouTube video
                  </div>

                  <a
                    href={resource.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    Watch on YouTube
                  </a>
                </div>
              )}
            </div>

            {/* =================================================
                VIDEO INFORMATION
            ================================================= */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                      {isYouTube
                        ? "YouTube"
                        : "Video"}
                    </span>

                    {resource.topic_title && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-400">
                        {resource.topic_title}
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {resource.title}
                  </h1>
                </div>

                {resource.created_at && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-4 w-4" />

                    {new Date(
                      resource.created_at
                    ).toLocaleDateString()}
                  </div>
                )}
              </div>

              {resource.description && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <h2 className="mb-2 text-sm font-semibold text-slate-200">
                    About this lesson
                  </h2>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                    {resource.description}
                  </p>
                </div>
              )}

              {!isYouTube &&
                savedProgress > 0 &&
                !completed && (
                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-blue-400/10 bg-blue-500/[0.06] p-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-200">
                        Resume available
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        You were at{" "}
                        {formatTime(
                          savedProgress
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        seekTo(savedProgress)
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                    >
                      Resume
                    </button>
                  </div>
                )}

              {completed && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      Lesson completed
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      You have watched most of this lesson.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              SIDE PANEL
          ================================================= */}

          <aside className="space-y-5">
            {/* LESSON CARD */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Current lesson
                </p>

                <h2 className="mt-2 text-lg font-bold text-white">
                  {resource.title}
                </h2>
              </div>

              {!isYouTube && (
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Progress
                    </span>

                    <span className="font-semibold text-blue-300">
                      {duration
                        ? Math.round(
                            (currentTime /
                              duration) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${
                          duration
                            ? Math.min(
                                100,
                                (currentTime /
                                  duration) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (isYouTube) {
                    const embed =
                      getYouTubeEmbedUrl(
                        resource.youtube_url
                      );

                    if (embed) {
                      window.open(
                        embed,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  } else {
                    restartVideo();
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Play className="h-4 w-4 fill-current" />

                {isYouTube
                  ? "Open YouTube Player"
                  : "Restart Lesson"}
              </button>
            </div>

            {/* COURSE / TOPIC */}

            {(resource.course_title ||
              resource.topic_title) && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">
                  Course information
                </h2>

                <div className="space-y-4">
                  {resource.course_title && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-600">
                        Course
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-300">
                        {resource.course_title}
                      </p>
                    </div>
                  )}

                  {resource.topic_title && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-600">
                        Topic
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-300">
                        {resource.topic_title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SHORTCUTS */}

            {!isYouTube && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="mb-4 text-sm font-semibold text-white">
                  Player shortcuts
                </h2>

                <div className="space-y-3 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Play / Pause</span>

                    <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                      Space
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Seek</span>

                    <span className="flex gap-1">
                      <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                        ←
                      </kbd>

                      <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                        →
                      </kbd>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Mute</span>

                    <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                      M
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Fullscreen</span>

                    <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                      F
                    </kbd>
                  </div>
                </div>
              </div>
            )}

            {/* BACK */}

            <button
              onClick={() => navigate(-1)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Resources
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default VideoReader;
