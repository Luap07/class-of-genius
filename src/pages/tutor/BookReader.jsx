import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

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
   HELPERS
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const getFileUrl = (fileUrl) => {
  if (!fileUrl) return "";

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  if (fileUrl.startsWith("/")) {
    return `${API_BASE_URL}${fileUrl}`;
  }

  return `${API_BASE_URL}/${fileUrl}`;
};

const getExtension = (fileName = "") => {
  const cleanName = fileName
    .split("?")[0]
    .split("#")[0];

  const parts = cleanName.split(".");

  if (parts.length < 2) return "";

  return parts.pop().toLowerCase();
};

const isPdf = (material) => {
  const type = String(
    material?.material_type || ""
  ).toLowerCase();

  const fileName = String(
    material?.file_name || ""
  ).toLowerCase();

  const mime = String(
    material?.file_mime_type || ""
  ).toLowerCase();

  return (
    type === "pdf" ||
    fileName.endsWith(".pdf") ||
    mime === "application/pdf"
  );
};

const isVideo = (material) => {
  const type = String(
    material?.material_type || ""
  ).toLowerCase();

  const fileName = String(
    material?.file_name || ""
  ).toLowerCase();

  const mime = String(
    material?.file_mime_type || ""
  ).toLowerCase();

  return (
    type === "video" ||
    ["mp4", "webm", "mov"].some((ext) =>
      fileName.endsWith(`.${ext}`)
    ) ||
    mime.startsWith("video/")
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function BookReader({
  material,
  onClose,
}) {
  const [bookOpened, setBookOpened] =
    useState(false);

  const [numPages, setNumPages] =
    useState(null);

  const [pageNumber, setPageNumber] =
    useState(1);

  const [zoom, setZoom] =
    useState(1);

  const [fullscreen, setFullscreen] =
    useState(false);

  const [loadingDocument, setLoadingDocument] =
    useState(true);

  const [documentError, setDocumentError] =
    useState("");

  const fileUrl = useMemo(
    () => getFileUrl(material?.file_url),
    [material]
  );

  const pdfMaterial = isPdf(material);
  const videoMaterial = isVideo(material);

  /* =======================================================
     OPEN BOOK
  ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBookOpened(true);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     RESET WHEN MATERIAL CHANGES
  ======================================================= */

  useEffect(() => {
    setPageNumber(1);
    setNumPages(null);
    setZoom(1);
    setDocumentError("");
    setLoadingDocument(true);
    setBookOpened(false);

    const timer = window.setTimeout(() => {
      setBookOpened(true);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [material]);

  /* =======================================================
     KEYBOARD CONTROLS
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (fullscreen) {
          setFullscreen(false);
          return;
        }

        onClose?.();
        return;
      }

      if (
        event.key === "ArrowRight" &&
        pdfMaterial
      ) {
        setPageNumber((current) =>
          Math.min(
            current + 1,
            numPages || current
          )
        );
      }

      if (
        event.key === "ArrowLeft" &&
        pdfMaterial
      ) {
        setPageNumber((current) =>
          Math.max(current - 1, 1)
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
    fullscreen,
    numPages,
    pdfMaterial,
    onClose,
  ]);

  /* =======================================================
     PDF LOADED
  ======================================================= */

  const handleDocumentLoadSuccess = ({
    numPages: totalPages,
  }) => {
    setNumPages(totalPages);
    setPageNumber(1);
    setLoadingDocument(false);
    setDocumentError("");
  };

  const handleDocumentLoadError = (error) => {
    console.error(
      "PDF loading error:",
      error
    );

    setLoadingDocument(false);

    setDocumentError(
      "Unable to open this PDF. Please try again."
    );
  };

  /* =======================================================
     PAGE CONTROLS
  ======================================================= */

  const previousPage = () => {
    setPageNumber((current) =>
      Math.max(current - 1, 1)
    );
  };

  const nextPage = () => {
    setPageNumber((current) =>
      Math.min(
        current + 1,
        numPages || current
      )
    );
  };

  const zoomIn = () => {
    setZoom((current) =>
      Math.min(
        Number((current + 0.15).toFixed(2)),
        1.8
      )
    );
  };

  const zoomOut = () => {
    setZoom((current) =>
      Math.max(
        Number((current - 0.15).toFixed(2)),
        0.65
      )
    );
  };

  /* =======================================================
     BOOK CONTENT
  ======================================================= */

  const renderContent = () => {
    if (pdfMaterial) {
      return (
        <div className="flex h-full min-h-0 flex-col">
          {/* PDF TOOLBAR */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              gap-3
              border-b
              border-slate-200
              bg-slate-50
              px-3
              py-2
            "
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 0.65}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-600
                  transition
                  hover:bg-slate-200
                  disabled:opacity-30
                "
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>

              <span className="min-w-[48px] text-center text-xs font-medium text-slate-600">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 1.8}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-600
                  transition
                  hover:bg-slate-200
                  disabled:opacity-30
                "
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <div className="text-xs font-medium text-slate-500">
              {numPages
                ? `Page ${pageNumber} of ${numPages}`
                : "Loading pages..."}
            </div>
          </div>

          {/* PDF VIEW */}

          <div
            className="
              min-h-0
              flex-1
              overflow-auto
              bg-slate-200
              p-4
              sm:p-6
            "
          >
            {documentError ? (
              <div
                className="
                  flex
                  min-h-[500px]
                  items-center
                  justify-center
                  text-center
                "
              >
                <div>
                  <FileText
                    size={42}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-4 text-sm font-medium text-slate-600">
                    {documentError}
                  </p>
                </div>
              </div>
            ) : (
              <Document
                file={fileUrl}
                onLoadSuccess={
                  handleDocumentLoadSuccess
                }
                onLoadError={
                  handleDocumentLoadError
                }
                loading={
                  <div className="flex min-h-[500px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2
                        size={32}
                        className="animate-spin text-cyan-600"
                      />

                      <span className="text-sm text-slate-500">
                        Opening book...
                      </span>
                    </div>
                  </div>
                }
              >
                <div
                  className="
                    flex
                    min-w-max
                    justify-center
                  "
                >
                  <div
                    className="
                      overflow-hidden
                      bg-white
                      shadow-[0_15px_40px_rgba(0,0,0,0.18)]
                    "
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={zoom}
                      renderTextLayer
                      renderAnnotationLayer
                    />
                  </div>
                </div>
              </Document>
            )}
          </div>

          {/* PAGE CONTROLS */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-center
              gap-4
              border-t
              border-slate-200
              bg-white
              px-4
              py-3
            "
          >
            <button
              type="button"
              onClick={previousPage}
              disabled={
                loadingDocument ||
                pageNumber <= 1
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-sm
                font-medium
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <div
              className="
                rounded-xl
                bg-slate-100
                px-4
                py-2
                text-xs
                font-semibold
                text-slate-600
              "
            >
              {pageNumber}
              {numPages
                ? ` / ${numPages}`
                : ""}
            </div>

            <button
              type="button"
              onClick={nextPage}
              disabled={
                loadingDocument ||
                !numPages ||
                pageNumber >= numPages
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-slate-900
                px-4
                py-2
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      );
    }

    if (videoMaterial) {
      return (
        <div
          className="
            flex
            h-full
            min-h-[500px]
            items-center
            justify-center
            bg-black
            p-4
          "
        >
          <video
            src={fileUrl}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            className="
              max-h-full
              max-w-full
              rounded-lg
              shadow-2xl
            "
          />
        </div>
      );
    }

    return (
      <div
        className="
          flex
          h-full
          min-h-[500px]
          items-center
          justify-center
          bg-slate-100
          p-8
          text-center
        "
      >
        <div className="max-w-md">
          <FileText
            size={52}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-5 text-lg font-semibold text-slate-700">
            This material cannot be previewed
            directly in the book reader.
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This viewer currently supports PDF and
            video learning materials.
          </p>
        </div>
      </div>
    );
  };

  /* =======================================================
     FRONT COVER
  ======================================================= */

  const frontCover = getFileUrl(
    material?.cover_page_url
  );

  const backCover = getFileUrl(
    material?.back_page_url
  );

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      className={`
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#020617]/95
        p-3
        backdrop-blur-md
        sm:p-6
        ${fullscreen ? "p-0" : ""}
      `}
    >
      {/* CLOSE */}

      <button
        type="button"
        onClick={onClose}
        className="
          absolute
          right-4
          top-4
          z-[120]
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-black/50
          text-slate-300
          backdrop-blur-md
          transition
          hover:bg-white/10
          hover:text-white
        "
        aria-label="Close book"
      >
        <X size={20} />
      </button>

      {/* FULLSCREEN */}

      <button
        type="button"
        onClick={() =>
          setFullscreen((current) => !current)
        }
        className="
          absolute
          right-16
          top-4
          z-[120]
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-black/50
          text-slate-300
          backdrop-blur-md
          transition
          hover:bg-white/10
          hover:text-white
        "
        aria-label={
          fullscreen
            ? "Exit fullscreen"
            : "Fullscreen"
        }
      >
        {fullscreen ? (
          <Minimize2 size={18} />
        ) : (
          <Maximize2 size={18} />
        )}
      </button>

      {/* =================================================
          BOOK
      ================================================= */}

      <div
        className={`
          relative
          flex
          h-[92vh]
          w-full
          max-w-[1500px]
          items-center
          justify-center
          ${fullscreen ? "h-screen max-w-none" : ""}
        `}
        style={{
          perspective: "2600px",
        }}
      >
        <div
          className={`
            relative
            h-full
            w-full
            transition-all
            duration-[1200ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              bookOpened
                ? "scale-100 opacity-100"
                : "scale-[0.7] opacity-0"
            }
          `}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* =================================================
              BOOK SHADOW
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-[-18px]
              left-[8%]
              right-[8%]
              h-10
              rounded-[50%]
              bg-black/60
              blur-2xl
            "
          />

          {/* =================================================
              LEFT PAGE
          ================================================= */}

          <div
            className="
              absolute
              left-0
              top-0
              hidden
              h-full
              w-1/2
              overflow-hidden
              rounded-l-[10px]
              bg-[#f7f3e9]
              shadow-[-15px_20px_50px_rgba(0,0,0,0.4)]
              lg:block
            "
          >
            {/* PAGE TEXTURE */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[linear-gradient(90deg,rgba(0,0,0,0.08),transparent_8%,transparent_92%,rgba(0,0,0,0.05))]
              "
            />

            {/* BOOK SPINE */}

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-full
                w-5
                bg-gradient-to-l
                from-black/10
                via-black/[0.03]
                to-transparent
              "
            />

            {/* LEFT PAGE LABEL */}

            <div className="absolute inset-0 flex items-center justify-center px-10">
              <div className="text-center">
                <div className="mx-auto mb-5 h-px w-20 bg-slate-300" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Scholiqen
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  Learning Material
                </p>

                <div className="mx-auto mt-5 h-px w-20 bg-slate-300" />
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT BOOK CONTENT
          ================================================= */}

          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-full
              overflow-hidden
              rounded-[10px]
              bg-white
              shadow-[15px_20px_60px_rgba(0,0,0,0.45)]
              lg:w-1/2
            "
          >
            {/* BOOK TOP */}

            <div
              className="
                absolute
                left-0
                right-0
                top-0
                z-20
                h-1
                bg-gradient-to-r
                from-transparent
                via-slate-300
                to-transparent
              "
            />

            {renderContent()}
          </div>

          {/* =================================================
              OPENING FRONT COVER
          ================================================= */}

          <div
            className={`
              absolute
              left-0
              top-0
              z-50
              hidden
              h-full
              w-1/2
              origin-left
              overflow-hidden
              rounded-l-[10px]
              bg-slate-900
              shadow-[-20px_20px_60px_rgba(0,0,0,0.5)]
              transition-transform
              duration-[1400ms]
              ease-[cubic-bezier(0.22,1,0.36,1)]
              lg:block
              ${
                bookOpened
                  ? "[transform:rotateY(-180deg)]"
                  : "[transform:rotateY(0deg)]"
              }
            `}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            {frontCover ? (
              <img
                src={frontCover}
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-[#071426]
                "
              >
                <BookOpenFallback />
              </div>
            )}

            {/* COVER EDGE */}

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-full
                w-5
                bg-gradient-to-l
                from-black/30
                via-black/10
                to-transparent
              "
            />
          </div>

          {/* =================================================
              MOBILE COVER TRANSITION
          ================================================= */}

          <div
            className={`
              absolute
              inset-0
              z-40
              flex
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              bg-slate-900
              transition-all
              duration-[1100ms]
              lg:hidden
              ${
                bookOpened
                  ? "pointer-events-none scale-[1.05] opacity-0"
                  : "scale-100 opacity-100"
              }
            `}
          >
            {frontCover ? (
              <img
                src={frontCover}
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <BookOpenFallback />
            )}
          </div>

          {/* =================================================
              BACK COVER AT END
          ================================================= */}

          {backCover && (
            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                right-0
                hidden
                h-full
                w-1/2
                overflow-hidden
                rounded-r-[10px]
                opacity-0
                lg:block
              "
            >
              <img
                src={backCover}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          BOOK TITLE
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-4
          left-1/2
          z-[110]
          hidden
          -translate-x-1/2
          rounded-full
          border
          border-white/10
          bg-black/50
          px-4
          py-2
          text-xs
          font-medium
          text-white/80
          backdrop-blur-md
          lg:block
        "
      >
        {material?.title ||
          "Learning Material"}
      </div>
    </div>
  );
}

/* =========================================================
   FALLBACK
========================================================= */

function BookOpenFallback() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div
        className="
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-2xl
          border
          border-white/10
          bg-white/[0.04]
        "
      >
        <FileText
          size={36}
          className="text-slate-500"
        />
      </div>

      <p className="text-sm text-slate-500">
        Cover unavailable
      </p>
    </div>
  );
}
```

Now replace your **entire `TutorMaterials.jsx`** with this version. It keeps the large cards you just requested and connects the click to the book opener.

```jsx
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
  FileText,
  RefreshCw,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import BookReader from "../../../components/tutor/BookReader";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* =========================================================
   HELPERS
========================================================= */

const getFileUrl = (fileUrl) => {
  if (!fileUrl) return "";

  if (
    fileUrl.startsWith("http://") ||
    fileUrl.startsWith("https://")
  ) {
    return fileUrl;
  }

  if (fileUrl.startsWith("/")) {
    return `${API_BASE_URL}${fileUrl}`;
  }

  return `${API_BASE_URL}/${fileUrl}`;
};

const formatMaterialType = (type) => {
  if (!type) return "Material";

  const normalized = String(type).toLowerCase();

  if (normalized === "pdf") return "PDF";
  if (normalized === "doc") return "Word";
  if (normalized === "docx") return "Word";
  if (normalized === "video") return "Video";
  if (normalized === "mp4") return "Video";
  if (normalized === "webm") return "Video";
  if (normalized === "mov") return "Video";

  return type;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorMaterials() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);

  /* =======================================================
     FETCH
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

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Unable to load materials."
          );
        }

        setMaterials(
          Array.isArray(result?.materials)
            ? result.materials
            : []
        );
      } catch (err) {
        console.error(
          "Tutor materials error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load materials."
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
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) return materials;

    return materials.filter((material) => {
      const values = [
        material?.title,
        material?.description,
        material?.subject,
        material?.level,
        material?.material_type,
        material?.file_name,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [materials, searchTerm]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5" />

            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-64 animate-pulse rounded bg-white/5" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#071426]"
                >
                  <div className="h-[390px] animate-pulse bg-white/[0.03] sm:h-[430px] lg:h-[450px]" />

                  <div className="space-y-2 p-5">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <BookOpen
                  size={23}
                  className="text-cyan-400"
                />

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Materials
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Open and read your assigned learning
                materials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchMaterials(true)}
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
              hover:bg-white/[0.06]
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

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.06] p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-medium text-red-200">
                Unable to load materials
              </p>

              <p className="mt-1 text-xs text-red-200/70">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SEARCH */}

        <div className="mb-7 max-w-xl">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
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
                focus:border-cyan-400/30
                focus:ring-2
                focus:ring-cyan-400/10
              "
            />
          </div>
        </div>

        {/* EMPTY */}

        {filteredMaterials.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#071426]/50 px-6 text-center">
            <FileText
              size={44}
              className="text-slate-600"
            />

            <h2 className="mt-5 text-lg font-semibold">
              {searchTerm
                ? "No matching materials"
                : "No materials available"}
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {searchTerm
                ? "Try another search term."
                : "Materials created by the Academy administration will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                MATERIAL GRID
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-3
                2xl:grid-cols-4
              "
            >
              {filteredMaterials.map(
                (material) => {
                  const coverUrl = getFileUrl(
                    material?.cover_page_url
                  );

                  const backUrl = getFileUrl(
                    material?.back_page_url
                  );

                  return (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() =>
                        setSelectedMaterial(
                          material
                        )
                      }
                      className="
                        group
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/[0.08]
                        bg-[#071426]
                        text-left
                        shadow-[0_18px_50px_rgba(0,0,0,0.25)]
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-cyan-400/20
                        hover:shadow-[0_25px_70px_rgba(0,0,0,0.4)]
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-cyan-400/50
                      "
                    >
                      {/* COVER */}

                      <div className="relative h-[390px] w-full overflow-hidden sm:h-[430px] lg:h-[450px] [perspective:1400px]">
                        <div
                          className="
                            relative
                            h-full
                            w-full
                            transition-transform
                            duration-700
                            [transform-style:preserve-3d]
                            group-hover:[transform:rotateY(180deg)]
                          "
                        >
                          {/* FRONT */}

                          <div className="absolute inset-0 overflow-hidden rounded-t-2xl bg-slate-900 [backface-visibility:hidden]">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BookOpen
                                  size={44}
                                  className="text-slate-600"
                                />
                              </div>
                            )}

                            {backUrl && (
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[11px] text-white/80 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                                Hover to view back cover
                              </div>
                            )}
                          </div>

                          {/* BACK */}

                          <div className="absolute inset-0 overflow-hidden rounded-t-2xl bg-slate-900 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            {backUrl ? (
                              <img
                                src={backUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BookOpen
                                  size={44}
                                  className="text-slate-600"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* INFO */}

                      <div className="border-t border-white/[0.06] px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-white">
                              {material?.title ||
                                "Learning Material"}
                            </h3>

                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
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

                          <span className="shrink-0 rounded-full border border-cyan-400/10 bg-cyan-400/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                            {formatMaterialType(
                              material?.material_type
                            )}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-7 border-t border-white/[0.06] pt-4">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="text-slate-300">
                  {filteredMaterials.length}
                </span>{" "}
                {filteredMaterials.length === 1
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

      {selectedMaterial && (
        <BookReader
          material={selectedMaterial}
          onClose={() =>
            setSelectedMaterial(null)
          }
        />
      )}
    </div>
  );
}
