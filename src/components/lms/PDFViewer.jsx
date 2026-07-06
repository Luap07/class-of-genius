import React, { useState } from "react";
import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  FileText,
} from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFViewer = ({
  file,
  title = "Document",
}) => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.2);

  function onLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const previous = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const next = () => {
    if (page < numPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">

      {/* Toolbar */}

      <div className="border-b border-slate-800 bg-slate-950 p-4 flex flex-wrap gap-4 items-center justify-between">

        <div className="flex items-center gap-3">

          <FileText className="text-red-500" />

          <div>

            <h2 className="font-semibold">
              {title}
            </h2>

            <p className="text-xs text-slate-400">
              PDF Viewer
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={previous}
            disabled={page === 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm">
            {page} / {numPages || "--"}
          </span>

          <button
            onClick={next}
            disabled={page === numPages}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() =>
              setScale((s) => Math.max(0.6, s - 0.1))
            }
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <ZoomOut size={18} />
          </button>

          <button
            onClick={() =>
              setScale((s) => Math.min(3, s + 0.1))
            }
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <ZoomIn size={18} />
          </button>

          <a
            href={file}
            download
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            <Download size={18} />
          </a>

          <button
            onClick={() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              }
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            <Maximize2 size={18} />
          </button>

        </div>

      </div>

      {/* Viewer */}

      <div className="bg-slate-800 flex justify-center p-8 overflow-auto">

        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          loading={
            <p className="text-slate-400">
              Loading PDF...
            </p>
          }
        >
          <Page
            pageNumber={page}
            scale={scale}
          />
        </Document>

      </div>

    </div>
  );
};

export default PDFViewer;