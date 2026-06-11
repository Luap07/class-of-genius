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
    <div
      className="
        p-6 min-h-screen text-white
        bg-gradient-to-b from-[#070b14] via-[#0a0f1f] to-[#05070f]
      "
    >

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
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
          />
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex gap-2">

          <button
            onClick={() => changeView("grid")}
            className={`p-2 rounded-lg transition border border-white/10 ${
              view === "grid"
                ? "bg-blue-600 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <Grid3X3 size={18} />
          </button>

          <button
            onClick={() => changeView("list")}
            className={`p-2 rounded-lg transition border border-white/10 ${
              view === "list"
                ? "bg-blue-600 text-white"
                : "hover:bg-white/10"
            }`}
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
                className="p-3 rounded-xl bg-white/5 border border-white/10"
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
        <div className="text-center text-gray-400 mt-10">
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
                  className="rounded-xl p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >

                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={18} />
                    <span className="font-semibold truncate">
                      {doc?.name}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">
                    {doc?.type || "File"}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm">

                    <button
                      onClick={() => {
                        openDocument(doc);
                        window.open(doc.url, "_blank");
                      }}
                      className="text-blue-400"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => addDownload(doc)}
                      className="text-green-400 flex items-center gap-1"
                    >
                      <Download size={14} /> Save
                    </button>

                    <button
                      onClick={() => togglePin(doc)}
                      className="text-yellow-400 flex items-center gap-1"
                    >
                      <Pin size={14} /> Pin
                    </button>

                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-400 flex items-center gap-1"
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
                  className="flex items-center justify-between rounded-lg p-3 bg-white/5 border border-white/10"
                >

                  <div className="flex items-center gap-3">
                    <FileText size={18} />
                    <div>
                      <p className="font-medium">{doc?.name}</p>
                      <p className="text-xs text-gray-400">
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
                      className="text-blue-400"
                    >
                      Open
                    </button>

                    <button className="text-green-400">Download</button>

                    <button className="text-yellow-400">Pin</button>

                    <button className="text-red-400">Delete</button>

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