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

import { supabase } from "../lib/supabaseClient";

export default function DocumentsAdmin() {
  /* ==========================================
     FORM STATES
  ========================================== */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  /* ==========================================
     EDIT STATES
  ========================================== */

  const [editingDoc, setEditingDoc] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [updating, setUpdating] = useState(false);

  /* ==========================================
     DATA STATES
  ========================================== */

  const [categories, setCategories] = useState([]);

  const [documents, setDocuments] = useState([]);

  /* ==========================================
     FILTER STATES
  ========================================== */

  const [search, setSearch] = useState("");

  const [filterCategory, setFilterCategory] =
    useState("all");

  /* ==========================================
     LOADING STATES
  ========================================== */

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  /* ==========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  /* ==========================================
     FETCH CATEGORIES
  ========================================== */

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const {
        data,
        error,
      } = await supabase
        .from("course_categories")
        .select("*")
        .eq("active", true)
        .order("display_order", {
          ascending: true,
        });

      if (error) throw error;

      setCategories(data || []);

      if (data?.length) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error(
        "CATEGORY ERROR:",
        err
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  /* ==========================================
     FETCH DOCUMENTS
  ========================================== */

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const {
        data,
        error,
      } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setDocuments(data || []);
    } catch (err) {
      console.error(
        "DOCUMENT FETCH ERROR:",
        err
      );

      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  /* ==========================================
     FILTER DOCUMENTS
  ========================================== */

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const keyword = search
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
        filterCategory === "all" ||
        String(doc.category_id) ===
          String(filterCategory);

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    documents,
    search,
    filterCategory,
  ]);

  /* ==========================================
     DASHBOARD STATS
  ========================================== */

  const stats = useMemo(() => {
    return {
      total: documents.length,

      totalCategories:
        new Set(
          documents.map(
            (doc) => doc.category_id
          )
        ).size,

      pdfs: documents.filter(
        (doc) =>
          doc.file_type
            ?.toLowerCase() === "pdf"
      ).length,

      images: documents.filter(
        (doc) => doc.thumbnail_url
      ).length,
    };
  }, [documents]);

  /* ==========================================
     UPLOAD DOCUMENT
  ========================================== */

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a document title.");
      return;
    }

    if (!selectedCategory) {
      alert("Please select a category.");
      return;
    }

    if (!file) {
      alert("Please choose a document.");
      return;
    }

    try {
      setUploading(true);

      const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

      const documentName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("course-documents")
        .upload(
          documentName,
          file,
          {
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: documentUrlData,
      } = supabase.storage
        .from("course-documents")
        .getPublicUrl(documentName);

      const documentUrl =
        documentUrlData.publicUrl;

      let thumbnailUrl = "";

      if (thumbnail) {
        const thumbExtension =
          thumbnail.name
            .split(".")
            .pop()
            .toLowerCase();

        const thumbnailName =
          `thumb-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${thumbExtension}`;

        const {
          error: thumbnailError,
        } = await supabase.storage
          .from("course-thumbnails")
          .upload(
            thumbnailName,
            thumbnail,
            {
              upsert: false,
            }
          );

        if (thumbnailError) {
          throw thumbnailError;
        }

        const {
          data: thumbnailData,
        } = supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(
            thumbnailName
          );

        thumbnailUrl =
          thumbnailData.publicUrl;
      } else if (
        file.type.startsWith(
          "image/"
        )
      ) {
        thumbnailUrl =
          documentUrl;
      }

      const category =
        categories.find(
          (item) =>
            String(item.id) ===
            String(
              selectedCategory
            )
        );

      const {
        error: insertError,
      } = await supabase
        .from("documents")
        .insert([
          {
            title:
              title.trim(),

            description:
              description.trim(),

            category_id:
              selectedCategory,

            category:
              category?.name ||
              "",

            file_url:
              documentUrl,

            thumbnail_url:
              thumbnailUrl,

            file_type:
              extension,

            file_size:
              file.size,

            created_at:
              new Date()
                .toISOString(),
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      await fetchDocuments();

      setTitle("");
      setDescription("");
      setFile(null);
      setThumbnail(null);

      if (categories.length) {
        setSelectedCategory(
          categories[0].id
        );
      }

      alert(
        "Document uploaded successfully."
      );
    } catch (err) {
      console.error(
        "UPLOAD ERROR:",
        err
      );

      alert(
        err.message ||
          "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  /* ==========================================
     START EDITING DOCUMENT
  ========================================== */

  const startEditing = (doc) => {
    setEditingDoc(doc);
    setEditTitle(doc.title || "");
    setEditDescription(doc.description || "");
    setEditCategory(doc.category_id || "");
    setEditFile(null);
    setEditThumbnail(null);
  };

  /* ==========================================
     UPDATE DOCUMENT
  ========================================== */

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;

    if (!editTitle.trim()) {
      alert("Please enter a title.");
      return;
    }

    try {
      setUpdating(true);

      let documentUrl = editingDoc.file_url;
      let extension = editingDoc.file_type;
      let fileSize = editingDoc.file_size;

      // If a new document file is uploaded
      if (editFile) {
        extension = editFile.name.split(".").pop().toLowerCase();
        const documentName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
        
        const { error: uploadErr } = await supabase.storage
          .from("course-documents")
          .upload(documentName, editFile, { upsert: false });

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("course-documents")
          .getPublicUrl(documentName);

        documentUrl = urlData.publicUrl;
        fileSize = editFile.size;
      }

      let thumbnailUrl = editingDoc.thumbnail_url;

      // If a new thumbnail is uploaded
      if (editThumbnail) {
        const thumbExtension = editThumbnail.name.split(".").pop().toLowerCase();
        const thumbnailName = `thumb-${Date.now()}-${Math.random().toString(36).substring(2)}.${thumbExtension}`;

        const { error: thumbErr } = await supabase.storage
          .from("course-thumbnails")
          .upload(thumbnailName, editThumbnail, { upsert: false });

        if (thumbErr) throw thumbErr;

        const { data: thumbData } = supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(thumbnailName);

        thumbnailUrl = thumbData.publicUrl;
      }

      const selectedCatObj = categories.find(
        (item) => String(item.id) === String(editCategory)
      );

      const { error: updateError } = await supabase
        .from("documents")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim(),
          category_id: editCategory,
          category: selectedCatObj?.name || editingDoc.category,
          file_url: documentUrl,
          thumbnail_url: thumbnailUrl,
          file_type: extension,
          file_size: fileSize,
        })
        .eq("id", editingDoc.id);

      if (updateError) throw updateError;

      await fetchDocuments();
      setEditingDoc(null);
      alert("Document updated successfully.");
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert(err.message || "Failed to update document.");
    } finally {
      setUpdating(false);
    }
  };

  /* ==========================================
     DELETE DOCUMENT
  ========================================== */

  const handleDelete = async (doc) => {
    const confirmed = window.confirm(
      `Delete "${doc.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      if (doc.file_url) {
        const fileName = decodeURIComponent(
          doc.file_url.split("/").pop()
        );

        await supabase.storage
          .from("course-documents")
          .remove([fileName]);
      }

      if (
        doc.thumbnail_url &&
        doc.thumbnail_url.includes(
          "course-thumbnails"
        )
      ) {
        const thumbnailName =
          decodeURIComponent(
            doc.thumbnail_url
              .split("/")
              .pop()
          );

        await supabase.storage
          .from("course-thumbnails")
          .remove([thumbnailName]);
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      setDocuments((prev) =>
        prev.filter(
          (item) => item.id !== doc.id
        )
      );

      alert(
        "Document deleted successfully."
      );
    } catch (err) {
      console.error(
        "DELETE ERROR:",
        err
      );

      alert(
        err.message ||
          "Unable to delete document."
      );
    }
  };

  /* ==========================================
     VIEW / OPEN CONTENT (PDF Viewer)
  ========================================== */

  const openDocument = (url) => {
    if (!url) {
      alert("Document URL not found.");
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ==========================================
     REFRESH DOCUMENTS
  ========================================== */

  const refreshDocuments =
    async () => {
      await fetchDocuments();
    };

   return (
    <div className="min-h-screen bg-[#020617] p-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* ===========================
            PAGE HEADER
        =========================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black">
            Document Manager
          </h1>

          <p className="mt-2 text-slate-400">
            Upload, organize and manage all course learning materials.
          </p>
        </motion.div>

        {/* ===========================
            STATISTICS
        =========================== */}

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

        {/* ===========================
            MAIN GRID
        =========================== */}

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">

          {/* ===========================
              UPLOAD FORM
          =========================== */}

          <motion.form
            onSubmit={handleUpload}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 h-fit"
          >

            <h2 className="text-xl font-bold">
              Upload Document
            </h2>

            {/* TITLE */}

            <div>

              <label className="mb-2 flex items-center gap-2 font-medium">
                <FileText size={18} />
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Document title..."
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none transition focus:border-cyan-500"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="mb-2 flex items-center gap-2 font-medium">
                <AlignLeft size={18} />
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
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
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none"
              >

                {loadingCategories ? (

                  <option>
                    Loading...
                  </option>

                ) : (

                  categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))

                )}

              </select>

            </div>

            {/* DOCUMENT FILE */}

            <div>

              <label className="mb-3 flex items-center gap-2 font-medium">
                <FolderOpen size={18} />
                Document File
              </label>

              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
                className="
                  block
                  w-full
                  cursor-pointer
                  text-sm
                  text-slate-400
                  file:mr-4
                  file:rounded-xl
                  file:border-0
                  file:bg-slate-800
                  file:px-4
                  file:py-2
                  file:text-sm
                  file:font-semibold
                  file:text-cyan-400
                  hover:file:bg-slate-700
                "
              />

              {file && (
                <div className="mt-3 rounded-xl bg-slate-800 p-3">

                  <p className="font-medium">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                </div>
              )}

            </div>

            {/* THUMBNAIL */}

            <div>

              <label className="mb-3 flex items-center gap-2 font-medium">
                <Upload size={18} />
                Thumbnail (Optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(e.target.files[0])
                }
                className="
                  block
                  w-full
                  cursor-pointer
                  text-sm
                  text-slate-400
                  file:mr-4
                  file:rounded-xl
                  file:border-0
                  file:bg-slate-800
                  file:px-4
                  file:py-2
                  file:text-sm
                  file:font-semibold
                  file:text-cyan-400
                  hover:file:bg-slate-700
                "
              />

              {thumbnail && (
                <img
                  src={URL.createObjectURL(thumbnail)}
                  alt="Preview"
                  className="
                    mt-5
                    h-44
                    w-full
                    rounded-2xl
                    object-cover
                  "
                />
              )}

            </div>

            {/* UPLOAD BUTTON */}

            <button
              type="submit"
              disabled={uploading}
              className="
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-cyan-600
                font-semibold
                transition
                hover:bg-cyan-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
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
                  <Upload size={18} />
                  Upload Document
                </>
              )}

            </button>

          </motion.form>

          {/* ===========================
              DOCUMENT LIST
          =========================== */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
            "
          >

            {/* SEARCH */}

            <div className="mb-6 flex items-center gap-4">

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="
                    absolute
                    left-4
                    top-3.5
                    text-slate-500
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search documents..."
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-800
                    pl-11
                    pr-4
                    outline-none
                    transition
                    focus:border-cyan-500
                  "
                />

              </div>

              <button
                onClick={refreshDocuments}
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-800
                  transition
                  hover:bg-slate-700
                "
              >
                <RefreshCw size={18} />
              </button>

            </div>

            {loadingDocuments ? (

              <div className="flex h-72 items-center justify-center">

                <Loader2
                  size={40}
                  className="animate-spin text-cyan-400"
                />

              </div>

            ) : filteredDocuments.length === 0 ? (

              <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700">

                <FileText
                  size={50}
                  className="mb-3 text-slate-600"
                />

                <p className="text-slate-400">
                  No documents found.
                </p>

              </div>

            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {filteredDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6 }}
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-800
                      bg-slate-950
                      transition
                      hover:border-cyan-500/40
                    "
                  >

                    {/* THUMBNAIL */}

                    <div className="aspect-video bg-slate-900">

                      <img
                        src={
                          doc.thumbnail_url ||
                          "https://placehold.co/600x400/020617/38bdf8?text=Document"
                        }
                        alt={doc.title}
                        className="h-full w-full object-cover"
                      />

                    </div>

                    {/* CONTENT */}

                    <div className="p-5">

                      <h3 className="text-lg font-bold text-white">
                        {doc.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                        {doc.description || "No description available."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                          {doc.category || "General"}
                        </span>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {(doc.file_type || "file").toUpperCase()}
                        </span>

                        {doc.file_size && (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}

                      </div>

                      <div className="mt-6 flex items-center justify-between">

                        <button
                          onClick={() =>
                            openDocument(doc.file_url)
                          }
                          className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-cyan-600
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            transition
                            hover:bg-cyan-500
                          "
                        >
                          <ExternalLink size={16} />
                          Open
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(doc)}
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              bg-amber-500/10
                              text-amber-400
                              transition
                              hover:bg-amber-500/20
                            "
                            title="Edit Document"
                          >
                            <Edit3 size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(doc)
                            }
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              bg-red-500/10
                              text-red-400
                              transition
                              hover:bg-red-500/20
                            "
                            title="Delete Document"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                      </div>

                    </div>

                  </motion.div>
                ))}

              </div>

            )}

          </motion.div>

        </div>

      </div>

      {/* ===========================
          EDIT DOCUMENT MODAL
      =========================== */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold">Edit Document</h3>
              <button
                onClick={() => setEditingDoc(null)}
                className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="mb-2 block font-medium">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium">Replace Document File (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={(e) => setEditFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-400 hover:file:bg-slate-700"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Replace Thumbnail (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditThumbnail(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-400 hover:file:bg-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold transition hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {updating && <Loader2 size={16} className="animate-spin" />}
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}