// src/admin/pages/DocumentsAdmin.jsx

import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function DocumentsAdmin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  // ===========================
  // FETCH CATEGORIES
  // ===========================
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("course_categories")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
      if (data?.length) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ===========================
  // FETCH DOCUMENTS
  // ===========================
  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          course_categories (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // ===========================
  // SEARCH + FILTER
  // ===========================
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title?.toLowerCase().includes(search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(search.toLowerCase()) ||
        doc.category?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || doc.category_id === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [documents, search, filterCategory]);

  // ===========================
  // DASHBOARD STATS
  // ===========================
  const stats = useMemo(() => {
    const total = documents.length;
    const totalCategories = new Set(documents.map((d) => d.category)).size;
    const pdfs = documents.filter((d) => d.file_type === "pdf").length;
    const images = documents.filter((d) => d.thumbnail_url).length;

    return { total, totalCategories, pdfs, images };
  }, [documents]);

  // ===========================
  // UPLOAD DOCUMENT
  // ===========================
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Enter document title");
      return;
    }
    if (!selectedCategory) {
      alert("Select a category");
      return;
    }
    if (!file) {
      alert("Choose a file");
      return;
    }

    try {
      setUploading(true);

      const extension = file.name.split(".").pop().toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

      // Upload Document to Storage
      const { error: uploadError } = await supabase.storage
        .from("course-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Public URL for Document
      const { data: publicData } = supabase.storage
        .from("course-documents")
        .getPublicUrl(fileName);

      const publicUrl = publicData.publicUrl;

      // Optional Thumbnail Upload
      let thumbnailUrl = "";

      if (thumbnail) {
        const thumbExtension = thumbnail.name.split(".").pop().toLowerCase();
        const thumbName = `thumb-${Date.now()}-${Math.random().toString(36).substring(2)}.${thumbExtension}`;

        const { error: thumbError } = await supabase.storage
          .from("course-thumbnails")
          .upload(thumbName, thumbnail);

        if (thumbError) throw thumbError;

        const { data: thumbPublicData } = supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(thumbName);

        thumbnailUrl = thumbPublicData.publicUrl;
      } else if (file.type.startsWith("image/")) {
        thumbnailUrl = publicUrl;
      }

      const category = categories.find((item) => item.id === selectedCategory);

      // Save document in Database
      const { error: databaseError } = await supabase.from("documents").insert([
        {
          title: title.trim(),
          description: description.trim(),
          category_id: selectedCategory,
          category: category?.name,
          file_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          file_type: extension,
          created_at: new Date(),
        },
      ]);

      if (databaseError) throw databaseError;

      await fetchDocuments();

      setTitle("");
      setDescription("");
      setFile(null);
      setThumbnail(null);

      alert("Document uploaded successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // ===========================
  // DELETE DOCUMENT
  // ===========================
  const handleDelete = async (doc) => {
    const confirmDelete = window.confirm("Delete this document?");
    if (!confirmDelete) return;

    try {
      const fileName = decodeURIComponent(doc.file_url.split("/").pop());

      await supabase.storage.from("course-documents").remove([fileName]);

      if (doc.thumbnail_url && doc.thumbnail_url.includes("course-thumbnails")) {
        const thumbName = decodeURIComponent(doc.thumbnail_url.split("/").pop());
        await supabase.storage.from("course-thumbnails").remove([thumbName]);
      }

      const { error } = await supabase.from("documents").delete().eq("id", doc.id);

      if (error) throw error;

      await fetchDocuments();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // ===========================
  // OPEN DOCUMENT
  // ===========================
  const openDocument = (url) => {
    window.open(url, "_blank");
  };

  // ===========================
  // UI
  // ===========================
  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black">Document Manager</h1>
          <p className="mt-2 text-slate-400">
            Upload, organize and manage all course documents.
          </p>
        </motion.div>

        {/* Statistics */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <BarChart3 className="mb-4 text-cyan-400" />
            <p className="text-sm text-slate-400">Total Documents</p>
            <h2 className="mt-2 text-3xl font-black">{stats.total}</h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <FolderOpen className="mb-4 text-yellow-400" />
            <p className="text-sm text-slate-400">Categories</p>
            <h2 className="mt-2 text-3xl font-black">{stats.totalCategories}</h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <FileText className="mb-4 text-red-400" />
            <p className="text-sm text-slate-400">PDF Files</p>
            <h2 className="mt-2 text-3xl font-black">{stats.pdfs}</h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <Files className="mb-4 text-emerald-400" />
            <p className="text-sm text-slate-400">With Thumbnails</p>
            <h2 className="mt-2 text-3xl font-black">{stats.images}</h2>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[430px_1fr]">
          {/* Upload Form */}
          <motion.form
            onSubmit={handleUpload}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-6"
          >
            <h2 className="text-xl font-bold">Upload Document</h2>

            {/* Title */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-medium">
                <FileText size={18} />
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none focus:border-cyan-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-medium">
                <AlignLeft size={18} />
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 outline-none resize-none focus:border-cyan-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 flex items-center gap-2 font-medium">
                <Tag size={18} />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 outline-none"
              >
                {loadingCategories ? (
                  <option>Loading...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Document File */}
            <div>
              <label className="mb-3 flex items-center gap-2 font-medium">
                <FolderOpen size={18} />
                Document File
              </label>
              <input
                type="file"
                accept=".pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="mb-3 flex items-center gap-2 font-medium">
                <Upload size={18} />
                Thumbnail (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
              />

              {thumbnail && (
                <img
                  src={URL.createObjectURL(thumbnail)}
                  alt="Preview"
                  className="mt-4 h-40 w-full rounded-2xl object-cover"
                />
              )}
            </div>

            {/* UPLOAD BUTTON */}
            <button
              type="submit"
              disabled={uploading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-cyan-600 font-semibold transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
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

          {/* DOCUMENT LIST */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-3.5 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents..."
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800 pl-11 pr-4 outline-none"
                />
              </div>

              <button
                onClick={fetchDocuments}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 transition hover:bg-slate-700"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {loadingDocuments ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="animate-spin text-cyan-400" size={40} />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-400">
                <FileText size={48} className="mb-2 text-slate-600" />
                <p>No documents found.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 transition hover:border-cyan-500/40"
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
                      <h3 className="text-lg font-bold text-white">{doc.title}</h3>

                      <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                        {doc.description || "No description provided."}
                      </p>

                      <div className="mt-4 inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                        {doc.course_categories?.name ||
                          doc.category ||
                          "Uncategorized"}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <button
                          onClick={() => openDocument(doc.file_url)}
                          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold transition hover:bg-cyan-500"
                        >
                          <ExternalLink size={16} />
                          Open
                        </button>

                        <button
                          onClick={() => handleDelete(doc)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}