import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import LessonStats from "../../../components/admin/languages/lessons/LessonStats";
import LessonFilters from "../../../components/admin/languages/lessons/LessonFilters";
import LessonsGrid from "../../../components/admin/languages/lessons/LessonsGrid";
import LessonForm from "../../../components/admin/languages/lessons/LessonForm";
import DeleteLessonModal from "../../../components/admin/languages/lessons/DeleteLessonModal";
import EmptyLessons from "../../../components/admin/languages/lessons/EmptyLessons";

export default function LessonsAdmin() {
  /* ---------------------------------
     Data States
  ---------------------------------- */
  const [lessons, setLessons] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);

  /* ---------------------------------
     Loading States
  ---------------------------------- */
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------------------------
     Search & Filter States
  ---------------------------------- */
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");

  /* ---------------------------------
     Create Form States
  ---------------------------------- */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [languageId, setLanguageId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonThumbnail, setLessonThumbnail] = useState(null);

  /* ---------------------------------
     Edit States
  ---------------------------------- */
  const [editingLesson, setEditingLesson] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  /* ---------------------------------
     Delete States
  ---------------------------------- */
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---------------------------------
     Fetch Languages
  ---------------------------------- */
  const fetchLanguages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("languages")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setLanguages(data || []);
    } catch (err) {
      console.error("Fetch Languages:", err);
    }
  }, []);

  /* ---------------------------------
     Fetch Lessons
  ---------------------------------- */
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("language_lessons")
        .select(`
          *,
          languages (
            id,
            name
          )
        `)
        .order("lesson_order", {
          ascending: true,
        });

      if (error) throw error;
      setLessons(data || []);
    } catch (err) {
      console.error("Fetch Lessons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------------
     Upload Thumbnail
  ---------------------------------- */
  const uploadThumbnail = async (file) => {
    if (!file) return null;

    const extension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const { error } = await supabase.storage
      .from("language-lessons")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("language-lessons")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  /* ---------------------------------
     Initial Load
  ---------------------------------- */
  useEffect(() => {
    fetchLanguages();
    fetchLessons();
  }, [fetchLanguages, fetchLessons]);

  /* ---------------------------------
     Refresh
  ---------------------------------- */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchLanguages(),
        fetchLessons(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  /* ---------------------------------
     Reset Form
  ---------------------------------- */
  const resetForm = () => {
    setLanguageId("");
    setLessonTitle("");
    setLessonDescription("");
    setLessonOrder("");
    setLessonDuration("");
    setLessonVideo("");
    setLessonThumbnail(null);
    setEditingLesson(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  /* ---------------------------------
     Create Lesson
  ---------------------------------- */
  const handleCreateLesson = async (lessonData) => {
    try {
      setSaving(true);
      let thumbnailUrl = "";

      if (lessonData.thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(lessonData.thumbnailFile);
      }

      const { error } = await supabase
        .from("language_lessons")
        .insert([
          {
            language_id: lessonData.language_id,
            title: lessonData.title,
            slug: lessonData.slug,
            description: lessonData.description,
            lesson_order: lessonData.lesson_order,
            level: lessonData.level,
            duration: lessonData.duration,
            video_url: lessonData.video_url,
            audio_url: lessonData.audio_url,
            thumbnail_url: thumbnailUrl,
            published: lessonData.published,
          },
        ]);

      if (error) throw error;

      resetForm();
      await fetchLessons();
    } catch (err) {
      console.error("Create Lesson:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------
     Open Edit
  ---------------------------------- */
  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setLanguageId(lesson.language_id || "");
    setLessonTitle(lesson.title || "");
    setLessonDescription(lesson.description || "");
    setLessonOrder(lesson.lesson_order || "");
    setLessonDuration(lesson.duration || "");
    setLessonVideo(lesson.video_url || "");
    setLessonThumbnail(null);
    setShowEditModal(true);
  };

  /* ---------------------------------
     Save Edit
  ---------------------------------- */
  const handleSaveEdit = async (lessonData) => {
    if (!editingLesson) return;

    try {
      setSaving(true);
      let thumbnailUrl = editingLesson.thumbnail_url;

      if (lessonData.thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(lessonData.thumbnailFile);
      }

      const { error } = await supabase
        .from("language_lessons")
        .update({
          language_id: lessonData.language_id,
          title: lessonData.title,
          slug: lessonData.slug,
          description: lessonData.description,
          lesson_order: lessonData.lesson_order,
          level: lessonData.level,
          duration: lessonData.duration,
          video_url: lessonData.video_url,
          audio_url: lessonData.audio_url,
          thumbnail_url: thumbnailUrl,
          published: lessonData.published,
        })
        .eq("id", editingLesson.id);

      if (error) throw error;

      resetForm();
      await fetchLessons();
    } catch (err) {
      console.error("Update Lesson:", err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------
     Delete Handlers
  ---------------------------------- */
  const handleDelete = (lesson) => {
    setDeletingLesson(lesson);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingLesson) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("language_lessons")
        .delete()
        .eq("id", deletingLesson.id);

      if (error) throw error;

      setDeletingLesson(null);
      setShowDeleteModal(false);
      await fetchLessons();
    } catch (err) {
      console.error("Delete Lesson:", err);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------------------------
     Filter Lessons Memo
  ---------------------------------- */
  const filteredData = useMemo(() => {
    let data = [...lessons];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter((lesson) => {
        return (
          lesson.title?.toLowerCase().includes(keyword) ||
          lesson.description?.toLowerCase().includes(keyword) ||
          lesson.languages?.name?.toLowerCase().includes(keyword)
        );
      });
    }

    if (languageFilter !== "all") {
      data = data.filter(
        (lesson) => String(lesson.language_id) === String(languageFilter)
      );
    }

    return data;
  }, [lessons, search, languageFilter]);

  useEffect(() => {
    setFilteredLessons(filteredData);
  }, [filteredData]);

  /* ---------------------------------
     Statistics Calculations
  ---------------------------------- */
  const totalLessons = lessons.length;
  const publishedLessons = lessons.filter((lesson) => lesson.published).length;
  const draftLessons = lessons.filter((lesson) => !lesson.published).length;
  const totalLanguages = languages.length;

  return (
    <div className="p-6 space-y-6 bg-[#020617] min-h-screen text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Language Lessons</h1>
          <p className="text-slate-400 mt-1">Manage interactive learning materials and content modules.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition"
          >
            <Plus size={20} />
            Add Lesson
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <LessonStats
        total={totalLessons}
        published={publishedLessons}
        drafts={draftLessons}
        languagesCount={totalLanguages}
      />

      {/* Filters Section */}
      <LessonFilters
        search={search}
        setSearch={setSearch}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        languages={languages}
      />

      {/* Content Grid / Loading State */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : filteredLessons.length === 0 ? (
        <EmptyLessons onAdd={() => setShowCreateModal(true)} />
      ) : (
        <LessonsGrid
          lessons={filteredLessons}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <LessonForm
          title="Create New Lesson"
          languages={languages}
          saving={saving}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateLesson}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingLesson && (
        <LessonForm
          title="Edit Lesson"
          initialData={editingLesson}
          languages={languages}
          saving={saving}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSaveEdit}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingLesson && (
        <DeleteLessonModal
          lesson={deletingLesson}
          deleting={deleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}