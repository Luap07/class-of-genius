import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  BookOpen,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import LessonStats from "../../../components/admin/languages/LessonStats";
import LessonFilters from "../../../components/admin/languages/LessonFilters";
import LessonsGrid from "../../../components/admin/languages/LessonsGrid";
import LessonForm from "../../../components/admin/languages/LessonForm";
import DeleteLessonModal from "../../../components/admin/languages/DeleteLessonModal";
import EmptyLessons from "../../../components/admin/languages/EmptyLessons";

export default function LanguageLessonsAdmin() {
  /* -----------------------------
     Data
  ----------------------------- */

  const [languages, setLanguages] = useState([]);

  const [lessons, setLessons] = useState([]);

  const [filteredLessons, setFilteredLessons] = useState([]);

  /* -----------------------------
     Loading
  ----------------------------- */

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /* -----------------------------
     Filters
  ----------------------------- */

  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const [search, setSearch] = useState("");

  /* -----------------------------
     Create / Edit
  ----------------------------- */

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [editingLesson, setEditingLesson] = useState(null);

  const [saving, setSaving] = useState(false);

  const [updating, setUpdating] = useState(false);

  /* -----------------------------
     Delete
  ----------------------------- */

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deletingLesson, setDeletingLesson] = useState(null);

  const [deleting, setDeleting] = useState(false);

  /* -----------------------------
     Form
  ----------------------------- */

  const [lessonTitle, setLessonTitle] = useState("");

  const [lessonDescription, setLessonDescription] = useState("");

  const [lessonOrder, setLessonOrder] = useState(1);

  const [lessonDuration, setLessonDuration] = useState("");

  const [lessonVideo, setLessonVideo] = useState("");

  const [lessonThumbnail, setLessonThumbnail] = useState(null);

  const [languageId, setLanguageId] = useState("");

  /* -----------------------------
     Fetch Languages
  ----------------------------- */

  const fetchLanguages = useCallback(async () => {
    const { data, error } = await supabase
      .from("languages")
      .select("id,name")
      .order("name");

    if (!error) {
      setLanguages(data || []);
    }
  }, []);

  /* -----------------------------
     Fetch Lessons
  ----------------------------- */

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -----------------------------
     Initial Load
  ----------------------------- */

  useEffect(() => {
    fetchLanguages();
    fetchLessons();
  }, [fetchLanguages, fetchLessons]);

  /* -----------------------------
     Refresh
  ----------------------------- */

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchLessons();

    setRefreshing(false);
  };
    /* -----------------------------
     Upload Thumbnail
  ------------------------------ */

  const uploadThumbnail = async (file) => {
    if (!file) return "";

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

  /* -----------------------------
     Reset Form
  ------------------------------ */

  const resetForm = () => {
    setLessonTitle("");
    setLessonDescription("");
    setLessonOrder(1);
    setLessonDuration("");
    setLessonVideo("");
    setLessonThumbnail(null);
    setLanguageId("");

    setEditingLesson(null);

    setShowCreateModal(false);
    setShowEditModal(false);
  };

  /* -----------------------------
     Create Lesson
  ------------------------------ */

  const handleCreateLesson = async () => {
    try {
      setSaving(true);

      let thumbnailUrl = "";

      if (lessonThumbnail) {
        thumbnailUrl = await uploadThumbnail(
          lessonThumbnail
        );
      }

      const { error } = await supabase
        .from("language_lessons")
        .insert([
          {
            language_id: languageId,
            title: lessonTitle,
            description: lessonDescription,
            lesson_order: lessonOrder,
            duration: lessonDuration,
            video_url: lessonVideo,
            thumbnail_url: thumbnailUrl,
            active: true,
          },
        ]);

      if (error) throw error;

      resetForm();

      fetchLessons();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* -----------------------------
     Open Edit
  ------------------------------ */

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);

    setLessonTitle(lesson.title || "");
    setLessonDescription(lesson.description || "");
    setLessonOrder(lesson.lesson_order || 1);
    setLessonDuration(lesson.duration || "");
    setLessonVideo(lesson.video_url || "");
    setLanguageId(lesson.language_id || "");

    setShowEditModal(true);
  };

  /* -----------------------------
     Save Edit
  ------------------------------ */

  const handleSaveEdit = async () => {
    if (!editingLesson) return;

    try {
      setUpdating(true);

      let thumbnailUrl =
        editingLesson.thumbnail_url;

      if (lessonThumbnail) {
        thumbnailUrl = await uploadThumbnail(
          lessonThumbnail
        );
      }

      const { error } = await supabase
        .from("language_lessons")
        .update({
          language_id: languageId,
          title: lessonTitle,
          description: lessonDescription,
          lesson_order: lessonOrder,
          duration: lessonDuration,
          video_url: lessonVideo,
          thumbnail_url: thumbnailUrl,
        })
        .eq("id", editingLesson.id);

      if (error) throw error;

      resetForm();

      fetchLessons();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  /* -----------------------------
     Delete
  ------------------------------ */

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

      fetchLessons();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  /* -----------------------------
     Search + Filters
  ------------------------------ */

  const filteredData = useMemo(() => {
    let data = [...lessons];

    if (selectedLanguage !== "all") {
      data = data.filter(
        (lesson) =>
          lesson.language_id === selectedLanguage
      );
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();

      data = data.filter(
        (lesson) =>
          lesson.title
            ?.toLowerCase()
            .includes(keyword) ||
          lesson.description
            ?.toLowerCase()
            .includes(keyword)
      );
    }

    return data;
  }, [
    lessons,
    selectedLanguage,
    search,
  ]);

  useEffect(() => {
    setFilteredLessons(filteredData);
  }, [filteredData]);

  /* -----------------------------
     Statistics
  ------------------------------ */

  const totalLessons = lessons.length;

  const activeLessons = lessons.filter(
    (lesson) => lesson.active
  ).length;

  const totalLanguages = languages.length;

  const totalHours = lessons.reduce((sum, lesson) => {
  return sum + (parseInt(lesson.duration) || 0);
}, 0);
  /* -----------------------------
     Quick Actions
  ------------------------------ */

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    resetForm();
  };

  const closeEditModal = () => {
    resetForm();
  };

  const closeDeleteModal = () => {
    setDeletingLesson(null);
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">

      {/* Header */}

      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-5xl font-black">
            Language Lessons
          </h1>

          <p className="mt-3 text-lg text-gray-400">
            Manage lessons for every language.
          </p>

        </div>

        <div className="flex gap-4">

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3"
          >
            <RefreshCw
              className={refreshing ? "animate-spin" : ""}
              size={18}
            />

            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold"
          >
            <Plus size={18} />

            Add Lesson
          </button>

        </div>

      </div>

      <LessonStats
        totalLessons={totalLessons}
        activeLessons={activeLessons}
        totalLanguages={totalLanguages}
        totalHours={totalHours}
      />

      <LessonFilters
        search={search}
        setSearch={setSearch}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        languages={languages}
      />

      {loading ? (

        <div className="flex justify-center py-24">

          <Loader2
            className="animate-spin"
            size={50}
          />

        </div>

      ) : filteredLessons.length === 0 ? (

        <EmptyLessons
          onCreate={openCreateModal}
        />

      ) : (

        <LessonsGrid
          lessons={filteredLessons}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      )}
            {/* -----------------------------
          Create Lesson
      ------------------------------ */}

      <LessonForm
        open={showCreateModal}
        editing={false}
        languages={languages}
        languageId={languageId}
        setLanguageId={setLanguageId}
        lessonTitle={lessonTitle}
        setLessonTitle={setLessonTitle}
        lessonDescription={lessonDescription}
        setLessonDescription={setLessonDescription}
        lessonOrder={lessonOrder}
        setLessonOrder={setLessonOrder}
        lessonDuration={lessonDuration}
        setLessonDuration={setLessonDuration}
        lessonVideo={lessonVideo}
        setLessonVideo={setLessonVideo}
        lessonThumbnail={lessonThumbnail}
        setLessonThumbnail={setLessonThumbnail}
        loading={saving}
        onSave={handleCreateLesson}
        onClose={closeCreateModal}
      />

      {/* -----------------------------
          Edit Lesson
      ------------------------------ */}

      <LessonForm
        open={showEditModal}
        editing={true}
        languages={languages}
        languageId={languageId}
        setLanguageId={setLanguageId}
        lessonTitle={lessonTitle}
        setLessonTitle={setLessonTitle}
        lessonDescription={lessonDescription}
        setLessonDescription={setLessonDescription}
        lessonOrder={lessonOrder}
        setLessonOrder={setLessonOrder}
        lessonDuration={lessonDuration}
        setLessonDuration={setLessonDuration}
        lessonVideo={lessonVideo}
        setLessonVideo={setLessonVideo}
        lessonThumbnail={lessonThumbnail}
        setLessonThumbnail={setLessonThumbnail}
        loading={updating}
        onSave={handleSaveEdit}
        onClose={closeEditModal}
      />

      {/* -----------------------------
          Delete Lesson
      ------------------------------ */}

      <DeleteLessonModal
        open={showDeleteModal}
        lesson={deletingLesson}
        deleting={deleting}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

    </div>
  );
}