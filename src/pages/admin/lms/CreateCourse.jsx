import React, { useEffect, useState } from "react";
import {
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  GraduationCap,
  Award,
  Sparkles,
  Target,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

const CreateCourse = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState([]);

  const [course, setCourse] = useState({
    title: "",
    video_type:"youtube",
    video_file:null,
    video_duration:"",
    subtitle: "",
    slug: "",
    description: "",
    category_id: "",
    instructor: "",
    level: "Beginner",
    language: "English",
    duration: "",
    lessons_count: 0,
    price: 0,
    certificate: true,
    featured: false,
    status: "Draft",
    requirements: "",
    learning_outcomes: "",
    target_audience: "",
    skills: "",
    tags: "",
    seo_title: "",
    seo_description: "",
    academic_level: "",
    course_type: "",
    difficulty: "Easy",
    study_time: "",
    career_paths: "",
    job_roles: "",
    average_salary: "",
    experience_required: "",
    companies: "",
    remote_friendly: false,
    internship_available: false,
      });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("course_categories")
      .select("*")
      .order("name");

    if (!error) {
      setCategories(data || []);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCourse((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "title") {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .replace(/\s+/g, "-");
      }
      return updated;
    });
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
    setError("");

    try {
      let thumbnailUrl = "";
      if (thumbnail) {
        setUploading(true);
        const fileName = `${Date.now()}-${thumbnail.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from("course-thumbnails")
          .upload(fileName, thumbnail);

        if (uploadError) throw uploadError;

        const { data: imageData } = supabase
          .storage
          .from("course-thumbnails")
          .getPublicUrl(fileName);

        thumbnailUrl = imageData.publicUrl;
        setUploading(false);
      }

     const { error: insertError } = await supabase
  .from("courses")
  .insert([
    {
      title: course.title,
      slug: course.slug,
      description: course.description,

      thumbnail: thumbnailUrl,
      thumbnail_url: thumbnailUrl,

      category_id: course.category_id,

      instructor: course.instructor,
      level: course.level,
      language: course.language,

      duration: course.duration,
      lessons_count: Number(course.lessons_count),

      price: Number(course.price),

      certificate: course.certificate,
      featured: course.featured,

      status: course.status,

      requirements: course.requirements,
      learning_outcomes: course.learning_outcomes,

      students: 0,
      rating: 0
    }
  ]);
      if (insertError) throw insertError;
     setSuccess(true);

console.log("COURSE SAVED:", course);

alert("Course saved successfully");
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8 text-white">
        {/* ================= Course Details ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400"><GraduationCap size={28} /></div>
            <div>
              <h2 className="text-2xl font-bold">Course Details</h2>
              <p className="mt-1 text-slate-400">Configure course information and classification.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-semibold">Course Title</label>
              <input name="title" value={course.title} onChange={handleChange} placeholder="Complete React Developer Course" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Subtitle</label>
              <input name="subtitle" value={course.subtitle} onChange={handleChange} placeholder="Build modern applications" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Category</label>
              <select name="category_id" value={course.category_id} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Instructor</label>
              <input name="instructor" value={course.instructor} onChange={handleChange} placeholder="John Doe" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Level</label>
              <select name="level" value={course.level} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Language</label>
              <input name="language" value={course.language} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Duration</label>
              <input name="duration" value={course.duration} onChange={handleChange} placeholder="20 Hours" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Number of Lessons</label>
              <input type="number" name="lessons_count" value={course.lessons_count} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
          </div>
        </motion.div>

        {/* ================= Academic Classification ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400"><Target size={28} /></div>
            <div>
              <h2 className="text-2xl font-bold">Academic Classification</h2>
              <p className="mt-1 text-slate-400">Define educational level and course type.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-sm font-semibold">Academic Level</label>
              <select name="academic_level" value={course.academic_level} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
                <option value="">None</option>
                <option>Primary</option>
                <option>JSS 1</option>
                <option>JSS 2</option>
                <option>JSS 3</option>
                <option>SS 1</option>
                <option>SS 2</option>
                <option>SS 3</option>
                <option>University</option>
              </select>
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Course Type</label>
              <select name="course_type" value={course.course_type} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
                <option>Academic</option>
                <option>Professional</option>
                <option>Certification</option>
                <option>Bootcamp</option>
                <option>Workshop</option>
              </select>
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Difficulty</label>
              <select name="difficulty" value={course.difficulty} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
                <option>Easy</option>
                <option>Moderate</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Weekly Study Time</label>
              <input name="study_time" value={course.study_time} onChange={handleChange} placeholder="5 Hours / Week" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
          </div>
        </motion.div>

        {/* ================= Skills & Technologies ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400"><Sparkles size={28} /></div>
            <div>
              <h2 className="text-2xl font-bold">Skills & Technologies</h2>
              <p className="mt-1 text-slate-400">Technologies covered in this course.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-semibold">Skills</label>
              <textarea rows="6" name="skills" value={course.skills} onChange={handleChange} placeholder={`React\nJavaScript\nNode.js\nPython\nAWS`} className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Career Paths</label>
              <input name="career_paths" value={course.career_paths} onChange={handleChange} placeholder="Frontend Developer, Cloud Engineer" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
          </div>
        </motion.div>

        
        {/* ================= Career Opportunities ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400"><Briefcase size={28} /></div>
            <div>
              <h2 className="text-2xl font-bold">Career Opportunities</h2>
              <p className="mt-1 text-slate-400">Show learners future career options.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-3 block text-sm font-semibold">Job Roles</label>
              <textarea rows="4" name="job_roles" value={course.job_roles} onChange={handleChange} placeholder={`Frontend Developer\nBackend Developer\nFull Stack Developer`} className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Average Salary</label>
              <input name="average_salary" value={course.average_salary} onChange={handleChange} placeholder="$60,000 - $120,000" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
            <div>
              <label className="mb-3 block text-sm font-semibold">Experience Required</label>
              <select name="experience_required" value={course.experience_required} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
                <option>No Experience</option>
                <option>0-1 Years</option>
                <option>1-3 Years</option>
                <option>3-5 Years</option>
                <option>5+ Years</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-3 block text-sm font-semibold">Hiring Companies</label>
              <input name="companies" value={course.companies} onChange={handleChange} placeholder="Google, Microsoft, Flutterwave" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4" />
            </div>
          </div>
        </motion.div>

      
        {/* ================= Course Settings ================= */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400"><Sparkles size={24} /></div>
            <div>
              <h3 className="text-xl font-bold">Course Settings</h3>
              <p className="text-sm text-slate-400">Publishing options</p>
            </div>
          </div>
          <div className="space-y-6">
            <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">
              <span>Featured Course</span>
              <input type="checkbox" name="featured" checked={course.featured} onChange={handleChange} className="h-5 w-5" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">
              <span>Remote Friendly</span>
              <input type="checkbox" name="remote_friendly" checked={course.remote_friendly} onChange={handleChange} className="h-5 w-5" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">
              <span>Internship Available</span>
              <input type="checkbox" name="internship_available" checked={course.internship_available} onChange={handleChange} className="h-5 w-5" />
            </label>
            <div>
              <label className="mb-3 block text-sm font-semibold">Status</label>
              <select name="status" value={course.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4">
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ================= Thumbnail Upload ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400"><ImageIcon size={28} /></div>
            <div>
              <h2 className="text-2xl font-bold">Thumbnail</h2>
              <p className="text-slate-400">Course cover image</p>
            </div>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950 p-10 hover:border-cyan-400">
            <Upload size={35} />
            <p className="mt-3">Upload Image</p>
            <input type="file" accept="image/*" hidden onChange={handleImage} />
          </label>
          {preview && (
            <img src={preview} alt="preview" className="mt-6 h-64 w-full rounded-3xl object-cover" />
          )}
        </motion.div>

        {/* ================= Submit ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 rounded-[30px] border border-slate-800 bg-slate-900/70 p-8 md:flex-row md:justify-between">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center justify-center gap-3 rounded-2xl border border-slate-700 px-8 py-4 font-semibold hover:bg-slate-800">
            <ArrowLeft />
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-4 font-bold">
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            {loading ? (uploading ? "Uploading..." : "Saving...") : "Create Course"}
          </button>
        </motion.div>
      </div>
    </form>
  );
};

export default CreateCourse;