import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  FileText,
  Upload,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  HardDrive,
  BookOpen,
  MoreVertical,
  ExternalLink,
  Filter,
  CalendarDays,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../../lib/supabaseClient";

// =====================================================
// HELPERS
// =====================================================

const formatFileSize = (bytes) => {
  if (!bytes) return "—";

  const sizes = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${
    sizes[index] || "GB"
  }`;
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  } catch {
    return "—";
  }
};

// =====================================================
// MAIN
// =====================================================

const PDFs = () => {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [showUpload, setShowUpload] =
    useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ===================================================
  // UPLOAD FORM
  // ===================================================

  const [uploading, setUploading] =
    useState(false);

  const [uploadForm, setUploadForm] =
    useState({
      title: "",
      description: "",
      category: "",
      file: null,
    });

  // ===================================================
  // FETCH DOCUMENTS
  // ===================================================

  const fetchDocuments = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const {
          data,
          error: fetchError,
        } = await supabase
          .from("documents")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (fetchError) {
          throw fetchError;
        }

        setDocuments(
          data || []
        );
      } catch (err) {
        console.error(
          "FETCH DOCUMENTS ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to load documents."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ===================================================
  // CATEGORIES
  // ===================================================

  const categories = useMemo(() => {
    const values = documents
      .map(
        (document) =>
          document.category
      )
      .filter(Boolean);

    return [
      ...new Set(values),
    ].sort();
  }, [documents]);

  // ===================================================
  // FILTERED DOCUMENTS
  // ===================================================

  const filteredDocuments =
    useMemo(() => {
      return documents.filter(
        (document) => {
          const keyword =
            search
              .trim()
              .toLowerCase();

          const matchesSearch =
            !keyword ||
            document.title
              ?.toLowerCase()
              .includes(keyword) ||
            document.description
              ?.toLowerCase()
              .includes(keyword) ||
            document.category
              ?.toLowerCase()
              .includes(keyword);

          const matchesCategory =
            categoryFilter ===
              "all" ||
            document.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      documents,
      search,
      categoryFilter,
    ]);

  // ===================================================
  // STATS
  // ===================================================

  const stats = useMemo(() => {
    const totalSize =
      documents.reduce(
        (total, document) =>
          total +
          Number(
            document.file_size || 0
          ),
        0
      );

    return {
      total: documents.length,
      categories: categories.length,
      size: formatFileSize(
        totalSize
      ),
      recent:
        documents.filter(
          (document) => {
            if (
              !document.created_at
            ) {
              return false;
            }

            const created =
              new Date(
                document.created_at
              );

            const sevenDaysAgo =
              new Date();

            sevenDaysAgo.setDate(
              sevenDaysAgo.getDate() -
                7
            );

            return (
              created >=
              sevenDaysAgo
            );
          }
        ).length,
    };
  }, [
    documents,
    categories,
  ]);

  // ===================================================
  // OPEN PDF
  // ===================================================

  const openPDF = (document) => {
  if (!document?.id) {
    setError("This document does not have a valid ID.");
    return;
  }

  navigate(`/pdf/${document.id}`);
};

  // ===================================================
  // DELETE DOCUMENT
  // ===================================================

  const deleteDocument =
    async () => {
      if (
        !deleteTarget?.id
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        // ---------------------------------------------
        // DELETE STORAGE FILE IF PATH EXISTS
        // ---------------------------------------------

        if (
          deleteTarget.file_path
        ) {
          const bucket =
            deleteTarget.bucket ||
            "documents";

          const {
            error:
              storageError,
          } =
            await supabase.storage
              .from(bucket)
              .remove([
                deleteTarget.file_path,
              ]);

          if (
            storageError
          ) {
            console.warn(
              "STORAGE DELETE WARNING:",
              storageError
            );
          }
        }

        // ---------------------------------------------
        // DELETE DATABASE RECORD
        // ---------------------------------------------

        const {
          error:
            databaseError,
        } =
          await supabase
            .from("documents")
            .delete()
            .eq(
              "id",
              deleteTarget.id
            );

        if (
          databaseError
        ) {
          throw databaseError;
        }

        setDocuments(
          (previous) =>
            previous.filter(
              (document) =>
                document.id !==
                deleteTarget.id
            )
        );

        setDeleteTarget(
          null
        );

        setMessage(
          "Document deleted successfully."
        );

        setTimeout(
          () =>
            setMessage(""),
          3000
        );
      } catch (err) {
        console.error(
          "DELETE DOCUMENT ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete document."
        );
      } finally {
        setLoading(false);
      }
    };

  // ===================================================
  // UPLOAD
  // ===================================================

  const uploadDocument =
    async (event) => {
      event.preventDefault();

      if (
        !uploadForm.file
      ) {
        setError(
          "Please select a PDF file."
        );

        return;
      }

      if (
        !uploadForm.title.trim()
      ) {
        setError(
          "Please enter a document title."
        );

        return;
      }

      try {
        setUploading(true);
        setError("");

        const file =
          uploadForm.file;

        // ---------------------------------------------
        // VALIDATE FILE
        // ---------------------------------------------

        const isPDF =
          file.type ===
            "application/pdf" ||
          file.name
            .toLowerCase()
            .endsWith(".pdf");

        if (!isPDF) {
          throw new Error(
            "Only PDF files are allowed."
          );
        }

        // ---------------------------------------------
        // FILE NAME
        // ---------------------------------------------

        const safeName =
          file.name
            .replace(
              /[^a-zA-Z0-9.-]/g,
              "_"
            )
            .toLowerCase();

        const filePath = `pdfs/${Date.now()}-${safeName}`;

        // ---------------------------------------------
        // STORAGE BUCKET
        //
        // Change "documents" if your bucket
        // has another name.
        // ---------------------------------------------

        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from("documents")
            .upload(
              filePath,
              file,
              {
                cacheControl:
                  "3600",
                upsert: false,
              }
            );

        if (
          storageError
        ) {
          throw storageError;
        }

        // ---------------------------------------------
        // PUBLIC URL
        // ---------------------------------------------

        const {
          data:
            publicUrlData,
        } =
          supabase.storage
            .from("documents")
            .getPublicUrl(
              filePath
            );

        const fileUrl =
          publicUrlData
            ?.publicUrl;

        if (!fileUrl) {
          throw new Error(
            "Unable to generate PDF URL."
          );
        }

        // ---------------------------------------------
        // DATABASE
        // ---------------------------------------------

        const {
          data:
            newDocument,
          error:
            databaseError,
        } =
          await supabase
            .from("documents")
            .insert({
              title:
                uploadForm.title.trim(),

              description:
                uploadForm.description.trim() ||
                null,

              category:
                uploadForm.category.trim() ||
                "General",

              file_url:
                fileUrl,

              file_path:
                filePath,

              file_type:
                "pdf",

              file_size:
                file.size,
            })
            .select()
            .single();

        if (
          databaseError
        ) {
          // -------------------------------------------
          // CLEAN UP STORAGE IF DB INSERT FAILS
          // -------------------------------------------

          await supabase.storage
            .from("documents")
            .remove([
              filePath,
            ]);

          throw databaseError;
        }

        setDocuments(
          (previous) => [
            newDocument,
            ...previous,
          ]
        );

        setUploadForm({
          title: "",
          description: "",
          category: "",
          file: null,
        });

        setShowUpload(false);

        setMessage(
          "PDF uploaded successfully."
        );

        setTimeout(
          () =>
            setMessage(""),
          3000
        );
      } catch (err) {
        console.error(
          "UPLOAD PDF ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to upload PDF."
        );
      } finally {
        setUploading(false);
      }
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B14] text-white">

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/5">

              <Loader2
                size={38}
                className="animate-spin text-cyan-400"
              />

            </div>

            <p className="mt-5 font-bold text-slate-400">
              Loading PDF library...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen bg-[#050B14] text-white">

      {/* ================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[150px]" />

        <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[150px]" />

      </div>

      <div className="relative">

        {/* ==============================================
            HEADER
        ============================================== */}

        <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-2xl">

          <div className="mx-auto max-w-7xl px-6 py-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-cyan-400">

                  <FileText size={16} />

                  Media Library

                </div>

                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  PDF Library
                </h1>

                <p className="mt-3 max-w-2xl text-slate-400">
                  Manage, organize and publish
                  your educational PDF resources.
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    fetchDocuments(
                      false
                    )
                  }
                  disabled={
                    refreshing
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold transition hover:border-cyan-500 disabled:opacity-50"
                >

                  <RefreshCw
                    size={18}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh

                </button>

                <button
                  onClick={() =>
                    setShowUpload(
                      true
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:scale-105"
                >

                  <Plus size={19} />

                  Add PDF

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ==============================================
            CONTENT
        ============================================== */}

        <main className="mx-auto max-w-7xl px-6 py-10">

          {/* ALERTS */}

          <AnimatePresence>

            {message && (
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
                className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-400"
              >

                <CheckCircle2
                  size={20}
                />

                <span className="font-semibold">
                  {message}
                </span>

              </motion.div>
            )}

            {error && (
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
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-400"
              >

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="font-bold">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-sm text-red-400/80">
                    {error}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setError("")
                  }
                >
                  <X size={18} />
                </button>

              </motion.div>
            )}

          </AnimatePresence>

          {/* ============================================
              STATS
          ============================================ */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={FileText}
              label="Total PDFs"
              value={stats.total}
              description="All documents"
            />

            <StatCard
              icon={FolderOpen}
              label="Categories"
              value={
                stats.categories
              }
              description="Organized groups"
            />

            <StatCard
              icon={HardDrive}
              label="Storage"
              value={stats.size}
              description="Total file size"
            />

            <StatCard
              icon={CalendarDays}
              label="Recent"
              value={stats.recent}
              description="Added this week"
            />

          </div>

          {/* ============================================
              SEARCH / FILTER
          ============================================ */}

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-4">

            <div className="flex flex-col gap-4 lg:flex-row">

              <div className="relative flex-1">

                <Search
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search PDFs, descriptions or categories..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-4 pl-14 pr-5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-5">

                <Filter
                  size={18}
                  className="text-cyan-400"
                />

                <select
                  value={
                    categoryFilter
                  }
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target
                        .value
                    )
                  }
                  className="bg-transparent py-4 text-white outline-none"
                >

                  <option
                    value="all"
                    className="bg-slate-950"
                  >
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                        className="bg-slate-950"
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </div>

          {/* ============================================
              RESULTS HEADER
          ============================================ */}

          <div className="mb-5 mt-10 flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                Documents
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredDocuments.length}{" "}
                PDF
                {filteredDocuments.length ===
                1
                  ? ""
                  : "s"}{" "}
                found
              </p>

            </div>

          </div>

          {/* ============================================
              EMPTY STATE
          ============================================ */}

          {filteredDocuments.length ===
          0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-700 bg-slate-900/50 p-20 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800">

                <FileText
                  size={38}
                  className="text-slate-500"
                />

              </div>

              <h2 className="mt-6 text-2xl font-black">
                No PDFs Found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-slate-500">
                Upload your first PDF or
                change your search filters.
              </p>

              <button
                onClick={() =>
                  setShowUpload(
                    true
                  )
                }
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 font-black text-slate-950"
              >

                <Upload size={18} />

                Upload PDF

              </button>

            </div>
          ) : (

            /* ==========================================
               DOCUMENT GRID
            ========================================== */

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredDocuments.map(
                (
                  document,
                  index
                ) => (

                  <motion.div
                    key={
                      document.id
                    }
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index *
                        0.03,
                    }}
                    className="group overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/70 transition hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/5"
                  >

                    {/* CARD TOP */}

                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-slate-950">

                      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">

                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

                      </div>

                      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 shadow-xl transition group-hover:scale-110">

                        <FileText
                          size={38}
                          className="text-red-400"
                        />

                      </div>

                      <div className="absolute left-5 top-5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                        PDF
                      </div>

                    </div>

                    {/* CARD CONTENT */}

                    <div className="p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <h3 className="truncate text-lg font-black">
                            {
                              document.title
                            }
                          </h3>

                          <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                            {
                              document.description ||
                              "No description available."
                            }
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            setSelectedDocument(
                              document
                            )
                          }
                          className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-400 hover:border-cyan-500 hover:text-white"
                        >
                          <MoreVertical
                            size={
                              18
                            }
                          />
                        </button>

                      </div>

                      {/* META */}

                      <div className="mt-5 flex flex-wrap gap-2">

                        <span className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400">
                          {
                            document.category ||
                            "General"
                          }
                        </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400">
                          {formatFileSize(
                            document.file_size
                          )}
                        </span>

                      </div>

                      {/* FOOTER */}

                      <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">

                        <div>

                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                            Added
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {formatDate(
                              document.created_at
                            )}
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            openPDF(
                              document
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:scale-105"
                        >

                          <Eye
                            size={16}
                          />

                          Open

                        </button>

                      </div>

                    </div>

                  </motion.div>

                )
              )}

            </div>

          )}

        </main>

      </div>

      {/* ==============================================
          DOCUMENT ACTION MODAL
      ============================================== */}

      <AnimatePresence>

        {selectedDocument && (
          <Modal
            onClose={() =>
              setSelectedDocument(
                null
              )
            }
          >

            <div className="flex items-start justify-between">

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">

                  <FileText
                    size={23}
                    className="text-cyan-400"
                  />

                </div>

                <h2 className="mt-5 text-2xl font-black">
                  {
                    selectedDocument.title
                  }
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedDocument(
                    null
                  )
                }
                className="rounded-xl border border-slate-700 p-2"
              >
                <X size={18} />
              </button>

            </div>

            <div className="mt-7 grid gap-3">

              <button
                onClick={() => {
                  openPDF(
                    selectedDocument
                  );

                  setSelectedDocument(
                    null
                  );
                }}
                className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-left transition hover:border-cyan-500"
              >

                <Eye
                  size={20}
                  className="text-cyan-400"
                />

                <div>
                  <p className="font-bold">
                    Open PDF Reader
                  </p>

                  <p className="text-sm text-slate-500">
                    Read this document
                  </p>
                </div>

                <ExternalLink
                  size={18}
                  className="ml-auto text-slate-500"
                />

              </button>

              <button
                onClick={() => {
                  setDeleteTarget(
                    selectedDocument
                  );

                  setSelectedDocument(
                    null
                  );
                }}
                className="flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-left transition hover:border-red-500/40"
              >

                <Trash2
                  size={20}
                  className="text-red-400"
                />

                <div>
                  <p className="font-bold text-red-400">
                    Delete Document
                  </p>

                  <p className="text-sm text-slate-500">
                    Remove this PDF
                  </p>
                </div>

              </button>

            </div>

          </Modal>
        )}

      </AnimatePresence>

      {/* ==============================================
          DELETE MODAL
      ============================================== */}

      <AnimatePresence>

        {deleteTarget && (
          <Modal
            onClose={() =>
              setDeleteTarget(
                null
              )
            }
          >

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">

                <Trash2
                  size={28}
                  className="text-red-400"
                />

              </div>

              <h2 className="mt-6 text-2xl font-black">
                Delete PDF?
              </h2>

              <p className="mt-3 leading-7 text-slate-500">
                You are about to permanently
                delete{" "}
                <span className="font-bold text-white">
                  {deleteTarget.title}
                </span>
                . This action cannot be undone.
              </p>

              <div className="mt-7 flex gap-3">

                <button
                  onClick={() =>
                    setDeleteTarget(
                      null
                    )
                  }
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    deleteDocument
                  }
                  className="flex-1 rounded-2xl bg-red-500 px-5 py-3 font-black text-white"
                >
                  Delete
                </button>

              </div>

            </div>

          </Modal>
        )}

      </AnimatePresence>

      {/* ==============================================
          UPLOAD MODAL
      ============================================== */}

      <AnimatePresence>

        {showUpload && (
          <Modal
            onClose={() => {
              if (!uploading) {
                setShowUpload(
                  false
                );
              }
            }}
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                  Media Library
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Upload PDF
                </h2>

              </div>

              <button
                disabled={
                  uploading
                }
                onClick={() =>
                  setShowUpload(
                    false
                  )
                }
                className="rounded-xl border border-slate-700 p-2"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={
                uploadDocument
              }
              className="mt-7 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Document Title
                </label>

                <input
                  required
                  value={
                    uploadForm.title
                  }
                  onChange={(event) =>
                    setUploadForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        title:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="e.g. Biology Revision Guide"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Category
                </label>

                <input
                  value={
                    uploadForm.category
                  }
                  onChange={(event) =>
                    setUploadForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        category:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="e.g. Biology"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={
                    uploadForm.description
                  }
                  onChange={(event) =>
                    setUploadForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        description:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Describe this PDF..."
                  className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-300">
                  PDF File
                </label>

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center transition hover:border-cyan-500">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">

                    <Upload
                      size={25}
                      className="text-cyan-400"
                    />

                  </div>

                  <p className="mt-4 font-bold">
                    {uploadForm.file
                      ? uploadForm
                          .file
                          .name
                      : "Choose PDF file"}
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    PDF files only
                  </p>

                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(
                      event
                    ) =>
                      setUploadForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          file:
                            event
                              .target
                              .files?.[0] ||
                            null,
                        })
                      )
                    }
                  />

                </label>

              </div>

              <button
                disabled={
                  uploading
                }
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {uploading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload
                      size={20}
                    />

                    Upload PDF
                  </>
                )}

              </button>

            </form>

          </Modal>
        )}

      </AnimatePresence>

    </div>
  );
};

// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10">

          <Icon
            size={21}
            className="text-cyan-400"
          />

        </div>

      </div>

    </motion.div>
  );
};

// =====================================================
// MODAL
// =====================================================

const Modal = ({
  children,
  onClose,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 py-8 backdrop-blur-md"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 15,
        }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-slate-700 bg-[#07101d] p-7 shadow-2xl"
      >
        {children}
      </motion.div>

    </motion.div>
  );
};

export default PDFs;