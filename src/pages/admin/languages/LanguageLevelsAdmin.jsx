import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function LanguageLevelsAdmin({ language }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    level: "Beginner",
    title: "",
    description: "",
    objectives: "",
  });

  /* =========================
     FETCH LEVELS
  ========================= */
  const fetchLevels = async () => {
    if (!language?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_levels")
        .select("*")
        .eq("language_id", language.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLevels(data || []);
    } catch (error) {
      console.error("Fetch levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, [language]);

  /* =========================
     INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     RESET FORM
  ========================= */
  const resetForm = () => {
    setForm({
      level: "Beginner",
      title: "",
      description: "",
      objectives: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  /* =========================
     SAVE LEVEL
  ========================= */
  const handleSave = async () => {
    if (!language?.id) return;

    try {
      setSaving(true);

      const payload = {
        language_id: language.id,
        level: form.level,
        title: form.title,
        description: form.description,
        objectives: form.objectives,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingId) {
        ({ error } = await supabase
          .from("language_levels")
          .update(payload)
          .eq("id", editingId));
      } else {
        ({ error } = await supabase
          .from("language_levels")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          }));
      }

      if (error) throw error;

      await fetchLevels();
      resetForm();
    } catch (error) {
      console.error("Save level:", error);
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     EDIT LEVEL
  ========================= */
  const handleEdit = (item) => {
    setForm({
      level: item.level || "Beginner",
      title: item.title || "",
      description: item.description || "",
      objectives: item.objectives || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  /* =========================
     DELETE LEVEL
  ========================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this level?");

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("language_levels")
        .delete()
        .eq("id", id);

      if (error) throw error;

      fetchLevels();
    } catch (error) {
      console.error("Delete level:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-3" />
        Loading levels...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-4xl font-black text-white">Difficulty Levels</h1>
          <p className="mt-2 text-slate-400">
            Manage Beginner, Intermediate and Advanced learning paths.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-3 rounded-2xl bg-cyan-500 px-6 py-4 font-black text-black transition hover:bg-cyan-400"
        >
          <Plus size={20} />
          Add Level
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="rounded-[32px] border border-white/10 bg-slate-900 p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black">
              {editingId ? "Edit Level" : "Create Level"}
            </h2>

            <button
              onClick={resetForm}
              className="rounded-xl bg-white/10 p-2"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-6">
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-white"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Level title"
              className="rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-white"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Level description"
              rows={5}
              className="rounded-2xl border border-white/10 bg-slate-950 p-5 text-white"
            />

            <textarea
              name="objectives"
              value={form.objectives}
              onChange={handleChange}
              placeholder="Learning objectives"
              rows={5}
              className="rounded-2xl border border-white/10 bg-slate-950 p-5 text-white"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 font-black text-white"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              Save Level
            </button>
          </div>
        </div>
      )}

      {/* LEVEL CARDS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((item) => (
          <div
            key={item.id}
            className="rounded-[32px] border border-white/10 bg-slate-900 p-8 transition hover:-translate-y-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider ${
                    item.level === "Beginner"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : item.level === "Intermediate"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-violet-500/20 text-violet-400"
                  }`}
                >
                  {item.level}
                </span>

                <h3 className="mt-5 text-2xl font-black text-white">
                  {item.title || item.level}
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="rounded-xl bg-white/10 p-3 text-blue-400 transition hover:bg-white/20"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-xl bg-white/10 p-3 text-red-400 transition hover:bg-white/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-400">
              {item.description || "No description added yet."}
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <h4 className="text-sm font-black uppercase tracking-wider text-cyan-400">
                Objectives
              </h4>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
                {item.objectives || "No objectives added."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {levels.length === 0 && (
        <div className="rounded-[32px] border border-white/10 bg-slate-900 py-20 text-center">
          <h2 className="text-3xl font-black">No Levels Created</h2>
          <p className="mt-3 text-slate-400">
            Add Beginner, Intermediate or Advanced learning paths.
          </p>
        </div>
      )}
    </div>
  );
}