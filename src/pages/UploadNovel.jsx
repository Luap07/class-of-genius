import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // adjust path

const UploadNovel = () => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("novels").insert([
      {
        title,
        genre,
        description,
        author,
        chapters: [
          {
            chapter: 1,
            title: "Chapter 1",
            content,
          },
        ],
      },
    ]);

    if (error) {
      console.log(error);
      alert("Upload failed");
      return;
    }

    alert("Novel uploaded!");

    setTitle("");
    setGenre("");
    setDescription("");
    setAuthor("");
    setContent("");
  };

  return (
    <div className="min-h-screen p-6 text-white bg-[#05070f]">
      <h1 className="text-3xl font-bold mb-6">
        Upload Novel
      </h1>

      <form
        onSubmit={handleUpload}
        className="space-y-4 max-w-3xl"
      >
        <input
          type="text"
          placeholder="Novel Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded bg-white/5 border border-white/10"
        />

        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full p-3 rounded bg-white/5 border border-white/10"
        />

        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full p-3 rounded bg-white/5 border border-white/10"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded bg-white/5 border border-white/10 h-28"
        />

        <textarea
          placeholder="Chapter 1 Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 rounded bg-white/5 border border-white/10 h-64"
        />

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500"
        >
          Upload Novel
        </button>
      </form>
    </div>
  );
};

export default UploadNovel;