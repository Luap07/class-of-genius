// src/pages/admin/lms/EditResource.jsx

import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const EditResource = () => {
  const navigate = useNavigate();
  const { topicId, resourceId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [oldFile, setOldFile] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "pdf",
    file: null,
    youtube_url: "",
  });

  /* ==============================
     FETCH RESOURCE
  =============================== */
  const fetchResource = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", resourceId)
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setFormData({
      title: data.title || "",
      description: data.description || "",
      resource_type: data.resource_type || "pdf",
      file: null,
      youtube_url: data.youtube_url || "",
    });
    setOldFile(data.file_url || "");
    setLoading(false);
  };

  useEffect(() => {
    fetchResource();
  }, [resourceId]);

  /* ==============================
     HANDLERS
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, file }));
  };

  const getBucket = () => {
    switch (formData.resource_type) {
      case "pdf": return "course-pdfs";
      case "docx": return "course-documents";
      case "video": return "course-videos";
      default: return null;
    }
  };

  const uploadFile = async () => {
    if (!formData.file) return oldFile;
    const bucket = getBucket();
    if (!bucket) return oldFile;

    setUploading(true);
    const fileName = `${Date.now()}-${formData.file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, formData.file);

    if (error) {
      console.error(error);
      alert(error.message);
      setUploading(false);
      return oldFile;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Resource title is required.");

    setSaving(true);
    let fileUrl = oldFile;

    if (formData.file) {
      fileUrl = await uploadFile();
    }

    const { error } = await supabase
      .from("resources")
      .update({
        title: formData.title,
        description: formData.description,
        resource_type: formData.resource_type,
        file_url: fileUrl,
        youtube_url: formData.youtube_url || null,
      })
      .eq("id", resourceId);

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    navigate(`/admin/lms/topic/${topicId}/resources`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Resource</h1>
          <p className="mt-2 text-slate-400">Update course materials and learning content.</p>
        </div>
        <AdminButton
          variant="secondary"
          onClick={() => navigate(`/admin/lms/topic/${topicId}/resources`)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </AdminButton>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">Loading resource...</div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Resource Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              rows={5}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Resource Type</label>
            <select
              name="resource_type"
              value={formData.resource_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="video">Video</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          {oldFile && (
            <div className="rounded-xl bg-slate-950 p-4 text-sm text-slate-400">
              Current File:
              <a href={oldFile} target="_blank" rel="noreferrer" className="ml-2 text-blue-400">Open Resource</a>
            </div>
          )}

          {formData.resource_type !== "youtube" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Replace File (optional)</label>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">
                <Upload size={25} />
                <span>{formData.file ? formData.file.name : "Choose new file"}</span>
                <input type="file" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}

          {formData.resource_type === "youtube" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">YouTube URL</label>
              <input
                type="text"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <AdminButton type="button" variant="secondary" onClick={() => navigate(`/admin/lms/topic/${topicId}/resources`)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving || uploading}>
              {(saving || uploading) ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              {uploading ? "Uploading..." : saving ? "Updating..." : "Update Resource"}
            </AdminButton>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditResource;