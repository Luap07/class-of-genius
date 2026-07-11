import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Save,
  Image as ImageIcon,
  Award,
  BookOpen,
  Globe,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminButton from "../../../components/admin/ui/AdminButton";
import useEditCourse from "../../../hooks/admin/useEditCourse";

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    course,
    categories,
    preview,
    thumbnail,
    loading,
    saving,
    uploading,
    success,
    error,
    handleChange,
    handleThumbnail,
    handleSave,
  } = useEditCourse(id);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 size={45} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================= ALERTS ================= */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300"
        >
          {error}
        </motion.div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {/* FIXED: Using anonymous function to prevent immediate execution */}
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-4xl font-black">Edit Course</h1>
        </div>

        {/* FIXED: Passing handleSave reference directly */}
        <AdminButton onClick={handleSave} disabled={saving || uploading}>
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Changes"}
        </AdminButton>
      </div>

      {/* ================= FORM FIELDS ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-3 block font-semibold">Course Title</label>
            <input name="title" value={course.title || ""} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          
          <div>
            <label className="mb-3 block font-semibold">Category</label>
            <select name="category_id" value={course.category_id || ""} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
              <option value="">Select Category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-3 block font-semibold">Level</label>
            <select name="level" value={course.level || "Beginner"} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ================= THUMBNAIL ================= */}
      <motion.div className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-7 backdrop-blur-xl">
        <label className="block cursor-pointer">
          {/* The input triggers the handler; label clicking the input is standard React */}
          <input type="file" accept="image/*" hidden onChange={handleThumbnail} />
          {preview ? (
            <img src={preview} alt="Preview" className="h-64 w-full rounded-2xl object-cover" />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 text-slate-500">
              <ImageIcon size={55} />
              <p className="mt-4">Click to upload thumbnail</p>
            </div>
          )}
        </label>
      </motion.div>
    </div>
  );
};

export default EditCourse;