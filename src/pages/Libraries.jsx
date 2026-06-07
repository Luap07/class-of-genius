import React, { useContext, useState, useEffect } from "react";
import { DocumentContext } from "../context/DocumentContext";
import {
  FileText,
  Trash2,
  Pin,
  Search,
  Download,
  Grid3X3,
  List,
} from "lucide-react";

const Libraries = () => {
  const {
    documents,
    removeDocument,
    openDocument,
    pinned,
    togglePin,
    addDownload,
  } = useContext(DocumentContext);

  /* ================= VIEW STATE (PERSISTED) ================= */
  const [view, setView] = useState(() => {
    return localStorage.getItem("driveView") || "grid";
  });

  const changeView = (mode) => {
    setView(mode);
    localStorage.setItem("driveView", mode);
  };

  const [search, setSearch] = useState("");

  /* ================= FILTER FILES ================= */
  const filteredDocs = (documents || []).filter((doc) =>
    (doc?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <h1 className="text-2xl font-bold">📁 My Drive</h1>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg"
          />
        </div>

        {/* VIEW TOGGLE (FIXED + FUNCTIONAL) */}
        <div className="flex gap-2">

          <button
            onClick={() => changeView("grid")}
            className={`p-2 border rounded-lg transition ${
              view === "grid"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            title="Grid view"
          >
            <Grid3X3 size={18} />
          </button>

          <button
            onClick={() => changeView("list")}
            className={`p-2 border rounded-lg transition ${
              view === "list"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            title="List view"
          >
            <List size={18} />
          </button>

        </div>
      </div>

      {/* ================= PINNED ================= */}
      {pinned?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold mb-3">📌 Pinned</h2>

          <div className="grid md:grid-cols-3 gap-3">
            {pinned.map((doc) => (
              <div
                key={doc.id}
                className="p-3 border rounded-xl bg-yellow-50"
              >
                <p className="font-medium truncate">
                  {doc?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {filteredDocs.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          📭 No files found in your Drive
        </div>
      ) : (
        <>
          {/* ================= GRID VIEW ================= */}
          {view === "grid" && (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">

              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
                >

                  {/* FILE TITLE */}
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={18} />
                    <span className="font-semibold truncate">
                      {doc?.name}
                    </span>
                  </div>

                  {/* TYPE */}
                  <p className="text-xs text-gray-500 mb-3">
                    {doc?.type || "File"}
                  </p>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 text-sm">

                    <button
                      onClick={() => {
                        openDocument(doc);
                        window.open(doc.url, "_blank");
                      }}
                      className="text-blue-600"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => addDownload(doc)}
                      className="text-green-600 flex items-center gap-1"
                    >
                      <Download size={14} /> Save
                    </button>

                    <button
                      onClick={() => togglePin(doc)}
                      className="text-yellow-600 flex items-center gap-1"
                    >
                      <Pin size={14} /> Pin
                    </button>

                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* ================= LIST VIEW ================= */}
          {view === "list" && (
            <div className="flex flex-col gap-2">

              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border rounded-lg p-3 bg-white"
                >

                  <div className="flex items-center gap-3">
                    <FileText size={18} />
                    <div>
                      <p className="font-medium">{doc?.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc?.type || "File"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-sm">

                    <button
                      onClick={() => {
                        openDocument(doc);
                        window.open(doc.url, "_blank");
                      }}
                      className="text-blue-600"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => addDownload(doc)}
                      className="text-green-600"
                    >
                      Download
                    </button>

                    <button
                      onClick={() => togglePin(doc)}
                      className="text-yellow-600"
                    >
                      Pin
                    </button>

                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Libraries;