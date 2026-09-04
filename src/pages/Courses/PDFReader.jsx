// src/pages/courses/PDFReader.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  RotateCw,
  Search,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  RefreshCw,
  Home,
  Menu,
  X,
  Sparkles,
  PanelRight,
  PanelRightClose,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  useCourses,
} from "../../context/LMSContext/CourseContext";

/* ============================================================
   API
============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(
    /\/$/,
    ""
  ) || "http://localhost:5000";

/* ============================================================
   PDF.JS WORKER
============================================================ */

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

/* ============================================================
   HELPERS
============================================================ */

const clamp = (
  value,
  min,
  max
) =>
  Math.min(
    Math.max(value, min),
    max
  );

const getFileName = (
  url,
  fallback = "document.pdf"
) => {
  try {
    const pathname =
      new URL(url).pathname;

    const name =
      decodeURIComponent(
        pathname.split("/").pop() || ""
      );

    return name || fallback;
  } catch {
    return fallback;
  }
};

/* ============================================================
   READ RESPONSE ERROR
============================================================ */

const getResponseError = async (
  response
) => {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let message = "";

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const data =
        await response.json();

      message =
        data?.error ||
        data?.message ||
        "";
    } else {
      message =
        await response.text();
    }
  } catch {
    message = "";
  }

  message =
    String(message || "").trim();

  if (!message) {
    message =
      `Server returned HTTP ${response.status}.`;
  }

  return message;
};

/* ============================================================
   MAIN
============================================================ */

export default function PDFReader() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const {
    documents = [],
    loading: documentsLoading,
  } = useCourses();

  /* ==========================================================
     DOCUMENT
  ========================================================== */

  const documentData =
    useMemo(() => {
      return documents.find(
        (doc) =>
          String(doc.id) ===
          String(id)
      );
    }, [
      documents,
      id,
    ]);

  const originalFileUrl =
    documentData?.file_url || null;

  /*
   * IMPORTANT:
   * We no longer give this URL directly to react-pdf.
   * We fetch it ourselves first.
   */
  const fileApiUrl =
    documentData?.id
      ? `${API_BASE_URL}/api/documents/${encodeURIComponent(
          String(documentData.id)
        )}/file`
      : null;

  /* ==========================================================
     REFS
  ========================================================== */

  const readerRef =
    useRef(null);

  const pageRefs =
    useRef({});

  const observerRef =
    useRef(null);

  const pdfBlobUrlRef =
    useRef(null);

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    pdfSource,
    setPdfSource,
  ] = useState(null);

  const [
    numPages,
    setNumPages,
  ] = useState(null);

  const [
    pageNumber,
    setPageNumber,
  ] = useState(1);

  const [
    scale,
    setScale,
  ] = useState(1);

  const [
    rotation,
    setRotation,
  ] = useState(0);

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    pdfError,
    setPdfError,
  ] = useState(null);

  const [
    loadingPdf,
    setLoadingPdf,
  ] = useState(true);

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  const [
    pageWidth,
    setPageWidth,
  ] = useState(900);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    showPagePanel,
    setShowPagePanel,
  ] = useState(false);

  const [
    isProgrammaticScroll,
    setIsProgrammaticScroll,
  ] = useState(false);

  /* ==========================================================
     LOAD PDF FROM API
  ========================================================== */

  const loadPdf = useCallback(
    async () => {
      if (!fileApiUrl) {
        setLoadingPdf(false);
        setPdfError(
          new Error(
            "This document does not have a valid file."
          )
        );
        return;
      }

      setLoadingPdf(true);
      setPdfError(null);
      setPdfSource(null);
      setNumPages(null);
      setPageNumber(1);

      /*
       * Clean up previous Blob URL.
       */
      if (
        pdfBlobUrlRef.current
      ) {
        URL.revokeObjectURL(
          pdfBlobUrlRef.current
        );

        pdfBlobUrlRef.current =
          null;
      }

      try {
        console.log(
          "📄 Loading PDF:",
          fileApiUrl
        );

        const response =
          await fetch(
            fileApiUrl,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/pdf",
              },
              cache: "no-store",
            }
          );

        console.log(
          "📡 PDF API status:",
          response.status
        );

        console.log(
          "📡 PDF content-type:",
          response.headers.get(
            "content-type"
          )
        );

        /*
         * Server error.
         */
        if (!response.ok) {
          const message =
            await getResponseError(
              response
            );

          throw new Error(
            `PDF server error (${response.status}): ${message}`
          );
        }

        const contentType =
          (
            response.headers.get(
              "content-type"
            ) || ""
          ).toLowerCase();

        /*
         * Read the actual bytes.
         */
        const arrayBuffer =
          await response.arrayBuffer();

        console.log(
          "📦 PDF response size:",
          arrayBuffer.byteLength,
          "bytes"
        );

        /*
         * Empty response.
         */
        if (
          arrayBuffer.byteLength ===
          0
        ) {
          throw new Error(
            "The server returned an empty PDF response."
          );
        }

        /*
         * Verify PDF magic bytes.
         *
         * Every valid PDF starts with:
         *
         * %PDF-
         */
        const bytes =
          new Uint8Array(
            arrayBuffer.slice(
              0,
              5
            )
          );

        const signature =
          String.fromCharCode(
            ...bytes
          );

        console.log(
          "🔎 PDF signature:",
          signature
        );

        if (
          signature !==
          "%PDF-"
        ) {
          /*
           * Try to expose the response if it
           * was actually JSON/text.
           */
          let preview = "";

          try {
            const text =
              new TextDecoder()
                .decode(
                  new Uint8Array(
                    arrayBuffer.slice(
                      0,
                      500
                    )
                  )
                );

            preview =
              text
                .replace(
                  /\s+/g,
                  " "
                )
                .trim();
          } catch {
            preview = "";
          }

          throw new Error(
            `The server did not return a valid PDF. Response signature: "${signature}".${preview ? ` Response: ${preview}` : ""}`
          );
        }

        /*
         * Create a Blob.
         */
        const blob =
          new Blob(
            [arrayBuffer],
            {
              type:
                "application/pdf",
            }
          );

        /*
         * Create local Blob URL.
         */
        const blobUrl =
          URL.createObjectURL(
            blob
          );

        pdfBlobUrlRef.current =
          blobUrl;

        /*
         * Give Blob URL to react-pdf.
         */
        setPdfSource(
          blobUrl
        );

        console.log(
          "✅ PDF successfully fetched."
        );

        console.log(
          "✅ Blob URL created."
        );
      } catch (error) {
        console.error(
          "❌ PDF FETCH ERROR:",
          error
        );

        setPdfSource(null);
        setLoadingPdf(false);
        setPdfError(error);
      }
    },
    [fileApiUrl]
  );

  /* ==========================================================
     LOAD PDF WHEN DOCUMENT CHANGES
  ========================================================== */

  useEffect(() => {
    if (
      documentsLoading
    ) {
      return;
    }

    if (
      !documentData
    ) {
      return;
    }

    loadPdf();

    return () => {
      if (
        pdfBlobUrlRef.current
      ) {
        URL.revokeObjectURL(
          pdfBlobUrlRef.current
        );

        pdfBlobUrlRef.current =
          null;
      }
    };
  }, [
    documentsLoading,
    documentData,
    loadPdf,
    reloadKey,
  ]);

  /* ==========================================================
     RESPONSIVE WIDTH
  ========================================================== */

  useEffect(() => {
    const updateWidth =
      () => {
        const width =
          window.innerWidth;

        if (
          width < 640
        ) {
          setPageWidth(
            Math.max(
              width - 28,
              260
            )
          );
        } else if (
          width < 1024
        ) {
          setPageWidth(
            Math.min(
              width - 70,
              850
            )
          );
        } else {
          setPageWidth(
            Math.min(
              width - 170,
              1100
            )
          );
        }
      };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateWidth
      );
    };
  }, []);

  /* ==========================================================
     RESET
  ========================================================== */

  useEffect(() => {
    setPageNumber(1);
    setNumPages(null);
    setScale(1);
    setRotation(0);
    setPdfError(null);
    setLoadingPdf(true);
    setSidebarOpen(false);

    pageRefs.current = {};
  }, [
    id,
    fileApiUrl,
  ]);

  /* ==========================================================
     PDF LOAD SUCCESS
  ========================================================== */

  const handleLoadSuccess =
    useCallback(
      ({
        numPages:
          totalPages,
      }) => {
        console.log(
          "✅ PDF LOAD SUCCESS:",
          totalPages,
          "pages"
        );

        setNumPages(
          totalPages
        );

        setPageNumber(1);

        setLoadingPdf(false);

        setPdfError(null);
      },
      []
    );

  /* ==========================================================
     PDF LOAD ERROR
  ========================================================== */

  const handleLoadError =
    useCallback(
      (error) => {
        console.error(
          "❌ REACT-PDF LOAD ERROR:",
          error
        );

        setLoadingPdf(false);

        setPdfError(
          error instanceof Error
            ? error
            : new Error(
                String(error)
              )
        );
      },
      []
    );

  /* ==========================================================
     PAGE SCROLL
  ========================================================== */

  const scrollToPage =
    useCallback(
      (page) => {
        if (!numPages) {
          return;
        }

        const targetPage =
          clamp(
            page,
            1,
            numPages
          );

        const element =
          pageRefs.current[
            targetPage
          ];

        if (!element) {
          return;
        }

        setPageNumber(
          targetPage
        );

        setIsProgrammaticScroll(
          true
        );

        element.scrollIntoView(
          {
            behavior:
              "smooth",
            block: "start",
          }
        );

        window.setTimeout(
          () => {
            setIsProgrammaticScroll(
              false
            );
          },
          700
        );
      },
      [numPages]
    );

  /* ==========================================================
     PAGE OBSERVER
  ========================================================== */

  useEffect(() => {
    if (!numPages) {
      return;
    }

    if (
      observerRef.current
    ) {
      observerRef.current.disconnect();
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            isProgrammaticScroll
          ) {
            return;
          }

          const visibleEntries =
            entries
              .filter(
                (
                  entry
                ) =>
                  entry.isIntersecting
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (
            visibleEntries.length
          ) {
            const page =
              Number(
                visibleEntries[0]
                  .target
                  .dataset
                  .page
              );

            if (
              page &&
              page !==
                pageNumber
            ) {
              setPageNumber(
                page
              );
            }
          }
        },
        {
          root: null,
          rootMargin:
            "-15% 0px -55% 0px",
          threshold: [
            0.05,
            0.15,
            0.3,
            0.5,
            0.75,
          ],
        }
      );

    Object.entries(
      pageRefs.current
    ).forEach(
      ([, element]) => {
        if (element) {
          observer.observe(
            element
          );
        }
      }
    );

    observerRef.current =
      observer;

    return () => {
      observer.disconnect();
    };
  }, [
    numPages,
    pageNumber,
    isProgrammaticScroll,
    scale,
    rotation,
  ]);

  /* ==========================================================
     KEYBOARD CONTROLS
  ========================================================== */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        const target =
          event.target;

        const isTyping =
          target instanceof
            HTMLInputElement ||
          target instanceof
            HTMLTextAreaElement ||
          target instanceof
            HTMLSelectElement;

        if (
          isTyping
        ) {
          return;
        }

        if (
          event.key ===
            "ArrowRight" ||
          event.key ===
            "PageDown"
        ) {
          event.preventDefault();

          scrollToPage(
            pageNumber + 1
          );
        }

        if (
          event.key ===
            "ArrowLeft" ||
          event.key ===
            "PageUp"
        ) {
          event.preventDefault();

          scrollToPage(
            pageNumber - 1
          );
        }

        if (
          event.key ===
            "+" ||
          event.key ===
            "="
        ) {
          event.preventDefault();

          setScale(
            (current) =>
              clamp(
                Number(
                  (
                    current +
                    0.1
                  ).toFixed(
                    2
                  )
                ),
                0.5,
                2.5
              )
          );
        }

        if (
          event.key ===
          "-"
        ) {
          event.preventDefault();

          setScale(
            (current) =>
              clamp(
                Number(
                  (
                    current -
                    0.1
                  ).toFixed(
                    2
                  )
                ),
                0.5,
                2.5
              )
          );
        }

        if (
          event.key ===
          "Escape"
        ) {
          setIsFullscreen(
            false
          );

          setSidebarOpen(
            false
          );
        }

        if (
          event.key ===
          "Home"
        ) {
          event.preventDefault();

          scrollToPage(1);
        }

        if (
          event.key ===
          "End"
        ) {
          event.preventDefault();

          scrollToPage(
            numPages || 1
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
    pageNumber,
    numPages,
    scrollToPage,
  ]);

  /* ==========================================================
     RETRY
  ========================================================== */

  const retryPdf =
    () => {
      setPdfError(null);
      setPdfSource(null);
      setLoadingPdf(true);
      setNumPages(null);
      setPageNumber(1);

      pageRefs.current = {};

      setReloadKey(
        (current) =>
          current + 1
      );
    };

  /* ==========================================================
     DOWNLOAD
  ========================================================== */

  const handleDownload =
    async () => {
      if (!fileApiUrl) {
        return;
      }

      try {
        /*
         * Download through the same API.
         */
        const response =
          await fetch(
            fileApiUrl,
            {
              headers: {
                Accept:
                  "application/pdf",
              },
            }
          );

        if (!response.ok) {
          const message =
            await getResponseError(
              response
            );

          throw new Error(
            message
          );
        }

        const blob =
          await response.blob();

        const downloadUrl =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          downloadUrl;

        link.download =
          documentData?.title
            ? `${documentData.title}.pdf`
            : getFileName(
                originalFileUrl,
                "document.pdf"
              );

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(
          downloadUrl
        );
      } catch (error) {
        console.error(
          "DOWNLOAD ERROR:",
          error
        );

        setPdfError(
          error instanceof Error
            ? error
            : new Error(
                "Unable to download PDF."
              )
        );
      }
    };

  /* ==========================================================
     ZOOM
  ========================================================== */

  const zoomIn =
    () => {
      setScale(
        (current) =>
          clamp(
            Number(
              (
                current +
                0.1
              ).toFixed(2)
            ),
            0.5,
            2.5
          )
      );
    };

  const zoomOut =
    () => {
      setScale(
        (current) =>
          clamp(
            Number(
              (
                current -
                0.1
              ).toFixed(2)
            ),
            0.5,
            2.5
          )
      );
    };

  /* ==========================================================
     FULLSCREEN
  ========================================================== */

  const toggleFullscreen =
    () => {
      setIsFullscreen(
        (current) =>
          !current
      );
    };

  /* ==========================================================
     PAGE INPUT
  ========================================================== */

  const handlePageInput =
    (event) => {
      const value =
        Number(
          event.target.value
        );

      if (
        !Number.isNaN(
          value
        ) &&
        numPages
      ) {
        scrollToPage(
          value
        );
      }
    };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearch =
    (event) => {
      setSearchTerm(
        event.target.value
      );
    };

  /* ==========================================================
     LOADING DOCUMENT LIST
  ========================================================== */

  if (
    documentsLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02040a] text-white">
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-cyan-400"
          />

          <p className="mt-4 text-sm font-semibold text-slate-400">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     NOT FOUND
  ========================================================== */

  if (!documentData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02040a] px-6 text-white">
        <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10">
            <FileText
              size={42}
              className="text-cyan-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Document Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            The document you're
            trying to open could
            not be found.
          </p>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            <ArrowLeft
              size={17}
            />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     NO FILE
  ========================================================== */

  if (!fileApiUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02040a] px-6 text-white">
        <div className="w-full max-w-md rounded-[32px] border border-red-500/20 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10">
            <AlertCircle
              size={42}
              className="text-red-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            PDF Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            This document does
            not have a valid file
            associated with it.
          </p>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            <ArrowLeft
              size={17}
            />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (pdfError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02040a] px-6 text-white">
        <div className="w-full max-w-lg rounded-[32px] border border-red-500/20 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10">
            <AlertCircle
              size={40}
              className="text-red-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            PDF Could Not Load
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            The document could not
            be loaded from the
            document server.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-black/30 p-4 text-left">
            <p className="break-words text-xs leading-5 text-red-300">
              {pdfError?.message ||
                "Unknown PDF error"}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Document API
            </p>

            <p className="mt-2 break-all text-[11px] leading-5 text-slate-500">
              {fileApiUrl}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              onClick={
                retryPdf
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <RefreshCw
                size={17}
              />
              Retry
            </button>

            <button
              onClick={() =>
                window.open(
                  fileApiUrl,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              Open File
            </button>

            <button
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              <ArrowLeft
                size={17}
              />
              Back
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN READER
  ========================================================== */

  return (
    <div
      className={`min-h-screen overflow-x-hidden bg-[#02040a] text-white ${
        isFullscreen
          ? "fixed inset-0 z-[9999]"
          : ""
      }`}
    >

      {/* ======================================================
          PREMIUM BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#111c35_0%,#050912_38%,#02040a_75%)]" />

        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute -right-40 top-[20%] h-[620px] w-[620px] rounded-full bg-blue-600/10 blur-[170px]" />

        <div className="absolute bottom-[-250px] left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[150px]" />

      </div>

      {/* ======================================================
          TOP HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050914]/85 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

        <div className="mx-auto flex min-h-[68px] max-w-[1700px] items-center gap-2 px-3 sm:gap-3 sm:px-6">

          <button
            onClick={() =>
              navigate(-1)
            }
            title="Go back"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            <ArrowLeft
              size={18}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </button>

          <button
            onClick={() =>
              navigate("/")
            }
            title="Home"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 sm:flex"
          >
            <Home
              size={18}
            />
          </button>

          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 sm:flex">
            <FileText
              size={18}
              className="text-cyan-300"
            />
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-2">

              <h1 className="truncate text-sm font-black tracking-tight text-white sm:text-base">
                {documentData.title ||
                  "PDF Reader"}
              </h1>

              <span className="hidden items-center gap-1 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-300 md:inline-flex">
                <Sparkles
                  size={10}
                />
                Reader
              </span>

            </div>

            <p className="hidden truncate text-[11px] text-slate-500 sm:block">
              {documentData.file_type?.toUpperCase() ||
                "PDF"}

              {" • "}

              {numPages
                ? `${numPages} pages`
                : "Loading..."}
            </p>

          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 transition focus-within:border-cyan-400/30 focus-within:bg-cyan-400/[0.04] lg:flex">

            <Search
              size={16}
              className="text-slate-500"
            />

            <input
              value={
                searchTerm
              }
              onChange={
                handleSearch
              }
              placeholder="Search document..."
              className="w-36 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-slate-600 xl:w-48"
            />

          </div>

          <button
            onClick={() =>
              setSidebarOpen(
                (current) =>
                  !current
              )
            }
            title="Reader menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 lg:hidden"
          >
            {sidebarOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>

          <button
            onClick={
              handleDownload
            }
            title="Download"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            <Download
              size={17}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>

          <button
            onClick={
              toggleFullscreen
            }
            title={
              isFullscreen
                ? "Exit fullscreen"
                : "Fullscreen"
            }
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 sm:flex"
          >
            {isFullscreen ? (
              <Minimize2
                size={17}
              />
            ) : (
              <Maximize2
                size={17}
              />
            )}
          </button>

        </div>
      </header>

      {/* ======================================================
          PREMIUM TOOLBAR
      ====================================================== */}

      <div className="sticky top-[68px] z-40 border-b border-white/[0.05] bg-[#050914]/80 shadow-[0_10px_35px_rgba(0,0,0,0.25)] backdrop-blur-2xl">

        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-3 px-3 py-2.5 sm:px-6">

          <div className="flex min-w-0 items-center gap-1.5">

            <button
              onClick={() =>
                scrollToPage(
                  pageNumber - 1
                )
              }
              disabled={
                pageNumber <= 1
              }
              title="Previous page"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft
                size={17}
              />
            </button>

            <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-2.5 py-1.5">

              <input
                type="number"
                min={1}
                max={
                  numPages ||
                  1
                }
                value={
                  pageNumber
                }
                onChange={
                  handlePageInput
                }
                className="w-9 bg-transparent text-center text-xs font-black text-white outline-none"
              />

              <span className="text-slate-700">
                /
              </span>

              <span className="min-w-[25px] text-xs font-bold text-slate-500">
                {numPages ||
                  "—"}
              </span>

            </div>

            <button
              onClick={() =>
                scrollToPage(
                  pageNumber + 1
                )
              }
              disabled={
                !numPages ||
                pageNumber >=
                  numPages
              }
              title="Next page"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronRight
                size={17}
              />
            </button>

          </div>

          <div className="hidden items-center gap-1.5 sm:flex">

            <button
              onClick={
                zoomOut
              }
              disabled={
                scale <= 0.5
              }
              title="Zoom out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-25"
            >
              <ZoomOut
                size={16}
              />
            </button>

            <div className="min-w-[58px] rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-center text-[11px] font-black text-slate-400">
              {Math.round(
                scale * 100
              )}
              %
            </div>

            <button
              onClick={
                zoomIn
              }
              disabled={
                scale >= 2.5
              }
              title="Zoom in"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-25"
            >
              <ZoomIn
                size={16}
              />
            </button>

            <div className="mx-1 h-6 w-px bg-white/[0.07]" />

            <button
              onClick={() =>
                setRotation(
                  (current) =>
                    (current +
                      90) %
                    360
                )
              }
              title="Rotate"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <RotateCw
                size={16}
              />
            </button>

          </div>

          <div className="flex items-center gap-1.5">

            <button
              onClick={() =>
                setShowPagePanel(
                  (current) =>
                    !current
                )
              }
              title="Page overview"
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 md:flex"
            >
              {showPagePanel ? (
                <PanelRightClose
                  size={16}
                />
              ) : (
                <PanelRight
                  size={16}
                />
              )}
            </button>

            <div className="flex items-center gap-1 sm:hidden">

              <button
                onClick={
                  zoomOut
                }
                disabled={
                  scale <= 0.5
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 disabled:opacity-25"
              >
                <ZoomOut
                  size={15}
                />
              </button>

              <span className="w-10 text-center text-[10px] font-black text-slate-500">
                {Math.round(
                  scale * 100
                )}
                %
              </span>

              <button
                onClick={
                  zoomIn
                }
                disabled={
                  scale >= 2.5
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-300 disabled:opacity-25"
              >
                <ZoomIn
                  size={15}
                />
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* ======================================================
          MOBILE SEARCH
      ====================================================== */}

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="sticky top-[116px] z-30 border-b border-white/[0.05] bg-[#050914]/95 px-4 py-3 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3">

              <Search
                size={16}
                className="text-slate-500"
              />

              <input
                value={
                  searchTerm
                }
                onChange={
                  handleSearch
                }
                placeholder="Search document..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-slate-600"
              />

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          READER
      ====================================================== */}

      <main
        ref={readerRef}
        className="relative min-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden px-2 py-6 sm:px-5 sm:py-8 lg:px-8"
      >

        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[70%] -translate-x-1/2 rounded-full bg-cyan-500/[0.035] blur-[100px]" />

        <div className="relative mx-auto flex w-full max-w-[1500px] justify-center">

          <div className="w-full min-w-0">

            {pdfSource && (
              <Document
                key={`${reloadKey}-${pdfSource}`}
                file={pdfSource}
                onLoadSuccess={
                  handleLoadSuccess
                }
                onLoadError={
                  handleLoadError
                }
                loading={null}
                error={null}
                className="flex w-full flex-col items-center"
              >

                {numPages &&
                  Array.from(
                    {
                      length:
                        numPages,
                    },
                    (
                      _,
                      index
                    ) => {
                      const page =
                        index + 1;

                      return (
                        <motion.div
                          key={
                            page
                          }
                          ref={(
                            element
                          ) => {
                            if (
                              element
                            ) {
                              pageRefs.current[
                                page
                              ] =
                                element;
                            }
                          }}
                          data-page={
                            page
                          }
                          initial={{
                            opacity: 0,
                            y: 12,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration:
                              0.25,
                            delay:
                              Math.min(
                                index *
                                  0.015,
                                0.25
                              ),
                          }}
                          className="relative mb-7 w-fit max-w-full sm:mb-9"
                        >

                          <div className="absolute -left-1 -top-6 flex items-center gap-2 sm:-left-10 sm:top-2 sm:flex-col">

                            <span className="rounded-full border border-white/[0.07] bg-[#080d18]/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-xl backdrop-blur-xl sm:rotate-[-90deg]">
                              Page{" "}
                              {page}
                            </span>

                          </div>

                          <div className="relative overflow-hidden rounded-sm border border-white/[0.06] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.5)]">

                            <Page
                              pageNumber={
                                page
                              }
                              width={
                                pageWidth *
                                scale
                              }
                              rotate={
                                rotation
                              }
                              renderTextLayer={
                                true
                              }
                              renderAnnotationLayer={
                                true
                              }
                              loading={
                                <div
                                  className="flex items-center justify-center bg-white"
                                  style={{
                                    width:
                                      pageWidth *
                                      scale,
                                    minHeight:
                                      500,
                                  }}
                                >
                                  <Loader2
                                    size={
                                      28
                                    }
                                    className="animate-spin text-slate-400"
                                  />
                                </div>
                              }
                              className="block max-w-full"
                            />

                          </div>

                        </motion.div>
                      );
                    }
                  )}

              </Document>
            )}

            {/* ==================================================
                LOADING OVERLAY
            ================================================== */}

            {loadingPdf && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-[#02040a]/45 backdrop-blur-[2px]"
              >

                <div className="rounded-3xl border border-white/[0.08] bg-[#080d18]/95 px-7 py-6 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <Loader2
                        size={23}
                        className="animate-spin text-cyan-300"
                      />
                    </div>

                    <div>

                      <p className="text-sm font-black text-white">
                        Opening document
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Preparing your reading experience...
                      </p>

                    </div>

                  </div>

                </div>

              </motion.div>
            )}

          </div>

          {/* ==================================================
              PAGE OVERVIEW
          ================================================== */}

          <AnimatePresence>
            {showPagePanel &&
              numPages && (
                <motion.aside
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 20,
                  }}
                  className="sticky right-0 top-[145px] ml-5 hidden h-fit w-52 shrink-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#070c17]/90 p-3 shadow-2xl backdrop-blur-2xl lg:block"
                >

                  <div className="mb-3 flex items-center justify-between px-1">

                    <div>

                      <p className="text-xs font-black text-white">
                        Pages
                      </p>

                      <p className="text-[10px] text-slate-600">
                        {numPages} total
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        setShowPagePanel(
                          false
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.05] hover:text-white"
                    >
                      <X
                        size={14}
                      />
                    </button>

                  </div>

                  <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">

                    {Array.from(
                      {
                        length:
                          numPages,
                      },
                      (
                        _,
                        index
                      ) => {
                        const page =
                          index +
                          1;

                        const active =
                          page ===
                          pageNumber;

                        return (
                          <button
                            key={
                              page
                            }
                            onClick={() =>
                              scrollToPage(
                                page
                              )
                            }
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
                              active
                                ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                            }`}
                          >

                            <span>
                              Page{" "}
                              {page}
                            </span>

                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                            )}

                          </button>
                        );
                      }
                    )}

                  </div>

                </motion.aside>
              )}
          </AnimatePresence>

        </div>
      </main>

      {/* ======================================================
          FLOATING CURRENT PAGE
      ====================================================== */}

      {numPages && (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 -translate-x-1/2">

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#070c17]/90 px-4 py-2 shadow-[0_15px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >

            <div className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />

            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Page
            </span>

            <span className="text-xs font-black text-white">
              {pageNumber}
            </span>

            <span className="text-xs text-slate-700">
              /
            </span>

            <span className="text-xs font-bold text-slate-500">
              {numPages}
            </span>

          </motion.div>

        </div>
      )}

    </div>
  );
}