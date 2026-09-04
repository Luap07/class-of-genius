// src/admin/pages/DocumentsAdmin.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Upload,
  FileText,
  FolderOpen,
  Search,
  RefreshCw,
  Loader2,
  Tag,
  AlignLeft,
  Trash2,
  ExternalLink,
  BarChart3,
  Files,
  Edit3,
  X,
} from "lucide-react";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY =
  "scholiqen_auth_token";

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = () => {
  const token =
    localStorage.getItem(
      AUTH_TOKEN_KEY
    );

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// ============================================================
// API RESPONSE HELPER
// ============================================================

const parseResponse = async (
  response
) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}.`
    );
  }

  return data;
};

// ============================================================
// ASSET URL HELPER
// ============================================================

const resolveAssetUrl = (url) => {
  if (!url) return "";

  // Already an absolute URL
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  // Relative backend URL
  return `${API_URL}${
    url.startsWith("/")
      ? url
      : `/${url}`
  }`;
};

// ============================================================
// COMPONENT
// ============================================================

export default function DocumentsAdmin() {
  /* ==========================================================
     FORM STATES
  ========================================================== */

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [thumbnail, setThumbnail] =
    useState(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("");

  /* ==========================================================
     EDIT STATES
  ========================================================== */

  const [
    editingDoc,
    setEditingDoc,
  ] = useState(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editCategory,
    setEditCategory,
  ] = useState("");

  const [editFile, setEditFile] =
    useState(null);

  const [
    editThumbnail,
    setEditThumbnail,
  ] = useState(null);

  const [updating, setUpdating] =
    useState(false);

  /* ==========================================================
     DATA STATES
  ========================================================== */

  const [categories, setCategories] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  /* ==========================================================
     FILTER STATES
  ========================================================== */

  const [search, setSearch] =
    useState("");

  const [
    filterCategory,
    setFilterCategory,
  ] = useState("all");

  /* ==========================================================
     LOADING STATES
  ========================================================== */

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    loadingDocuments,
    setLoadingDocuments,
  ] = useState(true);

  const [uploading, setUploading] =
    useState(false);

  /* ==========================================================
     THUMBNAIL PREVIEW
  ========================================================== */

  const [
    thumbnailPreview,
    setThumbnailPreview,
  ] = useState("");

  const [
    editThumbnailPreview,
    setEditThumbnailPreview,
  ] = useState("");

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  /* ==========================================================
     THUMBNAIL PREVIEW
  ========================================================== */

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreview("");
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        thumbnail
      );

    setThumbnailPreview(
      objectUrl
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [thumbnail]);

  /* ==========================================================
     EDIT THUMBNAIL PREVIEW
  ========================================================== */

  useEffect(() => {
    if (!editThumbnail) {
      setEditThumbnailPreview("");
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        editThumbnail
      );

    setEditThumbnailPreview(
      objectUrl
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [editThumbnail]);

  /* ==========================================================
     FETCH CATEGORIES
  ========================================================== */

  const fetchCategories =
    async () => {
      try {
        setLoadingCategories(true);

        const response =
          await fetch(
            `${API_URL}/api/documents/categories`,
            {
              method: "GET",
              headers: {
                ...getAuthHeaders(),
              },
            }
          );

        const data =
          await parseResponse(
            response
          );

        const list =
          Array.isArray(
            data?.categories
          )
            ? data.categories
            : [];

        setCategories(list);

        if (
          list.length > 0 &&
          !selectedCategory
        ) {
          setSelectedCategory(
            String(list[0].id)
          );
        }
      } catch (error) {
        console.error(
          "CATEGORY FETCH ERROR:",
          error
        );

        setCategories([]);

        if (
          error.message
            ?.toLowerCase()
            .includes("authentication")
        ) {
          alert(
            "Your admin session may have expired. Please log in again."
          );
        }
      } finally {
        setLoadingCategories(
          false
        );
      }
    };

  /* ==========================================================
     FETCH DOCUMENTS
  ========================================================== */

  const fetchDocuments =
    async () => {
      try {
        setLoadingDocuments(true);

        const response =
          await fetch(
            `${API_URL}/api/documents`,
            {
              method: "GET",
              headers: {
                ...getAuthHeaders(),
              },
            }
          );

        const data =
          await parseResponse(
            response
          );

        const list =
          Array.isArray(
            data?.documents
          )
            ? data.documents
            : [];

        setDocuments(list);
      } catch (error) {
        console.error(
          "DOCUMENT FETCH ERROR:",
          error
        );

        setDocuments([]);

        alert(
          error.message ||
            "Unable to load documents."
        );
      } finally {
        setLoadingDocuments(
          false
        );
      }
    };

  /* ==========================================================
     FILTER DOCUMENTS
  ========================================================== */

  const filteredDocuments =
    useMemo(() => {
      return documents.filter(
        (doc) => {
          const keyword =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !keyword ||
            doc.title
              ?.toLowerCase()
              .includes(keyword) ||
            doc.description
              ?.toLowerCase()
              .includes(keyword);

          const matchesCategory =
            filterCategory ===
              "all" ||
            String(
              doc.category_id
            ) ===
              String(
                filterCategory
              );

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      documents,
      search,
      filterCategory,
    ]);

  /* ==========================================================
     DASHBOARD STATS
  ========================================================== */

  const stats = useMemo(() => {
    return {
      total:
        documents.length,

      totalCategories:
        new Set(
          documents.map(
            (doc) =>
              doc.category_id
          )
        ).size,

      pdfs:
        documents.filter(
          (doc) =>
            doc.file_type
              ?.toLowerCase() ===
            "pdf"
        ).length,

      images:
        documents.filter(
          (doc) =>
            Boolean(
              doc.thumbnail_url
            )
        ).length,
    };
  }, [documents]);

  /* ==========================================================
     UPLOAD DOCUMENT
  ========================================================== */

  const handleUpload = async (
    event
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      alert(
        "Please enter a document title."
      );
      return;
    }

    if (!selectedCategory) {
      alert(
        "Please select a category."
      );
      return;
    }

    if (!file) {
      alert(
        "Please choose a document."
      );
      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "category_id",
        selectedCategory
      );

      formData.append(
        "file",
        file
      );

      if (thumbnail) {
        formData.append(
          "thumbnail",
          thumbnail
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/documents`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
            },
            body: formData,
          }
        );

      const data =
        await parseResponse(
          response
        );

      if (!data?.document) {
        throw new Error(
          "Document was uploaded but no document record was returned."
        );
      }

      // Add immediately to the list
      setDocuments(
        (prev) => [
          data.document,
          ...prev,
        ]
      );

      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      setThumbnail(null);

      if (categories.length) {
        setSelectedCategory(
          String(
            categories[0].id
          )
        );
      }

      alert(
        "Document uploaded successfully."
      );

      // Confirm latest DB state
      await fetchDocuments();
    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      alert(
        error.message ||
          "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  /* ==========================================================
     START EDITING
  ========================================================== */

  const startEditing = (
    doc
  ) => {
    setEditingDoc(doc);

    setEditTitle(
      doc.title || ""
    );

    setEditDescription(
      doc.description || ""
    );

    setEditCategory(
      doc.category_id
        ? String(
            doc.category_id
          )
        : ""
    );

    setEditFile(null);
    setEditThumbnail(null);
  };

  /* ==========================================================
     UPDATE DOCUMENT
  ========================================================== */

  const handleUpdate =
    async (event) => {
      event.preventDefault();

      if (!editingDoc) {
        return;
      }

      if (!editTitle.trim()) {
        alert(
          "Please enter a title."
        );
        return;
      }

      if (!editCategory) {
        alert(
          "Please select a category."
        );
        return;
      }

      try {
        setUpdating(true);

        const formData =
          new FormData();

        formData.append(
          "title",
          editTitle.trim()
        );

        formData.append(
          "description",
          editDescription.trim()
        );

        formData.append(
          "category_id",
          editCategory
        );

        if (editFile) {
          formData.append(
            "file",
            editFile
          );
        }

        if (editThumbnail) {
          formData.append(
            "thumbnail",
            editThumbnail
          );
        }

        const response =
          await fetch(
            `${API_URL}/api/documents/${editingDoc.id}`,
            {
              method: "PUT",
              headers: {
                ...getAuthHeaders(),
              },
              body: formData,
            }
          );

        const data =
          await parseResponse(
            response
          );

        if (!data?.document) {
          throw new Error(
            "Document updated but no document record was returned."
          );
        }

        setDocuments(
          (prev) =>
            prev.map((doc) =>
              String(doc.id) ===
              String(
                editingDoc.id
              )
                ? data.document
                : doc
            )
        );

        setEditingDoc(null);
        setEditFile(null);
        setEditThumbnail(null);

        alert(
          "Document updated successfully."
        );

        await fetchDocuments();
      } catch (error) {
        console.error(
          "UPDATE ERROR:",
          error
        );

        alert(
          error.message ||
            "Failed to update document."
        );
      } finally {
        setUpdating(false);
      }
    };

  /* ==========================================================
     DELETE DOCUMENT
  ========================================================== */

  const handleDelete =
    async (doc) => {
      const confirmed =
        window.confirm(
          `Delete "${doc.title}"?\n\nThis action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/documents/${doc.id}`,
            {
              method: "DELETE",
              headers: {
                ...getAuthHeaders(),
              },
            }
          );

        await parseResponse(
          response
        );

        setDocuments(
          (prev) =>
            prev.filter(
              (item) =>
                String(
                  item.id
                ) !==
                String(doc.id)
            )
        );

        alert(
          "Document deleted successfully."
        );
      } catch (error) {
        console.error(
          "DELETE ERROR:",
          error
        );

        alert(
          error.message ||
            "Unable to delete document."
        );
      }
    };

  /* ==========================================================
     OPEN DOCUMENT
  ========================================================== */

  const openDocument = (
    url
  ) => {
    if (!url) {
      alert(
        "Document URL not found."
      );
      return;
    }

    const finalUrl =
      resolveAssetUrl(url);

    window.open(
      finalUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refreshDocuments =
    async () => {
      await Promise.all([
        fetchDocuments(),
        fetchCategories(),
      ]);
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#020617] p-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black">
            Document Manager
          </h1>

          <p className="mt-2 text-slate-400">
            Upload, organize and
            manage all course
            learning materials.
          </p>
        </motion.div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <BarChart3
              className="mb-4 text-cyan-400"
              size={30}
            />

            <p className="text-sm text-slate-400">
              Total Documents
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {stats.total}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <FolderOpen
              className="mb-4 text-yellow-400"
              size={30}
            />

            <p className="text-sm text-slate-400">
              Categories
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {stats.totalCategories}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <FileText
              className="mb-4 text-red-400"
              size={30}
            />

            <p className="text-sm text-slate-400">
              PDF Files
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {stats.pdfs}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <Files
              className="mb-4 text-emerald-400"
              size={30}
            />

            <p className="text-sm text-slate-400">
              With Thumbnails
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {stats.images}
            </h2>
          </div>

        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">

          {/* ===================================================
              UPLOAD FORM
          =================================================== */}

          <motion.form
            onSubmit={
              handleUpload
            }
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="h-fit space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-bold">
              Upload Document
            </h2>

            {/* TITLE */}

            <div>
              <label className="mb-2 flex items-center gap-2 font-medium">
                <FileText
                  size={18}
                />
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Document title..."
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none transition focus:border-cyan-500"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 flex items-center gap-2 font-medium">
                <AlignLeft
                  size={18}
                />
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Write a short description..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none transition focus:border-cyan-500"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 flex items-center gap-2 font-medium">
                <Tag size={18} />
                Category
              </label>

              <select
                value={
                  selectedCategory
                }
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
                disabled={
                  loadingCategories
                }
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none disabled:opacity-50"
              >
                {loadingCategories ? (
                  <option>
                    Loading categories...
                  </option>
                ) : categories.length ===
                  0 ? (
                  <option value="">
                    No categories found
                  </option>
                ) : (
                  categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )
                )}
              </select>
            </div>

            {/* DOCUMENT FILE */}

            <div>
              <label className="mb-3 flex items-center gap-2 font-medium">
                <FolderOpen
                  size={18}
                />
                Document File
              </label>

              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={(e) =>
                  setFile(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
                className="block w-full cursor-pointer text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-400 hover:file:bg-slate-700"
              />

              {file && (
                <div className="mt-3 rounded-xl bg-slate-800 p-3">
                  <p className="break-all font-medium">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(
                      2
                    )}{" "}
                    MB
                  </p>
                </div>
              )}
            </div>

            {/* THUMBNAIL */}

            <div>
              <label className="mb-3 flex items-center gap-2 font-medium">
                <Upload
                  size={18}
                />
                Thumbnail
                <span className="text-xs text-slate-500">
                  Optional
                </span>
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
                className="block w-full cursor-pointer text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-400 hover:file:bg-slate-700"
              />

              {thumbnailPreview && (
                <img
                  src={
                    thumbnailPreview
                  }
                  alt="Thumbnail preview"
                  className="mt-5 h-44 w-full rounded-2xl object-cover"
                />
              )}
            </div>

            {/* UPLOAD BUTTON */}

            <button
              type="submit"
              disabled={
                uploading ||
                loadingCategories ||
                categories.length === 0
              }
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-cyan-600 font-semibold transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload
                    size={18}
                  />
                  Upload Document
                </>
              )}
            </button>
          </motion.form>

          {/* ===================================================
              DOCUMENT LIST
          =================================================== */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >
            {/* SEARCH / FILTER */}

            <div className="mb-6 flex flex-col gap-4 xl:flex-row">

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search documents..."
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 pl-11 pr-4 outline-none transition focus:border-cyan-500"
                />
              </div>

              <select
                value={
                  filterCategory
                }
                onChange={(e) =>
                  setFilterCategory(
                    e.target.value
                  )
                }
                className="h-12 rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none xl:w-56"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={
                  refreshDocuments
                }
                disabled={
                  loadingDocuments
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 transition hover:bg-slate-700 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  size={18}
                  className={
                    loadingDocuments
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>

            {/* RESULT COUNT */}

            {!loadingDocuments && (
              <div className="mb-5 text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-300">
                  {
                    filteredDocuments.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-300">
                  {
                    documents.length
                  }
                </span>{" "}
                documents
              </div>
            )}

            {/* LOADING */}

            {loadingDocuments ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2
                  size={40}
                  className="animate-spin text-cyan-400"
                />
              </div>
            ) : filteredDocuments.length ===
              0 ? (
              <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700">
                <FileText
                  size={50}
                  className="mb-3 text-slate-600"
                />

                <p className="text-slate-400">
                  {documents.length ===
                  0
                    ? "No documents found."
                    : "No documents match your search."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">

                {filteredDocuments.map(
                  (doc) => {
                    const thumbnailUrl =
                      resolveAssetUrl(
                        doc.thumbnail_url
                      );

                    const fallbackThumbnail =
                      "https://placehold.co/600x400/020617/38bdf8?text=Document";

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        whileHover={{
                          y: -6,
                        }}
                        className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 transition hover:border-cyan-500/40"
                      >

                        {/* THUMBNAIL */}

                        <div className="aspect-video bg-slate-900">
                          <img
                            src={
                              thumbnailUrl ||
                              fallbackThumbnail
                            }
                            alt={
                              doc.title
                            }
                            className="h-full w-full object-cover"
                            onError={(
                              event
                            ) => {
                              if (
                                event
                                  .currentTarget
                                  .src !==
                                fallbackThumbnail
                              ) {
                                event.currentTarget.src =
                                  fallbackThumbnail;
                              }
                            }}
                          />
                        </div>

                        {/* CONTENT */}

                        <div className="p-5">

                          <h3 className="line-clamp-2 text-lg font-bold text-white">
                            {
                              doc.title
                            }
                          </h3>

                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                            {doc.description ||
                              "No description available."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">

                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                              {doc.category ||
                                "General"}
                            </span>

                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                              {(
                                doc.file_type ||
                                "file"
                              ).toUpperCase()}
                            </span>

                            {doc.file_size && (
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                {(
                                  Number(
                                    doc.file_size
                                  ) /
                                  1024 /
                                  1024
                                ).toFixed(
                                  2
                                )}{" "}
                                MB
                              </span>
                            )}

                          </div>

                          <div className="mt-6 flex items-center justify-between">

                            <button
                              type="button"
                              onClick={() =>
                                openDocument(
                                  doc.file_url
                                )
                              }
                              disabled={
                                !doc.file_url
                              }
                              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <ExternalLink
                                size={16}
                              />
                              Open
                            </button>

                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(
                                    doc
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/20"
                                title="Edit Document"
                              >
                                <Edit3
                                  size={18}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    doc
                                  )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                                title="Delete Document"
                              >
                                <Trash2
                                  size={18}
                                />
                              </button>

                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                )}

              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* =======================================================
          EDIT MODAL
      ======================================================= */}

      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl"
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">

              <div>
                <h3 className="text-xl font-bold">
                  Edit Document
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Update document
                  information or
                  replace its files.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingDoc(
                    null
                  )
                }
                className="rounded-xl bg-slate-800 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleUpdate
              }
              className="mt-4 max-h-[75vh] space-y-4 overflow-y-auto pr-1"
            >

              {/* TITLE */}

              <div>
                <label className="mb-2 block font-medium">
                  Title
                </label>

                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) =>
                    setEditTitle(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none focus:border-cyan-500"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block font-medium">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={
                    editDescription
                  }
                  onChange={(e) =>
                    setEditDescription(
                      e.target
                        .value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none focus:border-cyan-500"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block font-medium">
                  Category
                </label>

                <select
                  value={
                    editCategory
                  }
                  onChange={(e) =>
                    setEditCategory(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none"
                >
                  {categories.map(
                    (cat) => (
                      <option
                        key={
                          cat.id
                        }
                        value={
                          cat.id
                        }
                      >
                        {cat.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* REPLACE FILE */}

              <div>
                <label className="mb-2 block font-medium">
                  Replace Document
                  File
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    Optional
                  </span>
                </label>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={(e) =>
                    setEditFile(
                      e.target
                        .files?.[0] ||
                        null
                    )
                  }
                  className="w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-400 hover:file:bg-slate-700"
                />

                {editFile && (
                  <p className="mt-2 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
                    {editFile.name}
                  </p>
                )}
              </div>

              {/* REPLACE THUMBNAIL */}

              <div>
                <label className="mb-2 block font-medium">
                  Replace
                  Thumbnail
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    Optional
                  </span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditThumbnail(
                      e.target
                        .files?.[0] ||
                        null
                    )
                  }
                  className="w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-400 hover:file:bg-slate-700"
                />

                {editThumbnailPreview && (
                  <img
                    src={
                      editThumbnailPreview
                    }
                    alt="New thumbnail preview"
                    className="mt-4 h-40 w-full rounded-2xl object-cover"
                  />
                )}
              </div>

              {/* BUTTONS */}

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setEditingDoc(
                      null
                    )
                  }
                  disabled={
                    updating
                  }
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold transition hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    updating
                  }
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {updating && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {updating
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}