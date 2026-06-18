import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const emptyChapter = () => ({
  title: "",
  content: "",
});

const NovelEditor = ({ novel, onBack, onSaved }) => {
  const isEdit = !!novel;

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [introduction, setIntroduction] = useState("");

  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState("");

  const [chapters, setChapters] = useState([emptyChapter()]);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD NOVEL ================= */
  useEffect(() => {
    if (!novel) return;

    setTitle(novel.title || "");
    setGenre(novel.genre || "");
    setDescription(novel.description || "");
    setIntroduction(novel.introduction || "");
    setPreview(novel.cover_url || "");
    setChapters(novel.chapters || [emptyChapter()]);
  }, [novel]);

  /* ================= CHAPTER ACTIONS ================= */
  const addChapter = () => {
    setChapters([...chapters, emptyChapter()]);
  };

  const updateChapter = (i, field, value) => {
    const updated = [...chapters];
    updated[i][field] = value;
    setChapters(updated);
  };

  const removeChapter = (i) => {
    setChapters(chapters.filter((_, idx) => idx !== i));
  };

  /* ================= SAVE NOVEL ================= */
  const saveNovel = async () => {
    try {
      setSaving(true);

      let cover_url = novel?.cover_url || "";

      if (cover) {
        const fileName = `${Date.now()}-${cover.name}`;

        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, cover);

        if (uploadError) {
          alert(uploadError.message);
          setSaving(false);
          return;
        }

        const { data } = supabase.storage
          .from("covers")
          .getPublicUrl(fileName);

        cover_url = data.publicUrl;
      }

      const payload = {
        title,
        genre,
        description,
        introduction,
        chapters,
        cover_url,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("novels")
          .update(payload)
          .eq("id", novel.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("novels")
          .insert([payload]);

        if (error) throw error;
      }

      alert("Novel saved successfully!");

      onSaved?.();
      onBack();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05070f] to-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <button onClick={onBack} className="text-blue-400">
          ← Back
        </button>

        <h2 className="text-3xl font-bold">
          {isEdit ? "Edit Novel" : "Create Novel"}
        </h2>

        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="mb-2 text-sm text-gray-400">Cover Image</p>

          {preview ? (
            <img
              src={preview}
              alt="cover"
              className="h-40 w-full object-cover rounded-lg mb-3"
            />
          ) : (
            <div className="h-40 w-full flex items-center justify-center border border-dashed border-white/20 rounded-lg text-gray-500">
              No cover selected
            </div>
          )}

          <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 rounded">
            Choose Cover

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                setCover(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-3 bg-white/5 rounded"
        />

        <input
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Genre (SCI_FIC, ROMANCE, FANTASY...)"
          className="w-full p-3 bg-white/5 rounded"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short Description"
          className="w-full p-3 bg-white/5 rounded"
        />

        <textarea
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          placeholder="Introduction / Prologue"
          className="w-full p-3 bg-white/5 rounded min-h-[250px]"
        />

        <div>
          <h3 className="text-lg font-bold">📖 Chapters</h3>

          {chapters.map((c, i) => (
            <div
              key={i}
              className="p-3 border border-white/10 rounded mt-3"
            >
              <input
                value={c.title}
                onChange={(e) =>
                  updateChapter(i, "title", e.target.value)
                }
                placeholder="Chapter title"
                className="w-full p-2 bg-white/5 rounded"
              />

              <textarea
                value={c.content}
                onChange={(e) =>
                  updateChapter(i, "content", e.target.value)
                }
                placeholder="Content"
                className="w-full p-2 bg-white/5 rounded mt-2 min-h-[200px]"
              />

              <button
                onClick={() => removeChapter(i)}
                className="text-red-400 text-sm mt-2"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={addChapter}
            className="mt-3 px-3 py-2 bg-gray-700 rounded"
          >
            + Add Chapter
          </button>
        </div>

        <button
          onClick={saveNovel}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-3 rounded font-bold"
        >
          {saving ? "Saving..." : "Save Novel"}
        </button>

      </div>
    </div>
  );
};

export default NovelEditor;