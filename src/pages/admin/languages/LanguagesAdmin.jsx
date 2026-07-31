// src/pages/admin/languages/LanguagesAdmin.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import LanguageStats from "../../../components/admin/languages/LanguageStats";
import LanguageFilters from "../../../components/admin/languages/LanguageFilters";
import LanguagesGrid from "../../../components/admin/languages/LanguagesGrid";
import LanguageForm from "../../../components/admin/languages/LanguageForm";
import DeleteLanguageModal from "../../../components/admin/languages/DeleteLanguageModal";
import LoadingLanguages from "../../../components/admin/languages/LoadingLanguages";
import EmptyLanguages from "../../../components/admin/languages/EmptyLanguages";
import LanguageMaterialUpload from "../../../components/admin/LanguageMaterialUpload";

export default function LanguagesAdmin() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [continent, setContinent] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMaterialUpload, setShowMaterialUpload] = useState(false);

  const [editingLanguage, setEditingLanguage] = useState(null);
  const [deletingLanguage, setDeletingLanguage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const fetchLanguages = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("name");

      if (error) throw error;

      console.log("LANGUAGES:", data);

      setLanguages(data || []);
    } catch (error) {
      console.error("FETCH LANGUAGES ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLanguages();
    setRefreshing(false);
  };

  const filteredLanguages = useMemo(() => {
    return languages.filter((item) => {
      const text = search.toLowerCase();

      const searchMatch =
        item.name?.toLowerCase().includes(text) ||
        item.native_name?.toLowerCase().includes(text);

      const levelMatch =
        level === "All" || item.level === level;

      const continentMatch =
        continent === "All" || item.continent === continent;

      const featuredMatch = featuredOnly ? item.featured : true;

      return (
        searchMatch &&
        levelMatch &&
        continentMatch &&
        featuredMatch
      );
    });
  }, [languages, search, level, continent, featuredOnly]);

  const stats = useMemo(
    () => ({
      total: languages.length,
      featured: languages.filter((item) => item.featured).length,
      beginner: languages.filter((item) => item.level === "Beginner").length,
      continents: new Set(languages.map((item) => item.continent)).size,
    }),
    [languages]
  );

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-4xl font-black text-white">Languages</h1>
          <p className="mt-2 text-slate-400">
            Manage languages and learning materials.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white transition hover:border-cyan-500"
          >
            {refreshing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            Refresh
          </button>

          <button
            onClick={() => {
              setEditingLanguage(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:opacity-90"
          >
            <Plus />
            Add Language
          </button>
        </div>
      </motion.div>

      <LanguageStats stats={stats} />

      <LanguageFilters
        search={search}
        setSearch={setSearch}
        level={level}
        setLevel={setLevel}
        continent={continent}
        setContinent={setContinent}
        featuredOnly={featuredOnly}
        setFeaturedOnly={setFeaturedOnly}
      />

      {loading ? (
        <LoadingLanguages />
      ) : filteredLanguages.length === 0 ? (
        <EmptyLanguages />
      ) : (
        <LanguagesGrid
          languages={filteredLanguages}
          onEdit={(language) => {
            setEditingLanguage(language);
            setShowForm(true);
          }}
          onDelete={(language) => {
            setDeletingLanguage(language);
            setShowDelete(true);
          }}
          onManageContent={(language) => {
            setSelectedLanguage(language);
            setShowMaterialUpload(true);
          }}
        />
      )}

      <LanguageForm
        open={showForm}
        language={editingLanguage}
        saving={saving}
        refreshLanguages={fetchLanguages}
        onClose={() => {
          setShowForm(false);
          setEditingLanguage(null);
        }}
      />

      <DeleteLanguageModal
        open={showDelete}
        language={deletingLanguage}
        refreshLanguages={fetchLanguages}
        onClose={() => {
          setShowDelete(false);
          setDeletingLanguage(null);
        }}
      />

      <LanguageMaterialUpload
        language={selectedLanguage}
        open={showMaterialUpload}
        onClose={() => {
          setShowMaterialUpload(false);
          setSelectedLanguage(null);
        }}
        onSuccess={() => {
          fetchLanguages();
        }}
      />
    </section>
  );
}