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
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-4xl font-black">Edit Course</h1>
          <p className="mt-2 text-slate-400">
            Update course information, media and publishing settings.
          </p>
        </div>

        <AdminButton onClick={handleSave} disabled={saving || uploading}>
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Changes"}
        </AdminButton>
      </div>

      {/* ================= COURSE INFORMATION ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
            <BookOpen size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Course Information</h2>
            <p className="mt-1 text-slate-400">Manage your course details.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-3 block font-semibold">Course Title</label>
            <input name="title" value={course.title} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" placeholder="Enter course title" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-3 block font-semibold">Slug</label>
            <input name="slug" value={course.slug} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          <div>
            <label className="mb-3 block font-semibold">Instructor</label>
            <input name="instructor" value={course.instructor} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" placeholder="Instructor name" />
          </div>
          <div>
            <label className="mb-3 block font-semibold">Category</label>
            <select name="category_id" value={course.category_id} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-3 block font-semibold">Level</label>
            <select name="level" value={course.level} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="mb-3 block font-semibold">Language</label>
            <input name="language" value={course.language} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          <div>
            <label className="mb-3 block font-semibold">Duration</label>
            <input name="duration" value={course.duration} onChange={handleChange} placeholder="Example: 12 Weeks" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          <div>
            <label className="mb-3 block font-semibold">Lessons</label>
            <input type="number" name="lessons_count" value={course.lessons_count} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          <div>
            <label className="mb-3 block font-semibold">Price</label>
            <input type="number" name="price" value={course.price} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-3 block font-semibold">Description</label>
            <textarea rows="6" name="description" value={course.description} onChange={handleChange} className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-3 block font-semibold">Learning Outcomes</label>
            <textarea rows="5" name="learning_outcomes" value={course.learning_outcomes} onChange={handleChange} placeholder="Students will learn..." className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-3 block font-semibold">Requirements</label>
            <textarea rows="5" name="requirements" value={course.requirements} onChange={handleChange} placeholder="Laptop, internet connection..." className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
          </div>
        </div>
      </motion.div>

      {/* ================= THUMBNAIL ================= */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-7 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3"><ImageIcon size={24} className="text-cyan-400" /><h3 className="text-xl font-bold">Course Thumbnail</h3></div>
        <label className="block cursor-pointer">
          <input type="file" accept="image/*" hidden onChange={handleThumbnail} />
          {preview ? (
            <img src={preview} alt="Course thumbnail" className="h-64 w-full rounded-2xl border border-slate-700 object-cover transition hover:opacity-80" />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 text-slate-500">
              <ImageIcon size={55} />
              <p className="mt-4">Click to upload thumbnail</p>
            </div>
          )}
        </label>
        {thumbnail && (
          <div className="mt-4 rounded-xl bg-cyan-500/10 p-3 text-sm text-cyan-300">
            {uploading ? "Uploading image..." : thumbnail.name}
          </div>
        )}
      </motion.div>

      {/* ================= COURSE VIDEO ================= */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-7 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3"><Globe size={24} className="text-cyan-400" /><h3 className="text-xl font-bold">Course Video</h3></div>
        <label className="mb-3 block font-semibold">Video URL</label>
        <input type="text" name="video_url" value={course.video_url} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none" />
      </motion.div>

      {/* ================= SETTINGS ================= */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-7 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3"><Sparkles size={24} className="text-cyan-400" /><h3 className="text-xl font-bold">Course Settings</h3></div>
        <div className="space-y-6">
          <div>
            <label className="mb-3 block font-semibold">Status</label>
            <select name="status" value={course.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div><p className="font-semibold">Featured Course</p><p className="text-sm text-slate-500">Show this course on homepage</p></div>
            <input type="checkbox" name="featured" checked={course.featured} onChange={handleChange} className="h-5 w-5" />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div><p className="font-semibold">Award Certificate</p><p className="text-sm text-slate-500">Give students certificates after completion</p></div>
            <input type="checkbox" name="certificate" checked={course.certificate} onChange={handleChange} className="h-5 w-5" />
          </label>
        </div>
      </motion.div>

      {/* ================= LIVE PREVIEW ================= */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-7 backdrop-blur-xl">
        <h3 className="mb-6 text-xl font-bold">Live Preview</h3>
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
          {preview ? (
            <img src={preview} alt={course.title} className="h-52 w-full object-cover" />
          ) : (
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900">
              <BookOpen size={70} className="text-white/50" />
            </div>
          )}
          <div className="space-y-5 p-6">
            <span className="inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">{course.category || "No Category"}</span>
            <h2 className="text-2xl font-black">{course.title || "Course Title"}</h2>
            <p className="line-clamp-3 text-sm leading-7 text-slate-400">{course.description || "Course description will appear here."}</p>
            <div className="flex items-center justify-between border-t border-slate-800 pt-5">
              <span className="text-sm text-slate-500">{course.level}</span>
              <span className="text-lg font-bold text-cyan-400">{Number(course.price) === 0 ? "FREE" : `$${Number(course.price).toFixed(2)}`}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-900 p-4 text-center">
                <Award size={22} className="mx-auto mb-2 text-yellow-400" />
                <p className="text-xs text-slate-400">Certificate</p>
                <p className="mt-1 font-semibold">{course.certificate ? "Yes" : "No"}</p>
              </div>
              <div className="rounded-2xl bg-slate-900 p-4 text-center">
                <BookOpen size={22} className="mx-auto mb-2 text-cyan-400" />
                <p className="text-xs text-slate-400">Lessons</p>
                <p className="mt-1 font-semibold">{course.lessons_count || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditCourse;