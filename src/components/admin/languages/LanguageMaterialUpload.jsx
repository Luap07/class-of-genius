import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  X,
  PlusCircle,
  Loader2,
  Upload,
  FolderOpen,
  Trash2,
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
  const [type, setType] = useState("video");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Tab state: "upload" or "existing"
  const [activeTab, setActiveTab] = useState("upload");

  const languageId = language?.id;

  useEffect(() => {
    if (languageId && open) {
      fetchMaterials();
    }
  }, [languageId, open]);

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

  const uploadFile = async () => {
    if (!file) return null;

    const extension = file.name.split(".").pop();
    const fileName = `${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("language-materials")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("language-materials")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!languageId) {
      console.error("No language selected", language);
      return;
    }

    if (!file) {
      alert("Select a file first");
      return;
    }

    try {
      setUploading(true);

      const fileUrl = await uploadFile();

      const { error } = await supabase.from("language_materials").insert([
        {
          language_id: languageId,
          title,
          description,
          type,
          file_url: fileUrl,
        },
      ]);

      if (error) throw error;

      setTitle("");
      setDescription("");
      setFile(null);

      fetchMaterials();

      if (onUploaded) onUploaded();
      
      // Automatically switch to existing files tab so they can see it
      setActiveTab("existing");
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId, fileUrl) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      setDeletingId(materialId);

      if (fileUrl) {
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
              Upload new resources or view existing files for this language.
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
            New Upload
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
            <div className="rounded-3xl border border-white/10 bg-[#1f2937]/50 p-6">
              <h3 className="mb-5 text-xl font-black text-white">Upload New Material</h3>

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

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mb-4 w-full rounded-2xl border border-white/10 bg-[#1f2937] px-4 py-3 text-white outline-none focus:border-indigo-500"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
              </select>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mb-5 text-sm text-gray-300 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500"
              />

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {uploading ? "Uploading..." : "Upload Material"}
              </button>
            </div>
          ) : (
            /* Existing Materials View */
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">Existing Files</h3>
              {materials.length === 0 ? (
                <p className="text-sm text-gray-400">No materials uploaded yet for this language.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#1f2937]/30 p-5"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-lg font-bold text-white">{material.title}</h4>
                          <button
                            type="button"
                            onClick={() => handleDelete(material.id, material.file_url)}
                            disabled={deletingId === material.id}
                            className="rounded-xl bg-white/5 p-2 text-gray-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            {deletingId === material.id ? (
                              <Loader2 size={16} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>

                        <p className="mt-2 text-sm text-gray-400">{material.description}</p>

                        {material.type === "video" && (
                          <video
                            controls
                            className="mt-4 w-full rounded-2xl border border-white/10"
                          >
                            <source src={material.file_url} type="video/mp4" />
                          </video>
                        )}

                        {material.type === "pdf" && (
                          <a
                            href={material.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-block text-sm font-semibold text-indigo-400 hover:underline"
                          >
                            Open PDF Document
                          </a>
                        )}

                        {material.type === "audio" && (
                          <audio controls className="mt-4 w-full">
                            <source src={material.file_url} />
                          </audio>
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