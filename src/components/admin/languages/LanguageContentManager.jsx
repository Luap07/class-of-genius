import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  X,
  Save,
  Loader2,
  BookOpen,
  Languages,
  FileText,
  Mic,
  Headphones,
  PenTool,
  Globe,
  Brain,
  BookMarked,
  Trash2,
  Edit2,
  PlusCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import LanguageSectionEditor from "./LanguageSectionEditor";
import LanguageLessonsPanel from "./LanguageLessonsPanel";
import LanguageAITutorPanel from "./LanguageAITutorPanel";

export default function LanguageContentManager({
  open,
  language,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState("overview");

  // Form states matching editor / database fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editingSection, setEditingSection] = useState(null);

  const languageId = language?.id;

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: Globe },
      { id: "alphabet", label: "Alphabet", icon: Languages },
      { id: "grammar", label: "Grammar", icon: BookMarked },
      { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
      { id: "listening", label: "Listening", icon: Headphones },
      { id: "speaking", label: "Speaking", icon: Mic },
      { id: "writing", label: "Writing", icon: PenTool },
      { id: "culture", label: "Culture", icon: Globe },
      { id: "lessons", label: "Lessons", icon: FileText },
      { id: "ai_tutor", label: "AI Tutor", icon: Brain },
    ],
    []
  );

  /* ---------------- FETCH SECTIONS ---------------- */

  const fetchSections = useCallback(async () => {
    if (!languageId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_sections")
        .select("*")
        .eq("language_id", languageId)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setSections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  useEffect(() => {
    if (!open || !languageId) return;
    fetchSections();
  }, [open, languageId, fetchSections]);

  /* ---------------- SYNC FORM WITH CURRENT TAB ---------------- */

  useEffect(() => {
    if (currentSection === "lessons" || currentSection === "ai_tutor") {
      return;
    }

    const existing = sections.find(
      (item) => (item.section_type || item.section) === currentSection
    );

    if (existing) {
      setEditingSection(existing);
      setTitle(existing.title || "");
      setSubtitle(existing.subtitle || "");
      setDescription(existing.description || "");
      setContent(existing.content || "");
      setSortOrder(existing.sort_order || 0);
    } else {
      setEditingSection(null);
      setTitle("");
      setSubtitle("");
      setDescription("");
      setContent("");
      setSortOrder(0);
    }
  }, [sections, currentSection]);

  /* ---------------- RESET FORM ---------------- */

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setDescription("");
    setContent("");
    setSortOrder(0);
    setEditingSection(null);
  };

  /* ---------------- SAVE SECTION ---------------- */

  const handleSave = async () => {
    if (!languageId) return;

    if (currentSection === "lessons" || currentSection === "ai_tutor") {
      return;
    }

    if (!title.trim()) {
      alert("Section title is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        language_id: languageId,
        section_type: currentSection,
        section: currentSection,
        title,
        subtitle,
        description,
        content,
        sort_order: Number(sortOrder),
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingSection) {
        ({ error } = await supabase
          .from("language_sections")
          .update(payload)
          .eq("id", editingSection.id));
      } else {
        ({ error } = await supabase
          .from("language_sections")
          .insert([payload]));
      }

      if (error) throw error;

      await fetchSections();
      alert("Section saved successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save section.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- EDIT SECTION ---------------- */

  const handleEdit = (section) => {
    setEditingSection(section);
    if (section.section_type || section.section) {
      setCurrentSection(section.section_type || section.section);
    }
    setTitle(section.title || "");
    setSubtitle(section.subtitle || "");
    setDescription(section.description || "");
    setContent(section.content || "");
    setSortOrder(section.sort_order || 0);
  };

  /* ---------------- DELETE SECTION ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    try {
      const { error } = await supabase
        .from("language_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchSections();
    } catch (err) {
      console.error(err);
      alert("Failed to delete section.");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            className="flex h-[90vh] w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#030712] shadow-2xl"
          >
            
            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-8 py-6">
                <div>
                  <h2 className="text-3xl font-black text-white">
                    {language?.name || language?.language_name}
                  </h2>
                  <p className="mt-1 text-gray-400">
                    Manage content for tab: <span className="text-indigo-400 font-bold uppercase">{currentSection}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {currentSection !== "lessons" && currentSection !== "ai_tutor" && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      {saving ? "Saving..." : "Save Section"}
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="rounded-xl bg-white/10 p-3 text-gray-300 hover:bg-red-500 hover:text-white transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Dynamic View Body */}
              <div className="flex-1 p-8 space-y-8">
                {currentSection === "lessons" ? (
                  <LanguageLessonsPanel languageId={languageId} />
                ) : currentSection === "ai_tutor" ? (
                  <LanguageAITutorPanel languageId={languageId} language={language} />
                ) : (
                  <div className="space-y-8">
                    {/* Editor Component */}
                    <LanguageSectionEditor
                      title={title}
                      setTitle={setTitle}
                      subtitle={subtitle}
                      setSubtitle={setSubtitle}
                      description={description}
                      setDescription={setDescription}
                      content={content}
                      setContent={setContent}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      currentSection={currentSection}
                    />

                    {/* Existing Sections List */}
                    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white">
                          Existing Sections & Content
                        </h3>
                        {editingSection && (
                          <button
                            onClick={resetForm}
                            className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                          >
                            + Create New / Clear Form
                          </button>
                        )}
                      </div>

                      {loading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                        </div>
                      ) : sections.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-gray-500">
                          No sections created yet. Fill out the fields above and click Save.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sections.map((sec) => (
                            <div
                              key={sec.id}
                              className={`flex items-center justify-between rounded-2xl border p-5 transition ${
                                editingSection?.id === sec.id
                                  ? "border-indigo-500 bg-indigo-500/10"
                                  : "border-white/10 bg-[#0f172a]"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 uppercase">
                                    {sec.section_type || sec.section}
                                  </span>
                                  <h4 className="text-lg font-bold text-white">
                                    {sec.title || "Untitled Section"}
                                  </h4>
                                </div>

                                {sec.subtitle && (
                                  <p className="text-sm font-medium text-gray-300">
                                    {sec.subtitle}
                                  </p>
                                )}

                                {sec.description && (
                                  <p className="text-sm text-gray-400">
                                    {sec.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(sec)}
                                  className="flex items-center gap-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 cursor-pointer"
                                >
                                  <Edit2 size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(sec.id)}
                                  className="flex items-center gap-1 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}