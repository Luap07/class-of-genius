// src/admin/pages/languages/LanguageCMSAdmin.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Globe,
  Languages,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Brain,
  RefreshCw,
  Loader2,
  Save,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import LanguageSelector from "../../../components/admin/cms/LanguageSelector";
import LanguageSectionForm from "../../../components/admin/cms/LanguageSectionForm";
import SectionsList from "../../../components/admin/cms/SectionsList";
import SectionStats from "../../../components/admin/cms/SectionStats";
import DeleteSectionModal from "../../../components/admin/cms/DeleteSectionModal";
import LoadingSections from "../../../components/admin/cms/LoadingSections";
import EmptySections from "../../../components/admin/cms/EmptySections";

/* Existing Admins */
import LessonsAdmin from "./LessonsAdmin";

/* Components */
import VocabularyAdmin from "./VocabularyAdmin";
import AIToolsAdmin from "./AIToolsAdmin";

export default function LanguageCMSAdmin() {
  /* ============================================
     LANGUAGES
  ============================================ */

  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] =
    useState("");

  /* ============================================
     ACTIVE TAB
  ============================================ */

  const [activeTab, setActiveTab] =
    useState("overview");

  /* ============================================
     CMS SECTIONS
  ============================================ */

  const [sections, setSections] =
    useState([]);

  const [editingSection, setEditingSection] =
    useState(null);

  /* ============================================
     FORM
  ============================================ */

  const [title, setTitle] =
    useState("");

  const [subtitle, setSubtitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [content, setContent] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState(0);

  const [thumbnailFile, setThumbnailFile] =
    useState(null);

  const [thumbnailPreview, setThumbnailPreview] =
    useState("");

  /* ============================================
     LOADING
  ============================================ */

  const [loadingLanguages, setLoadingLanguages] =
    useState(true);

  const [loadingSections, setLoadingSections] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  /* ============================================
     DELETE
  ============================================ */

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletingSection, setDeletingSection] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  /* ============================================
     TABS
  ============================================ */

  const tabs = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        icon: Globe,
      },
      {
        id: "alphabet",
        label: "Alphabet",
        icon: Languages,
      },
      {
        id: "grammar",
        label: "Grammar",
        icon: BookOpen,
      },
      {
        id: "vocabulary",
        label: "Vocabulary",
        icon: BookOpen,
      },
      {
        id: "listening",
        label: "Listening",
        icon: Headphones,
      },
      {
        id: "speaking",
        label: "Speaking",
        icon: Mic,
      },
      {
        id: "writing",
        label: "Writing",
        icon: PenTool,
      },
      {
        id: "culture",
        label: "Culture",
        icon: Globe,
      },
      {
        id: "lessons",
        label: "Lessons",
        icon: BookOpen,
      },
      {
        id: "aitutor",
        label: "AI Tutor",
        icon: Brain,
      },
    ],
    []
  );

  /* ============================================
     FETCH LANGUAGES
  ============================================ */

  const fetchLanguages = useCallback(async () => {
    try {
      setLoadingLanguages(true);

      const { data, error } =
        await supabase
          .from("languages")
          .select("*")
          .order("name");

      if (error) throw error;

      setLanguages(data || []);

      if (data?.length && !selectedLanguage) {
        setSelectedLanguage(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLanguages(false);
    }
  }, [selectedLanguage]);

  /* ============================================
     FETCH CMS SECTIONS
  ============================================ */

  const fetchSections = useCallback(async () => {
    if (!selectedLanguage) return;

    try {
      setLoadingSections(true);

      const { data, error } =
        await supabase
          .from("language_sections")
          .select("*")
          .eq(
            "language_id",
            selectedLanguage
          )
          .order("sort_order", {
            ascending: true,
          });

      if (error) throw error;

      setSections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSections(false);
    }
  }, [selectedLanguage]);

  /* ============================================
     UPLOAD THUMBNAIL
  ============================================ */

  const uploadThumbnail = async (file) => {
    if (!file) return "";

    const extension =
      file.name.split(".").pop();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const { error } =
      await supabase.storage
        .from("language-sections")
        .upload(fileName, file);

    if (error) throw error;

    const { data } =
      supabase.storage
        .from("language-sections")
        .getPublicUrl(fileName);

    return data.publicUrl;
  };

  /* ============================================
     INITIAL LOAD
  ============================================ */

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    fetchSections();
  }, [
    selectedLanguage,
    fetchSections,
  ]);

  /* ============================================
     REFRESH
  ============================================ */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        fetchLanguages(),
        fetchSections(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  /* ============================================
     RESET FORM
  ============================================ */

  const resetForm = () => {
    setEditingSection(null);

    setTitle("");
    setSubtitle("");
    setDescription("");
    setContent("");

    setSortOrder(0);

    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  /* ============================================
     LOAD SECTION INTO FORM
  ============================================ */

  useEffect(() => {
    if (
      activeTab === "vocabulary" ||
      activeTab === "lessons" ||
      activeTab === "listening" ||
      activeTab === "speaking" ||
      activeTab === "writing" ||
      activeTab === "aitutor"
    ) {
      return;
    }

    const existing = sections.find(
      (item) =>
        (item.section_type || item.section) ===
        activeTab
    );

    if (!existing) {
      resetForm();
      return;
    }

    setEditingSection(existing);

    setTitle(existing.title || "");
    setSubtitle(existing.subtitle || "");
    setDescription(existing.description || "");
    setContent(existing.content || "");

    setSortOrder(existing.sort_order || 0);

    setThumbnailPreview(
      existing.thumbnail_url || ""
    );

    setThumbnailFile(null);
  }, [activeTab, sections]);

  /* ============================================
     SAVE SECTION
  ============================================ */

  const handleSaveSection = async () => {
    if (!selectedLanguage) return;

    if (
      activeTab === "vocabulary" ||
      activeTab === "lessons" ||
      activeTab === "listening" ||
      activeTab === "speaking" ||
      activeTab === "writing" ||
      activeTab === "aitutor"
    ) {
      return;
    }

    if (!title.trim()) {
      alert("Section title is required.");
      return;
    }

    try {
      setSaving(true);

      let thumbnailUrl =
        editingSection?.thumbnail_url || "";

      if (thumbnailFile) {
        thumbnailUrl =
          await uploadThumbnail(
            thumbnailFile
          );
      }

      const payload = {
        language_id: selectedLanguage,
        section_type: activeTab,
        section: activeTab,
        title,
        subtitle,
        description,
        content,
        thumbnail_url: thumbnailUrl,
        sort_order: Number(sortOrder),
        updated_at:
          new Date().toISOString(),
      };

      let error;

      if (editingSection) {
        ({ error } = await supabase
          .from("language_sections")
          .update(payload)
          .eq(
            "id",
            editingSection.id
          ));
      } else {
        ({ error } = await supabase
          .from("language_sections")
          .insert([payload]));
      }

      if (error) throw error;

      await fetchSections();

      alert("Section saved.");

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Unable to save section."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================
     EDIT SECTION
  ============================================ */

  const handleEditSection = (
    section
  ) => {
    setEditingSection(section);

    setActiveTab(
      section.section_type ||
        section.section
    );

    setTitle(section.title || "");

    setSubtitle(
      section.subtitle || ""
    );

    setDescription(
      section.description || ""
    );

    setContent(section.content || "");

    setSortOrder(
      section.sort_order || 0
    );

    setThumbnailPreview(
      section.thumbnail_url || ""
    );

    setThumbnailFile(null);
  };

  /* ============================================
     DELETE
  ============================================ */

  const handleDeleteSection = (
    section
  ) => {
    setDeletingSection(section);

    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingSection) return;

    try {
      setDeleting(true);

      const { error } =
        await supabase
          .from("language_sections")
          .delete()
          .eq(
            "id",
            deletingSection.id
          );

      if (error) throw error;

      setShowDeleteModal(false);

      setDeletingSection(null);

      resetForm();

      await fetchSections();

    } catch (err) {
      console.error(err);

      alert(
        "Unable to delete section."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================
     STATS
  ============================================ */

  const totalSections = sections.length;

  const overviewCount = sections.filter(
    (s) => (s.section_type || s.section) === "overview"
  ).length;

  const grammarCount = sections.filter(
    (s) => (s.section_type || s.section) === "grammar"
  ).length;

  const alphabetCount = sections.filter(
    (s) => (s.section_type || s.section) === "alphabet"
  ).length;

  const cultureCount = sections.filter(
    (s) => (s.section_type || s.section) === "culture"
  ).length;

  /* ============================================
     UI
  ============================================ */

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

        <div>

          <h1 className="text-4xl font-black">

            Language CMS

          </h1>

          <p className="mt-2 text-slate-400">

            Manage every language section from one place.

          </p>

        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 font-semibold hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

          {activeTab !== "vocabulary" &&
            activeTab !== "lessons" &&
            activeTab !== "listening" &&
            activeTab !== "speaking" &&
            activeTab !== "writing" &&
            activeTab !== "aitutor" && (

            <button
              onClick={handleSaveSection}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              Save Section

            </button>

          )}

        </div>

      </div>

      {/* Language Selector */}

      <LanguageSelector
        languages={languages}
        value={selectedLanguage}
        onChange={setSelectedLanguage}
      />

      {/* Stats */}

      <div className="mt-8">

        <SectionStats
          totalSections={totalSections}
          overview={overviewCount}
          grammar={grammarCount}
          alphabet={alphabetCount}
          culture={cultureCount}
        />

      </div>

      {/* Tabs */}

      <div className="mt-8 overflow-x-auto">

        <div className="flex gap-3 min-w-max">

          {tabs.map((tab) => {

            const Icon = tab.icon;

            return (

              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-bold transition

                ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >

                <Icon size={18} />

                {tab.label}

              </button>

            );

          })}

        </div>

      </div>

      {/* ============================================
          DYNAMIC CONTENT
      ============================================ */}

      <div className="mt-10">

        {/* ======================================
            LESSONS
        ======================================= */}

        {activeTab === "lessons" && (
          <LessonsAdmin />
        )}

        {/* ====================================== VOCABULARY       ======================================= */}

        {activeTab === "vocabulary" && (
          <VocabularyAdmin
            languageId={selectedLanguage}
          />
        )}

        {/* ====================================== AI TABS  ======================================= */}
        {(activeTab === "listening" ||
          activeTab === "speaking" ||
          activeTab === "writing" ||
          activeTab === "aitutor") && (
          <AIToolsAdmin
            languageId={selectedLanguage}
            mode={activeTab}
          />
        )}

        {/* ======================================CMS SECTIONS======================================= */}
        {(activeTab === "overview" ||
          activeTab === "alphabet" ||
          activeTab === "grammar" ||
          activeTab === "culture") && (

          <div className="space-y-8">

            <LanguageSectionForm
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

              thumbnailFile={thumbnailFile}
              setThumbnailFile={setThumbnailFile}

              thumbnailPreview={thumbnailPreview}
              setThumbnailPreview={
                setThumbnailPreview
              }

              currentSection={activeTab}
            />

            {loadingSections ? (

              <LoadingSections />

            ) : sections.length === 0 ? (

              <EmptySections />

            ) : (

              <SectionsList
                sections={sections.filter(
                  (section) =>
                    (section.section_type ||
                      section.section) ===
                    activeTab
                )}

                onEdit={
                  handleEditSection
                }

                onDelete={
                  handleDeleteSection
                }
              />

            )}

          </div>

        )}

      </div>

      {/* ============================================ DELETE MODAL ============================================ */}
      <DeleteSectionModal
        open={showDeleteModal}
        section={deletingSection}
        deleting={deleting}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingSection(null);
        }}
        onConfirm={confirmDelete}
      />

    </div>
  );
}