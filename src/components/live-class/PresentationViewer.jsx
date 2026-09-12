import React, { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize,
  Minimize,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function PresentationViewer({
  liveClassId,
  tutorReference,
  presentation,
  onPresentationChange,
}) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const isPdf =
    file?.type === "application/pdf" ||
    file?.name?.toLowerCase().endsWith(".pdf");

  const isPowerPoint =
    file?.name?.toLowerCase().endsWith(".ppt") ||
    file?.name?.toLowerCase().endsWith(".pptx");

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");

    const allowed =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf") ||
      selectedFile.name.toLowerCase().endsWith(".ppt") ||
      selectedFile.name.toLowerCase().endsWith(".pptx");

    if (!allowed) {
      setError("Please select a PDF, PPT or PPTX file.");
      return;
    }

    const maxSize = 50 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("The presentation must be 50MB or smaller.");
      return;
    }

    setFile(selectedFile);
    setPage(1);
    setZoom(100);

    const localUrl = URL.createObjectURL(selectedFile);

    const presentationData = {
      name: selectedFile.name,
      file_name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      url: localUrl,
      current_page: 1,
      total_pages: 1,
    };

    onPresentationChange?.(presentationData);

    /*
     * The actual upload endpoint can be connected to your
     * existing file-storage API later. For now the selected
     * document is displayed locally in the tutor's classroom.
     */
    setUploading(false);
  };

  const previousPage = () => {
    setPage((current) => {
      const next = Math.max(1, current - 1);

      onPresentationChange?.({
        ...presentation,
        current_page: next,
      });

      return next;
    });
  };

  const nextPage = () => {
    setPage((current) => {
      const next = Math.min(totalPages, current + 1);

      onPresentationChange?.({
        ...presentation,
        current_page: next,
      });

      return next;
    });
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

  const clearPresentation = () => {
    if (file) {
      URL.revokeObjectURL(URL.createObjectURL(file));
    }

    setFile(null);
    setPage(1);
    setTotalPages(1);
    setZoom(100);
    setError("");

    onPresentationChange?.(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`w-full h-full bg-slate-950 flex flex-col ${
        fullscreen
          ? "fixed inset-0 z-[9999]"
          : "relative"
      }`}
    >
      {/* TOP BAR */}
      <div className="h-14 shrink-0 border-b border-white/10 bg-slate-900 flex items-center justify-between px-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <FileText size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {file?.name || "Presentation"}
            </p>

            {file && (
              <p className="text-[11px] text-white/40">
                {isPdf
                  ? "PDF presentation"
                  : isPowerPoint
                  ? "PowerPoint presentation"
                  : "Presentation"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={!file}
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
            disabled={!file}
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
      <div className="flex-1 min-h-0 overflow-auto bg-slate-950 flex items-center justify-center p-4">
        {!file ? (
          <div className="text-center max-w-md">
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
              for your students to follow during the
              lesson.
            </p>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-white/90"
            >
              <Upload size={18} />
              Upload PDF / PowerPoint
            </button>

            <p className="mt-4 text-xs text-white/30">
              PDF, PPT and PPTX • Maximum 50MB
            </p>
          </div>
        ) : (
          <div
            className="relative bg-white shadow-2xl overflow-hidden"
            style={{
              width: `${zoom}%`,
              minWidth:
                zoom < 100 ? "70%" : "100%",
              maxWidth: "1400px",
              aspectRatio: "16 / 9",
            }}
          >
            {isPdf ? (
              <iframe
                src={`${URL.createObjectURL(file)}#page=${page}`}
                title={file.name}
                className="w-full h-full border-0"
              />
            ) : isPowerPoint ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-8 text-center">
                <FileText
                  size={60}
                  className="mb-5 text-slate-400"
                />

                <h3 className="text-xl font-bold mb-2">
                  PowerPoint presentation loaded
                </h3>

                <p className="text-sm text-slate-500 max-w-md">
                  Your PPT/PPTX file is ready. For
                  synchronized classroom presentation,
                  the backend should convert the
                  PowerPoint file into presentation pages
                  after upload.
                </p>

                <p className="mt-4 text-xs text-slate-400">
                  {file.name}
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Unsupported presentation format.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-3 rounded-xl bg-red-600 text-white text-sm shadow-xl">
          {error}
        </div>
      )}

      {/* BOTTOM PRESENTATION CONTROLS */}
      {file && (
        <div className="h-16 shrink-0 border-t border-white/10 bg-slate-900 flex items-center justify-between px-3">
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

            <div className="px-3 text-sm text-white/70">
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
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm flex items-center gap-2"
            >
              <Upload size={16} />
              Change file
            </button>

            <button
              type="button"
              onClick={clearPresentation}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* HIDDEN FILE INPUT */}
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