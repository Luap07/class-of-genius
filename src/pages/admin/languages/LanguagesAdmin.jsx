import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Languages,
  Plus,
  RefreshCw,
  Loader2,
  Search,
  Globe,
  BookOpen,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

import LanguageStats from "../../../components/admin/languages/LanguageStats";
import LanguageFilters from "../../../components/admin/languages/LanguageFilters";
import LanguagesGrid from "../../../components/admin/languages/LanguagesGrid";
import LanguageForm from "../../../components/admin/languages/LanguageForm";
import LanguageMaterialUpload from "../../../components/admin/languages/LanguageMaterialUpload";
import DeleteLanguageModal from "../../../components/admin/languages/DeleteLanguageModal";
import EmptyLanguages from "../../../components/admin/languages/EmptyLanguages";

export default function LanguagesAdmin() {
  const navigate = useNavigate();

  const goToLanguagesFrontend = () => {
    navigate("/admin/languages/lessons");
  };

  /* ----------------------------- Data ------------------------------ */
  const [languages, setLanguages] = useState([]);
  const [filteredLanguages, setFilteredLanguages] = useState([]);

  /* ----------------------------- Loading ------------------------------ */
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ----------------------------- Search / Filter ------------------------------ */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  /* ----------------------------- Create Form ------------------------------ */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [languageName, setLanguageName] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [nativeName, setNativeName] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [flagFile, setFlagFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  /* ----------------------------- Edit ------------------------------ */
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  /* ----------------------------- Delete ------------------------------ */
  const [deletingLanguage, setDeletingLanguage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ----------------------------- Upload Learning Material ------------------------------ */
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  /* ----------------------------- Fetch Languages ------------------------------ */
  const fetchLanguages = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setLanguages(data || []);
    } catch (err) {
      console.error("Fetch Languages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ----------------------------- Refresh ------------------------------ */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchLanguages();
    } finally {
      setRefreshing(false);
    }
  };

  /* ----------------------------- Initial Load ------------------------------ */
  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  /* ----------------------------- Upload File ------------------------------ */
  const uploadFile = async (file, bucket) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /* ----------------------------- Reset Form ------------------------------ */
  const resetForm = () => {
    setLanguageName("");
    setLanguageCode("");
    setNativeName("");
    setRegion("");
    setDescription("");
    setFlagFile(null);
    setCoverImage(null);
    setEditingLanguage(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  /* ----------------------------- Create Language ------------------------------ */
  const handleCreateLanguage = async () => {
    try {
      setSaving(true);

      let flagUrl = "";
      let coverUrl = "";

      if (flagFile) {
        flagUrl = await uploadFile(flagFile, "language-flags");
      }

      if (coverImage) {
        coverUrl = await uploadFile(coverImage, "language-covers");
      }

      const { error } = await supabase
        .from("languages")
        .insert([
          {
            name: languageName,
            code: languageCode.toLowerCase(),
            native_name: nativeName,
            region,
            description,
            flag_url: flagUrl,
            cover_url: coverUrl,
            active: true,
          },
        ]);

      if (error) throw error;

      resetForm();
      fetchLanguages();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Open Edit ------------------------------ */
  const handleEdit = (language) => {
    setEditingLanguage(language);
    setLanguageName(language.name || "");
    setLanguageCode(language.code || "");
    setNativeName(language.native_name || "");
    setRegion(language.region || "");
    setDescription(language.description || "");
    setShowEditModal(true);
  };

  /* ----------------------------- Save Edit ------------------------------ */
  const handleSaveEdit = async () => {
    if (!editingLanguage) return;

    try {
      setUpdating(true);

      let flagUrl = editingLanguage.flag_url;
      let coverUrl = editingLanguage.cover_url;

      if (flagFile) {
        flagUrl = await uploadFile(flagFile, "language-flags");
      }

      if (coverImage) {
        coverUrl = await uploadFile(coverImage, "language-covers");
      }

      const { error } = await supabase
        .from("languages")
        .update({
          name: languageName,
          code: languageCode,
          native_name: nativeName,
          region,
          description,
          flag_url: flagUrl,
          cover_url: coverUrl,
        })
        .eq("id", editingLanguage.id);

      if (error) throw error;

      resetForm();
      fetchLanguages();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  /* ----------------------------- Delete ------------------------------ */
  const handleDelete = (language) => {
    setDeletingLanguage(language);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingLanguage) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("languages")
        .delete()
        .eq("id", deletingLanguage.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setDeletingLanguage(null);
      fetchLanguages();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  /* ----------------------------- Upload Learning Material ------------------------------ */
  const handleOpenUpload = (language) => {
    setSelectedLanguage(language);
    setShowUploadModal(true);
  };

  /* ----------------------------- Search + Filters ------------------------------ */
  const filteredData = useMemo(() => {
    let data = [...languages];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter((language) => {
        return (
          language.name?.toLowerCase().includes(keyword) ||
          language.native_name?.toLowerCase().includes(keyword) ||
          language.code?.toLowerCase().includes(keyword) ||
          language.region?.toLowerCase().includes(keyword)
        );
      });
    }

    if (statusFilter !== "all") {
      data = data.filter((language) => {
        if (statusFilter === "active") return language.active === true;
        if (statusFilter === "inactive") return language.active === false;
        return true;
      });
    }

    if (regionFilter !== "all") {
      data = data.filter((language) => language.region === regionFilter);
    }

    return data;
  }, [languages, search, statusFilter, regionFilter]);

  useEffect(() => {
    setFilteredLanguages(filteredData);
  }, [filteredData]);

  /* ----------------------------- Regions ------------------------------ */
  const regions = useMemo(() => {
    return [
      "all",
      ...new Set(
        languages
          .map((language) => language.region)
          .filter(Boolean)
      ),
    ];
  }, [languages]);

  /* ----------------------------- Statistics ------------------------------ */
  const totalLanguages = languages.length;
  const activeLanguages = languages.filter((language) => language.active).length;
  const inactiveLanguages = languages.filter((language) => !language.active).length;
  const totalRegions = new Set(
    languages.map((language) => language.region).filter(Boolean)
  ).size;

  /* ----------------------------- Modals Management ------------------------------ */
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

  const closeUploadModal = () => {
    setSelectedLanguage(null);
    setShowUploadModal(false);
  };

  const closeDeleteModal = () => {
    setDeletingLanguage(null);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="min-h-screen bg-[#030712] text-white p-6">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-black">Languages</h1>
            <p className="mt-3 text-lg text-gray-400">
              Manage all languages available in your LMS.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={goToLanguagesFrontend}
              className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-3 font-bold text-indigo-300 transition hover:bg-indigo-500/20"
            >
              <Globe className="h-5 w-5" />
              View Lessons
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-6 py-3 font-semibold transition hover:bg-[#1f2937]"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-3 rounded-2xl bg-indigo-600 px-6 py-3 font-bold transition hover:bg-indigo-500"
            >
              <Plus className="h-5 w-5" />
              Add Language
            </button>
          </div>
        </div>

        {/* Stats */}
        <LanguageStats
          totalLanguages={totalLanguages}
          activeLanguages={activeLanguages}
          inactiveLanguages={inactiveLanguages}
          totalRegions={totalRegions}
        />

        {/* Filters */}
        <LanguageFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          regions={regions}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setRegionFilter("all");
          }}
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          </div>
        ) : filteredLanguages.length === 0 ? (
          <EmptyLanguages
            searching={
              search !== "" ||
              statusFilter !== "all" ||
              regionFilter !== "all"
            }
            onCreate={openCreateModal}
          />
        ) : (
          <LanguagesGrid
            languages={filteredLanguages}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpload={handleOpenUpload}
          />
        )}

        {/* Create Modal */}
        <LanguageForm
          open={showCreateModal}
          languageName={languageName}
          setLanguageName={setLanguageName}
          nativeName={nativeName}
          setNativeName={setNativeName}
          languageCode={languageCode}
          setLanguageCode={setLanguageCode}
          region={region}
          setRegion={setRegion}
          description={description}
          setDescription={setDescription}
          flagFile={flagFile}
          setFlagFile={setFlagFile}
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          loading={saving}
          onClose={closeCreateModal}
          onSave={handleCreateLanguage}
        />

        {/* Edit Language Modal */}
        <LanguageForm
          open={showEditModal}
          editing
          language={editingLanguage}
          languageName={languageName}
          setLanguageName={setLanguageName}
          nativeName={nativeName}
          setNativeName={setNativeName}
          languageCode={languageCode}
          setLanguageCode={setLanguageCode}
          region={region}
          setRegion={setRegion}
          description={description}
          setDescription={setDescription}
          flagFile={flagFile}
          setFlagFile={setFlagFile}
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          loading={updating}
          onClose={closeEditModal}
          onSave={handleSaveEdit}
        />

        {/* Upload Learning Material */}
        <LanguageMaterialUpload
          open={showUploadModal}
          language={selectedLanguage}
          onClose={closeUploadModal}
          onUploaded={fetchLanguages}
        />

        {/* Delete Language */}
        <DeleteLanguageModal
          open={showDeleteModal}
          language={deletingLanguage}
          deleting={deleting}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}