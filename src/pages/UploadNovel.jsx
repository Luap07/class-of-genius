import React, { useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
)
  .trim()
  .replace(/\/+$/, "");

const UploadNovel = () => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState(null);
  const [status, setStatus] = useState("published");

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter the novel title.");
      return;
    }

    if (!author.trim()) {
      alert("Please enter the author.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("description", description);
      formData.append("introduction", introduction);
      formData.append("author", author);
      formData.append("content", content);
      formData.append("status", status);

      if (cover) {
        formData.append("cover", cover);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/novels`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            data?.details ||
            "Novel upload failed."
        );
      }

      console.log("Novel uploaded:", data.novel);

      alert("Novel uploaded successfully!");

      // Reset form
      setTitle("");
      setGenre("");
      setDescription("");
      setIntroduction("");
      setAuthor("");
      setContent("");
      setCover(null);
      setStatus("published");

      // Reset file input
      e.target.reset();
    } catch (error) {
      console.error("Novel upload error:", error);

      alert(
        error?.message ||
          "Something went wrong while uploading the novel."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            Novel Library
          </p>

          <h1 className="text-4xl font-black tracking-tight">
            Upload Novel
          </h1>

          <p className="mt-2 text-white/50">
            Add a novel directly to your Neon-powered library.
          </p>
        </div>

        <form
          onSubmit={handleUpload}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl"
        >

          {/* TITLE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Novel Title
            </label>

            <input
              type="text"
              placeholder="Enter novel title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* AUTHOR */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Author
            </label>

            <input
              type="text"
              placeholder="Enter author name"
              value={author}
              onChange={(e) =>
                setAuthor(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* GENRE */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Genre
            </label>

            <input
              type="text"
              placeholder="e.g. Romance, Fantasy, Drama"
              value={genre}
              onChange={(e) =>
                setGenre(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* COVER */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Cover Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) =>
                setCover(e.target.files?.[0] || null)
              }
              className="block w-full cursor-pointer rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-500"
            />

            <p className="mt-2 text-xs text-white/40">
              JPG, PNG or WEBP. Maximum size: 5MB.
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Description
            </label>

            <textarea
              placeholder="Write a short description..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="h-32 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* INTRODUCTION */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Introduction
            </label>

            <textarea
              placeholder="Write the novel introduction..."
              value={introduction}
              onChange={(e) =>
                setIntroduction(e.target.value)
              }
              className="h-32 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* CHAPTER 1 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Chapter 1
            </label>

            <textarea
              placeholder="Write Chapter 1 content..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              className="h-72 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="ongoing">
                Ongoing
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-bold transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading Novel..."
              : "Upload Novel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadNovel;
