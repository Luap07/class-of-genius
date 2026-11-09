
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize,
  Minimize,
  Upload,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

export default function PresentationViewer({
  liveClassId,
  tutorReference,
  presentation,
  onPresentationChange,
}) {
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");

  const getToken = useCallback(() => {
    const keys = [
      "scholiqen_academy_token",
      "scholiqen_token",
      "academy_token",
      "admin_token",
      "access_token",
      "token",
    ];

    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }

    return "";
  }, []);

  const getHeaders = useCallback(() => {
    const token = getToken();

    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers["x-academy-token"] = token;
    }

    if (tutorReference) {
      headers["x-tutor-reference"] = tutorReference;
      headers["x-tutor-ref"] = tutorReference;
      headers["x-academy-tutor-reference"] = tutorReference;
    }

    return headers;
  }, [getToken, tutorReference]);

  const presentationUrl = useMemo(() => {
    if (!presentation?.url) return "";

    try {
      return new URL(presentation.url, API_BASE_URL).href;
    } catch {
      return presentation.url;
    }
  }, [presentation?.url, API_BASE_URL]);

  const fileName =
    presentation?.name ||
    presentation?.file_name ||
    "Presentation";

  const isPdf =
    presentation?.type === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf");

  const isPowerPoint =
    fileName.toLowerCase().endsWith(".ppt") ||
    fileName.toLowerCase().endsWith(".pptx");

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Keep the viewer synchronized when the tutor or server
  // sends a presentation update.
  useEffect(() => {
    if (!presentation) {
      setPage(1);
      setTotalPages(1);
      setZoom(100);
      return;
    }

    setPage(
      Math.max(1, Number(presentation.current_page) || 1)
    );

    setTotalPages(
      Math.max(1, Number(presentation.total_pages) || 1)
    );
  }, [
    presentation?.url,
    presentation?.current_page,
    presentation?.total_pages,
  ]);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!selectedFile) return;

    setError("");

    if (!liveClassId) {
      setError("The live classroom ID is missing.");
      return;
    }

    const fileNameLower = selectedFile.name.toLowerCase();

    const allowed =
      selectedFile.type === "application/pdf" ||
      fileNameLower.endsWith(".pdf") ||
      fileNameLower.endsWith(".ppt") ||
      fileNameLower.endsWith(".pptx");

    if (!allowed) {
      setError("Please select a PDF, PPT or PPTX file.");
      return;
    }

    const maxSize = 50 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("The presentation must be 50MB or smaller.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/api/academy/live-classes/${liveClassId}/presentation`,
        {
          method: "POST",
          headers: getHeaders(),
          body: formData,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            "The presentation could not be uploaded. Please check the server upload route."
        );
      }

      // Accept common response shapes, but require a permanent URL.
      const uploadedPresentation =
        result.presentation ||
        result.data?.presentation ||
        result.data ||
        result;

      const uploadedUrl =
        uploadedPresentation.url ||
        uploadedPresentation.file_url ||
        uploadedPresentation.fileUrl;

      if (!uploadedUrl) {
        throw new Error(
          "The server did not return a presentation URL. The upload cannot be shared with students."
        );
      }

      const presentationData = {
        name:
          uploadedPresentation.name ||
          uploadedPresentation.file_name ||
          selectedFile.name,

        file_name:
          uploadedPresentation.file_name ||
          uploadedPresentation.name ||
          selectedFile.name,

        type:
          uploadedPresentation.type ||
          selectedFile.type,

        size:
          uploadedPresentation.size ||
          selectedFile.size,

        url: uploadedUrl,

        current_page: 1,

        total_pages: Math.max(
          1,
          Number(uploadedPresentation.total_pages) || 1
        ),
      };

      if (!isMountedRef.current) return;

      setPage(1);
      setTotalPages(presentationData.total_pages);
      setZoom(100);

      // Parent broadcasts the permanent URL to the classroom.
      onPresentationChange?.(presentationData);
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err.message ||
            "An error occurred while uploading the presentation."
        );
      }
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
      }
    }
  };

  const updatePage = (nextPage) => {
    const safePage = Math.max(
      1,
      Math.min(totalPages, nextPage)
    );

    setPage(safePage);

    if (presentation) {
      onPresentationChange?.({
        ...presentation,
        current_page: safePage,
        total_pages: totalPages,
      });
    }
  };

  const previousPage = () => {
    updatePage(page - 1);
  };

  const nextPage = () => {
    updatePage(page + 1);
  };

  const zoomIn = () => {
    setZoom((current) => Math.min(200, current + 10));
  };

  const zoomOut = () => {
    setZoom((current) => Math.max(50, current - 10));
  };

  const toggleFullscreen = () => {
    setFullscreen((current) => !current);
  };

  const clearPresentation = async () => {
    if (!window.confirm("Remove this presentation from the classroom?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/academy/live-classes/${liveClassId}/presentation`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Could not remove the presentation."
        );
      }

      setPage(1);
      setTotalPages(1);
      setZoom(100);

      onPresentationChange?.(null);
    } catch (err) {
      setError(
        err.message || "Could not remove the presentation."
      );
    }
  };

  return (
    <div
      className={`w-full h-full min-h-0 bg-slate-950 text-white flex flex-col ${
        fullscreen
          ? "fixed inset-0 z-[9999]"
          : "relative"
      }`}
    >
      {/* TOP BAR */}
      <div className="h-14 shrink-0 border-b border-white/10 bg-slate-900 flex items-center justify-between px-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
            <FileText size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {presentation ? fileName : "Presentation"}
            </p>

            {presentation && (
              <p className="text-[11px] text-white/40">
                {isPdf
                  ? "PDF presentation"
                  : isPowerPoint
                  ? "PowerPoint presentation"
                  : "Classroom presentation"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={zoomOut}
            disabled={!presentation}
            className="w-9 h-9 rounded-lg hover:bg-white/10 disabled:opacity-30 flex items-center justify-center"
            title="Zoom out"
          >
            <ZoomOut size={17} />
          </button>

          <span className="text-xs text-white/60 w-12 text-center">
            {zoom}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={!presentation}
            className="w-9 h-9 rounded-lg hover:bg-white/10 disabled:opacity-30 flex items-center justify-center"
            title="Zoom in"
          >
            <ZoomIn size={17} />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center"
            title="Fullscreen"
          >
            {fullscreen ? (
              <Minimize size={17} />
            ) : (
              <Maximize size={17} />
            )}
          </button>
        </div>
      </div>

      {/* PRESENTATION AREA */}
      <div className="flex-1 min-h-0 overflow-auto bg-slate-950 flex items-center justify-center p-3 sm:p-4">
        {!presentation ? (
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <FileText
                size={38}
                className="text-white/30"
              />
            </div>

            <h2 className="text-xl font-bold mb-2">
              Share a presentation
            </h2>

            <p className="text-sm text-white/50 mb-6">
              Upload a PDF or PowerPoint presentation
              for your students to follow during the lesson.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-white/90 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}

              {uploading ? "Uploading..." : "Upload PDF / PowerPoint"}
            </button>

            <p className="mt-4 text-xs text-white/30">
              PDF, PPT and PPTX • Maximum 50MB
            </p>
          </div>
        ) : !presentationUrl ? (
          <div className="text-center max-w-md p-6">
            <AlertCircle
              size={36}
              className="mx-auto mb-3 text-amber-400"
            />
            <p className="font-semibold">
              Presentation URL unavailable
            </p>
            <p className="text-sm text-white/50 mt-2">
              This presentation does not have a permanent
              file URL that students can access.
            </p>
          </div>
        ) : isPdf ? (
          <div
            className="relative bg-white shadow-2xl overflow-hidden shrink-0"
            style={{
              width: `${zoom}%`,
              minWidth: zoom < 100 ? "70%" : "100%",
              maxWidth: "1400px",
              height: "100%",
              minHeight: "400px",
            }}
          >
            <iframe
              key={`${presentationUrl}-${page}`}
              src={`${presentationUrl}#page=${page}&zoom=${zoom}`}
              title={fileName}
              className="w-full h-full border-0 bg-white"
              allow="fullscreen"
            />
          </div>
        ) : isPowerPoint ? (
          <div className="w-full h-full min-h-[350px] bg-white text-slate-800 flex flex-col items-center justify-center p-8 text-center">
            <FileText
              size={60}
              className="mb-5 text-slate-400"
            />

            <h3 className="text-xl font-bold mb-2">
              PowerPoint uploaded
            </h3>

            <p className="text-sm text-slate-500 max-w-md">
              The PowerPoint file has been uploaded and
              shared. To display its slides inside this
              classroom, the backend must convert the
              PowerPoint document into viewable slide pages.
            </p>

            <p className="mt-4 text-xs text-slate-400 break-all">
              {fileName}
            </p>

            <a
              href={presentationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              Open PowerPoint file
            </a>
          </div>
        ) : (
          <div className="text-center text-white/50">
            Unsupported presentation format.
          </div>
        )}
      </div>

      {/* UPLOAD PROGRESS */}
      {uploading && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2
              size={38}
              className="animate-spin mx-auto mb-4 text-white"
            />
            <p className="font-semibold">
              Uploading presentation
            </p>
            <p className="text-xs text-white/50 mt-1">
              Please wait while the file is uploaded.
            </p>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-[min(92%,480px)] px-4 py-3 rounded-xl bg-red-600 text-white text-sm shadow-xl flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />

          <p className="flex-1">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 hover:bg-white/10 rounded p-1"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      {presentation && (
        <div className="min-h-16 shrink-0 border-t border-white/10 bg-slate-900 flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previousPage}
              disabled={page <= 1}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center"
              title="Previous page"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="px-2 text-sm text-white/70 whitespace-nowrap">
              Page{" "}
              <span className="font-semibold text-white">
                {page}
              </span>
              {" / "}
              {totalPages}
            </div>

            <button
              type="button"
              onClick={nextPage}
              disabled={page >= totalPages}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center"
              title="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <Upload size={16} />
              Change file
            </button>

            <button
              type="button"
              onClick={clearPresentation}
              disabled={uploading}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
