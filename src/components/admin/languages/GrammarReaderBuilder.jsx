import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ScrollText,
  StickyNote,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function GrammarReaderBuilder({
  lesson,
  onClose,
  onSaved,
}) {
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
  introduction: "",
  explanation: "",
  rules: "",
  examples: "",
  mistakes: "",
  practice: "",
  summary: "",
  notes: "",
  reading_time: "",
  previous_lesson: null,
  next_lesson: null,
});

  useEffect(() => {
    if (!lesson) return;

    setForm({
      introduction: lesson.introduction || "",
      explanation: lesson.explanation || "",
      rules: lesson.rules || "",
      examples: lesson.examples || "",
      mistakes: lesson.mistakes || "",
      practice: lesson.practice || "",
      summary: lesson.summary || "",
      notes: lesson.notes || "",
reading_time: lesson.reading_time || "",
previous_lesson: lesson.previous_lesson || null,
next_lesson: lesson.next_lesson || null,
});
  }, [lesson]);

  async function loadLessons() {
    const { data } = await supabase
      .from("language_grammar")
      .select("id,title")
      .order("title");

    setLessons(data || []);
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (!lesson) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("language_grammar")
        .update({
          introduction: form.introduction,
          explanation: form.explanation,
          rules: form.rules,
          examples: form.examples,
          mistakes: form.mistakes,
          practice: form.practice,
          summary: form.summary,
          notes: form.notes,
reading_time: form.reading_time,
previous_lesson: form.previous_lesson,
next_lesson: form.next_lesson,
updated_at: new Date().toISOString(),
})
        .eq("id", lesson.id);

      if (error) throw error;

      alert("Grammar reader updated successfully.");
      if (onSaved) {
        onSaved();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("Unable to save grammar reader.");
    } finally {
      setSaving(false);
    }
  }

  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto my-12 w-full max-w-6xl rounded-[35px] border border-slate-800 bg-slate-950 shadow-2xl"
      >
        {/* HEADER */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-10 py-6 backdrop-blur-xl">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/15">
              <BookOpen className="text-cyan-400" size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black text-white">Build Reader</h1>
              <p className="mt-2 text-slate-400">{lesson.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-xl bg-red-500/15 p-3 transition hover:bg-red-500/30"
            >
              <X size={22} className="text-red-400" />
            </button>
          </div>
        </div>

        <div className="p-10 space-y-10">
          {/* INTRODUCTION */}
          <section className="rounded-3xl border border-cyan-500/25 bg-cyan-500/5 p-8">
            <div className="flex gap-4">
              <BookOpen className="mt-1 text-cyan-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Introduction</h2>
                <textarea
                  rows={5}
                  value={form.introduction}
                  onChange={(e) => updateField("introduction", e.target.value)}
                  placeholder="Introduce the grammar lesson..."
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </section>

          {/* EXPLANATION */}
          <section className="rounded-3xl border border-blue-500/25 bg-blue-500/5 p-8">
            <div className="flex gap-4">
              <FileText className="mt-1 text-blue-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Explanation</h2>
                <textarea
                  rows={8}
                  value={form.explanation}
                  onChange={(e) => updateField("explanation", e.target.value)}
                  placeholder="Detailed explanation of the concept..."
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* RULES */}
          <section className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-8">
            <div className="flex gap-4">
              <CheckCircle2 className="mt-1 text-emerald-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Rules</h2>
                <textarea
                  rows={6}
                  value={form.rules}
                  onChange={(e) => updateField("rules", e.target.value)}
                  placeholder="Grammar rules and guidelines..."
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* EXAMPLES */}
          <section className="rounded-3xl border border-purple-500/25 bg-purple-500/5 p-8">
            <div className="flex gap-4">
              <ScrollText className="mt-1 text-purple-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Examples</h2>
                <textarea
                  rows={6}
                  value={form.examples}
                  onChange={(e) => updateField("examples", e.target.value)}
                  placeholder="Provide sample sentences..."
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </section>

          {/* COMMON MISTAKES */}
          <section className="rounded-3xl border border-amber-500/25 bg-amber-500/5 p-8">
            <div className="flex gap-4">
              <AlertTriangle className="mt-1 text-amber-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Common Mistakes</h2>
                <textarea
                  rows={6}
                  value={form.mistakes}
                  onChange={(e) => updateField("mistakes", e.target.value)}
                  placeholder="What pitfalls should learners avoid?"
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </section>

          {/* PRACTICE */}
          <section className="rounded-3xl border border-indigo-500/25 bg-indigo-500/5 p-8">
            <div className="flex gap-4">
              <ClipboardList className="mt-1 text-indigo-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Practice</h2>
                <textarea
                  rows={6}
                  value={form.practice}
                  onChange={(e) => updateField("practice", e.target.value)}
                  placeholder="Interactive practice prompts..."
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <section className="rounded-3xl border border-teal-500/25 bg-teal-500/5 p-8">
            <div className="flex gap-4">
              <Lightbulb className="mt-1 text-teal-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Summary</h2>
                <textarea
                  rows={4}
                  value={form.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  placeholder="Recap of the lesson..."
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </section>

          {/* EXTRA NOTES */}
          <section className="rounded-3xl border border-rose-500/25 bg-rose-500/5 p-8">
            <div className="flex gap-4">
              <StickyNote className="mt-1 text-rose-400" size={24} />
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white">Extra Notes</h2>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Additional teacher tips or remarks..."
                  className="mt-5 w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </section>

          {/* READING TIME */}

<section className="rounded-3xl border border-cyan-500/25 bg-cyan-500/5 p-8">
  <div className="flex gap-4">
    <BookOpen className="mt-1 text-cyan-400" size={24} />

    <div className="flex-1">
      <h2 className="text-2xl font-black text-white">
        Reading Time
      </h2>

      <input
        type="text"
        value={form.reading_time}
        onChange={(e) =>
          updateField("reading_time", e.target.value)
        }
        placeholder="Example: 5 min read"
        className="
          mt-5
          w-full
          rounded-2xl
          border
          border-slate-700
          bg-slate-900
          p-4
          text-white
          outline-none
          focus:border-cyan-500
        "
      />
    </div>
  </div>
</section>

          {/* NAVIGATION MAPPING */}
          <section className="rounded-3xl border border-slate-700 bg-slate-900/50 p-8">
            <h2 className="text-2xl font-black text-white mb-6">Lesson Navigation</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Previous Lesson</label>
                <select
                  value={form.previous_lesson || ""}
                  onChange={(e) => updateField("previous_lesson", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-cyan-500"
                >
                  <option value="">-- None --</option>
                  {lessons.map((item) => (
                    item.id !== lesson.id && (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    )
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Next Lesson</label>
                <select
                  value={form.next_lesson || ""}
                  onChange={(e) => updateField("next_lesson", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-cyan-500"
                >
                  <option value="">-- None --</option>
                  {lessons.map((item) => (
                    item.id !== lesson.id && (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    )
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}