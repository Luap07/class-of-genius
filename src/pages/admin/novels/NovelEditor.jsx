import React, { useEffect, useState } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

// --- REUSABLE COMPONENTS ---
const Input = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block mb-2 text-sm text-slate-400">
      {label}
    </label>

    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="
        w-full rounded-xl
        bg-slate-800
        border border-slate-700
        px-4 py-3
        text-white
        placeholder:text-slate-500
        outline-none
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
        transition
      "
    />
  </div>
);

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="block mb-2 text-sm text-slate-400">
      {label}
    </label>

    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={5}
      className="
        w-full rounded-xl
        bg-slate-800
        border border-slate-700
        px-4 py-3
        text-white
        placeholder:text-slate-500
        outline-none
        resize-y
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
        transition
      "
    />
  </div>
);

// --- MAIN FORM ---
const defaultForm = {
  title: "",
  author: "",
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

  // --------------------------------------------------
  // LOAD EXISTING NOVEL
  // --------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchNovel = async () => {
      setFetching(true);

      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Fetch Novel Error:", error);
        alert(error.message);
        setFetching(false);
        return;
      }

      if (data) {
        setForm({
          ...defaultForm,
          ...data,
          author: data.author || "",
          chapters: Array.isArray(data.chapters)
            ? data.chapters
            : [],
        });

        if (data.cover_url) {
          setPreview(data.cover_url);
        }
      }

      setFetching(false);
    };

    fetchNovel();
  }, [id]);

  // --------------------------------------------------
  // HANDLE INPUT CHANGES
  // --------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // UPLOAD COVER
  // --------------------------------------------------
  const uploadCover = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("covers")
      .upload(fileName, file);

    if (error) {
      console.error("Cover Upload Error:", error);
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("novel-covers")
      .getPublicUrl(fileName);

    if (data?.publicUrl) {
      setForm((prev) => ({
        ...prev,
        cover_url: data.publicUrl,
      }));
    }

    setUploading(false);
  };

  // --------------------------------------------------
  // ADD CHAPTER
  // --------------------------------------------------
  const addChapter = () => {
    setForm((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        {
          title: "",
          content: "",
        },
      ],
    }));
  };

  // --------------------------------------------------
  // UPDATE CHAPTER
  // --------------------------------------------------
  const updateChapter = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.chapters];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        chapters: updated,
      };
    });
  };

  // --------------------------------------------------
  // REMOVE CHAPTER
  // --------------------------------------------------
  const removeChapter = (index) => {
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // --------------------------------------------------
  // SAVE NOVEL
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter a novel title.");
      return;
    }

    if (!form.author.trim()) {
      alert("Please enter the author name.");
      return;
    }

    setLoading(true);

    try {
      // Remove ID before insert/update
      const { id: _, ...updateData } = form;

      // Make sure author is explicitly included
      const novelData = {
        ...updateData,
        author: form.author.trim(),
      };

      let error;

      if (id) {
        const response = await supabase
          .from("novels")
          .update(novelData)
          .eq("id", id);

        error = response.error;
      } else {
        const response = await supabase
          .from("novels")
          .insert([novelData]);

        error = response.error;
      }

      if (error) {
        console.error("Save Novel Error:", error);
        alert(error.message);
        return;
      }

      navigate("/admin/novels/list");
    } catch (error) {
      console.error("Unexpected Save Error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2
            size={32}
            className="animate-spin text-blue-500"
          />

          <p>Loading novel...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="space-y-8 pb-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {id ? "Edit Novel" : "Create Novel"}
        </h1>

        <p className="text-slate-400 mt-2">
          {id
            ? "Update your existing novel."
            : "Create a brand new novel for your readers."}
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="
          bg-slate-900
          border border-slate-800
          rounded-2xl
          p-6
          space-y-6
        "
      >

        {/* COVER UPLOAD */}
        <div>
          <label className="block mb-3 text-sm text-slate-400">
            Cover Image
          </label>

          <div className="flex flex-col md:flex-row gap-6">

            <div
              className="
                w-52 h-72
                rounded-xl
                overflow-hidden
                border border-slate-700
                bg-slate-800
                flex items-center justify-center
              "
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Novel Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <ImageIcon
                    size={55}
                    className="mx-auto mb-3"
                  />

                  <p>No Cover Selected</p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4">

              <label
                className="
                  cursor-pointer
                  bg-blue-600
                  hover:bg-blue-700
                  px-5 py-3
                  rounded-xl
                  inline-flex
                  items-center
                  gap-2
                  w-fit
                  transition
                "
              >
                <Upload size={18} />

                Choose Cover

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={uploadCover}
                />
              </label>

              {uploading && (
                <p className="text-blue-400 text-sm">
                  Uploading image...
                </p>
              )}

              {form.cover_url && (
                <p className="text-green-400 text-sm">
                  ✔ Cover uploaded
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BASIC INFORMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Input
            label="Novel Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter novel title"
          />

          {/* AUTHOR */}
          <Input
            label="Author"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Enter author name"
          />

          <Input
            label="Genre"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            placeholder="Fantasy, Romance, Mystery..."
          />

        </div>

        {/* INTRODUCTION */}
        <Textarea
          label="Introduction"
          name="introduction"
          value={form.introduction}
          onChange={handleChange}
          placeholder="Write the introduction..."
        />

        {/* DESCRIPTION */}
        <Textarea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Write the novel description..."
        />

        {/* CHAPTERS */}
        <div>

          <div className="flex items-center justify-between mb-4">

            <label className="text-sm text-slate-400">
              Chapters
            </label>

            <button
              type="button"
              onClick={addChapter}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-4 py-2
                hover:bg-blue-700
                transition
              "
            >
              <Plus size={18} />

              Add Chapter
            </button>
          </div>

          <div className="space-y-5">

            {form.chapters.map((chapter, index) => (
              <div
                key={index}
                className="
                  rounded-xl
                  border border-slate-700
                  bg-slate-800
                  p-5
                "
              >

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="font-semibold text-lg text-white">
                    Chapter {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      removeChapter(index)
                    }
                    className="
                      text-red-400
                      hover:text-red-500
                      transition
                    "
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">

                  <input
                    value={chapter.title || ""}
                    onChange={(e) =>
                      updateChapter(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Chapter title..."
                    className="
                      w-full
                      rounded-xl
                      bg-slate-900
                      border border-slate-700
                      px-4 py-3
                      text-white
                      placeholder:text-slate-500
                      outline-none
                      focus:border-blue-500
                    "
                  />

                  <textarea
                    rows={5}
                    value={chapter.content || ""}
                    onChange={(e) =>
                      updateChapter(
                        index,
                        "content",
                        e.target.value
                      )
                    }
                    placeholder="Chapter content..."
                    className="
                      w-full
                      rounded-xl
                      bg-slate-900
                      border border-slate-700
                      px-4 py-3
                      text-white
                      placeholder:text-slate-500
                      outline-none
                      resize-y
                      focus:border-blue-500
                    "
                  />

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* STATUS */}
        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="
              w-full
              rounded-xl
              bg-slate-800
              border border-slate-700
              px-4 py-3
              text-white
              outline-none
              focus:border-blue-500
            "
          >
            <option value="Draft">
              Draft
            </option>

            <option value="Published">
              Published
            </option>
          </select>
        </div>

        {/* SUBMIT */}
        <AdminButton
          type="submit"
          disabled={loading || uploading}
        >
          <span className="flex items-center gap-2">

            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {id
              ? "Update Novel"
              : "Save Novel"}

          </span>
        </AdminButton>

      </form>
    </div>
  );
};

export default NovelEditor;

