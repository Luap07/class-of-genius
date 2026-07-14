// src/pages/admin/lms/CreateLesson.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  PlayCircle,
  FileText,
  File,
  Headphones,
  Presentation,
  Clock3,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const lessonTypes = [
  "Video",
  "PDF",
  "Document",
  "PowerPoint",
  "Audio",
];

const CreateLesson = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [modules, setModules] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    module_id: moduleId || "",
    lesson_type: "Video",
    duration: "",
    position: 1,
    video_url: "",
    file: null,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    const { data } = await supabase
      .from("course_modules")
      .select("id,title")
      .order("position");

    setModules(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const getBucket = () => {
  switch (formData.lesson_type) {
    case "Video":
      return "lesson-videos";

    case "PDF":
      return "course-documents";

    case "Document":
      return "course-documents";

    case "PowerPoint":
      return "course-documents";

    case "Audio":
      return "lesson-audio";

    default:
      return null;
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return alert("Lesson title is required.");
    }

    if (!formData.module_id) {
      return alert("Please select a module.");
    }

    setLoading(true);

    const fileUrl = await uploadLessonFile();

    let payload = {
      module_id: formData.module_id,
      title: formData.title,
      description: formData.description,
      lesson_type: formData.lesson_type,
      duration: formData.duration,
      position: Number(formData.position),

      video_url: null,
      pdf_url: null,
      doc_url: null,
      ppt_url: null,
      audio_url: null,
    };

    switch (formData.lesson_type) {
      case "Video":
        payload.video_url =
          formData.video_url || fileUrl;
        break;

      case "PDF":
        payload.pdf_url = fileUrl;
        break;

      case "Document":
        payload.doc_url = fileUrl;
        break;

      case "PowerPoint":
        payload.ppt_url = fileUrl;
        break;

      case "Audio":
        payload.audio_url = fileUrl;
        break;

      default:
        break;
    }

    const { error } = await supabase
      .from("course_lessons")
      .insert(payload);

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    navigate("/admin/lms/lessons");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-white">
            Create Lesson
          </h1>

          <p className="mt-2 text-slate-400">
            Create a lesson for your module.
          </p>

        </div>

        <AdminButton
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </AdminButton>

      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-8"
      >
                {/* Lesson Title */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Lesson Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Introduction to React"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

        </div>

        {/* Description */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Description
          </label>

          <textarea
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write a short lesson description..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          />

        </div>

        {/* Module */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Module
          </label>

          <select
            name="module_id"
            value={formData.module_id}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          >

            <option value="">Select Module</option>

            {modules.map((module) => (

              <option
                key={module.id}
                value={module.id}
              >
                {module.title}
              </option>

            ))}

          </select>

        </div>

        {/* Lesson Type */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Lesson Type
          </label>

          <select
            name="lesson_type"
            value={formData.lesson_type}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
          >

            {lessonTypes.map((type) => (

              <option
                key={type}
                value={type}
              >
                {type}
              </option>

            ))}

          </select>

        </div>

        {/* Duration & Position */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Duration
            </label>

            <div className="relative">

              <Clock3
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="15 mins"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Position
            </label>

            <input
              type="number"
              min="1"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

        </div>
                {/* Dynamic Resource Section */}

        {formData.lesson_type === "Video" && (
          <div className="space-y-6">

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                YouTube URL (Optional)
              </label>

              <div className="relative">

                <PlayCircle
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
                />

              </div>

            </div>

            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">

              <Upload size={24} />

              <span>
                {formData.file
                  ? formData.file.name
                  : "Upload MP4 Video"}
              </span>

              <input
                type="file"
                accept="video/*"
                onChange={handleFile}
                className="hidden"
              />

            </label>

          </div>
        )}

        {formData.lesson_type === "PDF" && (

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">

            <FileText size={24} />

            <span>
              {formData.file
                ? formData.file.name
                : "Upload PDF"}
            </span>

            <input
  type="file"
  accept="application/pdf"
  onChange={handleFile}
  className="hidden"
/>

          </label>

        )}

        {formData.lesson_type === "Document" && (

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">

            <File size={24} />

            <span>
              {formData.file
                ? formData.file.name
                : "Upload DOC / DOCX"}
            </span>

            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleFile}
              className="hidden"
            />

          </label>

        )}

        {formData.lesson_type === "PowerPoint" && (

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">

            <Presentation size={24} />

            <span>
              {formData.file
                ? formData.file.name
                : "Upload PPT / PPTX"}
            </span>

            <input
              type="file"
              accept=".ppt,.pptx"
              onChange={handleFile}
              className="hidden"
            />

          </label>

        )}

        {formData.lesson_type === "Audio" && (

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400 hover:border-blue-500">

            <Headphones size={24} />

            <span>
              {formData.file
                ? formData.file.name
                : "Upload Audio"}
            </span>

            <input
              type="file"
              accept="audio/*"
              onChange={handleFile}
              className="hidden"
            />

          </label>

        )}

        <div className="flex justify-end gap-4">

          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </AdminButton>

          <AdminButton
            type="submit"
            disabled={loading || uploading}
          >
            {loading || uploading ? (
              <>
                <Loader2
                  size={18}
                  className="mr-2 animate-spin"
                />
                {uploading
                  ? "Uploading..."
                  : "Saving..."}
              </>
            ) : (
              <>
                <Save
                  size={18}
                  className="mr-2"
                />
                Create Lesson
              </>
            )}
          </AdminButton>

        </div>

      </form>

    </div>
  );
};

export default CreateLesson;