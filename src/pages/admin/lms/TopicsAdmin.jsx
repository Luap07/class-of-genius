import React, { useState } from "react";
import {
  Upload,
  BookOpen,
  DollarSign,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    category_id: "",
    instructor: "",
    level: "Beginner",
    price: 0,
    status: "Draft",
    featured: false,
    video_url: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = "";

      // Handle Image Upload
      if (thumbnail) {
        const fileName = `${Date.now()}-${thumbnail.name}`;
        const { error: uploadError } = await supabase.storage
          .from("course-covers")
          .upload(fileName, thumbnail);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("course-covers")
          .getPublicUrl(fileName);
        thumbnailUrl = data.publicUrl;
      }

      // Insert into Database
      const { error } = await supabase.from("courses").insert([
        {
          ...course,
          price: Number(course.price),
          thumbnail_url: thumbnailUrl,
          students: 0,
          rating: 0,
        },
      ]);

      if (error) throw error;

      alert("Course created successfully!");
      navigate("/admin/lms/courses");
    } catch (err) {
      console.error("Submission Error:", err);
      alert(err.message || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/lms/courses")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-3"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-bold">Create Course</h1>
        </div>
        <AdminButton type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? "Saving..." : "Save Course"}
        </AdminButton>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-6">
            <h2 className="text-xl font-bold">Course Information</h2>
            
            <div>
              <label className="block mb-2 text-sm text-slate-400">Course Title</label>
              <input name="title" required value={course.title} onChange={handleChange} placeholder="React for Beginners" className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none" />
            </div>

            <div>
              <label className="block mb-2 text-sm text-slate-400">Description</label>
              <textarea rows={6} name="description" required value={course.description} onChange={handleChange} placeholder="Write details..." className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none resize-none" />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm text-slate-400">Category</label>
                <input name="category" value={course.category} onChange={handleChange} className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3" />
              </div>
              <div>
                <label className="block mb-2 text-sm text-slate-400">Instructor</label>
                <input name="instructor" value={course.instructor} onChange={handleChange} className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Data */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold mb-5">Thumbnail</h2>
            <label className="cursor-pointer block">
              <input type="file" accept="image/*" hidden onChange={handleImage} />
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-56 rounded-2xl object-cover border border-slate-700" />
              ) : (
                <div className="h-56 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={45} />
                  <p className="mt-3">Click to upload</p>
                </div>
              )}
            </label>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="font-bold">Settings</h2>
            <select name="status" value={course.status} onChange={handleChange} className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span>Featured Course</span>
              <input type="checkbox" name="featured" checked={course.featured} onChange={handleChange} className="w-5 h-5" />
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateCourse;