// src/pages/admin/novels/NovelEditor.jsx

import React, { useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

// --- REUSABLE COMPONENTS ---
const Input = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block mb-2 text-sm text-slate-400">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
    />
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block mb-2 text-sm text-slate-400">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={6}
      placeholder={placeholder}
      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none resize-none focus:border-blue-500"
    />
  </div>
);

// --- MAIN COMPONENT ---
const defaultForm = {
  title: "",
  genre: "",
  description: "",
  introduction: "",
  cover_url: "",
  status: "Draft",
  chapters: [],
};

const NovelEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  // Load existing novel data if ID is present
  useEffect(() => {
    if (!id) return;

    const fetchNovel = async () => {
      setFetching(true);
      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setForm(data);
        if (data.cover_url) setPreview(data.cover_url);
      }
      setFetching(false);
    };

    fetchNovel();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("covers").upload(fileName, file);
    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("novel-covers").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, cover_url: data.publicUrl }));
    setUploading(false);
  };

  const addChapter = () => {
    setForm((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { title: "", content: "" }],
    }));
  };

  const updateChapter = (index, field, value) => {
    const updated = [...form.chapters];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, chapters: updated }));
  };

  const removeChapter = (index) => {
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Filter out the 'id' field so we don't try to update the primary key
    const { id: _, ...updateData } = form;

    const { error } = id
      ? await supabase.from("novels").update(updateData).eq("id", id)
      : await supabase.from("novels").insert([updateData]);

    if (error) {
      alert(error.message);
    } else {
      navigate("/admin/novels/list");
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-3xl font-bold">{id ? "Edit Novel" : "Create Novel"}</h1>
        <p className="text-slate-400 mt-2">
          {id ? "Update your existing novel." : "Create a brand new novel for your readers."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Cover Upload Section */}
        <div>
          <label className="block mb-3 text-sm text-slate-400">Cover Image</label>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-52 h-72 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-500">
                  <ImageIcon size={55} className="mx-auto mb-3" />
                  <p>No Cover Selected</p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-4">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl inline-flex items-center gap-2 w-fit">
                <Upload size={18} />
                Choose Cover
                <input type="file" accept="image/*" hidden onChange={uploadCover} />
              </label>
              {uploading && <p className="text-blue-400">Uploading image...</p>}
              {form.cover_url && <p className="text-green-400 text-sm">✔ Cover uploaded</p>}
            </div>
          </div>
        </div>

        <Input label="Novel Title" name="title" value={form.title} onChange={handleChange} placeholder="Enter title" />
        <Input label="Genre" name="genre" value={form.genre} onChange={handleChange} placeholder="Fantasy, Romance..." />
        <Textarea label="Introduction" name="introduction" value={form.introduction} onChange={handleChange} placeholder="Write introduction..." />
        <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Write description..." />

        {/* Chapters Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-slate-400">Chapters</label>
            <button type="button" onClick={addChapter} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700">
              <Plus size={18} /> Add Chapter
            </button>
          </div>
          <div className="space-y-5">
            {form.chapters.map((chapter, index) => (
              <div key={index} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Chapter {index + 1}</h3>
                  <button type="button" onClick={() => removeChapter(index)} className="text-red-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input value={chapter.title} onChange={(e) => updateChapter(index, "title", e.target.value)} placeholder="Title..." className="w-full rounded-xl bg-slate-900 px-4 py-3 outline-none" />
                  <textarea rows={5} value={chapter.content} onChange={(e) => updateChapter(index, "content", e.target.value)} placeholder="Content..." className="w-full rounded-xl bg-slate-900 px-4 py-3 outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Submit */}
        <div>
          <label className="mb-2 block text-sm text-slate-400">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl bg-slate-800 px-4 py-3 outline-none">
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>

        <AdminButton type="submit" disabled={loading || uploading}>
          <span className="flex items-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {id ? "Update Novel" : "Save Novel"}
          </span>
        </AdminButton>
      </form>
    </div>
  );
};

export default NovelEditor;