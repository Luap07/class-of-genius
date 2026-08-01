import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  X,
  PlusCircle,
  Loader2,
  Upload,
  FolderOpen,
  Trash2,
  Video,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

export default function LanguageMaterialUpload({
  language,
  open = true,
  onClose,
  onUploaded,
}) {
  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Material Category: "video_upload" | "youtube" | "pdf"
  const [materialCategory, setMaterialCategory] = useState("video_upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);

  // Region / Flag & Cover Image fields
  const [region, setRegion] = useState("");
  const [flagImage, setFlagImage] = useState(null);
  const [flagPreview, setFlagPreview] = useState("");
  const flagFileRef = useRef(null);

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const coverFileRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Tab state: "upload" or "existing"
  const [activeTab, setActiveTab] = useState("upload");

  const languageId = language?.id;

  // Sync state when language changes or modal opens (handles edit vs new upload resetting/pre-filling correctly)
  useEffect(() => {
    if (languageId && open) {
      fetchMaterials();
      setRegion(language?.region || language?.country || "");
      
      const existingFlag = language?.flag_url || language?.flag || "";
      const existingCover = language?.cover_url || language?.cover_image || language?.image || "";
      
      setFlagPreview(existingFlag);
      setCoverPreview(existingCover);
      setFlagImage(null);
      setCoverImage(null);
      if (flagFileRef.current) flagFileRef.current.value = "";
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  }, [languageId, open, language]);

  const fetchMaterials = async () => {
    if (!languageId) return;

    const { data, error } = await supabase
      .from("language_materials")
      .select("*")
      .eq("language_id", languageId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Fetch materials:", error);
      return;
    }

    setMaterials(data || []);
  };

  const uploadFileToStorage = async (targetFile, bucket = "language-materials") => {
    if (!targetFile) return null;
    if (typeof targetFile === "string") return targetFile; // If it's already a URL string

    const extension = targetFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, targetFile);

    if (error) throw error;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!languageId) {
      console.error("No language selected", language);
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title for the material.");
      return;
    }

    if (materialCategory === "youtube" && !youtubeUrl.trim()) {
      alert("Please enter a YouTube link.");
      return;
    }

    if ((materialCategory === "video_upload" || materialCategory === "pdf") && !file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);

      let finalFileUrl = "";
      let dbType = "video";

      if (materialCategory === "youtube") {
        finalFileUrl = youtubeUrl.trim();
        dbType = "youtube";
      } else if (materialCategory === "video_upload") {
        finalFileUrl = await uploadFileToStorage(file, "language-materials");
        dbType = "video";
      } else if (materialCategory === "pdf") {
        finalFileUrl = await uploadFileToStorage(file, "language-materials");
        dbType = "pdf";
      }

      // Also optionally upload/update region, flag, and cover image if columns exist in language table
      let flagUrl = flagPreview;
      if (flagImage instanceof File) {
        flagUrl = await uploadFileToStorage(flagImage, "language-materials");
      }

      let coverUrl = coverPreview;
      if (coverImage instanceof File) {
        coverUrl = await uploadFileToStorage(coverImage, "language-materials");
      }

      // Update language metadata if region/flag/cover changed
      await supabase
        .from("languages")
        .update({
          region: region,
          flag_url: flagUrl,
          cover_url: coverUrl,
        })
        .eq("id", languageId);

      const { error } = await supabase.from("language_materials").insert([
        {
          language_id: languageId,
          title,
          description,
          type: dbType,
          file_url: finalFileUrl,
        },
      ]);

      if (error) throw error;

      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      setFile(null);
      setMaterialCategory("video_upload");

      fetchMaterials();

      if (onUploaded) onUploaded();
      
      setActiveTab("existing");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to save material. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId, fileUrl, materialType) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      setDeletingId(materialId);

      if (fileUrl && materialType !== "youtube") {
        try {
          const urlParts = fileUrl.split("/language-materials/");
          if (urlParts.length > 1) {
            const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
            await supabase.storage.from("language-materials").remove([filePath]);
          }
        } catch (storageErr) {
          console.warn("Storage file cleanup warning:", storageErr);
        }
      }

      const { error: dbError } = await supabase
        .from("language_materials")
        .delete()
        .eq("id", materialId);

      if (dbError) throw dbError;

      setMaterials((prev) => prev.filter((item) => item.id !== materialId));

      if (onUploaded) onUploaded();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete material. Check console for details.");
    } finally {
      setDeletingId(null);
    }
  };

  const getEmbedUrl = (url) => {
    try {
      if (!url) return "";
      if (url.includes("embed/")) return url;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}`
        : url;
    } catch {
      return url;
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#111827] px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              Manage Materials - {language?.language_name || language?.name || "Language"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Upload local video files, documents, link YouTube videos, and configure region, flag, & cover image.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="rounded-xl bg-white/10 p-3 transition hover:bg-red-500 cursor-pointer"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#111827] px-8">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 border-b-2 px-6 py-4 font-bold transition ${
              activeTab === "upload"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <PlusCircle size={18} />
            New Upload / Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("existing")}
            className={`flex items-center gap-2 border-b-2 px-6 py-4 font-bold transition ${
              activeTab === "existing"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <FolderOpen size={18} />
            Existing Files ({materials.length})
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-8">
          {activeTab === "upload" ? (
            /* Upload Form View */
            <div className="space-y-6">
              {/* Region & Images Configuration Section */}
              <div className="rounded-3xl border border-white/10 bg-[#1f2937]/50 p-6 space-y-4">
                <h3 className="text-xl font-black text-white">Language Details & Assets</h3>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-300">Region / Country</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. West Africa, East Asia, Europe"
                    className="w-full rounded-2xl border border-white/10 bg-[#1f2937] px-4 py-3 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Flag Image Upload */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-300">Flag Image</label>
                    <div className="rounded-2xl border border-dashed border-white/20 bg-[#1f2937] p-4 text-center">
                      {flagPreview ? (
                        <div className="relative flex justify-center">
                          <img
                            src={flagPreview}
                            alt="Flag Preview"
                            className="h-24 w-24 rounded-xl object-cover border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFlagImage(null);
                              setFlagPreview("");
                              if (flagFileRef.current) flagFileRef.current.value = "";
                            }}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => flagFileRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center gap-2 py-4 text-gray-400 hover:text-white cursor-pointer"
                        >
                          <ImageIcon size={24} className="text-indigo-400" />
                          <span className="text-xs font-bold">Upload Flag</span>
                        </button>
                      )}
                      <input
                        ref={flagFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setFlagImage(f);
                            setFlagPreview(URL.createObjectURL(f));
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-300">Cover Image</label>
                    <div className="rounded-2xl border border-dashed border-white/20 bg-[#1f2937] p-4 text-center">
                      {coverPreview ? (
                        <div className="relative flex justify-center">
                          <img
                            src={coverPreview}
                            alt="Cover Preview"
                            className="h-24 w-24 rounded-xl object-cover border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImage(null);
                              setCoverPreview("");
                              if (coverFileRef.current) coverFileRef.current.value = "";
                            }}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverFileRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center gap-2 py-4 text-gray-400 hover:text-white cursor-pointer"
                        >
                          <ImageIcon size={24} className="text-indigo-400" />
                          <span className="text-xs font-bold">Upload Cover</span>
                        </button>
                      )}
                      <input
                        ref={coverFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setCoverImage(f);
                            setCoverPreview(URL.createObjectURL(f));
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Resource Upload Form */}
              <div className="rounded-3xl border border-white/10 bg-[#1f2937]/50 p-6">
                <h3 className="mb-5 text-xl font-black text-white">Add New Learning Material</h3>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Material title"
                  className="mb-4 w-full rounded-2xl border border-white/10 bg-[#1f2937] px-4 py-3 text-white outline-none focus:border-indigo-500"
                />

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="mb-4 w-full resize-none rounded-2xl border border-white/10 bg-[#1f2937] px-4 py-3 text-white outline-none focus:border-indigo-500"
                  rows={3}
                />

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Material Category</label>
                  <select
                    value={materialCategory}
                    onChange={(e) => {
                      setMaterialCategory(e.target.value);
                      setFile(null);
                      setYoutubeUrl("");
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-[#1f2937] px-4 py-3 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="video_upload">Local Video File (MP4/WebM)</option>
                    <option value="youtube">YouTube Video Link</option>
                    <option value="pdf">PDF Document</option>
                  </select>
                </div>

                {materialCategory === "youtube" ? (
                  <div className="mb-5">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Paste YouTube Link (e.g. https://www.youtube.com/watch?v=...)"
                      className="w-full rounded-2xl border border-white/10 bg-[#1f2937] px-4 py-3 text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="mb-5">
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      {materialCategory === "video_upload" ? "Select Video File" : "Select PDF Document"}
                    </label>
                    <input
                      type="file"
                      accept={materialCategory === "video_upload" ? "video/mp4,video/webm,video/ogg" : "application/pdf"}
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="text-sm text-gray-300 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                  {uploading ? "Saving..." : "Save Material & Details"}
                </button>
              </div>
            </div>
          ) : (
            /* Existing Materials View */
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">Existing Files & Links</h3>
              {materials.length === 0 ? (
                <p className="text-sm text-gray-400">No materials added yet for this language.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#1f2937]/30 p-5"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {material.type === "youtube" ? (
                              <Video className="h-5 w-5 text-red-400" />
                            ) : material.type === "video" ? (
                              <Video className="h-5 w-5 text-indigo-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-cyan-400" />
                            )}
                            <h4 className="text-lg font-bold text-white">{material.title}</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(material.id, material.file_url, material.type)}
                            disabled={deletingId === material.id}
                            className="rounded-xl bg-white/5 p-2 text-gray-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === material.id ? (
                              <Loader2 size={16} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>

                        {material.description && (
                          <p className="mt-2 text-sm text-gray-400">{material.description}</p>
                        )}

                        {/* Local Video Player */}
                        {material.type === "video" && (
                          <video
                            controls
                            className="mt-4 w-full rounded-2xl border border-white/10 bg-black aspect-video object-contain"
                          >
                            <source src={material.file_url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}

                        {/* YouTube Embedded Player */}
                        {material.type === "youtube" && (
                          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 aspect-video bg-black">
                            <iframe
                              src={getEmbedUrl(material.file_url)}
                              title={material.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {/* PDF Viewer Link */}
                        {material.type === "pdf" && (
                          <a
                            href={material.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            <FileText size={16} />
                            Open PDF Document
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end border-t border-white/10 bg-[#111827] px-8 py-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="rounded-2xl border border-white/10 px-6 py-2.5 font-semibold text-gray-300 transition hover:bg-white/10 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}