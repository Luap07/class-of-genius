// src/pages/tutor/TutorMaterials.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/* =========================================================
   PDF WORKER
========================================================= */

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================================
   HELPERS
========================================================= */

const getFileUrl = (fileUrl) => {
  if (!fileUrl) return "";

  const value = String(fileUrl).trim();

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

const formatFileSize = (bytes) => {
  if (!bytes || Number(bytes) <= 0) {
    return "Unknown size";
  }

  const size = Number(bytes);

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatMaterialType = (type) => {
  if (!type) return "Material";

  const normalized = String(type).toLowerCase();

  if (normalized === "pdf") {
    return "PDF";
  }

  if (
    normalized === "doc" ||
    normalized === "docx"
  ) {
    return "Word Document";
  }

  if (
    normalized === "video" ||
    normalized === "mp4" ||
    normalized === "webm" ||
    normalized === "mov"
  ) {
    return "Video";
  }

  return type;
};

const isPdfMaterial = (material) => {
  const type = String(
    material?.material_type || ""
  ).toLowerCase();

  const fileName = String(
    material?.file_name || ""
  ).toLowerCase();

  const mime = String(
    material?.file_mime_type || ""
  ).toLowerCase();

  const fileUrl = String(
    material?.file_url || ""
  ).toLowerCase();

  return (
    type === "pdf" ||
    mime === "application/pdf" ||
    fileName.endsWith(".pdf") ||
    /\.pdf(?:\?|#|$)/i.test(fileUrl)
  );
};

const isVideoMaterial = (material) => {
  const type = String(
    material?.material_type || ""
  ).toLowerCase();

  const fileName = String(
    material?.file_name || ""
  ).toLowerCase();

  const fileUrl = String(
    material?.file_url || ""
  ).toLowerCase();

  return (
    type === "video" ||
    type === "mp4" ||
    type === "webm" ||
    type === "mov" ||
    /\.(mp4|webm|mov)$/i.test(fileName) ||
    /\.(mp4|webm|mov)(\?|#|$)/i.test(fileUrl)
  );
};

/* =========================================================
   BOOK READER
========================================================= */

function BookReader({
  material,
  onClose,
}) {
  const [opened, setOpened] = useState(false);

  const [numPages, setNumPages] = useState(0);

  const [pageNumber, setPageNumber] = useState(1);

  const [loadingPdf, setLoadingPdf] =
    useState(true);

  const [pdfError, setPdfError] =
    useState("");

  const [pdfBlobUrl, setPdfBlobUrl] =
    useState("");

  const [scale, setScale] = useState(1);

  const [videoError, setVideoError] =
    useState(false);

  const fileUrl = getFileUrl(
    material?.file_url
  );

  const pdfMaterial =
    isPdfMaterial(material);

  const videoMaterial =
    isVideoMaterial(material);

  /* =======================================================
     OPEN BOOK ANIMATION
  ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpened(true);
    }, 550);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /* =======================================================
     ESC + KEYBOARD NAVIGATION
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (
        event.key === "ArrowRight" &&
        pdfMaterial &&
        numPages > 0
      ) {
        setPageNumber((current) =>
          Math.min(
            current + 2,
            numPages
          )
        );
      }

      if (
        event.key === "ArrowLeft" &&
        pdfMaterial
      ) {
        setPageNumber((current) =>
          Math.max(current - 2, 1)
        );
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
    onClose,
    pdfMaterial,
    numPages,
  ]);

  /* =======================================================
     FETCH PDF AS BLOB
  ======================================================= */

  useEffect(() => {
    let cancelled = false;
    let createdBlobUrl = "";

    const loadPdf = async () => {
      if (!pdfMaterial) {
        setLoadingPdf(false);
        return;
      }

      if (!fileUrl) {
        setLoadingPdf(false);
        setPdfError(
          "The PDF file URL is missing."
        );
        return;
      }

      try {
        setLoadingPdf(true);
        setPdfError("");
        setNumPages(0);
        setPageNumber(1);

        console.log(
          "Loading tutor material PDF:",
          fileUrl
        );

        const response = await fetch(
          fileUrl,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept:
                "application/pdf,*/*",
            },
          }
        );

        if (!response.ok) {
          let serverMessage = "";

          try {
            const contentType =
              response.headers.get(
                "content-type"
              ) || "";

            if (
              contentType.includes(
                "application/json"
              )
            ) {
              const data =
                await response.json();

              serverMessage =
                data?.message ||
                data?.error ||
                "";
            } else {
              serverMessage =
                await response.text();
            }
          } catch {
            serverMessage = "";
          }

          throw new Error(
            serverMessage ||
              `The server returned HTTP ${response.status}.`
          );
        }

        const blob =
          await response.blob();

        if (cancelled) {
          return;
        }

        if (!blob || blob.size === 0) {
          throw new Error(
            "The server returned an empty PDF file."
          );
        }

        createdBlobUrl =
          URL.createObjectURL(blob);

        setPdfBlobUrl(
          createdBlobUrl
        );

        setLoadingPdf(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Tutor material PDF fetch error:",
          error
        );

        setLoadingPdf(false);

        setPdfError(
          error?.message ||
            "Unable to open this PDF. The file may be unavailable or corrupted."
        );
      }
    };

    loadPdf();

    return () => {
      cancelled = true;

      if (createdBlobUrl) {
        URL.revokeObjectURL(
          createdBlobUrl
        );
      }

      setPdfBlobUrl("");
    };
  }, [
    fileUrl,
    pdfMaterial,
  ]);

  /* =======================================================
     PDF LOAD SUCCESS

     IMPORTANT:
     DO NOT RESET pageNumber HERE.

     React-PDF can call onLoadSuccess again when
     the Document component renders. Resetting the
     page here caused Next to jump back to page 1.
  ======================================================= */

  const handlePdfLoadSuccess = ({
    numPages: totalPages,
  }) => {
    setNumPages(totalPages);

    setLoadingPdf(false);

    setPdfError("");
  };

  /* =======================================================
     PDF LOAD ERROR
  ======================================================= */

  const handlePdfLoadError = (error) => {
    console.error(
      "Tutor material react-pdf error:",
      error
    );

    setLoadingPdf(false);

    setPdfError(
      "Unable to read this PDF. The PDF file may be damaged or the uploaded file is not a valid PDF."
    );
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goPrevious = () => {
    setPageNumber((current) =>
      Math.max(
        current - 2,
        1
      )
    );
  };

  const goNext = () => {
    setPageNumber((current) => {
      if (numPages <= 0) {
        return current;
      }

      return Math.min(
        current + 2,
        numPages
      );
    });
  };

  const canGoPrevious =
    pageNumber > 1;

  const canGoNext =
    numPages > 0 &&
    pageNumber < numPages;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AnimatePresence>
      <motion.div
        key="book-reader"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        className="
          fixed
          inset-0
          z-[100]
          flex
          flex-col
          bg-[#020617]
        "
      >
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div
          className="
            relative
            z-50
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            border-white/10
            bg-[#071426]/95
            px-4
            backdrop-blur-xl
            sm:px-6
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-cyan-400/20
                bg-cyan-400/10
                text-cyan-300
              "
            >
              <BookOpen size={18} />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-white
                  sm:text-base
                "
              >
                {material?.title ||
                  "Learning Material"}
              </h2>

              <p className="truncate text-[11px] text-slate-500">
                {material?.subject ||
                  "Material"}

                {material?.subject &&
                material?.level
                  ? " • "
                  : ""}

                {material?.level || ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-slate-400
              transition
              hover:border-white/20
              hover:bg-white/[0.08]
              hover:text-white
            "
            aria-label="Close reader"
          >
            <X size={20} />
          </button>
        </div>

        {/* =================================================
            READER AREA
        ================================================= */}

        <div
          className="
            relative
            flex
            min-h-0
            flex-1
            items-center
            justify-center
            overflow-hidden
            bg-[#020617]
            p-3
            sm:p-5
            lg:p-8
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_45%)]
            "
          />

          <div
            className="
              relative
              z-10
              flex
              h-full
              w-full
              max-w-[1500px]
              items-center
              justify-center
            "
          >
            <div
              className="
                relative
                flex
                max-h-full
                w-full
                items-center
                justify-center
                [perspective:2400px]
              "
            >
              {/* =================================================
                  CLOSED COVER
              ================================================= */}

              <AnimatePresence mode="wait">
                {!opened ? (
                  <motion.div
                    key="closed-book"
                    initial={{
                      opacity: 0,
                      scale: 0.78,
                      rotateY: -25,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotateY: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      rotateY: -90,
                    }}
                    transition={{
                      duration: 0.55,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="
                      relative
                      aspect-[3/4]
                      h-[70vh]
                      max-h-[720px]
                      w-auto
                      max-w-[90vw]
                      overflow-hidden
                      rounded-r-xl
                      border
                      border-black/30
                      bg-[#101827]
                      shadow-[30px_35px_80px_rgba(0,0,0,0.65)]
                    "
                  >
                    {material?.cover_page_url ? (
                      <img
                        src={getFileUrl(
                          material.cover_page_url
                        )}
                        alt=""
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                        <BookOpen size={50} />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="opened-book"
                    initial={{
                      opacity: 0,
                      scale: 0.85,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.65,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="
                      flex
                      max-h-[calc(100vh-150px)]
                      w-full
                      max-w-[1350px]
                      items-stretch
                      justify-center
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-[#17120d]
                      shadow-[0_35px_100px_rgba(0,0,0,0.7)]
                    "
                  >
                    {/* =================================================
                        LEFT BOOK PAGE
                    ================================================= */}

                    <motion.div
                      initial={{
                        rotateY: -85,
                        transformOrigin:
                          "right center",
                      }}
                      animate={{
                        rotateY: 0,
                      }}
                      transition={{
                        duration: 0.75,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      className="
                        relative
                        hidden
                        min-h-0
                        flex-1
                        overflow-hidden
                        border-r
                        border-[#c9bca5]/50
                        bg-[#f5f0e7]
                        lg:block
                      "
                    >
                      <div
                        className="
                          absolute
                          inset-y-0
                          right-0
                          w-8
                          bg-gradient-to-l
                          from-black/10
                          to-transparent
                        "
                      />

                      <div
                        className="
                          flex
                          h-full
                          min-h-[500px]
                          items-center
                          justify-center
                          overflow-auto
                          p-4
                          sm:p-6
                        "
                      >
                        {pdfMaterial &&
                        pdfBlobUrl ? (
                          <motion.div
                            key={`left-${pageNumber}`}
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              duration: 0.3,
                            }}
                            className="
                              max-h-full
                              max-w-full
                              shadow-[0_12px_35px_rgba(0,0,0,0.25)]
                            "
                          >
                            <Document
                              file={pdfBlobUrl}
                              onLoadSuccess={
                                handlePdfLoadSuccess
                              }
                              onLoadError={
                                handlePdfLoadError
                              }
                              loading={
                                <div className="flex min-h-[400px] items-center justify-center">
                                  <Loader2
                                    className="animate-spin text-cyan-500"
                                    size={30}
                                  />
                                </div>
                              }
                            >
                              <Page
                                pageNumber={
                                  pageNumber
                                }
                                scale={scale}
                                renderTextLayer
                                renderAnnotationLayer
                              />
                            </Document>
                          </motion.div>
                        ) : (
                          <div className="px-8 text-center">
                            <BookOpen
                              size={45}
                              className="mx-auto text-slate-400"
                            />

                            <p className="mt-4 text-sm font-semibold text-slate-700">
                              {loadingPdf
                                ? "Opening textbook..."
                                : "Book page"}
                            </p>

                            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                              {loadingPdf
                                ? "Loading the uploaded PDF."
                                : "This material does not contain a readable PDF document."}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* =================================================
                        CENTER BOOK BINDING
                    ================================================= */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-0
                        z-20
                        hidden
                        h-full
                        w-[10px]
                        -translate-x-1/2
                        bg-gradient-to-r
                        from-black/20
                        via-black/5
                        to-black/20
                        lg:block
                      "
                    />

                    {/* =================================================
                        RIGHT BOOK PAGE
                    ================================================= */}

                    <motion.div
                      initial={{
                        rotateY: 85,
                        transformOrigin:
                          "left center",
                      }}
                      animate={{
                        rotateY: 0,
                      }}
                      transition={{
                        duration: 0.75,
                        delay: 0.05,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      className="
                        relative
                        min-h-0
                        flex-1
                        overflow-hidden
                        bg-[#f8f4ec]
                      "
                    >
                      <div
                        className="
                          absolute
                          inset-y-0
                          left-0
                          z-10
                          w-8
                          bg-gradient-to-r
                          from-black/10
                          to-transparent
                        "
                      />

                      <div
                        className="
                          flex
                          h-full
                          min-h-[500px]
                          items-center
                          justify-center
                          overflow-auto
                          p-3
                          sm:p-6
                        "
                      >
                        {pdfMaterial &&
                        pdfBlobUrl ? (
                          <motion.div
                            key={`right-${pageNumber + 1}`}
                            initial={{
                              opacity: 0,
                              x: 15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              duration: 0.3,
                            }}
                            className="
                              max-h-full
                              max-w-full
                              shadow-[0_12px_35px_rgba(0,0,0,0.25)]
                            "
                          >
                            <Document
                              file={pdfBlobUrl}
                              onLoadSuccess={
                                handlePdfLoadSuccess
                              }
                              onLoadError={
                                handlePdfLoadError
                              }
                            >
                              {pageNumber + 1 <=
                                numPages && (
                                <Page
                                  pageNumber={
                                    pageNumber + 1
                                  }
                                  scale={scale}
                                  renderTextLayer
                                  renderAnnotationLayer
                                />
                              )}
                            </Document>
                          </motion.div>
                        ) : videoMaterial &&
                          fileUrl ? (
                          <video
                            src={fileUrl}
                            controls
                            className="
                              max-h-full
                              max-w-full
                              rounded-xl
                              bg-black
                            "
                            onError={() =>
                              setVideoError(true)
                            }
                          />
                        ) : (
                          <div className="px-8 text-center">
                            <FileText
                              size={48}
                              className="mx-auto text-slate-400"
                            />

                            <p className="mt-4 text-sm font-semibold text-slate-700">
                              Reader unavailable
                            </p>

                            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                              This material format cannot
                              be displayed directly inside
                              the book reader.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* =================================================
                        MOBILE SINGLE PAGE
                    ================================================= */}

                    <div
                      className="
                        absolute
                        inset-0
                        z-30
                        flex
                        items-center
                        justify-center
                        bg-[#f8f4ec]
                        lg:hidden
                      "
                    >
                      <div className="flex h-full w-full items-center justify-center overflow-auto p-3 sm:p-6">
                        {pdfMaterial &&
                        pdfBlobUrl ? (
                          <Document
                            file={pdfBlobUrl}
                            onLoadSuccess={
                              handlePdfLoadSuccess
                            }
                            onLoadError={
                              handlePdfLoadError
                            }
                            loading={
                              <Loader2
                                className="animate-spin text-cyan-500"
                                size={30}
                              />
                            }
                          >
                            <Page
                              pageNumber={
                                pageNumber
                              }
                              scale={scale}
                              renderTextLayer
                              renderAnnotationLayer
                            />
                          </Document>
                        ) : videoMaterial &&
                          fileUrl ? (
                          <video
                            src={fileUrl}
                            controls
                            className="max-h-full max-w-full bg-black"
                            onError={() =>
                              setVideoError(true)
                            }
                          />
                        ) : (
                          <div className="text-center text-slate-500">
                            <FileText
                              size={45}
                              className="mx-auto"
                            />

                            <p className="mt-3 text-sm font-semibold">
                              Reader unavailable
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* =================================================
              PDF ERROR
          ================================================= */}

          {pdfError && (
            <div
              className="
                absolute
                bottom-5
                left-1/2
                z-50
                w-[calc(100%-2rem)]
                max-w-lg
                -translate-x-1/2
                rounded-xl
                border
                border-red-400/20
                bg-red-950/90
                px-4
                py-3
                text-center
                text-xs
                text-red-200
                backdrop-blur-xl
              "
            >
              {pdfError}
            </div>
          )}

          {videoError && (
            <div
              className="
                absolute
                bottom-5
                left-1/2
                z-50
                -translate-x-1/2
                rounded-xl
                border
                border-red-400/20
                bg-red-950/90
                px-4
                py-3
                text-xs
                text-red-200
                backdrop-blur-xl
              "
            >
              Unable to play this video.
            </div>
          )}
        </div>

        {/* =================================================
            READER CONTROLS
        ================================================= */}

        {opened && (
          <div
            className="
              relative
              z-50
              flex
              min-h-[72px]
              shrink-0
              items-center
              justify-center
              gap-2
              border-t
              border-white/10
              bg-[#071426]/95
              px-3
              backdrop-blur-xl
              sm:gap-3
            "
          >
            {/* PREVIOUS */}

            <button
              type="button"
              onClick={goPrevious}
              disabled={
                !canGoPrevious ||
                !pdfMaterial
              }
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.04]
                px-3
                text-xs
                font-semibold
                text-slate-200
                transition
                hover:bg-white/[0.08]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <ChevronLeft size={17} />

              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            {/* PAGE COUNTER */}

            <div
              className="
                flex
                h-10
                min-w-[110px]
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-black/20
                px-3
                text-xs
                font-medium
                text-slate-300
              "
            >
              {pdfMaterial
                ? numPages > 0
                  ? `Pages ${pageNumber}–${Math.min(
                      pageNumber + 1,
                      numPages
                    )} of ${numPages}`
                  : loadingPdf
                    ? "Opening..."
                    : "No pages"
                : "Material reader"}
            </div>

            {/* NEXT */}

            <button
              type="button"
              onClick={goNext}
              disabled={
                !canGoNext ||
                !pdfMaterial
              }
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-cyan-400/20
                bg-cyan-400/10
                px-3
                text-xs
                font-semibold
                text-cyan-200
                transition
                hover:bg-cyan-400/15
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight size={17} />
            </button>

            {/* ZOOM */}

            {pdfMaterial && (
              <div
                className="
                  ml-1
                  hidden
                  items-center
                  gap-1
                  sm:flex
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setScale((value) =>
                      Math.max(
                        0.7,
                        Number(
                          (
                            value - 0.1
                          ).toFixed(1)
                        )
                      )
                    )
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    text-slate-400
                    transition
                    hover:bg-white/[0.08]
                    hover:text-white
                  "
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>

                <span className="w-12 text-center text-[11px] text-slate-500">
                  {Math.round(
                    scale * 100
                  )}
                  %
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setScale((value) =>
                      Math.min(
                        1.8,
                        Number(
                          (
                            value + 0.1
                          ).toFixed(1)
                        )
                      )
                    )
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    text-slate-400
                    transition
                    hover:bg-white/[0.08]
                    hover:text-white
                  "
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorMaterials() {
  const navigate = useNavigate();

  const [materials, setMaterials] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [readerMaterial, setReaderMaterial] =
    useState(null);

  const [imageFailed, setImageFailed] =
    useState({});

  /* =======================================================
     FETCH MATERIALS
  ======================================================= */

  const fetchMaterials = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/admin/lms/materials`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Unable to load materials."
          );
        }

        const fetchedMaterials =
          Array.isArray(
            result?.materials
          )
            ? result.materials
            : [];

        setMaterials(
          fetchedMaterials
        );
      } catch (err) {
        console.error(
          "Tutor materials fetch error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load tutor materials."
        );

        setMaterials([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredMaterials = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return materials;
    }

    return materials.filter(
      (material) => {
        const values = [
          material?.title,
          material?.description,
          material?.subject,
          material?.level,
          material?.material_type,
          material?.file_name,
        ];

        return values.some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(search)
        );
      }
    );
  }, [
    materials,
    searchTerm,
  ]);

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  const handleImageError = (
    materialId,
    side
  ) => {
    setImageFailed((previous) => ({
      ...previous,
      [`${materialId}-${side}`]:
        true,
    }));
  };

  /* =======================================================
     OPEN READER
  ======================================================= */

  const openReader = (material) => {
    setReaderMaterial(material);
  };

  /* =======================================================
     BOOK CARD
========================================================= */

  const renderMaterialCard = (
    material
  ) => {
    const frontCover =
      getFileUrl(
        material?.cover_page_url
      );

    const backCover =
      getFileUrl(
        material?.back_page_url
      );

    const frontFailed =
      imageFailed[
        `${material.id}-front`
      ];

    const backFailed =
      imageFailed[
        `${material.id}-back`
      ];

    return (
      <div
        key={material.id}
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.08]
          bg-[#071426]
          shadow-[0_18px_50px_rgba(0,0,0,0.25)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-cyan-400/20
          hover:shadow-[0_25px_70px_rgba(0,0,0,0.4)]
        "
      >
        {/* =================================================
            BOOK COVER AREA
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            openReader(material)
          }
          className="
            relative
            flex
            w-full
            items-center
            justify-center
            px-4
            pb-6
            pt-6
            text-left
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-cyan-400/60
          "
          aria-label={`Open ${
            material?.title ||
            "material"
          }`}
        >
          <div
            className="
              relative
              flex
              w-full
              items-center
              justify-center
              [perspective:1600px]
            "
          >
            <div
              className="
                relative
                aspect-[3/4]
                w-[255px]
                max-w-[82vw]
                overflow-hidden
                rounded-r-[8px]
                rounded-l-[3px]
                border
                border-black/30
                bg-[#111827]
                shadow-[14px_22px_42px_rgba(0,0,0,0.48)]
                transition-all
                duration-500
                group-hover:shadow-[20px_30px_58px_rgba(0,0,0,0.62)]
                sm:w-[275px]
                lg:w-[295px]
                xl:w-[305px]
              "
            >
              {/* BOOK EDGE */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-y-0
                  left-0
                  z-20
                  w-[7px]
                  bg-gradient-to-r
                  from-black/25
                  via-white/10
                  to-transparent
                "
              />

              {/* FRONT / BACK FLIP */}

              <div
                className="
                  relative
                  h-full
                  w-full
                  transition-transform
                  duration-700
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  [transform-style:preserve-3d]
                  group-hover:[transform:rotateY(180deg)]
                "
              >
                {/* FRONT COVER */}

                <div
                  className="
                    absolute
                    inset-0
                    overflow-hidden
                    rounded-r-[8px]
                    rounded-l-[3px]
                    bg-slate-900
                    [backface-visibility:hidden]
                  "
                >
                  {!frontFailed &&
                  frontCover ? (
                    <img
                      src={frontCover}
                      alt=""
                      className="
                        block
                        h-full
                        w-full
                        object-cover
                      "
                      onError={() =>
                        handleImageError(
                          material.id,
                          "front"
                        )
                      }
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-[#0B1220]
                      "
                    >
                      <BookOpen
                        size={45}
                        className="text-slate-500"
                      />
                    </div>
                  )}

                  {/* VERY LIGHT DEPTH */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-black/[0.08]
                      via-transparent
                      to-white/[0.02]
                    "
                  />

                  {/* HOVER HINT */}

                  {backCover &&
                    !backFailed && (
                      <div
                        className="
                          pointer-events-none
                          absolute
                          bottom-3
                          left-1/2
                          z-30
                          -translate-x-1/2
                          rounded-full
                          border
                          border-white/10
                          bg-black/60
                          px-3
                          py-1.5
                          text-[10px]
                          font-medium
                          text-white/85
                          opacity-0
                          backdrop-blur-md
                          transition-opacity
                          duration-300
                          group-hover:opacity-100
                        "
                      >
                        Hover for back cover
                      </div>
                    )}
                </div>

                {/* BACK COVER */}

                <div
                  className="
                    absolute
                    inset-0
                    overflow-hidden
                    rounded-r-[8px]
                    rounded-l-[3px]
                    bg-slate-900
                    [backface-visibility:hidden]
                    [transform:rotateY(180deg)]
                  "
                >
                  {!backFailed &&
                  backCover ? (
                    <img
                      src={backCover}
                      alt=""
                      className="
                        block
                        h-full
                        w-full
                        object-cover
                      "
                      onError={() =>
                        handleImageError(
                          material.id,
                          "back"
                        )
                      }
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-[#0B1220]
                      "
                    >
                      <BookOpen
                        size={45}
                        className="text-slate-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* =================================================
            CARD INFORMATION
        ================================================= */}

        <div
          className="
            border-t
            border-white/[0.06]
            px-5
            py-4
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3
                className="
                  truncate
                  text-base
                  font-semibold
                  text-white
                "
              >
                {material?.title ||
                  "Learning Material"}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                {material?.subject && (
                  <span>
                    {material.subject}
                  </span>
                )}

                {material?.subject &&
                  material?.level && (
                    <span className="text-slate-600">
                      •
                    </span>
                  )}

                {material?.level && (
                  <span>
                    {material.level}
                  </span>
                )}
              </div>
            </div>

            <div
              className="
                shrink-0
                rounded-full
                border
                border-cyan-400/10
                bg-cyan-400/[0.06]
                px-2.5
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-cyan-300
              "
            >
              {formatMaterialType(
                material?.material_type
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-[#020617]
          px-4
          py-6
          text-white
          sm:px-6
          lg:px-8
        "
      >
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5" />

            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded bg-white/5" />

              <div className="h-3 w-64 animate-pulse rounded bg-white/5" />
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
            "
          >
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-[#071426]
                "
              >
                <div className="flex h-[430px] items-center justify-center">
                  <div
                    className="
                      aspect-[3/4]
                      w-[255px]
                      animate-pulse
                      rounded-r-md
                      rounded-l-sm
                      bg-white/[0.03]
                    "
                  />
                </div>

                <div className="space-y-2 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />

                  <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-[#020617]
        px-4
        py-6
        text-white
        sm:px-6
        lg:px-8
      "
    >
      <div className="mx-auto max-w-[1800px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="
                  mt-1
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  text-slate-400
                  transition
                  hover:border-white/20
                  hover:bg-white/[0.06]
                  hover:text-white
                "
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <BookOpen
                    size={22}
                    className="text-cyan-400"
                  />

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Materials
                  </h1>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  View the learning materials assigned
                  to your teaching environment.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchMaterials(true)
              }
              disabled={refreshing}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-200
                transition
                hover:border-white/20
                hover:bg-white/[0.06]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-400/15
              bg-red-400/[0.06]
              p-4
              text-sm
              text-red-200
            "
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="flex-1">
              <p className="font-medium">
                Unable to load materials
              </p>

              <p className="mt-1 text-red-200/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchMaterials()
              }
              className="
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-semibold
                text-red-200
                transition
                hover:bg-red-400/10
              "
            >
              Try again
            </button>
          </div>
        )}

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-7">
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-500
              "
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search materials..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#071426]
                pl-11
                pr-4
                text-sm
                text-white
                outline-none
                placeholder:text-slate-500
                transition
                focus:border-cyan-400/30
                focus:ring-2
                focus:ring-cyan-400/10
              "
            />
          </div>
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {filteredMaterials.length ===
        0 ? (
          <div
            className="
              flex
              min-h-[420px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-white/10
              bg-[#071426]/50
              px-6
              text-center
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
                border
                border-white/10
                bg-white/[0.03]
              "
            >
              <FileText
                size={28}
                className="text-slate-500"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {searchTerm
                ? "No matching materials"
                : "No materials available"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {searchTerm
                ? "Try a different search term."
                : "Materials created by the Academy administration will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                GRID
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                2xl:grid-cols-5
              "
            >
              {filteredMaterials.map(
                renderMaterialCard
              )}
            </div>

            {/* COUNT */}

            <div className="mt-7 border-t border-white/[0.06] pt-4">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-300">
                  {
                    filteredMaterials.length
                  }
                </span>{" "}
                {filteredMaterials.length ===
                1
                  ? "material"
                  : "materials"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          BOOK READER
      ===================================================== */}

      {readerMaterial && (
        <BookReader
          material={readerMaterial}
          onClose={() =>
            setReaderMaterial(null)
          }
        />
      )}
    </div>
  );
}
